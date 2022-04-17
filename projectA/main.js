//3456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
// (JT: why the numbers? counts columns, helps me keep 80-char-wide listings)
//
// built from RotatingTranslatedTriangle.js (c) 2012 matsuda
// and
// jtRotatingTranslatedTriangle.js  MODIFIED for CS 351-1, 
//									Northwestern Univ. Jack Tumblin
// Early Changes:
// -- converted to 2D->4D; 3 verts --> 6 verts, 2 triangles arranged as long 
//    rectangle with small gap fills one single Vertex Buffer Object (VBO);
// -- draw same rectangle over and over, but with different matrix tranforms
//    to construct a jointed 'robot arm'
// -- Make separately-numbered copies that build up arm step-by-step.
// LATER CHANGES: (2021)
//    Add global vars -- all will start with 'g', including: gl, g_canvasID,
//		g_vertCount, g_modelMatrix, uLoc_modelMatrix, etc.
// -- improve animation; better names, global vars, more time-varying values.
// -- simplify 'draw()': remove all args by using global vars;rename 'drawAll()'.
// -- create part-drawing functions that use current g_modelMatrix contents:
//		e.g. drawArm(), drawPincers(), to make 'instancing' easy. 
//

// Vertex shader program----------------------------------
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_modelMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_modelMatrix * a_Position;\n' +
  '}\n';
// Each instance of this program in GPU computes all the on-screen attributes 
// for just one VERTEX, specifying that vertex so that it can be used as part 
// of a drawing primitive depicted in the CVV coord. system (+/-1, +/-1, +/-1) 
// that fills our HTML5 'canvas' object.  The program gets vertex info through
// its attributes-- 'attribute vec4' variable a_Position, which feeds us values
// for one vertex taken from from the Vertex Buffer Object (VBO) we created 
// inside the GPU by calling our own'initVertexBuffers()' function below.
//
//    ?What other vertex attributes can you set within a Vertex Shader? Color?
//    surface normal? reflectance? texture coordinates? texture ID#?
//    ?How could you set each of these attributes separately for each vertex in
//    our VBO?  Could you store them in the VBO? Use them in the Vertex Shader?

// Fragment shader program----------------------------------
var FSHADER_SOURCE =
  'void main() {\n' +
  '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
  '}\n';
//  Each instance computes all the on-screen attributes for just one PIXEL.
// Here we do the bare minimum: if we draw any part of any drawing primitive in 
// any pixel, we simply set that pixel to the constant color specified here.


// Global Variables  
//   (These are almost always a BAD IDEA, 
//		but here they eliminate lots of tedious function arguments. 
//    Later, collect them into just a few well-organized global objects!)
// ============================================================================
// for WebGL usage:--------------------
var gl;													// WebGL rendering context -- the 'webGL' object
																// in JavaScript with all its member fcns & data
var g_canvasID;									// HTML-5 'canvas' element ID#. (was 'canvas')
var g_body_vertCount;								// # of vertices held by our VBO.(was 'n')
var g_paddle_vertCount;
var g_modelMatrix;							// 4x4 matrix in JS; sets 'uniform' in GPU
var uLoc_modelMatrix;						// GPU location where this uniform is stored.

// For animation:---------------------
var g_lastMS = Date.now();			// Timestamp (in milliseconds) for our 
                                // most-recently-drawn WebGL screen contents.
                                // Set & used by timerAll() fcn to update all
                                // time-varying params for our webGL drawings.
  // All of our time-dependent params (you can add more!)
                                //---------------
var g_angle0now  =   0.0;       // init Current rotation angle, in degrees
var g_angle0rate = -22.0;       // init Rotation angle rate, in degrees/second.
var g_angle0brake=	 1.0;				// init Speed control; 0=stop, 1=full speed.
var g_angle0min  =-140.0;       // init min, max allowed angle, in degrees.
var g_angle0max  =  40.0;
                                //---------------
var g_angle1now  =   0.0; 			// init Current rotation angle, in degrees > 0
var g_angle1rate =  64.0;				// init Rotation angle rate, in degrees/second.
var g_angle1brake=	 1.0;				// init Rotation start/stop. 0=stop, 1=full speed.
var g_angle1min  = -80.0;       // init min, max allowed angle, in degrees
var g_angle1max  =  80.0;
                                //---------------
