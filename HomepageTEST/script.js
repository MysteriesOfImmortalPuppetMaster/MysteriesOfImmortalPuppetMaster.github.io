// script.js

// Scroll to the bottom of the page
function scrollToBottom() {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
}

// Toggle Synopsis visibility
function toggleSynopsis() {
    const synopsisSection = document.querySelector('.synopsis-section');
    synopsisSection.classList.toggle('collapsed');
    const button = synopsisSection.querySelector('button.view-synopsis');
    button.textContent = synopsisSection.classList.contains('collapsed') ? 'View Synopsis' : 'Hide Synopsis';
}

// Fetch chapters from the chapters.json file and populate the list
async function loadChapters() {
    try {
        const response = await fetch('chapters.json');
        const chapters = await response.json();
        const chaptersPerBook = [231, 500]; // Array of cutoff points for books
        const totalBooks = chaptersPerBook.length; // Total number of books defined by array

        const chapterContainer = document.getElementById('chapterContainer');
        chapterContainer.innerHTML = ''; // Clear any existing content

        // Group chapters into books based on cutoff points
        const books = [];
        let currentBookIndex = 0;
        let currentChapterStart = 0;

        chaptersPerBook.forEach((cutoff, index) => {
            books[index] = chapters.slice(currentChapterStart, cutoff);
            currentChapterStart = cutoff;
        });

        books.forEach((bookChapters, bookIndex) => {
            // Create a container for the book
            const bookDiv = document.createElement('div');
            bookDiv.className = 'book';

            // Create a button to toggle the chapters
            const bookButton = document.createElement('button');
            bookButton.className = 'read-chapterLIST';
            bookButton.textContent = `Book ${bookIndex + 1}`;
            bookButton.onclick = function () {
                const chapterList = this.nextElementSibling;
                chapterList.classList.toggle('hidden');
            };
            bookDiv.appendChild(bookButton);

            // Create the list of chapters
            const ul = document.createElement('ul');

            bookChapters.forEach(chapter => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = `read/${chapter.filename.replace('.txt', '')}/`;
                a.textContent = chapter.title.slice(0, 20); // Only show the first 20 characters
                li.appendChild(a);
                ul.appendChild(li);
            });
            bookDiv.appendChild(ul);

            chapterContainer.appendChild(bookDiv);
        });

        // Now handle auto-hide or auto-show based on screen width
        function adjustChapterVisibility() {
            const screenWidth = window.innerWidth;
            const thresholdWidth = 800; // Adjust this threshold as needed
            const bookUls = document.querySelectorAll('.book ul');
            bookUls.forEach((ul, index) => {
                const isLastBook = index === bookUls.length - 1;
                if (isLastBook) {
                    // Always show the last book's chapters
                    ul.classList.remove('hidden');
                } else {
                    if (screenWidth < thresholdWidth) {
                        // For mobile users, auto-hide the books
                        ul.classList.add('hidden');
                    } else {
                        // For big screens, auto-show the books
                        ul.classList.remove('hidden');
                    }
                }
            });
        }

        // Initial adjustment
        adjustChapterVisibility();

        // Listen for window resize events to adjust display
        window.addEventListener('resize', adjustChapterVisibility);

    } catch (error) {
        console.error('Error loading chapters:', error);
    }
}

// Event listener for the synopsis toggle button
document.addEventListener('DOMContentLoaded', () => {
    const synopsisButton = document.querySelector('button.view-synopsis');
    if (synopsisButton) {
        synopsisButton.addEventListener('click', toggleSynopsis);
    }

    // Load chapters on page load
    loadChapters();
});
