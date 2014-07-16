function ObjectRotator( object ){

  this.object = object;
  this.mouseDown = false;

  this.rotateStartPoint= new THREE.Vector3();
  this.rotateEndPoint= new THREE.Vector3();

  this.curQuaternion;

  this.rotationSpeed = 1.;

  this.maxSpeed = .1;

  this.windowHalfX = window.innerWidth / 2;
  this.windowHalfY = window.innerHeight / 2;

  this.deltaX = 0;
  this.deltaY = 0;

  this.startPoint = {
    x:0,
    y:0
  }



  this.minDelta = .05;
  this.drag = .99;

  document.addEventListener('mousedown', this.onDocumentMouseDown.bind( this ), false);

  
  document.addEventListener('mousemove', this.onDocumentMouseMove.bind( this ), false);
  document.addEventListener('mouseup', this.onDocumentMouseUp.bind( this ), false);

}

ObjectRotator.prototype.update = function(){

  if (!this.mouseDown){

    if (this.deltaX < -this.minDelta || this.deltaX > this.minDelta){
      this.deltaX *= this.drag;
    }else{
      this.deltaX = 0;
    }

    if (this.deltaY < -this.minDelta || this.deltaY > this.minDelta){
      this.deltaY *= this.drag;
    }else{
      this.deltaY = 0;
    }

    this.handleRotation();

  }
  


}

ObjectRotator.prototype.handleRotation = function(){

  this.rotateEndPoint = this.projectOnTrackball( this.deltaX, this.deltaY );

  var rsp = this.rotateStartPoint , rep = this.rotateEndPoint;

  var rotateQuaternion = this.rotateMatrix( rsp , rep );

  this.curQuaternion = this.object.quaternion;
  this.curQuaternion.multiplyQuaternions( rotateQuaternion , this.curQuaternion );
  this.curQuaternion.normalize();

  this.object.setRotationFromQuaternion(this.curQuaternion);

  this.rotateEndPoint = this.rotateStartPoint;


}
ObjectRotator.prototype.onDocumentMouseDown = function(event){
  
  event.preventDefault();

  this.mouseDown = true;

  this.startPoint = {
      x: event.clientX,
      y: event.clientY
  };

  this.rotateStartPoint = this.rotateEndPoint = this.projectOnTrackball(0, 0);
}

ObjectRotator.prototype.onDocumentMouseMove = function(event){

  if( this.mouseDown == true ){
    this.deltaX = event.x - this.startPoint.x;
    this.deltaY = event.y - this.startPoint.y;

    this.handleRotation();

    this.startPoint.x = event.x;
    this.startPoint.y = event.y;

    this.lastMoveTimestamp = new Date();
  }

}

ObjectRotator.prototype.onDocumentMouseUp = function(event){

  if( this.mouseDown === true ){

    var t = new Date().getTime();

    if ( t- this.lastMoveTimestamp.getTime() > this.moveReleaseTimeDelta){

      this.deltaX = event.x - this.startPoint.x;
      this.deltaY = event.y - this,startPoint.y;

    }

    this.mouseDown = false;

  }

}

ObjectRotator.prototype.projectOnTrackball = function(touchX, touchY){
    
  var mouseOnBall = new THREE.Vector3();

  mouseOnBall.set(
    this.clamp( touchX / this.windowHalfX, -1, 1), 
    this.clamp(-touchY / this.windowHalfY, -1, 1),
    0.0
  );

  var length = mouseOnBall.length();

  if (length > 1.0){
    mouseOnBall.normalize();
  }else{
    mouseOnBall.z = Math.sqrt(1.0 - length * length);
  }

  return mouseOnBall;

}

ObjectRotator.prototype.rotateMatrix = function(rotateStart, rotateEnd){
  
  var axis        = new THREE.Vector3();
  var quaternion  = new THREE.Quaternion();

  var t = rotateStart.dot( rotateEnd ) / rotateStart.length() / rotateEnd.length();
  var angle = Math.acos( t );

  if( angle ){
    axis.crossVectors( rotateStart , rotateEnd ).normalize();
    angle *= this.rotationSpeed;

    if( angle > this.maxSpeed ){

      angle = this.maxSpeed;

    }
    quaternion.setFromAxisAngle( axis , angle );
  }

  return quaternion;

}

ObjectRotator.prototype.clamp = function(value, min, max){
  
  return Math.min( Math.max( value , min ) , max );

}
