
var gl;	//context
var screenAspect;
var canvas;

//mostly from view-source:http://learningwebgl.com/lessons/lesson01/index.html
function initGL(){
	try {
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		resizecanvas();
	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry :-(");
	}
}
function resizecanvas(){
	var screenWidth = window.innerWidth;
	var screenHeight = window.innerHeight;
	var scaledWidth = screenWidth;
	var scaledHeight = screenHeight;

	var pixelScale = 1/guiParams.pixSizeMultiplier;
	
	//console.log("device pixel ratio = " + window.devicePixelRatio);
	scaledWidth*=pixelScale;
	scaledHeight*=pixelScale;
	
	if (gl.viewportWidth != scaledWidth ||gl.viewportHeight != scaledHeight){
		
		gl.viewportWidth = scaledWidth;
		gl.viewportHeight = scaledHeight;
		
		canvas.width = scaledWidth;
		canvas.height = scaledHeight;
		
		canvas.mystylewidth = screenWidth;	//extra vars to keep actual numbers rather than strings
		canvas.mystyleheight = screenHeight;
		
		canvas.style.width = ''+screenWidth+'px';	//the only things called pixels are the only thing that aren't pixels (these are 640x360 for screen that is twice these dimensions.)
		canvas.style.height = ''+screenHeight+'px';
	}
	
	screenAspect = gl.viewportWidth/gl.viewportHeight;
}

function getShader(gl, id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}

	var str = shaderScript.text;

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

function loadShader(vs_id,fs_id, obj) {
	console.log("loadshader called, vs_id = " + vs_id);
	var fragmentShader = getShader(gl, vs_id);		//TODO check whether shader already got
	var vertexShader = getShader(gl, fs_id);

	var shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}

	shaderProgram.uniforms={};
	shaderProgram.attributes={};
	progUniforms = shaderProgram.uniforms;
	progAttributes = shaderProgram.attributes;
	
	obj.attributes.forEach(function(item, index){
		progAttributes[item] = gl.getAttribLocation(shaderProgram, item);
		gl.enableVertexAttribArray(progAttributes[item]);
	});
	obj.uniforms.forEach(function(item, index){
		console.log("getting uniform location for " + item);
		progUniforms[item] = gl.getUniformLocation(shaderProgram, item);
	});

	return shaderProgram;
}