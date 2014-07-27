
var projector, raycaster,mouse;

function initMechanics(){

 // scene.add( intersectPlaneIntersectMarker );



  projector = new THREE.Projector();
  raycaster = new THREE.Raycaster();

  mouse = new THREE.Vector2();
  mouse.down = false;

  var container = document.getElementById('container');
  container.addEventListener( 'mousemove' , onMouseMove , false );
  container.addEventListener( 'mousedown' , onMouseDown , false );
  container.addEventListener( 'mouseup' , onMouseUp , false );


  function onMouseMove( event ) {

      event.preventDefault();
      mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  }

  function onMouseDown( event ) {

    if( LINK_INTERSECTED ){

      LINK_INTERSECTED.link.select();

    }
    
    mouse.down = true;  


  }

  function onMouseUp( event ) {
    mouse.down = false;  
  }
    

}


function updateMechanics( delta ){

  var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
  projector.unprojectVector( vector, camera );
  raycaster.set( camera.position, vector.sub( camera.position ).normalize() );




  var intersects = raycaster.intersectObjects( LINK_TITLE_MESHES );

  if( intersects.length > 0  ){

    var firstIntersected = intersects[0].object;

    if( !LINK_INTERSECTED ){

      LINK_INTERSECTED = firstIntersected;

      //console.log
      LINK_INTERSECTED.link.hoverOver();

    }else{

      if( LINK_INTERSECTED != firstIntersected ){

        LINK_INTERSECTED.link.hoverOut();

        LINK_INTERSECTED = firstIntersected;

        LINK_INTERSECTED.link.hoverOver();

      }

    }


  }else{

    if( LINK_INTERSECTED ){

      LINK_INTERSECTED.link.hoverOut();
      LINK_INTERSECTED = undefined;

    }

  }


}




