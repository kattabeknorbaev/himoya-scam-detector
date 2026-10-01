import os
from PIL import Image, ImageDraw, ImageFont

os.makedirs('store-assets', exist_ok=True)

def create_gradient_bg(width, height, color_top, color_bottom):
    base = Image.new('RGB', (width, height), color_top)
    draw = ImageDraw.Draw(base)
    r1, g1, b1 = color_top
    r2, g2, b2 = color_bottom
    for y in range(height):
        ratio = y / height
        r = int(r1 + (r2 - r1) * ratio)
        g = int(g1 + (g2 - g1) * ratio)
        b = int(b1 + (b2 - b1) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    return base

def get_font(size, bold=False):
    # Try Windows system fonts
    font_names = [
        "segoeuib.ttf" if bold else "segoeui.ttf",
        "arialbd.ttf" if bold else "arial.ttf",
        "tahoma.ttf"
    ]
    for fn in font_names:
        try:
            return ImageFont.truetype(f"C:/Windows/Fonts/{fn}", size)
        except Exception:
            pass
    return ImageFont.load_default()

# -------------------------------------------------------------
# SCREENSHOT 1: Extension Dashboard & Smart Scanner (1280x800)
# -------------------------------------------------------------
def make_screenshot1():
    W, H = 1280, 800
    img = create_gradient_bg(W, H, (10, 15, 29), (15, 23, 42))
    draw = ImageDraw.Draw(img)

    # Accent lighting circles
    overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ov_draw = ImageDraw.Draw(overlay)
    ov_draw.ellipse([800, 100, 1300, 600], fill=(59, 130, 246, 25))
    ov_draw.ellipse([100, 400, 600, 900], fill=(16, 185, 129, 20))
    img.paste(Image.alpha_composite(Image.new('RGBA', (W, H), (0,0,0,0)), overlay).convert('RGB'), (0,0))
    draw = ImageDraw.Draw(img)

    # Left Column: Value Proposition & Feature Badges
    # Icon
    if os.path.exists('icon128.png'):
        icon = Image.open('icon128.png').convert('RGBA')
        icon_resized = icon.resize((84, 84), Image.Resampling.LANCZOS)
        img.paste(icon_resized, (70, 70), icon_resized)

    f_badge = get_font(13, bold=True)
    f_title = get_font(38, bold=True)
    f_subtitle = get_font(18, bold=False)
    f_body = get_font(14, bold=False)
    f_card_title = get_font(16, bold=True)

    # Badge
    draw.rounded_rectangle([175, 75, 420, 105], radius=6, fill=(30, 41, 59), outline=(51, 65, 85))
    draw.text((188, 82), "CYBERSECURITY SHIELD • v5.4.0", font=f_badge, fill=(56, 189, 248))

    draw.text((175, 115), "Himoya AI Scam Detector", font=f_title, fill=(248, 250, 252))
    draw.text((70, 180), "Real-time, client-side threat intelligence protecting Central Asian users from\nfinancial card-draining funnels, OTP theft, and fake state subsidy scams.", font=f_subtitle, fill=(148, 163, 184))

    # Feature Cards on the Left
    features = [
        ("⚡ 46,000+ Nodes / Second", "High-performance Aho-Corasick DFA engine scans dynamic SPAs with 0 frame drops."),
        ("🛡️ Uzcard, Humo & Banking Defense", "Stops credential harvesting, card PIN/CVV theft, and unauthorized transfers."),
        ("🚫 Zero-Knowledge Architecture", "100% on-device scanning. Zero telemetry, zero external APIs, zero data stored."),
        ("📱 APK Trojan & Telegram Defense", "Detects malicious .apk droppers, fake voting traps, and urgent loan hoaxes.")
    ]

    card_y = 260
    for title, desc in features:
        draw.rounded_rectangle([70, card_y, 650, card_y + 85], radius=10, fill=(17, 24, 39), outline=(30, 41, 59), width=1)
        # Left accent stripe
        draw.rounded_rectangle([70, card_y, 74, card_y + 85], radius=2, fill=(14, 165, 233))
        draw.text((90, card_y + 14), title, font=f_card_title, fill=(241, 245, 249))
        draw.text((90, card_y + 42), desc, font=f_body, fill=(148, 163, 184))
        card_y += 105

    # Footer note
    draw.text((70, 715), "Compatible with Telegram Web, Facebook, Instagram & Chromium browsers.", font=f_body, fill=(100, 116, 139))

    # Right Column: UI Mockup / Dashboard Preview
    popup_src = "C:/Users/Kattabek/.gemini/antigravity/brain/37d0e177-b215-44f1-b0cd-6c35e72ca72e/.user_uploaded/media_1790849772792.png"
    if os.path.exists(popup_src):
        p_img = Image.open(popup_src).convert('RGBA')
        # Scale to fit nicely
        target_w = 480
        ratio = target_w / p_img.width
        target_h = int(p_img.height * ratio)
        p_resized = p_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
        
        # Shadow / outer card container
        bx, by = 710, 85
        draw.rounded_rectangle([bx - 10, by - 10, bx + target_w + 10, by + target_h + 10], radius=16, fill=(15, 23, 42), outline=(56, 189, 248), width=2)
        img.paste(p_resized, (bx, by), p_resized)
    else:
        # Fallback card
        bx, by = 720, 120
        draw.rounded_rectangle([bx, by, bx + 480, by + 580], radius=16, fill=(15, 23, 42), outline=(51, 65, 85), width=2)

    # Save Screenshot 1 (24-bit PNG, no alpha)
    img_rgb = img.convert('RGB')
    img_rgb.save('store-assets/screenshot1_dashboard.png', format='PNG')
    print("Created store-assets/screenshot1_dashboard.png (1280x800)")

# -------------------------------------------------------------
# SCREENSHOT 2: Real-Time Closed Shadow DOM Warning Alert (1280x800)
# -------------------------------------------------------------
def make_screenshot2():
    W, H = 1280, 800
    img = create_gradient_bg(W, H, (15, 23, 42), (10, 15, 29))
    draw = ImageDraw.Draw(img)

    f_badge = get_font(13, bold=True)
    f_title = get_font(34, bold=True)
    f_subtitle = get_font(17, bold=False)
    f_body = get_font(14, bold=False)
    f_alert_title = get_font(18, bold=True)
    f_alert_body = get_font(14, bold=False)

    # Header
    draw.rounded_rectangle([70, 50, 310, 80], radius=6, fill=(30, 41, 59), outline=(51, 65, 85))
    draw.text((82, 57), "CLOSED SHADOW DOM INJECTION", font=f_badge, fill=(244, 63, 94))

    draw.text((70, 95), "Instant In-Stream Scam Interception", font=f_title, fill=(248, 250, 252))
    draw.text((70, 145), "Isolates suspicious social messages and warns users before credentials or codes are exposed.", font=f_subtitle, fill=(148, 163, 184))

    # Mock Telegram Web Browser Frame
    fx, fy, fw, fh = 70, 195, 1140, 545
    draw.rounded_rectangle([fx, fy, fx + fw, fy + fh], radius=14, fill=(17, 24, 39), outline=(30, 41, 59), width=2)
    
    # Browser Top Bar
    draw.rounded_rectangle([fx, fy, fx + fw, fy + 45], radius=14, fill=(30, 41, 59))
    draw.rectangle([fx, fy + 30, fx + fw, fy + 45], fill=(30, 41, 59)) # square bottom corners of topbar
    # Dots
    draw.ellipse([fx + 16, fy + 17, fx + 26, fy + 27], fill=(239, 68, 68))
    draw.ellipse([fx + 34, fy + 17, fx + 44, fy + 27], fill=(245, 158, 11))
    draw.ellipse([fx + 52, fy + 17, fx + 62, fy + 27], fill=(34, 197, 94))
    # URL bar
    draw.rounded_rectangle([fx + 150, fy + 10, fx + 550, fy + 35], radius=6, fill=(15, 23, 42))
    draw.text((fx + 170, fy + 14), "🔒 https://web.telegram.org/a/", font=f_body, fill=(148, 163, 184))

    # Telegram Chat Window Simulation
    chat_x = fx + 40
    chat_y = fy + 70

    # Message Bubble 1 (Incoming Attack)
    draw.rounded_rectangle([chat_x, chat_y, chat_x + 600, chat_y + 115], radius=12, fill=(24, 34, 53), outline=(39, 54, 82))
    draw.text((chat_x + 18, chat_y + 12), "Telegram Notification Bot  [Scam Account]", font=get_font(13, bold=True), fill=(244, 63, 94))
    draw.text((chat_x + 18, chat_y + 36), "Hurmatli mijoz! Plastik kartangizdan 1,450,000 so'm yechildi.\nAgar bu siz bo'lmasangiz, bekor qilish uchun SMS kodni kiriting:\n👉 https://uzcard-himoya-xavfsiz.top/tasdiqlash", font=f_body, fill=(226, 232, 240))

    # Himoya Injected Shadow DOM Alert Banner (Sibling Card)
    ax, ay, aw, ah = chat_x, chat_y + 130, 680, 160
    draw.rounded_rectangle([ax, ay, ax + aw, ay + ah], radius=12, fill=(15, 23, 42), outline=(244, 63, 94), width=2)
    # Alert header
    draw.rounded_rectangle([ax, ay, ax + aw, ay + 42], radius=10, fill=(45, 19, 32))
    draw.rectangle([ax, ay + 30, ax + aw, ay + 42], fill=(45, 19, 32))
    draw.text((ax + 16, ay + 11), "🛡️ HIMOYA XAVFSIZLIK OGOHLANTIRISHI", font=f_alert_title, fill=(244, 63, 94))
    # Risk Badge
    draw.rounded_rectangle([ax + aw - 145, ay + 9, ax + aw - 16, ay + 33], radius=4, fill=(239, 68, 68))
    draw.text((ax + aw - 135, ay + 13), "CRITICAL RISK", font=get_font(11, bold=True), fill=(255, 255, 255))

    # Threat details
    draw.text((ax + 16, ay + 55), "Aniqlangan xavf turlari:", font=get_font(13, bold=True), fill=(248, 250, 252))
    draw.rounded_rectangle([ax + 180, ay + 53, ax + 310, ay + 75], radius=4, fill=(30, 41, 59))
    draw.text((ax + 190, ay + 57), "CARD_DRAINER", font=get_font(11, bold=True), fill=(244, 63, 94))
    draw.rounded_rectangle([ax + 320, ay + 53, ax + 430, ay + 75], radius=4, fill=(30, 41, 59))
    draw.text((ax + 330, ay + 57), "OTP_THEFT", font=get_font(11, bold=True), fill=(245, 158, 11))
    draw.rounded_rectangle([ax + 440, ay + 53, ax + 570, ay + 75], radius=4, fill=(30, 41, 59))
    draw.text((ax + 450, ay + 57), "SUSPICIOUS_DOMAIN", font=get_font(11, bold=True), fill=(168, 85, 247))

    draw.text((ax + 16, ay + 90), "⚠️ Tavsiya: Hech qachon bank kartangiz ma'lumotlari yoki SMS tasdiqlash kodini kiritmang!\nBank xodimlari hech qachon 5-xonali SMS kodni so'ramaydi.", font=f_alert_body, fill=(203, 213, 225))
    
    # Whitelist & Dismiss buttons
    draw.rounded_rectangle([ax + 16, ay + 124, ax + 140, ay + 148], radius=4, fill=(30, 41, 59), outline=(51, 65, 85))
    draw.text((ax + 26, ay + 128), "Xavfni tushundim", font=get_font(11, bold=False), fill=(148, 163, 184))
    draw.rounded_rectangle([ax + 150, ay + 124, ax + 280, ay + 148], radius=4, fill=(30, 41, 59), outline=(51, 65, 85))
    draw.text((ax + 160, ay + 128), "Oq ro'yxatga qo'shish", font=get_font(11, bold=False), fill=(148, 163, 184))

    # Right side explanation
    rx = fx + 740
    ry = fy + 80
    draw.text((rx, ry), "Enterprise Threat Intelligence", font=get_font(20, bold=True), fill=(248, 250, 252))
    explanations = [
        "• 2,715 Threat Patterns (10 Categories)",
        "• Cross-script Cyrillic & Latin Homoglyph unmasking",
        "• Uzbek agglutinative stemmer (-ingiz, -dan, -gacha)",
        "• MurmurHash3 + FNV-1a Bloom Filter URL lookup",
        "• Zero style bleed via element.attachShadow()",
        "• 100% on-device volatile RAM evaluation"
    ]
    ey = ry + 40
    for exp in explanations:
        draw.text((rx, ey), exp, font=f_body, fill=(148, 163, 184))
        ey += 32

    # Save Screenshot 2 (24-bit PNG, no alpha)
    img_rgb = img.convert('RGB')
    img_rgb.save('store-assets/screenshot2_realtime_alert.png', format='PNG')
    print("Created store-assets/screenshot2_realtime_alert.png (1280x800)")

# -------------------------------------------------------------
# PROMOTIONAL TILE: Small Tile (440x280)
# -------------------------------------------------------------
def make_small_tile():
    W, H = 440, 280
    img = create_gradient_bg(W, H, (10, 15, 29), (15, 23, 42))
    draw = ImageDraw.Draw(img)

    if os.path.exists('icon128.png'):
        icon = Image.open('icon128.png').convert('RGBA')
        icon_resized = icon.resize((64, 64), Image.Resampling.LANCZOS)
        img.paste(icon_resized, (30, 30), icon_resized)

    f_title = get_font(22, bold=True)
    f_sub = get_font(13, bold=False)
    f_tag = get_font(11, bold=True)

    draw.text((105, 36), "Himoya AI", font=f_title, fill=(248, 250, 252))
    draw.text((105, 66), "Scam & Phishing Detector", font=f_sub, fill=(148, 163, 184))

    # Tag pills
    draw.rounded_rectangle([30, 120, 200, 146], radius=4, fill=(30, 41, 59), outline=(51, 65, 85))
    draw.text((42, 126), "🛡️ CARD DRAIN DEFENSE", font=f_tag, fill=(56, 189, 248))

    draw.rounded_rectangle([210, 120, 380, 146], radius=4, fill=(30, 41, 59), outline=(51, 65, 85))
    draw.text((222, 126), "🔒 100% ON-DEVICE PRIVACY", font=f_tag, fill=(52, 211, 153))

    draw.text((30, 175), "Autonomous client-side protection for\nTelegram Web, Facebook & Instagram.", font=f_sub, fill=(203, 213, 225))
    draw.text((30, 235), "Open Source • MIT Licensed • 0 Data Collected", font=get_font(11, bold=False), fill=(100, 116, 139))

    img_rgb = img.convert('RGB')
    img_rgb.save('store-assets/small_promo_tile.png', format='PNG')
    print("Created store-assets/small_promo_tile.png (440x280)")

make_screenshot1()
make_screenshot2()
make_small_tile()
