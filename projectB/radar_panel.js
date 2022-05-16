function generatePanelVert(){
  let h5 = 0.5 / 2 * Math.sqrt(3)
  let r5 = 134 / 255
  let g5 = 138 / 255
  let b5 = 138 / 255
  var dot51 = [-0.25, h5, -0.1, 1.0, r5, g5, b5]
  var dot52 = [0.25, h5, -0.1, 1.0, r5 * 1.3, g5 * 1.3, b5 * 1.3]
  var dot53 = [0.5, 0, -0.1, 1.0, r5, g5, b5]
  var dot54 = [0.25, -h5, -0.1, 1.0, r5 * 1.3, g5 * 1.3, b5 * 1.3]
  var dot55 = [-0.25, -h5, -0.1, 1.0, r5, g5, b5]
  var dot56 = [-0.5, 0, -0.1, 1.0, r5 * 1.3, g5 * 1.3, b5 * 1.3]
  var dot57 = [-0.25, h5, 0.1, 1.0, r5, g5, b5]
  var dot58 = [0.25, h5, 0.1, 1.0, r5 * 1.3, g5 * 1.3, b5 * 1.3]
  var dot59 = [0.5, 0, 0.1, 1.0, r5, g5, b5]
  var dot510 = [0.25, -h5, 0.1, 1.0, r5 * 1.3, g5 * 1.3, b5 * 1.3]
  var dot511 = [-0.25, -h5, 0.1, 1.0, r5, g5, b5]
  var dot512 = [-0.5, 0, 0.1, 1.0, r5 * 1.3, g5 * 1.3, b5 * 1.3]

  return [
    dot51, dot57, dot52, dot58, dot53, dot59, dot54, dot510, dot55, dot511, dot56, dot512, dot51, dot57, dot512, dot58, dot511, dot59, dot510, dot54, dot53, dot55, dot52, dot56, dot51
  ].flat()
}