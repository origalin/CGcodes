var VSHADER_SOURCE =
  'uniform mat4 u_ModelMatrix;\n' +
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ModelMatrix * a_Position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program----------------------------------
var FSHADER_SOURCE =
//  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  //  '#endif GL_ES\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

var gl;
var g_canvasID;
var g_vertCount;
var g_body_vertCount;
var g_paddle_vertCount;
var g_base_vertCount;
var g_frame_vertCount;
var g_panel_vertCount;
var g_ground_vertCount;
var g_cord_vertCount;
var g_sphere_vertCount;
var g_cylinder_vertCount;
var g_modelMatrix;
var uLoc_modelMatrix;
var g_lastMS = Date.now();

var g_angle_paddle_now = 0.0;
var g_angle_paddle_rate = 2000.0;

var g_angle_plane_now = 0.0;
var g_angle_plane_rate = 90.0;

var g_angle_frame_now = 0.0;
var g_angle_frame_rate = -22.0;
var g_angle_frame_brake = 1.0;

var g_angle_panel_now = 0.0;
var g_angle_panel_aspect = 90.0;
var g_angle_panel_rate = 222.0;
var g_angle_panel_brake = 1.0;
var g_angle_panel_range = 60
var g_angle_panel_min = -g_angle_panel_range / 2;
var g_angle_panel_max = g_angle_panel_range / 2;

var g_pos_sphere_now = 0

var g_isSlide = false

var g_isDrag = false;
var g_xMclik = 0.0;
var g_yMclik = 0.0;
var g_xMdragTot = 0.0;
var g_yMdragTot = 0.0;

var g_near = 1
var g_far = 20
var g_camera_pos = [0, 1.5, -5]
var g_camera_look = [0, 1, 0]
var g_fov = 35
var g_view_angel = 0
var r = Math.sqrt(Math.pow(g_camera_look[0] - g_camera_pos[0], 2) + Math.pow(g_camera_look[2] - g_camera_pos[2], 2))

var qNew = new Quaternion(0, 0, 0, 1); // most-recent mouse drag's rotation
var qTot = new Quaternion(0, 0, 0, 1);	// 'current' orientation (made from qNew)
var quatMatrix = new Matrix4();				// rotation matrix, made from latest qTot

function main() {
  window.addEventListener("mousedown", myMouseDown);
  window.addEventListener("mousemove", myMouseMove);
  window.addEventListener("mouseup", myMouseUp);
  window.addEventListener("keydown", myKeyDown, false);

  document.getElementById('Speed').innerHTML = "Speed: " + g_angle_plane_rate

  g_canvasID = document.getElementById('webgl');

  gl = g_canvasID.getContext("webgl");

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL. Bye!');
    return;
  }

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  var myErr = initVertexBuffers();
  if (myErr < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }

  gl.clearColor(0 / 255, 0 / 255, 0 / 255, 1);
  gl.enable(gl.DEPTH_TEST);
  // gl.clearDepth(0.0);
  // gl.depthFunc(gl.GREATER);
  g_modelMatrix = new Matrix4();

  uLoc_modelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!uLoc_modelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  var tick = function () {
    requestAnimationFrame(tick, g_canvasID);
    timerAll();
    drawAll();
  };
  tick();


  window.addEventListener('resize', resizeCanvas, false);
  resizeCanvas()
}

