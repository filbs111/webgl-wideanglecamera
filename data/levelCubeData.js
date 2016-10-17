
//from http://learningwebgl.com/blog/?p=507
var levelCubeData={
	vertices:[
      // Front face
      -1.0, -1.0,  1.0,
       1.0, -1.0,  1.0,
       1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,

      // Back face
      -1.0, -1.0, -1.0,
      -1.0,  1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0, -1.0, -1.0,

      // Top face
      -1.0,  1.0, -1.0,
      -1.0,  1.0,  1.0,
       1.0,  1.0,  1.0,
       1.0,  1.0, -1.0,

      // Bottom face
      -1.0, -1.0, -1.0,
       1.0, -1.0, -1.0,
       1.0, -1.0,  1.0,
      -1.0, -1.0,  1.0,

      // Right face
       1.0, -1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0,  1.0,  1.0,
       1.0, -1.0,  1.0,

      // Left face
      -1.0, -1.0, -1.0,
      -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0,  1.0, -1.0,
    ],	
	uvcoords:[
      // Front face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,

      // Back face
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,

      // Top face
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,

      // Bottom face
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,

      // Right face
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,

      // Left face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
    ],	
	indices:[
      0, 1, 2,      0, 2, 3,    // Front face
      4, 5, 6,      4, 6, 7,    // Back face
      8, 9, 10,     8, 10, 11,  // Top face
      12, 13, 14,   12, 14, 15, // Bottom face
      16, 17, 18,   16, 18, 19, // Right face
      20, 21, 22,   20, 22, 23  // Left face
    ]
};

var subdivideMeshData = function(meshData){
	//keep things simple - just subdivide each triangle into 4 triangles.
	//can call repeatedly for finer subdivision
	
	var indices = meshData.indices;	//note this is the same data - 
	var vertices = meshData.vertices;
	var uvcoords = meshData.uvcoords;
	
	var nextVert = vertices.length;
	var nextUv = uvcoords.length;
	var nextNum = nextUv/2;	//note assuming that nextVert = nextNum*3
	
	var numindices = indices.length;
	var pairs={};

	var newindices=[];
	var newidx=0;	//could use newindices.length
	//loop over indices. for each triangle, add an entry, if it doesn't already exist, to the list of pairs
	
	var numTris = indices.length/3;	//TODO check is a multiple of 3
	
	for (var ii=0;ii<numindices;ii+=3){
		
		var idxA = indices[ii];
		var idxB = indices[ii+1];
		var idxC = indices[ii+2];
		
		addPairs(idxA,idxB);
		addPairs(idxB,idxC);
		addPairs(idxC,idxA);
		
		function addPairs(idxP,idxQ){
			if (!pairs[[idxP,idxQ]]){
				pairs[[idxP,idxQ]]=nextNum;
				pairs[[idxQ,idxP]]=nextNum++;
				
				//set vertex position and texture coordinate as average of pair

				vertices[nextVert++]= 0.5*(vertices[3*idxP] + vertices[3*idxQ]);
				uvcoords[nextUv++]= 0.5*(uvcoords[2*idxP] + uvcoords[2*idxQ]);

				vertices[nextVert++]= 0.5*(vertices[3*idxP +1] + vertices[3*idxQ +1]);
				uvcoords[nextUv++]= 0.5*(uvcoords[2*idxP +1] + uvcoords[2*idxQ +1]);

				vertices[nextVert++]= 0.5*(vertices[3*idxP +2] + vertices[3*idxQ +2]);
			}
		}
		
		//make new triangles
		
		newindices[newidx++] = idxA;
		newindices[newidx++] = pairs[[idxA,idxB]];
		newindices[newidx++] = pairs[[idxA,idxC]];
		
		newindices[newidx++] = pairs[[idxA,idxB]];
		newindices[newidx++] = idxB;
		newindices[newidx++] = pairs[[idxB,idxC]];
		
		newindices[newidx++] = pairs[[idxA,idxC]];
		newindices[newidx++] = pairs[[idxB,idxC]];
		newindices[newidx++] = idxC;
		
		newindices[newidx++] = pairs[[idxA,idxB]];
		newindices[newidx++] = pairs[[idxB,idxC]];
		newindices[newidx++] = pairs[[idxA,idxC]];
		
	}
	
	//swap out index data - note this changes the original object...
	meshData.indices = newindices;
};