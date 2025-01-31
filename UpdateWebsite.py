import os
import json
import re
import shutil
from bs4 import BeautifulSoup
import chardet
import json
from datetime import datetime
from datetime import timedelta
from bs4 import BeautifulSoup
from bs4 import BeautifulSoup
from datetime import datetime, timedelta


# ==========================================
# Start of JsonCreator.py code
# ==========================================

# Define the directory where your chapter files are located
chapters_dir = './chapters'
output_file = 'chapters.json'

def get_chapter_title(file_path):
    """Extract the first line (title) from a chapter file with detected encoding."""
    # # Read the file in binary mode to detect encoding
    # with open(file_path, 'rb') as file:
    #     raw_data = file.read()
    #     result = chardet.detect(raw_data)
    #     encoding = result['encoding']
    #     if encoding is None:
    #             encoding = 'utf-8'
    # # Decode using the detected encoding
    with open(file_path, 'r', encoding='utf-8') as file:
        title = file.readline().strip()
    return title

def natural_sort_key(filename):
    """Helper function for natural sorting, accounting for integers and decimal numbers."""
    # Split the filename into numeric and non-numeric parts
    return [float(text) if re.match(r'^\d+(\.\d+)?$', text) else text.lower() for text in re.split(r'(\d+\.\d+|\d+)', filename)]

def get_chapter_data(directory):
    """Get chapter titles and filenames from the directory."""
    chapter_list = []

    # Loop over all files in the chapters directory
    for filename in os.listdir(directory):
        if filename.endswith('.txt'):
            file_path = os.path.join(directory, filename)
            title = get_chapter_title(file_path)
            chapter_list.append({"title": title, "filename": filename})

    # Sort the chapter list using natural sorting (handling decimals)
    chapter_list.sort(key=lambda x: natural_sort_key(x['filename']))
    return chapter_list

def save_to_json(data, output_path):
    """Save chapter data to a JSON file."""
    with open(output_path, 'w', encoding='utf-8') as json_file:
        json.dump(data, json_file, indent=4)

# ==========================================
# End of JsonCreator.py code
# ==========================================

# ==========================================
# Start of UpdateAllTheSubfolders.py code
# ==========================================

# Base directory for everything to be isolated inside HomepageTEST
base_dir = 'MysteriesOfImmortalPuppetMaster.github.io'

# Paths
chapters_json_path = os.path.join('chapters.json')
chapters_folder = os.path.join('chapters')
read_folder = os.path.join('read')
template_html_path = os.path.join(read_folder, 'template.html')  # Adjusted from .template.html
template_folder_path = os.path.join(read_folder, 'template')     # Adjusted from .template



#" new chapters function thing "


def Super_NewADDEDCHapterFunction():
    # Load chapters.json
    def load_chapters(json_file):
        with open(json_file, 'r', encoding='utf-8') as file:
            return json.load(file)

    # Generate new HTML content for chapters panel
    def generate_chapters_html(chapters, newest_existing_title):
        chapter_html = ""
        for chapter in reversed(chapters):  # Assuming latest chapter is last
            if chapter['title'] == newest_existing_title:
                break  # Stop adding once we reach the newest existing chapter
            chapter_id = chapter['filename'].replace('.txt', '')
            utc_time = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
            chapter_html += f'''<div class="chaptersPanel-item" data-url="/read/{chapter_id}/" data-utc="{utc_time}">
                <b>{chapter['title']}</b>
                <div class="local-timestamp"></div>
            </div>\n'''
        return chapter_html

    # Get the newest existing chapter title from the HTML file
    def get_newest_existing_title(html_file):
        with open(html_file, 'r', encoding='utf-8') as file:
            soup = BeautifulSoup(file, 'html.parser')
        chapters_panel = soup.find('div', {'id': 'chaptersPanelContent'})
        if not chapters_panel:
            return None
        newest_item = chapters_panel.find('div', {'class': 'chaptersPanel-item'})
        if newest_item:
            return newest_item.find('b').text.strip()  # Extract the chapter title
        return None

    # Add new chapters to the HTML file
    def update_html(html_file, new_chapters_html):
        with open(html_file, 'r', encoding='utf-8') as file:
            soup = BeautifulSoup(file, 'html.parser')

        chapters_panel = soup.find('div', {'id': 'chaptersPanelContent'})
        if chapters_panel:
            # Append new content at the top
            chapters_panel.insert(0, BeautifulSoup(new_chapters_html, 'html.parser'))

        with open(html_file, 'w', encoding='utf-8') as file:
            file.write(str(soup))


    # Function to process the HTML
    def limit_chapters_entries_unique_823(file_path):
        with open(file_path, 'r', encoding='utf-8') as file:
            soup = BeautifulSoup(file, 'html.parser')

        chapters_panel = soup.find('div', {'class': 'chaptersPanel-content'})
        if not chapters_panel:
            print("Chapters panel not found.")
            return

        entries = chapters_panel.find_all('div', {'class': 'chaptersPanel-item'})

        # Check if the number of entries is less than or equal to 5
        if len(entries) <= 5:
            print("Number of entries is 5 or fewer. No action required.")
            return

        # Parse UTC dates and limit entries
        while len(entries) > 5:
            print("limiting entries")
            latest_entry_date = datetime.strptime(entries[0]['data-utc'], '%Y-%m-%dT%H:%M:%SZ')
            last_entry_date = datetime.strptime(entries[-1]['data-utc'], '%Y-%m-%dT%H:%M:%SZ')

            # Check if the last entry is within 24 hours of the latest entry
            if latest_entry_date - last_entry_date > timedelta(hours=24):
                entries[-1].decompose()  # Remove the last entry
                entries = chapters_panel.find_all('div', {'class': 'chaptersPanel-item'})
            else:
                break

        # Save the modified HTML back to the file
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(str(soup))

        print("Entries have been successfully limited.")



    json_file = 'chapters.json'
    html_file = 'index.html'

    # Load data
    chapters = load_chapters(json_file)
 
    # Get the newest existing chapter title from the HTML
    newest_existing_title = get_newest_existing_title(html_file)

    # Generate new HTML content
    new_chapters_html = generate_chapters_html(chapters, newest_existing_title)

    # Update the HTML file
    update_html(html_file, new_chapters_html)

    
    # Call the function with the path to the index.html file
    limit_chapters_entries_unique_823('index.html')

def main():
    # Run JsonCreator.py code
    # Get the chapter data and save it to a JSON file
    chapters = get_chapter_data(chapters_dir)
    save_to_json(chapters, output_file)
    print(f'Chapter data saved to {output_file}')

    print("Running Update script")

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

        # Detect encoding
        # with open(chapter_file_path, 'rb') as f:
        #     raw_data = f.read()
        #     result = chardet.detect(raw_data)
        #     encoding = result['encoding']
        #     if encoding is None:
        #         encoding = 'utf-8'  # Default to UTF-8 if encoding cannot be detected

        # Read the chapter text using the detected encoding
        with open(chapter_file_path, 'r', encoding='utf-8', errors='replace') as f:
            chapter_text = f.readlines()




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
    Super_NewADDEDCHapterFunction()
    print("Python Script completed. Console can be closed now")

if __name__ == '__main__':
    main()


# ==========================================
# End of UpdateAllTheSubfolders.py code
# ==========================================
