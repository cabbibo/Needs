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


varying mat3 vNormalMat;
varying vec3 vLightDir;
varying vec3 vLightPos;
varying vec3 vView;
varying vec3 vMVPos;

uniform float texScale;
uniform float normalScale;

$simplex

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


  // FROM @thespite
  /*vec3 n = normalize( vNorm.xyz );
  vec3 blend_weights = abs( n );
  blend_weights = ( blend_weights - 0.2 ) * 7.;  
  blend_weights = max( blend_weights, 0. );
  blend_weights /= ( blend_weights.x + blend_weights.y + blend_weights.z );

  vec2 coord1 = vPos.yz * texScale;
  vec2 coord2 = vPos.zx * texScale;
  vec2 coord3 = vPos.xy * texScale;

  vec3 bump1 = texture2D( tNormal , coord1  ).rgb;  
  vec3 bump2 = texture2D( tNormal , coord2   ).rgb;  
  vec3 bump3 = texture2D( tNormal , coord3   ).rgb; 

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
 */
  //vec3 bump = texture2D( tNormal , vUv ).xyz;
  //vec3 finalNormal = tsb * normalTex;

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

    //vec3 finalNormal = vNorm;
    vec3 finalNormal =  normalize( tsn * mapN );


 // vec3 finalNormal = normalize(vNorm  + 1. *  bump);

  vec3 newNormal = finalNormal;

  vec3 nNormal = normalize( vNormalMat * newNormal  );
  vec3 nView = normalize(vView);
  vec3 nReflection = normalize( reflect( vView , nNormal )); 

  vec3 refl = reflect( vLightDir , nNormal );
  float facingRatio = abs( dot(  nNormal, refl) );

  float newDot = dot( normalize( nNormal ), nView );
  float inverse_dot_view = 1.0 - max( newDot  , 0.0);

  vec3 p1 = color1;
  vec3 p2 = color2;
  vec3 p3 = color3;
  vec3 p4 = color4;
  
  vec3 v1 = vec3(0.);
  vec3 v2 = .2  * p1-p3;
  vec3 v3 = .5  * p2-p4;
  vec3 v4 = vec3(0.);

  vec3 c1 = p1;
  vec3 c2 = p2 + v1/3.;
  vec3 c3 = p3 - v2/3.;
  vec3 c4 = p4;

  float s  = snoise( vPos * .0001 );
  //float s1 = snoise( vPos * .004 );
  

  float total = s;

  total = (cos(total) + 1.)/2.;

 // vec3 lookup = texture2D( t_iri , vec2( inverse_dot_view * facingRatio , 0. ) ).xyz;
  vec3 lookup = cubicCurve( inverse_dot_view * facingRatio, c1 , c2 , c3 , c4 );


 // vec3 lookup = texture2D( tLookup , vec2( inverse_dot_view * facingRatio,0. )).xyz;
  
  vec3 aColor = texture2D( t_audio , vec2( inverse_dot_view * facingRatio,0. )).xyz;

 // float noise = snoise( normalize(vPos) );

  vec3 facing = aColor; //* facingRatio*facingRatio*facingRatio;
  vec3 nonFacing =  lookup * (1.-facingRatio)* (1.-facingRatio)* (1.-facingRatio);
 // vec3 nonFacing =  lookup_table_color * (1.-facingRatio);



  //vec3 norm = ((finalNormal * .3 + .7) * facingRatio)*.1;
  vec3 norm = vec3(abs(finalNormal.x));
  gl_FragColor = vec4(.6 * lookup + .6 * aColor + .6 * nonFacing, 1.0 );
  //gl_FragColor = vec4(facing, 1.0 )
  //gl_FragColor = vec4( vUv.x , vUv.y , .5 , 1.0 );
  //gl_FragColor = vec4( finalNormal , 1.0 );

}

