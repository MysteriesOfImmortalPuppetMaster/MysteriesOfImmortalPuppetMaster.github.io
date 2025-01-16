// STEP ONE: Extract the folder name from the URL
function getCurrentFolder() {
    let currentUrl = window.location.href;
    let folderPattern = /\/([^\/]+)\/?$/;
    let match = currentUrl.match(folderPattern);

    if (match) {
        return match[1]; // This is the folder name we're in (e.g., "103")
    } else {
        alert("Could not determine the folder from the URL.");
        return null;
    }
}

// STEP TWO: Find the current chapter in chapters.json
function getCurrentChapter(folderName, chapters) {
    for (let i = 0; i < chapters.length; i++) {
        let chapterFolder = chapters[i].filename.replace('.txt', '');

        if (chapterFolder === folderName) {
            return i; // Return the index of the current chapter
        }
    }

    alert("Could not find the current chapter in chapters.json.");
    return null;
}

// STEP THREE: Navigate to the previous chapter
function goToPreviousChapter(chapters) {
    let folderName = getCurrentFolder();

    if (!folderName) return;

    let currentChapterIndex = getCurrentChapter(folderName, chapters);

    if (currentChapterIndex === null) return;

    if (currentChapterIndex > 0) {
        let previousChapterFolder = chapters[currentChapterIndex - 1].filename.replace('.txt', '');
        let currentUrl = window.location.href;
        let baseUrl = currentUrl.replace(/\/[^\/]+\/?$/, '');
        let previousChapterUrl = baseUrl + '/' + previousChapterFolder + '/';
        window.location.href = previousChapterUrl;
    } else {
        alert("You are already at the first chapter.");
    }
}

// STEP FOUR: Navigate to the next chapter
function goToNextChapter(chapters) {
    let folderName = getCurrentFolder();

    if (!folderName) return;

    let currentChapterIndex = getCurrentChapter(folderName, chapters);

    if (currentChapterIndex === null) return;

    if (currentChapterIndex < chapters.length - 1) {
        let nextChapterFolder = chapters[currentChapterIndex + 1].filename.replace('.txt', '');
        let currentUrl = window.location.href;
        let baseUrl = currentUrl.replace(/\/[^\/]+\/?$/, '');
        let nextChapterUrl = baseUrl + '/' + nextChapterFolder + '/';
        window.location.href = nextChapterUrl;
    } else {
        alert("You are already at the last chapter.");
    }
}

// Function to load chapters.json dynamically for previous chapter navigation
function prevChapter() {
    fetch('../../chapters.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load chapters.json');
            }
            return response.json();
        })
        .then(chapters => {
            goToPreviousChapter(chapters);
        })
        .catch(error => {
            console.error('Error loading chapters.json:', error);
            alert('Could not load chapters.json. Please check if the file exists.');
        });
}

// Function to load chapters.json dynamically for next chapter navigation
function nextChapter() {
    fetch('../../chapters.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load chapters.json');
            }
            return response.json();
        })
        .then(chapters => {
            goToNextChapter(chapters);
        })
        .catch(error => {
            console.error('Error loading chapters.json:', error);
            alert('Could not load chapters.json. Please check if the file exists.');
        });
}

// Function to populate the chapter dropdown menu (for both top and bottom)
function populateChapterDropdown(chapters, dropdownId) {
    let folderName = getCurrentFolder();
    let currentChapterIndex = getCurrentChapter(folderName, chapters);

    let dropdown = document.getElementById(dropdownId);

    dropdown.innerHTML = '';

    chapters.forEach((chapter, index) => {
        let option = document.createElement('option');
        option.value = chapter.filename.replace('.txt', '');
        option.text = chapter.title;

        if (index === currentChapterIndex) {
            option.selected = true;
        }

        dropdown.appendChild(option);
    });
}

// Function to handle chapter selection from the dropdown
function selectChapter(event) {
    let selectedChapterFolder = event.target.value;
    let currentUrl = window.location.href;
    let baseUrl = currentUrl.replace(/\/[^\/]+\/?$/, '');
    let selectedChapterUrl = baseUrl + '/' + selectedChapterFolder + '/';
    window.location.href = selectedChapterUrl;
}

// Function to load chapters.json and populate both top and bottom dropdowns
function loadChapterDropdowns() {
    fetch('../../chapters.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load chapters.json');
            }
            return response.json();
        })
        .then(chapters => {
            // Populate both the top and bottom dropdowns
            populateChapterDropdown(chapters, 'chapter-select-top');
            populateChapterDropdown(chapters, 'chapter-select-bottom');
        })
        .catch(error => {
            console.error('Error loading chapters.json:', error);
            alert('Could not load chapters.json. Please check if the file exists.');
        });
}

// Call this function when the page loads to populate both dropdowns
window.onload = function () {
    loadChapterDropdowns();
};







/*light mode toggle*/

let toggleButton = document.getElementById('light-mode-toggle');
let isButtonPresent = true;

// Add click event listener for light mode toggle
function toggleLightMode() {
    document.body.classList.toggle('light-mode');

    // Update button icon based on the mode
    toggleButton.textContent = document.body.classList.contains('light-mode') ? '☀️' : '🌙';

    // Save theme preference in localStorage
    const isLightMode = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
}

toggleButton.addEventListener('click', toggleLightMode);

// Handle scroll to remove/recreate button
window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;

    if (scrollPosition > 20 && isButtonPresent) {
        // Remove the button if scrolled past 20px
        toggleButton.remove();
        isButtonPresent = false;
    } else if (scrollPosition <= 20 && !isButtonPresent) {
        // Recreate the button if back at the top
        toggleButton = document.createElement('button');
        toggleButton.id = 'light-mode-toggle';
        toggleButton.ariaLabel = 'Toggle light mode';
        toggleButton.textContent = document.body.classList.contains('light-mode') ? '☀️' : '🌙';
        toggleButton.addEventListener('click', toggleLightMode);
        document.body.appendChild(toggleButton);
        isButtonPresent = true;

        // Apply styles immediately to match the original button
        toggleButton.style.position = 'fixed';
        toggleButton.style.top = '20px';
        toggleButton.style.right = '20px';
        toggleButton.style.width = '40px'; // Smaller width
        toggleButton.style.height = '40px'; // Smaller height
        toggleButton.style.backgroundColor = document.body.classList.contains('light-mode')
            ? '#ffffff'
            : '#2d2d2d';
        toggleButton.style.color = document.body.classList.contains('light-mode')
            ? '#2d2d2d'
            : '#ffffff';
        toggleButton.style.borderRadius = '5px'; // Square corners with slight rounding
        toggleButton.style.cursor = 'pointer';
        toggleButton.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)'; // Subtler shadow
        toggleButton.style.fontSize = '16px'; // Slightly smaller font
        toggleButton.style.zIndex = '1000';
        toggleButton.style.display = 'flex';
        toggleButton.style.alignItems = 'center';
        toggleButton.style.justifyContent = 'center';
        toggleButton.style.transition = 'background-color 0.3s, color 0.3s, box-shadow 0.3s';
    }
});

// Apply saved theme on page load
window.addEventListener('load', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        toggleButton.textContent = '☀️';
    } else {
        toggleButton.textContent = '🌙';
    }
});