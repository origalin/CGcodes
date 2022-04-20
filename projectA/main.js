var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_modelMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_modelMatrix * a_Position;\n' +
  '}\n';

var FSHADER_SOURCE =
  'void main() {\n' +
  '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
  '}\n';


var gl;
var g_canvasID;
var g_vertCount;
var g_body_vertCount;
var g_paddle_vertCount;
var g_base_vertCount;
var g_frame_vertCount;
var g_panel_vertCount;
var g_modelMatrix;
var uLoc_modelMatrix;
var g_lastMS = Date.now();

var g_angle_paddle_now = 0.0;
var g_angle_paddle_rate = 1000.0;

var g_angle_plane_now = 0.0;
var g_angle_plane_rate = 90.0;

var g_angle_frame_now = 0.0;
var g_angle_frame_rate = -22.0;
var g_angle_frame_brake = 1.0;

var g_angle_panel_now = 0.0;
var g_angle_panel_rate = 222.0;
var g_angle_panel_brake = 1.0;
var g_angle_panel_min = -30.0;
var g_angle_panel_max = 30.0;

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

  g_canvasID.width = window.innerHeight * 0.8
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

  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);
  gl.clearDepth(0.0);
  gl.depthFunc(gl.GREATER);
  g_modelMatrix = new Matrix4();

  uLoc_modelMatrix = gl.getUniformLocation(gl.program, 'u_modelMatrix');
  if (!uLoc_modelMatrix) {
    console.log('Failed to get the storage location of u_modelMatrix');
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
  var dot1 = [-0.25, -0.25, -0.5, 1.0]
  var dot2 = [-0.25, 0.25, -0.5, 1.0]
  var dot3 = [0.25, 0.25, -0.5, 1.0]
  var dot4 = [0.25, -0.25, -0.5, 1.0]
  var dot5 = [-0.25, -0.25, 0.5, 1.0]
  var dot6 = [-0.25, 0.25, 0.5, 1.0]
  var dot7 = [0.25, 0.25, 0.5, 1.0]
  var dot8 = [0.25, -0.25, 0.5, 1.0]

  var dot21 = [-0.25, -0.25, 0, 1.0]
  var dot22 = [-0.25, 0.25, 0, 1.0]
  var dot23 = [0.25, 0.25, 0, 1.0]
  var dot24 = [0.25, -0.25, 0, 1.0]
  var dot25 = [-0.25, -0.25, 1, 1.0]
  var dot26 = [-0.25, 0.25, 1, 1.0]
  var dot27 = [0.25, 0.25, 1, 1.0]
  var dot28 = [0.25, -0.25, 1, 1.0]

  var dot31 = [-0.5, -0.5, -0.5, 1.0]
  var dot32 = [-0.5, 0.5, -0.5, 1.0]
  var dot33 = [0.5, 0.5, -0.5, 1.0]
  var dot34 = [0.5, -0.5, -0.5, 1.0]
  var dot35 = [-0.5, -0.5, 0.5, 1.0]
  var dot36 = [-0.5, 0.5, 0.5, 1.0]
  var dot37 = [0.5, 0.5, 0.5, 1.0]
  var dot38 = [0.5, -0.5, 0.5, 1.0]

  var dot41 = [-0.5, -0.5, -0.5, 1.0]
  var dot42 = [-0.5, 0.5, -0.5, 1.0]
  var dot43 = [0.5, 0.5, -0.5, 1.0]
  var dot44 = [0.5, -0.5, -0.5, 1.0]
  var dot45 = [-0.5, -0.5, 0.5, 1.0]
  var dot46 = [-0.5, 0.5, 0.5, 1.0]
  var dot47 = [0.5, 0.5, 0.5, 1.0]
  var dot48 = [0.5, -0.5, 0.5, 1.0]

  var dot51 = [-0.5, -0.5, -0.5, 1.0]
  var dot52 = [-0.5, 0.5, -0.5, 1.0]
  var dot53 = [0.5, 0.5, -0.5, 1.0]
  var dot54 = [0.5, -0.5, -0.5, 1.0]
  var dot55 = [-0.5, -0.5, 0.5, 1.0]
  var dot56 = [-0.5, 0.5, 0.5, 1.0]
  var dot57 = [0.5, 0.5, 0.5, 1.0]
  var dot58 = [0.5, -0.5, 0.5, 1.0]

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

  var base_vert = [
    dot31, dot32, dot32, dot33, dot33, dot34, dot34, dot31,
    dot35, dot36, dot36, dot37, dot37, dot38, dot38, dot35,
    dot31, dot35, dot32, dot36, dot33, dot37, dot34, dot38
  ].flat()

  var frame_vert = [
    dot41, dot42, dot42, dot43, dot43, dot44, dot44, dot41,
    dot45, dot46, dot46, dot47, dot47, dot48, dot48, dot45,
    dot41, dot45, dot42, dot46, dot43, dot47, dot44, dot48
  ].flat()

  var panel_vert = [
    dot51, dot52, dot52, dot53, dot53, dot54, dot54, dot51,
    dot55, dot56, dot56, dot57, dot57, dot58, dot58, dot55,
    dot51, dot55, dot52, dot56, dot53, dot57, dot54, dot58
  ].flat()

  var vertices = new Float32Array([body_vert, paddle_vert, base_vert, frame_vert, panel_vert].flat());
  g_vertCount = vertices.length / 4;
  g_body_vertCount = body_vert.length / 4;
  g_paddle_vertCount = paddle_vert.length / 4;
  g_base_vertCount = base_vert.length / 4
  g_frame_vertCount = frame_vert.length / 4
  g_panel_vertCount = panel_vert.length / 4

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
  gl.vertexAttribPointer(aLoc_Position, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aLoc_Position);
  return 0;
}

