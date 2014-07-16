
var LINKS = [];
var LINK_MESHES = [];
var LINK_TITLE_MESHES = [];

var LINK_INTERSECTED;
var LINK_TITLE_INTERSECTED;

var CURRENT_SONG;

var LINK_GEO = new THREE.IcosahedronGeometry( 300 , 2 );
var LINK_GEO = new THREE.IcosahedronGeometry( 300 , 2 );

var LINK_MAT;


function Link( id , total , params ){

  this.id = id;
  this.idNormal = id / total;

  this.params = _.defaults( params || {} , {

    title:"TITLE",
    description:"This is the area where the description goes",
    videoLink:"https://www.youtube.com/watch?v=-8mzWkuOxz8",
    note:'BLAH',

    file:'audio/needs.mp3',
   
    springDistance: 2000,
    dampening: .999999,
    springForceMultiplier: .001,
    centerForceMultiplier: .000001,
    centerSize:300,

    //physicsParams:{},

    repelRadius: 500,

    geometry: LINK_GEO,
    maxVel: 40,

    t_iri: T_IRI.red,
    t_normal: T_NORM.sand


  });

  this.stream = new Stream( this.params.file , audioController ); 

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


  this.titlePosition = new THREE.Vector3();
  this.titlePosition.x = 2000;
  this.titlePosition.y = (this.idNormal - .5 ) * 1000; 

  this.titleLeft = this.titlePosition.x;


  this.titleMesh = textCreator.createMesh( this.params.title ,{
   
    size: 100
    
  });

  this.titleMesh.position = this.titlePosition;
  this.titlePosition.x += this.titleMesh.totalWidth / 2;
  
  this.titleMesh.link = this;

  scene.add( this.titleMesh);

  LINK_TITLE_MESHES.push( this.titleMesh );


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
  geo.vertices.push( this.position );

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

  var s = this.stream;
  console.log( s );
  this.stream.stop( s.play.bind( this.stream ) );

  tendrils.setPhysicsParams( this.params.physicsParams );
  tendrils.setRenderParams( this.params.renderParams );

  CURRENT_SONG = this;
}

Link.prototype.hoverOver = function(){

  //repelRadii[ camera.repelID ] = 7000;
  this.radius *= 2; //2000;
  repelRadii[ this.id ] = this.radius;
  this.hovered = true;


  tendrils.setCenterParams( this.params.centerParams );

  this.linkLine.geometry.vertices[2]=  this.titlePosition.clone();
  this.linkLine.geometry.vertices[2].x =  this.titleLeft - 50;

  var l =   this.linkLine.geometry.vertices[2];
  //this.linkLine.geometry.vertices[1].sub(  new THREE.Vector3(1200 , 0 ,0)  );
    //this.linkLine.geometry.vertices[1].y = 1500;
  //this.linkLine.geometry.vertices[1].x = 1500;*/

  this.linkLine.geometry.vertices[1] =  l.clone();
  this.linkLine.geometry.vertices[1].sub(  new THREE.Vector3(1000 , 0 ,0)  );
  //this.linkLine.geometry.vertices[2].y = 1500;
  //this.linkLine.geometry.vertices[2].x = 2500;*/

  this.linkLine.geometry.verticesNeedUpdate = true;

  var v = this.linkLine.geometry.vertices[2].clone();

  projector.unprojectVector( v , camera );

  v.sub( camera.position  );

  var x = ( v.x  / window.innerWidth ) - 1;
  
  //    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
//      mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}


Link.prototype.hoverOut = function(){
//  repelRadii[ camera.repelID  ] = 100;
  this.radius /=2;// this.params.repelRadius;
  repelRadii[ this.id ] = this.radius;
  this.hovered = false;


  if( CURRENT_SONG ){
    tendrils.setCenterParams( CURRENT_SONG.params.centerParams );
  }

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

  //if( this.hovered ) return;

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


  var uniforms = {

    lightPos: { type:"v3" , value: new THREE.Vector3(100,0,0)},
    tNormal:{type:"t",value:this.params.t_normal},
    time:timer,
    t_iri:{ type:"t" , value: this.params.t_iri },
    t_audio:{ type:"t" , value: audioController.texture },
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





