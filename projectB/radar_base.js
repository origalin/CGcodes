function generateBaseVert() {
  let h = 0.5 / 2 * Math.sqrt(3)
  let r3 = 84 / 255
  let g3 = 88 / 255
  let b3 = 1 / 255
  var dot1 = [-0.5, 2 * h, -0.5, 1.0, r3, g3, b3]
  var dot2 = [0.5, 2 * h, -0.5, 1.0, r3 * 1.3, g3 * 1.3, b3 * 1.3]
  var dot3 = [1, 0, -0.5, 1.0, r3, g3, b3]
  var dot4 = [0.5, -2 * h, -0.5, 1.0, r3 * 1.3, g3 * 1.3, b3 * 1.3]
  var dot5 = [-0.5, -2 * h, -0.5, 1.0, r3, g3, b3]
  var dot6 = [-1, 0, -0.5, 1.0, r3 * 1.3, g3 * 1.3, b3 * 1.3]
  var dot7 = [-0.25, h, 0.5, 1.0, r3, g3, b3]
  var dot8 = [0.25, h, 0.5, 1.0, r3 * 1.3, g3 * 1.3, b3 * 1.3]
  var dot9 = [0.5, 0, 0.5, 1.0, r3, g3, b3]
  var dot10 = [0.25, -h, 0.5, 1.0, r3 * 1.3, g3 * 1.3, b3 * 1.3]
  var dot11 = [-0.25, -h, 0.5, 1.0, r3, g3, b3]
  var dot12 = [-0.5, 0, 0.5, 1.0, r3 * 1.3, g3 * 1.3, b3 * 1.3]

  return [
    dot1, dot7, dot2, dot8, dot3, dot9, dot4, dot10, dot5, dot11, dot6, dot12, dot1, dot7, dot12, dot8, dot11, dot9, dot10, dot4, dot3, dot5, dot2, dot6, dot1
  ].flat();
}