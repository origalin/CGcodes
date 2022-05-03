// HelloPoint1.js (c) 2012 matsuda
// Vertex shader program
/*
// MODIFIED J. Tumblin 1/2017  to make 'HelloMatrixDegen.js'. 
// MODIFIED J. Tumblin 1/2017 to make 'HelloQuaternion.js' 

Simple program to test basic quaternion operations using the 'Quaternion'
objects and functions found in ../lib/cuon-matrix-quat03.js

--Includes code to encourage exploring basic vector/matrix operations;
-- Demonstrate that matrices have finite precision, and thus contain tiny errors that can accumulate. THUS you should never write code that endlessly concatenates rotation-only matrices (e.g. an 'orientation' matrix made by continually re-applying rotation matrices), because eventually the result accumulates numerical errors that cause wholly unpredictable non-rotation transforms, including non-uniform scale, translation, shear, skew, and even unwanted projective distortions.  These matrices 'degenerate' -- they're no longer pure 3D  rotations!

-- Further code encourages exploring quaternion operations.

Nothing interesting happens in the canvas -- it's all in the console!
*/

var VSHADER_SOURCE = 
  'void main() {\n' +
  '  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);\n' + // Set the vertex coordinates of the one and only point
  '  gl_PointSize = 10.0;\n' +                    // Set the point size. CAREFUL! MUST be float, not integer value!!
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'void main() {\n' +
  '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' + // Set the point color
  '}\n';

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  console.log('Hey! we have all our shaders initialized!');

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw a point
  gl.drawArrays(gl.POINTS, 0, 1);

  /*
  //============================================================
  // Lets play around with Vector4 objects:
  //============================================================
  
  var aVec = new Vector4();   
  var bVec = new Vector4();
  aVec[0] = 4.0; aVec[1] = 3.0; aVec[2] = 2.0; aVec[3] = 0.0;   
  bVec[0] = 1.0; bVec[1] = 2.0; bVec[2] = 3.0; bVec[3] = 0.0;
  // x,y,z,w=0 (vector, not point)
  console.log('\n---------------Vector4 Ops------------\n');
  res = 3;		// number of digits we will print on console log
  tmp = aVec;	// (temporary var so we don't change aVec or bVec)
  console.log('aVec: x=', tmp[0].toFixed(res), 
										'y=', tmp[1].toFixed(res), 
									  'z=', tmp[2].toFixed(res), 
									 	'w=', tmp[3].toFixed(res),'\n');
  tmp = bVec;
  console.log('bVec: x=', tmp[0].toFixed(res), 
										'y=', tmp[1].toFixed(res), 
										'z=', tmp[2].toFixed(res), 
									 	'w=', tmp[3].toFixed(res),'\n');
	console.log('or equivalently, in the cuon-matrix-quat03.js library');
	console.log('you will find \'printMe()\' fcns for Vector4, Matrix4, and Quaternion objects.');
	console.log('aVec.printMe() yields:');
	aVec.printMe();
	console.log('bVec.printMe() yields:');
	bVec.printMe();
	console.log('Add more tests of your own--see HTML file for instructions...');
	// You add more here ... see our HTML file for instructions...
	*/
	
	
  //============================================================
	// Lets play around with Matrix4 objects
  //============================================================
  var aMat = new Matrix4();
	aMat.setIdentity();
	var mySiz = 3000;
	var count;
	
	console.log('Rotate aMat by (360/'+mySiz+') degrees\n around the (1,3,5) axis,'+mySiz+' times:');
	for(count = 0; count < mySiz; count++) {
			aMat.rotate(-360.0/mySiz, 1.0, 3.0, 5.0);
		}
		console.log('Result SHOULD be a perfect identity matrix, but it is not:');
		aMat.printMe();
		console.log('Instead, this degenerate matrix accumulated errors that');
		console.log('cause other, unpredictable, non-rotation transforms.  BAD!');
		console.log('THUS you should never use matrix multiplies to combine a');
		console.log('long series of rotations.  Instead, use quaternions.');
		console.log('NOTE: open the .js file and the HTML file; \n Plenty to explore, comment & uncomment!');

	//============================================================
	//  Let's play around with Quaternion objects
	//============================================================
	/* I found these Quaternion member functions:
				Constructor: Quaternion(x,y,z,w);
				clear();
				copy(q);
--> 		printMe();
-->			setFromAxisAngle(ax, ay, az, angleDeg);
				UNFINISHED: setFromEuler(AlphaDeg, BetaDeg, gammaDeg);
-->			setFromRotationMatrix(m);
				calculateW();
				inverse();
				length();
-->			normalize();
				multiplySelf(quat2);
-->			multiply(q1,q2);
				multiplyVector3(vec, dest);
				slerp(qa,ab,qm,t);
	I also found this Matrix4 member:
			setFromQuat(qx,qy,qz,qw);
	*/	
		
