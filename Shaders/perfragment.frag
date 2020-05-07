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

uniform sampler2D texture0;

varying vec3 f_position;      // camera space
varying vec3 f_viewDirection; // camera space
varying vec3 f_normal;        // camera space
varying vec2 f_texCoord;


void main() {
	vec3 batura = vec3(0, 0, 0);
	vec3 normala = normalize(f_normal);
	vec3 v = normalize(f_viewDirection);

	for(int i=0; i<active_lights_n; i++){
		//diffuse
		vec3 diff = theMaterial.diffuse*theLights[i].diffuse;

		if(theLights[i].position.w==0.0){
			//direction light
			vec3 l = normalize(-theLights[i].position.xyz);
			vec3 r = 2*dot(normala, l)*normala - l;
			//specular
			vec3 spec = pow(max(0, dot(r, v)), theMaterial.shininess)*(theMaterial.specular*theLights[i].specular); 
			batura = batura + (max(0, dot(normala, l))*(diff + spec)); 

		}else if(theLights[i].cosCutOff==0.0){
			//point light
			vec3 l = normalize(theLights[i].position.xyz - f_position);
			vec3 r = 2*dot(normala, l)*normala - l;
			vec3 spec = pow(max(0, dot(r, v)), theMaterial.shininess)*(theMaterial.specular*theLights[i].specular);
		  	batura = batura + (d * max(0, dot(normala, l)) * (diff+spec));
		} else{
			//spot light
			vec3 l = normalize(theLights[i].position.xyz - f_position);
			vec3 r = 2*dot(normala, l)*normala - l;
			vec3 spec = pow(max(0, dot(r, v)), theMaterial.shininess)*(theMaterial.specular*theLights[i].specular);
			float cspot = max(dot(-l, theLights[i].spotDir), 0);
			if (cspot > theLights[i].cosCutOff) {
				batura = batura + (cspot * max(0, dot(normala, l)) * (diff+spec));
			}
		}
	}
	vec3 ivec = scene_ambient + batura;

	vec4 color = vec4(ivec, 1.0);
	gl_Position = modelToClipMatrix * vec4(v_position, 1.0);
	gl_FragColor = color * vec4(1.0);
}




