// Step 1: Get the UTC time string from the HTML <time> element
const utcTimeElement = document.getElementById("utcTime");
const utcTimeString = utcTimeElement.getAttribute("datetime");

// Step 2: Convert the UTC string into a JavaScript Date object
const utcDate = new Date(utcTimeString);

// Step 3: Convert the UTC date to the user's local timezone
const localTimeString = utcDate.toLocaleString();

// Step 4: Display the local time in the <div>
document.getElementById("localTime").textContent = `Local Time: ${localTimeString}`;
