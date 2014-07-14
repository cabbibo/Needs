
var LINKS = [];
var LINK_MESHES = [];

var LINK_INTERSECTED;


var LINK_GEO = new THREE.IcosahedronGeometry( 300 , 2 );

var LINK_MAT;


function Link( id , params ){

  this.id = id;

  this.params = _.defaults( params || {} , {

    title:"TITLE",
    description:"This is the area where the description goes",
    videoLink:"https://www.youtube.com/watch?v=-8mzWkuOxz8",
    note:'BLAH',

    springDistance: 2000,
    dampening: .999999,
    springForceMultiplier: .001,
    centerForceMultiplier: .000001,
    centerSize:300,

    repelRadius: 500,

    geometry: LINK_GEO,
    maxVel: 40

  });

  this.position = new THREE.Vector3(
    (Math.random() -.5 ) * 1000,
    (Math.random() -.5 ) * 1000,
    (Math.random() -.5 )  * 1000
  );

  this.velocity = new THREE.Vector3(
    ( Math.random() - .5 ) * 100,
    ( Math.random() - .5 ) * 100,
    ( Math.random() - .5 ) * 100
  );

  this.radius   = this.params.repelRadius

  this.material = this.createMaterial();

  this.mesh = new THREE.Mesh( this.params.geometry , this.material ); 

  this.mesh.position = this.position;
  this.mesh.velocity = this.velocity;


  this.mesh.link = this;


  this.linkLine = this.createLinkLine();


  repelPositions.push( this.position );
  repelVelocities.push( this.velocity );
  repelRadii.push( this.radius );

  LINKS.push( this );
  LINK_MESHES.push( this.mesh );

}


Link.prototype.createLinkLine = function(){

  var geo = new THREE.Geometry();

  geo.vertices.push( this.position );
  geo.vertices.push( this.position );
  geo.vertices.push(  this.position );

  geo.dynamic = true;

  var mat = new THREE.LineBasicMaterial({color:0xffffff});

  var line = new THREE.Line( geo , mat );
  return line;

}


Link.prototype.activate = function(){

  scene.add( this.mesh );
  scene.add( this.linkLine );
  this.active = true;


}


Link.prototype.select = function(){

  console.log( 'SELECSS');

}

Link.prototype.hoverOver = function(){

  repelRadii[ 10 ] = 7000;
  this.radius = 2000;
  repelRadii[ this.id ] = this.radius;
  console.log( 'HOVER OVER' );
  this.hovered = true;


  this.linkLine.geometry.vertices[1]=  this.position.clone();
  this.linkLine.geometry.vertices[1].add(  new THREE.Vector3(0 , 300,0)  );
  this.linkLine.geometry.vertices[1].z = 1500;
  this.linkLine.geometry.vertices[1].y = 1500;
  this.linkLine.geometry.vertices[1].x = 1500;

  this.linkLine.geometry.vertices[2] =  this.position.clone();
  this.linkLine.geometry.vertices[2].add( new THREE.Vector3(0 , 300,0) );
  this.linkLine.geometry.vertices[2].z = 1500;
  this.linkLine.geometry.vertices[2].y = 1500;
  this.linkLine.geometry.vertices[2].x = 2500;

  this.linkLine.geometry.verticesNeedUpdate = true;

}


Link.prototype.hoverOut = function(){
  repelRadii[ 10 ] = 100;
  this.radius = this.params.repelRadius;
  repelRadii[ this.id ] = this.radius;
  console.log( 'HOVER OUT' );
  this.hovered = false;


  this.linkLine.geometry.vertices[1] = this.position;
  this.linkLine.geometry.vertices[2] = this.position;
  this.linkLine.geometry.verticesNeedUpdate = true;
  

}



Link.prototype.updatePhysics = function(){

  
  var force = new THREE.Vector3();

  
  // Forces from other Links
  for( var i = 0; i < LINKS.length; i++ ){

    var link = LINKS[i];
    
    
    if( link != this ){

    TMP_VECTOR.copy( this.position );
    TMP_VECTOR.sub( link.position );

    var l = TMP_VECTOR.length();
    TMP_VECTOR.normalize();

    TMP_VECTOR.multiplyScalar( l - this.params.springDistance );
    force.sub( TMP_VECTOR.multiplyScalar( this.params.springForceMultiplier ) );
    //var dif =  

    }
  }

  
  TMP_VECTOR.copy( this.position );
  TMP_VECTOR.sub( new THREE.Vector3() );

  var l = TMP_VECTOR.length();
  force.sub( TMP_VECTOR.multiplyScalar( this.params.centerForceMultiplier * l ) );

  this.velocity.add( force );

}

Link.prototype.updatePosition = function(){

  if( this.hovered ) return;

  if( this.position.length() < this.params.centerSize ){

      this.position.normalize();
      this.position.multiplyScalar( this.params.centerSize );

      this.velocity.multiplyScalar( -1 );

  }

  
  if( this.velocity.length() > this.params.maxVel ){

    this.velocity.normalize().multiplyScalar( this.params.maxVel );

  }

  this.mesh.lookAt( this.position.clone().add( this.velocity ));
  this.position.add( this.velocity );
 


  /*if( this.hovered === false ){

    this.linkLine.geometry.vertices[0].copy( this.position );
    this.linkLine.geometry.vertices[1].copy( this.position );
    this.linkLine.geometry.vertices[2].copy( this.position );

    this.linkLine.geometryNeedsUpdate = true;
  }*/

  this.linkLine.geometry.vertices[0].copy( this.position );
  this.linkLine.geometry.verticesNeedUpdate = true;


}


Link.prototype.createMaterial = function(){

  var tNormal = n_moss;
  tNormal.wrapS = THREE.RepeatWrapping; 
  tNormal.wrapT = THREE.RepeatWrapping; 
  console.log( 'TNOMAL');
  console.log( tNormal );

  var tLookup = THREE.ImageUtils.loadTexture( 'img/iriLookup.png' );

  var c1 = Math.random();
  var c2 = Math.random();
  var c3 = Math.random();
  var color1 = new THREE.Vector3( c1 , c2 , c3 );
  
  var c1 = Math.random();
  var c2 = Math.random();
  var c3 = Math.random();
  var color2 = new THREE.Vector3( c1 , c2 , c3 );

  var c1 = Math.random();
  var c2 = Math.random();
  var c3 = Math.random();
  var color3 = new THREE.Vector3( c1 , c2 , c3 );
  
  var c1 = Math.random();
  var c2 = Math.random();
  var c3 = Math.random();
  var color4 = new THREE.Vector3( c1 , c2 , c3 );
 
  var uniforms = {

    lightPos: { type:"v3" , value: new THREE.Vector3(100,0,0)},
    tNormal:{type:"t",value:tNormal},
    time:timer,
    tLookup:{ type:"t" , value: tLookup },
    t_audio:{ type:"t" , value: audioController.texture },
    color1:{ type:"v3" , value: color1 },
    color2:{ type:"v3" , value: color2 },
    color3:{ type:"v3" , value: color3 },
    color4:{ type:"v3" , value: color4 },
    texScale:{type:"f" , value:.001},
    normalScale:{type:"f" , value:.8},
    vVel:{ type:"v3" , value: this.velocity }


  }

  vertexShader   = shaders.vertexShaders.link;
  fragmentShader = shaders.fragmentShaders.link;

  var material = new THREE.ShaderMaterial({

    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader

  });


  //var material = new THREE.MeshNormalMaterial();

  return material;


}
Link.prototype.onSelected





