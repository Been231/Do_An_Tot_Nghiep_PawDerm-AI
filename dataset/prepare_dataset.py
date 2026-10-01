import os
import shutil
import random

def prepare_val_split():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_dir = os.path.join(base_dir, "Pet_Skin_Disease_Detection.v1i.yolov8")
    train_img_dir = os.path.join(dataset_dir, "train", "images")
    train_lbl_dir = os.path.join(dataset_dir, "train", "labels")
    
    val_img_dir = os.path.join(dataset_dir, "valid", "images")
    val_lbl_dir = os.path.join(dataset_dir, "valid", "labels")
    
    os.makedirs(val_img_dir, exist_ok=True)
    os.makedirs(val_lbl_dir, exist_ok=True)
    
    train_images = [f for f in os.listdir(train_img_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    existing_val = [f for f in os.listdir(val_img_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    
    print(f"Current train images: {len(train_images)}")
    print(f"Current valid images: {len(existing_val)}")
    
    if len(existing_val) == 0 and len(train_images) > 100:
        # Move ~10% (70 images) to valid
        random.seed(42)
        val_samples = random.sample(train_images, 70)
        
        for img_name in val_samples:
            base_name = os.path.splitext(img_name)[0]
            lbl_name = f"{base_name}.txt"
            
            src_img = os.path.join(train_img_dir, img_name)
            dst_img = os.path.join(val_img_dir, img_name)
            shutil.move(src_img, dst_img)
            
            src_lbl = os.path.join(train_lbl_dir, lbl_name)
            dst_lbl = os.path.join(val_lbl_dir, lbl_name)
            if os.path.exists(src_lbl):
                shutil.move(src_lbl, dst_lbl)
                
        print(f"Successfully moved 70 samples to valid folder.")
    
    # Update data.yaml with absolute or clean relative paths
    yaml_path = os.path.join(dataset_dir, "data.yaml")
    yaml_content = f"""path: {dataset_dir.replace('\\', '/')}
train: train/images
val: valid/images
test: test/images

nc: 4
names: ['Ghe_da', 'Khoe_manh', 'Nam_da', 'Ve_ran']
"""
    with open(yaml_path, "w", encoding="utf-8") as f:
        f.write(yaml_content)
        
    print(f"Updated data.yaml successfully at: {yaml_path}")
    print(f"Final counts:")
    print(f" - Train: {len(os.listdir(train_img_dir))} images")
    print(f" - Valid: {len(os.listdir(val_img_dir))} images")
    print(f" - Test: {len(os.listdir(os.path.join(dataset_dir, 'test', 'images')))} images")

if __name__ == "__main__":
    prepare_val_split()
