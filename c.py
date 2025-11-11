# import os
# import shutil
# import platform
# import time

# # Base path
# if platform.system() == "Windows":
#     base_path = "D:\\"
# else:
#     base_path = os.path.expanduser("~")

# folder_path = os.path.join(base_path, "Test")

# while True:
#     if os.path.exists(folder_path):
#         for item in os.listdir(folder_path):
#             item_path = os.path.join(folder_path, item)
#             try:
#                 if os.path.isfile(item_path):
#                     os.remove(item_path)
#                 else:
#                     shutil.rmtree(item_path)
#             except:
#                 pass
#     time.sleep(5)  # wait 5 seconds before checking again




























#!/usr/bin/env python3
import os, shutil, time, logging, argparse
from datetime import datetime

class SmartCleaner:
    def __init__(self, folder, dry_run=False):
        self.folder = os.path.abspath(os.path.expanduser(folder))
        self.dry_run = dry_run
        self.quarantine = os.path.expanduser(
            f"~/quarantine_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
        os.makedirs(self.quarantine, exist_ok=True)
        logging.basicConfig(
            filename=os.path.expanduser("~/smart_cleaner.log"),
            level=logging.INFO,
            format="%(asctime)s %(levelname)s: %(message)s"
        )

    def scan_files(self):
        for root, _, files in os.walk(self.folder):
            for f in files:
                yield os.path.join(root, f)

    def move_to_quarantine(self, path):
        dest = os.path.join(self.quarantine, os.path.basename(path))
        if self.dry_run:
            print(f"[DRY-RUN] Would move {path} -> {dest}")
            return
        shutil.move(path, dest)
        print(f"Moved: {path}")
        logging.info(f"MOVED {path} -> {dest}")

    def run(self):
        if not os.path.isdir(self.folder):
            print("❌ Invalid folder path.")
            return

        files = list(self.scan_files())
        if not files:
            print("✅ Folder is already clean.")
            return

        print(f"🧹 Found {len(files)} files to clean in {self.folder}")
        for f in files:
            try:
                self.move_to_quarantine(f)
            except Exception as e:
                logging.error(f"Error moving {f}: {e}")
                print(f"⚠️  Error moving {f}: {e}")

        print(f"✅ All files moved to {self.quarantine}")

def main():
    parser = argparse.ArgumentParser(description="Smart Cleaner - safely moves files to quarantine.")
    parser.add_argument("--folder", required=True, help="Target folder to clean.")
    parser.add_argument("--dry-run", action="store_true", help="Preview actions without moving files.")
    parser.add_argument("--interval", type=int, help="Optional repeat interval in seconds.")
    args = parser.parse_args()

    cleaner = SmartCleaner(args.folder, args.dry_run)
    if args.interval:
        print(f"⏳ Running every {args.interval} seconds... Press Ctrl+C to stop.")
        try:
            while True:
                cleaner.run()
                time.sleep(args.interval)
        except KeyboardInterrupt:
            print("\n🛑 Stopped by user.")
    else:
        cleaner.run()

if __name__ == "__main__":
    main()