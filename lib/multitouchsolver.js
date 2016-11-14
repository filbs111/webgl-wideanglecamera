var ongoingTouches = {};

function handleTouchStart(evt){
	evt.preventDefault();
	var touches = evt.changedTouches;
	log( touches.length + " touches starting");
		
	for (var i = 0; i < touches.length; i++) {
		var thisTouch = copyTouch(touches[i]);
		var touchIdx = touches[i].identifier;
		ongoingTouches[touchIdx] = thisTouch;
		logtouchevent(touches[i],i);
	}
}

function handleTouchMove(evt){
	evt.preventDefault();
	var touches = evt.changedTouches;
	log( touches.length + " touches moving");
	
	var fromToPairs=[];
	
	for (var i = 0; i < touches.length; i++) {
		
		var thisTouch = copyTouch(touches[i]);
		var touchIdx = touches[i].identifier;
		
		//copy previous position to new touch
		toTouch = ongoingTouches[touchIdx];
		thisTouch.oldx = toTouch.x;
		thisTouch.oldy = toTouch.y;
		ongoingTouches[touchIdx] = thisTouch;
		
			
		var oldPointingDir = getPointingDirectionFromScreenCoordinate({x:thisTouch.oldx, y: thisTouch.oldy});
		var pointingDir = getPointingDirectionFromScreenCoordinate({x:thisTouch.x, y: thisTouch.y});
		
		fromToPairs[i]=[
			[oldPointingDir.x,oldPointingDir.y,oldPointingDir.z],
			[pointingDir.x,pointingDir.y,pointingDir.z]
		];
		
		logtouchevent(touches[i],i);
	}
	
	var toRotate = getRotationFromDirectionPairs(fromToPairs);
	if (toRotate){	//can come back null eg if touch stationary
		pitchPlayer( toRotate[0] );
		turnPlayer( -toRotate[1] );
		rollPlayer( -toRotate[2] );
	}
}

function handleTouchEnd(evt){
	evt.preventDefault();
	var touches = evt.changedTouches;
	log( touches.length + " touches ending");
	for (var i = 0; i < touches.length; i++) {
		logtouchevent(touches[i],i);
		delete ongoingTouches[touches.identifier];
	}
}

function logtouchevent(t,i){
	//log("i = " + i + " , idx = " + t.identifier + ". radiusX : " + t.radiusX + " , radiusY : " + t.radiusY);
	log("i = " + i + " , idx = " + t.identifier + ". x : " + t.pageX + " , y : " + t.pageY);
}

//https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
//says this is useful since the touch object might change.
function copyTouch(touch) {
  return { x: touch.pageX, y: touch.pageY, force:touch.force };
}

function log(info){		//can to enable/disable logging globally
	//console.log(info);
}




