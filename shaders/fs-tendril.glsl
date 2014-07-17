
//uniform vec3 color;

uniform sampler2D t_iri;
uniform sampler2D t_iri2;
uniform sampler2D tNormal;
uniform sampler2D t_audio;

varying vec2 vActiveLookup;
varying vec3 vNormal;
varying float vHead;
varying vec3 vPos;

varying vec3 vView;
varying float vDisplacement;

varying vec3 vLightDir;


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

  vec3 vNorm = vNormal;

  // FROM @thespite
  vec3 n = normalize( vNorm.xyz );
  vec3 blend_weights = abs( n );
  blend_weights = ( blend_weights - 0.2 ) * 7.;  
  blend_weights = max( blend_weights, 0. );
  blend_weights /= ( blend_weights.x + blend_weights.y + blend_weights.z );

  vec2 coord1 = vPos.yz * texScale;
  vec2 coord2 = vPos.zx * texScale;
  vec2 coord3 = vPos.xy * texScale;

  vec3 bump1 = texture2D( tNormal , coord1 ).rgb;  
  vec3 bump2 = texture2D( tNormal , coord2  ).rgb;  
  vec3 bump3 = texture2D( tNormal , coord3  ).rgb; 

  vec3 blended_bump = bump1 * blend_weights.xxx +  
                      bump2 * blend_weights.yyy +  
                      bump3 * blend_weights.zzz;

  vec3 tanX = vec3( vNorm.x, -vNorm.z, vNorm.y);
  vec3 tanY = vec3( vNorm.z, vNorm.y, -vNorm.x);
  vec3 tanZ = vec3(-vNorm.y, vNorm.x, vNorm.z);
  vec3 blended_tangent = tanX * blend_weights.xxx +  
                         tanY * blend_weights.yyy +  
                         tanZ * blend_weights.zzz; 

  vec3 normalTex = blended_bump * 2.0 - 1.0;
  normalTex.xy *= normalScale;
  normalTex.y *= -1.;
  normalTex = normalize( normalTex );
  mat3 tsb = mat3( normalize( blended_tangent ), normalize( cross( vNorm, blended_tangent ) ), normalize( vNorm ) );
  
  vec3 finalNormal = tsb * normalTex;

 
  vec3 refl = reflect( vLightDir , finalNormal );
  float facingRatio = abs( dot( finalNormal , refl) );
  float newDot = dot( finalNormal  , normalize(vView) );
  float inverse_dot_view = 1.0 - max( newDot  , 0.0);

  float lookup = inverse_dot_view * (1.-facingRatio);
  vec3 aColor = texture2D( t_audio , vec2( inverse_dot_view * (1.- facingRatio) , 0.0 ) ).xyz;
 
  vec3 lookup_table_color = texture2D( t_iri , vec2( lookup , 0. ) ).xyz;

  if( vHead >= .5 ){

    lookup_table_color = texture2D( t_iri2 , vec2( lookup , 0. ) ).xyz;

  }

  vec3 nonFacing = lookup_table_color * (1.-facingRatio)* (1.-facingRatio)* (1.-facingRatio);
  vec3 c =  lookup_table_color * aColor * .6 + nonFacing*.4;
  gl_FragColor = vec4( c , .1 );

  //gl_FragColor = vec4( 1. );
}
