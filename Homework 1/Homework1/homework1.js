"use strict";


var canvas;
var gl;


var numVertices = 144;
var numChecks = 26;

var program;

var textureFlag = true;
var spotFlag = true;

var pointsArray = [];
var colorsArray = [];
var normalsArray = [];
var texCoordArray = [];

var texture;

var modelViewMatrix, projectionMatrix;

var nMatrix, nMatrixLoc;

var near = 0.3;
var far = 10.0;
var radius = 4.0;
var theta = 0.0;
var phi = 0.0;
var dr = 5.0 * Math.PI / 180.0;

var fovy = 45.0;
var aspect;

var modelViewMatrixLoc, projectionMatrixLoc;
var modelViewMatrix, projectionMatrix;
var eye;
const at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);


var ambientGlobal = vec4(0.1, 0.1, 0.1, 1.0);

//Directional Light
var dirLightPosition = vec4(1.0, 1.0, 1.0, 0.0); // w = 0.0
var dirLightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var dirLightDiffuse = vec4(0.5, 0.5, 0.5, 1.0);

//Spotlight
var spotLightPosition = vec4(0.0, 0.0, 4.0, 1.0); //w = 1.0
var spotLightAmbient = vec4(0.3, 0.3, 0.3, 1.0);
var spotLightDiffuse = vec4(0.7, 0.7, 0.7, 1.0);

var spotLightDirection = vec4(0.0, 0.0, -2.0, 1.0);
var spotExponent = 50.0;
var cosCutOff = 0.998;

//material = pearl material
var materialAmbient = vec4(0.25, 0.20725, 0.20725, 0.922);
var materialDiffuse = vec4(1.0, 0.829, 0.829, 0.922);

//attenuation parameters
var kc = 1.0; //constant attenuation
var kl = 0.0; //linear attenuation
var kq = 0.0; //quadratic attenuation



var vertices = [
  //bigger octagon (y = 0.1)
  vec4(-0.3, 0.1, 0.9, 1.0), //v0
  vec4(0.3, 0.1, 0.9, 1.0), //v1
  vec4(0.9, 0.1, 0.3, 1.0), //v2
  vec4(0.9, 0.1, -0.3, 1.0), //v3
  vec4(0.3, 0.1, -0.9, 1.0), //v4
  vec4(-0.3, 0.1, -0.9, 1.0), //v5
  vec4(-0.9, 0.1, -0.3, 1.0), //v6
  vec4(-0.9, 0.1, 0.3, 1.0), //v7

  //smaller octagon (y = 0.65)
  vec4(-0.25, 0.65, 0.55, 1.0), //v8
  vec4(0.25, 0.65, 0.55, 1.0), //v9
  vec4(0.55, 0.65, 0.25, 1.0), //v10
  vec4(0.55, 0.65, -0.25, 1.0), //v11
  vec4(0.25, 0.65, -0.55, 1.0), //v12
  vec4(-0.25, 0.65, -0.55, 1.0), //v13
  vec4(-0.55, 0.65, -0.25, 1.0), //v14
  vec4(-0.55, 0.65, 0.25, 1.0), //v15

  //medium octagon (y = -0.1)
  vec4(-0.25, -0.1, 0.85, 1.0), //v16
  vec4(0.25, -0.1, 0.85, 1.0), //v17
  vec4(0.85, -0.1, 0.25, 1.0), //v18
  vec4(0.85, -0.1, -0.25, 1.0), //v19
  vec4(0.25, -0.1, -0.85, 1.0), //v20
  vec4(-0.25, -0.1, -0.85, 1.0), //v21
  vec4(-0.85, -0.1, -0.25, 1.0), //v22
  vec4(-0.85, -0.1, 0.25, 1.0), //v23

  vec4(0.0, 0.72, 0.0, 1.0), //center for the smaller octagon --> v24

  vec4(0.0, -0.95, 0.0, 1.0) //center for the pyramid --> v25
];


var vertexColor =  vec4(0.0, 0.6, 0.9, 1.0);


