function LinkArch( material){

  var slices = 500;

  var sides = 10;


  var points = [];

  this.archPoints = [];
  this.linkPoints = [];

  this.TOTAL_NUM = 0;

  this.material = material
  this.createRidge({
    numOf: 20,
    rangeT: Math.PI * .4,
    startT: 0
  });

  this.createRidge({
    numOf: 20,
    rangeT: Math.PI * .4,
    startT: Math.PI * .5
  });

  this.createRidge({
    numOf: 20,
    rangeT: Math.PI * .4,
    startT: Math.PI * 1
  });

  this.createRidge({
    numOf: 20,
    rangeT: Math.PI * .4,
    startT: Math.PI * 1.5
  });


  var center = new THREE.Mesh(
    new THREE.IcosahedronGeometry( 1800 , 3 ),
    this.material
  );
  scene.add( center );

}

LinkArch.prototype.createRidge = function( params ){

  var p = _.defaults( params || {} , {

    numOf: 50,
    rangeT: Math.PI * 1,
    startT: Math.PI,
    innerR: 1800,
    outerR: 5000,
    slices: 300,
    sides: 10,
    randomness: 1000

  });

  var sides = p.sides;
  var slices = p.slices;
 
  console.log('ASDASSS');
  console.log( slices );
  var points = [];

  var half =( (p.numOf-1) / 2);
  for( var i = 0; i < p.numOf; i++ ){

    var distFromMid = ( 1 - (Math.abs( i- half ) / half ))
    
    var t = (i / p.numOf)  * p.rangeT + p.startT;
    //var t = (i / 30)  * 2 * Math.PI; //+ Math.PI/10;
   
    var x = Math.cos( t ) *( p.innerR );
    var y = Math.sin( t ) *( p.innerR );
    
    var point = new THREE.Vector3( x , y , 0 );
   
    
    var random = new THREE.Vector3(
      (Math.random()-.5) * 300 *distFromMid  ,
      (Math.random()-.5) * 300*distFromMid ,
      (Math.random()-.5) * 1000*distFromMid 
    );

    point.add( random );
    point.radius = 200 *  distFromMid;

    points.push( point );

    var start = point.clone();

    var x = Math.cos( t ) * p.outerR;
    var y = Math.sin( t ) * p.outerR;

    var end =  new THREE.Vector3( x , y , 0 );


    var curveR = 200 * distFromMid 
    var curve = this.createTentacle( start , end , 10  , p.randomness , curveR );

    /*for( var j = 0; j < curve.length; j++ ){


      var start = curve[j];
      var end = start.clone().add( start.clone().sub( point ));

      var fromTip = 1 - ( j / curve.length );

      var curve2 = this.createTentacle( start , end , 5  ,  10 * p.randomness , curveR * fromTip  );

      var geometry = this.createGeo( curve2 , slices , sides );


      this.mesh = new THREE.Mesh( geometry, this.material );
      scene.add( this.mesh );

    }*/

    var geometry = this.createGeo( curve , slices , sides );


    this.mesh = new THREE.Mesh( geometry, this.material );
    scene.add( this.mesh );

  

  }


  var geometry = this.createGeo( points , slices * 2 , sides * 2 );

  this.mesh = new THREE.Mesh( geometry, this.material );
  scene.add( this.mesh );



}