function timerAll() {
  var nowMS = Date.now();
  var elapsedMS = nowMS - g_lastMS;
  g_lastMS = nowMS;
  if (elapsedMS > 1000.0) {
    elapsedMS = 1000.0 / 30.0;
  }
  g_angle_panel_now += g_angle_panel_rate * g_angle_panel_brake * (elapsedMS * 0.001);
  g_angle_plane_now += g_angle_plane_rate * (elapsedMS * 0.001);
  g_angle_frame_now += g_angle_frame_rate * g_angle_frame_brake * (elapsedMS * 0.001);
  g_angle_paddle_now += g_angle_paddle_rate * (elapsedMS * 0.001);

  if ((g_angle_panel_now >= g_angle_panel_max && g_angle_panel_rate > 0) ||
    (g_angle_panel_now <= g_angle_panel_min && g_angle_panel_rate < 0))
    g_angle_panel_rate *= -1;
  if (g_angle_panel_min > g_angle_panel_max) {
    if (g_angle_panel_now < -180.0) g_angle_panel_now += 360.0;
    else if (g_angle_panel_now > 180.0) g_angle_panel_now -= 360.0;
  }
  if (g_angle_plane_now > 360) {
    g_angle_plane_now -= 360
  }
  if (g_angle_plane_now < -360) {
    g_angle_plane_now += 360
  }
  if (g_angle_frame_now > 360) {
    g_angle_frame_now -= 360
  }
  if (g_angle_frame_now < -360) {
    g_angle_frame_now += 360
  }
  if (g_angle_paddle_now > 360) {
    g_angle_paddle_now -= 360
  }
  if (g_angle_paddle_now < -360) {
    g_angle_paddle_now += 360
  }

  g_pos_sphere_now += 0.05
  if (g_pos_sphere_now > 2 * Math.PI) {
    g_pos_sphere_now = 0
  }
}

function initVertexBuffers() {
  var body_vert = generateBodyVert();
  var paddle_vert = generatePaddleVert();
  var base_vert = generateBaseVert();
  var frame_vert = generateFrameVert();
  var ground_vert = makeGroundGrid();
  var panel_vert = generatePanelVert()
  var cord_vert = generateCordVert()
  var cyli_vert = makeCylinder()
  var sphe_vert = makeSphere()

  var vertices = new Float32Array([body_vert, paddle_vert, base_vert, frame_vert, panel_vert, ground_vert, cord_vert,  sphe_vert, cyli_vert].flat());
  g_vertCount = vertices.length / 7;
  g_body_vertCount = body_vert.length / 7;
  g_paddle_vertCount = paddle_vert.length / 7;
  g_base_vertCount = base_vert.length / 7
  g_frame_vertCount = frame_vert.length / 7
  g_panel_vertCount = panel_vert.length / 7
  g_ground_vertCount = ground_vert.length / 7
  g_cord_vertCount = cord_vert.length / 7
  g_cylinder_vertCount = cyli_vert.length / 7
  g_sphere_vertCount = sphe_vert.length / 7
  console.log(g_cylinder_vertCount)

  var vertexBufferID = gl.createBuffer();
  if (!vertexBufferID) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferID);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var aLoc_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (aLoc_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -2;
  }
  var FSIZE = vertices.BYTES_PER_ELEMENT; // how many bytes per stored value?

  gl.vertexAttribPointer(aLoc_Position, 4, gl.FLOAT, false, FSIZE * 7, 0);
  gl.enableVertexAttribArray(aLoc_Position);
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  // Use handle to specify how to retrieve color data from our VBO:
  gl.vertexAttribPointer(
    a_Color, 				// choose Vertex Shader attribute to fill with data
    3, 							// how many values? 1,2,3 or 4. (we're using R,G,B)
    gl.FLOAT, 			// data type for each value: usually gl.FLOAT
    false, 					// did we supply fixed-point data AND it needs normalizing?
    FSIZE * 7, 			// Stride -- how many bytes used to store each vertex?
    // (x,y,z,w, r,g,b) * bytes/value
    FSIZE * 4);			// Offset -- how many bytes from START of buffer to the
  // value we will actually use?  Need to skip over x,y,z,w
  gl.enableVertexAttribArray(a_Color);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return 0;
}