var texCoord = [
  //octagon
  vec2(0.33, 0.0), //0
  vec2(0.66, 0.0), //1
  vec2(1.0, 0.33), //2
  vec2(1.0, 0.66), //3
  vec2(0.66, 1.0), //4
  vec2(0.33, 1.0), //5
  vec2(0.0, 0.66), //6
  vec2(0.0, 0.33), //7

  vec2(0.5, 0.5), //8 - center for the octagon

  //first gap
  vec2(0.05, 0.4), //9
  vec2(0.0, 0.0), //10
  vec2(0.5, 0.0), //11
  vec2(0.45, 0.4), //12

  //second gap
  vec2(0.0, 0.2), //13
  vec2(0.0, 0.0), //14
  vec2(0.5, 0.0), //15
  vec2(0.5, 0.2), //16

  //pyramyd
  //smaller triangles
  vec2(0.0, 1.0), //17
  vec2(0.5, 1.0), //18
  vec2(0.25, 0.0),//19
  //bigger triangles
  vec2(0.0, 1.0), //20
  vec2(0.7, 1.0), //21
  vec2(0.35, 0.0) //22

];



function octagon(starterVertex, center, normalsOrientationCheck) {
  var t1;
  var t2;
  var normal;

  for (var i = starterVertex; i < starterVertex + 7; i++) {
    //normals computation
    t1 = subtract(vertices[i + 1], vertices[center]);
    t2 = subtract(vertices[i], vertices[center]);
    if (normalsOrientationCheck >= 0) {
      normal = vec3(cross(t2, t1));
    } else {
      normal = vec3(cross(t1, t2));
    }

    pointsArray.push(vertices[i]);
    colorsArray.push(vertexColor);
    normalsArray.push(normal);

    pointsArray.push(vertices[i + 1]);
    colorsArray.push(vertexColor);
    normalsArray.push(normal);

    pointsArray.push(vertices[center]);
    colorsArray.push(vertexColor);
    normalsArray.push(normal);
  }

  //normals computation
  t1 = subtract(vertices[starterVertex], vertices[center]);
  t2 = subtract(vertices[starterVertex + 7], vertices[center]);

  if (normalsOrientationCheck >= 0) {
    normal = vec3(cross(t2, t1));
  } else {
    normal = vec3(cross(t1, t2));
  }

  //last triangle (because the for loop stops to the triangle 6,7,center)
  pointsArray.push(vertices[starterVertex + 7]);
  colorsArray.push(vertexColor);
  normalsArray.push(normal);

  pointsArray.push(vertices[starterVertex]);
  colorsArray.push(vertexColor);
  normalsArray.push(normal);

  pointsArray.push(vertices[center]);
  colorsArray.push(vertexColor);
  normalsArray.push(normal);
}


function quad(a, b, c, d) {
  //normals computation
  var t1 = subtract(vertices[b], vertices[a]);
  var t2 = subtract(vertices[c], vertices[b]);
  var normal = cross(t1, t2);
  normal = vec3(normal);

  pointsArray.push(vertices[a]);
  colorsArray.push(vertexColor);
  normalsArray.push(normal);

  pointsArray.push(vertices[b]);
  colorsArray.push(vertexColor);
  normalsArray.push(normal);

  pointsArray.push(vertices[c]);
  colorsArray.push(vertexColor);
  normalsArray.push(normal);

  pointsArray.push(vertices[a]);
  colorsArray.push(vertexColor);
  normalsArray.push(normal);

  pointsArray.push(vertices[c]);
  colorsArray.push(vertexColor);
  normalsArray.push(normal);

  pointsArray.push(vertices[d]);
  colorsArray.push(vertexColor);
  normalsArray.push(normal);
}



