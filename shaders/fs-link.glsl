#extension GL_OES_standard_derivatives : enable

uniform vec3 lightPos;
uniform float timer;
uniform sampler2D tNormal;
uniform sampler2D t_audio;
uniform sampler2D tLookup;
uniform sampler2D t_iri;

varying vec3 vNorm;
varying vec3 vPos;

varying vec2 vUv;

varying mat3 vNormalMat;
varying vec3 vLightDir;
varying vec3 vLightPos;
varying vec3 vView;

uniform float texScale;
uniform float normalScale;

vec3 cubicCurve( float t , vec3  c0 , vec3 c1 , vec3 c2 , vec3 c3 ){

  float s  = 1. - t; 

  vec3 v1 = c0 * ( s * s * s );
  vec3 v2 = 3. * c1 * ( s * s ) * t;
  vec3 v3 = 3. * c2 * s * ( t * t );
  vec3 v4 = c3 * ( t * t * t );

  vec3 value = v1 + v2 + v3 + v4;

  return value;

}


void main(){ 

  vec3 q0 = dFdx( vPos.xyz );
  vec3 q1 = dFdy( vPos.xyz );
  vec2 st0 = dFdx( vUv.st );
  vec2 st1 = dFdy( vUv.st );

  vec3 S = normalize(  q0 * st1.t - q1 * st0.t );
  vec3 T = normalize( -q0 * st1.s + q1 * st0.s );
  vec3 N = normalize( vNorm );

  vec3 mapN = texture2D( tNormal, vUv ).xyz * 2.0 - 1.0;
  mapN.xy = normalScale * mapN.xy;
 

  
  mat3 tsn = mat3( S, T, N );
  vec3 finalNormal =  normalize( tsn * mapN );

  vec3 newNormal = finalNormal;

  vec3 nNormal = normalize( vNormalMat * newNormal  );
  vec3 nView = normalize(vView);
  vec3 nReflection = normalize( reflect( vView , nNormal )); 

  vec3 refl = reflect( vLightDir , nNormal );
  float facingRatio = abs( dot(  nNormal, refl) );

  float newDot = dot( normalize( nNormal ), nView );
  float inverse_dot_view = 1.0 - max( newDot  , 0.0);

  vec3 lookup = texture2D( t_iri , vec2( inverse_dot_view * facingRatio , 0. ) ).xyz;
  
  vec3 aColor = texture2D( t_audio , vec2( inverse_dot_view * facingRatio,0. )).xyz;

  vec3 facing = aColor;
  vec3 nonFacing =  lookup * (1.-facingRatio)* (1.-facingRatio)* (1.-facingRatio);

  vec3 norm = vec3(abs(finalNormal.x));
  gl_FragColor = vec4(.8 * lookup * aColor + .4 * nonFacing, 1.0 );

}