function drawAll() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  g_modelMatrix.setIdentity();
  //----------------------Create, fill UPPER viewport------------------------
  gl.viewport(0,											// Viewport lower-left corner
    g_canvasID.height / 2, 			// location(in pixels)
    g_canvasID.width, 				// viewport width,
    g_canvasID.height / 2);			// viewport height in pixels.

  var vpAspect = g_canvasID.width / 2 /			// On-screen aspect ratio for
    (g_canvasID.height);	// this camera: width/height.

  pushMatrix(g_modelMatrix);

  g_modelMatrix.perspective(35,			// fovy: y-axis field-of-view in degrees
    // (top <-> bottom in view frustum)
    vpAspect, // aspect ratio: width/height
    1, 20);	// near, far (always >0).

  g_modelMatrix.lookAt(g_camera_pos[0], g_camera_pos[1], g_camera_pos[2], 				// 'Center' or 'Eye Point',
    g_camera_look[0], g_camera_look[1], g_camera_look[2], 					// look-At point,
    0, 1, 0);					// View UP vector, all in 'world' coords.
  // For this viewport, set camera's eye point and the viewing volume:
  gl.viewport(0, 0, g_canvasID.width / 2, g_canvasID.height);
  drawObjects();
  g_modelMatrix = popMatrix();

  var width = Math.tan(g_fov / 360.0 * Math.PI) * (g_far - g_near) / 3
  var height = width / vpAspect
  g_modelMatrix.ortho(-width, width, -height, height, g_near, g_far)
  g_modelMatrix.lookAt(g_camera_pos[0], g_camera_pos[1], g_camera_pos[2], 				// 'Center' or 'Eye Point',
    g_camera_look[0], g_camera_look[1], g_camera_look[2], 					// look-At point,
    0, 1, 0);					// View UP vector, all in 'world' coords.
  gl.viewport(g_canvasID.width / 2, 0, g_canvasID.width / 2, g_canvasID.height);
  drawObjects();
}

function drawObjects() {

  pushMatrix(g_modelMatrix);
  g_modelMatrix.translate(Math.sin(g_angle_plane_now / 180.0 * Math.PI) * 0.5, 0.5, Math.cos(g_angle_plane_now / 180.0 * Math.PI) * 0.5);
  g_modelMatrix.rotate(g_angle_plane_now, 0, 1, 0)
  g_modelMatrix.scale(0.4, 0.4, 0.4);
  drawPlane();
  g_modelMatrix = popMatrix();

  pushMatrix(g_modelMatrix);
  quatMatrix.setFromQuat(qTot.x, qTot.y, qTot.z, qTot.w);	// Quaternion-->Matrix
  g_modelMatrix.concat(quatMatrix);	// apply that matrix.
  drawRadar()
  g_modelMatrix = popMatrix();
  pushMatrix(g_modelMatrix);
  g_modelMatrix.rotate(90, 1, 0, 0)
  drawGrid()
  g_modelMatrix = popMatrix();
  pushMatrix(g_modelMatrix);
  g_modelMatrix.scale(0.2, 0.2, 0.2);
  g_modelMatrix.translate(2,7,-2)
  g_modelMatrix.translate(0,0.3 * Math.sin(g_pos_sphere_now),0)
  g_modelMatrix.rotate(-90, 1, 0, 0)
  drawSphere()
  g_modelMatrix = popMatrix();
  pushMatrix(g_modelMatrix);
  g_modelMatrix.scale(0.3, 0.3, 0.3);
  g_modelMatrix.translate(-4,1,0)
  g_modelMatrix.rotate(-90, 1, 0, 0)
  drawCylinder()
  g_modelMatrix = popMatrix();
}

function drawPlane() {
  g_modelMatrix.rotate(-30, 1, 0, 0)
  g_modelMatrix.rotate(90, 0, 1, 0);
  drawCord()
  drawBody();
  g_modelMatrix.translate(0, 0, 0.5);
  g_modelMatrix.scale(0.15, 0.15, 0.15)
  g_modelMatrix.rotate(90, 0, 1, 0);
  g_modelMatrix.rotate(g_angle_paddle_now, 1, 0, 0);
  drawCord()
  drawPaddle()
  g_modelMatrix.rotate(90, 1, 0, 0);
  drawCord()
  drawPaddle()
  g_modelMatrix.rotate(90, 1, 0, 0);
  drawCord()
  drawPaddle()
  g_modelMatrix.rotate(90, 1, 0, 0);
  drawCord()
  drawPaddle()
}

