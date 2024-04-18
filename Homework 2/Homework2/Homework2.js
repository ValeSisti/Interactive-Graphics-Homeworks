"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var texCoordArray = [];

var texture1;
var texture2;

var vertices = [

  vec4(-0.5, -0.5, 0.5, 1.0),
  vec4(-0.5, 0.5, 0.5, 1.0),
  vec4(0.5, 0.5, 0.5, 1.0),
  vec4(0.5, -0.5, 0.5, 1.0),
  vec4(-0.5, -0.5, -0.5, 1.0),
  vec4(-0.5, 0.5, -0.5, 1.0),
  vec4(0.5, 0.5, -0.5, 1.0),
  vec4(0.5, -0.5, -0.5, 1.0)
];


var texCoord = [

  vec2(0, 0),
  vec2(1, 0),
  vec2(1, 1),
  vec2(0, 1)

];

var radius = 4.0;
var alpha = 0.0; //theta
var phi = 0.0; 

var eye;
const at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);


var torsoId = 0;
var headId = 1;
var head1Id = 1;
var head2Id = 10;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;

var tailId = 11;
var muzzleId = 12;

var rightEarId = 13;
var leftEarId = 14;

var groundId = 15;
var treeTrunkId = 16;
var treeCrownId = 17;


var torsoHeight = 5.5;
var torsoWidth = 3.5;
var upperArmHeight = 2.3;
var lowerArmHeight = 1.7;
var upperArmWidth = 1.2;
var lowerArmWidth = 1.0;
var upperLegWidth = 1.4;
var lowerLegWidth = 1.1;
var lowerLegHeight = 1.7;
var upperLegHeight = 2.3;
var headHeight = 1.8;
var headWidth = 2.0;

var tailHeight = 0.8;
var tailWidth = 0.7;
var earWidth = 0.6;
var earHeight = 0.6;
var muzzleWidth = 1.2;
var muzzleHeight = 0.7;
var groundHeight = 1.0;
var groundWidth = 30.0;
var treeTrunkHeight = 17.0;
var treeTrunkWidth = 3.5;
var treeCrownHeight = 15.0;
var treeCrownWidth = 12.0;


var distance = -4.8;

var increment = -0.32;
var increment2 = -0.65;
var standUpRotation = 0.8;
var turningBackRotation = 0.8;

var animationFlag = false;
var isStandingUp = false;
var isWalkingOnTwoFeets = false;
var againstTree = false;
var aligned = false;

var torsoTranslationX = -10.0;
var torsoTranslationY = 0.0;
var inc = 0.02;
var delta_angle = 0.6;
var count = 0;

var isScratching = false;
var isTurningBack = false;
var isLeaning = false;
var movingTorso = false;

var walkIncrement = 0.4;
var walkIncrement2 = 0.15;

var scratchingTranslationX = 0.0;
var scratchingTranslationY = 0.0;

var isBody = false;
var isHead = false;


var numNodes = 18;
var numAngles = 18;
var angle = 0;

var theta = [90, 0, 90, 10, 90, 10, 90, 10, 90, 10, 0, -20, 0, 0, 0, 0, 0, 0];
            //0  1   2   3   4   5   6   7   8   9 10   11 12 13 14 15 16 17
var numVertices = 24;

var stack = [];

var figure = [];

for (var i = 0; i < numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];

//-------------------------------------------

function scale4(a, b, c) {
  var result = mat4();
  result[0] = a;
  result[5] = b;
  result[10] = c;
  return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child) {
  var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
  }
  return node;
}

//--------------------------------------------

