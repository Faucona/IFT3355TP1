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

  var translateMat = idMat4();
  translateMat.set(1, 0, 0, x,
                  0, 1, 0, y,
                  0, 0, 1, z,
                  0, 0, 0, 1);
  return multMat(matrix, translateMat);


}

function rotateMat(matrix, angle, axis){
  // Apply rotation by @angle with respect to @axis to @matrix
  // matrix: THREE.Matrix3
  // angle: float
  // axis: string "x", "y" or "z"
  
  // TODO
  var rotateMat = idMat4();
  if (axis == "x"){
    rotateMat.set(1, 0, 0, 0,
                  0, Math.cos(angle), -Math.sin(angle), 0,
                  0, Math.sin(angle), Math.cos(angle), 0,
                  0, 0, 0, 1);
  }
  else if (axis == "y"){

    rotateMat.set(Math.cos(angle), 0, Math.sin(angle), 0,
                  0, 1, 0, 0,
                  -Math.sin(angle), 0, Math.cos(angle), 0,
                  0, 0, 0, 1);
  }
  else if (axis == "z"){
    rotateMat.set(Math.cos(angle), -Math.sin(angle), 0, 0,
                  Math.sin(angle), Math.cos(angle), 0, 0,
                  0, 0, 1, 0,
                  0, 0, 0, 1);
  }
  return multMat(matrix, rotateMat);


}

function rotateVec3(v, angle, axis){
  // Apply rotation by @angle with respect to @axis to vector @v
  // v: THREE.Vector3
  // angle: float
  // axis: string "x", "y" or "z"
  
  // TODO
  var rotateVec = idMat4();
  if (axis == "x"){
    rotateVec.set(1, 0, 0, 0,
                 0, Math.cos(angle), -Math.sin(angle), 0,
                 0, Math.sin(angle), Math.cos(angle), 0,
                 0, 0, 0, 1);
  }
  else if (axis == "y"){
    rotateVec.set(Math.cos(angle), 0, Math.sin(angle), 0,
                 0, 1, 0, 0,
                 -Math.sin(angle), 0, Math.cos(angle), 0,
                 0, 0, 0, 1);
  }
  else if (axis == "z"){
    rotateVec.set(Math.cos(angle), -Math.sin(angle), 0, 0,
                 Math.sin(angle), Math.cos(angle), 0, 0,
                 0, 0, 1, 0,
                 0, 0, 0, 1);
  }
  return v.applyMatrix4(rotateVec);

}

function rescaleMat(matrix, x, y, z){
  // Apply scaling @x, @y and @z to @matrix
  // matrix: THREE.Matrix3
  // x, y, z: float
  
  // TODO

  var rescaleMat = idMat4();
  rescaleMat.set(x, 0, 0, 0,
              0, y, 0, 0,
              0, 0, z, 0,
              0, 0, 0, 1);
  return multMat(matrix, rescaleMat);
}

class Robot {
  constructor() {
    // Geometry
    this.torsoHeight = 1.5;
    this.torsoRadius = 0.75;
    this.headRadius = 0.32;

    this.armRadius = 0.5;
    this.armWidth = 3;
    this.armHeight = 2;


    this.forearmRadius = 0.5;
    this.forearmWidth = 3;
    this.forearmHeight = 2;


    this.legRadius = 0.5;
    this.legWidth  = 3;
    this.legHeight = 2;

    this.tightRadius = 0.5;
    this.tightWidth  = 3;
    this.tightHeight = 2;
    
    
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
    initialTorsoMatrix = translateMat(initialTorsoMatrix, 0,this.torsoHeight/2 + this.tightHeight/2 + this.tightHeight/2, 0);

    return initialTorsoMatrix;
  }

  initialHeadMatrix(){
    var initialHeadMatrix = idMat4();
    initialHeadMatrix = translateMat(initialHeadMatrix, 0, this.torsoHeight/2 + this.headRadius, 0);

    return initialHeadMatrix;
  }

   initialLeftArmMatrix(){
    var initialLeftArmMatrix = idMat4();
    initialLeftArmMatrix = translateMat(initialLeftArmMatrix, -this.torsoHeight/2 - this.armRadius ,this.torsoHeight/2 - this.armRadius, 0);

    return initialLeftArmMatrix;
  }

