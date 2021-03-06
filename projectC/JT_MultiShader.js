//3456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
// (JT: why the numbers? counts columns, helps me keep 80-char-wide listings)
//
// TABS set to 2.
//
// ORIGINAL SOURCE:
// RotatingTranslatedTriangle.js (c) 2012 matsuda
// HIGHLY MODIFIED to make:
//
// JT_MultiShader.js  for EECS 351-1, 
//									Northwestern Univ. Jack Tumblin

/* Show how to use 3 separate VBOs with different verts, attributes & uniforms. 
-------------------------------------------------------------------------------
	Create a 'VBObox' object/class/prototype & library to collect, hold & use all 
	data and functions we need to render a set of vertices kept in one Vertex 
	Buffer Object (VBO) on-screen, including:
	--All source code for all Vertex Shader(s) and Fragment shader(s) we may use 
		to render the vertices stored in this VBO;
	--all variables needed to select and access this object's VBO, shaders, 
		uniforms, attributes, samplers, texture buffers, and any misc. items. 
	--all variables that hold values (uniforms, vertex arrays, element arrays) we 
	  will transfer to the GPU to enable it to render the vertices in our VBO.
	--all user functions: init(), draw(), adjust(), reload(), empty(), restore().
	Put all of it into 'JT_VBObox-Lib.js', a separate library file.

USAGE:
------
1) If your program needs another shader program, make another VBObox object:
 (e.g. an easy vertex & fragment shader program for drawing a ground-plane grid; 
 a fancier shader program for drawing Gouraud-shaded, Phong-lit surfaces, 
 another shader program for drawing Phong-shaded, Phong-lit surfaces, and
 a shader program for multi-textured bump-mapped Phong-shaded & lit surfaces...)
 
 HOW:
 a) COPY CODE: create a new VBObox object by renaming a copy of an existing 
 VBObox object already given to you in the VBObox-Lib.js file. 
 (e.g. copy VBObox1 code to make a VBObox3 object).

 b) CREATE YOUR NEW, GLOBAL VBObox object.  
 For simplicity, make it a global variable. As you only have ONE of these 
 objects, its global scope is unlikely to cause confusions/errors, and you can
 avoid its too-frequent use as a function argument.
 (e.g. above main(), write:    var phongBox = new VBObox3();  )

 c) INITIALIZE: in your JS progam's main() function, initialize your new VBObox;
 (e.g. inside main(), write:  phongBox.init(); )

 d) DRAW: in the JS function that performs all your webGL-drawing tasks, draw
 your new VBObox's contents on-screen. 
 (NOTE: as it's a COPY of an earlier VBObox, your new VBObox's on-screen results
  should duplicate the initial drawing made by the VBObox you copied.  
  If that earlier drawing begins with the exact same initial position and makes 
  the exact same animated moves, then it will hide your new VBObox's drawings!
  --THUS-- be sure to comment out the earlier VBObox's draw() function call  
  to see the draw() result of your new VBObox on-screen).
  (e.g. inside drawAll(), add this:  
      phongBox.switchToMe();
      phongBox.draw();            )

 e) ADJUST: Inside the JS function that animates your webGL drawing by adjusting
 uniforms (updates to ModelMatrix, etc) call the 'adjust' function for each of your
VBOboxes.  Move all the uniform-adjusting operations from that JS function into the
'adjust()' functions for each VBObox. 

2) Customize the VBObox contents; add vertices, add attributes, add uniforms.
 ==============================================================================*/


// Global Variables  
//   (These are almost always a BAD IDEA, but here they eliminate lots of
//    tedious function arguments. 
//    Later, collect them into just a few global, well-organized objects!)
// ============================================================================
// for WebGL usage:--------------------
var gl;													// WebGL rendering context -- the 'webGL' object
// in JavaScript with all its member fcns & data
var g_canvasID;									// HTML-5 'canvas' element ID#

// For multiple VBOs & Shaders:-----------------
worldBox = new VBObox0();		  // Holds VBO & shaders for 3D 'world' ground-plane grid, etc;
part1Box = new VBObox1();		  // "  "  for first set of custom-shaded 3D parts
part2Box = new VBObox2();     // "  "  for second set of custom-shaded 3D parts