function colorDiamond() {
  //octagon
  octagon(8, 24, 1);
  //pyramid
  octagon(16, 25, -1);

  //first "quads line"
  quad(8, 0, 1, 9);
  quad(9, 1, 2, 10);
  quad(10, 2, 3, 11);
  quad(11, 3, 4, 12);
  quad(12, 4, 5, 13);
  quad(13, 5, 6, 14);
  quad(14, 6, 7, 15);
  quad(15, 7, 0, 8);

  //second "quads line"
  quad(0, 16, 17, 1);
  quad(1, 17, 18, 2);
  quad(2, 18, 19, 3);
  quad(3, 19, 20, 4);
  quad(4, 20, 21, 5);
  quad(5, 21, 22, 6);
  quad(6, 22, 23, 7);
  quad(7, 23, 16, 0);
}



function fillTexCoordArray() {
  var i;

  //assigns texture coordinates for the octagon
  for (i = 0; i < 7; i++) {
    texCoordArray.push(texCoord[i]);
    texCoordArray.push(texCoord[i + 1]);
    texCoordArray.push(texCoord[8]);
  }
  //last triangle (because the for loop stops to the triangle 6,7,center)
  texCoordArray.push(texCoord[7]);
  texCoordArray.push(texCoord[0]);
  texCoordArray.push(texCoord[8]);

  //assigns texture coordinates for the "pyramid"
  for (i = 0; i < 4; i++) {
    //smaller triangle
    texCoordArray.push(texCoord[17]);
    texCoordArray.push(texCoord[18]);
    texCoordArray.push(texCoord[19]);
    //bigger triangle
    texCoordArray.push(texCoord[20]);
    texCoordArray.push(texCoord[21]);
    texCoordArray.push(texCoord[22]);
  }

  //assigns texture coordinates for the first "quads line"
  for (i = 0; i < 8; i++) {
    texCoordArray.push(texCoord[9]);
    texCoordArray.push(texCoord[10]);
    texCoordArray.push(texCoord[11]);

    texCoordArray.push(texCoord[9]);
    texCoordArray.push(texCoord[11]);
    texCoordArray.push(texCoord[12]);
  }

  //assigns texture coordinates for the second "quads line"
  for (i = 0; i < 8; i++) {
    texCoordArray.push(texCoord[13]);
    texCoordArray.push(texCoord[14]);
    texCoordArray.push(texCoord[15]);

    texCoordArray.push(texCoord[13]);
    texCoordArray.push(texCoord[15]);
    texCoordArray.push(texCoord[16]);
  }
}


function configureTexture(image) {
  texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
    gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
    gl.NEAREST_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.uniform1i(gl.getUniformLocation(program, "uTextureMap"), 0);
}



