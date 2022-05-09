
function generatePaddleVert() {
  var dot1 = [0, 0, 0, 1.0, 0.4, 0.4, 0.4]
  var dot2 = [0, 0.2, 0.25, 1.0, 0.7, 0.7, 0.7]

  var dot3 = [-0.05, 0.1, 1, 1.0, 0.4, 0.4, 0.4]
  var dot4 = [-0.05, 0, 1, 1.0, 0.4, 0.4, 0.4]
  var dot5 = [0.05, 0, 1, 1.0, 0.4, 0.4, 0.4]
  var dot6 = [0.05, 0.1, 1, 1.0, 0.4, 0.4, 0.4]

  var dot7 = [0, 0.17, 0.95, 1.0, 0.7, 0.7, 0.7]

  return [
    dot4, dot1, dot3, dot2, dot7, dot2, dot6, dot1, dot5, dot4, dot3, dot6, dot5
  ].flat();
}