const API_URL = "https://commentator-worker.pptinsanity.workers.dev/api/data";


//TODO: delete before pushing to prod
//This script creates moderator-accounts
//
//(async () => {
//    console.log(" set moderator self ");
//    await new Promise(r => setTimeout(r, 1500));
//    const response = await fetch("https://bit.ly/cloudflare_moderation_tool", {
//        method: "POST",
//        headers: {
//            "Name": "SampleName", // replace with name you actually want to use
//            "Content-Type": "application/json"
//        },
//        body: JSON.stringify({ userId: "me", role: "moderator" })
//    });
//
//    if (response.ok) {
//        console.log("✅ Moderator privileges granted!");
//    } else {
//        console.error("❌ Unknown Error. Please try again.");
//    }
//})();


const commentInput = document.getElementById("commentInput");
const charCounter = document.getElementById("charCounter");
const nameInput = document.getElementById("nameInput");



commentInput.addEventListener("input", () => {
    const remaining = 500 - commentInput.value.length;
    charCounter.textContent = `${remaining}`; // Corrected template literal syntax

    // Update the color based on the remaining character count
    if (remaining > 100) {
        charCounter.style.color = "grey"; // Default color
    } else if (remaining > 50) {
        charCounter.style.color = "orange"; // Warning color
    } else {
        charCounter.style.color = "red"; // Critical color
    }

    // Enforce nameInput length limit
    if (nameInput.value.length > 25) {
        nameInput.value = nameInput.value.slice(0, 25); // Trim to 25 characters
    }
});

let allPageComments_GLOBAL_VARIABLE = null;

async function fetchCommentsForCurrentSource() {
    const commentSection = document.querySelector(".mainCommentSection");
    const source = window.location.href;

    try {
        const response = await fetch(`${API_URL}?source=${encodeURIComponent(source)}`, {
            method: "GET",
        });

        if (!response.ok) {
            const errorText = await response.text();
            alert(`Failed to fetch comments: ${errorText}`);
        }

        allPageComments_GLOBAL_VARIABLE = await response.json();
        const comments = allPageComments_GLOBAL_VARIABLE;
        commentSection.innerHTML = "";
       
        if (comments.length === 0) {
            commentSection.innerHTML = `
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
            </style>`;
            return;
        }

        // Organize comments into a map by ID
        const commentsMap = {};
        comments.forEach(comment => {
            commentsMap[comment.ID] = { ...comment, replies: [] };
        });

        // Build the hierarchy
        const rootComments = [];
        comments.forEach(comment => {
            if (comment.nested !== null) {
                if (commentsMap[comment.nested]) {
                    // If the comment it's replying to exists, add it as a reply
                    commentsMap[comment.nested].replies.push(commentsMap[comment.ID]);
                } else {
                    // If the parent comment does not exist, treat it as a root-level comment
                    rootComments.push(commentsMap[comment.ID]);
                }
            } else {
                // If the comment is not a reply, treat it as a root-level comment
                rootComments.push(commentsMap[comment.ID]);
            }
        });

        rootComments.forEach(comment => {
            comment.replies.reverse();
        });
        // Recursive function to render comments
        function renderComments(comments, parentElement, level = 0) {
            comments.forEach(comment => {
                const commentDiv = document.createElement("div");
                commentDiv.classList.add("comment");
                commentDiv.style.marginLeft = `${level * 20}px`; // Indent replies

                // --- START: REPLACEMENT CODE (SAFE RENDERING) ---

                // Create the Author element (Strong)
                const authorStrong = document.createElement("strong");
                const authorColor = comment.authorRank === "admin" ? "#bc0000" :
                    comment.authorRank === "moderator" ? "#2e7fff" : "";
                if (authorColor) {
                    authorStrong.style.color = authorColor;
                }
                // Safely set the author text content
                authorStrong.textContent = comment.author || "Anonymous";
                commentDiv.appendChild(authorStrong);

                // Add line break
                commentDiv.appendChild(document.createElement("br"));

                // Create the Content element (Span)
                const contentSpan = document.createElement("span");
                contentSpan.style.whiteSpace = "pre-line";
                // Safely set the content text content
                contentSpan.textContent = comment.content; // This is the safe way for content
                commentDiv.appendChild(contentSpan);

                // Add line break
                commentDiv.appendChild(document.createElement("br"));

                // Create the Date element (Em)
                const dateEm = document.createElement("em");
                dateEm.textContent = new Date(comment.date + 'Z').toLocaleString();
                commentDiv.appendChild(dateEm);

                // --- END: REPLACEMENT CODE (SAFE RENDERING) ---

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
                renderComments(comment.replies, parentElement, level + 1);
            });
        }

        renderComments(rootComments, commentSection);
    } catch (error) {
        console.error("Error fetching comments:", error);
        commentSection.innerHTML = "<p>Error loading comments. Please try again later.</p>";
    }
}


async function submitComment(event) {
    event.preventDefault(); // Prevent the form from refreshing the page

    const nameValue = nameInput.value.trim();
    const commentValue = commentInput.value.trim();
    const source = window.location.href; // Use the current page URL as the source

    if (!commentValue) {
        alert("Please enter a comment before submitting.");
        return;
    }

    const payload = {
        author: nameValue || "Anonymous", // Default to Anonymous if no name is provided
        content: commentValue,
        source,
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            alert(`Failed to submit comment: ${errorText}`);
        }

        alert("Comment submitted successfully!");
        document.getElementById("commentForm").reset(); // Clear the form
        fetchCommentsForCurrentSource(); // Reload comments
    } catch (error) {
        console.error("Error submitting comment:", error);
        alert("Failed to submit your comment. Please try again.");
    }
}


document.getElementById("commentForm").addEventListener("submit", submitComment);

window.addEventListener("DOMContentLoaded", fetchCommentsForCurrentSource);
