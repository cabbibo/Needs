
  /*

     Tendrils


    64 x 64

     64 / 4 = 16

     total number of tendrils = 64 * 4 = 256


  */
  function Tendrils( params ){
    
    
    var repelPositions = [];
    var repelVelocities = [];
    var repelRadii = [];

    for( var i = 0; i < 10; i++ ){
      var p = new THREE.Vector3( i * 20, i*20 , 0 );
      repelPositions.push( p );
    }

    for( var i = 0; i < 10; i++ ){
      var p = new THREE.Vector3( i, i , 0  );
      repelVelocities.push( p );
    }

    for( var i = 0; i < 10; i++ ){
      var p = i;
      repelRadii.push( 300 );
    }


    this.params = _.defaults( params || {} , {

      position: new THREE.Vector3(),
      repelPositions: repelPositions,
      repelVelocities: repelVelocities,
      repelRadii: repelRadii,
      width:1000,
      height:1000,
      girth: 5,
      headMultiplier: 6,
      floatForce: 10000,
      springForce: 100,
      springDist: 100,
      repelMultiplier: 50,
      flowMultiplier: 0,
      maxVel:1000,
      dampening:.99999,
      baseGeo: new THREE.CubeGeometry( 30 , 30 , 30 ),
      baseMat: new THREE.MeshNormalMaterial()
      

    });

    this.position         = this.params.position;
    this.repelPositions   = this.params.repelPositions;
    this.repelVelocities  = this.params.repelVelocities;
    this.repelRadii       = this.params.repelRadii;

    this.width            = this.params.width;
    this.height           = this.params.height;

    this.size = 64;

    this.sim = shaders.simulationShaders.tendrilSim;

    //this.flow = camera.velocity;
    
    this.flow = new THREE.Vector3( 0 , 1 , 0 );

    
    var uniforms = {

      lightPos: { type:"v3" , value: new THREE.Vector3(100,0,0)},
      tNormal:{type:"t",value:T_NORM.sand},
      time:timer,
      t_iri:{ type:"t" , value:T_IRI.combo},
      t_audio:{ type:"t" , value: audioController.texture },
      texScale:{type:"f" , value:.001},
      normalScale:{type:"f" , value:.8},
      vVel:{ type:"v3" , value: this.velocity }


    }

    this.centerUniforms = uniforms;

    vertexShader   = shaders.vertexShaders.link;
    fragmentShader = shaders.fragmentShaders.link;

    var material = new THREE.ShaderMaterial({

      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader

    });



    this.centerGeo = new THREE.IcosahedronGeometry( 300 , 3 );
    this.centerMat = material;
    this.center = new THREE.Mesh( this.centerGeo , this.centerMat );
    scene.add( this.center );

    this.bases = this.createBases();

    this.startingTexture  = this.createStartingTexture();
    this.activeTexture    = this.createActiveTexture();
    
    this.physicsRenderer = new PhysicsRenderer(
      this.size,
      this.sim,
      renderer
    );

    this.physicsRenderer.setUniform( 'uModelView' , {
      type:"m4",
      value: this.center.matrixWorld
    });


    this.physicsRenderer.setUniform( 't_active' ,{
      type:"t",
      value:this.activeTexture
    } );

    this.physicsRenderer.setUniform( 't_audio' ,{
      type:"t",
      value:audioController.texture
    } );


    this.physicsRenderer.setUniform( 't_og' , {
      type:"t",
      value:this.startingTexture
    });


    this.physicsRenderer.setUniform( 'flow' , {
      type:"v3",
      value:this.flow
    });


    this.physicsRenderer.setUniform( 'repelPositions' , {
      type:"v3v",
      value:this.repelPositions
    });

    this.physicsRenderer.setUniform( 'repelVelocities' , {
      type:"v3v",
      value:this.repelVelocities
    });


    this.physicsRenderer.setUniform( 'repelRadii' , {
      type:"fv1",
      value:this.repelRadii
    });


    this.physicsRenderer.setUniform( 'offset' , {
      type:"v3",
      value:this.position
    });

    var repelMultiplier = { type:"f" , value: this.params.repelMultiplier }
    var flowMultiplier = { type:"f" , value: this.params.flowMultiplier }
    var floatForce ={ type:"f", value:this.params.floatForce }
    var springForce = { type:"f", value:this.params.springForce  }
    var springDist = { type:"f",  value:this.params.springDist   }
    var maxVel = { type:"f" , value:this.params.maxVel }
    var dampening = { type:"f" , value:this.params.dampening }
    var radiusMultiplier = { type:"f" , value:1 }
    
    this.physicsRenderer.setUniform( 'uRepelMultiplier' , repelMultiplier );
    this.physicsRenderer.setUniform( 'uFlowMultiplier' , flowMultiplier );
    this.physicsRenderer.setUniform( 'uFloatForce' , floatForce );
    this.physicsRenderer.setUniform( 'uSpringForce' , springForce);
    this.physicsRenderer.setUniform( 'uSpringDist' , springDist );
    this.physicsRenderer.setUniform( 'uRadiusMultiplier' , radiusMultiplier );
    this.physicsRenderer.setUniform( 'maxVel' , maxVel );
    this.physicsRenderer.setUniform( 'uDampening' , dampening );

    var physicsGui = gui.addFolder( 'PhysicsGui' );
    physicsGui.add( repelMultiplier , 'value' ).name( 'Repel Multiplier' );
    physicsGui.add( flowMultiplier , 'value' ).name( 'Flow Multiplier' );
    physicsGui.add( floatForce , 'value' ).name( 'Float Force' );
    physicsGui.add( springForce , 'value' ).name( 'Spring Force' )
    physicsGui.add( springDist , 'value' ).name( 'Spring Dist' );
    physicsGui.add( maxVel , 'value' ).name( 'Max Vel' );
    physicsGui.add( dampening , 'value' ).name( 'uDampening' );



    this.physicsRenderer.setUniform( 'dT'     , dT    );
    this.physicsRenderer.setUniform( 'timer'  , timer );


    this.normalTexture = THREE.ImageUtils.loadTexture('img/normals/moss_normal_map.jpg');

    this.normalTexture.wrapS = THREE.RepeatWrapping;
    this.normalTexture.wrapT = THREE.RepeatWrapping;
    //this.normalTexture
   

    var girth = {type:"f" ,value: this.params.girth }
    var headMultiplier = {type:"f" ,value: this.params.headMultiplier}
    var texScale = {type:"f" ,value:.01 }
    var normalScale = {type:"f" ,value: .3 }



    var t_iri = THREE.ImageUtils.loadTexture( 'img/iri/red.png' );
    var t_iri = THREE.ImageUtils.loadTexture( 'img/iri/turq.png' );
    var t_iri2 = THREE.ImageUtils.loadTexture( 'img/iri/pinkRed.png' );


    var t_iri = {type:"t",value:t_iri};
    var t_iri2 = {type:"t",value:t_iri};

    var renderParams = {
      t_iri:0,
      t_iri2:1,
      t_norm:1
    }

    var renderGui = gui.addFolder( 'renderGui' );
   
    renderGui
      .add( renderParams , 't_iri', 0, T_IRI_STRINGS.length -1 )
      .step( 1 ) 
      .name( 'Iri Texture1' )
      .onChange( function( value ){
        var string = T_IRI_STRINGS[ value ]
        this.renderUniforms.t_iri.value = T_IRI[ string ];

      }.bind( this ) );

    renderGui
      .add( renderParams , 't_iri2', 0, T_IRI_STRINGS.length -1 )
      .step( 1 ) 
      .name( 'Iri Texture 2' )
      .onChange( function( value ){

        var string = T_IRI_STRINGS[ value ]
        this.renderUniforms.t_iri2.value = T_IRI[ string ];

      }.bind( this ) );


    renderGui
      .add( renderParams , 't_norm', 0, T_NORM_STRINGS.length -1 )
      .step( 1 ) 
      .name( 'Normal Texture' )
      .onChange( function( value ){

        var string = T_NORM_STRINGS[ value ]
        this.renderUniforms.tNormal.value = T_NORM[ string ];

      }.bind( this ) );

    renderGui.add( girth , 'value' ).name( 'GIRTH' );
    renderGui.add( headMultiplier , 'value' ).name('Head Multiplier');
    renderGui.add( texScale , 'value' ).name('texScale');
    renderGui.add( normalScale , 'value' ).name('normalScale');
    
    this.renderUniforms = {
      t_pos:{type:"t",value:null},
      t_iri:{ type:"t",value:T_IRI.combo },
      t_iri2:{type:"t",value:T_IRI.combo},
      t_audio:{type:"t",value:audioController.texture},
      lightPos:{type:"v3",value:new THREE.Vector3( 0 , 1 , 0 )},
      t_active:{type:"t",value:this.activeTexture},
      girth:girth,
      tNormal:{type:"t",value:this.normalTexture},
      uMVMat:{type:"m4", value:this.center.matrixWorld},
      texScale:texScale,
      normalScale:normalScale,
      headMultiplier:headMultiplier
    }


    var materialLine = new THREE.ShaderMaterial({

      uniforms:this.renderUniforms,
      vertexShader: shaders.vertexShaders.tendrilLine,
      fragmentShader: shaders.fragmentShaders.tendrilLine,
      blending:THREE.AdditiveBlending,
      transparent:true,
      opacity:.3
      //side:THREE.DoubleSide

    });

    var material = new THREE.ShaderMaterial({

      uniforms:this.renderUniforms,
      vertexShader: shaders.vertexShaders.tendril,
      fragmentShader: shaders.fragmentShaders.tendril,
      //blending:THREE.AdditiveBlending,
     // transparent:true,
      side: THREE.BackSide

    });



    var geoLine = this.createLineGeo( this.size );
    var geo = this.createMeshGeo( this.size );

    this.line = new THREE.Line( geoLine , materialLine , THREE.LinePieces );
    this.mesh = new THREE.Mesh( geo , material );

    this.mesh.position = this.position;
    this.line.position = this.position;

    this.physicsRenderer.createDebugScene();
   // this.physicsRenderer.addDebugScene(scene);

    this.physicsRenderer.addBoundTexture( this.mesh , 't_pos' , 'output' );

   // this.mesh.frustumCulled = false;

    this.flowMarkerGeo = new THREE.Geometry();
    this.flowMarkerGeo.vertices.push( new THREE.Vector3() );
    this.flowMarkerGeo.vertices.push( this.flow );

    this.flowMarker = new THREE.Line( this.flowMarkerGeo , new THREE.LineBasicMaterial() );


    this.physicsRenderer.reset( this.startingTexture );

    //scene.add( this.flowMarker );

  }

  Tendrils.prototype.activate = function(){

    scene.add( this.mesh );
   // scene.add( this.line );

    for( var i = 0; i < this.bases.length; i++ ){

      this.center.add( this.bases[i].mesh );

    }

    this.active = true;

  }

  Tendrils.prototype.deactivate = function(){

    scene.remove( this.mesh );
    scene.remove( this.line );

    this.active = false;

  }


  Tendrils.prototype.update = function(){

    var r = 10 *  Math.abs( Math.cos( timer.value * .01 ) );

    var x = r * Math.cos( timer.value * 1);
    var y = r * Math.sin( timer.value * 1);
    var z = r * Math.tan( timer.value * 1);

   /* this.center.rotation.y += Math.cos( timer.value ) * .01;
    this.center.rotation.x += Math.cos( timer.value * .3 ) * .01;
    this.center.rotation.z += Math.sin( timer.value * .1 ) * .01;*/
   // console.log( x );

   
    //this.flow.set( x , y , z );
    /*this.flow.copy( camera.position );
    this.flow.normalize();*/

      //this.flowMarker.geometry.vertices[1] = this.flow;
    this.flowMarker.geometry.verticesNeedUpdate = true;

    this.physicsRenderer.update();
    this.physicsRenderer.update();
    this.physicsRenderer.update();
    this.physicsRenderer.update();
    this.physicsRenderer.update();

  }


  Tendrils.prototype.createLineGeo = function( size ){


    var geo = new THREE.BufferGeometry();

    geo.addAttribute( 'position', new Float32Array( 3840 * 2 * 3 ) , 3); 

    var positions = geo.getAttribute( 'position' ).array;


    var slices = 16;

    var TOTAL = 0;


    // Each column
    for( var j = 0; j < 4; j++ ){

      // Each row
      for( var i = 0; i < size; i++ ){

        var tendrilIndex = i + ( j * size );

         // Each part of tendril column
        for( var k = 0; k < slices-1; k++ ){

          
          // uv.x lookup into
          var x = i / size; 

          // uv.y lookup into pos
          var y = (j / 4 ) + (k / slices)/4;
          var yUp = (j / 4 ) + ((k+1) / slices)/4;


          
          var finalIndex = tendrilIndex * (slices-1);   
          finalIndex += k;

          finalIndex *= 3 * 2;

          positions[ finalIndex + 0  ] =  x;
          positions[ finalIndex + 1  ] =  y;
          positions[ finalIndex + 2  ] =  k;

          positions[ finalIndex + 3  ] =  x;
          positions[ finalIndex + 4  ] =  yUp;
          positions[ finalIndex + 5  ] =  k;

          TOTAL ++;


        }

      }

    }

    return geo;

  }

  Tendrils.prototype.createMeshGeo = function( size ){

    
    var geo = new THREE.BufferGeometry();

    geo.addAttribute( 'position', new Float32Array(197120   * 6 * 3 ) , 3); 

   
    var positions = geo.getAttribute( 'position' ).array;


    var slices = 77;
    var sides   = 10;


  //  var totalNum = size * 4 * (slices-1) * (sides-1);
   
    var TOTAL = 0;

    // Each column
    for( var j = 0; j < 4; j++ ){
  
      // Each row
      for( var i = 0; i < size; i++ ){


        var tendrilIndex = i + ( j * size );

        // Each part of tendril column
        for( var k = 0; k < slices; k++ ){
           
          var sliceIndex = k;

          // uv.x lookup into
          var x = (i / size) + ((1/size)/2); 

          // uv.y lookup into pos
          var y = (j / 4 ) + (k / (slices))/4;

          var yUp = (j/4) + ((k+1) / (slices) )/4;


          //y+= 1/( 4*2 *slices)
          //yUp+= 1/( 4*2 *slices)
          for( var l = 0; l < sides; l++ ){

            var sideIndex = l;

            // Position around column
            var z = l / sides;

            var zUp = ( l + 1 ) /sides;

            if( zUp == 1 ){
              zUp = 0;
            }

            if( zUp > 1 ){
              //console.log( 'THIS IS TOTALLY FUCKED' );
            }

            var finalIndex = tendrilIndex * (slices-1)* (sides)* 6;   
            finalIndex += sliceIndex * (sides) * 6;
            finalIndex += sideIndex * 6;

            finalIndex *= 3;
            
            positions[ finalIndex + 0  ] =  x  ;
            positions[ finalIndex + 1  ] =  y  ;
            positions[ finalIndex + 2  ] =  z  ;
           
            positions[ finalIndex + 3  ] =  x  ;
            positions[ finalIndex + 4  ] =  y  ;
            positions[ finalIndex + 5  ] =  zUp;

            positions[ finalIndex + 6  ] =  x  ;
            positions[ finalIndex + 7  ] =  yUp;
            positions[ finalIndex + 8  ] =  zUp;

            positions[ finalIndex + 9  ] =  x  ;
            positions[ finalIndex + 10 ] =  y  ;
            positions[ finalIndex + 11 ] =  z  ;

            positions[ finalIndex + 12 ] =  x  ;
            positions[ finalIndex + 13 ] =  yUp;
            positions[ finalIndex + 14 ] =  zUp;
  
            positions[ finalIndex + 15 ] =  x  ;
            positions[ finalIndex + 16 ] =  yUp;
            positions[ finalIndex + 17 ] =  z  ;


            TOTAL += 1;

          }


        }


      }
  
    }


    return geo;

  }

  Tendrils.prototype.updateBases = function( whichHit ){

    for( var i = 0; i < this.bases.length; i++ ){

      this.bases[i].update( whichHit );

    }

  }
  
  Tendrils.prototype.createBases = function(){

    
    var bases = []
    for( var i = 0; i < this.size * 4; i++ ){

      var x = i % 16;
      var y = Math.floor( i / 16 );
      var mesh = new THREE.Mesh( 
        this.params.baseGeo,
        this.centerMat
      );


      var position = new THREE.Vector3(
        (Math.random() - .5) * this.width,
        (Math.random() - .5) * this.height,
        0
      );

      var position = new THREE.Vector3(
        ((x-7.5)/16)*this.width,
        ((y-7.5)/16)*this.height,
        0
      );

      var r = 300; 
      var t = Math.random() * 2 * Math.PI;
      var p = (Math.random() -.5) * 2 * Math.PI;

      var pos = this.toCart( r , t , p );
      mesh.position.set( pos[0] , pos[1] , pos[2])// = position;
    
      var n = mesh.position.clone().normalize();
      mesh.lookAt( mesh.position.clone().add( n ) );
      //mesh.rotation.x = Math.random();
      //mesh.rotation.y = Math.random();
      //mesh.rotation.z = Math.random();

      var base = {}; 
      base.mesh = mesh; //new Monome( x , y , mesh );

      bases.push( base );

    }


    return bases;


  }


  Tendrils.prototype.createActiveTexture = function(){

    var data = new Float32Array( 16 * 16  * 4 );

    for( var i = 0; i < 16; i++ ){
      for( var j = 0; j < 16; j++ ){

        var index = (i + (j * 16)) * 4

        data[index] = i/16;
        data[index+1] = j/16;
        data[index+2] = 0;//Math.random();
        data[index+3] = 0;//Math.random();

      }

    }
    var activeTexture = new THREE.DataTexture(
      data, 
      16, 
      16, 
      THREE.RGBAFormat, 
      THREE.FloatType 
    );

    activeTexture.minFilter = THREE.NearestFilter;
    activeTexture.magFilter = THREE.NearestFilter;
    activeTexture.generateMipmaps = false;
    activeTexture.needsUpdate = true;

    return activeTexture;

  }

  Tendrils.prototype.updateActiveTexture = function( x , y , r , g , b , a ){

    var index = (x + (y * 16))*4;


    var d = this.activeTexture.image.data;

    d[ index     ]  = r;
    d[ index + 1 ]  = g;
    d[ index + 2 ]  = b;
    d[ index + 3 ]  = a;


    this.activeTexture.needsUpdate = true;
 
  }


  Tendrils.prototype.createStartingTexture = function(){

    var data = new Float32Array( this.size * this.size * 4 );

    var startingPos = []
    for( var i = 0; i < this.size * 4; i++ ){

      startingPos.push( [
        (Math.random() - .5) * this.width,
        (Math.random() - .5) * this.height,
      ]);

    }
    for( var i = 0; i < this.size; i++ ) {

      for( var j = 0; j < this.size; j++ ){


        var preX = (i/this.size)* 16;
        var x = Math.floor(preX);
        var y = Math.floor((j/this.size)* 4);
        var slice = 1 - (((j/this.size) * 4) - y );
        

        tendrilIndex = i + (y * this.size);

        var theta = (tendrilIndex / 256) * 2 * Math.PI;


        var r = (slice * 16) * this.params.springDist + 50;


        var t = Math.random() * 2 *  Math.PI; 
        var p = (Math.random() - .5) * 2 *  Math.PI; 
        
        var xyz = this.toCart( r , t , p );

        var x = xyz[0];
        var y = xyz[1];
        var z = xyz[2];

        var p = this.bases[tendrilIndex].mesh.position;

        var n = p.clone().normalize();

        var fPos = p.clone().add( n.multiplyScalar(((slice) * 16) *this.params.springDist) );
       
        fPos  = p.clone();
        //consol.e.
       /* var x = r * Math.cos( theta );
        var y = r * Math.sin( theta );
        var z = slice;*/

       /* y -= (preX - x );
        x /= 4;

        y = (4-y)-.875;
        x = x;

        z = slice;

       // z *= 50;
        x *= 300/4;
        y *= 300/4;*/

        var index = ( i + (j * this.size)) * 4;

        data[ index + 0 ] = fPos.x; //this.bases[tendrilIndex].mesh.position.x;
        data[ index + 1 ] = fPos.y;//this.bases[tendrilIndex].mesh.position.y;
        data[ index + 2 ] = fPos.z;// * .0001;// (z * 16) * this.params.springDist ;
        data[ index + 3 ] = 0;

        //data[ index + 0 ] = this.bases[tendrilIndex].mesh.position.x;
        //data[ index + 1 ] = this.bases[tendrilIndex].mesh.position.y;
        //data[ index + 2 ] =  (z * 16) * this.params.springDist ;
        //data[ index + 3 ] = 0;



      }


    }

    var positionsTexture = new THREE.DataTexture(
      data, 
      this.size, 
      this.size, 
      THREE.RGBAFormat, 
      THREE.FloatType 
    );

    positionsTexture.minFilter = THREE.NearestFilter;
    positionsTexture.magFilter = THREE.NearestFilter;
    positionsTexture.generateMipmaps = false;
    positionsTexture.needsUpdate = true;

    return positionsTexture;

  }


  Tendrils.prototype.toCart = function( r , t , p ){

    var x = r *(Math.sin(t))*(Math.cos(p));
    var y = r *(Math.sin(t))*(Math.sin(p));
    var z = r * (Math.cos(t));
    return [ x , y , z ] ;

  }


  Tendrils.prototype.setPhysicsParams = function( params ){

    var u = this.physicsRenderer.simulationUniforms
    for( var propt in params ){

      
      if( u[propt] ){

        u[propt].value = params[propt];

      }else{

        console.log(' No Uniform of this type' );

      }

    }

  }

  Tendrils.prototype.setRenderParams = function( params ){

    var u = this.renderUniforms
    for( var propt in params ){
      
      if( u[propt] ){

        u[propt].value = params[propt];

      }else{

        console.log(' No Uniform of this type' );

      }

    }
  }


  Tendrils.prototype.setCenterParams = function( params ){

    var u = this.centerUniforms;
    
    for( var propt in params ){

      
      if( u[propt] ){

        u[propt].value = params[propt];

      }else{

        console.log(' No Uniform of this type' );

      }

    }
  }



