
function generateFrameVert() {
  let r4 = 74 / 255
  let g4 = 78 / 255
  let b4 = 0
  var dot1 = [-0.25, -0.25, -0.5, 1.0, r4 * 1.3, g4 * 1.3, b4 * 1.3]
  var dot2 = [-0.25, 0.25, -0.5, 1.0, r4, g4, b4]
  var dot3 = [0.25, 0.25, -0.5, 1.0, r4 * 1.3, g4 * 1.3, b4 * 1.3]
  var dot4 = [0.25, -0.25, -0.5, 1.0, r4, g4, b4]
  var dot5 = [-0.25, -0.25, -0.3, 1.0, r4 * 1.3, g4 * 1.3, b4 * 1.3]
  var dot6 = [-0.25, 0.25, -0.3, 1.0, r4, g4, b4]
  var dot7 = [0.25, 0.25, -0.3, 1.0, r4 * 1.3, g4 * 1.3, b4 * 1.3]
  var dot8 = [0.25, -0.25, -0.3, 1.0, r4, g4, b4]
  var dot9 = [0, -0.25, -0.3, 1.0, r4, g4, b4]
  var dot10 = [0, 0.25, -0.3, 1.0, r4 * 1.3, g4 * 1.3, b4 * 1.3]
  var dot11 = [-0.75, -0.25, -0.1, 1.0, r4 * 1.3, g4 * 1.3, b4 * 1.3]
  var dot12 = [-0.75, 0.25, -0.1, 1.0, r4, g4, b4]
  var dot13 = [-0.5, 0.25, -0.1, 1.0, r4 * 1.3, g4 * 1.3, b4 * 1.3]
  var dot14 = [-0.5, -0.25, -0.1, 1.0, r4, g4, b4]
  var dot15 = [0.5, -0.25, -0.1, 1.0, r4, g4, b4]
  var dot16 = [0.5, 0.25, -0.1, 1.0, r4, g4, b4]
  var dot17 = [0.75, 0.25, -0.1, 1.0, r4 * 1.3, g4 * 1.3, b4 * 1.3]
  var dot18 = [0.75, -0.25, -0.1, 1.0, r4, g4, b4]
  var dot19 = [-0.75, -0.25, 0.5, 1.0, r4 * 1.3, g4 * 1.3, b4 * 1.3]
  var dot20 = [-0.75, 0.25, 0.5, 1.0, r4, g4, b4]
  var dot21 = [-0.5, 0.25, 0.5, 1.0, r4 * 1.3, g4 * 1.3, b4 * 1.3]
  var dot22 = [-0.5, -0.25, 0.5, 1.0, r4, g4, b4]
  var dot23 = [0.5, -0.25, 0.5, 1.0, r4, g4, b4]
  var dot24 = [0.5, 0.25, 0.5, 1.0, r4, g4, b4]
  var dot25 = [0.75, 0.25, 0.5, 1.0, r4 * 1.3, g4 * 1.3, b4 * 1.3]
  var dot26 = [0.75, -0.25, 0.5, 1.0, r4, g4, b4]

  return [
    dot1, dot2, dot5, dot6, dot11, dot12, dot19, dot20, dot22, dot21, dot14, dot13, dot9, dot10, dot15, dot16, dot23, dot24, dot26, dot25, dot18, dot17, dot8, dot7, dot4, dot3, dot1, dot2, dot3, dot6, dot7, dot10, dot17, dot16, dot25, dot24, dot17, dot16, dot7, dot10, dot6, dot13, dot12, dot21, dot20, dot22, dot19, dot14, dot11, dot9, dot5, dot8, dot1, dot4, dot5, dot8, dot9, dot18, dot15, dot26, dot23
  ].flat();
}