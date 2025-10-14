
function handleParagraphClick(paragraphIndex) {
    console.log(`Paragraph with index: ${paragraphIndex} was clicked!`);
    alert("clicked");

}


function setupParagraphClick() {

    const paragraphs = document.querySelectorAll('paragraph');

    paragraphs.forEach(paragraphElement => {
        paragraphElement.addEventListener('click', () => {
            const indexString = paragraphElement.getAttribute('index');
            const paragraphIndex = parseInt(indexString, 10);
            
            handleParagraphClick(paragraphIndex);
        });
    });
    console.log('Low-priority setupParagraphClick executed.');
}

document.addEventListener('DOMContentLoaded', () => {

    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(setupParagraphClick, { timeout: 2000 });
        console.log('requestIdleCallback registered.');

    } else {

        setTimeout(setupParagraphClick, 1000); 
        console.log('setTimeout fallback used.');
    }
});