function initNodes(Id) {

  var m = mat4();

  switch (Id) {

    case torsoId:
      m = translate(torsoTranslationX + scratchingTranslationX, torsoTranslationY + scratchingTranslationY, 0);
      m = mult(m, rotate(theta[torsoId], vec3(0, 1, 0)));
      m = mult(m, rotate(theta[torsoId], vec3(1, 0, 0)));
      m = mult(m, rotate(-standUpRotation, vec3(1, 0, 0)));
      m = mult(m, rotate(2*turningBackRotation, vec3(0, 1, 0)));
      m = mult(m, translate(0.0, -0.1 * torsoHeight, 0.0));
      figure[torsoId] = createNode(m, torso, groundId, headId);
      break;

    case headId:
    case head1Id:
    case head2Id:

      m = translate(0.0, torsoHeight + 0.5 * headHeight, 0.1 * headWidth);
      m = mult(m, rotate(theta[head1Id], vec3(1, 0, 0)));
      m = mult(m, rotate(theta[head2Id], vec3(0, 1, 0)));
      m = mult(m, translate(0.0, -0.5 * headHeight, 0.0));
      figure[headId] = createNode(m, head, tailId, muzzleId);
      break;


    case tailId:

      m = translate(0.0, -(tailHeight), 0.3 * (torsoWidth - tailWidth));
      m = mult(m, rotate(theta[tailId], vec3(1, 0, 0)));
      figure[tailId] = createNode(m, tail, leftUpperArmId, null);
      break;


    case muzzleId:

      m = translate(0.0, headHeight, -0.25);
      m = mult(m, rotate(theta[muzzleId], vec3(1, 0, 0)));
      figure[muzzleId] = createNode(m, muzzle, rightEarId, null);
      break;

    case rightEarId:

      m = translate(0.5 * (headWidth - earWidth), 0.3 * earHeight, 0.5*(headWidth + earWidth));
      m = mult(m, rotate(theta[rightEarId], vec3(1, 0, 0)));
      figure[rightEarId] = createNode(m, ear, leftEarId, null);
      break;


    case leftEarId:

      m = translate(-0.5 * (headWidth - earWidth), 0.3 * earHeight, 0.5*(headWidth + earWidth));
      m = mult(m, rotate(theta[leftEarId], vec3(1, 0, 0)));
      figure[leftEarId] = createNode(m, ear, null, null);
      break;


    case leftUpperArmId:

      m = translate(-0.5 * (torsoWidth + upperArmWidth), 0.9 * torsoHeight, 0.0);
      m = mult(m, rotate(theta[leftUpperArmId], vec3(1, 0, 0)));
      figure[leftUpperArmId] = createNode(m, leftUpperArm, rightUpperArmId, leftLowerArmId);
      break;

    case rightUpperArmId:

      m = translate(0.5 * (torsoWidth + upperArmWidth), 0.9 * torsoHeight, 0.0);
      m = mult(m, rotate(theta[rightUpperArmId], vec3(1, 0, 0)));
      figure[rightUpperArmId] = createNode(m, rightUpperArm, leftUpperLegId, rightLowerArmId);
      break;

    case leftUpperLegId:

      m = translate(-0.5 * (torsoWidth + upperLegWidth), 0.3 * upperLegHeight, 0.0);
      m = mult(m, rotate(theta[leftUpperLegId], vec3(1, 0, 0)));
      figure[leftUpperLegId] = createNode(m, leftUpperLeg, rightUpperLegId, leftLowerLegId);

      break;

    case rightUpperLegId:

      m = translate(0.5 * (torsoWidth + upperLegWidth), 0.3 * upperLegHeight, 0.0);
      m = mult(m, rotate(theta[rightUpperLegId], vec3(1, 0, 0)));
      figure[rightUpperLegId] = createNode(m, rightUpperLeg, null, rightLowerLegId);
      break;

    case leftLowerArmId:

      m = translate(0.0, upperArmHeight, 0.0);
      m = mult(m, rotate(theta[leftLowerArmId], vec3(1, 0, 0)));
      figure[leftLowerArmId] = createNode(m, leftLowerArm, null, null);
      break;

    case rightLowerArmId:

      m = translate(0.0, upperArmHeight, 0.0);
      m = mult(m, rotate(theta[rightLowerArmId], vec3(1, 0, 0)));
      figure[rightLowerArmId] = createNode(m, rightLowerArm, null, null);
      break;

    case leftLowerLegId:

      m = translate(0.0, upperLegHeight, 0.0);
      m = mult(m, rotate(theta[leftLowerLegId], vec3(1, 0, 0)));
      figure[leftLowerLegId] = createNode(m, leftLowerLeg, null, null);
      break;

    case rightLowerLegId:

      m = translate(0.0, upperLegHeight, 0.0);
      m = mult(m, rotate(theta[rightLowerLegId], vec3(1, 0, 0)));
      figure[rightLowerLegId] = createNode(m, rightLowerLeg, null, null);
      break;

    case groundId:

      m = translate(0, -4.85, 0.0);
      m = mult(m, rotate(theta[groundId], vec3(1, 0, 0)));
      figure[groundId] = createNode(m, ground, treeTrunkId, null);
      break;

    case treeTrunkId:

      m = translate(-distance, -upperLegHeight - lowerLegHeight, 0.0);
      m = mult(m, rotate(theta[treeTrunkId], vec3(1, 0, 0)));
      figure[treeTrunkId] = createNode(m, treeTrunk, treeCrownId, null);
      break;

    case treeCrownId:

      m = translate(-distance, 0.5 * treeTrunkHeight, 0.0);
      m = mult(m, rotate(theta[treeCrownId], vec3(1, 0, 0)));
      figure[treeCrownId] = createNode(m, treeCrown, null, null);
      break;

  }
}


