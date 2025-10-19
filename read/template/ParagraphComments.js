



function getCommentFormHTML(paragraphIndex) {
    // A data attribute is added to the form to identify which paragraph it belongs to,
    // which is useful for handling the submission.
    return `
    <div class="commentInputSection"style="font-size: 80%;">
        <form id="commentForm" data-paragraph-index="${paragraphIndex}">
            <input id="nameInput" maxlength="25" placeholder="Name" type="text" /><br />
            <div style="position: relative;">
                <textarea id="commentInput" maxlength="500" placeholder="Write your comment here" rows="4"></textarea>
                <span id="charCounter">500</span>
            </div>
            <button type="submit">Submit Comment</button>
        </form>
        <hr>
    </div>
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
        if (allPageComments_GLOBAL_VARIABLE !== null) {
            comments = allPageComments_GLOBAL_VARIABLE;
        }
        else {

            const response = await fetch(`${API_URL}?source=${encodeURIComponent(source)}`, { method: "GET", });
            if (!response.ok) {
                throw new Error(`Failed to fetch comments: ${await response.text()}`);
            }
            comments = await response.json();
        }
        commentContainer.innerHTML = "";

        comments = comments.filter(c => c.comment_line === paragraphIndex);

        if (comments.length === 0) {
            commentContainer.innerHTML = `<p>No comments found for this paragraph.</p> `;
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
                commentDiv.style.fontSize = "70%";
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
                        // Kept: Default color setting for logic
                        charCounter.style.color = "grey"; 

                        replyBoxDiv.appendChild(charCounter);

                        replyTextarea.addEventListener("input", () => {
                            const remaining = 500 - replyTextarea.value.length;
                            charCounter.textContent = `${remaining}`;
                            // Kept: Situational color change logic
                            charCounter.style.color = remaining < 50 ? "red" : remaining < 100 ? "orange" : "grey";
                        });

                        const submitReplyButton = document.createElement("button");
                        submitReplyButton.textContent = "Submit Reply";
                        submitReplyButton.type = "submit";
                        // Removed: All inline submitReplyButton styles
                        // Removed: All submitReplyButton mouseover/mouseout listeners

                        replyBoxDiv.appendChild(submitReplyButton);

                        commentDiv.appendChild(replyBoxDiv);

                        submitReplyButton.addEventListener("click", async () => {
                            const replyContent = replyTextarea.value.trim();
                            const replyAuthor = nameInput.value.trim() || "Anonymous";

                            submitParagraphComment(replyAuthor, replyContent, comment.ID, paragraphIndex);
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

    // ✅ NEW CODE: attach unique handler to THIS section’s form
    const form = newCommentSection.querySelector("form");
    const nameInput = form.querySelector("#nameInput");
    const textarea = form.querySelector("#commentInput");
    
    form.addEventListener("submit", async  (e) => {
        e.preventDefault();
        await submitParagraphComment(nameInput.value, textarea.value, null, paragraphIndex);
    });

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

async function submitParagraphComment( name, comment_text, nested, paragraphIndex) {


    if (!comment_text) {
        alert("Please enter a comment before submitting.");
        return;
    }
 

    const payload = {
        author: name || "Anonymous",
        content: comment_text,
        source: window.location.href,
        nested: nested,
        comment_line: paragraphIndex,
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
        

        const errorText = await response.text();
        if (((!errorText.length) == "Comment Posted")  ){
            alert(`Failed to submit comment: ${errorText}`);
        }
        
       
        document.getElementById("commentForm").reset(); // Clear the form
        
    } catch (error) {
        alert("Error submitting comment:", error);
    }

    window.location.reload();
}


function LoadCommentCountBadge(){
    console.log(document.querySelectorAll("paragraph")); // how many nodes?
    document.querySelectorAll("paragraph").forEach(p => {

        const paragraphIndex = p.getAttribute("index");

        // count how many comments belong to this paragraph
        const commentCount = allPageComments_GLOBAL_VARIABLE
            .filter(c => c.comment_line !== null && Number(c.comment_line) === Number(paragraphIndex))
            .length;


        if (commentCount > 0) {
            // create a little number badge
            const badge = document.createElement("span");
            badge.textContent = ` ${commentCount}`;
            badge.className = "comment-count-badge";
            p.appendChild(badge);
        }
    });
    

}