function drawRadar() {
  g_modelMatrix.scale(0.2, 0.2, 0.2)
  g_modelMatrix.rotate(-90, 1, 0, 0)
  drawCord()
  drawBase()
  g_modelMatrix.translate(0, 0, 1);
  g_modelMatrix.rotate(g_angle_frame_now, 0, 0, 1)
  drawCord()
  drawFrame()
  g_modelMatrix.translate(0, 0, 0.5);
  g_modelMatrix.rotate(g_angle_panel_now, 1, 0, 0)
  g_modelMatrix.rotate(g_angle_panel_aspect - 90, 1, 0, 0)
  // g_modelMatrix.scale(0.5, 0.5, 0.5);
  drawCord()
  drawPanel()
  g_modelMatrix.scale(0.5, 0.5, 0.5)
  g_modelMatrix.rotate(90, 1, 0, 0)
  g_modelMatrix.translate(0, 0.5, 0);
  g_modelMatrix.rotate(g_angle_paddle_now, 0, 1, 0)
  drawCord()
  drawPanel()
}

function drawBody() {
  gl.uniformMatrix4fv(uLoc_modelMatrix, false, g_modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, g_body_vertCount);
}

function drawPaddle() {
  gl.uniformMatrix4fv(uLoc_modelMatrix, false, g_modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, g_body_vertCount, g_paddle_vertCount);
}

function drawBase() {
  gl.uniformMatrix4fv(uLoc_modelMatrix, false, g_modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, g_body_vertCount + g_paddle_vertCount, g_base_vertCount);
}

function drawFrame() {
  gl.uniformMatrix4fv(uLoc_modelMatrix, false, g_modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, g_body_vertCount + g_paddle_vertCount + g_base_vertCount, g_frame_vertCount);
}

function drawPanel() {
  gl.uniformMatrix4fv(uLoc_modelMatrix, false, g_modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, g_body_vertCount + g_paddle_vertCount + g_base_vertCount + g_frame_vertCount, g_panel_vertCount);
}

function drawGrid() {
  gl.uniformMatrix4fv(uLoc_modelMatrix, false, g_modelMatrix.elements);
  gl.drawArrays(gl.LINES, g_body_vertCount + g_paddle_vertCount + g_base_vertCount + g_frame_vertCount + g_panel_vertCount, g_ground_vertCount);
}

function drawCord() {
  gl.uniformMatrix4fv(uLoc_modelMatrix, false, g_modelMatrix.elements);
  gl.drawArrays(gl.LINES, g_body_vertCount + g_paddle_vertCount + g_base_vertCount + g_frame_vertCount + g_panel_vertCount + g_ground_vertCount, g_cord_vertCount);
}

function drawSphere() {
  gl.uniformMatrix4fv(uLoc_modelMatrix, false, g_modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, g_body_vertCount + g_paddle_vertCount + g_base_vertCount + g_frame_vertCount + g_panel_vertCount + g_ground_vertCount + g_cord_vertCount, g_sphere_vertCount);
}

function drawCylinder() {
  gl.uniformMatrix4fv(uLoc_modelMatrix, false, g_modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, g_body_vertCount + g_paddle_vertCount + g_base_vertCount + g_frame_vertCount + g_panel_vertCount + g_ground_vertCount + g_cord_vertCount + g_sphere_vertCount, g_cylinder_vertCount);
}

