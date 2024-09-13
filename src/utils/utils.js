export function checkWebGLVersions() {
  // Create a canvas element to get the WebGL context
  const canvas = document.createElement("canvas");

  // Try to get WebGL 2.0 context first, fallback to WebGL 1.0 if not available
  const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");

  if (!gl) {
    console.log("WebGL is not supported on this device.");
    return;
  }

  // Determine WebGL version
  const webGLVersion =
    gl instanceof WebGL2RenderingContext ? "WebGL 2.0" : "WebGL 1.0";
  console.log(`WebGL Version: ${webGLVersion}`);

  // Get the GLSL version string from the WebGL context
  const glslVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
  console.log(`GLSL Version: ${glslVersion}`);

  // Additional information about the renderer and vendor
  const renderer = gl.getParameter(gl.RENDERER);
  const vendor = gl.getParameter(gl.VENDOR);
  console.log(`Renderer: ${renderer}`);
  console.log(`Vendor: ${vendor}`);
}