window.onload = function init() {

  canvas = document.getElementById("gl-canvas");

  gl = canvas.getContext('webgl2');
  if (!gl) alert("WebGL 2.0 isn't available");

  gl.viewport(0, 0, canvas.width, canvas.height);

  aspect = canvas.width / canvas.height;

  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  gl.enable(gl.DEPTH_TEST);

  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  colorDiamond();
  fillTexCoordArray();

  var nBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

  var normalLoc = gl.getAttribLocation(program, "aNormal");
  gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(normalLoc);


  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

  var vColor = gl.getAttribLocation(program, "aColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "aPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  var tBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordArray), gl.STATIC_DRAW);

  var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
  gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(texCoordLoc);
  var image = document.getElementById("texImage");

  configureTexture(image);

  modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");
  nMatrixLoc = gl.getUniformLocation(program, "uNormalMatrix");


  var spotAmbientProduct = mult(spotLightAmbient, materialAmbient);
  var spotDiffuseProduct = mult(spotLightDiffuse, materialDiffuse);


  var dirAmbientProduct = mult(dirLightAmbient, materialAmbient);
  var dirDiffuseProduct = mult(dirLightDiffuse, materialDiffuse);


  var ambientGlobalProduct = mult(ambientGlobal, materialAmbient);


  document.getElementById("zFarSlider").oninput = function(event) {
    far = event.target.value;
  };
  document.getElementById("zNearSlider").oninput = function(event) {
    near = event.target.value;
  };
  document.getElementById("radiusSlider").oninput = function(event) {
    radius = event.target.value;
  };
  document.getElementById("thetaSlider").oninput = function(event) {
    theta = event.target.value * Math.PI / 180.0;
  };
  document.getElementById("phiSlider").oninput = function(event) {
    phi = event.target.value * Math.PI / 180.0;
  };
  document.getElementById("aspectSlider").oninput = function(event) {
    aspect = event.target.value;
  };
  document.getElementById("fovSlider").oninput = function(event) {
    fovy = event.target.value;
  };
  document.getElementById("cutOffAngleSlider").oninput = function(event) {
    cosCutOff = Math.cos(radians(event.target.value));
  };
  document.getElementById("spotExponentSlider").oninput = function() {
    spotExponent = event.target.value;
  };
  document.getElementById("spotDirXSlider").oninput = function() {
    spotLightDirection[0] = event.target.value;
  };
  document.getElementById("spotDirYSlider").oninput = function() {
    spotLightDirection[1] = event.target.value;
  };
  document.getElementById("spotDirZSlider").oninput = function() {
    spotLightDirection[2] = event.target.value;
  };
  document.getElementById("attConstSlider").oninput = function() {
    kc = event.target.value;
  };
  document.getElementById("attLinSlider").oninput = function() {
    kl = event.target.value;
  };
  document.getElementById("attQuadSlider").oninput = function() {
    kq = event.target.value;
  };
  document.getElementById("texButton").onclick = function() {
    if (textureFlag) {
      textureFlag = false;
    }else{
      textureFlag = true;
    }
  };
  document.getElementById("spotButton").onclick = function() {
    if (spotFlag) {
      spotFlag = false;
    }else{
      spotFlag = true;
    }
  };

  gl.uniform1f(gl.getUniformLocation(program,
    "textureFlag"), textureFlag);
  gl.uniform4fv(gl.getUniformLocation(program,
    "uSpotAmbientProduct"), spotAmbientProduct);
  gl.uniform4fv(gl.getUniformLocation(program,
    "uSpotDiffuseProduct"), spotDiffuseProduct);

  gl.uniform4fv(gl.getUniformLocation(program,
    "uDirAmbientProduct"), dirAmbientProduct);
  gl.uniform4fv(gl.getUniformLocation(program,
    "uDirDiffuseProduct"), dirDiffuseProduct);

  gl.uniform4fv(gl.getUniformLocation(program,
    "uDirLightPosition"), dirLightPosition);
  gl.uniform4fv(gl.getUniformLocation(program,
    "ambientGlobalProduct"), ambientGlobalProduct);

  render();
}


var render = function() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  eye = vec3(radius * Math.sin(theta) * Math.cos(phi),
    radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(theta));
  modelViewMatrix = lookAt(eye, at, up);
  projectionMatrix = perspective(fovy, aspect, near, far);

  nMatrix = normalMatrix(modelViewMatrix, true);

  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

  gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix));


  gl.uniform4fv(gl.getUniformLocation(program,
    "uSpotLightPosition"), spotLightPosition);
  gl.uniform4fv(gl.getUniformLocation(program,
    "uSpotLightDirection"), spotLightDirection);
  gl.uniform1f(gl.getUniformLocation(program,
    "cosCutOff"), cosCutOff);
  gl.uniform1f(gl.getUniformLocation(program,
    "spot_exponent"), spotExponent);

  gl.uniform1f(gl.getUniformLocation(program, "kc"), kc);
  gl.uniform1f(gl.getUniformLocation(program, "kl"), kl);
  gl.uniform1f(gl.getUniformLocation(program, "kq"), kq);

  gl.uniform1f(gl.getUniformLocation(program,
    "textureFlag"), textureFlag);
  gl.uniform1f(gl.getUniformLocation(program,
    "spotFlag"), spotFlag);


  gl.drawArrays(gl.TRIANGLES, 0, numVertices);
  requestAnimationFrame(render);
}
