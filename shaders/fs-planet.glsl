
uniform vec3 lightPos;
uniform float time;
uniform sampler2D tNormal;
uniform sampler2D t_audio;
uniform sampler2D t_iri;


uniform float texScale;
uniform float normalScale;

varying vec3 vNorm;
varying vec3 vPos;

varying mat3 vNormalMat;
varying vec3 vLightDir;
varying vec3 vLightPos;
varying vec3 vView;
varying vec3 vMVPos;


void main(){ 

  vec3 finalNormal = vNorm;

  vec3 nNormal = normalize( vNormalMat * finalNormal );
  vec3 nView = normalize(vView);
  vec3 nReflection = normalize( reflect( vView , nNormal )); 

  vec3 refl = reflect( vLightDir , nNormal );
  float facingRatio = abs( dot(  nNormal, refl) );

  float newDot = dot( normalize( nNormal ), nView );
  float inverse_dot_view = 1.0 - max( newDot  , 0.0);

  vec3 lookup = texture2D( t_iri , vec2( 1.- ( inverse_dot_view * facingRatio),0. )).xyz;
  
  vec3 aColor = texture2D( t_audio , vec2( inverse_dot_view * facingRatio,0. )).xyz;


  vec3 facing = aColor; //* facingRatio*facingRatio*facingRatio;
  vec3 nonFacing =  lookup * (1.-facingRatio)* (1.-facingRatio)* (1.-facingRatio);

  vec3 norm = vec3(abs(finalNormal.x));
  gl_FragColor = vec4(.6 * lookup * aColor + .4 * nonFacing, 1.0 );
  //gl_FragColor = vec4(facing, 1.0 );
  //gl_FragColor = vec4(  normalTex , 1.0 );

}

