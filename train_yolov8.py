"""
PawDerm AI - YOLOv8 Skin Disease Detection Training Script
Huấn luyện mô hình YOLOv8 trên tập dữ liệu bệnh ngoài da chó mèo (Pet_Skin_Disease_Detection)
4 Lớp: Ghe_da, Khoe_manh, Nam_da, Ve_ran
"""

import os
import sys
import shutil
import argparse

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

def main():
    parser = argparse.ArgumentParser(description="Huấn luyện mô hình YOLOv8 PawDerm AI")
    parser.add_argument("--epochs", type=int, default=50, help="Số epoch huấn luyện (mặc định: 50)")
    parser.add_argument("--batch", type=int, default=8, help="Batch size (mặc định: 8 cho GTX 1650 4GB)")
    parser.add_argument("--imgsz", type=int, default=640, help="Kích thước ảnh đầu vào (mặc định: 640)")
    parser.add_argument("--model", type=str, default="yolov8n.pt", help="Trọng số khởi tạo: yolov8n.pt, yolov8s.pt, yolov8m.pt")
    parser.add_argument("--device", type=str, default=None, help="Thiết bị: '0' (GPU) hoặc 'cpu' (tự động phát hiện nếu bỏ trống)")
    parser.add_argument("--resume", action="store_true", help="Tiếp tục huấn luyện từ checkpoint dở dang (last.pt)")
    parser.add_argument("--reset", action="store_true", help="Bắt đầu huấn luyện mới từ đầu (bỏ qua checkpoint cũ)")
    args = parser.parse_args()

    print("=" * 70)
    print("🐾 PAWDERM AI - QUY TRÌNH HUẤN LUYỆN YOLOV8 CHẨN ĐOÁN DA LIỄU THÚ CƯNG")
    print("=" * 70)

    # 1. Kiểm tra PyTorch & Ultralytics
    try:
        import torch
        from ultralytics import YOLO
    except ImportError as e:
        print(f"❌ Thiếu thư viện: {e}")
        print("Vui lòng cài đặt: pip install ultralytics torch torchvision")
        sys.exit(1)

    # 2. Kiểm tra phần cứng GPU
    if args.device is None:
        if torch.cuda.is_available():
            device = "0"
            gpu_name = torch.cuda.get_device_name(0)
            vram = torch.cuda.get_device_properties(0).total_memory / (1024**3)
            print(f"✅ Phát hiện GPU: {gpu_name} ({vram:.1f} GB VRAM)")
            print(f"🚀 Tự động kích hoạt tăng tốc phần cứng CUDA: device={device}")
        else:
            device = "cpu"
            print("⚠️ Không tìm thấy GPU CUDA tương thích. Chuyển sang chế độ CPU.")
    else:
        device = args.device

    # 3. Định vị tệp cấu hình dữ liệu data.yaml
    workspace_root = os.path.dirname(os.path.abspath(__file__))
    yaml_path = os.path.join(workspace_root, "dataset", "Pet_Skin_Disease_Detection.v1i.yolov8", "data.yaml")

    if not os.path.exists(yaml_path):
        print(f"❌ Không tìm thấy data.yaml tại: {yaml_path}")
        sys.exit(1)

    print(f"📂 Tệp cấu hình dữ liệu: {yaml_path}")
    print(f"⚙️ Tham số huấn luyện:")
    print(f"   - Model gốc: {args.model}")
    print(f"   - Epochs: {args.epochs}")
    print(f"   - Batch size: {args.batch}")
    print(f"   - Image size: {args.imgsz}")
    print(f"   - Device: {device}")
    print("-" * 70)

    # 4. Tải mô hình YOLOv8 và bắt đầu huấn luyện
    last_pt_path = os.path.join(workspace_root, "runs", "detect", "pawderm_yolov8", "weights", "last.pt")
    has_last_pt = os.path.exists(last_pt_path)

    # Tự động resume nếu có last.pt và người dùng không yêu cầu --reset
    should_resume = (args.resume or has_last_pt) and not args.reset

    if should_resume and has_last_pt:
        print("🔄 PHÁT HIỆN CHECKPOINT DỞ DANG:")
        print(f"   --> {last_pt_path}")
        print("🚀 Đang tự động TIẾP TỤC huấn luyện (Resume) từ epoch bị ngắt...")
        print("💡 (Mẹo: Truyền cờ '--reset' nếu bạn muốn bỏ qua checkpoint và học lại từ đầu)")
        print("-" * 70)
        model = YOLO(last_pt_path)
        results = model.train(resume=True)
    else:
        print("⏳ Đang nạp mô hình gốc và bắt đầu quá trình huấn luyện từ đầu...")
        model = YOLO(args.model)
        results = model.train(
            data=yaml_path,
            epochs=args.epochs,
            batch=args.batch,
            imgsz=args.imgsz,
            device=device,
            workers=2,
            project=os.path.join(workspace_root, "runs", "detect"),
            name="pawderm_yolov8",
            exist_ok=True,
            save=True,
            plots=True,
            verbose=True
        )

    print("-" * 70)
    print("🎉 QUÁ TRÌNH HUẤN LUYỆN ĐÃ HOÀN TẤT THÀNH CÔNG!")

    # 5. Lưu trọng số tốt nhất (best.pt) vào thư mục models/
    save_dir = getattr(model.trainer, "save_dir", os.path.join(workspace_root, "runs", "detect", "pawderm_yolov8"))
    best_pt_source = os.path.join(save_dir, "weights", "best.pt")
    target_models_dir = os.path.join(workspace_root, "models")
    os.makedirs(target_models_dir, exist_ok=True)
    target_best_pt = os.path.join(target_models_dir, "best.pt")

    if os.path.exists(best_pt_source):
        shutil.copy2(best_pt_source, target_best_pt)
        print(f"📦 Đã sao chép trọng số tốt nhất (best.pt) vào hệ thống:")
        print(f"   --> {target_best_pt}")
        print("✅ Backend PawDerm AI sẽ tự động sử dụng trọng số mới này để chẩn đoán!")
    else:
        print(f"⚠️ Không tìm thấy file trọng số tại: {best_pt_source}")

    # 6. Đánh giá mô hình trên tập Test
    print("-" * 70)
    print("📊 Bắt đầu đánh giá mô hình trên tập Test...")
    eval_model = YOLO(target_best_pt) if os.path.exists(target_best_pt) else model
    test_metrics = eval_model.val(data=yaml_path, split="test")
    print(f"🎯 Kết quả đánh giá trên tập Test:")
    print(f"   - mAP50: {test_metrics.box.map50:.4f}")
    print(f"   - mAP50-95: {test_metrics.box.map:.4f}")
    print("=" * 70)

if __name__ == "__main__":
    main()