function panel_runStop() {

  if (g_angle_panel_brake > 0.5) {
    g_angle_panel_brake = 0.0;
    document.getElementById("A0button").value = "Radar panel OFF";
  } else {
    g_angle_panel_brake = 1.0;
    document.getElementById("A0button").value = "Radar panel ON";
  }
}

function frame_runStop() {

  if (g_angle_frame_brake > 0.5) {
    g_angle_frame_brake = 0.0;
    document.getElementById("A1button").value = "Radar frame OFF";
  } else {
    g_angle_frame_brake = 1.0;
    document.getElementById("A1button").value = "Radar frame ON";
  }
}

function update_panel_range(value) {
  g_isSlide = true;
  g_angle_panel_range = value;
  g_angle_panel_min = -value / 2;
  g_angle_panel_max = value / 2;
  document.getElementById('Range').innerHTML = g_angle_panel_range
}

function update_panel_aspect(value) {
  g_isSlide = true;
  g_angle_panel_aspect = value;
  document.getElementById('Aspect').innerHTML = g_angle_panel_aspect
}

function myMouseDown(ev) {
  var rect = ev.target.getBoundingClientRect();
  var xp = ev.clientX - rect.left;
  var yp = g_canvasID.height - (ev.clientY - rect.top);
  var x = (xp - g_canvasID.width / 2) /
    (g_canvasID.width / 2);
  var y = (yp - g_canvasID.height / 2) /
    (g_canvasID.height / 2);
  g_isDrag = true;
  g_xMclik = x;
  g_yMclik = y;
}

function myMouseMove(ev) {
  if (g_isSlide) return;
  if (g_isDrag === false) return;
  var rect = ev.target.getBoundingClientRect();
  var xp = ev.clientX - rect.left;
  var yp = g_canvasID.height - (ev.clientY - rect.top);
  var x = (xp - g_canvasID.width / 2) /
    (g_canvasID.width / 2);
  var y = (yp - g_canvasID.height / 2) /
    (g_canvasID.height / 2);
  g_xMdragTot += (x - g_xMclik);
  g_yMdragTot += (y - g_yMclik);
  dragQuat(x - g_xMclik, g_yMclik - y);
  g_xMclik = x;
  g_yMclik = y;
}

function myMouseUp(ev) {
  var rect = ev.target.getBoundingClientRect();
  var xp = ev.clientX - rect.left;
  var yp = g_canvasID.height - (ev.clientY - rect.top);
  var x = (xp - g_canvasID.width / 2) /
    (g_canvasID.width / 2);
  var y = (yp - g_canvasID.height / 2) /
    (g_canvasID.height / 2);
  console.log('myMouseUp  (CVV coords  ):\n\t x, y=\t', x, ',\t', y);
  g_isDrag = false;
  if (g_isSlide) {
    g_isSlide = false;
  } else {
    g_xMdragTot += (x - g_xMclik);
    g_yMdragTot += (y - g_yMclik);
  }
  dragQuat(x - g_xMclik, g_yMclik - y);
}