   initialLeftForearmMatrix(){
    var initialLeftForearmMatrix = idMat4();
    initialLeftForearmMatrix = translateMat(initialLeftForearmMatrix, -this.torsoHeight/2 - this.armRadius ,this.torsoHeight/2 - this.armRadius - this.forearmRadius, 0);

    //this.torsoHeight - this.armRadius - this.forearmRadius
    return initialLeftForearmMatrix;
  }
  initialRightArmMatrix(){
    var initialRightArmMatrix = idMat4();
    initialRightArmMatrix = translateMat(initialRightArmMatrix , this.torsoHeight/2 + this.armRadius ,this.torsoHeight/2 - this.armRadius, 0);

    return initialRightArmMatrix;
  }

  initialRightForearmMatrix(){
    var initialRightForearmMatrix = idMat4();
    initialRightForearmMatrix =translateMat(initialRightForearmMatrix, this.torsoHeight/2 + this.armRadius ,this.torsoHeight/2 - this.armRadius - this.forearmRadius, 0);

    //this.torsoHeight - this.armRadius - this.forearmRadius
    return initialRightForearmMatrix;
  }


   initialRightTightMatrix(){
    var initialRightTightMatrix = idMat4();
    initialRightTightMatrix =translateMat(initialRightTightMatrix, this.torsoHeight/2  ,-this.torsoHeight/2 - this.tightRadius, 0);

    //this.torsoHeight - this.armRadius - this.forearmRadius
    return initialRightTightMatrix;
  }

   initialRightLegMatrix(){
    var initialRightLegMatrix = idMat4();
    initialRightLegMatrix =translateMat(initialRightLegMatrix, this.torsoHeight/2,-this.torsoHeight/2 - this.tightRadius - this.legRadius, 0);

    //this.torsoHeight - this.armRadius - this.forearmRadius
    return initialRightLegMatrix;
  }

   initialLeftTightMatrix(){
    var initialLeftTightMatrix = idMat4();
    initialLeftTightMatrix =translateMat(initialLeftTightMatrix, -this.torsoHeight/2  ,-this.torsoHeight/2 - this.tightRadius , 0);

    //this.torsoHeight - this.armRadius - this.forearmRadius
    return initialLeftTightMatrix;
  }

   initialLeftLegMatrix(){
    var initialLeftLegMatrix = idMat4();
    initialLeftLegMatrix =translateMat(initialLeftLegMatrix,- this.torsoHeight/2 ,-this.torsoHeight/2 - this.tightRadius - this.legRadius, 0);

    //this.torsoHeight - this.armRadius - this.forearmRadius
    return initialLeftLegMatrix;
  }

