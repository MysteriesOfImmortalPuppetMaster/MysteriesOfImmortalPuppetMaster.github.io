function handleParagraphClick(paragraphIndex) {
    const paragraph = document.querySelector(`[index="${paragraphIndex}"]`);
    if (!paragraph) return;

    // Inject HTML
    const injectedHTML = `
        <div class="injected-box">
            <p>Injected content for paragraph ${paragraphIndex}</p>
        </div>
    `;
    paragraph.insertAdjacentHTML('beforeend', injectedHTML);

    // Inject CSS
    const style = document.createElement('style');
    style.textContent = `
        .injected-box {
            margin-top: 10px;
            padding: 8px;
            background-color: #222;
            color: #fff;
            border-radius: 4px;
            font-size: 14px;
        }
    `;
    document.head.appendChild(style);
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