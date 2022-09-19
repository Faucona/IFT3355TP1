// ASSIGNMENT-SPECIFIC API EXTENSION
THREE.Object3D.prototype.setMatrix = function(a) {
  this.matrix = a;
  this.matrix.decompose(this.position, this.quaternion, this.scale);
};

var start = Date.now();
// SETUP RENDERER AND SCENE
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xffffff); // white background colour
document.body.appendChild(renderer.domElement);

// SETUP CAMERA
var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 1000); // view angle, aspect ratio, near, far
camera.position.set(10,5,10);
camera.lookAt(scene.position);
scene.add(camera);

// SETUP ORBIT CONTROL OF THE CAMERA
var controls = new THREE.OrbitControls(camera);
controls.damping = 0.2;

// ADAPT TO WINDOW RESIZE
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

window.addEventListener('resize', resize);
resize();

// FLOOR WITH CHECKERBOARD
var floorTexture = new THREE.ImageUtils.loadTexture('images/tile.jpg');
floorTexture.wrapS = floorTexture.wrapT = THREE.MirroredRepeatWrapping;
floorTexture.repeat.set(4, 4);

var floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
var floorGeometry = new THREE.PlaneBufferGeometry(15, 15);
var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = Math.PI / 2;
floor.position.y = 0.0;
scene.add(floor);

// TRANSFORMATIONS

function multMat(m1, m2){
  return new THREE.Matrix4().multiplyMatrices(m1, m2);
}

function inverseMat(m){
  return new THREE.Matrix4().getInverse(m, true);
}

function idMat4(){
  // Create Identity matrix

  // TODO
  return new THREE.Matrix4();


}

function translateMat(matrix, x, y, z){
  // Apply translation [x, y, z] to @matrix
  // matrix: THREE.Matrix3
  // x, y, z: float


  
  // TODO
  //translation matrix
  var translation = new THREE.Matrix4();
  translation.set(1, 0, 0, x,
                  0, 1, 0, y,
                  0, 0, 1, z,
                  0, 0, 0, 1);
  return multMat(matrix, translation);

  
}

function rotateMat(matrix, angle, axis){
  // Apply rotation by @angle with respect to @axis to @matrix
  // matrix: THREE.Matrix3
  // angle: float
  // axis: string "x", "y" or "z"
  
  // TODO
  var rotation = new THREE.Matrix4();
  if (axis == "x"){
    rotation.set(1, 0, 0, 0,
                 0, Math.cos(angle), -Math.sin(angle), 0,
                 0, Math.sin(angle), Math.cos(angle), 0,
                 0, 0, 0, 1);
  }
  else if (axis == "y"){

    rotation.set(Math.cos(angle), 0, Math.sin(angle), 0,
                 0, 1, 0, 0,
                 -Math.sin(angle), 0, Math.cos(angle), 0,
                 0, 0, 0, 1);
  }
  else if (axis == "z"){
    rotation.set(Math.cos(angle), -Math.sin(angle), 0, 0,
                 Math.sin(angle), Math.cos(angle), 0, 0,
                 0, 0, 1, 0,
                 0, 0, 0, 1);
  }
  return multMat(matrix, rotation);

}

function rotateVec3(v, angle, axis){
  // Apply rotation by @angle with respect to @axis to vector @v
  // v: THREE.Vector3
  // angle: float
  // axis: string "x", "y" or "z"
  
  // TODO
  //rotation vector
  var rotation = new THREE.Matrix4();
  if (axis == "x"){
    rotation.set(1, 0, 0, 0,
                 0, Math.cos(angle), -Math.sin(angle), 0,
                 0, Math.sin(angle), Math.cos(angle), 0,
                 0, 0, 0, 1);
  }
  else if (axis == "y"){
    rotation.set(Math.cos(angle), 0, Math.sin(angle), 0,
                 0, 1, 0, 0,
                 -Math.sin(angle), 0, Math.cos(angle), 0,
                 0, 0, 0, 1);
  }
  else if (axis == "z"){
    rotation.set(Math.cos(angle), -Math.sin(angle), 0, 0,
                 Math.sin(angle), Math.cos(angle), 0, 0,
                 0, 0, 1, 0,
                 0, 0, 0, 1);
  }
  return v.applyMatrix4(rotation);
}

