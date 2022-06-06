function generateTetrahedron(){
  var c30 = Math.sqrt(0.75);					// == cos(30deg) == sqrt(3) / 2
  var sq2	= Math.sqrt(2.0);
// for surface normals:
  var sq23 = Math.sqrt(2.0/3.0)
  var sq29 = Math.sqrt(2.0/9.0)
  var sq89 = Math.sqrt(8.0/9.0)
  var thrd = 1.0/3.0;

  var colorShapes = new Float32Array([
    // Vertex coordinates(x,y,z,w) and color (R,G,B) for a new color tetrahedron:
    // HOW TO BUILD A SYMMETRICAL TETRAHEDRON:
    //	--define it by 4 'nodes' (locations where we place 1 or more vertices).
    //	--Each node connects to every other node by an 'edge'.
    //	--Any 3 nodes chosen will form an equilateral triangle from 3 edges.
    //	--Every corner of every equilateral triangle forms a 60 degree angle.
    //	--We can define the 'center' of an equilateral triangle as the point
    //		location equally distant from each triangle corner.
    //		Equivalently, the center point is the intersection of the lines that
    //		bisect the 60-degree angles at each corner of the triangle.
    //	--Begin by defining an equilateral triangle in xy plane with center point
    //		at the origin. Create each node by adding a unit vector to the origin;
    //		node n1 at (0,1,0);
    //	  node n2 at ( cos30, -0.5, 0)  (30 degrees below x axis)
    //		node n3 at (-cos30, -0.5, 0)  (Note that cos30 = sqrt(3)/2).
    //	--Note the triangle's 'height' in y is 1.5 (from y=-0.5 to y= +1.0).
    //	--Choose node on +z axis at location that will form equilateral triangles
    //		with the sides of the n1,n2,n3 triangle edges.
    //	--Look carefully at the n0,n3,n1 triangle; its height (1.5) stretches from
    //		(0,-0.5,0) to node n0 at (0,0,zheight).  Thus 1.5^2 = 0.5^2 + zheight^2,
    //		or 2.25 = 0.25 + zHeight^2; thus zHeight==sqrt2.
    // 		node n0 == Apex on +z axis; equilateral triangle base at z=0.
    //  -- SURFACE NORMALS?
    //		See: '2016.02.17.HowToBuildTetrahedron.pdf' on Canvas
    //
    /*	Nodes:
         0.0,	 0.0, sq2, 1.0,			0.0, 	0.0,	1.0,	// Node 0 (apex, +z axis;  blue)
         c30, -0.5, 0.0, 1.0, 		1.0,  0.0,  0.0, 	// Node 1 (base: lower rt; red)
         0.0,  1.0, 0.0, 1.0,  		0.0,  1.0,  0.0,	// Node 2 (base: +y axis;  grn)
        -c30, -0.5, 0.0, 1.0, 		1.0,  1.0,  1.0, 	// Node 3 (base:lower lft; white)
    */

// Face 0: (right side).  Unit Normal Vector: N0 = (sq23, sq29, thrd)
    // Node 0 (apex, +z axis; 			color--blue, 				surf normal (all verts):
    0.0,	 0.0, sq2, 1.0,			sq23,	sq29, thrd, 1.0,
    // Node 1 (base: lower rt; red)
    c30, -0.5, 0.0, 1.0, 			sq23,	sq29, thrd, 1.0,
    // Node 2 (base: +y axis;  grn)
    0.0,  1.0, 0.0, 1.0,  		sq23,	sq29, thrd, 1.0,
// Face 1: (left side).		Unit Normal Vector: N1 = (-sq23, sq29, thrd)
    // Node 0 (apex, +z axis;  blue)
    0.0,	 0.0, sq2, 1.0,			-sq23,	sq29, thrd, 1.0,
    // Node 2 (base: +y axis;  grn)
    0.0,  1.0, 0.0, 1.0,  		-sq23,	sq29, thrd, 1.0,
    // Node 3 (base:lower lft; white)
    -c30, -0.5, 0.0, 1.0, 		-sq23,	sq29,	thrd, 1.0,
// Face 2: (lower side) 	Unit Normal Vector: N2 = (0.0, -sq89, thrd)
    // Node 0 (apex, +z axis;  blue)
    0.0,	 0.0, sq2, 1.0,		0.0, -sq89,	thrd, 1.0,
    // Node 3 (base:lower lft; white)
    -c30, -0.5, 0.0, 1.0, 		0.0, -sq89,	thrd, 1.0,          																							//0.0, 0.0, 0.0, // Normals debug
    // Node 1 (base: lower rt; red)
    c30, -0.5, 0.0, 1.0, 			0.0, -sq89,	thrd, 1.0,
// Face 3: (base side)  Unit Normal Vector: N2 = (0.0, 0.0, -1.0)
    // Node 3 (base:lower lft; white)
    -c30, -0.5, 0.0, 1.0, 		0.0, 	0.0, -1.0, 1.0,
    // Node 2 (base: +y axis;  grn)
    0.0,  1.0, 0.0, 1.0,  		0.0, 	0.0, -1.0, 1.0,
    // Node 1 (base: lower rt; red)
    c30, -0.5, 0.0, 1.0, 			0.0, 	0.0, -1.0, 1.0,

  ]);
  return Array.from(colorShapes)
}