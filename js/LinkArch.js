function LinkArch(){

  var slices = 1000;

  var sides = 500;

  this.geometry = this.createGeo( slices , sides );

  this.material = new THREE.MeshNormalMaterial();

  this.mesh = new THREE.Mesh( this.geometry, this.material );
  scene.add( this.mesh );

}

LinkArch.prototype.createGeo = function( slices , sides ){

  var geometry = new THREE.BufferGeometry();

  console.log( 'NUMOF' );
  console.log( slices * sides * 6 * 3 );

  var numOf = slices * sides;

  geometry.addAttribute( 'position', new Float32Array( slices * sides * 6 * 3 ), 3 ); 

  var positions = geometry.getAttribute( 'position' ).array;


  var crudeCurve = this.createCrudeCurve( 10 );

  /*var mesh = new THREE.Mesh( 
    new THREE.IcosahedronGeometry( 20 , 1 ) ,
    new THREE.MeshNormalMaterial()
  );

  for( var  i = 0 ; i < crudeCurve.length; i++ ){

    var m = mesh.clone();

    //m.lookAt( m.postion.clone().add( centerPoints[i].normal );
    m.position = crudeCurve[i];
    scene.add( m );

  }*/


  var centerPoints = this.createCleanCurve( crudeCurve , slices ); 

 /* var mesh = new THREE.Mesh( 
      new THREE.CubeGeometry( 10 , 10 , 30 ) ,
      new THREE.MeshBasicMaterial()
  );

  var geo = new THREE.CubeGeometry( 10 , 10 , 30 );
  for( var  i = 0 ; i < centerPoints.length; i++ ){

    var mat = new THREE.MeshBasicMaterial();
    mat.color = new THREE.Color(( i / centerPoints.length ) , .5 , 1 );
    var m = new THREE.Mesh( geo , mat );

    m.position = centerPoints[i];
    m.lookAt( m.position.clone().add( centerPoints[i].normal ));
    scene.add( m );

  }*/


  var TOTAL = 0;

  // Two parts,
  // creation of points,
  // creation of geometry



  var points = [];

  console.log( centerPoints.length );

  for( var i = 0; i < centerPoints.length; i++ ){

    var slicePoints = [];

    var theta = (i / (4* slices) ) * 2 * Math.PI - (Math.PI /4) ;
    var thetaUp = ((i+.1) / (4* slices) ) * 2 * Math.PI- (Math.PI /4);

    var center = centerPoints[i];
    var norm = center.normal;

    var upVector = new THREE.Vector3( 0 , 0 ,1);

    var upVectorProj = upVector.dot( norm );
    var upVectorPara = norm.clone().multiplyScalar( upVectorProj );
    var upVectorPerp = upVector.clone().sub( upVectorPara );

    var basisX = upVectorPerp.normalize();
    var basisY = norm.clone().cross( basisX );

    for( var j = 0; j < sides; j++ ){

      var theta = (j / sides ) * 2 * Math.PI;

      var x = Math.cos( theta );
      var y = Math.sin( theta );

      var r = Math.random() * 100 + 300;

      var point = center.clone();

      var xVec = basisX.clone().multiplyScalar( r * x );
      var yVec = basisY.clone().multiplyScalar( r * y );

      point.add( xVec );
      point.add( yVec );

      slicePoints.push( point );

    }
   
    points.push( slicePoints );

  }


  for( var  i = 0; i <( slices-1); i++ ){

    var slicePoints = points[i];
    var slicePointsUp = points[i+1];

    for( var j = 0; j < sides; j++ ){

      var sUp = j +1;
      if( sUp == sides ){

        sUp = 0;

      }

      var p = slicePoints[j];         // regular point
      var pR = slicePoints[ sUp ];   // up in side
      var pU = slicePointsUp[j];      // up in slice
      var pB = slicePointsUp[sUp];    // up in both

      var index = ((i * sides) + j ) * 6 * 3 ;
      
      positions[ index + 0  ] = p.x; 
      positions[ index + 1  ] = p.y; 
      positions[ index + 2  ] = p.z;
      
      positions[ index + 3  ] = pR.x; 
      positions[ index + 4  ] = pR.y; 
      positions[ index + 5  ] = pR.z;
      
      positions[ index + 6  ] = pB.x; 
      positions[ index + 7  ] = pB.y; 
      positions[ index + 8  ] = pB.z;

      positions[ index + 9  ] = pB.x; 
      positions[ index + 10 ] = pB.y; 
      positions[ index + 11 ] = pB.z;
     
      positions[ index + 12 ] = pU.x; 
      positions[ index + 13 ] = pU.y; 
      positions[ index + 14 ] = pU.z;
      
      positions[ index + 15 ] = p.x; 
      positions[ index + 16 ] = p.y; 
      positions[ index + 17 ] = p.z;
      
      TOTAL ++;


    }


  }

  geometry.computeFaceNormals();
  geometry.computeVertexNormals();

  console.log( 'TOTAl' );
  console.log( TOTAL );


  return geometry;


}


