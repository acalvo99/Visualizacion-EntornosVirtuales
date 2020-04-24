#version 120

uniform mat4 modelToCameraMatrix;
uniform mat4 cameraToClipMatrix;
uniform mat4 modelToWorldMatrix;
uniform mat4 modelToClipMatrix;

uniform int active_lights_n; // Number of active lights (< MG_MAX_LIGHT)
uniform vec3 scene_ambient;  // rgb

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

attribute vec3 v_position; // Model space
attribute vec3 v_normal;   // Model space
attribute vec2 v_texCoord;

varying vec4 f_color;
varying vec2 f_texCoord;


void main() {
	vec3 normala = normalize(modelToCameraMatrix * vec4(v_normal, 0.0)).xyz; 
	vec3 erpina_kam = (modelToCameraMatrix * vec4(v_position, 1.0)).xyz;
	vec3 v = -normalize(erpina_kam);
	vec3 batura = vec3(0.0, 0.0, 0.0);

	for(int i=0; i<4; i++){
		//diffuse
		vec3 diff = theMaterial.diffuse*theLights[i].diffuse;

		if(theLights[i].position.w==0.0){
			//direction light
			vec3 l = normalize(-theLights[i].position.xyz);
			vec3 r = 2*dot(normala, l)*normala - l;
			//specular
			vec3 spec = pow(max(0, dot(r, v)), theMaterial.shininess)*(theMaterial.specular*theLights[i].specular); 
			batura = batura + max(0, dot(normala, l))*(diff + spec); 

		}else if(theLights[i].cosCutOff==0.0){
			//point light
			vec3 l = normalize(-theLights[i].position.xyz - erpina_kam);
			vec3 r = 2*dot(normala, l)*normala - l;
			//specular
			vec3 spec = pow(max(0, dot(r, v)), theMaterial.shininess)*(theMaterial.specular*theLights[i].specular); 
			float distantzia = distance(theLights[i].position.xyz, erpina_kam);
			vec3 ahuldura = theLights[i].attenuation;
			float d = 1 / (ahuldura[0] + ahuldura[1]*distantzia + ahuldura[2]*pow(distantzia, 2));
			batura = batura + (d * max(0, dot(normala, l))*(diff + spec)); 
		} else{
			//spot light
		}
	}
	vec3 ivec = scene_ambient + batura;

	f_color = vec4(ivec, 1.0);
	gl_Position = modelToClipMatrix * vec4(v_position, 1);
	f_texCoord = v_texCoord;
	
}
