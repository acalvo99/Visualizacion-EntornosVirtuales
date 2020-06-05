#version 120

uniform int active_lights_n; // Number of active lights (< MG_MAX_LIGHT)
uniform vec3 scene_ambient; // Scene ambient light

uniform struct light_t {
	vec4 position;    // Camera space
	vec3 diffuse;     // rgb
	vec3 specular;    // rgb
	vec3 attenuation; // (constant, lineal, quadratic)
	vec3 spotDir;     // Camera space
	float cosCutOff;  // cutOff cosine
	float exponent;
} theLights[4];     // MG_MAX_LIGHTS

uniform struct material_t {
	vec3  diffuse;
	vec3  specular;
	float alpha;
	float shininess;
} theMaterial;

uniform vec3 campos; // Camera position in world space

uniform sampler2D texture0;   // Texture
uniform samplerCube envmap;   // Environment map (cubemap)

varying vec3 f_position;      // camera space
varying vec3 f_viewDirection; // camera space
varying vec3 f_normal;        // camera space
varying vec2 f_texCoord;
varying vec3 f_positionw;    // world space
varying vec3 f_normalw;      // world space


void main() {
	vec3 normala = normalize(f_normal);
	vec3 v = normalize(f_viewDirection);
	vec4 ivec = vec4(scene_ambient,1.0);
	vec4 diff = vec4(0,0,0,0);
	vec4 spec = vec4(0,0,0,0);

	vec3 I = normalize(v-f_position);
	vec3 R = 2*(normala*I)*normala-I;

	for(int i=0; i<active_lights_n; i++){
		vec3 l = normalize(theLights[i].position.xyz-v);

		if(theLights[i].position.w==0.0){
		//direction light
			vec3 l = normalize(-theLights[i].position.xyz);
			//diffuse 
			diff = vec4(max(0.0,dot(normala,l))*theMaterial.diffuse*theLights[i].diffuse,0.0);
			vec3 r = normalize(2*dot(normala,l)*normala-l);
			//specular
			spec = vec4(max(0.0,dot(normala,l))*(max(pow((dot(r,v)), theMaterial.shininess),0.0))*texture2D(specmap,f_texCoord).rgb*theLights[0].specular,0.0);

		}else if(theLights[i].cosCutOff==0.0){
		//point light
			float dist = distance(theLights[i].position.xyz,f_position);
			vec3 l = normalize(theLights[i].position.xyz-f_position);
			float d = 1/(theLights[i].attenuation.x+theLights[i].attenuation.y*dist+theLights[i].attenuation.z*pow(dist,2));
			//diffuse
			diff = vec4(d*max(0.0,dot(normala,l))*theLights[i].diffuse*theMaterial.diffuse,0.0);
			vec3 r = normalize(2*dot(normala,l)*normala-l);
			//specular
			spec = vec4(d*max(0.0,dot(normala,l))*max(pow(dot(r,v), theMaterial.shininess),0.0)*texture2D(specmap,f_texCoord).rgb*theLights[0].specular,0.0);

		} else{
		//spot light
			vec3 l = normalize(theLights[i].position.xyz-f_position);
			vec3 r = normalize(2*dot(normala,l)*normala-l);
			float cspot = max(dot(-l, theLights[i].spotDir), 0.0);
			if (cspot > theLights[i].cosCutOff) {
				//diffuse
				diff = vec4(pow(cspot,theLights[i].exponent)*max(0.0,dot(normala,l))*theLights[i].diffuse,0.0);
				//specular
				spec = vec4(pow(cspot,theLights[i].exponent)*max(0.0,dot(normala,l))*max(pow(dot(r,v),theMaterial.shininess),0.0)*theLights[i].specular,0.0);
			}
		}

	ivec = ivec + diff + spec;
	}
	
	gl_FragColor = ivec;
	vec4 texture = texture2D(texture0, f_texCoord);
	gl_FragColor = gl_FragColor * texture;
}
