// STEP ONE: Extract the folder name from the URL
function getCurrentFolder() {
    // Get the current URL
    let currentUrl = window.location.href;

    // Use a regular expression to capture the last part of the URL after the last '/'
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
    // Iterate through the chapters array to find the one that matches the folder name
    for (let i = 0; i < chapters.length; i++) {
        // Remove the ".txt" extension from the filename and compare it with folderName
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
    // Step 1: Get the current folder from the URL
    let folderName = getCurrentFolder();

    if (!folderName) return; // If the folder name couldn't be determined, exit early

    // Step 2: Find the current chapter in chapters.json
    let currentChapterIndex = getCurrentChapter(folderName, chapters);

    if (currentChapterIndex === null) return; // If we couldn't find the current chapter, exit early

    // Step 3: Check if there is a previous chapter
    if (currentChapterIndex > 0) {
        // Get the previous chapter's filename and remove the ".txt" extension
        let previousChapterFolder = chapters[currentChapterIndex - 1].filename.replace('.txt', '');

        // Rebuild the URL for the previous chapter
        let currentUrl = window.location.href;
        let baseUrl = currentUrl.replace(/\/[^\/]+\/?$/, ''); // Remove the current folder part from the URL
        let previousChapterUrl = baseUrl + '/' + previousChapterFolder + '/';

        // Redirect to the previous chapter's URL
        window.location.href = previousChapterUrl;
    } else {
        alert("You are already at the first chapter.");
    }
}

// STEP FOUR: Navigate to the next chapter
function goToNextChapter(chapters) {
    // Step 1: Get the current folder from the URL
    let folderName = getCurrentFolder();

    if (!folderName) return; // If the folder name couldn't be determined, exit early

    // Step 2: Find the current chapter in chapters.json
    let currentChapterIndex = getCurrentChapter(folderName, chapters);

    if (currentChapterIndex === null) return; // If we couldn't find the current chapter, exit early

    // Step 3: Check if there is a next chapter
    if (currentChapterIndex < chapters.length - 1) {
        // Get the next chapter's filename and remove the ".txt" extension
        let nextChapterFolder = chapters[currentChapterIndex + 1].filename.replace('.txt', '');

        // Rebuild the URL for the next chapter
        let currentUrl = window.location.href;
        let baseUrl = currentUrl.replace(/\/[^\/]+\/?$/, ''); // Remove the current folder part from the URL
        let nextChapterUrl = baseUrl + '/' + nextChapterFolder + '/';

        // Redirect to the next chapter's URL
        window.location.href = nextChapterUrl;
    } else {
        alert("You are already at the last chapter.");
    }
}

// Function to load chapters.json dynamically for previous chapter navigation
function prevChapter() {
    fetch('chapters.json')  // Assuming chapters.json is in the same directory as this script
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load chapters.json');
            }

            return response.json();
        })
        .then(chapters => {
            // Call the function to navigate to the previous chapter with loaded chapters data
            goToPreviousChapter(chapters);
        })
        .catch(error => {
            console.error('Error loading chapters.json:', error);
            alert('Could not load chapters.json. Please check if the file exists.');
        });
}

// Function to load chapters.json dynamically for next chapter navigation
function nextChapter() {
    fetch('chapters.json')  // Assuming chapters.json is in the same directory as this script
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load chapters.json');
            }

            return response.json();
        })
        .then(chapters => {
            // Call the function to navigate to the next chapter with loaded chapters data
            goToNextChapter(chapters);
        })
        .catch(error => {
            console.error('Error loading chapters.json:', error);
            alert('Could not load chapters.json. Please check if the file exists.');
        });
}
