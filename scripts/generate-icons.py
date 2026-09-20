"""Generate app icons using PIL (no native deps)."""
from PIL import Image, ImageDraw
import os

sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512]
os.makedirs('public/icons', exist_ok=True)
os.makedirs('src-tauri/icons', exist_ok=True)

for size in sizes:
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Background gradient (approximated as solid for simplicity)
    bg_color = (87, 37, 128)  # #572580
    draw.rectangle([0, 0, size, size], fill=bg_color)
    
    # Warning triangle
    cx = size / 2
    cy = size / 2
    tri_size = size * 0.45
    h = tri_size * (3**0.5) / 2
    
    triangle = [
        (cx, cy - h * 2/3),
        (cx + tri_size/2, cy + h/3),
        (cx - tri_size/2, cy + h/3)
    ]
    draw.polygon(triangle, fill='white')
    
    # Exclamation mark
    mark_size = size * 0.15
    # Bar
    bar_left = cx - mark_size/2
    bar_top = cy - h/3
    bar_right = cx + mark_size/2
    bar_bottom = cy - h/3 + h * 0.6
    draw.rounded_rectangle([bar_left, bar_top, bar_right, bar_bottom], radius=mark_size/2, fill='#572580')
    
    # Dot
    dot_cy = cy + h/3 - mark_size * 1.2
    draw.ellipse([cx - mark_size/2, dot_cy - mark_size/2, cx + mark_size/2, dot_cy + mark_size/2], fill='#572580')
    
    img.save(f'public/icons/{size}x{size}.png')
    print(f'Generated public/icons/{size}x{size}.png')

# 128x128@2x (256x256)
img2x = Image.new('RGBA', (256, 256), (0, 0, 0, 0))
draw2x = ImageDraw.Draw(img2x)
draw2x.rectangle([0, 0, 256, 256], fill=(87, 37, 128))
cx2, cy2 = 128, 128
tri2 = 115
h2 = tri2 * (3**0.5) / 2
triangle2 = [(cx2, cy2 - h2*2/3), (cx2+tri2/2, cy2+h2/3), (cx2-tri2/2, cy2+h2/3)]
draw2x.polygon(triangle2, fill='white')
mark2 = 38
draw2x.rounded_rectangle([cx2-mark2/2, cy2-h2/3, cx2+mark2/2, cy2-h2/3+h2*0.6], radius=mark2/2, fill='#572580')
dot_cy2 = cy2 + h2/3 - mark2 * 1.2
draw2x.ellipse([cx2-mark2/2, dot_cy2-mark2/2, cx2+mark2/2, dot_cy2+mark2/2], fill='#572580')
img2x.save('public/icons/128x128@2x.png')
print('Generated public/icons/128x128@2x.png')

# For Tauri - create multiple sizes in ICO format
ico_sizes = [(16,16), (32,32), (48,48), (64,64), (128,128), (256,256)]
ico_images = []
for w, h in ico_sizes:
    ico_img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(ico_img)
    draw.rectangle([0, 0, w, h], fill=(87, 37, 128))
    cx, cy = w/2, h/2
    tri = min(w, h) * 0.45
    h_tri = tri * (3**0.5) / 2
    triangle = [(cx, cy - h_tri*2/3), (cx+tri/2, cy+h_tri/3), (cx-tri/2, cy+h_tri/3)]
    draw.polygon(triangle, fill='white')
    mark = min(w, h) * 0.15
    draw.rounded_rectangle([cx-mark/2, cy-h_tri/3, cx+mark/2, cy-h_tri/3+h_tri*0.6], radius=mark/2, fill='#572580')
    dot_cy = cy + h_tri/3 - mark * 1.2
    draw.ellipse([cx-mark/2, dot_cy-mark/2, cx+mark/2, dot_cy+mark/2], fill='#572580')
    ico_images.append(ico_img)

ico_images[0].save('src-tauri/icons/icon.ico', format='ICO', sizes=[(img.width, img.height) for img in ico_images])
print('Generated src-tauri/icons/icon.ico')

# ICNS - save as 1024x1024 PNG (macOS can use this directly or we convert)
icns_img = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
draw = ImageDraw.Draw(icns_img)
draw.rectangle([0, 0, 1024, 1024], fill=(87, 37, 128))
cx, cy = 512, 512
tri = 460
h_tri = tri * (3**0.5) / 2
triangle = [(cx, cy - h_tri*2/3), (cx+tri/2, cy+h_tri/3), (cx-tri/2, cy+h_tri/3)]
draw.polygon(triangle, fill='white')
mark = 150
draw.rounded_rectangle([cx-mark/2, cy-h_tri/3, cx+mark/2, cy-h_tri/3+h_tri*0.6], radius=mark/2, fill='#572580')
dot_cy = cy + h_tri/3 - mark * 1.2
draw.ellipse([cx-mark/2, dot_cy-mark/2, cx+mark/2, dot_cy+mark/2], fill='#572580')
icns_img.save('src-tauri/icons/icon.png')
print('Generated src-tauri/icons/icon.png (1024x1024 for ICNS conversion)')

print('\\nAll icons generated.')
print('Note: For proper .icns, use `iconutil -c icns iconset` on macOS with an iconset folder.')
print('The .ico file is properly formatted.')