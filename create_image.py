from PIL import Image, ImageDraw, ImageFont

# Create image
img = Image.new('RGB', (1200, 630), color=(15, 23, 42))
draw = ImageDraw.Draw(img)

# Try to load font
try:
    font_large = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 60)
    font_small = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 40)
except:
    font_large = ImageFont.load_default()
    font_small = ImageFont.load_default()

# Draw text
draw.text((600, 250), 'Tailwind CSS 2026', fill='#38bdf8', anchor='mm', font=font_large)
draw.text((600, 350), 'Style Architecture', fill='#ffffff', anchor='mm', font=font_small)

# Save
img.save('/workspace/public/blog-images/og-tailwind-css-2026.jpg')
print('Image created successfully')