function drawAll() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  g_modelMatrix.setIdentity();

  g_modelMatrix.rotate(15, 1, 1, 0);
  var dist = Math.sqrt(g_xMdragTot * g_xMdragTot + g_yMdragTot * g_yMdragTot);
  g_modelMatrix.rotate(dist * 50.0, -g_yMdragTot + 0.0001, g_xMdragTot + 0.0001, 0.0);

  pushMatrix(g_modelMatrix);
  g_modelMatrix.translate(Math.sin(g_angle_plane_now / 180.0 * Math.PI) * 0.5, 0.3, Math.cos(g_angle_plane_now / 180.0 * Math.PI) * 0.5);
  g_modelMatrix.rotate(g_angle_plane_now, 0, 1, 0)
  g_modelMatrix.scale(0.3, 0.3, 0.3);
  drawPlane();
  g_modelMatrix = popMatrix();

  pushMatrix(g_modelMatrix);
  g_modelMatrix.translate(0, -0.3, 0);
  drawRadar()
  g_modelMatrix = popMatrix();
}


function drawPlane() {
  g_modelMatrix.rotate(-30, 1, 0, 0)
  g_modelMatrix.rotate(90, 0, 1, 0);
  drawBody();
  g_modelMatrix.translate(0, 0, 0.5);
  g_modelMatrix.scale(0.2, 0.2, 0.2)
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
  g_modelMatrix.scale(0.5, 0.5, 0.5);
  drawPanel()
}

function drawBody() {
  gl.uniformMatrix4fv(uLoc_modelMatrix, false, g_modelMatrix.elements);
  gl.drawArrays(gl.LINES, 0, g_body_vertCount);
}

function drawPaddle() {
  gl.uniformMatrix4fv(uLoc_modelMatrix, false, g_modelMatrix.elements);
  gl.drawArrays(gl.LINES, g_body_vertCount, g_paddle_vertCount);
}

function drawBase() {
  gl.uniformMatrix4fv(uLoc_modelMatrix, false, g_modelMatrix.elements);
  gl.drawArrays(gl.LINES, g_body_vertCount + g_paddle_vertCount, g_base_vertCount);
}

function drawFrame() {
  gl.uniformMatrix4fv(uLoc_modelMatrix, false, g_modelMatrix.elements);
  gl.drawArrays(gl.LINES, g_body_vertCount + g_paddle_vertCount + g_base_vertCount, g_frame_vertCount);
}

function drawPanel() {
  gl.uniformMatrix4fv(uLoc_modelMatrix, false, g_modelMatrix.elements);
  gl.drawArrays(gl.LINES, g_body_vertCount + g_paddle_vertCount + g_base_vertCount + g_frame_vertCount, g_panel_vertCount);
}

function A0_runStop() {

  if (g_angle_panel_brake > 0.5) {
    g_angle_panel_brake = 0.0;
    document.getElementById("A0button").value = "Radar panel OFF";
  } else {
    g_angle_panel_brake = 1.0;
    document.getElementById("A0button").value = "Radar panel ON";
  }
}

function A1_runStop() {

  if (g_angle_frame_brake > 0.5) {
    g_angle_frame_brake = 0.0;
    document.getElementById("A1button").value = "Radar frame OFF";
  } else {
    g_angle_frame_brake = 1.0;
    document.getElementById("A1button").value = "Radar frame ON";
  }
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
  g_xMdragTot += (x - g_xMclik);
  g_yMdragTot += (y - g_yMclik);
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