var g_angle2now  =   0.0; 			// init Current rotation angle, in degrees.
var g_angle2rate =  89.0;				// init Rotation angle rate, in degrees/second.
var g_angle2brake=	 1.0;				// init Speed control; 0=stop, 1=full speed.
var g_angle2min  = -40.0;       // init min, max allowed angle, in degrees
var g_angle2max  = -20.0;

var g_angle3now  =   0.0; 			// init Current rotation angle, in degrees.
var g_angle3rate =  31.0;				// init Rotation angle rate, in degrees/second.
var g_angle3brake=	 1.0;				// init Speed control; 0=stop, 1=full speed.
var g_angle3min  = -40.0;       // init min, max allowed angle, in degrees
var g_angle3max  =  40.0;
// YOU can add more time-varying params of your own here -- try it!
// For example, could you add angle3, have it run without limits, and
// use sin(angle3) to slowly translate the robot-arm base horizontally,
// moving back-and-forth smoothly and sinusoidally?


function main() {
//==============================================================================
  // Retrieve the HTML-5 <canvas> element where webGL will draw our pictures:
  g_canvasID = document.getElementById('webgl');

  // Create the the WebGL rendering context 'gl'. This huge JavaScript object 
  // contains the WebGL state machine adjusted by large sets of WebGL functions,
  // built-in variables & parameters, and member data. Every WebGL function 
  // call follows this format:  gl.WebGLfunctionName(args);
  //
  //SIMPLE VERSION:  gl = getWebGLContext(g_canvasID); 
  // Here's a BETTER version:
  gl = g_canvasID.getContext("webgl", { preserveDrawingBuffer: true});
	// This fancier-looking version disables HTML-5's default screen-clearing,
	// so that our draw() functions will over-write previous on-screen results
	// until we call the gl.clear(COLOR_BUFFER_BIT); function. Try it! can you
	// make an on-screen button to enable/disable screen clearing? )

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL. Bye!');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Write the positions of vertices into an array, transfer array contents into 
  // a Vertex Buffer Object created in the graphics hardware.
  var myErr = initVertexBuffers(); // sets global var 'g_vertCount'
  if (myErr < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }
	// Specify the color for clearing <canvas>
	gl.clearColor(0, 0, 0, 1); // R,G,B, A==opacity)

	gl.enable(gl.DEPTH_TEST); // enabled by default, but let's be SURE.
	gl.clearDepth(0.0); // each time we 'clear' our depth buffer, set all
	// pixel depths to 0.0 (1.0 is DEFAULT)
	gl.depthFunc(gl.GREATER); // (gl.LESS is DEFAULT; reverse it!)
	// draw a pixel only if its depth value is GREATER
	// than the depth buffer's stored value.

  // Create our (global) model matrix here in JavaScript.  We will set its 
  // values using transformation-matrix calls, and then send its contents to 
  // the GPU to set the value of the uniform named 'u_modelMatrix' in shaders.
  g_modelMatrix = new Matrix4();
//	g_modelMatrix.printMe('Initial g_modelMatrix');
  // Get the GPU storage location for u_modelMatrix uniform 
  // (now a global var declared above main().  was 'u_modelMatrix )
  uLoc_modelMatrix = gl.getUniformLocation(gl.program, 'u_modelMatrix');
  if (!uLoc_modelMatrix) {
    console.log('Failed to get the storage location of u_modelMatrix');
    return;
 }

// TEST g_modelMatrix with cuon-matrix-quat03 library's crude push-down stack:	
// testMatrixStack();


// ==============ANIMATION=============
  // Quick tutorials on synchronous, real-time animation in JavaScript/HTML-5: 
  //    https://webglfundamentals.org/webgl/lessons/webgl-animation.html
  //  or
  //  	http://creativejs.com/resources/requestanimationframe/
  //		--------------------------------------------------------
  // Why use 'requestAnimationFrame()' instead of the simpler-to-use
  //	fixed-time setInterval() or setTimeout() functions?  Because:
  //		1) it draws the next animation frame 'at the next opportunity' instead 
  //			of a fixed time interval. It allows your browser and operating system
  //			to manage its own processes, power, & computing loads, and to respond 
  //			to on-screen window placement (to skip battery-draining animation in 
  //			any window that was hidden behind others, or was scrolled off-screen)
  //		2) it helps your program avoid 'stuttering' or 'jittery' animation
  //			due to delayed or 'missed' frames.  Your program can read and respond 
  //			to the ACTUAL time interval between displayed frames instead of fixed
  //		 	fixed-time 'setInterval()' calls that may take longer than expected.

  //------------------------------------  Define & run our animation:
  var tick = function() {		    // locally (within main() only), define our
                                // self-calling animation function.
    requestAnimationFrame(tick, g_canvasID); // browser callback request; wait
                                // til browser is ready to re-draw canvas, then
    timerAll();  				// Update all our time-varying params, and
    drawAll();          // Draw all parts using transformed VBObox contents
    };
  //------------------------------------
  tick();                       // do it again!  (endless loop)

}