function traverse(Id) {
  if (Id == null) return;
  stack.push(modelViewMatrix);
  modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
  figure[Id].render();
  if (figure[Id].child != null) traverse(figure[Id].child);
  modelViewMatrix = stack.pop();
  if (figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function torso() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * torsoHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale(torsoWidth, torsoHeight, torsoWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture2);

}

function head() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale(headWidth, headHeight, headWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture1);

}


function tail() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * tailHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale(tailWidth, tailHeight, tailWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);

}

function muzzle() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * muzzleHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale(muzzleWidth, muzzleHeight, muzzleWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);

}

function ear() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * earHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale(earWidth, earHeight, earWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);

}


function leftUpperArm() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);

}

function leftLowerArm() {


  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);

}

function rightUpperArm() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);

}

function rightLowerArm() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);

}

function leftUpperLeg() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);

}

function leftLowerLeg() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);

}

function rightUpperLeg() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);

}

function rightLowerLeg() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth))
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);

}


function ground() {
  gl.uniform1i(gl.getUniformLocation(program, "isTextured"), false);
  gl.uniform1i(gl.getUniformLocation(program, "isGreen"), true);
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * groundHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale(groundWidth, groundHeight, groundWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
  gl.uniform1i(gl.getUniformLocation(program, "isGreen"), false);
  gl.uniform1i(gl.getUniformLocation(program, "isTextured"), true);

}

function treeTrunk() {
  gl.uniform1i(gl.getUniformLocation(program, "isTextured"), false);
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * treeTrunkHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale(treeTrunkWidth, treeTrunkHeight, treeTrunkWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
  gl.uniform1i(gl.getUniformLocation(program, "isTextured"), true);
}

function treeCrown() {
  gl.uniform1i(gl.getUniformLocation(program, "isTextured"), false);
  gl.uniform1i(gl.getUniformLocation(program, "isGreen"), true);
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * treeCrownHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale(treeCrownWidth, treeCrownHeight, treeCrownWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
  gl.uniform1i(gl.getUniformLocation(program, "isGreen"), false);
  gl.uniform1i(gl.getUniformLocation(program, "isTextured"), true);
}



function quad(a, b, c, d) {
  pointsArray.push(vertices[a]);
  texCoordArray.push(texCoord[0]);
  pointsArray.push(vertices[b]);
  texCoordArray.push(texCoord[1]);
  pointsArray.push(vertices[c]);
  texCoordArray.push(texCoord[2]);
  pointsArray.push(vertices[d]);
  texCoordArray.push(texCoord[3]);
}


function cube() {
  quad(1, 0, 3, 2);
  quad(2, 3, 7, 6);
  quad(3, 0, 4, 7);
  quad(6, 5, 1, 2);
  quad(4, 5, 6, 7);
  quad(5, 4, 0, 1);
}

function configureTextures(image1, image2) {
  texture1 = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
    gl.RGB, gl.UNSIGNED_BYTE, image1);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
    gl.NEAREST_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);


  texture2 = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture2);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
    gl.RGB, gl.UNSIGNED_BYTE, image2);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
    gl.NEAREST_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.uniform1i(gl.getUniformLocation(program, "uTextureMap"), 0);

}


