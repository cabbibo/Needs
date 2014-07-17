
uniform vec3 lightPos;
uniform float time;
uniform sampler2D t_audio;

varying vec2 vUv;

varying vec3 vPos;
varying vec3 vNorm;
varying vec3 vView;

varying mat3 vNormalMat;
varying vec3 vLightDir;


void main(){

  vPos  = position;
  vNorm = normal;

  vView = modelViewMatrix[3].xyz;
  vNormalMat = normalMatrix;

   
  vNorm = normal;//normalize( cross( difP , difT ));
  
  vec3 lightDir = normalize( lightPos -  (modelViewMatrix * vec4( vPos , 1.0 )).xyz );
  vLightDir = lightDir;


  vUv = uv;
 
  gl_Position = projectionMatrix * modelViewMatrix * vec4( vPos , 1.0 );

}
