document.addEventListener('DOMContentLoaded', function () {

    let chapters = [];
    let currentChapterIndex = 0;
    const totalChapters = 31; // Adjust this number as needed

    // Function to load all chapters
    function loadChapters() {
        let chapterPromises = [];
        for (let i = 1; i <= totalChapters; i++) {
            let chapterFile = `chapters/chapter${i}.txt`;
            chapterPromises.push(fetch(chapterFile)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`File not found: ${chapterFile}`);
                    }
                    return response.text();
                })
                .catch(error => {
                    console.error(error);
                    return null;
                })
            );
        }

        Promise.all(chapterPromises).then(chapterTexts => {
            chapters = chapterTexts.filter(text => text !== null);
            if (chapters.length > 0) {
                populateChapterSelect();
                displayChapter(currentChapterIndex);
            } else {
                document.getElementById('chapter-content').textContent = 'No chapters found.';
            }
        }).catch(error => {
            console.error('Error loading chapters:', error);
        });
    }

    // Function to populate the chapter select dropdown
    function populateChapterSelect() {
        let select = document.getElementById('chapter-select');
        select.innerHTML = ''; // Clear existing options
        chapters.forEach((chapter, index) => {
            let firstLine = chapter.split('\n')[0].trim();
            // Truncate if too long
            if (firstLine.length > 30) {
                firstLine = firstLine.substring(0, 27) + '...';
            }
            let option = document.createElement('option');
            option.value = index;
            option.textContent = firstLine;
            select.appendChild(option);
        });

        select.addEventListener('change', function () {
            currentChapterIndex = parseInt(this.value);
            displayChapter(currentChapterIndex);
        });
    }

    // Function to display the chapter content
    function displayChapter(index) {
        let chapterText = chapters[index];
        let lines = chapterText.split('\n');
        let headline = lines.shift().trim();
        let content = lines.join('\n');

        let chapterContentDiv = document.getElementById('chapter-content');
        chapterContentDiv.innerHTML = '';

        let h1 = document.createElement('h1');
        h1.textContent = headline;
        chapterContentDiv.appendChild(h1);

        let p = document.createElement('p');
        p.textContent = content;
        chapterContentDiv.appendChild(p);

        document.getElementById('chapter-select').value = index;
    }

    // Event listeners for next and previous buttons
    const nextButtons = document.querySelectorAll('.next-btn');
    const prevButtons = document.querySelectorAll('.prev-btn');

    nextButtons.forEach(button => {
        button.addEventListener('click', function () {
            if (currentChapterIndex < chapters.length - 1) {
                currentChapterIndex++;
                displayChapter(currentChapterIndex);
            }
        });
    });

    prevButtons.forEach(button => {
        button.addEventListener('click', function () {
            if (currentChapterIndex > 0) {
                currentChapterIndex--;
                displayChapter(currentChapterIndex);
            }
        });
    });

    // Dark mode toggle
    const toggleThemeBtn = document.getElementById('toggle-theme-btn');
    toggleThemeBtn.addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
        toggleThemeBtn.textContent = document.body.classList.contains('dark-mode') ? '☀️ Light Mode' : '🌙 Dark Mode';
    });

    // Start loading chapters
    loadChapters();

});