function timerAll() {
//=============================================================================
// Find new values for all time-varying parameters used for on-screen drawing.
// HINT: this is ugly, repetive code!  Could you write a better version?
// 			 would it make sense to create a 'timer' or 'animator' class? Hmmmm...
//
  // use local variables to find the elapsed time:
  var nowMS = Date.now();             // current time (in milliseconds)
  var elapsedMS = nowMS - g_lastMS;   // 
  g_lastMS = nowMS;                   // update for next webGL drawing.
  if(elapsedMS > 1000.0) {
    // Browsers won't re-draw 'canvas' element that isn't visible on-screen 
    // (user chose a different browser tab, etc.); when users make the browser
    // window visible again our resulting 'elapsedMS' value has gotten HUGE.
    // Instead of allowing a HUGE change in all our time-dependent parameters,
    // let's pretend that only a nominal 1/30th second passed:
    elapsedMS = 1000.0/30.0;
    }
  // Find new time-dependent parameters using the current or elapsed time:
  g_angle0now += g_angle0rate * g_angle0brake * (elapsedMS * 0.001);	// update.
  g_angle1now += g_angle1rate * g_angle1brake * (elapsedMS * 0.001);
  g_angle2now += g_angle2rate * g_angle2brake * (elapsedMS * 0.001);
  // apply angle limits:  going above max, or below min? reverse direction!
  // (!CAUTION! if max < min, then these limits do nothing...)
  if((g_angle0now >= g_angle0max && g_angle0rate > 0) || // going over max, or
  	 (g_angle0now <= g_angle0min && g_angle0rate < 0)  ) // going under min ?
  	 g_angle0rate *= -1;	// YES: reverse direction.
  if((g_angle1now >= g_angle1max && g_angle1rate > 0) || // going over max, or
  	 (g_angle1now <= g_angle1min && g_angle1rate < 0) )	 // going under min ?
  	 g_angle1rate *= -1;	// YES: reverse direction.
  if((g_angle2now >= g_angle2max && g_angle2rate > 0) || // going over max, or
  	 (g_angle2now <= g_angle2min && g_angle2rate < 0) )	 // going under min ?
  	 g_angle2rate *= -1;	// YES: reverse direction.
  if((g_angle3now >= g_angle3max && g_angle3rate > 0) || // going over max, or
  	 (g_angle3now <= g_angle3min && g_angle3rate < 0) )	 // going under min ?
  	 g_angle3rate *= -1;	// YES: reverse direction.
	// *NO* limits? Don't let angles go to infinity! cycle within -180 to +180.
	if(g_angle0min > g_angle0max)
	{// if min and max don't limit the angle, then
		if(     g_angle0now < -180.0) g_angle0now += 360.0;	// go to >= -180.0 or
		else if(g_angle0now >  180.0) g_angle0now -= 360.0;	// go to <= +180.0
	}
	if(g_angle1min > g_angle1max)
	{
		if(     g_angle1now < -180.0) g_angle1now += 360.0;	// go to >= -180.0 or
		else if(g_angle1now >  180.0) g_angle1now -= 360.0;	// go to <= +180.0
	}
	if(g_angle2min > g_angle2max)
	{
		if(     g_angle2now < -180.0) g_angle2now += 360.0;	// go to >= -180.0 or
		else if(g_angle2now >  180.0) g_angle2now -= 360.0;	// go to <= +180.0
	}
	if(g_angle3min > g_angle3max)
	{
		if(     g_angle3now < -180.0) g_angle3now += 360.0;	// go to >= -180.0 or
		else if(g_angle3now >  180.0) g_angle3now -= 360.0;	// go to <= +180.0
	}
}

