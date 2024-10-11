import os
import json
import shutil
from bs4 import BeautifulSoup

# Base directory for everything to be isolated inside HomepageTEST
base_dir = 'HomepageTEST'

# Paths
chapters_json_path = os.path.join(base_dir, 'chapters.json')
chapters_folder = os.path.join(base_dir, 'chapters')
read_folder = os.path.join(base_dir, 'read')
template_html_path = os.path.join(read_folder, 'template.html')  # Adjusted from .template.html
template_folder_path = os.path.join(read_folder, 'template')  # Adjusted from .template

# Load chapters from chapters.json
with open(chapters_json_path, 'r', encoding='utf-8') as f:
    chapters = json.load(f)

# Delete any existing chapter folders inside /read (but keep /template and template.html)
for item in os.listdir(read_folder):
    item_path = os.path.join(read_folder, item)
    # Skip the template folder and template.html
    if item != 'template' and item != 'template.html':
        if os.path.isdir(item_path):
            shutil.rmtree(item_path)  # Delete directory and all contents
        elif os.path.isfile(item_path):
            os.remove(item_path)  # Delete any files that are not template.html

# Recreate chapter folders and files
for chapter in chapters:
    filename = chapter['filename']  # e.g., '101.txt'
    # Remove file extension for folder name
    folder_name = os.path.splitext(filename)[0]
    new_folder_path = os.path.join(read_folder, folder_name)
    os.makedirs(new_folder_path, exist_ok=True)

    # Copy template files directly into the new folder (not inside a subfolder)
    for item in os.listdir(template_folder_path):
        src_path = os.path.join(template_folder_path, item)
        dest_path = os.path.join(new_folder_path, item)
        
        # If it's a directory, copy the directory tree; otherwise, just copy the file
        if os.path.isdir(src_path):
            shutil.copytree(src_path, dest_path)
        else:
            shutil.copy(src_path, dest_path)

    # Copy template.html into the new folder as index.html
    dest_index_html_path = os.path.join(new_folder_path, 'index.html')
    shutil.copy(template_html_path, dest_index_html_path)

    # Read chapter text
    chapter_file_path = os.path.join(chapters_folder, filename)
    with open(chapter_file_path, 'r', encoding='utf-8') as f:
        chapter_text = f.read()

    # Read index.html and insert chapter text into <div id="chapterContent">
    with open(dest_index_html_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    div = soup.find('div', {'id': 'chapterContent'})
    if div is not None:
        div.clear()
        div.append(BeautifulSoup(chapter_text, 'html.parser'))

    # Write the modified index.html back
    with open(dest_index_html_path, 'w', encoding='utf-8') as f:
        f.write(str(soup))

print("Folders and files have been recreated successfully inside HomepageTEST.")