function rescaleMat(matrix, x, y, z){
  // Apply scaling @x, @y and @z to @matrix
  // matrix: THREE.Matrix3
  // x, y, z: float
  
  // TODO
  var scaling = new THREE.Matrix4();
  scaling.set(x, 0, 0, 0,
              0, y, 0, 0,
              0, 0, z, 0,
              0, 0, 0, 1);
  return multMat(matrix, scaling);

}

class Robot {
  constructor() {
    // Geometry
    this.torsoHeight = 1.5;
    this.torsoRadius = 0.75;
    this.headRadius = 0.32;
    // Add parameters for parts
    // TODO
    

    // Animation
    this.walkDirection = new THREE.Vector3( 0, 0, 1 );

    // Material
    this.material = new THREE.MeshNormalMaterial();

    // Initial pose
    this.initialize()
  }

  initialTorsoMatrix(){
    var initialTorsoMatrix = idMat4();
    initialTorsoMatrix = translateMat(initialTorsoMatrix, 0,this.torsoHeight/2, 0);

    return initialTorsoMatrix;
  }

  initialHeadMatrix(){
    var initialHeadMatrix = idMat4();
    initialHeadMatrix = translateMat(initialHeadMatrix, 0, this.torsoHeight/2 + this.headRadius, 0);

    return initialHeadMatrix;
  }

  initialize() {
    // Torso
    var torsoGeometry = new THREE.CubeGeometry(2*this.torsoRadius, this.torsoHeight, this.torsoRadius, 64);
    this.torso = new THREE.Mesh(torsoGeometry, this.material);

    // Head
    var headGeometry = new THREE.CubeGeometry(2*this.headRadius, this.headRadius, this.headRadius);
    this.head = new THREE.Mesh(headGeometry, this.material);

    // Add parts
    // TODO
    //upper arm
    var upperArmGeometry = new THREE.CubeGeometry(2*this.upperArmRadius, this.upperArmHeight, this.upperArmRadius);
    this.upperArm = new THREE.Mesh(upperArmGeometry, this.material);
    //lower arm


    // Torse transformation
    this.torsoInitialMatrix = this.initialTorsoMatrix();
    this.torsoMatrix = idMat4();
    this.torso.setMatrix(this.torsoInitialMatrix);

    // Head transformation
    this.headInitialMatrix = this.initialHeadMatrix();
    this.headMatrix = idMat4();
    var matrix = multMat(this.torsoInitialMatrix, this.headInitialMatrix);
    this.head.setMatrix(matrix);

    // Add transformations
    // TODO
    
	// Add robot to scene
	scene.add(this.torso);
    scene.add(this.head);
    // Add parts
    // TODO
    scene.add(this.upperArm);
    scene.add(this.lowerArm);
    scene.add(this.upperLeg);
    scene.add(this.lowerLeg);
    
  }

  rotateTorso(angle){
    var torsoMatrix = this.torsoMatrix;

    this.torsoMatrix = idMat4();
    this.torsoMatrix = rotateMat(this.torsoMatrix, angle, "y");
    this.torsoMatrix = multMat(torsoMatrix, this.torsoMatrix);

    var matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
    this.torso.setMatrix(matrix);

    var matrix2 = multMat(this.headMatrix, this.headInitialMatrix);
    matrix = multMat(matrix, matrix2);
    this.head.setMatrix(matrix);

    this.walkDirection = rotateVec3(this.walkDirection, angle, "y");
  }

  moveTorso(speed){
    this.torsoMatrix = translateMat(this.torsoMatrix, speed * this.walkDirection.x, speed * this.walkDirection.y, speed * this.walkDirection.z);

    var matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
    this.torso.setMatrix(matrix);

    var matrix2 = multMat(this.headMatrix, this.headInitialMatrix);
    matrix = multMat(matrix, matrix2);
    this.head.setMatrix(matrix);
  }

  rotateHead(angle){
    var headMatrix = this.headMatrix;

    this.headMatrix = idMat4();
    this.headMatrix = rotateMat(this.headMatrix, angle, "y");
    this.headMatrix = multMat(headMatrix, this.headMatrix);

    var matrix = multMat(this.headMatrix, this.headInitialMatrix);
    matrix = multMat(this.torsoMatrix, matrix);
    matrix = multMat(this.torsoInitialMatrix, matrix);
    this.head.setMatrix(matrix);
  }

