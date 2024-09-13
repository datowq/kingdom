// helpful resources:
// http://www.codinglabs.net/article_world_view_projection_matrix.aspx
// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection
// https://blog.maximeheckel.com/posts/the-study-of-shaders-with-react-three-fiber/
// https://thebookofshaders.com/


// uniforms: iTime, modelMatrix, viewMatrix, projectionMatrix, position, uv, color
uniform float iTime;

// attributes: position, uv, color

// outputs to fragment shader: cloud UVs, geometry UVs, color
out vec2 cloudUV;
out vec2 vUV;
// out vec3 vColor;

void main() {

  // set up the outputs
  vUV = uv;
  cloudUV = uv;
  // vColor = color;
  
  float waveSize = 10.0f;
  float tipDistance = 0.3f;
  float centerDistance = 0.1f;

  // model space (object space):
  // local coordinate space of a 3D model. 
  // all vertices are defined relative to the model's origin, which is typically 0,0,0 within the model itself
  // "When an artist authors a 3D model he creates all the vertices and faces relatively to the 3D coordinate 
  // system of the tool he is working in, which is the Model Space."

  // modelMatrix:
  // modelmatrix is used to transform the vertex position from model space to world space

  // move the vertex position from model space to world space
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  // iTime is a uniform that represents the time in seconds since the start of the program
  // in this case the color is used to encode height information about the grass
  if (color.x > 0.6f) {
    modelPosition.x += sin((iTime / 2.) + (uv.x * waveSize)) * tipDistance;
  }else if (color.x > 0.0f) {
    modelPosition.x += sin((iTime / 2.) + (uv.x * waveSize)) * centerDistance;
  }

  cloudUV.x += iTime / 50.;
  cloudUV.y += iTime / 50.;

  // viewMatrix:
  // viewMatrix is used to transform the vertex position from world space to view space
  // view space is the coordinate system of the camera (or viewer) and is centered around the camera's position
  
  // viewPosition is the vertex position in view space
  vec4 viewPosition = viewMatrix * modelPosition;

  // projectionMatrix:
  // projectionMatrix is used to transform the vertex position from view space to clip space
  // clip space is a 3D coordinate system that is used to determine which vertices are visible on the screen
  // vertices that are outside the clip space are clipped and not rendered

  // projectedPosition is the vertex position in clip space
  vec4 projectedPosition = projectionMatrix * viewPosition;
  
  csm_PositionRaw = projectedPosition;
  // there are more transformations that happen after this but opengl handles them 
  // the GPU takes care of the rest of the transformations and the rasterization process
}