/*	
	console.log('------------------Try some Quaternions--------------------');
// GLOBAL variables:
var q0 = new Quaternion(); 	
var q1 = new Quaternion();
var R0 = new Matrix4();
var R1 = new Matrix4();
	console.log('q0 made with empty constructor:');
	q0.printMe();
	console.log('convert this default q0 to matrix R0; makes identity matrix:');
	R0.setFromQuat(q0.x, q0.y, q0.z, q0.w);
	R0.printMe();
	console.log('YES! AGREES with online quaternion calculator!');
	console.log('set q0 to axis 2,0,0; +30deg.-----------------');
	console.log('Call setFromAxisAngle(2,0,0, 30.0) -- it always creates a UNIT quaternion:');
	q0.setFromAxisAngle(2,0,0, 30.0);
	q0.printMe();
	console.log('q0 length==',q0.length());
	console.log('convert q0 to matrix R0:');
	R0.setFromQuat(q0.x, q0.y, q0.z, q0.w);
	R0.printMe();
	console.log('YES! AGREES with online quaternion calculator!');
	console.log('set q1 to axis 0,0,0.2; -45deg.---------------');
	q1.setFromAxisAngle(0,0,0.2, -45.0);
	q1.printMe();
	console.log('q1 length==',q0.length());
	console.log('convert q1 to matrix R1:');
	R1.setFromQuat(q1.x, q1.y, q1.z, q1.w);
	R1.printMe();
	console.log('YES! AGREES with online quaternion calculator!');
*/
	
	/*
	*
	*
	*  YOU write the rest ...
	*  (Be sure you try the quaternion multiply vs. matrix multiply)
	*
	*/
  testQuaternions()
	}
