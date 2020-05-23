#version 120

uniform int active_lights_n; // Number of active lights (< MG_MAX_LIGHT)
uniform vec3 scene_ambient; // Scene ambient light

struct material_t {
	vec3  diffuse;
	vec3  specular;
	float alpha;
	float shininess;
};

struct light_t {
	vec4 position;    // Camera space
	vec3 diffuse;     // rgb
	vec3 specular;    // rgb
	vec3 attenuation; // (constant, lineal, quadratic)
	vec3 spotDir;     // Camera space
	float cosCutOff;  // cutOff cosine
	float exponent;
};

uniform light_t theLights[4];
uniform material_t theMaterial;

uniform sampler2D texture0;
uniform sampler2D bumpmap;

varying vec2 f_texCoord;
varying vec3 f_viewDirection;     // tangent space
varying vec3 f_lightDirection[4]; // tangent space
varying vec3 f_spotDirection[4];  // tangent space

void main() {
	// Base color
	vec4 baseColor = texture2D(texture0, f_texCoord);

	// Decode the tangent space normal (from [0..1] to [-1..+1])
	vec3 N = texture2D(bumpmap, f_texCoord).rgb * 2.0 - 1.0;

	vec3 batura = vec3(0, 0, 0);
	vec3 normala = normalize(N);
	vec3 v = normalize(f_viewDirection);

	for(int i=0; i < active_lights_n; ++i) {
		//diffuse
		vec3 diff = theLights[i].diffuse * theMaterial.diffuse;
		vec3 l = normalize(f_lightDirection[i]);
		vec3 r = 2*dot(normala, l)*normala - l;
		vec3 spec = pow(max(0, dot(r, v)), theMaterial.shininess)*(theMaterial.specular*theLights[i].specular);
		
		if (theLights[i].cosCutOff == 0.0) {
		  	batura = batura + (max(0, dot(normala, l)) * (diff+spec));
		}
		else {
			vec3 spotDir = normalize(f_spotDirection[i]);
			float cspot = max(dot(-l, spotDir), 0);
			if (cspot > theLights[i].cosCutOff) {
				batura = batura + (cspot * max(0, dot(normala, l)) * (diff+spec));
			}
		}
	}
	vec3 ivec = scene_ambient + batura;

	vec4 f_color = vec4(ivec, 1.0);

	// Final color
	gl_FragColor = f_color * baseColor;
}