// For animation:---------------------
var g_lastMS = Date.now();			// Timestamp (in milliseconds) for our 
// most-recently-drawn WebGL screen contents.
// Set & used by moveAll() fcn to update all
// time-varying params for our webGL drawings.
// All time-dependent params (you can add more!)
var g_angleNow0 = 0.0; 			  // Current rotation angle, in degrees.
var g_angleRate0 = 1.0;				// Rotation angle rate, in degrees/second.
//---------------
var g_angleNow1 = 0.0;       // current angle, in degrees
var g_angleRate1 = 95.0;        // rotation angle rate, degrees/sec
var g_angleMax1 = 30.0;       // max, min allowed angle, in degrees
var g_angleMin1 = -30.0;
//---------------
var g_angleNow2 = 0.0; 			  // Current rotation angle, in degrees.
var g_angleRate2 = -30.0;				// Rotation angle rate, in degrees/second.

//---------------
var g_posNow0 = 0.0;           // current position
var g_posRate0 = 0.6;           // position change rate, in distance/second.
var g_posMax0 = 0.5;           // max, min allowed for g_posNow;
var g_posMin0 = -0.5;
// ------------------
var g_posNow1 = 0.0;           // current position
var g_posRate1 = 0.5;           // position change rate, in distance/second.
var g_posMax1 = 1.0;           // max, min allowed positions
var g_posMin1 = -1.0;
//---------------

// For mouse/keyboard:------------------------
var g_show0 = 1;								// 0==Show, 1==Hide VBO0 contents on-screen.
var g_show1 = 1;								// 	"					"			VBO1		"				"				" 
var g_show2 = 0;                //  "         "     VBO2    "       "       "

var g_viewportMatrix;

var g_near = 1
var g_far = 30
var g_camera_pos = [0, -8, 3]
var g_camera_look = [0, 0, 0]
var g_fov = 30
var g_view_angel = 0
var r = Math.sqrt(Math.pow(g_camera_look[0] - g_camera_pos[0], 2) + Math.pow(g_camera_look[1] - g_camera_pos[1], 2))

var g_light_method = 0
var g_light_on = true

function main() {
  window.addEventListener("keydown", myKeyDown, false);
//=============================================================================
  // Retrieve the HTML-5 <canvas> element where webGL will draw our pictures:
  g_canvasID = document.getElementById('webgl');
  // Create the the WebGL rendering context: one giant JavaScript object that
  // contains the WebGL state machine adjusted by large sets of WebGL functions,
  // built-in variables & parameters, and member data. Every WebGL function call
  // will follow this format:  gl.WebGLfunctionName(args);

  // Create the the WebGL rendering context: one giant JavaScript object that
  // contains the WebGL state machine, adjusted by big sets of WebGL functions,
  // built-in variables & parameters, and member data. Every WebGL func. call
  // will follow this format:  gl.WebGLfunctionName(args);
  //SIMPLE VERSION:  gl = getWebGLContext(g_canvasID); 
  // Here's a BETTER version:
  gl = g_canvasID.getContext("webgl", {preserveDrawingBuffer: true});
  // This fancier-looking version disables HTML-5's default screen-clearing, so
  // that our drawMain()
  // function will over-write previous on-screen results until we call the
  // gl.clear(COLOR_BUFFER_BIT); function. )
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.clearColor(0, 0, 0, 1);	  // RGBA color for clearing <canvas>

  gl.enable(gl.DEPTH_TEST);

  //----------------SOLVE THE 'REVERSED DEPTH' PROBLEM:------------------------
  // IF the GPU doesn't transform our vertices by a 3D Camera Projection Matrix
  // (and it doesn't -- not until Project B) then the GPU will compute reversed 
  // depth values:  depth==0 for vertex z == -1;   (but depth = 0 means 'near') 
  //		    depth==1 for vertex z == +1.   (and depth = 1 means 'far').
  //
  // To correct the 'REVERSED DEPTH' problem, we could:
  //  a) reverse the sign of z before we render it (e.g. scale(1,1,-1); ugh.)
  //  b) reverse the usage of the depth-buffer's stored values, like this:
  gl.enable(gl.DEPTH_TEST); // enabled by default, but let's be SURE.

  // gl.clearDepth(0.0);       // each time we 'clear' our depth buffer, set all
  //                           // pixel depths to 0.0  (1.0 is DEFAULT)
  // gl.depthFunc(gl.GREATER); // draw a pixel only if its depth value is GREATER
  //                           // than the depth buffer's stored value.
  //                           // (gl.LESS is DEFAULT; reverse it!)
  //------------------end 'REVERSED DEPTH' fix---------------------------------

  g_viewportMatrix = new Matrix4();
  // Initialize each of our 'vboBox' objects: 
  worldBox.init(gl);		// VBO + shaders + uniforms + attribs for our 3D world,
  // including ground-plane,
  part1Box.init(gl);		//  "		"		"  for 1st kind of shading & lighting
  part2Box.init(gl);    //  "   "   "  for 2nd kind of shading & lighting

  gl.clearColor(0, 0, 0, 1);	  // RGBA color for clearing <canvas>

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
  //------------------------------------
  var tick = function () {		    // locally (within main() only), define our
    // self-calling animation function.
    requestAnimationFrame(tick, g_canvasID); // browser callback request; wait
    // til browser is ready to re-draw canvas, then
    timerAll();  // Update all time-varying params, and
    drawAll();                // Draw all the VBObox contents
  };
  //------------------------------------
  tick();                       // do it again!

  window.addEventListener('resize', resizeCanvas, false);
  resizeCanvas()
}

