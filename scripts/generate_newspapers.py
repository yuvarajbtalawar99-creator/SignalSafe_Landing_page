import os
from PIL import Image, ImageDraw, ImageFont
import numpy as np

base_im = Image.open('public/newspaper-3d.png')
w, h = base_im.size

# Rotate to horizontal: -6.0 degrees
horiz = base_im.rotate(-6.0, resample=Image.BICUBIC)

# Fonts
font_headline = ImageFont.truetype('C:/Windows/Fonts/georgiab.ttf', 17)
font_subhead = ImageFont.truetype('C:/Windows/Fonts/georgiai.ttf', 9)
font_body = ImageFont.truetype('C:/Windows/Fonts/georgia.ttf', 8)
font_badge = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 7)
font_tag = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 7)
font_meta = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 7)
font_mono = ImageFont.truetype('C:/Windows/Fonts/lucon.ttf', 7)
font_box_title = ImageFont.truetype('C:/Windows/Fonts/lucon.ttf', 7)

# News stories definitions
STORIES = [
    {
        'id': 1,
        'filename': 'public/newspaper-3d-1.png',
        # Keep story 1 matching the user uploaded image
    },
    {
        'id': 2,
        'filename': 'public/newspaper-3d-2.png',
        'vol': 'VOL. XLVII • NO. 209',
        'date': 'OCT 22, 2026',
        'source': 'EDU-CERT ADVISORY • HIGHER EDUCATION EDITION',
        'badge_label': 'HIGH RISK',
        'badge_color': (240, 120, 20),
        'tag_label': 'AI PHISHING',
        'headline': 'AI-Powered Phishing Kits Impersonate\nCampus Financial Aid Portals',
        'subhead': 'Students at 120+ colleges targeted by deepfake email campaigns cloning official financial aid systems to harvest login credentials.',
        'detail': 'Attackers leverage GPT-generated lures tailored per institution, evading traditional spam filters. Adversaries harvest multi-tenant SSO credentials and direct-deposit banking routing info.',
        'source_note': 'SOURCE: EDU-CERT EMERGENCY BULLETIN',
        'box_title': '[ CLONED SSO FLOW ]',
        'box_type': 'phishing',
        'box_caption': 'Adversary cloned credential funnel - Oct 22, 2026',
    },
    {
        'id': 3,
        'filename': 'public/newspaper-3d-3.png',
        'vol': 'VOL. XLVII • NO. 205',
        'date': 'OCT 15, 2026',
        'source': 'NATIONAL INFOSEC AUDIT • HIGHER EDUCATION EDITION',
        'badge_label': 'CRITICAL',
        'badge_color': (220, 40, 40),
        'tag_label': 'DATA BREACH',
        'headline': 'Student Data of 3.8 Million Exposed\nin Learning Management System Zero-Day',
        'subhead': 'Zero-day vulnerability in widely-used LMS platform leaks student grades, personal IDs, and confidential health records at 84 institutions.',
        'detail': 'Unauthenticated API endpoint permitted SQL injection, exfiltrating encrypted student rosters and medical accommodations before emergency patch 72h later.',
        'source_note': 'SOURCE: NATIONAL CYBERSECURITY CENTER',
        'box_title': '[ DATABASE EXFIL ]',
        'box_type': 'database',
        'box_caption': 'LMS remote code execution vector - Oct 15, 2026',
    },
    {
        'id': 4,
        'filename': 'public/newspaper-3d-4.png',
        'vol': 'VOL. XLVII • NO. 202',
        'date': 'OCT 10, 2026',
        'source': 'CAMPUS THREAT WIRE • HIGHER EDUCATION EDITION',
        'badge_label': 'HIGH SURGE',
        'badge_color': (240, 120, 20),
        'tag_label': 'QR FRAUD / QUISHING',
        'headline': 'Malicious QR Code Scams Surge 340%\nAcross Campuses Nationwide',
        'subhead': 'Counterfeit QR stickers pasted over cafeteria menus, dorm posters, and library desks hijack student Wi-Fi authentication sessions.',
        'detail': 'Physical stickers redirect mobile browsers to fraudulent captive portal logins. Attackers intercept OAuth refresh tokens without triggering 2FA prompts.',
        'source_note': 'SOURCE: HIGHER ED INFOSEC FORUM',
        'box_title': '[ QUISHING VECTOR ]',
        'box_type': 'qr',
        'box_caption': 'Physical QR redirection attack pattern - Oct 10, 2026',
    },
]

