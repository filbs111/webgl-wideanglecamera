
var gl;	//context
var screenAspect;

//mostly from view-source:http://learningwebgl.com/lessons/lesson01/index.html
function initGL(canvas){
	try {
		gl = canvas.getContext("webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
		screenAspect = gl.viewportWidth/gl.viewportHeight;
	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry :-(");
	}
}

function getShader(gl, id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}

	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}

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