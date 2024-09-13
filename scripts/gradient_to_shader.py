import re

# Function to convert HSLA values to RGBA format
def hsla_to_rgba(h, s, l, a):
    s /= 100.0
    l /= 100.0
    c = (1 - abs(2 * l - 1)) * s
    x = c * (1 - abs((h / 60) % 2 - 1))
    m = l - c / 2
    r, g, b = 0, 0, 0

    if 0 <= h < 60:
        r, g, b = c, x, 0
    elif 60 <= h < 120:
        r, g, b = x, c, 0
    elif 120 <= h < 180:
        r, g, b = 0, c, x
    elif 180 <= h < 240:
        r, g, b = 0, x, c
    elif 240 <= h < 300:
        r, g, b = x, 0, c
    else:
        r, g, b = c, 0, x

    return f'vec4({r + m:.3f}, {g + m:.3f}, {b + m:.3f}, {a:.1f})'

# Function to parse HSLA values from input and convert to GLSL code
def parse_hsla_colors(input_string):
    # Extract HSLA values using regex
    hsla_matches = re.findall(r'hsla\((\d+),\s*(\d+)%,\s*(\d+)%,\s*(\d+(\.\d+)?)\)', input_string)
    colors = [hsla_to_rgba(float(h), float(s), float(l), float(a)) for h, s, l, a, _ in hsla_matches]
    return colors

# Function to generate GLSL fragment shader code from HSLA input or gradient
def hsla_to_glsl_shader(input_string):
    # Determine if the input is a single HSLA color or a gradient
    colors = parse_hsla_colors(input_string)
    if not colors:
        print("Invalid input format. Please provide a valid HSLA color or gradient.")
        return ""

    # Generate GLSL fragment shader code based on the number of colors
    glsl_code = """#version 330 core

out vec4 FragColor;
in vec2 vUv;

void main() {
    // Define colors from HSLA input
"""
    # Add color declarations to the GLSL code
    for i, color in enumerate(colors):
        glsl_code += f"    vec4 color{i} = {color};\n"

    if len(colors) == 1:
        # If only one color, no need for gradient interpolation
        glsl_code += """
    vec4 finalColor = color0;
"""
    else:
        # Calculate interpolation factors based on the number of colors
        steps = len(colors) - 1
        glsl_code += f"""
    float gradientFactor = vUv.x * {steps}.0;
    int index = int(gradientFactor);
    float mixFactor = fract(gradientFactor);

    // Interpolate between the corresponding colors
    vec4 finalColor;
"""
        # Generate the interpolation logic dynamically based on the number of colors
        for i in range(steps):
            if i == 0:
                glsl_code += f"    if (index == {i}) finalColor = mix(color{i}, color{i+1}, mixFactor);\n"
            else:
                glsl_code += f"    else if (index == {i}) finalColor = mix(color{i}, color{i+1}, mixFactor);\n"

    glsl_code += """
    gl_FragColor = finalColor;
}
"""
    return glsl_code

# Example inputs
hsla_input_single = "hsla(208, 38%, 15%, 1)"
gradient_input = "background: linear-gradient(0deg, hsla(208, 38%, 15%, 1) 0%, hsla(0, 60%, 59%, 1) 23%, hsla(28, 77%, 71%, 1) 41%, hsla(10, 66%, 84%, 1) 69%, hsla(196, 39%, 90%, 1) 100%);"

# Generate GLSL shader code for single HSLA color
# glsl_shader_single = hsla_to_glsl_shader(hsla_input_single)
# print("GLSL Shader for Single HSLA Color:\n", glsl_shader_single)

# Generate GLSL shader code for gradient
glsl_shader_gradient = hsla_to_glsl_shader(gradient_input)
print("\nGLSL Shader for Gradient:\n", glsl_shader_gradient)
