let audioCtx;
let analyser;
let animationRunning = false;
let isPlaying = false;

const folderSelect = document.getElementById('folderSelect');

const playPauseBtn = document.getElementById('playPauseBtn');
const currentTimeSpan = document.getElementById('currentTime');
const totalTimeSpan = document.getElementById('totalTime');
const volumeControl = document.getElementById('volumeControl');
const progressBar = document.getElementById('progressBar');
const progressBarContainer = document.getElementById('progressBarContainer');
const visualizerCanvas = document.getElementById('visualizer');
const canvasCtx = visualizerCanvas.getContext('2d');

const currentAudio = document.getElementById('currentAudio');
const nextAudio = document.getElementById('nextAudio');
let URL;

// We'll track the currently selected folder in a separate variable
let currentFolder = null;

let chunkFiles = [];
let chunkDurations = [];
let chunkBaseTimes = [];
let totalTrackLength = 0;
let currentChunkIndex = 0;

window.addEventListener('load', () => {
    console.log("Window loaded. Attempting to load url...");
    const pathname = window.location.pathname;
    const segments = pathname.split('/');


    const playerContainer = document.querySelector('.player-container');
    URL = playerContainer.getAttribute('audio-src');
    loadURLMetadata(URL)

});





async function loadURLMetadata(URL) {
    resetPlayer(); // always reset before loading new metadata
    currentFolder = URL; // store globally for consistent access
    console.log(`[loadURLMetadata] Attempting to load metadata from URL: ${URL}`);

    try {
        // Fetch metadata
        const metadataUrl = `${URL}/audio_metadata.json`;
        console.log(`[loadURLMetadata] Fetching JSON: ${metadataUrl}`);

        const resp = await fetch(metadataUrl);
        if (!resp.ok) {
            console.error(`[loadURLMetadata] Could not fetch audio_metadata.json: status=${resp.status}`);
            return;
        }
        const metadata = await resp.json();
        console.log("[loadURLMetadata] Received metadata:", metadata);

        // Reset arrays and variables
        chunkFiles = [];
        chunkDurations = [];
        chunkBaseTimes = [];
        totalTrackLength = 0;
        currentChunkIndex = 0;

        // Populate chunkFiles & chunkDurations
        metadata.audio_files.forEach((obj) => {
            chunkFiles.push(obj.file);
            chunkDurations.push(obj.duration);
        });

        // Build chunkBaseTimes
        for (let i = 0; i < chunkDurations.length; i++) {
            chunkBaseTimes[i] = i === 0 ? 0 : chunkBaseTimes[i - 1] + chunkDurations[i - 1];
        }

        // Update total track length and display
        totalTrackLength = metadata.total_duration;
        totalTimeSpan.textContent = formatTime(totalTrackLength);

        // Clear audio sources to prevent pre-fetching
        currentAudio.removeAttribute('src');
        nextAudio.removeAttribute('src');
        console.log("[loadURLMetadata] Cleared audio sources to prevent pre-fetching.");

    } catch (error) {
        console.error("[loadURLMetadata] Error:", error);
    }
}

playPauseBtn.addEventListener('click', () => {
    console.log("[playPauseBtn] Clicked. isPlaying currently:", isPlaying);

    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    if (isPlaying) {
        currentAudio.pause();
        playPauseBtn.textContent = '▶';
    } else {
        // Check if sources need to be set up (first play)
        if (!currentAudio.src) {
            currentAudio.src = `${URL}/${chunkFiles[0]}`;
            console.log("[playPauseBtn] Set currentAudio.src to:", currentAudio.src);
            if (chunkFiles.length > 1) {
                nextAudio.src = `${URL}/${chunkFiles[1]}`;
                console.log("[playPauseBtn] Preloaded nextAudio.src to:", nextAudio.src);
            }
        }

        connectAnalyser(currentAudio);
        currentAudio.play().catch(err => console.error("[playPauseBtn] Play error:", err));
        playPauseBtn.textContent = '⏸';
    }

    isPlaying = !isPlaying;
});

