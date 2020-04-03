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
	//argi bakarrarekin
	vec4 normala = modelToCameraMatrix * vec4(v_normal, 0.0); 
	vec4 l = normalize(-theLights[0].position);
	vec4 r = 2*dot(normala, l)*normala - l;
	vec4 v = normalize(-(theLights[0].position-(vec4(v_position, 0.0))));
	vec3 diff = theMaterial.diffuse*theLights[0].diffuse; //diffuse
	vec3 spec = pow(max(0, dot(r, v)), theMaterial.shininess)*(theMaterial.specular*theLights[0].specular); //specular
	vec3 i = scene_ambient + max(0, dot(normala, l))*(diff + spec);
	f_color = vec4(i, 1.0);
	gl_Position = modelToClipMatrix * vec4(v_position, 1);
	
}