var getRotationFromDirectionPairs = (function(){
	
	//will return a rotation vector - probably a 3-vector.
	//input pairs is a matrix where each value is a 2-matrix, each containing a direction - suppose will use 3-vectors 
	//eg [[[beforex1, beforey1, beforez1],[afterx1, afterx2, afterx3]],[beforex2, beforey2, beforez2],[etc]]]...
	
	var constpll=1;
	var constperp = 100;
	var constdiff = constpll-constperp;	//can just scale either of these to 1 and eliminate from equations.
	
	//TODO replace these functions by glmatrix methods
	function crossProduct(vec1, vec2){
		var output =[];
		output[0] = vec1[1] * vec2[2] - vec1[2] * vec2[1]; 
		output[1] = vec1[2] * vec2[0] - vec1[0] * vec2[2]; 
		output[2] = vec1[0] * vec2[1] - vec1[1] * vec2[0];
		return output;
	}
	function dotProduct(vec1,vec2){
		return vec1[0]*vec2[0]+vec1[1]*vec2[1]+vec1[2]*vec2[2];
	}
	function normalise(vec){
		var length=Math.sqrt(dotProduct(vec,vec));
		return [vec[0]/length, vec[1]/length, vec[2]/length];
	}
	function addVector(vec1,vec2){
		return [vec1[0]+vec2[0], vec1[1]+vec2[1], vec1[2]+vec2[2]];
	}
	function subtractVector(vec1,vec2){
		return [vec1[0]-vec2[0], vec1[1]-vec2[1], vec1[2]-vec2[2]];
	}
	
	return function(pairs){
		//keep a running sum of components 
		var cxx=0, cyy=0, czz=0;
		var cxy=0, cxz=0, cyz=0;
		var cx=0, cy=0, cz=0;
	
		//console.log("---------------------------------");
	
		for (var ii=0;ii<pairs.length;ii++){
			var pair = pairs[ii];
			
			var startdirection = normalise(pair[0]);
			var enddirection = normalise(pair[1]);
			
			//find the most likely rotation - ie turning through great circle. 
			//for small rotations, this is the cross product of the 2 directions.
			//generally, this breaks down - eg pointing in 2 opposite directions - cross product goes to 0.
			//expect real answer to do with homogenous co-ords, projection, quaternions blah blah blah
			
			var crossP = crossProduct(startdirection,enddirection);
			var dotP = dotProduct(startdirection,enddirection);
			var M = [crossP[0]/dotP,
					 crossP[1]/dotP,
					 crossP[2]/dotP];
						//the 3-vector of the "most likely" rotation vector.
						//afaik (SxE,1+S.E) is a unit 4vec, from which we can project a 3-vector M
						//ScrossE/(1+S.E) confim length 1:
			var fourVecLenSq = dotProduct(crossP,crossP) + dotP*dotP;	//apparently this is the quaternion for DOUBLE the required rotation. not sure this really matters for 
																		//intended use though. 

			//console.log("length = " + fourVecLenSq);	//confirm length is 1.
			//console.log("M: " + M);
			
			var L=normalise( addVector(startdirection, enddirection));
			
			//console.log( "length of L = " + dotProduct(L,L) );	//confirm length is 1
			//console.log( "MxL = " + dotProduct(L,M) );	//confirm L, M perpendicular (result ~0)

			
			//psuedocode:constdiff * (L.p)^2 + constperp * ( p.p -2p.M )

			//constdiff * (L.p)^2 
			cxx+=constdiff*L[0]*L[0];
			cyy+=constdiff*L[1]*L[1];
			czz+=constdiff*L[2]*L[2];
			cxy+=constdiff*L[0]*L[1];
			cxz+=constdiff*L[0]*L[2];
			cyz+=constdiff*L[1]*L[2];
			
			//constperp * ( p.p -2p.M ))
			//p.p part:
			cxx+=constperp;
			cyy+=constperp;
			czz+=constperp;
			
			//-2p.M part
			cx+=2*constperp*M[0];
			cy+=2*constperp*M[1];
			cz+=2*constperp*M[2]; 
		}
	
		//create matrix and find inverse.
		//since mat is symmetric this can be simplified a lot, but ignore for now.
		
		//losing the 2* terms produces double expected result (instead of wrong result) for single touch rotations. suppose made a mistake somewhere.
		var mymat3 = mat3.create();
		mymat3[0]= cxx;		mymat3[1]= cxy;		mymat3[2]= cxz;
		mymat3[3]= cxy;		mymat3[4]= cyy;		mymat3[5]= cyz;
		mymat3[6]= cxz;		mymat3[7]= cyz;		mymat3[8]= czz;
		
		var invertedmat3= mat3.inverse(mymat3);
		
		if(!invertedmat3){return null;}
		
		//console.log(invertedmat3);
		
		//rotate cx,y,z vector by this. whether to use rows/columns doesn't matter since matrix is symmetric
		
		var rotatedc = [
			cx*invertedmat3[0] + cy*invertedmat3[1] + cz*invertedmat3[2],
			cx*invertedmat3[3] + cy*invertedmat3[4] + cz*invertedmat3[5],
			cx*invertedmat3[6] + cy*invertedmat3[7] + cz*invertedmat3[8],
		];
		
		log("rotatedc: "+rotatedc);
		
		//possibly todo un-project c
		return [rotatedc[0]/2,rotatedc[1]/2,rotatedc[2]/2];	//divide result by 2 since, empirically, twice as big as M for single touch.
	}
})();