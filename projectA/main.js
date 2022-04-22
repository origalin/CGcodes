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
var g_paddle_vert1Count;
var g_paddle_vert2Count;
var g_base_vertCount;
var g_frame_vertCount;
var g_panel_vertCount;
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

var g_isSlide = false

var g_isDrag = false;
var g_xMclik = 0.0;
var g_yMclik = 0.0;
var g_xMdragTot = 0.0;
var g_yMdragTot = 0.0;

function main() {
  window.addEventListener("mousedown", myMouseDown);
  window.addEventListener("mousemove", myMouseMove);
  window.addEventListener("mouseup", myMouseUp);
  window.addEventListener("keydown", myKeyDown, false);
  document.getElementById('Speed').innerHTML = "Speed: " + g_angle_plane_rate

  g_canvasID = document.getElementById('webgl');

  g_canvasID.width = window.innerHeight * 0.7
  g_canvasID.height = g_canvasID.width

  gl = g_canvasID.getContext("webgl", {preserveDrawingBuffer: true});

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

  gl.clearColor(135/255,206/255,250/255, 1);
  gl.enable(gl.DEPTH_TEST);
  gl.clearDepth(0.0);
  gl.depthFunc(gl.GREATER);
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
}

function initVertexBuffers() {
  let r = 164/255
  let g = 168/255
  let b = 168/255
  var dot1 = [0, 0, 0.5, 1.0,r*1.3,g*1.3,b*1.3]
  var dot2 = [-0.05, 0.05, 0.4, 1.0,r,g,b]
  var dot3 = [-0.05, -0.05, 0.4, 1.0,r*1.3,g*1.3,b*1.3]
  var dot4 = [0.05, -0.05, 0.4, 1.0,r,g,b]
  var dot5 = [0.05, 0.05, 0.4, 1.0,r*1.3,g*1.3,b*1.3]
  var dot6 = [-0.5, -0.05, -0.3, 1.0,r*1.3,g*1.3,b*1.3]
  var dot7 = [-0.05, 0.005, -0.3, 1.0,r,g,b]
  var dot8 = [-0.05, -0.05, -0.3, 1.0,r,g,b]
  var dot9 = [0.05, -0.05, -0.3, 1.0,r,g,b]
  var dot10 = [0.05, 0.005, -0.3, 1.0,r*1.3,g*1.3,b*1.3]
  var dot11 = [0.5, -0.05, -0.3, 1.0,r,g,b]
  var dot12 = [-0.05, 0.05, -0.5, 1.0,r,g,b]
  var dot13 = [-0.05, -0.05, -0.5, 1.0,r,g,b]
  var dot14 = [0.05, -0.05, -0.5, 1.0,r*1.3,g*1.3,b*1.3]
  var dot15 = [0.05, 0.05, -0.5, 1.0,r*1.3,g*1.3,b*1.3]


  var dot21 = [0,0,0,1.0,0.4,0.4,0.4]
  var dot22 = [0,0.2,0.25,1.0,0.7,0.7,0.7]

  var dot23 = [-0.05,0.1,1,1.0,0.4,0.4,0.4]
  var dot24 = [-0.05,0,1,1.0,0.4,0.4,0.4]
  var dot25 = [0.05,0,1,1.0,0.4,0.4,0.4]
  var dot26 = [0.05,0.1,1,1.0,0.4,0.4,0.4]

  var dot27 = [0,0.17,0.95,1.0,0.7,0.7,0.7]

  let h = 0.5 / 2 * Math.sqrt(3)
  let r3 = 84/255
  let g3 = 88/255
  let b3 = 1/255
  var dot31 = [-0.5, 2*h, -0.5, 1.0,r3,g3,b3]
  var dot32 = [0.5, 2*h, -0.5, 1.0,r3*1.3,g3*1.3,b3*1.3]
  var dot33 = [1, 0, -0.5, 1.0,r3,g3,b3]
  var dot34 = [0.5, -2*h, -0.5, 1.0,r3*1.3,g3*1.3,b3*1.3]
  var dot35 = [-0.5, -2*h, -0.5, 1.0,r3,g3,b3]
  var dot36 = [-1, 0, -0.5, 1.0,r3*1.3,g3*1.3,b3*1.3]
  var dot37 = [-0.25, h, 0.5, 1.0,r3,g3,b3]
  var dot38 = [0.25, h, 0.5, 1.0,r3*1.3,g3*1.3,b3*1.3]
  var dot39 = [0.5, 0, 0.5, 1.0,r3,g3,b3]
  var dot310 = [0.25, -h, 0.5, 1.0,r3*1.3,g3*1.3,b3*1.3]
  var dot311 = [-0.25, -h, 0.5, 1.0,r3,g3,b3]
  var dot312 = [-0.5, 0, 0.5, 1.0,r3*1.3,g3*1.3,b3*1.3]

  let r4 = 74/255
  let g4 = 78/255
  let b4 = 0
  var dot41 = [-0.25, -0.25, -0.5, 1.0,r4*1.3,g4*1.3,b4*1.3]
  var dot42 = [-0.25, 0.25, -0.5, 1.0,r4,g4,b4]
  var dot43 = [0.25, 0.25, -0.5, 1.0,r4*1.3,g4*1.3,b4*1.3]
  var dot44 = [0.25, -0.25, -0.5, 1.0,r4,g4,b4]
  var dot45 = [-0.25, -0.25, -0.3, 1.0,r4*1.3,g4*1.3,b4*1.3]
  var dot46 = [-0.25, 0.25, -0.3, 1.0,r4,g4,b4]
  var dot47 = [0.25, 0.25, -0.3, 1.0,r4*1.3,g4*1.3,b4*1.3]
  var dot48 = [0.25, -0.25, -0.3, 1.0,r4,g4,b4]
  var dot49 = [0, -0.25, -0.3, 1.0,r4,g4,b4]
  var dot410 = [0, 0.25, -0.3, 1.0,r4*1.3,g4*1.3,b4*1.3]
  var dot411 = [-0.75, -0.25, -0.1, 1.0,r4*1.3,g4*1.3,b4*1.3]
  var dot412 = [-0.75, 0.25, -0.1, 1.0,r4,g4,b4]
  var dot413 = [-0.5, 0.25, -0.1, 1.0,r4*1.3,g4*1.3,b4*1.3]
  var dot414 = [-0.5, -0.25, -0.1, 1.0,r4,g4,b4]
  var dot415 = [0.5, -0.25, -0.1, 1.0,r4,g4,b4]
  var dot416 = [0.5, 0.25, -0.1, 1.0,r4,g4,b4]
  var dot417 = [0.75, 0.25, -0.1, 1.0,r4*1.3,g4*1.3,b4*1.3]
  var dot418 = [0.75, -0.25, -0.1, 1.0,r4,g4,b4]
  var dot419 = [-0.75, -0.25, 0.5, 1.0,r4*1.3,g4*1.3,b4*1.3]
  var dot420 = [-0.75, 0.25, 0.5, 1.0,r4,g4,b4]
  var dot421 = [-0.5, 0.25, 0.5, 1.0,r4*1.3,g4*1.3,b4*1.3]
  var dot422 = [-0.5, -0.25, 0.5, 1.0,r4,g4,b4]
  var dot423 = [0.5, -0.25, 0.5, 1.0,r4,g4,b4]
  var dot424 = [0.5, 0.25, 0.5, 1.0,r4,g4,b4]
  var dot425 = [0.75, 0.25, 0.5, 1.0,r4*1.3,g4*1.3,b4*1.3]
  var dot426 = [0.75, -0.25, 0.5, 1.0,r4,g4,b4]

  let h5 = 0.5 / 2 * Math.sqrt(3)
  let r5 = 134/255
  let g5 = 138/255
  let b5 = 138/255
  var dot51 = [-0.25, h5, -0.1, 1.0,r5,g5,b5]
  var dot52 = [0.25, h5, -0.1, 1.0,r5*1.3,g5*1.3,b5*1.3]
  var dot53 = [0.5, 0, -0.1, 1.0,r5,g5,b5]
  var dot54 = [0.25, -h5, -0.1, 1.0,r5*1.3,g5*1.3,b5*1.3]
  var dot55 = [-0.25, -h5, -0.1, 1.0,r5,g5,b5]
  var dot56 = [-0.5, 0, -0.1, 1.0,r5*1.3,g5*1.3,b5*1.3]
  var dot57 = [-0.25, h5, 0.1, 1.0,r5,g5,b5]
  var dot58 = [0.25, h5, 0.1, 1.0,r5*1.3,g5*1.3,b5*1.3]
  var dot59 = [0.5, 0, 0.1, 1.0,r5,g5,b5]
  var dot510 = [0.25, -h5, 0.1, 1.0,r5*1.3,g5*1.3,b5*1.3]
  var dot511 = [-0.25, -h5, 0.1, 1.0,r5,g5,b5]
  var dot512 = [-0.5, 0, 0.1, 1.0,r5*1.3,g5*1.3,b5*1.3]

  var body_vert = [
    dot1,dot3,dot4,dot5,dot1,dot2,dot3,dot12,dot13,dot15,dot14,dot5,dot4,dot3,dot14,dot13,dot12,dot15,dot2,dot5,dot4,dot10,dot11,dot9,dot4,dot3,dot7,dot6,dot8,dot3
  ].flat()

  var paddle_vert = [
    dot24,dot21,dot23,dot22,dot27,dot22,dot26,dot21,dot25,dot24,dot23,dot26,dot25
  ].flat()

  var base_vert = [
    dot31,dot37,dot32,dot38,dot33,dot39,dot34,dot310,dot35,dot311,dot36,dot312,dot31,dot37,dot312,dot38,dot311,dot39,dot310,dot34,dot33,dot35,dot32,dot36,dot31
  ].flat()

  var frame_vert = [
    dot41,dot42,dot45,dot46,dot411,dot412,dot419,dot420,dot422,dot421,dot414,dot413,dot49,dot410,dot415,dot416,dot423,dot424,dot426,dot425,dot418,dot417,dot48,dot47,dot44,dot43,dot41,dot42,dot43,dot46,dot47,dot410,dot417,dot416,dot425,dot424,dot417,dot416,dot47,dot410,dot46,dot413,dot412,dot421,dot420,dot422,dot419,dot414,dot411,dot49,dot45,dot48,dot41,dot44,dot45,dot48,dot49,dot418,dot415,dot426,dot423
  ].flat()

  var panel_vert = [
    dot51,dot57,dot52,dot58,dot53,dot59,dot54,dot510,dot55,dot511,dot56,dot512,dot51,dot57,dot512,dot58,dot511,dot59,dot510,dot54,dot53,dot55,dot52,dot56,dot51
  ].flat()

  var vertices = new Float32Array([body_vert, paddle_vert, base_vert, frame_vert, panel_vert].flat());
  g_vertCount = vertices.length / 7;
  g_body_vertCount = body_vert.length / 7;
  console.log(g_body_vertCount)
  g_paddle_vertCount = paddle_vert.length / 7;
  g_base_vertCount = base_vert.length / 7
  g_frame_vertCount = frame_vert.length / 7
  g_panel_vertCount = panel_vert.length / 7

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
  if(a_Color < 0) {
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

  g_modelMatrix.rotate(15, 1, 1, 0);
  var dist = Math.sqrt(g_xMdragTot * g_xMdragTot + g_yMdragTot * g_yMdragTot);
  g_modelMatrix.rotate(dist * 50.0, -g_yMdragTot + 0.0001, g_xMdragTot + 0.0001, 0.0);

  pushMatrix(g_modelMatrix);
  g_modelMatrix.translate(Math.sin(g_angle_plane_now / 180.0 * Math.PI) * 0.5, 0.5, Math.cos(g_angle_plane_now / 180.0 * Math.PI) * 0.5);
  g_modelMatrix.rotate(g_angle_plane_now, 0, 1, 0)
  g_modelMatrix.scale(0.4, 0.4, 0.4);
  drawPlane();
  g_modelMatrix = popMatrix();

  pushMatrix(g_modelMatrix);
  g_modelMatrix.translate(0, -0.5, 0);
  drawRadar()
  g_modelMatrix = popMatrix();
}


function drawPlane() {
  g_modelMatrix.rotate(-30, 1, 0, 0)
  g_modelMatrix.rotate(90, 0, 1, 0);
  drawBody();
  g_modelMatrix.translate(0, 0, 0.5);
  g_modelMatrix.scale(0.15, 0.15, 0.15)
  g_modelMatrix.rotate(90, 0, 1, 0);
  g_modelMatrix.rotate(g_angle_paddle_now, 1, 0, 0);
  drawPaddle()
  g_modelMatrix.rotate(90, 1, 0, 0);
  drawPaddle()
  g_modelMatrix.rotate(90, 1, 0, 0);
  drawPaddle()
  g_modelMatrix.rotate(90, 1, 0, 0);
  drawPaddle()
}

function drawRadar() {
  g_modelMatrix.scale(0.2, 0.2, 0.2)
  g_modelMatrix.rotate(-90, 1, 0, 0)
  drawBase()
  g_modelMatrix.translate(0, 0, 1);
  g_modelMatrix.rotate(g_angle_frame_now, 0, 0, 1)
  drawFrame()
  g_modelMatrix.translate(0, 0, 0.5);
  g_modelMatrix.rotate(g_angle_panel_now, 1, 0, 0)
  g_modelMatrix.rotate(g_angle_panel_aspect - 90, 1, 0, 0)
  // g_modelMatrix.scale(0.5, 0.5, 0.5);
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
  } else{
    g_xMdragTot += (x - g_xMclik);
    g_yMdragTot += (y - g_yMclik);
  }
}

function myKeyDown(kev) {
  switch (kev.code) {
    case "ArrowUp":
      g_angle_plane_rate += 10
      document.getElementById('Speed').innerHTML = "Speed: " + g_angle_plane_rate
      break;
    case "ArrowDown":
      if (g_angle_plane_rate - 10 > 0) {
        g_angle_plane_rate -= 10
        document.getElementById('Speed').innerHTML = "Speed: " + g_angle_plane_rate
      } else {
        document.getElementById('Speed').innerHTML = "Speed: too low"
      }
      break;
    default:
      break;
  }
}
