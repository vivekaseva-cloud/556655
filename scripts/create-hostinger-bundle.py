#!/usr/bin/env python3
import os
import sys
import zipfile

def create_hostinger_dist_zip():
    dist_dir = os.path.abspath("dist")
    output_zip = os.path.abspath("hostinger-dist.zip")

    if not os.path.exists(dist_dir):
        print(f"Error: {dist_dir} not found. Please run 'npm run build' first.")
        sys.exit(1)

    htaccess_path = os.path.join(dist_dir, ".htaccess")
    if not os.path.exists(htaccess_path):
        print("Warning: .htaccess missing in dist. Copying from public/.htaccess...")
        public_htaccess = os.path.abspath("public/.htaccess")
        if os.path.exists(public_htaccess):
            with open(public_htaccess, 'r') as src, open(htaccess_path, 'w') as dst:
                dst.write(src.read())

    print(f"Creating Hostinger upload bundle: {output_zip} ...")
    file_count = 0
    with zipfile.ZipFile(output_zip, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(dist_dir):
            for file in files:
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, dist_dir)
                zf.write(file_path, arcname=rel_path)
                file_count += 1
                print(f"  + Added: {rel_path}")

    zip_size = os.path.getsize(output_zip) / (1024 * 1024)
    print(f"\nSUCCESS! Created {output_zip} ({zip_size:.2f} MB, {file_count} files).")
    print("This zip file is ready to be uploaded and extracted directly into Hostinger's public_html folder!")

if __name__ == "__main__":
    create_hostinger_dist_zip()
