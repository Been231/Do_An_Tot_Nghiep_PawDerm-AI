"""Quét dataset tìm ảnh KHÔNG phải chó/mèo/da lông (cây, đồ vật, thực phẩm...).
Chạy: python scan_dataset.py            -> chỉ xuất báo cáo CSV (dry-run)
      python scan_dataset.py --apply    -> chuyển ảnh bị gắn cờ (và file nhãn .txt tương ứng) vào dataset_quarantine/
"""
import os, sys, csv, shutil, glob
import numpy as np, cv2
from PIL import Image
from ultralytics import YOLO

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(ROOT, 'backend'))
from app.services.ai_inference import FUR_LIKE_CLASSES, IMAGENET_ANIMAL_MAX_IDX, NON_PET_COCO_CLASSES, COCO_VI_MAP

DATASET = os.path.join(ROOT, 'dataset')
QUAR = os.path.join(ROOT, 'dataset_quarantine')
REPORT = os.path.join(ROOT, 'dataset_scan_report.csv')
EXT = ('.jpg', '.jpeg', '.png', '.bmp', '.webp')

cls = YOLO(os.path.join(ROOT, 'yolov8n-cls.pt'))
coco = YOLO(os.path.join(ROOT, 'yolov8n.pt'))

def check(path):
    try:
        img = Image.open(path).convert('RGB')
    except Exception:
        return 'corrupt', 'Ảnh hỏng không đọc được'
    cd = False; objs = []
    for b in coco.predict(img, conf=0.25, verbose=False)[0].boxes:
        n = coco.names[int(b.cls)]
        if n in ('cat', 'dog'): cd = True
        elif n in NON_PET_COCO_CLASSES: objs.append((n, float(b.conf)))
    r = cls.predict(img, verbose=False)[0]
    idx = int(r.probs.top1); conf = float(r.probs.top1conf); name = r.names[idx]
    animal_mass = float(r.probs.data[:IMAGENET_ANIMAL_MAX_IDX + 1].sum())
    cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    hsv = cv2.cvtColor(cv, cv2.COLOR_BGR2HSV)
    g = ((hsv[..., 0] >= 30) & (hsv[..., 0] <= 85) & (hsv[..., 1] >= 40) & (hsv[..., 2] >= 30)).mean()
    if cd:
        return None, ''
    if idx > IMAGENET_ANIMAL_MAX_IDX and conf >= 0.50 and name not in FUR_LIKE_CLASSES and animal_mass < 0.15:
        return 'not_animal', f'ImageNet: {name} {conf:.0%}'
    if g >= 0.35 and animal_mass < 0.15:
        return 'plant', f'Xanh thực vật {g:.0%}'
    if objs and max(o[1] for o in objs) >= 0.50 and animal_mass < 0.15:
        o = max(objs, key=lambda x: x[1])
        return 'object', f'COCO: {COCO_VI_MAP.get(o[0], o[0])} {o[1]:.0%}'
    return None, ''

apply = '--apply' in sys.argv
rescan = '--rescan' in sys.argv

flagged = []
if os.path.exists(REPORT) and not rescan:
    print(f'Sử dụng báo cáo sẵn có: {REPORT}')
    with open(REPORT, 'r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        next(reader, None)
        for row in reader:
            if row:
                flagged.append((os.path.join(ROOT, row[0]), row[1], row[2]))
    print(f'Đã nạp {len(flagged)} ảnh từ báo cáo.')
else:
    files = [p for p in glob.glob(os.path.join(DATASET, '**', '*'), recursive=True) if p.lower().endswith(EXT)]
    print('Tổng ảnh:', len(files), flush=True)
    for i, p in enumerate(files):
        kind, why = check(p)
        if kind:
            flagged.append((p, kind, why))
        if (i + 1) % 200 == 0:
            print(f'{i+1}/{len(files)} - gắn cờ {len(flagged)}', flush=True)

    with open(REPORT, 'w', newline='', encoding='utf-8-sig') as f:
        w = csv.writer(f); w.writerow(['file', 'loai', 'ly_do']); w.writerows([(os.path.relpath(p, ROOT), k, y) for p, k, y in flagged])
    print('Gắn cờ:', len(flagged), '->', REPORT)

if apply:
    moved_count = 0
    for p, k, y in flagged:
        if not os.path.exists(p):
            continue
        rel = os.path.relpath(p, DATASET)
        dst = os.path.join(QUAR, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.move(p, dst)
        moved_count += 1
        # file nhãn YOLO tương ứng nếu có: .../images/x.jpg -> .../labels/x.txt
        lbl = os.path.splitext(p.replace(os.sep + 'images' + os.sep, os.sep + 'labels' + os.sep))[0] + '.txt'
        if os.path.exists(lbl) and lbl != p:
            ld = os.path.join(QUAR, os.path.relpath(lbl, DATASET))
            os.makedirs(os.path.dirname(ld), exist_ok=True)
            shutil.move(lbl, ld)
    print(f'✅ Đã chuyển an toàn {moved_count} ảnh rác/vật thể ngoài vào: {QUAR}')