function initVertexBuffers() {
	var dot1 = [-0.25,-0.25,-0.5,1.0]
	var dot2 = [-0.25,0.25,-0.5,1.0]
	var dot3 = [0.25,0.25,-0.5,1.0]
	var dot4 = [0.25,-0.25,-0.5,1.0]
	var dot5 = [-0.25,-0.25,0.5,1.0]
	var dot6 = [-0.25,0.25,0.5,1.0]
	var dot7 = [0.25,0.25,0.5,1.0]
	var dot8 = [0.25,-0.25,0.5,1.0]

	var dot21 = [-0.25,-0.25,-0.5,1.0]
	var dot22 = [-0.25,0.25,-0.5,1.0]
	var dot23 = [0.25,0.25,-0.5,1.0]
	var dot24 = [0.25,-0.25,-0.5,1.0]
	var dot25 = [-0.25,-0.25,0.5,1.0]
	var dot26 = [-0.25,0.25,0.5,1.0]
	var dot27 = [0.25,0.25,0.5,1.0]
	var dot28 = [0.25,-0.25,0.5,1.0]

	// var vert = [
	// 	dot1, dot2, dot4, dot3, dot8, dot7, dot5,
	// 	dot6, dot1, dot2, dot6, dot3, dot7, dot4, dot8,
	// 	dot1, dot5
	// ].flat()

	var body_vert = [
		dot1, dot2, dot2, dot3, dot3, dot4, dot4, dot1,
		dot5, dot6, dot6, dot7, dot7, dot8, dot8, dot5,
		dot1, dot5, dot2, dot6, dot3, dot7, dot4, dot8
	].flat()

	var paddle_vert = [
		dot21, dot22, dot22, dot23, dot23, dot24, dot24, dot21,
		dot25, dot26, dot26, dot27, dot27, dot28, dot28, dot25,
		dot21, dot25, dot22, dot26, dot23, dot27, dot24, dot28
	].flat()

  var vertices = new Float32Array ([body_vert, paddle_vert].flat());
  g_body_vertCount = body_vert.length/4;
	g_paddle_vertCount = paddle_vert.length/4;

  // Create a buffer object in GPU; get its ID:
  var vertexBufferID = gl.createBuffer();
  if (!vertexBufferID) {
    console.log('Failed to create the buffer object');
    return -1;	// error code
  }

  // In GPU, bind the buffer object to target for reading vertices;
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferID);
  // Write JS vertex array contents into the buffer object on the GPU:
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // On GPU, get location of vertex shader's 'a_position' attribute var
  var aLoc_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(aLoc_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -2;  // error code
  }
  // Now connect the 'a_position' data in our VBO to the 'a_position' attribute
  // in the shaders in the GPU:
  gl.vertexAttribPointer(aLoc_Position, 4, gl.FLOAT, false, 0, 0);
	// websearch yields OpenGL version:
	//		http://www.opengl.org/sdk/docs/man/xhtml/glVertexAttribPointer.xml
				//	glVertexAttributePointer (
				//			index == which attribute variable will we use?
				//			size == how many dimensions for this attribute: 1,2,3 or 4?
				//			type == what data type did we use for those numbers?
				//			isNormalized == are these fixed-point values that we need
				//						normalize before use? true or false
				//			stride == #bytes (of other, interleaved data) between OUR values?
				//			pointer == offset; how many (interleaved) values to skip to reach
				//					our first value?
				//				)
  // Enable the assignment of that VBO data to the shaders' a_Position variable
  gl.enableVertexAttribArray(aLoc_Position);
  return 0;	// normal exit; no error.
}

function drawAll() {
//==============================================================================
  // Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

//========================================
// START with an empty model matrix; drawing axes == CVV
	g_modelMatrix.setIdentity();
	// DEBUGGING: if your push/pop operations are all balanced and correct,
	// you can comment out this 'setIdentity()' call with no on-screen change...

	// Move drawing axes to the 'base' or 'shoulder' of the robot arm:
	// g_modelMatrix.translate(-0.6,-0.6, 0.0);  // 'set' means DISCARD old matrix,
		  						// (drawing axes centered in CVV), and then make new
		  						// drawing axes moved to the lower-left corner of CVV.
	drawRobot();

}


function drawRobot() {
	pushMatrix(g_modelMatrix);
	g_modelMatrix.rotate(g_angle0now, 1, 0, 0);  // Make new drawing axes that
	drawBody();
	g_modelMatrix = popMatrix()
}

function drawArm() {
//==============================================================================
// Draw rotating flexing arm of robot pivoting at origin of current drawing axes, 
// (be sure to return to current drawing axes on exit)
}

function drawPincers() {
//==============================================================================
// Draw grasping hand-pincers robot pivoting at origin of current drawing axes, 
// (be sure to return to current drawing axes on exit)
}

