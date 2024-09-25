// uniform sampler2D textures[4];

in vec2 vUV;
in vec2 cloudUV;
// in vec3 vColor;

void main() {
  float contrast = 1.;
  float brightness = -0.1;

  // vec3 color = texture(textures[0], vUV).rgb * contrast;
  // vec3 color = vec3(0.2, 0.4, 0.2);
  // vec3 color = vec4(v_uvs, 1.0, 1.0);
  // color = color + brightness;
  // color = color + vec3(brightness, brightness, brightness);
  // color = mix(color, texture(textures[1], cloudUV).rgb * 1.5, 0.1);


  // csm_DiffuseColor.rgb = color;
  csm_DiffuseColor = vec4(vUV, 1.0, 1.0);
  // csm_DiffuseColor.a = 0.1;
}
