document.addEventListener('DOMContentLoaded', function () {

    let chapters = []; // Array to hold chapter data from chapters.json
    let currentChapterIndex = 0;
    let chaptersPerPage = 50;
    let currentContentPage = 0;

    // Function to load chapters.json and initialize the app
    function loadChapterList() {
        fetch('chapters.json')
            .then(response => response.json())
            .then(data => {
                chapters = data;
                if (chapters.length > 0) {
                    populateChapterSelect();
                    showContentPage();
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
            showChapterPage(currentChapterIndex);
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

    // Function to display the content page
    function displayContentPage() {
        let contentDiv = document.getElementById('content-page');
        contentDiv.innerHTML = '';

        let startIndex = currentContentPage * chaptersPerPage;
        let endIndex = Math.min(startIndex + chaptersPerPage, chapters.length);

        let ul = document.createElement('ul');
        ul.className = 'chapter-list';

        for (let i = startIndex; i < endIndex; i++) {
            let li = document.createElement('li');
            let a = document.createElement('a');
            a.href = '#';
            a.textContent = chapters[i].title;
            a.addEventListener('click', function(e) {
                e.preventDefault();
                currentChapterIndex = i;
                showChapterPage(i);
            });
            li.appendChild(a);
            ul.appendChild(li);
        }

        contentDiv.appendChild(ul);

        // Add pagination
        let paginationDiv = document.createElement('div');
        paginationDiv.className = 'pagination';

        let totalPages = Math.ceil(chapters.length / chaptersPerPage);
        for (let i = 0; i < totalPages; i++) {
            let pageButton = document.createElement('button');
            pageButton.textContent = i + 1;
            pageButton.addEventListener('click', function() {
                currentContentPage = i;
                displayContentPage();
            });
            if (i === currentContentPage) {
                pageButton.className = 'active';
            }
            paginationDiv.appendChild(pageButton);
        }

        contentDiv.appendChild(paginationDiv);
    }

    // Function to toggle navigation elements
    function toggleNavigationElements(show) {
        const elements = document.querySelectorAll('.prev-btn, .next-btn, #chapter-select, #chapter-nav-bottom');
        elements.forEach(el => {
            el.style.display = show ? '' : 'none';
        });
    }

    // Function to show content page
    function showContentPage() {
        displayContentPage();
        document.getElementById('chapter-content').style.display = 'none';
        document.getElementById('content-page').style.display = 'block';
        toggleNavigationElements(false);
    }

    // Function to show chapter page
    function showChapterPage(index) {
        displayChapter(index);
        document.getElementById('content-page').style.display = 'none';
        document.getElementById('chapter-content').style.display = 'block';
        toggleNavigationElements(true);
    }

    // Event listeners for next and previous buttons
    const nextButtons = document.querySelectorAll('.next-btn');
    const prevButtons = document.querySelectorAll('.prev-btn');

    nextButtons.forEach(button => {
        button.addEventListener('click', function () {
            if (currentChapterIndex < chapters.length - 1) {
                currentChapterIndex++;
                showChapterPage(currentChapterIndex);
            }
        });
    });

    prevButtons.forEach(button => {
        button.addEventListener('click', function () {
            if (currentChapterIndex > 0) {
                currentChapterIndex--;
                showChapterPage(currentChapterIndex);
            }
        });
    });

    // Dark mode toggle
    const toggleThemeBtn = document.getElementById('toggle-theme-btn');
    toggleThemeBtn.addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
        toggleThemeBtn.textContent = document.body.classList.contains('dark-mode') ? '☀️ Light Mode' : '🌙 Dark Mode';
    });

    // Add a button to show the content page
    const showContentBtn = document.getElementById('show-content-btn');
    showContentBtn.addEventListener('click', showContentPage);

    // Initialize the app by loading the chapter list
    loadChapterList();

});