  initialize() {
    // Torso
    var torsoGeometry = new THREE.CubeGeometry(2*this.torsoRadius, this.torsoHeight , this.torsoRadius, 64);
    this.torso = new THREE.Mesh(torsoGeometry, this.material);

    // Head
    var headGeometry = new THREE.CubeGeometry(2*this.headRadius, this.headRadius, this.headRadius);
    this.head = new THREE.Mesh(headGeometry, this.material);

    // Add parts
    // TODO

    var armGeometry = new THREE.SphereGeometry(this.armRadius, this.armWidth, this.armHeight);
    this.leftArm = new THREE.Mesh(armGeometry, this.material);
    this.rightArm = new THREE.Mesh(armGeometry, this.material);

    var forearmGeometry = new THREE.SphereGeometry(this.forearmRadius, this.forearmWidth, this.forearmHeight);
    this.leftForearm = new THREE.Mesh(forearmGeometry, this.material);
    this.rightForearm = new THREE.Mesh(forearmGeometry, this.material);


    var legGeometry = new THREE.SphereGeometry(this.legRadius, this.legWidth, this.legHeight);
    this.leftLeg = new THREE.Mesh(legGeometry, this.material);
    this.rightLeg = new THREE.Mesh(legGeometry, this.material);

    var tightGeometry = new THREE.SphereGeometry(this.tightRadius, this.tightWidth, this.tightHeight);
    this.leftTight= new THREE.Mesh(tightGeometry, this.material);
    this.rightTight = new THREE.Mesh(tightGeometry, this.material);

    //var rightArmGeometry = new THREE.SphereGeometry(this.armRadius, this.armHeight, this.armRadius);
    //this.rightArm = new THREE.Mesh(rightArmGeometry, this.material);


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

    //var matrix3 = multMat(this.leftForearmMatrix, this.initialLeftForearmMatrix);
    //matrix3 = multMat(this.torsoMatrix, matrix3);
//*******************************************ARM**************************************************
    this.initialLeftArmMatrix = this.initialLeftArmMatrix();
    this.leftArmMatrix = idMat4();

    //var matrix = multMat(this.leftArmMatrix, this.initialLeftArmMatrix);
    var matrix = multMat(this.torsoInitialMatrix, this.initialLeftArmMatrix);
    this.leftArm.setMatrix(matrix)

    this.initialRightArmMatrix = this.initialRightArmMatrix();
    this.rightArmMatrix = idMat4();
    var matrix = multMat(this.torsoInitialMatrix, this.initialRightArmMatrix);
    this.rightArm.setMatrix(matrix)

    this.initialLeftForearmMatrix = this.initialLeftForearmMatrix();
    this.leftForearmMatrix = idMat4();
    var matrix = multMat(this.torsoInitialMatrix, this.initialLeftForearmMatrix);
    this.leftForearm.setMatrix(matrix )

    this.initialRightForearmMatrix = this.initialRightForearmMatrix();
    this.rightForearmMatrix = idMat4();
    var matrix = multMat(this.torsoInitialMatrix, this.initialRightForearmMatrix);
    this.rightForearm.setMatrix(matrix )

    //*******************************************LEG**************************************************
    this.initialLeftLegMatrix = this.initialLeftLegMatrix();
    this.leftLegMatrix = idMat4();
    var matrix = multMat(this.torsoInitialMatrix, this.initialLeftLegMatrix);
    this.leftLeg.setMatrix(matrix)

    this.initialLeftTightMatrix = this.initialLeftTightMatrix();
    this.leftTightMatrix = idMat4();
    var matrix = multMat(this.torsoInitialMatrix, this.initialLeftTightMatrix);
    this.leftTight.setMatrix(matrix)


    this.initialRightLegMatrix = this.initialRightLegMatrix();
    this.rightLegMatrix = idMat4();
    var matrix = multMat(this.torsoInitialMatrix, this.initialRightLegMatrix);
    this.rightLeg.setMatrix(matrix)

    this.initialRightTightMatrix = this.initialRightTightMatrix();
    this.rightTightMatrix = idMat4();
    var matrix = multMat(this.torsoInitialMatrix, this.initialRightTightMatrix);
    this.rightTight.setMatrix(matrix)


//initialLeftTightMatrix()
  // Add robot to scene
    scene.add(this.torso);
    scene.add(this.head);
    scene.add(this.leftArm);
    scene.add(this.rightArm);
    scene.add(this.leftForearm);
    scene.add(this.rightForearm);
    scene.add(this.leftLeg);
    scene.add(this.rightLeg);
    scene.add(this.leftTight);
    scene.add(this.rightTight);
    // Add parts
    // TODO
  }

  rotateTorso(angle){
    var torsoMatrix = this.torsoMatrix;

    this.torsoMatrix = idMat4();
    this.torsoMatrix = rotateMat(this.torsoMatrix, angle, "y");
    this.torsoMatrix = multMat(torsoMatrix, this.torsoMatrix);

    var matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
    this.torso.setMatrix(matrix);

    var matrix2 = multMat(this.headMatrix, this.headInitialMatrix);
    matrix2 = multMat(matrix, matrix2);
    this.head.setMatrix(matrix2);


    var matrix3 = multMat(this.leftForearmMatrix, this.initialLeftForearmMatrix);
    matrix3 = multMat(matrix, matrix3);
    this.leftForearm.setMatrix(matrix3);

    var matrix4 = multMat(this.rightForearmMatrix, this.initialRightForearmMatrix);
    matrix4 = multMat(matrix, matrix4);
    this.rightForearm.setMatrix(matrix4);


    var matrix5 = multMat(this.leftArmMatrix, this.initialLeftArmMatrix);
    matrix5 = multMat(matrix, matrix5);
    this.leftArm.setMatrix(matrix5);

    var matrix6 = multMat(this.rightArmMatrix, this.initialRightArmMatrix);
    matrix6 = multMat(matrix, matrix6);
    this.rightArm.setMatrix(matrix6);




    var matrix7 = multMat(this.leftLegMatrix, this.initialLeftLegMatrix);
    matrix7 = multMat(matrix, matrix7);
    this.leftLeg.setMatrix(matrix7);

    var matrix8 = multMat(this.rightLegMatrix, this.initialRightLegMatrix);
    matrix8 = multMat(matrix, matrix8);
    this.rightLeg.setMatrix(matrix8);


    var matrix9 = multMat(this.leftTightMatrix, this.initialLeftTightMatrix);
    matrix9 = multMat(matrix, matrix9);
    this.leftTight.setMatrix(matrix9);

    var matrix10 = multMat(this.rightTightMatrix, this.initialRightTightMatrix);
    matrix10 = multMat(matrix, matrix10);
    this.rightTight.setMatrix(matrix10);


    this.walkDirection = rotateVec3(this.walkDirection, angle, "y");
  }

