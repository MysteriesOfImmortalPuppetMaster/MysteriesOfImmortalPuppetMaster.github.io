function saveBG() {
    const selector = document.getElementById("bgSelector");
    const input = document.getElementById("customBGInput");

    let selectedBG;

    if (selector.value === "custom") {
        selectedBG = input.value.trim();
        if (!selectedBG) return;
    } else {
        selectedBG = selector.value;
    }

    if (!selectedBG) {
        localStorage.removeItem("customBG");
    } else {
        localStorage.setItem("customBG", selectedBG);
    }

    applySavedBG();
}
function applySavedBG() {
    const savedBG = localStorage.getItem("customBG");

    if (!savedBG) return;

    document.body.classList.add("custom-bg");
    document.body.style.backgroundImage = `url("${savedBG}")`;

    const selector = document.getElementById("bgSelector");

    if (bgOptions.includes(savedBG)) {
        selector.value = savedBG;
    } else {
        selector.value = "custom";
        document.getElementById("customBGInput").value = savedBG;
        document.getElementById("customBGInput").style.display = "block";
    }
}


document.addEventListener("DOMContentLoaded", () => {
    preloadBGImages();
    applySavedBG();
});


function handleBGChange() {
    const selector = document.getElementById("bgSelector");
    const input = document.getElementById("customBGInput");

    input.style.display = selector.value === "custom"
        ? "block"
        : "none";
}


const bgOptions = [
    "https://raw.githubusercontent.com/MysteriesOfImmortalPuppetMaster/MysteriesOfImmortalPuppetMaster.github.io/28df10fde9edf26b126494f2dec5085c78361ab9/settings/night-sky.jpg",
    "https://raw.githubusercontent.com/MysteriesOfImmortalPuppetMaster/MysteriesOfImmortalPuppetMaster.github.io/28df10fde9edf26b126494f2dec5085c78361ab9/settings/tree.jpg",
    "https://raw.githubusercontent.com/MysteriesOfImmortalPuppetMaster/MysteriesOfImmortalPuppetMaster.github.io/28df10fde9edf26b126494f2dec5085c78361ab9/settings/hong-Kong-skyline.jpg"
];

function preloadBGImages() {
    bgOptions.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}