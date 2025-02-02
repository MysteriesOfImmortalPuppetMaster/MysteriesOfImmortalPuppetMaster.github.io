# -*- coding: utf-8 -*-
import os
import requests
from bs4 import BeautifulSoup


INJECTED_HTML = """
<p id="folderInfo" class="timer"></p>

            <div class="bigbox">

                <!-- Play/Pau<div class="audio-controls">se + Timers -->
                <div class="audio-controls">
                    <button id="playPauseBtn">▶</button>

                </div>
                <div class="smlboxplusTime">
                    <div class="smlbox">
                        <!-- Visualization canvas -->
                        <canvas id="visualizer">
                        </canvas>

                        <!-- Custom progress bar -->
                        <div id="progressBarContainer">
                            <div id="progressBar"></div>
                        </div>
                    </div>
                    <!-- Timers below the bar -->
                    <div class="timer-container">
                        <span id="currentTime" class="timer">0:00</span>
                        <span id="totalTime" class="timer">3:45</span>
                    </div>
                </div>
            </div>
            <!-- Volume Control -->
            <div class="volume-container">
                <span class="audio-icon">🔊</span>
                <input type="range" id="volumeControl" min="0" max="1" step="0.01" value="0.5">
            </div>
            <!-- Hidden audio elements for chunk preloading -->
            <audio id="currentAudio" style="display:none;" preload="auto" crossOrigin="anonymous"></audio>
            <audio id="nextAudio" style="display:none;" preload="auto" crossOrigin="anonymous"></audio>
            <script src="../audioDisplay.js"></script>
            <link rel="stylesheet" href="../audioDisplay.css">
"""

# Base URL for audio files.
BASE_AUDIO_URL = "https://mysteriesofimmortalpuppetmaster.github.io/audioStash/"


READ_DIR = os.path.join(os.path.dirname(os.path.realpath(__file__)), "read")


def process_subdirectory(folder_path, folder_name):
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
    
    audio_metadata_url = f"{audio_src}/audio_metadata.json"
    print(f"[DEBUG] Checking URL: {audio_metadata_url}")

    try:
        response = requests.get(audio_metadata_url)
    except requests.RequestException as e:
        print(f"[ERROR] Failed to request {audio_metadata_url}: {e}")
        response = None

  
    player_div["audio-src"] = audio_src

    
    if response and response.status_code == 200:
        print(f"[INFO] Found audio_metadata.json for folder '{folder_name}'. Injecting HTML snippet.")
  
        player_div.clear()
        player_div.insert(0, BeautifulSoup(INJECTED_HTML, "html.parser"))
    else:
        print(f"[INFO] audio_metadata.json not found for folder '{folder_name}'. Leaving the div unchanged.")

    
    with open(index_file, "w", encoding="utf-8") as f:
        f.write(str(soup))
    print(f"[INFO] Updated {index_file}")


def main():
    if not os.path.isdir(READ_DIR):
        print(f"[ERROR] The folder {READ_DIR} does not exist.")
        return

   
    for entry in os.listdir(READ_DIR):
        folder_path = os.path.join(READ_DIR, entry)
        if os.path.isdir(folder_path):
            print(f"[INFO] Processing folder: {entry}")
            process_subdirectory(folder_path, entry)
        else:
            print(f"[DEBUG] {entry} is not a directory, skipping.")

if __name__ == "__main__":
    main()