document.addEventListener('DOMContentLoaded', function () {

    let chapters = []; // Array to hold chapter data from chapters.json
    let currentChapterIndex = 0;

    // Function to load chapters.json and initialize the app
    function loadChapterList() {
        fetch('chapters.json')
            .then(response => response.json())
            .then(data => {
                chapters = data;
                if (chapters.length > 0) {
                    populateChapterSelect();
                    displayChapter(currentChapterIndex);
                } else {
                    document.getElementById('chapter-content').textContent = 'No chapters found.';
                }
            })
            .catch(error => {
                console.error('Error loading chapters.json:', error);
            });
    }

    // Function to populate the chapter select dropdown
    function populateChapterSelect() {
        let select = document.getElementById('chapter-select');
        select.innerHTML = ''; // Clear existing options
        chapters.forEach((chapter, index) => {
            let title = chapter.title;
            // Truncate if too long
            if (title.length > 50) {
                title = title.substring(0, 47) + '...';
            }
            let option = document.createElement('option');
            option.value = index;
            option.textContent = title;
            select.appendChild(option);
        });

        select.addEventListener('change', function () {
            currentChapterIndex = parseInt(this.value);
            displayChapter(currentChapterIndex);
        });
    }

    // Function to display the chapter content
    function displayChapter(index) {
        let chapter = chapters[index];
        let chapterFile = 'chapters/' + chapter.filename;

        fetch(chapterFile)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`File not found: ${chapterFile}`);
                }
                return response.text();
            })
            .then(chapterText => {
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
            })
            .catch(error => {
                console.error('Error loading chapter:', error);
                document.getElementById('chapter-content').textContent = 'Error loading chapter.';
            });
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

    // Initialize the app by loading the chapter list
    loadChapterList();

});
