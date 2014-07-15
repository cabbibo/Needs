#extension GL_OES_standard_derivatives : enable

uniform vec3 lightPos;
uniform float time;
uniform sampler2D tNormal;
uniform sampler2D t_audio;
uniform sampler2D tLookup;
uniform sampler2D t_iri;

uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform vec3 color4;

varying vec3 vNorm;
varying vec3 vPos;

varying vec2 vUv;

varying float vDisplacement;
varying float vMatch;


varying mat3 vNormalMat;
varying vec3 vLightDir;
varying vec3 vLightPos;
varying vec3 vView;
varying vec3 vMVPos;

uniform float texScale;
uniform float normalScale;

$simplex

void main(){ 


  vec4 a1 = texture2D( t_audio , vec2( abs(vMatch) , 0. ) );
  vec4 a2 = texture2D( t_audio , vec2( abs(vDisplacement) , 0. ) );

  vec4 c1 = texture2D( t_iri ,vec2( abs(vDisplacement) , 0. ) );
  gl_FragColor = vec4( a1.xyz  * c1.xyz, 1.0 );


}