LinkArch.prototype.createGeo = function( curve , slices , sides ){

  var geometry = new THREE.BufferGeometry();

  var numOf = slices * sides;

  geometry.addAttribute( 'position', new Float32Array( slices * sides * 6 * 3 ), 3 );
  geometry.addAttribute( 'normal', new Float32Array(slices * sides * 6 * 3  ), 3 );

  var positions = geometry.getAttribute( 'position' ).array;
  var normals = geometry.getAttribute( 'normal' ).array;


  var crudeCurve = curve;

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

      var r = center.radius;//*Math.sin(i)*(i/centerPoints.length);// Math.random() * 1 + 300;

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


      var centerPoint = centerPoints[i];
      var centerPointUp = centerPoints[i];


      var n =  p.clone().sub( centerPoint ).normalize();
      var nR = pR.clone().sub( centerPoint ).normalize();
      var nU = pU.clone().sub( centerPointUp ).normalize();
      var nB = pB.clone().sub( centerPointUp ).normalize();
    

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

      normals[ index + 0  ] = n.x; 
      normals[ index + 1  ] = n.y; 
      normals[ index + 2  ] = n.z;
      
      normals[ index + 3  ] = nR.x; 
      normals[ index + 4  ] = nR.y; 
      normals[ index + 5  ] = nR.z;
      
      normals[ index + 6  ] = nB.x; 
      normals[ index + 7  ] = nB.y; 
      normals[ index + 8  ] = nB.z;

      normals[ index + 9  ] = nB.x; 
      normals[ index + 10 ] = nB.y; 
      normals[ index + 11 ] = nB.z;
     
      normals[ index + 12 ] = nU.x; 
      normals[ index + 13 ] = nU.y; 
      normals[ index + 14 ] = nU.z;
      
      normals[ index + 15 ] = n.x; 
      normals[ index + 16 ] = n.y; 
      normals[ index + 17 ] = n.z;





      
      TOTAL ++;


    }


  }

  //geometry.computeFaceNormals();
  //geometry.computeVertexNormals();

  //console.log( 'TOTAl' );
  //console.log( TOTAL );

  this.TOTAL_NUM += TOTAL;
  console.log(this.TOTAL_NUM);

  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  return geometry;


}



LinkArch.prototype.createCleanCurve = function( crudePoints , cleanCurveLength ){


  var cleanPoints = [];

  for( var i = 0.0000001; i < cleanCurveLength; i++ ){

    var base = ( i / cleanCurveLength ) * (crudePoints.length-1);

    var baseUp   = Math.ceil( base );
    var baseDown = Math.floor( base );

    var pDown = crudePoints[ baseDown ];
    var pUp   = crudePoints[ baseUp ];

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

    point.radius = pDown.radius + (pUp.radius - pDown.radius ) * amount;

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



/*LinkArch.prototype.createCrudeCurve = function( curveLength ){
    
  var points = [];

  for( var i = 0; i < curveLength; i++ ){

    var t = (i / curveLength)  * .5 * Math.PI - Math.PI/4;

    var t = ( i / curveLength) * Math.PI * 2;
    var x = Math.cos( t ) * 2000;
    var y = Math.sin( t ) * 2000;

    var point = new THREE.Vector3();

    point.x = x +Math.random() * 3000;
    point.z = 0 +Math.random() * 3000;
    point.y = y +Math.random() * 3000;

 
    points.push( point );



  }

  return points;

}*/

LinkArch.prototype.createTentacle = function( start, end , size , randomness , radius ){

  var dif = end.clone().sub( start );

  var points = [];
  
  for( var i = 0; i < size; i++ ){

    var m = size -1 ;
    var x =( (m-i) / m );
    x *= x * x ;
    
    var point = start.clone().add( dif.clone().multiplyScalar( 1-x ) );

    if( i != 0 ){

      var random = new THREE.Vector3();
      var r = randomness;
      random.x = (Math.random() -.5 ) * r  * x;
      random.y = (Math.random() -.5 ) * r *  x;
      random.z = (Math.random() -.5 ) * r * x;
      point.add( random );

    }


    point.radius = (x) * radius;
    points.push( point );


  }

  return points



}
LinkArch.prototype.createCrudeCurve = function( letter , size ){
    
  if( !letter ){
    letter = 'j';
  }
  if( !size ){
    size = 100;
  }


  var points = [];

  var letterArray = this.letters[letter];

  for( var i = 0; i< letterArray.length; i++ ){

    var l = letterArray[i];

    var point = new THREE.Vector3();

    point.x = l[0] * size;
    point.y = l[1] * size;
    point.z = l[2] * size;

    points.push( point );

  }

  return points;

}
LinkArch.prototype.letters = {

  j:[

    [ .5 , 3 , 0 ],
    [ .5 , -2 , 0 ],
    [ -.3 , -3 , 0 ],
    [ -.8 , -2 , 0 ],
  
  ],

  dot:[

    [ 0 , -.1 , 0 ],
    [ 0 , .1 , 0 ],

  ],

  v:[
    [.5 , 3 , 0 ],
    [-.5 , 3 , 0 ],


  ],



}


