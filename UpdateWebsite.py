import os
import json
import re
import shutil
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
import asyncio
import aiohttp



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




base_dir = 'MysteriesOfImmortalPuppetMaster.github.io'


chapters_json_path = os.path.join('chapters.json')
chapters_folder = os.path.join('chapters')
read_folder = os.path.join('read')
template_html_path = os.path.join(read_folder, 'template.html')  
template_folder_path = os.path.join(read_folder, 'template')     



#" new chapters function thing "


def Super_NewADDEDCHapterFunction():
 
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
    super_audio_function_old()
    #asyncio.run (super_audio_function())
    print("Python Script completed. Console can be closed now")


def super_audio_function_old():
    INJECTED_HTML = """
    <p id="folderInfo" class="timer"></p>
    <div class="bigbox">
        <div class="audio-controls">
            <button id="playPauseBtn">▶</button>
        </div>
        <div class="smlboxplusTime">
            <div class="smlbox">
                <canvas id="visualizer"></canvas>
                <div id="progressBarContainer">
                    <div id="progressBar"></div>
                </div>
            </div>
            <div class="timer-container">
                <span id="currentTime" class="timer">0:00</span>
                <span id="totalTime" class="timer">3:45</span>
            </div>
        </div>
    </div>
    <div class="volume-container">
        <span class="audio-icon">🔊</span>
        <input type="range" id="volumeControl" min="0" max="1" step="0.01" value="0.5">
    </div>
    <audio id="currentAudio" style="display:none;" preload="auto" crossOrigin="anonymous"></audio>
    <audio id="nextAudio" style="display:none;" preload="auto" crossOrigin="anonymous"></audio>
    <script src="../audioDisplay.js"></script>
    <link rel="stylesheet" href="../audioDisplay.css">
    """

    BASE_AUDIO_URL = "https://mysteriesofimmortalpuppetmaster.github.io/audioStash/"
    READ_DIR = os.path.join(os.path.dirname(os.path.realpath(__file__)), "read")

    def check_audio_metadata(url):
        try:
            response = requests.head(url)
            return response.status_code == 200
        except requests.RequestException as e:
            print(f"[ERROR] Failed to request {url}: {e}")
            return False

    def process_subdirectory(folder_path, folder_name, exists):
        index_file = os.path.join(folder_path, "index.html")
        if not os.path.isfile(index_file):
            print(f"[INFO] No index.html found in {folder_path}, skipping.")
            return

        with open(index_file, "r", encoding="utf-8") as f:
            soup = BeautifulSoup(f, "html.parser")

        player_div = soup.find("div", class_="player-container")
        if not player_div:
            print(f"[INFO] No <div class='player-container'> found in {index_file}, skipping.")
            return

        # Set the audio source attribute regardless of whether metadata exists.
        audio_src = f"{BASE_AUDIO_URL}{folder_name}"
        player_div["audio-src"] = audio_src

        if exists:
            print(f"[INFO] Found audio_metadata.json for folder '{folder_name}'. Injecting HTML snippet.")
            player_div.clear()
            player_div.insert(0, BeautifulSoup(INJECTED_HTML, "html.parser"))
        else:
            print(f"[INFO] audio_metadata.json not found for folder '{folder_name}'. Leaving the div unchanged.")

        with open(index_file, "w", encoding="utf-8") as f:
            f.write(str(soup))
        print(f"[INFO] Updated {index_file}")

    def main2():
        if not os.path.isdir(READ_DIR):
            print(f"[ERROR] The folder {READ_DIR} does not exist.")
            return

        # Gather folder names and their corresponding audio_metadata URLs.
        folders = []
        for entry in os.listdir(READ_DIR):
            folder_path = os.path.join(READ_DIR, entry)
            if os.path.isdir(folder_path):
                folders.append((entry, folder_path))
            else:
                print(f"[DEBUG] {entry} is not a directory, skipping.")

        # Check for audio_metadata.json concurrently.
        results = {}
        with ThreadPoolExecutor(max_workers=10) as executor:
            future_to_folder = {
                executor.submit(check_audio_metadata, f"{BASE_AUDIO_URL}{folder_name}/audio_metadata.json"): (folder_name, folder_path)
                for folder_name, folder_path in folders
            }
            for future in as_completed(future_to_folder):
                folder_name, folder_path = future_to_folder[future]
                exists = future.result()
                results[folder_name] = (folder_path, exists)

        # Process each folder using the result from the HEAD request.
        for folder_name, (folder_path, exists) in results.items():
            print(f"[INFO] Processing folder: {folder_name}")
            process_subdirectory(folder_path, folder_name, exists)
    main2()

