// Scroll to the bottom of the page
function scrollToBottom() {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
}


// Fetch chapters from the chapters.json file and populate the list
async function loadChapters() {
    try {
        const response = await fetch('chapters.json');
        const chapters = await response.json();
        const chaptersPerBook = [333, Infinity]; // Array of cutoff points for books
        const BookNames = ["Lava Immortal Palace", "Myriad Phenomena Cloud Sea"];

        const chapterContainer = document.getElementById('chapterContainer');
        chapterContainer.innerHTML = ''; // Clear any existing content

        const books = [];
        let currentChapterStart = 0;

        chaptersPerBook.forEach((cutoff, index) => {
            books[index] = chapters.slice(currentChapterStart, cutoff);
            currentChapterStart = cutoff;
        });

        books.forEach((bookChapters, bookIndex) => {
            const bookDiv = document.createElement('div');
            bookDiv.className = 'book';

            const bookButton = document.createElement('button');
            bookButton.className = 'read-chapterLIST';
            bookButton.textContent = `Book ${bookIndex + 1} -- ${BookNames[bookIndex]}`;
            bookButton.onclick = function () {
                const chapterList = this.nextElementSibling;
                const isExpanded = chapterList.classList.toggle('expanded');

                if (isExpanded) {
                    Array.from(chapterList.children).forEach((li, index) => {
                        setTimeout(() => {
                            li.classList.add('show');
                        }, index * 10); // Delay between each chapter appearing
                    });
                    // Save user choice in a data attribute
                    bookButton.dataset.expanded = "true";
                } else {
                    Array.from(chapterList.children).forEach(li => {
                        li.classList.remove('show');
                    });
                    // Update user choice in a data attribute
                    bookButton.dataset.expanded = "false";
                }
            };
            bookDiv.appendChild(bookButton);

            const ul = document.createElement('ul');
            bookChapters.forEach(chapter => {
                const li = document.createElement('li');
                li.classList.add('chapter-item'); // Adding class to control animation
                const a = document.createElement('a');
                a.href = `read/${chapter.filename.replace('.txt', '')}/`;
                a.textContent = chapter.title; // Removed the 20-character slicing
                li.appendChild(a);
                ul.appendChild(li);
            });
            bookDiv.appendChild(ul);

            chapterContainer.appendChild(bookDiv);
        });

        // Adjust visibility based on screen width, but keep user choice persistent
        function adjustChapterVisibility() {
            const screenWidth = window.innerWidth;
            const thresholdWidth = 800; // Adjust this threshold as needed
            const bookButtons = document.querySelectorAll('.read-chapterLIST');
            bookButtons.forEach((button, index) => {
                const chapterList = button.nextElementSibling;
                const isLastBook = index === bookButtons.length - 1;

                if (isLastBook) {
                    chapterList.classList.add('expanded');
                    Array.from(chapterList.children).forEach(li => li.classList.add('show'));
                } else {
                    // Check if user has manually expanded/collapsed this book
                    const userExpanded = button.dataset.expanded === "true";

                    if (screenWidth < thresholdWidth && !userExpanded) {
                        chapterList.classList.remove('expanded');
                        Array.from(chapterList.children).forEach(li => li.classList.remove('show'));
                    } else if (userExpanded || screenWidth >= thresholdWidth) {
                        chapterList.classList.add('expanded');
                        Array.from(chapterList.children).forEach(li => li.classList.add('show'));
                    }
                }
            });
        }

        adjustChapterVisibility();
        window.addEventListener('resize', adjustChapterVisibility);

    } catch (error) {
        console.error('Error loading chapters:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadChapters();
    disableButton();
});

function disableButton(){
    const saved = JSON.parse(localStorage.getItem('pageState'))
    if (!saved || !saved.url) {
        const nextButtons = document.querySelectorAll('button[onclick="goToSavedState()"]');
        nextButtons.forEach(button => {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
        });
    }
}



function goToSavedState() {
    const saved = JSON.parse(localStorage.getItem('pageState'))
    if (!saved || !saved.url) {
        
        const nextButtons = document.querySelectorAll('button[onclick="goToSavedState()"]');
        
        // 🌟 FIX: Loop through the NodeList and apply changes to each button
        nextButtons.forEach(button => {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
        });

        return; // Exit the function since there's nowhere to go
    }

    if (window.location.href !== saved.url) {
        // 1. Store the scroll position for the *new* page to read.
        const data = {
            scrollPosition: saved.scrollPosition,
        };
        localStorage.setItem('scrollRequest', JSON.stringify(data));
        
        // 2. Navigate to the new page.
        window.location.href = saved.url; 
        
        // **Note:** No need for a window.addEventListener('load', ...) here.
        // That listener would never fire because the page navigates away.

    } else {
        // If on the same page, scroll immediately.
        window.scrollTo(0, saved.scrollPosition || 0);
    }
}





// old color was   fill="#5865F2"
let DISCORD_SVG = 
`<?xml version="1.0" encoding="UTF-8"?>
<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg width="1em" height="1em" style="vertical-align:-0.15em" viewBox="0 -28.5 256 256" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid">
    <g>
        <path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z" fill="currentColor" fill-rule="nonzero">

</path>
    </g>
</svg>`; 

document.addEventListener("DOMContentLoaded", () => {
    const icon = document.getElementById("discord-icon");
    if (icon) icon.innerHTML = DISCORD_SVG;
  });