window.onload = function init() {

  canvas = document.getElementById("gl-canvas");

  gl = canvas.getContext('webgl2');
  if (!gl) {
    alert("WebGL 2.0 isn't available");
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  //
  //  Load shaders and initialize attribute buffers
  //
  program = initShaders(gl, "vertex-shader", "fragment-shader");

  gl.useProgram(program);

  instanceMatrix = mat4();

  projectionMatrix = ortho(-20.0, 20.0, -20.0, 20.0, -20.0, 20.0);
  modelViewMatrix = mat4();


  gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

  cube();

  vBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  var positionLoc = gl.getAttribLocation(program, "aPosition");
  gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionLoc);

  var tBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordArray), gl.STATIC_DRAW);

  var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
  gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(texCoordLoc);

  var image1 = document.getElementById("texImage");
  var image2 = document.getElementById("texImage2");



  configureTextures(image1, image2);

  document.getElementById("alphaSlider").oninput = function(event) { 
    alpha = event.target.value * Math.PI / 180.0;
  };
  document.getElementById("phiSlider").oninput = function(event) { 
    phi = event.target.value * Math.PI / 180.0;
  };


  document.getElementById("animationButton").onclick = function() {
    if (animationFlag) {
      animationFlag = false;
      document.getElementById("animationButton").innerHTML = "Resume Animation";
    } else {
      animationFlag = true;
      document.getElementById("animationButton").innerHTML = "Stop Animation";
    }
    if (count > 7) {
      animationFlag = true;
      document.getElementById("animationButton").innerHTML = "Stop Animation";
      initialPosition();
    }
  };


  for (i = 0; i < numNodes; i++) initNodes(i);

  render();
}

function initialPosition() { //set all the variables to their values in the
                            //starting position
  theta = [90, 0, 90, 10, 90, 10, 90, 10, 90, 10, 0, -20, 0, 0, 0, 0, 0, 0];
  torsoTranslationY = 0.0;


  scratchingTranslationX = 0.0;
  scratchingTranslationY = 0.0;


  torsoTranslationX = -10.0;
  torsoTranslationY = 0.0;
  isScratching = false;
  count = 0;
  movingTorso = false;
  isLeaning = false;
  againstTree = false;
  isStandingUp = false;
  isTurningBack = false;
  isWalkingOnTwoFeets = false;
  aligned = false;

  increment = -0.32;
  increment2 = -0.65;
  standUpRotation = 0.8;
  turningBackRotation = 0.8;
  distance = -4.8;

  inc = 0.02;
  delta_angle = 0.6;

  walkIncrement = 0.4;
  walkIncrement2 = 0.15;

}


function walking() {
  torsoTranslationX += 0.01;

  if (theta[rightUpperArmId] <= 78 || theta[rightUpperArmId] >= 102) {
    increment = -increment;
    increment2 = -increment2;
  }

  theta[rightUpperArmId] += increment;
  theta[rightUpperLegId] += increment;
  theta[leftUpperArmId] -= increment;
  theta[leftUpperLegId] -= increment;

  theta[rightLowerArmId] += increment2;
  theta[rightLowerLegId] += increment2;
  theta[leftLowerArmId] -= increment2;
  theta[leftLowerLegId] -= increment2;

}


