const API_URL = "https://comments.puppetinsanity-gov.workers.dev/api/data";

const commentInput = document.getElementById("commentInput");
const charCounter = document.getElementById("charCounter");
const nameInput = document.getElementById("nameInput");



commentInput.addEventListener("input", () => {
    const remaining = 250 - commentInput.value.length;
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

async function fetchCommentsForCurrentSource() {
    const commentSection = document.querySelector(".mainCommentSection");
    const source = window.location.href;

    try {
        const response = await fetch(`${API_URL}?source=${encodeURIComponent(source)}`, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch comments: ${response.status}`);
        }

        const comments = await response.json();
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


                const authorColor = comment.authorRank === "admin" ? "#bc0000" :
                    comment.authorRank === "moderator" ? "#2e7fff" : "";

                commentDiv.innerHTML = `
            <strong style="color: ${authorColor};">${comment.author || "Anonymous"}</strong><br/>
            <span>${comment.content}</span><br/>
            <em>${new Date(comment.date).toLocaleString()}</em>
        `;

                // Add reply button only if the comment is not a reply itself
                if (comment.nested === null) {
                    const replyButton = document.createElement("button");
                    replyButton.textContent = "↩ reply";
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
                        replyTextarea.maxLength = 250;


                        replyBoxDiv.appendChild(replyTextarea);

                        const charCounter = document.createElement("span");
                        charCounter.textContent = "250";
                        charCounter.style.color = "grey"; // Initial color
                        charCounter.style.fontSize = "14px"; // Optional: Adjust font size
                        charCounter.style.marginTop = "5px"; // Optional: Add spacing
                        charCounter.style.position = "relative";
                        charCounter.style.bottom = "8px";
                        charCounter.style.right = "40px";
                        replyBoxDiv.appendChild(charCounter);

                        replyTextarea.addEventListener("input", () => {
                            const remaining = 250 - replyTextarea.value.length;
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
                                    throw new Error(`Failed to submit reply: ${response.status}`);
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
            throw new Error(`Failed to submit comment: ${response.status}`); // Fixed error message syntax
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
