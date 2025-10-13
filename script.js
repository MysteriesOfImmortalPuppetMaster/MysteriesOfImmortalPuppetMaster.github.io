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
});



function goToSavedState() {
    const saved = JSON.parse(localStorage.getItem('pageState'))
    if (!saved || !saved.url) return;

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