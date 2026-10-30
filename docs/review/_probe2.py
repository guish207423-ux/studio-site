from PIL import Image

im = Image.open("docs/review/shots/1440-services.png").convert("RGB")
# 服务卡图标：视口坐标 (206..238, 422..454)，来自 DOM 测量
crop = im.crop((200, 416, 246, 460))
px = list(crop.get_flattened_data()) if hasattr(crop, "get_flattened_data") else list(crop.getdata())
bright = [p for p in px if max(p) > 60]
print("icon patch size", crop.size, "bright pixels(>60):", len(bright), "of", len(px))
print("sample:", px[:6])
# 对照：同卡标题文字区域（应亮）
crop2 = im.crop((206, 480, 400, 520))
px2 = list(crop2.getdata())
print("title patch bright:", len([p for p in px2 if max(p) > 100]), "of", len(px2))
# 卡片边框处 1px 线：x=165
line = [im.getpixel((165, y)) for y in range(3100 - 2631, 3110 - 2631)]
print("card left border pixels:", line[:6])
print("card inner bg:", im.getpixel((300, 3400 - 2631)))
print("page bg:", im.getpixel((120, 3400 - 2631)))
