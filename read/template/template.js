var GLOBAL_ALL_CHAPTERS_JSON = null;
let toggleButton = document.getElementById('light-mode-toggle');
let isButtonPresent = true;


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

function selectChapter(event) {
    let selectedChapterFolder = event.target.value;
    let currentUrl = window.location.href;
    let baseUrl = currentUrl.replace(/\/[^\/]+\/?$/, '');
    let selectedChapterUrl = baseUrl + '/' + selectedChapterFolder + '/';
    window.location.href = selectedChapterUrl;
}


function getCurrentChapter(folderName, chapters) {
    for (let i = 0; i < chapters.length; i++) {
        let chapterFolder = chapters[i].filename.replace('.txt', '');

        if (chapterFolder === folderName) {
            return i;
        }
    }

    throw new Error("CHAPTER_NOT_FOUND");
}

async function goToPreviousChapter() {
    let folderName = getCurrentFolder();

    if (!folderName) return;
    var currentChapterIndex;
    while (true) {
        try {
            currentChapterIndex = getCurrentChapter(folderName, GLOBAL_ALL_CHAPTERS_JSON);
            break;
        } catch (e) {
            console.log(`Chapter not found yet. Attempt. Waiting 100ms...`);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    if (currentChapterIndex > 0) {
        let previousChapterFolder = GLOBAL_ALL_CHAPTERS_JSON[currentChapterIndex - 1].filename.replace('.txt', '');
        let currentUrl = window.location.href;
        let baseUrl = currentUrl.replace(/\/[^\/]+\/?$/, '');
        let previousChapterUrl = baseUrl + '/' + previousChapterFolder + '/';
        window.location.href = previousChapterUrl;
    }
}

async function goToNextChapter() {
    let folderName = getCurrentFolder();

    if (!folderName) return;
    var currentChapterIndex;
    while (true) {
        try {
            currentChapterIndex = getCurrentChapter(folderName, GLOBAL_ALL_CHAPTERS_JSON);
            break;
        } catch (e) {
            console.log(`Chapter not found yet. Attempt. Waiting 100ms...`);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    if (currentChapterIndex < GLOBAL_ALL_CHAPTERS_JSON.length - 1) {
        let nextChapterFolder = GLOBAL_ALL_CHAPTERS_JSON[currentChapterIndex + 1].filename.replace('.txt', '');
        let currentUrl = window.location.href;
        let baseUrl = currentUrl.replace(/\/[^\/]+\/?$/, '');
        let nextChapterUrl = baseUrl + '/' + nextChapterFolder + '/';
        window.location.href = nextChapterUrl;
    }
}

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
function populateChapterDropdown(chapters, dropdownId, currentIndex) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;
    // Use a single HTML string instead of appendChild in a loop
    const optionsHTML = chapters.map((chapter, i) => {

        const name = chapter.filename.replace('.txt', '');
        const title = chapter.title.length > 45 ? chapter.title.slice(0, 45) + '…' : chapter.title;
        const selected = i === currentIndex ? ' selected' : '';

        return `<option value="${name}"${selected}>${title}</option>`;
    }).join('');

    dropdown.innerHTML = optionsHTML;
}
function prefetchAdjacentChapters(chapters, currentIndex) {
    const baseUrl = window.location.href.replace(/\/[^\/]+\/?$/, '');

    // Previous chapter
    if (currentIndex > 0) {
        const prev = document.createElement('link');
        prev.rel = 'prefetch';
        prev.href = `${baseUrl}/${chapters[currentIndex - 1].filename.replace('.txt', '')}/`;
        document.head.appendChild(prev);
    }
    else {
        const bottomButtons = document.querySelectorAll('.bottomButtons button[onclick="prevChapter()"]');
        bottomButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        });
    }

    // Next chapter
    if (currentIndex < chapters.length - 1) {
        const next = document.createElement('link');
        next.rel = 'prefetch';
        next.href = `${baseUrl}/${chapters[currentIndex + 1].filename.replace('.txt', '')}/`;
        document.head.appendChild(next);
    }
    else {
        const nextButtons = document.querySelectorAll('.bottomButtons button[onclick="nextChapter()"]');
        nextButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        });
    }
}
function loadChapterDropdowns() {
    const folderName = getCurrentFolder();
    const currentIndex = getCurrentChapter(folderName, GLOBAL_ALL_CHAPTERS_JSON);

    // Build once, insert twice
    populateChapterDropdown(GLOBAL_ALL_CHAPTERS_JSON, 'chapter-select-top', currentIndex);
    populateChapterDropdown(GLOBAL_ALL_CHAPTERS_JSON, 'chapter-select-bottom', currentIndex);

    prefetchAdjacentChapters(GLOBAL_ALL_CHAPTERS_JSON, currentIndex);
}
async function loadChapterJson(forceReload = false) {
    try {
        let url = '../../chapters.json';
        let options = {};
        if (forceReload) {
            options.cache = 'reload';
            url += '?t=' + new Date().getTime();
        }
        const response = await fetch(url, options);
        if (!response.ok) throw new Error('Failed to load chapters.json');
        const chapters = await response.json();
        GLOBAL_ALL_CHAPTERS_JSON = chapters;

    } catch (error) {
        console.error('Error loading chapters.json:', error);
        if (forceReload == true) { alert('Could not load chapters.json. Please check if the file exists.'); }
    }
}