function dragQuat(xdrag, ydrag) {
//==============================================================================
// Called when user drags mouse by 'xdrag,ydrag' as measured in CVV coords.
// We find a rotation axis perpendicular to the drag direction, and convert the
// drag distance to an angular rotation amount, and use both to set the value of
// the quaternion qNew.  We then combine this new rotation with the current
// rotation stored in quaternion 'qTot' by quaternion multiply.  Note the
// 'draw()' function converts this current 'qTot' quaternion to a rotation
// matrix for drawing.
  var res = 5;
  var qTmp = new Quaternion(0, 0, 0, 1);

  var dist = Math.sqrt(xdrag * xdrag + ydrag * ydrag);
  // console.log('xdrag,ydrag=',xdrag.toFixed(5),ydrag.toFixed(5),'dist=',dist.toFixed(5));
  qNew.setFromAxisAngle(Math.cos(g_view_angel) * (-ydrag) + 0.0001, xdrag + 0.0001, Math.sin(g_view_angel) * (ydrag), dist * 150.0);
  // (why add tiny 0.0001? To ensure we never have a zero-length rotation axis)
  // why axis (x,y,z) = (-yMdrag,+xMdrag,0)?
  // -- to rotate around +x axis, drag mouse in -y direction.
  // -- to rotate around +y axis, drag mouse in +x direction.

  qTmp.multiply(qNew, qTot);			// apply new rotation to current rotation.
  //--------------------------
  // IMPORTANT! Why qNew*qTot instead of qTot*qNew? (Try it!)
  // ANSWER: Because 'duality' governs ALL transformations, not just matrices.
  // If we multiplied in (qTot*qNew) order, we would rotate the drawing axes
  // first by qTot, and then by qNew--we would apply mouse-dragging rotations
  // to already-rotated drawing axes.  Instead, we wish to apply the mouse-drag
  // rotations FIRST, before we apply rotations from all the previous dragging.
  //------------------------
  // IMPORTANT!  Both qTot and qNew are unit-length quaternions, but we store
  // them with finite precision. While the product of two (EXACTLY) unit-length
  // quaternions will always be another unit-length quaternion, the qTmp length
  // may drift away from 1.0 if we repeat this quaternion multiply many times.
  // A non-unit-length quaternion won't work with our quaternion-to-matrix fcn.
  // Matrix4.prototype.setFromQuat().
//	qTmp.normalize();						// normalize to ensure we stay at length==1.0.
  qTot.copy(qTmp);

};

function myKeyDown(kev) {
  switch (kev.code) {
    case "KeyX":
      g_angle_plane_rate += 10
      document.getElementById('Speed').innerHTML = "Speed: " + g_angle_plane_rate
      break;
    case "KeyZ":
      if (g_angle_plane_rate - 10 > 0) {
        g_angle_plane_rate -= 10
        document.getElementById('Speed').innerHTML = "Speed: " + g_angle_plane_rate
      } else {
        document.getElementById('Speed').innerHTML = "Speed: too low"
      }
      break
    case "ArrowLeft":
      var last_x = r * Math.sin(g_view_angel)
      var last_y = r * (Math.cos(g_view_angel) - 1)
      g_view_angel += Math.PI/60
      g_camera_look[0] += r * Math.sin(g_view_angel) - last_x
      g_camera_look[2] += r * (Math.cos(g_view_angel) - 1) - last_y
      console.log(r + " " + g_camera_look[0] + " " + g_camera_look[2])
      break;
    case "ArrowRight":
      var last_x = r * Math.sin(g_view_angel)
      var last_y = r * (Math.cos(g_view_angel) - 1)
      g_view_angel -= Math.PI/60
      g_camera_look[0] += r * Math.sin(g_view_angel) - last_x
      g_camera_look[2] += r * (Math.cos(g_view_angel) - 1) - last_y
      console.log(r + " " + g_camera_look[0] + " " + g_camera_look[2])
      break;
    case "ArrowUp":
      g_camera_look[1] += 0.1
      break;
    case "ArrowDown":
      g_camera_look[1] -= 0.1
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
      g_camera_look[0] += 0.1 * Math.cos(g_view_angel)
      g_camera_pos[0] += 0.1 * Math.cos(g_view_angel)
      g_camera_look[2] -= 0.1 * Math.sin(g_view_angel)
      g_camera_pos[2] -= 0.1 * Math.sin(g_view_angel)
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
      g_camera_look[0] -= 0.1 * Math.cos(g_view_angel)
      g_camera_pos[0] -= 0.1 * Math.cos(g_view_angel)
      g_camera_look[2] += 0.1 * Math.sin(g_view_angel)
      g_camera_pos[2] += 0.1 * Math.sin(g_view_angel)
      break;
    default:
      break;
  }
}

function resizeCanvas() {
  g_canvasID.width = innerWidth;
  g_canvasID.height = innerHeight / 2;
  drawAll();
}