import os
import json
import shutil
from bs4 import BeautifulSoup
print("running Update script")
# Base directory for everything to be isolated inside HomepageTEST
base_dir = 'MysteriesOfImmortalPuppetMaster.github.io'

# Paths
chapters_json_path = os.path.join( 'chapters.json')
chapters_folder = os.path.join( 'chapters')
read_folder = os.path.join( 'read')
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

# Just copy the template files into /read (once, not for each chapter)
for item in os.listdir(template_folder_path):
    src_path = os.path.join(template_folder_path, item)
    dest_path = os.path.join(read_folder, item)

    # If it's a directory, copy the directory tree; otherwise, just copy the file
    if os.path.isdir(src_path):
        shutil.copytree(src_path, dest_path)
    else:
        shutil.copy(src_path, dest_path)

# Create subfolders and only place index.html inside each one
for chapter in chapters:
    filename = chapter['filename']  # e.g., '101.txt'
    folder_name = os.path.splitext(filename)[0]  # Create a folder named without the extension
    new_folder_path = os.path.join(read_folder, folder_name)
    os.makedirs(new_folder_path, exist_ok=True)  # Create the subfolder for each chapter

    # Copy template.html into the new folder as index.html
    dest_index_html_path = os.path.join(new_folder_path, 'index.html')
    shutil.copy(template_html_path, dest_index_html_path)

    # Read chapter text
    chapter_file_path = os.path.join(chapters_folder, filename)
    with open(chapter_file_path, 'r', encoding='utf-8') as f:
        chapter_text = f.readlines()  # Read all lines of the chapter into a list

    # Extract the first line as the headline and remove it from the content
    headline = chapter_text[0].strip()  # The first line becomes the headline
    chapter_content = ''.join(chapter_text[1:])  # Remaining lines are the content

    # Convert new lines in chapter content to <br> for HTML
    chapter_html = chapter_content.replace('\n', '<br>\n')

    # Read index.html and insert chapter headline and content
    with open(dest_index_html_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    # Insert chapter title (headline) into the headline div
    headline_div = soup.find('div', {'id': 'chapterHeadline'})
    if headline_div is not None:
        headline_div.clear()
        headline_div.append(BeautifulSoup(f'<h2>{headline}</h2>', 'html.parser'))

    # Insert chapter content into the chapter content div
    content_div = soup.find('div', {'id': 'chapterContent'})
    if content_div is not None:
        content_div.clear()
        content_div.append(BeautifulSoup(chapter_html, 'html.parser'))

    # Modify the <title> tag to include the chapter headline
    title_tag = soup.find('title')
    if title_tag is not None:
        base_title = "Mysteries Of Immortal Puppet Master - "
        title_tag.string = f'{base_title}{headline}'

    # Write the modified index.html back
    with open(dest_index_html_path, 'w', encoding='utf-8') as f:
        f.write(str(soup))

print("Subfolders created, and index.html generated inside each one.")
while True:
    ...