  // Add methods for other parts
  // TODO

  rotateUpperArm(angle){
    var upperArmMatrix = this.upperArmMatrix;

    this.upperArmMatrix = idMat4();
    this.upperArmMatrix = rotateMat(this.upperArmMatrix, angle, "y");
    this.upperArmMatrix = multMat(upperArmMatrix, this.upperArmMatrix);

    var matrix = multMat(this.upperArmMatrix, this.upperArmInitialMatrix);
    matrix = multMat(this.torsoMatrix, matrix);
    matrix = multMat(this.torsoInitialMatrix, matrix);
    this.upperArm.setMatrix(matrix);
  }

  moveUpperArm(speed){
    this.upperArmMatrix = translateMat(this.upperArmMatrix, speed * this.walkDirection.x, speed * this.walkDirection.y, speed * this.walkDirection.z);
    var matrix = multMat(this.upperArmMatrix, this.upperArmInitialMatrix);
    matrix = multMat(this.torsoMatrix, matrix);
    matrix = multMat(this.torsoInitialMatrix, matrix);
    this.upperArm.setMatrix(matrix);
  }

  rotateLowerArm(angle){
    var lowerArmMatrix = this.lowerArmMatrix;

    this.lowerArmMatrix = idMat4();
    this.lowerArmMatrix = rotateMat(this.lowerArmMatrix, angle, "y");
    this.lowerArmMatrix = multMat(lowerArmMatrix, this.lowerArmMatrix);

    var matrix = multMat(this.lowerArmMatrix, this.lowerArmInitialMatrix);
    matrix = multMat(this.upperArmMatrix, matrix);
    matrix = multMat(this.upperArmInitialMatrix, matrix);
    matrix = multMat(this.torsoMatrix, matrix);
    matrix = multMat(this.torsoInitialMatrix, matrix);
    this.lowerArm.setMatrix(matrix);
  }

  moveLowerArm(speed){
    this.lowerArmMatrix = translateMat(this.lowerArmMatrix, speed * this.walkDirection.x, speed * this.walkDirection.y, speed * this.walkDirection.z);
    var matrix = multMat(this.lowerArmMatrix, this.lowerArmInitialMatrix);
    matrix = multMat(this.upperArmMatrix, matrix);
    matrix = multMat(this.upperArmInitialMatrix, matrix);
    matrix = multMat(this.torsoMatrix, matrix);
    matrix = multMat(this.torsoInitialMatrix, matrix);
    this.lowerArm.setMatrix(matrix);
  }

  rotateUpperLeg(angle){
    var upperLegMatrix = this.upperLegMatrix;

    this.upperLegMatrix = idMat4();
    this.upperLegMatrix = rotateMat(this.upperLegMatrix, angle, "y");
    this.upperLegMatrix = multMat(upperLegMatrix, this.upperLegMatrix);

    var matrix = multMat(this.upperLegMatrix, this.upperLegInitialMatrix);
    matrix = multMat(this.torsoMatrix, matrix);
    matrix = multMat(this.torsoInitialMatrix, matrix);
    this.upperLeg.setMatrix(matrix);
  }

  moveUpperLeg(speed){
    this.upperLegMatrix = translateMat(this.upperLegMatrix, speed * this.walkDirection.x, speed * this.walkDirection.y, speed * this.walkDirection.z);
    var matrix = multMat(this.upperLegMatrix, this.upperLegInitialMatrix);
    matrix = multMat(this.torsoMatrix, matrix);
    matrix = multMat(this.torsoInitialMatrix, matrix);
    this.upperLeg.setMatrix(matrix);
  }

  rotateLowerLeg(angle){
    var lowerLegMatrix = this.lowerLegMatrix;

    this.lowerLegMatrix = idMat4();
    this.lowerLegMatrix = rotateMat(this.lowerLegMatrix, angle, "y");
    this.lowerLegMatrix = multMat(lowerLegMatrix, this.lowerLegMatrix);

    var matrix = multMat(this.lowerLegMatrix, this.lowerLegInitialMatrix);
    matrix = multMat(this.upperLegMatrix, matrix);
    matrix = multMat(this.upperLegInitialMatrix, matrix);
    matrix = multMat(this.torsoMatrix, matrix);
    matrix = multMat(this.torsoInitialMatrix, matrix);
    this.lowerLeg.setMatrix(matrix);
  }