function toggleLightMode() {
    document.body.classList.toggle('light-mode');

    // Update button icon based on the mode
    toggleButton.innerHTML = document.body.classList.contains('light-mode') ? SUN_SVG : MOON_SVG;

    // Save theme preference in localStorage
    const isLightMode = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
}
// Handle scroll to remove/recreate button
function scrollEventListener() {
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
        toggleButton.innerHTML = document.body.classList.contains('light-mode') ? SUN_SVG : MOON_SVG;
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
}
function savePageState() {
    if (!document.hasFocus()) return;
    const data = {
        url: window.location.href,
        scrollPosition: window.scrollY,
        timestamp: Date.now()
    };
    localStorage.setItem('pageState', JSON.stringify(data));
}

// prevents flashing.
function renderInstantDropdown() {
    const headlineEl = document.querySelector('#chapterHeadline h2');
    if (!headlineEl) return;

    const fullTitle = headlineEl.textContent.trim();
    const displayTitle = fullTitle.length > 45 ? fullTitle.slice(0, 45) + '…' : fullTitle.padEnd(45, '\u00A0');

    const filename = window.location.pathname.split('/').pop().replace('.html', '');

    const initialOption = `<option value="${filename}" selected>${displayTitle}</option>`;

    const dropdownIds = ['chapter-select-top', 'chapter-select-bottom'];

    dropdownIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = initialOption;
    });
}

function applySavedBG() {
    const savedBG = localStorage.getItem("customBG");
    const selector = document.getElementById("bgSelector");
    const input = document.getElementById("customBGInput");

    if (!savedBG) {
        document.body.style.backgroundImage = "none";

        if (selector) selector.value = "";
        if (input) {
            input.value = "";
            input.style.display = "none";
        }

        return;
    }

    document.body.style.backgroundImage = `url("${savedBG}")`;

    if (selector) {
        if (bgOptions.includes(savedBG)) {
            selector.value = savedBG;
            input.style.display = "none";
        } else {
            selector.value = "custom";
            input.value = savedBG;
            input.style.display = "block";
        }
    }
}


/// Entrypoint
function main() {

    renderInstantDropdown();

    applySavedBG();

    toggleButton.addEventListener('click', toggleLightMode);

    window.addEventListener('scroll', () => {
        scrollEventListener();
    });




    window.addEventListener('load', () => {
        loadChapterJson().then(() => {
            

            document.addEventListener('keydown', function (event) {
                switch (event.key) {
                    case 'ArrowLeft':
                        goToPreviousChapter();
                        break;
                    case 'ArrowRight':
                        goToNextChapter();
                        break;
                }
            });

            try { loadChapterDropdowns(); }
            catch (err) {
                loadChapterJson(true).then(() => {
                    loadChapterDropdowns();
                });
            }


            
        });

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            toggleButton.innerHTML = SUN_SVG;
        } else {
            toggleButton.innerHTML = MOON_SVG;
        }
    });


    savePageState();
    setInterval(savePageState, 5000);
}

main();







let DISCORD_SVG =
    `<?xml version="1.0" encoding="UTF-8"?>
<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg width="1em" height="1em" style="vertical-align:-0.15em" viewBox="0 -28.5 256 256" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid">
    <g>
        <path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z" fill="#5865F2" fill-rule="nonzero">

</path>
    </g>
</svg>`;



let MOON_SVG =
    `<svg fill="#000000" viewBox="0 0 24 24" id="moon-alt" xmlns="http://www.w3.org/2000/svg" class="icon multi-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><title style="stroke-width: 2;">moon alt</title><path id="secondary-fill" d="M21,12a9,9,0,0,1-9,9,8.91,8.91,0,0,1-6.38-2.67A8.64,8.64,0,0,0,9,19,9,9,0,0,0,15.38,3.66,9,9,0,0,1,21,12Z" style="fill: #3b8ccb; stroke-width: 2;"></path><path id="primary-stroke" d="M21,12A9,9,0,0,1,3.25,14.13,6.9,6.9,0,0,0,8,16,7,7,0,0,0,11.61,3H12A9,9,0,0,1,21,12Z" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></g></svg>`;

let SUN_SVG =
    `<svg fill="#000000" viewBox="0 0 24 24" id="sun" xmlns="http://www.w3.org/2000/svg" class="icon multi-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><title style="stroke-width: 2;">sun</title><circle id="primary-fill" cx="12" cy="12" r="4" style="fill: #000000; stroke-width: 2;"></circle><path id="secondary-stroke" d="M12,3V4M5.64,5.64l.7.7M3,12H4m1.64,6.36.7-.7M12,21V20m6.36-1.64-.7-.7M21,12H20M18.36,5.64l-.7.7" style="fill: none; stroke: #3b8ccb; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></g></svg>`;