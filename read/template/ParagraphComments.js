/**
 * Injects all necessary CSS for the comment section into the document's head.
 * This function ensures the styles are added only once.
 */
function injectParagraphCommentStyles() {
    const styleId = 'paragraph-comments-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .paragraph-comment-container {
            margin-top: 15px;
            margin-bottom: 15px;
            padding: 12px;
            background-color: #2c2f33; /* Darker, more modern background */
            color: #f0f0f0;
            border-left: 3px solid #5865F2; /* Accent border */
            border-radius: 4px;
            font-size: 14px;
        }
        .paragraph-comment-container a {
            text-decoration: none;
            color: #5865F2;
            font-weight: bold;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
            transition: all 0.2s ease;
        }
        .paragraph-comment-container a:hover {
            color: #7289da; /* Lighter Discord color on hover */
            text-decoration: underline;
        }
        .comment {
            border-bottom: 1px solid #4f545c;
            padding: 8px 0;
            margin-bottom: 8px;
        }
        .comment:last-child {
            border-bottom: none;
        }
        .reply-button {
            background: #40444b;
            color: #b9bbbe;
            border: 1px solid #5865F2;
            border-radius: 4px;
            padding: 4px 8px;
            cursor: pointer;
            margin-top: 8px;
            font-size: 12px;
            transition: background-color 0.2s ease;
        }
        .reply-button:hover {
            background-color: #5865F2;
            color: #ffffff;
        }
    `;
    document.head.appendChild(style);
}


function getNoCommentsHTML() {
    return `
        <p>No comments found for this paragraph.</p>
        <p>Checkout the <a href="https://discord.com/invite/A7RwNZZ5q6" target="_blank">Discord</a> for further discussion.</p>
    `;
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function fetchAndRenderParagraphComments(commentContainer, paragraphIndex) {
    const source = window.location.href;

    try {
        let comments;
        let attempts = 0;
        while (!allPageComments_GLOBAL_VARIABLE && attempts < 50) {
            await sleep(10);
            attempts++;
        }
        if (allPageComments_GLOBAL_VARIABLE  !== null) {
            comments = allPageComments_GLOBAL_VARIABLE;
        }
        else {

            const response = await fetch(`${API_URL}?source=${encodeURIComponent(source)}`, {
                method: "GET",
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch comments: ${await response.text()}`);
            }
            comments = await response.json();
        }
        commentContainer.innerHTML = "";

        if (comments.length === 0) {
            commentContainer.innerHTML = getNoCommentsHTML();
            return;
        }

        const commentsMap = new Map(comments.map(c => [c.ID, { ...c, replies: [] }]));
        const rootComments = [];

        comments.forEach(comment => {
            if (comment.nested && commentsMap.has(comment.nested)) {
                commentsMap.get(comment.nested).replies.push(commentsMap.get(comment.ID));
            } else {
                rootComments.push(commentsMap.get(comment.ID));
            }
        });


        function renderComments(comments, parentElement, level = 0) {
             comments.forEach(comment => {
                 const commentDiv = document.createElement("div");
                 commentDiv.className = "comment";
                 commentDiv.style.marginLeft = `${level * 20}px`;
                 
                 const authorStrong = document.createElement("strong");
                 authorStrong.textContent = comment.author || "Anonymous";

                 const contentSpan = document.createElement("span");
                 contentSpan.textContent = comment.content;
                 contentSpan.style.whiteSpace = "pre-line";
                 
                 const dateEm = document.createElement("em");
                 dateEm.textContent = new Date(comment.date + 'Z').toLocaleString();

                 commentDiv.append(authorStrong, document.createElement("br"), contentSpan, document.createElement("br"), dateEm);
                 
                 
                 parentElement.appendChild(commentDiv);
                 if (comment.replies && comment.replies.length > 0) {
                     renderComments(comment.replies, parentElement, level + 1);
                 }
             });
        }
        renderComments(rootComments, commentContainer);

    } catch (error) {
        console.error("Error fetching comments:", error);
        commentContainer.innerHTML = `<p>Error loading comments. Please try again later.</p>`;
    }
}


function toggleParagraphCommentSection(paragraphIndex) {
    const clickedParagraph = document.querySelector(`[index="${paragraphIndex}"]`);
    if (!clickedParagraph) return;

    injectParagraphCommentStyles();

    const commentSectionId = 'paragraph-comment-section-container';
    let commentSection = document.getElementById(commentSectionId);

    if (commentSection && commentSection.previousElementSibling === clickedParagraph) {
        commentSection.remove();
        return;
    }

    if (!commentSection) {
        commentSection = document.createElement('div');
        commentSection.id = commentSectionId;
        commentSection.className = 'paragraph-comment-container';
    }

    commentSection.innerHTML = '<p>Loading comments...</p>';

    clickedParagraph.insertAdjacentElement('afterend', commentSection);

    fetchAndRenderParagraphComments(commentSection, paragraphIndex);
}


function setupParagraphClickListeners() {
    const paragraphs = document.querySelectorAll('paragraph');
    
    paragraphs.forEach(p => {
        p.addEventListener('click', () => {
            const index = parseInt(p.getAttribute('index'), 10);
            if (!isNaN(index)) {
                toggleParagraphCommentSection(index);
            }
        });
    });
    console.log('Paragraph click listeners have been set up.');
}


document.addEventListener('DOMContentLoaded', () => {
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(setupParagraphClickListeners, { timeout: 2000 });
    } else {
        setTimeout(setupParagraphClickListeners, 500);
    }
});