function generateBodyVert() {
  let r = 164 / 255
  let g = 168 / 255
  let b = 168 / 255
  var dot1 = [0, 0, 0.5, 1.0, r * 1.3, g * 1.3, b * 1.3]
  var dot2 = [-0.05, 0.05, 0.4, 1.0, r, g, b]
  var dot3 = [-0.05, -0.05, 0.4, 1.0, r * 1.3, g * 1.3, b * 1.3]
  var dot4 = [0.05, -0.05, 0.4, 1.0, r, g, b]
  var dot5 = [0.05, 0.05, 0.4, 1.0, r * 1.3, g * 1.3, b * 1.3]
  var dot6 = [-0.5, -0.05, -0.3, 1.0, r * 1.3, g * 1.3, b * 1.3]
  var dot7 = [-0.05, 0.005, -0.3, 1.0, r, g, b]
  var dot8 = [-0.05, -0.05, -0.3, 1.0, r, g, b]
  var dot9 = [0.05, -0.05, -0.3, 1.0, r, g, b]
  var dot10 = [0.05, 0.005, -0.3, 1.0, r * 1.3, g * 1.3, b * 1.3]
  var dot11 = [0.5, -0.05, -0.3, 1.0, r, g, b]
  var dot12 = [-0.05, 0.05, -0.5, 1.0, r, g, b]
  var dot13 = [-0.05, -0.05, -0.5, 1.0, r, g, b]
  var dot14 = [0.05, -0.05, -0.5, 1.0, r * 1.3, g * 1.3, b * 1.3]
  var dot15 = [0.05, 0.05, -0.5, 1.0, r * 1.3, g * 1.3, b * 1.3]

  return [
    dot1, dot3, dot4, dot5, dot1, dot2, dot3, dot12, dot13, dot15, dot14, dot5, dot4, dot3, dot14, dot13, dot12, dot15, dot2, dot5, dot4, dot10, dot11, dot9, dot4, dot3, dot7, dot6, dot8, dot3
  ].flat();
}