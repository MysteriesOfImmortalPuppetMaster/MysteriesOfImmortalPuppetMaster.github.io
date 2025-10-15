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
       
        .comment {
            font-size: 80%;
        }
        
    `;
    document.head.appendChild(style);
}

/**
 * NEW FUNCTION
 * Returns the HTML string for the comment submission form.
 * @param {number} paragraphIndex - The index of the paragraph to associate the form with.
 * @returns {string} The HTML content of the form.
 */
function getCommentFormHTML(paragraphIndex) {
    // A data attribute is added to the form to identify which paragraph it belongs to,
    // which is useful for handling the submission.
    return `
        <form id="commentForm" data-paragraph-index="${paragraphIndex}">
            <label for="nameInput">Name (optional):</label><br />
            <input id="nameInput" maxlength="25" placeholder="Anonymous" type="text" /><br /><br />
            <label for="commentInput">Comment:</label><br />
            <div style="position: relative;">
                <textarea id="commentInput" maxlength="500" placeholder="Write your comment here" rows="4"></textarea>
                <span id="charCounter">500</span>
            </div>
            <button type="submit">Submit Comment</button>
        </form>
        <hr style="border-color: #4f545c; margin: 15px 0;">
    `;
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
                 
                 // Add reply button only if the comment is not a reply itself
                if (comment.nested === null) {
                    const replyButton = document.createElement("button");
                    replyButton.innerHTML = `
                    <span class="reply-icon" aria-hidden="true"
                          style="display:inline-flex;align-items:flex-end;line-height:0;margin-right:0px;margin-left:3px;">
                      <svg xmlns="http://www.w3.org/2000/svg"
                           viewBox="0 0 16 16"
                           fill="currentColor"
                           style="width:13px;height:13px;display:block;position:relative;top:3px;">
                        <path d="M5 15H4L0 11L4 7H5V10H11C12.6569 10 14 8.65685 14 7C14 5.34315 12.6569 4 11 4H4V2H11C13.7614 2 16 4.23858 16 7C16 9.76142 13.7614 12 11 12H5V15Z"/>
                      </svg>
                    </span>
                    <span class="reply-text"
                          style="display:inline-block;vertical-align:middle;">reply</span>
                  `;
                    commentDiv.appendChild(replyButton);
                    replyButton.classList.add("reply-button");
                    commentDiv.appendChild(replyButton);

                    replyButton.addEventListener("click", () => {
                        if (commentDiv.querySelector(".commentInputSection")) {
                            return; // Prevent duplicate reply boxes
                        }

                        const replyBoxDiv = document.createElement("div");
                        replyBoxDiv.classList.add("commentInputSection");

                        const nameInput = document.createElement("input");
                        nameInput.type = "text";
                        nameInput.placeholder = "Anonymous";
                        nameInput.maxLength = 25;
                        replyBoxDiv.appendChild(nameInput);

                        const replyTextarea = document.createElement("textarea");
                        replyTextarea.placeholder = "Write your reply...";
                        replyTextarea.rows = 3;
                        replyTextarea.maxLength = 500;


                        replyBoxDiv.appendChild(replyTextarea);

                        const charCounter = document.createElement("span");
                        charCounter.textContent = "500";
                        charCounter.style.color = "grey"; // Initial color
                        charCounter.style.fontSize = "14px"; // Optional: Adjust font size
                        charCounter.style.marginTop = "5px"; // Optional: Add spacing
                        charCounter.style.position = "relative";
                        charCounter.style.bottom = "8px";
                        charCounter.style.right = "40px";
                        replyBoxDiv.appendChild(charCounter);

                        replyTextarea.addEventListener("input", () => {
                            const remaining = 500 - replyTextarea.value.length;
                            charCounter.textContent = `${remaining}`;
                            charCounter.style.color = remaining < 50 ? "red" : remaining < 100 ? "orange" : "grey";
                        });

                        const submitReplyButton = document.createElement("button");
                        submitReplyButton.textContent = "Submit Reply";
                        submitReplyButton.type = "submit";
                        submitReplyButton.style.width = "150px";
                        submitReplyButton.style.padding = "10px 10px";
                        submitReplyButton.style.background = "linear-gradient(135deg, #3b8ccb, #2d85ec)";
                        submitReplyButton.style.border = "none";
                        submitReplyButton.style.color = "whitesmoke";
                        submitReplyButton.style.fontSize = "16px";
                        submitReplyButton.style.cursor = "pointer";
                        submitReplyButton.style.borderRadius = "8px";
                        submitReplyButton.style.display = "block";
                        submitReplyButton.style.textAlign = "center";
                        submitReplyButton.style.transition = "background 0.3s ease, box-shadow 0.3s ease";
                        submitReplyButton.style.whiteSpace = "nowrap";

                        submitReplyButton.addEventListener("mouseover", () => {
                            submitReplyButton.style.background = "linear-gradient(135deg, #256bbc, #1d6bb3)";
                            submitReplyButton.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.3)";
                        });

                        submitReplyButton.addEventListener("mouseout", () => {
                            submitReplyButton.style.background = "linear-gradient(135deg, #3b8ccb, #2d85ec)";
                            submitReplyButton.style.boxShadow = "none";
                        });

                        replyBoxDiv.appendChild(submitReplyButton);

                        commentDiv.appendChild(replyBoxDiv);

                        submitReplyButton.addEventListener("click", async () => {
                            const replyContent = replyTextarea.value.trim();
                            const replyAuthor = nameInput.value.trim() || "Anonymous";

                            if (!replyContent) {
                                alert("Please enter a reply before submitting.");
                                return;
                            }

                            const replyPayload = {
                                author: replyAuthor,
                                content: replyContent,
                                source: window.location.href,
                                nested: comment.ID,
                            };

                            try {
                                const response = await fetch(API_URL, {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(replyPayload),
                                });

                                if (!response.ok) {
                                    const errorText = await response.text();
                                    alert(`Failed to submit reply: ${errorText}`);
                                }

                                alert("Reply submitted successfully!");
                                replyBoxDiv.remove();
                                fetchCommentsForCurrentSource();
                            } catch (error) {
                                console.error("Error submitting reply:", error);
                                alert("Failed to submit your reply. Please try again.");
                            }
                        });
                    });
                }



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

/**
 * MODIFIED FUNCTION
 * Toggles the visibility of the comment section for a specific paragraph.
 * It now injects a comment form above the list of comments.
 * @param {number} paragraphIndex - The index of the clicked paragraph.
 */
function toggleParagraphCommentSection(paragraphIndex) {
    const clickedParagraph = document.querySelector(`[index="${paragraphIndex}"]`);
    if (!clickedParagraph) return;

    injectParagraphCommentStyles();

    const commentSectionId = 'paragraph-comment-section-container';
    let existingCommentSection = document.getElementById(commentSectionId);

    // If a section is already open for this paragraph, close it and exit.
    if (existingCommentSection && existingCommentSection.previousElementSibling === clickedParagraph) {
        existingCommentSection.remove();
        return;
    }

    // If a section is open for a different paragraph, remove it before creating a new one.
    if (existingCommentSection) {
        existingCommentSection.remove();
    }

    // Create the main container for both the form and the comments list.
    const newCommentSection = document.createElement('div');
    newCommentSection.id = commentSectionId;
    newCommentSection.className = 'paragraph-comment-container';

    // Create a dedicated sub-container just for the list of fetched comments.
    const commentsListContainer = document.createElement('div');
    commentsListContainer.innerHTML = '<p>Loading comments...</p>'; // Initial loading message

    // Set the content: form first, then the container that will hold the comments.
    newCommentSection.innerHTML = getCommentFormHTML(paragraphIndex);
    newCommentSection.appendChild(commentsListContainer);

    // Insert the entire new section (form + comments list) after the clicked paragraph.
    clickedParagraph.insertAdjacentElement('afterend', newCommentSection);

    // Fetch and render the comments into the dedicated sub-container.
    fetchAndRenderParagraphComments(commentsListContainer, paragraphIndex);
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