function drawBody() {
//==============================================================================
// Draw our 2 red triangles using current g_modelMatrix:
		  gl.uniformMatrix4fv(uLoc_modelMatrix, false, g_modelMatrix.elements);
		  gl.drawArrays(gl.LINES, 0, g_body_vertCount);	// draw all vertices.
}

function drawPaddle(){

}



function testMatrixStack() {
//==============================================================================
// 
	console.log("------------------Test Matrix stack behavior----------------");
	console.log("stack size:", __cuon_matrix_mod_stack.length);
	console.log("now push g_modelMatrix:");
	pushMatrix(g_modelMatrix);
	console.log("stack size:", __cuon_matrix_mod_stack.length);
	console.log("CHANGE g_modelMatrix: rotate, translate:");
	g_modelMatrix.setRotate(60.0, 1,1,1);
	g_modelMatrix.translate(1,2,3);
	g_modelMatrix.printMe("new g_ModelMatrix");
	console.log("push new matrix onto stack");
	pushMatrix(g_modelMatrix);
	console.log("stack size:", __cuon_matrix_mod_stack.length);
	console.log("stack:", __cuon_matrix_mod_stack);
	console.log("now 1st popMatrix:");
	g_modelMatrix = popMatrix();
	console.log("stack size:", __cuon_matrix_mod_stack.length);
	console.log("stack:", __cuon_matrix_mod_stack);
	g_modelMatrix.printMe("after 1st pop g_ModelMatrix");
	console.log("now 2nd popMatrix");
	g_modelMatrix = popMatrix();
	console.log("stack size:", __cuon_matrix_mod_stack.length);
	console.log("stack:", __cuon_matrix_mod_stack);
	g_modelMatrix.printMe("after 2nd pop g_ModelMatrix");
/*
	// CAREFUL!! The next test will DESTROY contents of g_modelMatrix,
	// and replace current contents with identity matrix.
	console.log("now 3rd popMatrix (on empty stack)");
	g_modelMatrix = popMatrix();
	console.log("stack size:", __cuon_matrix_mod_stack.length);
	console.log("stack:", __cuon_matrix_mod_stack);
	console.log("g_modelMatrix:", g_modelMatrix)
	g_modelMatrix.printMe("after 3nd pop g_ModelMatrix");
	// AHA! CONSOLE ERROR REPORT HERE:
	// excess 'popMatrix' will MESS UP g_modelMatrix; it's now UNDEFINED!!!
	// Replace it with identity matrix.
	g_modelMatrix = new Matrix4();
	g_modelMatrix.printMe("RESTORED g_modelMatrix");
*/

	console.log("----------------END Test Matrix Stack-------------------------");
}
//========================
//
// HTML BUTTON HANDLERS
//
//========================

function A0_runStop() {
//==============================================================================
  if(g_angle0brake > 0.5)	// if running,
  {
  	g_angle0brake = 0.0;	// stop, and change button label:
  	document.getElementById("A0button").value="Angle 0 OFF";
	}
  else
  {
  	g_angle0brake = 1.0;	// Otherwise, go.
  	document.getElementById("A0button").value="Angle 0 ON-";
	}
}

function A1_runStop() {
//==============================================================================
  if(g_angle1brake > 0.5)	// if running,
  {
  	g_angle1brake = 0.0;	// stop, and change button label:
  	document.getElementById("A1button").value="Angle 1 OFF";
	}
  else
  {
  	g_angle1brake = 1.0;	// Otherwise, go.
  	document.getElementById("A1button").value="Angle 1 ON-";
	}
}
function A2_runStop() {
//==============================================================================
  if(g_angle2brake > 0.5)	// if running,
  {
  	g_angle2brake = 0.0;	// stop, and change button label:
  	document.getElementById("A2button").value="Angle 2 OFF";
	}
  else
  {
  	g_angle2brake = 1.0;	// Otherwise, go.
  	document.getElementById("A2button").value="Angle 2 ON-";
	}
}

function A3_runStop() {
//==============================================================================
  if(g_angle3brake > 0.5)	// if running,
  {
  	g_angle3brake = 0.0;	// stop, and change button label:
  	document.getElementById("A3button").value="Angle 3 OFF";
	}
  else
  {
  	g_angle3brake = 1.0;	// Otherwise, go.
  	document.getElementById("A3button").value="Angle 3 ON-";
	}
}