function timerAll() {
//=============================================================================
// Find new values for all time-varying parameters used for on-screen drawing
  // use local variables to find the elapsed time.
  var nowMS = Date.now();             // current time (in milliseconds)
  var elapsedMS = nowMS - g_lastMS;   // 
  g_lastMS = nowMS;                   // update for next webGL drawing.
  if (elapsedMS > 1000.0) {
    // Browsers won't re-draw 'canvas' element that isn't visible on-screen 
    // (user chose a different browser tab, etc.); when users make the browser
    // window visible again our resulting 'elapsedMS' value has gotten HUGE.
    // Instead of allowing a HUGE change in all our time-dependent parameters,
    // let's pretend that only a nominal 1/30th second passed:
    elapsedMS = 1000.0 / 30.0;
  }
  // Find new time-dependent parameters using the current or elapsed time:
  // Continuous rotation:
  g_angleNow0 = g_angleNow0 + (g_angleRate0 * elapsedMS) / 1000.0;
  g_angleNow1 = g_angleNow1 + (g_angleRate1 * elapsedMS) / 1000.0;
  g_angleNow2 = g_angleNow2 + (g_angleRate2 * elapsedMS) / 1000.0;
  g_angleNow0 %= 360.0;   // keep angle >=0.0 and <360.0 degrees  
  g_angleNow1 %= 360.0;
  g_angleNow2 %= 360.0;
  if (g_angleNow1 > g_angleMax1) { // above the max?
    g_angleNow1 = g_angleMax1;    // move back down to the max, and
    g_angleRate1 = -g_angleRate1; // reverse direction of change.
  } else if (g_angleNow1 < g_angleMin1) {  // below the min?
    g_angleNow1 = g_angleMin1;    // move back up to the min, and
    g_angleRate1 = -g_angleRate1;
  }
  // Continuous movement:
  g_posNow0 += g_posRate0 * elapsedMS / 1000.0;
  g_posNow1 += g_posRate1 * elapsedMS / 1000.0;
  // apply position limits
  if (g_posNow0 > g_posMax0) {   // above the max?
    g_posNow0 = g_posMax0;      // move back down to the max, and
    g_posRate0 = -g_posRate0;   // reverse direction of change
  } else if (g_posNow0 < g_posMin0) {  // or below the min?
    g_posNow0 = g_posMin0;      // move back up to the min, and
    g_posRate0 = -g_posRate0;   // reverse direction of change.
  }
  if (g_posNow1 > g_posMax1) {   // above the max?
    g_posNow1 = g_posMax1;      // move back down to the max, and
    g_posRate1 = -g_posRate1;   // reverse direction of change
  } else if (g_posNow1 < g_posMin1) {  // or below the min?
    g_posNow1 = g_posMin1;      // move back up to the min, and
    g_posRate1 = -g_posRate1;   // reverse direction of change.
  }

}

