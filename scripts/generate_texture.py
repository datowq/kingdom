import numpy as np
from PIL import Image, ImageFilter

def generate_texture(width=768, height=768, color1=(34, 139, 34), color2=(50, 205, 50), spots=1000):
    """
    Generate a texture map similar to the uploaded image.
    
    Parameters:
    - width (int): Width of the texture.
    - height (int): Height of the texture.
    - color1 (tuple): RGB color for the base layer.
    - color2 (tuple): RGB color for the spots layer.
    - spots (int): Number of spots to generate.
    
    Returns:
    - Image object with the generated texture.
    """
    # Create a base image with a gradient-like background
    base = np.zeros((height, width, 3), dtype=np.uint8)

    for i in range(height):
        for j in range(width):
            blend_factor = np.sin(i / height * np.pi) * np.sin(j / width * np.pi)
            base[i, j] = np.array(color1) * blend_factor + np.array(color2) * (1 - blend_factor)

    # Convert base array to an image
    base_image = Image.fromarray(base)

    # Create an overlay of spots to simulate the natural texture
    spots_image = Image.new('RGB', (width, height), (0, 0, 0))
    pixels = spots_image.load()

    for _ in range(spots):
        # Random positions and sizes for spots
        x = np.random.randint(0, width)
        y = np.random.randint(0, height)
        size = np.random.randint(10, 50)
        
        # Random color blend
        spot_color = (
            np.random.randint(0, 100),
            np.random.randint(50, 150),
            np.random.randint(0, 100)
        )

        for dx in range(-size // 2, size // 2):
            for dy in range(-size // 2, size // 2):
                if 0 <= x + dx < width and 0 <= y + dy < height and dx**2 + dy**2 <= (size // 2) ** 2:
                    pixels[x + dx, y + dy] = spot_color

    # Blur the spots image to soften it
    spots_image = spots_image.filter(ImageFilter.GaussianBlur(10))

    # Composite the spots onto the base
    combined_image = Image.blend(base_image, spots_image, 0.5)

    # Apply a slight blur to create a more natural feel
    combined_image = combined_image.filter(ImageFilter.GaussianBlur(2))

    return combined_image

# Generate and save the texture
texture = generate_texture()
texture.save("generated_texture.png")