# Story 1 is identical to original
base_im.save('public/newspaper-3d-1.png')

# Newsprint background fill color sampled from paper
paper_color = (210, 202, 199, 255)

for story in STORIES[1:]:
    # Make working copy of horizontal newspaper
    work = horiz.copy()
    draw = ImageDraw.Draw(work)

    # 1. Clear top meta bar (Volume & Date)
    draw.rectangle([80, 58, 220, 72], fill=paper_color)
    draw.rectangle([390, 58, 500, 72], fill=paper_color)
    # Clear sub-header line
    draw.rectangle([130, 83, 440, 96], fill=paper_color)

    # 2. Clear headline, subhead, body, and threat box
    draw.rectangle([80, 108, 510, 375], fill=paper_color)

    # Re-draw top meta
    draw.text((86, 60), story['vol'], font=font_meta, fill=(60, 60, 60))
    draw.text((435, 60), story['date'], font=font_meta, fill=(60, 60, 60))
    draw.text((142, 85), story['source'], font=font_meta, fill=(90, 90, 90))

    # Re-draw badge
    badge_x, badge_y = 88, 114
    badge_w, badge_h = 58, 14
    draw.rounded_rectangle([badge_x, badge_y, badge_x + badge_w, badge_y + badge_h], radius=2, fill=story['badge_color'])
    draw.text((badge_x + 6, badge_y + 3), '▲ ' + story['badge_label'], font=font_badge, fill=(255, 255, 255))

    # Badge tag text
    draw.text((badge_x + badge_w + 10, badge_y + 3), story['tag_label'], font=font_tag, fill=(80, 80, 80))

    # Headline
    draw.text((88, 134), story['headline'], font=font_headline, fill=(15, 15, 15), spacing=2)

    # Subhead
    draw.text((88, 190), story['subhead'], font=font_subhead, fill=(65, 65, 65))

    # Thin decorative divider line under subhead
    draw.line([88, 236, 310, 236], fill=(185, 178, 175), width=1)
    draw.line([88, 238, 140, 238], fill=(0, 180, 120), width=2) # Green accent line

    # Detail Body Text (wrapped left column)
    words = story['detail'].split()
    lines = []
    cur_line = []
    for w_word in words:
        cur_line.append(w_word)
        if len(' '.join(cur_line)) > 34:
            lines.append(' '.join(cur_line[:-1]))
            cur_line = [w_word]
    if cur_line:
        lines.append(' '.join(cur_line))

    y_body = 246
    for l in lines:
        draw.text((88, y_body), l, font=font_body, fill=(45, 45, 45))
        y_body += 11

    # Source label
    draw.text((88, y_body + 8), '▲ ' + story['source_note'], font=font_meta, fill=(110, 105, 100))

    # Threat Box (Right column dark screen)
    box_x1, box_y1, box_x2, box_y2 = 325, 236, 498, 336
    draw.rectangle([box_x1, box_y1, box_x2, box_y2], fill=(18, 28, 42, 255), outline=(35, 55, 80))
    
    # Grid lines inside threat box
    for gx in range(box_x1 + 15, box_x2, 20):
        draw.line([gx, box_y1 + 4, gx, box_y2 - 4], fill=(24, 38, 56), width=1)
    for gy in range(box_y1 + 12, box_y2, 14):
        draw.line([box_x1 + 4, gy, box_x2 - 4, gy], fill=(24, 38, 56), width=1)

    # Box title
    draw.text((box_x1 + 35, box_y1 + 8), story['box_title'], font=font_box_title, fill=(0, 229, 255))

    # Custom graphics per threat type inside the box
    if story['box_type'] == 'phishing':
        # Phishing hook & cloned portal nodes
        draw.arc([box_x1 + 40, box_y1 + 25, box_x1 + 75, box_y1 + 60], start=0, end=180, fill=(255, 80, 80), width=2)
        draw.line([box_x1 + 57, box_y1 + 20, box_x1 + 57, box_y1 + 45], fill=(255, 80, 80), width=2)
        # Credentials stolen node
        draw.rectangle([box_x1 + 90, box_y1 + 30, box_x1 + 155, box_y1 + 70], outline=(0, 255, 136), width=1)
        draw.text((box_x1 + 95, box_y1 + 35), 'SSO CLONE', font=font_mono, fill=(0, 255, 136))
        draw.text((box_x1 + 95, box_y1 + 48), 'USER: STOLEN', font=font_mono, fill=(255, 100, 100))
        draw.text((box_x1 + 95, box_y1 + 58), 'MFA: BYPASSED', font=font_mono, fill=(255, 80, 80))

    elif story['box_type'] == 'database':
        # SQL Injection & DB Table dump
        draw.rectangle([box_x1 + 30, box_y1 + 28, box_x1 + 80, box_y1 + 75], outline=(0, 229, 255), width=1)
        draw.text((box_x1 + 35, box_y1 + 33), 'LMS_DB', font=font_mono, fill=(0, 229, 255))
        draw.text((box_x1 + 35, box_y1 + 45), 'USERS', font=font_mono, fill=(180, 200, 220))
        draw.text((box_x1 + 35, box_y1 + 55), 'GRADES', font=font_mono, fill=(180, 200, 220))
        draw.text((box_x1 + 35, box_y1 + 65), 'FERPA', font=font_mono, fill=(255, 80, 80))
        # Exfiltration arrow
        draw.line([box_x1 + 85, box_y1 + 50, box_x1 + 115, box_y1 + 50], fill=(255, 60, 60), width=2)
        draw.polygon([(box_x1 + 115, box_y1 + 46), (box_x1 + 122, box_y1 + 50), (box_x1 + 115, box_y1 + 54)], fill=(255, 60, 60))
        draw.text((box_x1 + 125, box_y1 + 45), '3.8M EXFIL', font=font_mono, fill=(255, 60, 60))

    elif story['box_type'] == 'qr':
        # QR Code glyph & rogue redirect
        # Draw mini stylized QR matrix
        for rx in range(4):
            for ry in range(4):
                if (rx + ry) % 2 == 0 or rx == 0 or ry == 0:
                    draw.rectangle([box_x1 + 35 + rx * 7, box_y1 + 32 + ry * 7, box_x1 + 39 + rx * 7, box_y1 + 36 + ry * 7], fill=(255, 255, 255))
        # Red warning over QR
        draw.text((box_x1 + 75, box_y1 + 34), 'QUISHING', font=font_mono, fill=(255, 120, 20))
        draw.text((box_x1 + 75, box_y1 + 46), 'ROGUE PORTAL', font=font_mono, fill=(255, 80, 80))
        draw.text((box_x1 + 75, box_y1 + 58), 'TOKEN SNIFFED', font=font_mono, fill=(255, 80, 80))

    # Box caption
    draw.text((box_x1, box_y2 + 5), story['box_caption'], font=font_meta, fill=(110, 105, 100))

    # Rotate back to 3D angle: +6.0 degrees
    final_3d = work.rotate(6.0, resample=Image.BICUBIC)

    # Composite cleanly with original folded edges alpha
    # Use alpha mask from base image to preserve every single paper edge fold and shadow
    final_rgba = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    final_rgba.paste(final_3d, (0, 0), mask=base_im.split()[3])
    final_rgba.save(story['filename'])
    print(f'Generated {story["filename"]} successfully!')

print('All 4 realistic 3D newspapers generated!')

