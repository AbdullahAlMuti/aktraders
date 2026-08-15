import os
import fitz  # PyMuPDF
from PIL import Image
import io

pdf_paths = [
    r"C:\Users\MUTI\.gemini\antigravity\brain\68b2eea7-993e-4944-b5c4-e69c9f53ee84\.user_uploaded\media_1786822305427.pdf",
    r"C:\Users\MUTI\.gemini\antigravity\brain\68b2eea7-993e-4944-b5c4-e69c9f53ee84\.user_uploaded\media_1786822305497.pdf",
    r"C:\Users\MUTI\.gemini\antigravity\brain\68b2eea7-993e-4944-b5c4-e69c9f53ee84\.user_uploaded\media_1786822305523.pdf",
    r"C:\Users\MUTI\.gemini\antigravity\brain\68b2eea7-993e-4944-b5c4-e69c9f53ee84\.user_uploaded\media_1786822305545.pdf",
    r"C:\Users\MUTI\.gemini\antigravity\brain\68b2eea7-993e-4944-b5c4-e69c9f53ee84\.user_uploaded\media_1786822305560.pdf",
]

candidate_map = [
    {"name": "Md. Redoy Hossain", "slug": "photo_redoy_hossain.jpg", "pdf_slug": "cv_redoy_hossain.pdf", "emp_id": "EMP-085596"},
    {"name": "Bashiron Begum", "slug": "photo_bashiron_begum.jpg", "pdf_slug": "cv_bashiron_begum.pdf", "emp_id": "EMP-935752"},
    {"name": "Mst. Moriam Begum", "slug": "photo_moriam_begum.jpg", "pdf_slug": "cv_moriam_begum.pdf", "emp_id": "EMP-229387"},
    {"name": "Moshin", "slug": "photo_moshin.jpg", "pdf_slug": "cv_moshin.pdf", "emp_id": "EMP-288965"},
    {"name": "Md. Rongu Mia", "slug": "photo_ranju_mia.jpg", "pdf_slug": "cv_ranju_mia.pdf", "emp_id": "EMP-647253"},
]

out_photos_dir = os.path.abspath("public/uploads/photos")
out_cvs_dir = os.path.abspath("public/uploads/cvs")
os.makedirs(out_photos_dir, exist_ok=True)
os.makedirs(out_cvs_dir, exist_ok=True)

for i, pdf_path in enumerate(pdf_paths):
    info = candidate_map[i]
    print(f"\nProcessing {info['name']} from {pdf_path}...")

    # Copy PDF to cvs directory
    doc = fitz.open(pdf_path)
    doc.save(os.path.join(out_cvs_dir, info['pdf_slug']))
    
    # Render page 0 to high-res image
    page = doc[0]
    pix = page.get_pixmap(dpi=300)
    img_data = pix.tobytes("png")
    page_img = Image.open(io.BytesIO(img_data))
    w, h = page_img.size
    print(f"  Page 1 size: {w}x{h}")

    # The passport photo on biodata page 1 is located in top-right area
    # Typical bounding box: x: 0.69 to 0.92, y: 0.05 to 0.26
    left = int(w * 0.68)
    top = int(h * 0.045)
    right = int(w * 0.93)
    bottom = int(h * 0.265)

    cropped_photo = page_img.crop((left, top, right, bottom))
    photo_path = os.path.join(out_photos_dir, info['slug'])
    cropped_photo.convert("RGB").save(photo_path, "JPEG", quality=95)
    print(f"  [OK] Saved cropped photo to {photo_path} (size: {cropped_photo.size})")

    # Also save with employeeId name convention
    emp_avatar_path = os.path.join(out_photos_dir, f"{info['emp_id'].lower()}_avatar.jpg")
    cropped_photo.convert("RGB").save(emp_avatar_path, "JPEG", quality=95)
    print(f"  [OK] Saved avatar copy to {emp_avatar_path}")

print("\nALL 5 PHOTOS EXTRACTED & SAVED SUCCESSFULLY!")