function drawAll() {
//=============================================================================
  // Clear on-screen HTML-5 <canvas> object:
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  g_viewportMatrix.setIdentity();
  var vpAspect = g_canvasID.width /			// On-screen aspect ratio for
    (g_canvasID.height);	// this camera: width/height.
  g_viewportMatrix.perspective(g_fov,			// fovy: y-axis field-of-view in degrees
    // (top <-> bottom in view frustum)
    vpAspect, // aspect ratio: width/height
    g_near, g_far);	// near, far (always >0).

  g_viewportMatrix.lookAt(g_camera_pos[0], g_camera_pos[1], g_camera_pos[2], 				// 'Center' or 'Eye Point',
    g_camera_look[0], g_camera_look[1], g_camera_look[2], 					// look-At point,
    0, 0, 1);					// View UP vector, all in 'world' coords.
  // For this viewport, set camera's eye point and the viewing volume:
  gl.viewport(0, 0, g_canvasID.width, g_canvasID.height);
  var b4Draw = Date.now();
  var b4Wait = b4Draw - g_lastMS;

  if (g_show0 == 1) {	// IF user didn't press HTML button to 'hide' VBO0:
    worldBox.switchToMe();  // Set WebGL to render from this VBObox.
    worldBox.adjust();		  // Send new values for uniforms to the GPU, and
    worldBox.draw();			  // draw our VBO's contents using our shaders.
  }
  if (g_show1 == 1) { // IF user didn't press HTML button to 'hide' VBO1:
    part1Box.switchToMe();  // Set WebGL to render from this VBObox.
    part1Box.adjust();		  // Send new values for uniforms to the GPU, and
    part1Box.draw();			  // draw our VBO's contents using our shaders.
  }
  if (g_show2 == 1) { // IF user didn't press HTML button to 'hide' VBO2:
    part2Box.switchToMe();  // Set WebGL to render from this VBObox.
    part2Box.adjust();		  // Send new values for uniforms to the GPU, and
    part2Box.draw();			  // draw our VBO's contents using our shaders.
  }
  /* // ?How slow is our own code?
  var aftrDraw = Date.now();
  var drawWait = aftrDraw - b4Draw;
  console.log("wait b4 draw: ", b4Wait, "drawWait: ", drawWait, "mSec");
  */
}

function lightToggle() {
//=============================================================================
// Called when user presses HTML-5 button 'Show/Hide VBO0'.
  g_light_on = !g_light_on;										// hide.
}