  moveLowerLeg(speed){
    this.lowerLegMatrix = translateMat(this.lowerLegMatrix, speed * this.walkDirection.x, speed * this.walkDirection.y, speed * this.walkDirection.z);
    var matrix = multMat(this.lowerLegMatrix, this.lowerLegInitialMatrix);
    matrix = multMat(this.upperLegMatrix, matrix);
    matrix = multMat(this.upperLegInitialMatrix, matrix);
    matrix = multMat(this.torsoMatrix, matrix);
    matrix = multMat(this.torsoInitialMatrix, matrix);
    this.lowerLeg.setMatrix(matrix);
  }


}

var robot = new Robot();

// LISTEN TO KEYBOARD
var keyboard = new THREEx.KeyboardState();

var selectedRobotComponent = 0;
var components = [
  "Torso",
  "Head",
  // Add parts names
  // TODO
  "Upper arm",
  "Lower arm",
  "Upper leg",
  "Lower leg"
];
var numberComponents = components.length;

function checkKeyboard() {
  // Next element
  if (keyboard.pressed("e")){
    selectedRobotComponent = selectedRobotComponent + 1;

    if (selectedRobotComponent<0){
      selectedRobotComponent = numberComponents - 1;
    }

    if (selectedRobotComponent >= numberComponents){
      selectedRobotComponent = 0;
    }

    window.alert(components[selectedRobotComponent] + " selected");
  }

  // Previous element
  if (keyboard.pressed("q")){
    selectedRobotComponent = selectedRobotComponent - 1;

    if (selectedRobotComponent < 0){
      selectedRobotComponent = numberComponents - 1;
    }

    if (selectedRobotComponent >= numberComponents){
      selectedRobotComponent = 0;
    }

    window.alert(components[selectedRobotComponent] + " selected");
  }

  // UP
  if (keyboard.pressed("w")){
    switch (components[selectedRobotComponent]){
      case "Torso":
        robot.moveTorso(0.1);
        break;
      case "Head":
        break;
      // Add more cases
      // TODO
      case "Upper arm":
        break;
      case "Lower arm":
        break;
      case "Upper leg":
        break;
      case "Lower leg":
        break;
    }
  }

  // DOWN
  if (keyboard.pressed("s")){
    switch (components[selectedRobotComponent]){
      case "Torso":
        robot.moveTorso(-0.1);
        break;
      case "Head":
        break;
      // Add more cases
      // TODO
      case "Upper arm":
        robot.rotateUpperArm(0.1);
        break;
      case "Lower arm":
        robot.rotateLowerArm(0.1);
        break;
      case "Upper leg":
        robot.rotateUpperLeg(0.1);
        break;
      case "Lower leg":
        robot.rotateLowerLeg(0.1);
        break;
      
    }
  }

  // LEFT
  if (keyboard.pressed("a")){
    switch (components[selectedRobotComponent]){
      case "Torso":
        robot.rotateTorso(0.1);
        break;
      case "Head":
        robot.rotateHead(0.1);
        break;
      // Add more cases
      // TODO
      case "Upper arm":
        robot.rotateUpperArm(0.1);
        break;
      case "Lower arm":
        robot.rotateLowerArm(0.1);
        break;
      case "Upper leg":
        robot.rotateUpperLeg(0.1);
        break;
      case "Lower leg":
        robot.rotateLowerLeg(0.1);
        break;
      
    }
  }

  // RIGHT
  if (keyboard.pressed("d")){
    switch (components[selectedRobotComponent]){
      case "Torso":
        robot.rotateTorso(-0.1);
        break;
      case "Head":
        robot.rotateHead(-0.1);
        break;
      // Add more cases
      // TODO
      case "Upper arm":
        robot.rotateUpperArm(-0.1);
        break;
      case "Lower arm":
        robot.rotateLowerArm(-0.1);
        break;
      case "Upper leg":
        robot.rotateUpperLeg(-0.1);
        break;
      case "Lower leg":
        robot.rotateLowerLeg(-0.1);
        break;


    }
  }
}

// SETUP UPDATE CALL-BACK
function update() {
  checkKeyboard();
  requestAnimationFrame(update);
  renderer.render(scene, camera);
}

update();