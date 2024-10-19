import os
import json
import re

# Define the directory where your chapter files are located
chapters_dir = './chapters'
output_file = 'chapters.json'

def get_chapter_title(file_path):
    """Extract the first line (title) from a chapter file."""
    with open(file_path, 'r', encoding='utf-8') as file:
        title = file.readline().strip()  # Read the first line and strip any leading/trailing whitespace
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

if __name__ == '__main__':
    # Get the chapter data and save it to a JSON file
    chapter_data = get_chapter_data(chapters_dir)
    save_to_json(chapter_data, output_file)
    print(f'Chapter data saved to {output_file}')