volumeControl.addEventListener('input', (ev) => {
    const vol = ev.target.value;
    console.log(`[volumeControl] Volume changed to ${vol}`);
    currentAudio.volume = vol;
    nextAudio.volume = vol;
});

currentAudio.addEventListener('ended', () => {
    console.log("[currentAudio ended] Reached end of chunk index:", currentChunkIndex);
    handleChunkEnded();
});

function handleChunkEnded() {
    console.log("[handleChunkEnded] Fired. currentChunkIndex before increment:", currentChunkIndex);
    currentChunkIndex++;
    console.log("[handleChunkEnded] currentChunkIndex after increment:", currentChunkIndex);

    if (currentChunkIndex < chunkFiles.length) {
        console.log("[handleChunkEnded] We still have chunks left. Setting currentAudio.src to nextAudio.src");
        currentAudio.src = nextAudio.src; // the chunk we already preloaded
        currentAudio.currentTime = 0;
        connectAnalyser(currentAudio);

        // Preload the next chunk (if available)
        const nextIndex = currentChunkIndex + 1;
        if (nextIndex < chunkFiles.length) {
            nextAudio.src = `${URL}/${chunkFiles[nextIndex]}`;
            nextAudio.currentTime = 0;
            console.log("[handleChunkEnded] nextAudio.src set to:", nextAudio.src);
        } else {
            nextAudio.removeAttribute('src');
            console.log("[handleChunkEnded] No more chunks to preload, removing src from nextAudio.");
        }

        if (isPlaying) {
            console.log("[handleChunkEnded] Attempting to continue playback automatically...");
            currentAudio.play().catch((err) => console.error("[handleChunkEnded] Play error after chunk switch:", err));
        } else {
            console.log("[handleChunkEnded] Not playing automatically because isPlaying=false.");
        }
    } else {
        console.log("[handleChunkEnded] No more chunks in chunkFiles. Resetting player...");
        resetPlayer();
    }
}

currentAudio.addEventListener('timeupdate', () => {
    updateProgressUI();
});

progressBarContainer.addEventListener('click', (e) => {
    console.log("[progressBarContainer] Clicked. Doing manual scrub...");
    if (!chunkFiles.length) {
        console.log("[progressBarContainer] No chunkFiles loaded, ignoring.");
        return;
    }
    const rect = progressBarContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const ratio = clickX / width;
    const targetGlobalTime = ratio * totalTrackLength;

    console.log(`[progressBarContainer] ratio=${ratio.toFixed(3)}, targetGlobalTime=${targetGlobalTime.toFixed(3)}`);

    let newIndex = 0;
    for (let i = 0; i < chunkBaseTimes.length; i++) {
        const start = chunkBaseTimes[i];
        const end = start + chunkDurations[i];
        if (targetGlobalTime >= start && targetGlobalTime < end) {
            newIndex = i;
            break;
        }
    }
    console.log("[progressBarContainer] Determined newIndex based on global time:", newIndex);

    // If we've jumped to a different chunk, update sources
    if (newIndex !== currentChunkIndex) {
        console.log("[progressBarContainer] Changing from chunkIndex", currentChunkIndex, "to", newIndex);
        currentChunkIndex = newIndex;
        currentAudio.src = `${URL}/${chunkFiles[newIndex]}`;
        currentAudio.currentTime = 0;

        const nextIndex = currentChunkIndex + 1;
        if (nextIndex < chunkFiles.length) {
            nextAudio.src = `${URL}/${chunkFiles[nextIndex]}`;
        } else {
            nextAudio.removeAttribute('src');
        }
    }

    const chunkStartTime = chunkBaseTimes[currentChunkIndex];
    currentAudio.currentTime = targetGlobalTime - chunkStartTime;
    console.log("[progressBarContainer] Setting currentAudio.currentTime to:", currentAudio.currentTime);

    if (isPlaying) {
        console.log("[progressBarContainer] Attempting to play after manual scrub...");
        currentAudio.play().catch(err => console.error("[progressBarContainer] Play error:", err));
    }
});

