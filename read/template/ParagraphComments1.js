function handleParagraphClick(paragraphIndex) {

    const paragraph = document.querySelector(`[index="${paragraphIndex}"]`);
    if (!paragraph) return;



    const styleId = 'injected-box-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
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

    const injectedHTML = `
        <div class="mainCommentSection">
        
            <p>No comments found for this page.</p>
            <p>Checkout the <a href="https://discord.com/invite/A7RwNZZ5q6"
                target="_blank" 
                style="text-decoration: none; color: #5865F2; font-weight: bold; 
                    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3); transition: all 0.3s ease;">
                Discord
            </a> for further discussion.</p>
            <style>
                a:hover {
                    color: #404EED; /* Slightly darker Discord color on hover */
                    background-color: rgba(88, 101, 242, 0.2); /* Highlight background */
                    border-radius: 5px;
                    padding: 0 4px; /* Padding for hover highlight */
                }
            </style>
        </div>
    `;
    
    paragraph.insertAdjacentHTML('afterend', injectedHTML);


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





