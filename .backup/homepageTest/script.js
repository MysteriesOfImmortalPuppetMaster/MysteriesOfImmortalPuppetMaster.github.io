// JavaScript for toggling chapter view
document.getElementById('toggleView').addEventListener('click', function() {
    const chapterContainer = document.getElementById('chapterContainer');
    const chapters = chapterContainer.getElementsByTagName('li');
    const cutoff = 3; // Change this value as needed for the cutoff between Book 1 and Book 2

    if (this.textContent === 'Switch to Raw Chapter View') {
        // Switch to raw chapter view
        for (let i = 0; i < chapters.length; i++) {
            chapters[i].innerHTML = `<a href="#">Chapter ${i + 1}</a>`;
        }
        this.textContent = 'Switch to Book View';
    } else {
        // Switch back to book view
        for (let i = 0; i < chapters.length; i++) {
            if (i < cutoff) {
                chapters[i].innerHTML = `<a href="#">Book 1: Chapter ${i + 1} - Original Title</a>`;
            } else {
                chapters[i].innerHTML = `<a href="#">Book 2: Chapter ${i + 1 - cutoff} - Original Title</a>`;
            }
        }
        this.textContent = 'Switch to Raw Chapter View';
    }
});