function updateProgressUI() {
    if (!chunkFiles.length) return;

    const chunkStart = chunkBaseTimes[currentChunkIndex] || 0;
    const globalTime = chunkStart + currentAudio.currentTime;
    currentTimeSpan.textContent = formatTime(globalTime);

    if (totalTrackLength > 0) {
        const progressPct = (globalTime / totalTrackLength) * 100;
        progressBar.style.width = progressPct + '%';
    }
}

let sourceNodeMap = new Map(); // To keep track of existing source nodes

function connectAnalyser(audioElem) {
    console.log("[connectAnalyser] Setting up analyser for audioElem:", audioElem.src);

    if (!audioCtx) {
        console.log("[connectAnalyser] Creating new AudioContext...");
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        console.log("[connectAnalyser] Resuming AudioContext...");
        audioCtx.resume();
    }

    if (!analyser) {
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        console.log("[connectAnalyser] Created new analyser.");
    }

    // Check if the audio element already has a source node
    if (!sourceNodeMap.has(audioElem)) {
        console.log("[connectAnalyser] Creating new MediaElementSourceNode for:", audioElem.src);
        const sourceNode = audioCtx.createMediaElementSource(audioElem);
        sourceNode.connect(analyser);
        analyser.connect(audioCtx.destination);

        // Save the source node to reuse later
        sourceNodeMap.set(audioElem, sourceNode);
    } else {
        console.log("[connectAnalyser] Reusing existing MediaElementSourceNode for:", audioElem.src);
    }

    // Start visualization if not already running
    if (!animationRunning) {
        console.log("[connectAnalyser] Starting visualization loop...");
        animationRunning = true;
        visualize();
    }
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function resetPlayer() {
    console.log("[resetPlayer] Called. Stopping audio, resetting UI...");
    isPlaying = false;
    playPauseBtn.textContent = '▶';
    currentTimeSpan.textContent = '0:00';
    progressBar.style.width = '0%';

    // Stop and reset the audio elements
    currentAudio.pause();
    currentAudio.currentTime = 0;
    nextAudio.pause();
    nextAudio.currentTime = 0;

    // We don't clear chunkFiles here because we might want to reuse them
    // if the user wants to press play again. If you want to fully flush state:
    // chunkFiles = [];
    // chunkDurations = [];
    // chunkBaseTimes = [];
    // currentChunkIndex = 0;
    // totalTrackLength = 0;
}

function visualize() {
    if (!analyser) {
        animationRunning = false;
        console.log("[visualize] Analyser not set, stopping animation loop.");
        return;
    }
    requestAnimationFrame(visualize);

    const width = visualizerCanvas.width;
    const height = visualizerCanvas.height;
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    analyser.getByteTimeDomainData(dataArray);

    // Calculate the min and max amplitude
    const minAmplitude = Math.min(...dataArray);
    const maxAmplitude = Math.max(...dataArray);

    // Calculate the normalization factor to scale the waveform to the full height
    const amplitudeRange = maxAmplitude - minAmplitude;
    const normalizationFactor = amplitudeRange > 0 ? (height / amplitudeRange) : 1;

    canvasCtx.clearRect(0, 0, width, height);
    canvasCtx.fillStyle = 'transparent'; // Background color
    canvasCtx.fillRect(0, 0, width, height);

    canvasCtx.lineWidth = 2;
    // Create a gradient for the stroke
    const gradient = canvasCtx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, "#00bfff"); // Light blue
    gradient.addColorStop(0.5, "#1e90ff"); // Medium blue
    gradient.addColorStop(1, "red"); // Light blue
    canvasCtx.strokeStyle = gradient;

    const centerY = height / 2; // Center line of the canvas
    const sliceWidth = width / bufferLength;
    let x = 0;

    canvasCtx.beginPath();
    for (let i = 0; i < bufferLength; i++) {
        const v = (dataArray[i] / 128.0 - 1) * normalizationFactor; // Scale and normalize to range -1 to 1
        const y = centerY - v * (height / 2); // Scale to canvas height

        if (i === 0) {
            canvasCtx.moveTo(x, y);
        } else {
            canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
    }
    canvasCtx.stroke();
}