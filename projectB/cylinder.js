function makeCylinder() {
//==============================================================================
// Make a cylinder shape from one TRIANGLE_STRIP drawing primitive, using the
// 'stepped spiral' design described in notes.
// Cylinder center at origin, encircles z axis, radius 1, top/bottom at z= +/-1.
//
  var ctrColr = new Float32Array([0.2, 0.2, 0.2]);	// dark gray
  var topColr = new Float32Array([0.4, 0.7, 0.4]);	// light green
  var botColr = new Float32Array([0.5, 0.5, 1.0]);	// light blue
  var capVerts = 16;	// # of vertices around the topmost 'cap' of the shape
  var botRadius = 1.6;		// radius of bottom of cylinder (top always 1.0)

  // Create a (global) array to hold this cylinder's vertices;
  cylVerts = new Float32Array(  ((capVerts*6) -2) * 7);
  // # of vertices * # of elements needed to store them.

  // Create circle-shaped top cap of cylinder at z=+1.0, radius 1.0
  // v counts vertices: j counts array elements (vertices * elements per vertex)
  for(v=1,j=0; v<2*capVerts; v++,j+=7) {
    // skip the first vertex--not needed.
    if(v%2==0)
    {				// put even# vertices at center of cylinder's top cap:
      cylVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,1,1
      cylVerts[j+1] = 0.0;
      cylVerts[j+2] = 1.0;
      cylVerts[j+3] = 1.0;			// r,g,b = topColr[]
      cylVerts[j+4]=ctrColr[0];
      cylVerts[j+5]=ctrColr[1];
      cylVerts[j+6]=ctrColr[2];
    }
    else { 	// put odd# vertices around the top cap's outer edge;
      // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
      // 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
      cylVerts[j  ] = Math.cos(Math.PI*(v-1)/capVerts);			// x
      cylVerts[j+1] = Math.sin(Math.PI*(v-1)/capVerts);			// y
      //	(Why not 2*PI? because 0 < =v < 2*capVerts, so we
      //	 can simplify cos(2*PI * (v-1)/(2*capVerts))
      cylVerts[j+2] = 1.0;	// z
      cylVerts[j+3] = 1.0;	// w.
      // r,g,b = topColr[]
      cylVerts[j+4]=topColr[0];
      cylVerts[j+5]=topColr[1];
      cylVerts[j+6]=topColr[2];
    }
  }
  // Create the cylinder side walls, made of 2*capVerts vertices.
  // v counts vertices within the wall; j continues to count array elements
  for(v=0; v< 2*capVerts; v++, j+=7) {
    if(v%2==0)	// position all even# vertices along top cap:
    {
      cylVerts[j  ] = Math.cos(Math.PI*(v)/capVerts);		// x
      cylVerts[j+1] = Math.sin(Math.PI*(v)/capVerts);		// y
      cylVerts[j+2] = 1.0;	// z
      cylVerts[j+3] = 1.0;	// w.
      // r,g,b = topColr[]
      cylVerts[j+4]=topColr[0];
      cylVerts[j+5]=topColr[1];
      cylVerts[j+6]=topColr[2];
    }
    else		// position all odd# vertices along the bottom cap:
    {
      cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v-1)/capVerts);		// x
      cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v-1)/capVerts);		// y
      cylVerts[j+2] =-1.0;	// z
      cylVerts[j+3] = 1.0;	// w.
      // r,g,b = topColr[]
      cylVerts[j+4]=botColr[0];
      cylVerts[j+5]=botColr[1];
      cylVerts[j+6]=botColr[2];
    }
  }
  // Create the cylinder bottom cap, made of 2*capVerts -1 vertices.
  // v counts the vertices in the cap; j continues to count array elements
  for(v=0; v < (2*capVerts -1); v++, j+= 7) {
    if(v%2==0) {	// position even #'d vertices around bot cap's outer edge
      cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v)/capVerts);		// x
      cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v)/capVerts);		// y
      cylVerts[j+2] =-1.0;	// z
      cylVerts[j+3] = 1.0;	// w.
      // r,g,b = topColr[]
      cylVerts[j+4]=botColr[0];
      cylVerts[j+5]=botColr[1];
      cylVerts[j+6]=botColr[2];
    }
    else {				// position odd#'d vertices at center of the bottom cap:
      cylVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,-1,1
      cylVerts[j+1] = 0.0;
      cylVerts[j+2] =-1.0;
      cylVerts[j+3] = 1.0;			// r,g,b = botColr[]
      cylVerts[j+4]=botColr[0];
      cylVerts[j+5]=botColr[1];
      cylVerts[j+6]=botColr[2];
    }
  }
  return Array.from(cylVerts)
}