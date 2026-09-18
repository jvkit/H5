#!/usr/bin/env python3
"""批量裁掉手机截图顶部的系统状态栏（本批截图均为 1260x2800，状态栏高约 135px）。"""
from pathlib import Path
from PIL import Image

SRC = Path("/mnt/c/Users/30224/Desktop/pic")
DST_DIRS = [
    Path("/mnt/c/Users/30224/Desktop/pic-cropped"),
    Path("/home/jvkit/workspace/jj/work/pics"),
]
CROP_TOP = 135

MAPPING = {
    "微信图片_20260918145909_4845_38.jpg": "A1-shuizi-cover.jpg",   # 睡姿大比拼·首页
    "微信图片_20260918145909_4846_38.jpg": "A1-shuizi-demo.jpg",    # 睡姿大比拼·演示动画
    "微信图片_20260918145909_4847_38.jpg": "B2-gugong-guide.jpg",   # 全景故宫·引导页
    "微信图片_20260918145909_4848_38.jpg": "B2-gugong-map.jpg",     # 全景故宫·主界面
    "微信图片_20260918145909_4849_38.jpg": "B2-gugong-pano.jpg",    # 全景故宫·午门全景
    "微信图片_20260918145909_4850_38.jpg": "C1-mi10-cover.jpg",     # 小米10青春版·开箱首页
    "微信图片_20260918145909_4851_38.jpg": "C1-mi10-360.jpg",       # 小米10青春版·360°外观
    "微信图片_20260918145909_4852_38.jpg": "D3-qqmusic-anim.jpg",   # QQ音乐年度报告·开屏动画
    "微信图片_20260918145909_4853_38.jpg": "D3-qqmusic-cover.jpg",  # QQ音乐年度报告·封面
}

for d in DST_DIRS:
    d.mkdir(parents=True, exist_ok=True)

for src_name, out_name in MAPPING.items():
    img = Image.open(SRC / src_name)
    w, h = img.size
    cropped = img.crop((0, CROP_TOP, w, h))
    for d in DST_DIRS:
        cropped.save(d / out_name, quality=95)
    print(f"{src_name} ({w}x{h}) -> {out_name} ({w}x{h - CROP_TOP})")
