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
    const source = window.location.href; // Use the current page URL as the source

    try {
        // Make a GET request to fetch comments for the current source
        const response = await fetch(
            `${API_URL}?source=${encodeURIComponent(source)}`, // Fixed the fetch URL syntax
            {
                method: "GET",
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch comments: ${response.status}`); // Fixed error message syntax
        }

        const comments = await response.json();

        // Clear the loading message
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

        // Build the comment list
        comments.forEach((comment) => {
            const commentDiv = document.createElement("div");
            commentDiv.classList.add("comment");

            // Fixed innerHTML template literal syntax
            commentDiv.innerHTML = `
                <strong>${comment.author || "Anonymous"}</strong><br/>
                <span>${comment.content}</span><br/>
                <em>${new Date(comment.date).toLocaleString()}</em>
            `;

            commentSection.appendChild(commentDiv);
        });
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