function testQuaternions() {
//==============================================================================
// Test our little "quaternion-mod.js" library with simple rotations for which
// we know the answers; print results to make sure all functions work as
// intended.
// 1)  Test constructors and value-setting functions:
  var mtx = new Matrix4();
  var res = 5;
  var myQuat = new Quaternion(1,2,3,4);
  console.log('constructor: myQuat(x,y,z,w)=',
    myQuat.x, myQuat.y, myQuat.z, myQuat.w);
  console.log("show in matrix")
  mtx.setFromQuat(myQuat.x, myQuat.y, myQuat.z, myQuat.w)
  mtx.printMe()
  myQuat.clear();
  console.log('myQuat.clear()=',
    myQuat.x.toFixed(res), myQuat.y.toFixed(res),
    myQuat.z.toFixed(res), myQuat.w.toFixed(res));
  console.log("show in matrix")
  mtx.setFromQuat(myQuat.x, myQuat.y, myQuat.z, myQuat.w)
  mtx.printMe()
  myQuat.set(1,2, 1,2);
  console.log('myQuat.set(1,2,1,2)=',
    myQuat.x.toFixed(res), myQuat.y.toFixed(res),
    myQuat.z.toFixed(res), myQuat.w.toFixed(res));
  console.log('myQuat.length()=', myQuat.length().toFixed(res));
  console.log("show in matrix")
  mtx.setFromQuat(myQuat.x, myQuat.y, myQuat.z, myQuat.w)
  mtx.printMe()
  myQuat.normalize();
  console.log('myQuat.normalize()=',
    myQuat.x.toFixed(res), myQuat.y.toFixed(res), myQuat.z.toFixed(res), myQuat.w.toFixed(res));
  console.log("show in matrix")
  mtx.setFromQuat(myQuat.x, myQuat.y, myQuat.z, myQuat.w)
  mtx.printMe()
  // Simplest possible quaternions:
  myQuat.setFromAxisAngle(1,0,0,10);
  console.log('Set myQuat to 10-deg. rot. on x axis=',
    myQuat.x.toFixed(res), myQuat.y.toFixed(res), myQuat.z.toFixed(res), myQuat.w.toFixed(res));
  console.log("show in matrix")
  mtx.setFromQuat(myQuat.x, myQuat.y, myQuat.z, myQuat.w)
  mtx.printMe()
  console.log("compare to the same rotation of matrix")
  mtx.setIdentity()
  mtx.rotate(10,1,0,0)
  mtx.printMe()
  console.log("thet are the same")

  myQuat.setFromAxisAngle(0,1,0,10);
  console.log('set myQuat to 10-deg. rot. on y axis=',
    myQuat.x.toFixed(res), myQuat.y.toFixed(res), myQuat.z.toFixed(res), myQuat.w.toFixed(res));
  console.log("show in matrix")
  mtx.setFromQuat(myQuat.x, myQuat.y, myQuat.z, myQuat.w)
  mtx.printMe()
  console.log("compare to the same rotation of matrix")
  mtx.setIdentity()
  mtx.rotate(10,0,1,0)
  mtx.printMe()
  console.log("thet are the same")

  myQuat.setFromAxisAngle(0,0,1,10);
  console.log('set myQuat to 10-deg. rot. on z axis=',
    myQuat.x.toFixed(res), myQuat.y.toFixed(res), myQuat.z.toFixed(res), myQuat.w.toFixed(res), '\n');
  console.log("show in matrix")
  mtx.setFromQuat(myQuat.x, myQuat.y, myQuat.z, myQuat.w)
  mtx.printMe()
  console.log("compare to the same rotation of matrix")
  mtx.setIdentity()
  mtx.rotate(10,0,0,1)
  mtx.printMe()
  console.log("thet are the same")

  myQmat = new Matrix4();
  myQuat.setFromAxisAngle(1,0,0, 95.0);
  console.log('set myQuat to +95-deg rot. on x axis =',
    myQuat.x.toFixed(res), myQuat.y.toFixed(res), myQuat.z.toFixed(res), myQuat.w.toFixed(res));
  myQmat.setFromQuat(myQuat.x, myQuat.y, myQuat.z, myQuat.w);
  console.log('myQuat as matrix: (+y axis <== -z axis)(+z axis <== +y axis)');
  myQmat.printMe();
  console.log("compare to the same rotation of matrix")
  mtx.setIdentity()
  mtx.rotate(95,1,0,0)
  mtx.printMe()
  console.log("thet are the same")

  myQuat.setFromAxisAngle(0,1,0, 95.0);
  console.log('set myQuat to +95-deg rot. on y axis =',
    myQuat.x.toFixed(res), myQuat.y.toFixed(res), myQuat.z.toFixed(res), myQuat.w.toFixed(res));
  myQmat.setFromQuat(myQuat.x, myQuat.y, myQuat.z, myQuat.w);
  console.log('myQuat as matrix: (+x axis <== +z axis)(+z axis <== -x axis)');
  myQmat.printMe();
  console.log("compare to the same rotation of matrix")
  mtx.setIdentity()
  mtx.rotate(95,0,1,0)
  mtx.printMe()
  console.log("thet are the same")

  myQuat.setFromAxisAngle(0,0,1, 95.0);
  console.log('set myQuat to +90-deg rot. on z axis =',
    myQuat.x.toFixed(res), myQuat.y.toFixed(res), myQuat.z.toFixed(res), myQuat.w.toFixed(res));
  myQmat.setFromQuat(myQuat.x, myQuat.y, myQuat.z, myQuat.w);
  console.log('myQuat as matrix: (+x axis <== -y axis)(+y axis <== +x axis)');
  myQmat.printMe();
  console.log("compare to the same rotation of matrix")
  mtx.setIdentity()
  mtx.rotate(95,0,0,1)
  mtx.printMe()
  console.log("thet are the same")

  // Test quaternion multiply:
  // (q1*q2) should rotate drawing axes by q1 and then by q2;  it does!
  var qx90 = new Quaternion;
  var qy90 = new Quaternion;
  qx90.setFromAxisAngle(1,0,0,45.0);			// +90 deg on x axis
  qy90.setFromAxisAngle(0,1,0,45.0);			// +90 deg on y axis.
  myQuat.multiply(qx90,qy90);
  console.log('set myQuat to (45deg x axis) * (45deg y axis) = ',
    myQuat.x.toFixed(res), myQuat.y.toFixed(res), myQuat.z.toFixed(res), myQuat.w.toFixed(res));
  myQmat.setFromQuat(myQuat.x, myQuat.y, myQuat.z, myQuat.w);
  console.log('myQuat as matrix: (+x <== +z)(+y <== +x )(+z <== +y');
  myQmat.printMe();
  console.log("compare to the same rotation of matrix")
  mtx.setIdentity()
  mtx.rotate(45,1,0,0)
  mtx.rotate(45,0,1,0)
  mtx.printMe()
  console.log("thet are the same")

  // What is new:
  var aMat = new Matrix4();
  aMat.setIdentity();
  var mySiz = 3000;
  var count;

  console.log('----------------------------------')
  console.log('Rotate aMat by (360/'+mySiz+') degrees\n around the (1,3,5) axis,'+mySiz+' times:');
  for(count = 0; count < mySiz; count++) {
    aMat.rotate(-360.0/mySiz, 1.0, 3.0, 5.0);
  }
  console.log('Result SHOULD be a perfect identity matrix, but it is not:');

  aMat.printMe();
  var myQuat = new Quaternion(0,0,0,1);
  myQmat.setFromQuat(myQuat.x, myQuat.y, myQuat.z, myQuat.w);
  console.log('But if we rotate a Quaternion by (360/'+mySiz+') degrees\n around the (1,3,5) axis,'+mySiz+' times:');
  console.log('Before:')
  myQmat.printMe();
  for(count = 0; count < mySiz; count++) {
    var qNew = new Quaternion
    qNew.setFromAxisAngle(1,3,5,360/mySiz)
    var qTmp = new Quaternion
    qTmp.multiply(myQuat, qNew);
    myQuat.copy(qTmp)
  }
  myQmat.setFromQuat(myQuat.x, myQuat.y, myQuat.z, myQuat.w);
  console.log('After:')
  myQmat.printMe();
  console.log('Identical!!!')
  console.log('Just like this example, in our code at projectA, the rotations are applied many times due to the animation frame.' +
    'It will bring error when mouse is moving.')
  console.log('This accumulated error causes the actual axis after the drag shifted little by little and will not reflect our actual action anymore.')

}