  moveTorso(speed){
    this.torsoMatrix = translateMat(this.torsoMatrix, speed * this.walkDirection.x, speed * this.walkDirection.y, speed * this.walkDirection.z);
    var matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
    this.torso.setMatrix(matrix);


    var matrix2 = multMat(this.headMatrix, this.headInitialMatrix);
    matrix2 = multMat(matrix, matrix2);
    this.head.setMatrix(matrix2);

   
    var matrix3 = multMat(this.leftForearmMatrix, this.initialLeftForearmMatrix);
    matrix3 = multMat(matrix, matrix3);
    this.leftForearm.setMatrix(matrix3);

    var matrix4 = multMat(this.rightForearmMatrix, this.initialRightForearmMatrix);
    matrix4 = multMat(matrix, matrix4);
    this.rightForearm.setMatrix(matrix4);


    var matrix5 = multMat(this.leftArmMatrix, this.initialLeftArmMatrix);
    matrix5 = multMat(matrix, matrix5);
    this.leftArm.setMatrix(matrix5);

    var matrix6 = multMat(this.rightArmMatrix, this.initialRightArmMatrix);
    matrix6 = multMat(matrix, matrix6);
    this.rightArm.setMatrix(matrix6);



    var matrix7 = multMat(this.leftLegMatrix, this.initialLeftLegMatrix);
    matrix7 = multMat(matrix, matrix7);
    this.leftLeg.setMatrix(matrix7);

    var matrix8 = multMat(this.rightLegMatrix, this.initialRightLegMatrix);
    matrix8 = multMat(matrix, matrix8);
    this.rightLeg.setMatrix(matrix8);


    var matrix9 = multMat(this.leftTightMatrix, this.initialLeftTightMatrix);
    matrix9 = multMat(matrix, matrix9);
    this.leftTight.setMatrix(matrix9);

    var matrix10 = multMat(this.rightTightMatrix, this.initialRightTightMatrix);
    matrix10 = multMat(matrix, matrix10);
    this.rightTight.setMatrix(matrix10);


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


   rotateLeftArmX(angle){
    //console.log("there")
      var armMatrix = this.leftArmMatrix ;
      //debugger;
      this.leftArmMatrix = idMat4();
      this.leftArmMatrix = rotateMat(this.leftArmMatrix, angle, "x");
      //console.log(rotateMat(this.armMatrix, angle, "y"));
      this.leftArmMatrix= multMat(armMatrix, this.leftArmMatrix);

      var matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
      var matrix2 = multMat(this.leftArmMatrix, this.initialLeftArmMatrix);
      matrix2 = multMat(matrix, matrix2);
      //matrix = multMat(this.initialLeftForearmMatrix, matrix);
      this.leftArm.setMatrix(matrix2);


      this.rotateLeftForearmX(angle);
    
    }
   rotateLeftArmY(angle){
    // console.log("here")
    var armMatrix = this.leftArmMatrix ;
    //debugger;
    this.leftArmMatrix = idMat4();
    this.leftArmMatrix = rotateMat(this.leftArmMatrix, angle, "y");
    //console.log(rotateMat(this.armMatrix, angle, "y"));
    this.leftArmMatrix = multMat(armMatrix, this.leftArmMatrix);

    var matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
    var matrix2 = multMat(this.leftArmMatrix, this.initialLeftArmMatrix);
    matrix2 = multMat(matrix, matrix2);
    //matrix = multMat(this.initialLeftForearmMatrix, matrix);
    this.leftArm.setMatrix(matrix2);


    //this.rotateLeftForearm(angle);

    var forearmMatrix = this.leftForearmMatrix ;
    //debugger;
    this.leftForearmMatrix = idMat4();
    this.leftForearmMatrix = rotateMat(this.leftForearmMatrix, angle, "y");
    this.leftForearmMatrix = multMat(forearmMatrix, this.leftForearmMatrix);



    var matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
    var matrix2 = multMat(this.leftForearmMatrix, this.initialLeftForearmMatrix);
    matrix2 = multMat(matrix, matrix2);
    //matrix = multMat(this.torsoInitialMatrix, matrix);
    this.leftForearm.setMatrix(matrix2);
  
  }

  rotateLeftForearm(angle){



    var forearmMatrix = this.leftForearmMatrix ;
    //debugger;
    this.leftForearmMatrix = idMat4();
    this.leftForearmMatrix = rotateMat(this.leftForearmMatrix, angle, "y");
    this.leftForearmMatrix = multMat(forearmMatrix, this.leftForearmMatrix);



    var matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
    var matrix2 = multMat(this.leftForearmMatrix, this.initialLeftForearmMatrix);
    matrix2 = multMat(matrix, matrix2);
    //matrix = multMat(this.torsoInitialMatrix, matrix);
    this.leftForearm.setMatrix(matrix2);



    var armMatrix = this.leftArmMatrix ;
    //debugger;
    this.leftArmMatrix = idMat4();
    this.leftArmMatrix = rotateMat(this.leftArmMatrix, angle, "y");
    //console.log(rotateMat(this.armMatrix, angle, "y"));
    this.leftArmMatrix = multMat(armMatrix, this.leftArmMatrix);


    var matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
    var matrix2 = multMat(this.leftArmMatrix, this.initialLeftArmMatrix);
    matrix2 = multMat(matrix, matrix2);
    //matrix = multMat(this.initialLeftForearmMatrix, matrix);
    this.leftArm.setMatrix(matrix2);
  
  }

    rotateLeftForearmX(angle){



    var forearmMatrix = this.leftForearmMatrix ;
    //debugger;
    this.leftForearmMatrix = idMat4();
    this.leftForearmMatrix = rotateMat(this.leftForearmMatrix, angle, "x");
    this.leftForearmMatrix = multMat(forearmMatrix, this.leftForearmMatrix);




    var matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
    var matrix2 = multMat(this.leftForearmMatrix, this.initialLeftForearmMatrix);
    matrix2 = multMat(matrix, matrix2);
    //matrix = multMat(this.torsoInitialMatrix, matrix);
    this.leftForearm.setMatrix(matrix2);


  
  }


    rotateRightArmX(angle){
    var armMatrix = this.rightArmMatrix ;
    //debugger;
    this.rightArmMatrix = idMat4();
    this.rightArmMatrix = rotateMat(this.rightArmMatrix, angle, "x");
    this.rightArmMatrix = multMat(armMatrix, this.rightArmMatrix);

    var matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
    var matrix2 = multMat(this.rightArmMatrix, this.initialRightArmMatrix);
    matrix2 = multMat(matrix, matrix2);
    this.rightArm.setMatrix(matrix2);
    
    this.rotateRightForearmX(angle);
   
  }


  rotateRightArmY(angle){
    var armMatrix = this.rightArmMatrix ;
    //debugger;
    this.rightArmMatrix = idMat4();
    this.rightArmMatrix = rotateMat(this.rightArmMatrix, angle, "y");
    this.rightArmMatrix = multMat(armMatrix, this.rightArmMatrix);


    var matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
    var matrix2 = multMat(this.rightArmMatrix, this.initialRightArmMatrix);
    matrix2 = multMat(matrix, matrix2);
    this.rightArm.setMatrix(matrix2);
    
    //this.rotateRightForearm(angle);

    var forearmMatrix = this.rightForearmMatrix ;
    //debugger;
    this.rightForearmMatrix = idMat4();
    this.rightForearmMatrix= rotateMat(this.rightForearmMatrix, angle, "y");
    this.rightForearmMatrix = multMat(forearmMatrix, this.rightForearmMatrix);


    var matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
    var matrix2 = multMat(this.rightForearmMatrix, this.initialRightForearmMatrix);
    matrix2 = multMat(matrix, matrix2);
    //matrix = multMat(this.torsoInitialMatrix, matrix);
    this.rightForearm.setMatrix(matrix2);
   
  }

   rotateRightForearm(angle){
    var forearmMatrix = this.rightForearmMatrix ;
    //debugger;
    this.rightForearmMatrix = idMat4();
    this.rightForearmMatrix= rotateMat(this.rightForearmMatrix, angle, "y");
    this.rightForearmMatrix = multMat(forearmMatrix, this.rightForearmMatrix);

    var matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
    var matrix2 = multMat(this.rightForearmMatrix, this.initialRightForearmMatrix);
    matrix2 = multMat(matrix, matrix2);
    //matrix = multMat(this.torsoInitialMatrix, matrix);
    this.rightForearm.setMatrix(matrix2);

     var armMatrix = this.rightArmMatrix ;
    //debugger;
    this.rightArmMatrix = idMat4();
    this.rightArmMatrix = rotateMat(this.rightArmMatrix, angle, "y");
    this.rightArmMatrix = multMat(armMatrix, this.rightArmMatrix);

    var matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
    var matrix2 = multMat(this.rightArmMatrix, this.initialRightArmMatrix);
    matrix2 = multMat(matrix, matrix2);
    this.rightArm.setMatrix(matrix2);
  }

  rotateRightForearmX(angle){
    var forearmMatrix = this.rightForearmMatrix ;
    //debugger;
    this.rightForearmMatrix = idMat4();
    this.rightForearmMatrix= rotateMat(this.rightForearmMatrix, angle, "x");
    this.rightForearmMatrix = multMat(forearmMatrix, this.rightForearmMatrix);


    var matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
    var matrix2 = multMat(this.rightForearmMatrix, this.initialRightForearmMatrix);
    matrix2 = multMat(matrix, matrix2);
    //matrix = multMat(this.torsoInitialMatrix, matrix);
    this.rightForearm.setMatrix(matrix2);

  
  }
//*****************************************************************************************************************

 rotateLeftLeg(angle){
    //console.log("there")
      var legMatrix = this.leftLegMatrix ;
      //debugger;
      this.leftLegMatrix = idMat4();
      this.leftLegMatrix = rotateMat(this.leftLegMatrix, angle, "x");
      //console.log(rotateMat(this.armMatrix, angle, "y"));
      this.leftLegMatrix = multMat(legMatrix, this.leftLegMatrix);

      var matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
      var matrix2 = multMat(this.leftLegMatrix, this.initialLeftLegMatrix);

      matrix2 = multMat(matrix, matrix2);
      //matrix = multMat(this.initialLeftForearmMatrix, matrix);
      this.leftLeg.setMatrix(matrix2);
    }
   

  rotateLeftTight(angle){



    var tightMatrix = this.leftTightMatrix ;
    //debugger;
    this.leftTightMatrix = idMat4();
    this.leftTightMatrix = rotateMat(this.leftTightMatrix, angle, "x");
    this.leftTightMatrix = multMat(tightMatrix, this.leftTightMatrix);



    var matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
    var matrix2 = multMat(this.leftTightMatrix, this.initialLeftTightMatrix);
    matrix2 = multMat(matrix, matrix2);
    //matrix = multMat(this.torsoInitialMatrix, matrix);
    this.leftTight.setMatrix(matrix2);



    //var armMatrix = this.leftArmMatrix ;
    //debugger;
    //this.leftArmMatrix = idMat4();
    //this.leftArmMatrix = rotateMat(this.leftArmMatrix, angle, "x");
    //console.log(rotateMat(this.armMatrix, angle, "y"));
    //this.leftArmMatrix = multMat(armMatrix, this.leftArmMatrix);

    //var matrix = multMat(this.leftArmMatrix, this.initialLeftArmMatrix);
    //matrix = multMat(this.torsoMatrix, matrix);
    //matrix = multMat(this.initialLeftForearmMatrix, matrix);
    //this.leftArm.setMatrix(matrix);
  
  }


    rotateRightLeg(angle){
    var legMatrix = this.rightLegMatrix ;
    //debugger;
    this.rightLegMatrix = idMat4();
    this.rightLegMatrix = rotateMat(this.rightLegMatrix, angle, "x");
    this.rightLegMatrix = multMat(legMatrix, this.rightLegMatrix);


    var matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
    var matrix2 = multMat(this.rightLegMatrix, this.initialRightLegMatrix);
    matrix2 = multMat(matrix, matrix2);
    this.rightLeg.setMatrix(matrix2);
    
    //this.rotateRightForearmX(angle);
   
  }


  rotateRightTight(angle){
    var tightMatrix = this.rightTightMatrix ;
    //debugger;
    this.rightTightMatrix = idMat4();
    this.rightTightMatrix = rotateMat(this.rightTightMatrix, angle, "x");
    this.rightTightMatrix = multMat(tightMatrix, this.rightTightMatrix);


    var matrix = multMat(this.torsoMatrix, this.torsoInitialMatrix);
    var matrix2 = multMat(this.rightTightMatrix, this.initialRightTightMatrix);
    matrix2 = multMat(matrix , matrix2);
    this.rightTight.setMatrix(matrix2);
    
    //this.rotateRightForearm(angle);

    //var forearmMatrix = this.rightForearmMatrix ;
    //debugger;
    //this.rightForearmMatrix = idMat4();
    //this.rightForearmMatrix= rotateMat(this.rightForearmMatrix, angle, "x");
    //this.rightForearmMatrix = multMat(forearmMatrix, this.rightForearmMatrix);

    //var matrix = multMat(this.rightForearmMatrix, this.initialRightForearmMatrix);
    //matrix = multMat(this.torsoMatrix, matrix);
    //matrix = multMat(this.torsoInitialMatrix, matrix);
    //this.rightForearm.setMatrix(matrix);
   
  }

  




  // Add methods for other parts
  // TODO
}

var robot = new Robot();

// LISTEN TO KEYBOARD
var keyboard = new THREEx.KeyboardState();

var selectedRobotComponent = 0;
var components = [
  "Torso",
  "Head",
  "Left forearm",
  "Left arm",
  "Right arm",
  "Right forearm",
  "Left leg",
  "Left tight",
  "Right tight",
  "Right leg"
  // Add parts names
  // TODO
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
      case "Left arm":
      robot.rotateLeftArmX(0.1)
        break;
      case "Left forearm":
        break;
      case "Right arm":
      robot.rotateRightArmX(0.1)
        break;
      case "Right forearm":
        break;
      case "Left leg":
       robot.rotateLeftLeg(0.1)
        break;

      case "Left tight" :
       robot.rotateLeftTight(0.1)
        break;

      case "Right tight" :
       robot.rotateRightTight(0.1)
        break;
      case "Right leg" :
       robot.rotateRightLeg(0.1)
        break;

      // Add more cases
      // TODO
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
      case "Left arm":
       robot.rotateLeftArmX(-0.1)
        break;
      case "Left forearm":
      //robot.rotateLeftForearmZ(-0.1);
        break;
      case "Right arm":
      robot.rotateRightArmX(-0.1)
        break;
      case "Right forearm":
      //robot.rotateRightForearmZ(-0.1);
        break;

        case "Left leg":
       robot.rotateLeftLeg(-0.1)
        break;

      case "Left tight" :
       robot.rotateLeftTight(-0.1)
        break;

      case "Right tight" :
       robot.rotateRightTight(-0.1)
        break;
      case "Right leg" :
       robot.rotateRightLeg(-0.1)
        break;
      // Add more cases
      // TODO
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
      case "Left arm":
        robot.rotateLeftArmY(0.1);
        break;
      case "Left forearm":
        robot.rotateLeftForearm(0.1);
        break;
      case "Right arm":
        robot.rotateRightArmY(0.1);
        break;
      case "Right forearm":
        robot.rotateRightForearm(0.1);
        break;
      case "Left leg":
        break;

      case "Left tight" :
        break;
        
      case "Right tight" :
        break;
      case "Right leg" :
        break;
      // Add more cases
      // TODO
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
      case "Left arm":
        robot.rotateLeftArmY(-0.1);
        break;
      case "Left forearm":
        robot.rotateLeftForearm(-0.1);
        break;
      case "Right arm":
        robot.rotateRightArmY(-0.1);
        break;
      case "Right forearm":
        robot.rotateRightForearm(-0.1);
        break;
      case "Left leg":
        break;

      case "Left tight" :
        break;
        
      case "Right tight" :
        break;
      case "Right leg" :
        break;
      // Add more cases
      // TODO
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