LinkArch.prototype.createCrudeCurve = function( curveLength ){
    
  var points = [];

  for( var i = 0; i < curveLength; i++ ){

    var point = new THREE.Vector3();

    point.x = Math.random() * 1000;
    point.z = Math.random() * 1000;
    point.y = ((i / curveLength ) - .5 )* 4000 ;

    points.push( point );

  }

  return points;

}

LinkArch.prototype.createCleanCurve = function( crudePoints , cleanCurveLength ){


  var cleanPoints = [];

  for( var i = 0.0000001; i < cleanCurveLength; i++ ){

    var base = ( i / cleanCurveLength ) * (crudePoints.length-1);

    var baseUp   = Math.ceil( base );
    var baseDown = Math.floor( base );


    console.log( crudePoints.length );
    console.log( baseUp );
    console.log( baseDown );
   
    if( baseUp == baseDown ){

      console.log( 'NOOO' );

    }

    var amount = base - baseDown;

    //console.log( amount );

    var p0 = new THREE.Vector3(0,0,0);
    var p1 = new THREE.Vector3(0,0,0);
    var v0 = new THREE.Vector3(0,0,0);
    var v1 = new THREE.Vector3(0,0,0);

    var p2 = new THREE.Vector3(0,0,0);
    var p3 = new THREE.Vector3(0,0,0);

    if( baseDown == 0 ){

      p0 = crudePoints[ baseDown       ].clone();
      p1 = crudePoints[ baseUp     ].clone();
      p2 = crudePoints[ baseUp + 1 ].clone(); 

      v1 =  p2.clone();
      v1.sub( p0.clone() );
      v1.multiplyScalar( .5 );

    }else if( baseUp == crudePoints.length -1 ){
      
     
      p0 = crudePoints[ baseDown].clone();
      p1 = crudePoints[ baseUp ].clone();
      p2 = crudePoints[ baseDown - 1 ].clone();

      v0 = p1.clone().sub( p2 );
      v0.multiplyScalar( .5 );

    }else{

      p0 = crudePoints[ baseDown ].clone();
      p1 = crudePoints[ baseUp ].clone();

      p2 = crudePoints[ baseUp + 1 ].clone();
      p3 = crudePoints[ baseDown - 1 ].clone();

      v1 = p2.clone();
      v1.sub( p0 );
      v1.multiplyScalar( .5 );

      v0 = p1.clone();
      v0.sub( p3 );
      v0.multiplyScalar( .5 );


    }


    v0.multiplyScalar( 1/3 );
    v1.multiplyScalar( 1/3 );

    v0.multiplyScalar( 1 );
    v1.multiplyScalar( 1 );

    var c0 = p0.clone();
    var c1 = p0.clone().add( v0 );
    var c2 = p1.clone().sub( v1 );
    var c3 = p1.clone();

    var point   = this.cubicCurve( amount , c0 , c1 , c2 , c3 );
    var forNorm = this.cubicCurve( amount + .01 , c0 , c1 , c2 , c3 );

    point.normal = forNorm.sub( point ).normalize();

    cleanPoints.push( point );

  }


  return cleanPoints;

}



LinkArch.prototype.cubicCurve = function( t , c0 , c1 , c2 , c3 ){

  var s = 1 - t;

  var v0 = c0.clone().multiplyScalar( s * s * s );
  var v1 = c1.clone().multiplyScalar( 3 * s * s * t );
  var v2 = c2.clone().multiplyScalar( 3 * s * t * t );
  var v3 = c3.clone().multiplyScalar( t * t * t );

  var v = new THREE.Vector3();
  
  v.add( v0 );
  v.add( v1 );
  v.add( v2 );
  v.add( v3 );

  return v;


}