function myKeyDown(kev) {
  switch (kev.code) {
    case "ArrowLeft":
      var last_x = r * Math.sin(g_view_angel)
      var last_y = r * (Math.cos(g_view_angel) - 1)
      g_view_angel -= Math.PI / 60
      g_camera_look[0] += r * Math.sin(g_view_angel) - last_x
      g_camera_look[1] += r * (Math.cos(g_view_angel) - 1) - last_y
      console.log(r + " " + g_camera_look[0] + " " + g_camera_look[2])
      break;
    case "ArrowRight":
      var last_x = r * Math.sin(g_view_angel)
      var last_y = r * (Math.cos(g_view_angel) - 1)
      g_view_angel += Math.PI / 60
      g_camera_look[0] += r * Math.sin(g_view_angel) - last_x
      g_camera_look[1] += r * (Math.cos(g_view_angel) - 1) - last_y
      console.log(r + " " + g_camera_look[0] + " " + g_camera_look[2])
      break;
    case "ArrowUp":
      g_camera_look[2] += 0.1
      break;
    case "ArrowDown":
      g_camera_look[2] -= 0.1
      break;
    case "KeyW":
      var vec = [g_camera_pos[0] - g_camera_look[0], g_camera_pos[1] - g_camera_look[1], g_camera_pos[2] - g_camera_look[2]]
      g_camera_look[0] -= 0.1 * vec[0]
      g_camera_look[1] -= 0.1 * vec[1]
      g_camera_look[2] -= 0.1 * vec[2]

      g_camera_pos[0] -= 0.1 * vec[0]
      g_camera_pos[1] -= 0.1 * vec[1]
      g_camera_pos[2] -= 0.1 * vec[2]
      break;
    case "KeyA":
      g_camera_look[0] -= 0.1 * Math.cos(g_view_angel)
      g_camera_pos[0] -= 0.1 * Math.cos(g_view_angel)
      g_camera_look[1] += 0.1 * Math.sin(g_view_angel)
      g_camera_pos[1] += 0.1 * Math.sin(g_view_angel)
      break;
    case "KeyS":
      var vec = [g_camera_pos[0] - g_camera_look[0], g_camera_pos[1] - g_camera_look[1], g_camera_pos[2] - g_camera_look[2]]
      g_camera_look[0] += 0.1 * vec[0]
      g_camera_look[1] += 0.1 * vec[1]
      g_camera_look[2] += 0.1 * vec[2]

      g_camera_pos[0] += 0.1 * vec[0]
      g_camera_pos[1] += 0.1 * vec[1]
      g_camera_pos[2] += 0.1 * vec[2]
      break;
    case "KeyD":
      g_camera_look[0] += 0.1 * Math.cos(g_view_angel)
      g_camera_pos[0] += 0.1 * Math.cos(g_view_angel)
      g_camera_look[1] -= 0.1 * Math.sin(g_view_angel)
      g_camera_pos[1] -= 0.1 * Math.sin(g_view_angel)
      break;
    default:
      break;
  }
}

function resizeCanvas() {
  g_canvasID.width = innerWidth - 10;
  g_canvasID.height = innerHeight * 2 / 3;
  drawAll();
}

function update_light_pos_x(val) {
  g_lamp0pos[0] = val
  document.getElementById('lpx').innerHTML = val
}

function update_light_pos_y(val) {
  g_lamp0pos[1] = val
  document.getElementById('lpy').innerHTML = val
}

function update_light_pos_z(val) {
  g_lamp0pos[2] = val
  document.getElementById('lpz').innerHTML = val
}

function update_light_amb_r(val) {
  g_lamp0ambi[0] = val / 255
  document.getElementById('lar').innerHTML = val
}

function update_light_amb_g(val) {
  g_lamp0ambi[1] = val / 255
  document.getElementById('lag').innerHTML = val
}

function update_light_amb_b(val) {
  g_lamp0ambi[2] = val / 255
  document.getElementById('lab').innerHTML = val
}

function update_light_diff_r(val) {
  g_lamp0diff[0] = val / 255
  document.getElementById('ldr').innerHTML = val
}

function update_light_diff_g(val) {
  g_lamp0diff[1] = val / 255
  document.getElementById('ldg').innerHTML = val
}

function update_light_diff_b(val) {
  g_lamp0diff[2] = val / 255
  document.getElementById('ldb').innerHTML = val
}

function update_light_spec_r(val) {
  g_lamp0spec[0] = val / 255
  document.getElementById('lsr').innerHTML = val
}

function update_light_spec_g(val) {
  g_lamp0spec[1] = val / 255
  document.getElementById('lsg').innerHTML = val
}

function update_light_spec_b(val) {
  g_lamp0spec[2] = val / 255
  document.getElementById('lsb').innerHTML = val
}

function changeLightingMethod() {
  var light = document.getElementById("lighting").value;
  g_light_method = parseInt(light)
}

function changeShadingMethod() {
  var shading = document.getElementById("shading").value;
  g_show1 = (parseInt(shading) + 1) % 2
  g_show2 = parseInt(shading)
}