async def super_audio_function():
    INJECTED_HTML = """
    <p id="folderInfo" class="timer"></p>
    <div class="bigbox">
        <div class="audio-controls">
            <button id="playPauseBtn">▶</button>
        </div>
        <div class="smlboxplusTime">
            <div class="smlbox">
                <canvas id="visualizer"></canvas>
                <div id="progressBarContainer">
                    <div id="progressBar"></div>
                </div>
            </div>
            <div class="timer-container">
                <span id="currentTime" class="timer">0:00</span>
                <span id="totalTime" class="timer">3:45</span>
            </div>
        </div>
    </div>
    <div class="volume-container">
        <span class="audio-icon">🔊</span>
        <input type="range" id="volumeControl" min="0" max="1" step="0.01" value="0.5">
    </div>
    <audio id="currentAudio" style="display:none;" preload="auto" crossOrigin="anonymous"></audio>
    <audio id="nextAudio" style="display:none;" preload="auto" crossOrigin="anonymous"></audio>
    <script src="../audioDisplay.js"></script>
    <link rel="stylesheet" href="../audioDisplay.css">
    """

    BASE_AUDIO_URL = "https://mysteriesofimmortalpuppetmaster.github.io/audioStash/"
    READ_DIR = os.path.join(os.path.dirname(os.path.realpath(__file__)), "read")


    async def check_audio_metadata(session, url, semaphore):
        async with semaphore:
            try:
                async with session.head(url) as response:
                    return response.status == 200
            except Exception as e:
                print(f"[ERROR] Failed to request {url}: {e}")
                return False


    def process_subdirectory(folder_path, folder_name, exists):
        index_file = os.path.join(folder_path, "index.html")
        if not os.path.isfile(index_file):
            print(f"[INFO] No index.html found in {folder_path}, skipping.")
            return

        with open(index_file, "r", encoding="utf-8") as f:
            soup = BeautifulSoup(f, "html.parser")

        player_div = soup.find("div", class_="player-container")
        if not player_div:
            print(f"[INFO] No <div class='player-container'> found in {index_file}, skipping.")
            return

        audio_src = f"{BASE_AUDIO_URL}{folder_name}"
        player_div["audio-src"] = audio_src

        if exists:
            print(f"[INFO] Found audio_metadata.json for folder '{folder_name}'. Injecting HTML snippet.")
            player_div.clear()
            player_div.insert(0, BeautifulSoup(INJECTED_HTML, "html.parser"))
        else:
            print(f"[INFO] audio_metadata.json not found for folder '{folder_name}'. Leaving the div unchanged.")

        with open(index_file, "w", encoding="utf-8") as f:
            f.write(str(soup))

        # Log the updated file
        print(f"[UPDATED] {index_file}")


    async def main_async():
        if not os.path.isdir(READ_DIR):
            print(f"[ERROR] The folder {READ_DIR} does not exist.")
            return

        # Gather folder names and their corresponding audio_metadata URLs.
        folders = []
        for entry in os.listdir(READ_DIR):
            folder_path = os.path.join(READ_DIR, entry)
            if os.path.isdir(folder_path):
                folders.append((entry, folder_path))
            else:
                print(f"[DEBUG] {entry} is not a directory, skipping.")

        semaphore = asyncio.Semaphore(50)  # Limit to 50 concurrent requests
        async with aiohttp.ClientSession() as session:
            tasks = {
                folder_name: asyncio.create_task(
                    check_audio_metadata(session, f"{BASE_AUDIO_URL}{folder_name}/audio_metadata.json", semaphore)
                )
                for folder_name, _ in folders
            }
            results = {}
            for folder_name, folder_path in folders:
                exists = await tasks[folder_name]
                results[folder_name] = (folder_path, exists)

        # Process each folder using the result from the HEAD request.
        for folder_name, (folder_path, exists) in results.items():
            print(f"[INFO] Processing folder: {folder_name}")
            process_subdirectory(folder_path, folder_name, exists) #not used atm it stinks and doesnt work
if __name__ == '__main__':
    main()



