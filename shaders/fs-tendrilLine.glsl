
varying vec2 vUv;

void main(){

 // if( vUv.x < 1./64.){
    gl_FragColor = vec4( vUv.x , .3 , vUv.y , .5 );
 // }else{
 //   gl_FragColor = vec4( 0. );
 // }

}