function alignLegsAndArms() { //Aligns the legs and the arms after the walk.
                              //It handles all the possible cases.
  //Upper legs
  if (theta[rightUpperLegId] >= 90 && theta[leftUpperLegId] <= 90) {
    theta[rightUpperLegId] -= increment / 2;
    theta[leftUpperLegId] += increment / 2;
  }
  if (theta[rightUpperLegId] <= 90 && theta[leftUpperLegId] >= 90) {
    theta[rightUpperLegId] += increment / 2;
    theta[leftUpperLegId] -= increment / 2;
  }

  //Upper arms
  if (theta[rightUpperArmId] >= 90 && theta[leftUpperArmId] <= 90) {
    theta[rightUpperArmId] -= increment / 2;
    theta[leftUpperArmId] += increment / 2;
  }
  if (theta[rightUpperArmId] <= 90 && theta[leftUpperArmId] >= 90) {
    theta[rightUpperArmId] += increment / 2;
    theta[leftUpperArmId] -= increment / 2;
  }

  //Lower legs
  if (theta[rightLowerLegId] >= 10 && theta[leftLowerLegId] <= 10) {
    theta[rightLowerLegId] -= increment / 2;
    theta[leftLowerLegId] += increment / 2;
  }
  if (theta[rightLowerLegId] <= 10 && theta[leftLowerLegId] >= 10) {
    theta[rightLowerLegId] += increment / 2;
    theta[leftLowerLegId] -= increment / 2;
  }

  //Lower arms
  if (theta[rightLowerArmId] >= 10 && theta[leftLowerArmId] <= 10) {
    theta[rightLowerArmId] -= increment / 2;
    theta[leftLowerArmId] += increment / 2;
  }
  if (theta[rightLowerArmId] <= 10 && theta[leftLowerArmId] >= 10) {
    theta[rightLowerArmId] += increment / 2;
    theta[leftLowerArmId] -= increment / 2;
  }

  if (theta[rightUpperArmId] == 90) {
    isStandingUp = true;
  }

}

function standUp() {

  if (standUpRotation <= 90) { //angle to standing up
    standUpRotation += 0.5;
    theta[leftUpperLegId] += 0.5;
    theta[rightUpperLegId] += 0.5;

    theta[leftUpperArmId] += 0.35;
    theta[rightUpperArmId] += 0.35;

    //rotating the head
    if (theta[head1Id] <= 90) {
      theta[head1Id] += 2 * increment;
    }

    //rotating the tail
    if (theta[tailId] <= 0) {
      theta[tailId] += 0.5 * increment;
    }

    if (theta[leftLowerLegId] >= 10) {
      theta[leftLowerLegId] -= 0.1;
    }
    if (theta[rightLowerLegId] >= 10) {
      theta[rightLowerLegId] -= 0.1;
    }
    if (standUpRotation > 90) {
      isWalkingOnTwoFeets = true;
      isStandingUp = false;
    }
  }
}

function scratching() {

  torsoTranslationY -= inc;
  theta[rightUpperLegId] -= delta_angle;
  theta[leftUpperLegId] -= delta_angle;
  theta[head1Id] -= delta_angle / 4;

  theta[rightLowerLegId] += 2 * delta_angle;
  theta[leftLowerLegId] += 2 * delta_angle;

  if (torsoTranslationY <= -1.0 || torsoTranslationY >= 0.0) {
    inc = -inc;
    delta_angle = -delta_angle;
    count++;
  }
}


function alignLegs(){
  if (theta[leftUpperLegId] <= 180 && theta[rightUpperLegId] >= 180) {
    theta[leftUpperLegId] += 0.1;
    theta[rightUpperLegId] -= 0.1;
  }
  if (theta[leftUpperLegId] >= 180 && theta[rightUpperLegId] <= 180) {
    theta[leftUpperLegId] -= 0.1;
    theta[rightUpperLegId] += 0.1;
  }
  if ((theta[leftUpperLegId] <= 180 && theta[rightUpperLegId] <= 180) ||
  (theta[leftUpperLegId] >= 180 && theta[rightUpperLegId] >= 180)) {
    aligned = true;
  }
}

function turningBack() {

  if (!aligned) {
    alignLegs();
  }else{
    if (turningBackRotation <= 90) {
      turningBackRotation += 0.4;
      if (turningBackRotation <= 45) {
        theta[leftUpperLegId] -= 0.2;
        theta[rightUpperLegId] += 0.2;
        theta[leftLowerLegId] += 0.4;
        theta[rightLowerLegId] -= 0.4;
        torsoTranslationY -= 0.0005;
      }
      if (turningBackRotation >= 45) {
        theta[leftUpperLegId] += 0.2;
        theta[rightUpperLegId] -= 0.2;
        theta[leftLowerLegId] -= 0.4;
        theta[rightLowerLegId] += 0.4;
        torsoTranslationY += 0.0005;
      }
    }

    if (turningBackRotation >= 90) {
      isTurningBack = false;
      isLeaning = true;
    }
  }
}

function leaningAgainstTree() {
  if (!againstTree) {
    if (theta[leftUpperLegId] <= 200 && theta[rightUpperLegId] <= 200 && (!movingTorso)) {
      theta[leftUpperLegId] += 0.6;
    }
    if (theta[leftUpperLegId] >= 200) {
      movingTorso = true;
    }
    if (movingTorso && theta[leftUpperLegId] >= 180) {
      theta[leftUpperLegId] -= 0.4;
      scratchingTranslationX += 0.03;
      theta[rightUpperLegId] -= 0.4;
    }
    if (theta[leftUpperLegId] <= 180) {
      againstTree = true;
    }
  } else {
    if (scratchingTranslationX <= 1.8) {
      scratchingTranslationX += 0.01;
      scratchingTranslationY -= 0.0022;
    }
    if (theta[leftUpperLegId] >= 160) {
      theta[leftUpperLegId] -= 0.3;
    }
    if (theta[rightUpperLegId] >= 160) {
      theta[rightUpperLegId] -= 0.3;
    }
  }
  if (scratchingTranslationX >= 1.8 && theta[rightUpperLegId] <= 160 && theta[leftUpperLegId] <= 160) {
    isLeaning = false;
    isScratching = true;
  }
}


function walkingOnTwoFeets() {

  if (torsoTranslationX <= -0.5) {

    if ((theta[leftUpperLegId] <= 163 || theta[leftUpperLegId] >= 197)) {
      walkIncrement = -walkIncrement;
    }
    torsoTranslationX += 0.017;
    theta[leftUpperLegId] += walkIncrement;
    theta[rightUpperLegId] -= walkIncrement;
    theta[leftLowerLegId] += walkIncrement;
    theta[rightLowerLegId] -= walkIncrement;

  }
  if (torsoTranslationX >= -0.5) {
    isTurningBack = true;
    isWalkingOnTwoFeets = false;
  }

}


function startAnimation() {
  if(torsoTranslationX <= distance) {
    walking();
  }
  if(torsoTranslationX >= distance) {
    alignLegsAndArms();

    if(isStandingUp){
      standUp();
    }

    if(isWalkingOnTwoFeets) {
      walkingOnTwoFeets();
    }

    if(isTurningBack) {
      turningBack();
    }

    if(isLeaning) {
      leaningAgainstTree();
    }

    if(isScratching) {
      if (count <= 9) {
        scratching();
      } else {
        document.getElementById("animationButton").innerHTML = "Restart Animation";
        animationFlag = true;
      }
    }
  }
}

var render = function() {

  eye = vec3(radius * Math.sin(alpha) * Math.cos(phi),
        radius * Math.sin(alpha) * Math.sin(phi), radius * Math.cos(alpha));
  modelViewMatrix = lookAt(eye, at, up);

  if(animationFlag) {
    startAnimation();
  }

  for (i = 0; i < numNodes; i++) initNodes(i);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));

  gl.clear(gl.COLOR_BUFFER_BIT);
  traverse(torsoId);
  requestAnimationFrame(render);
}
