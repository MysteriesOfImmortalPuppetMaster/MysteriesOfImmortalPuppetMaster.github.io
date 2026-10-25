let audioCtx;
let analyser;
let gainNode;
let isPlaying = false;
let isSeeking = false;

const playerContainer = document.querySelector('.player-container');
const playPauseBtn = document.getElementById('playPauseBtn');
const folderInfo = document.getElementById('folderInfo');
const currentTimeSpan = document.getElementById('currentTime');
const totalTimeSpan = document.getElementById('totalTime');
const volumeControl = document.getElementById('volumeControl');
const volumeIcon = document.querySelector('.player-container .audio-icon');
const progressBar = document.getElementById('progressBar');
const progressBarContainer = document.getElementById('progressBarContainer');
const seekArea = document.querySelector('.player-container .smlbox');
const visualizerCanvas = document.getElementById('visualizer');
const canvasCtx = visualizerCanvas.getContext('2d');

const currentAudio = document.getElementById('currentAudio');
const nextAudio = document.getElementById('nextAudio');

// audio-src is ".../audioStash/<chapter folder>". The chapter whose audio is loaded can
// differ from the page's chapter: while the page is hidden the player moves on to the
// next chapter in place, and only switches pages once the reader is back.
const PAGE_AUDIO_URL = playerContainer.getAttribute('audio-src').replace(/\/+$/, '');
const AUDIO_ROOT_URL = PAGE_AUDIO_URL.replace(/[^\/]+$/, '');
const PAGE_FOLDER = PAGE_AUDIO_URL.split('/').pop();
let audioFolder = PAGE_FOLDER;
let audioBaseUrl = PAGE_AUDIO_URL;
let audioChapterTitle = '';

let chunkFiles = [];
let chunkDurations = [];
let chunkBaseTimes = [];
let totalTrackLength = 0;
let currentChunkIndex = 0;
let playbackSpeed = 1;
let lastSourceSwap = 0;

const PLAY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.8-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14z"/></svg>';
const PAUSE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm6.8 0H17a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-3.2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/></svg>';
const VOLUME_HIGH_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
const VOLUME_LOW_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>';
const VOLUME_OFF_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.990-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>';
// Both arcs are circles of r=8 around (12, 13); the digit's baseline sits half a cap height below that centre
const SKIP_BACK_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5A8 8 0 1 1 4 13"/><polyline points="14.5 2.5 12 5 14.5 7.5"/><text x="12" y="15.9" font-size="8" font-weight="700" text-anchor="middle" fill="currentColor" stroke="none" font-family="Arimo, sans-serif">5</text></svg>';
const SKIP_FORWARD_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5A8 8 0 1 0 20 13"/><polyline points="9.5 2.5 12 5 9.5 7.5"/><text x="12" y="15.9" font-size="8" font-weight="700" text-anchor="middle" fill="currentColor" stroke="none" font-family="Arimo, sans-serif">5</text></svg>';

const VOLUME_STORAGE_KEY = 'audio_volume';
const UNMUTED_VOLUME_STORAGE_KEY = 'audio_volume_unmuted';
const RESUME_STORAGE_KEY = 'audio_resume';  // sessionStorage: carries playback over page changes
const RESUME_MAX_AGE_MS = 60 * 1000;
const SKIP_SECONDS = 5;
const BOOK_TITLE = 'Mysteries Of Immortal Puppet Master';

window.addEventListener('load', async () => {
    const resume = takeResumeState();
    const ok = await loadChapterAudio(PAGE_FOLDER);
    if (!ok) {
        removePlayer("no audio metadata");
        return;
    }
    audioChapterTitle = cleanTitle(document.querySelector('#chapterHeadline h2')?.textContent || document.title);
    updateMediaMetadata();

    if (resume) {
        // Same chapter (a reload, or coming back after it moved on in the background):
        // continue where it was. Another chapter: start that one from the top.
        if (resume.folder === PAGE_FOLDER && resume.time > 0) {
            seekTo(resume.time);
        }
        if (resume.playing) {
            startPlayback(false);
        }
    }
});

// Every chapter page ships with the player, but a chapter's audio only exists once the
// TTS GitHub Action has run (or never, if it failed). Without metadata there is nothing
// to play, so take the player off the page instead of showing a dead one.
function removePlayer(reason) {
    console.warn(`[removePlayer] No audio for this chapter (${reason}); removing the player.`);
    if (playerContainer) {
        playerContainer.remove();
        floatPlaceholder.remove();
    }
}

function cleanTitle(title) {
    return title.replace(/\[\^\d+\]/g, '').trim();
}

// Loads a chapter's chunk list into the player. Returns false if it has no audio.
async function loadChapterAudio(folder) {
    const baseUrl = AUDIO_ROOT_URL + folder;
    console.log(`[loadChapterAudio] Loading metadata from ${baseUrl}`);

    try {
        const resp = await fetch(`${baseUrl}/audio_metadata.json`);
        if (!resp.ok) {
            console.error(`[loadChapterAudio] Could not fetch audio_metadata.json: status=${resp.status}`);
            return false;
        }
        const metadata = await resp.json();
        if (!metadata || !Array.isArray(metadata.audio_files) || metadata.audio_files.length === 0) {
            console.error("[loadChapterAudio] Metadata lists no audio files");
            return false;
        }

        resetPlayer();
        audioFolder = folder;
        audioBaseUrl = baseUrl;
        chunkFiles = metadata.audio_files.map((obj) => obj.file);
        chunkDurations = metadata.audio_files.map((obj) => obj.duration);
        chunkBaseTimes = [];
        for (let i = 0; i < chunkDurations.length; i++) {
            chunkBaseTimes[i] = i === 0 ? 0 : chunkBaseTimes[i - 1] + chunkDurations[i - 1];
        }
        currentChunkIndex = 0;

        totalTrackLength = metadata.total_duration;
        totalTimeSpan.textContent = formatTime(totalTrackLength);
        progressBarContainer.setAttribute('aria-valuemax', Math.round(totalTrackLength));

        // Nothing is fetched until the first play
        currentAudio.removeAttribute('src');
        nextAudio.removeAttribute('src');
        updatePositionState();
        return true;
    } catch (error) {
        // Network failure, CORS problem or invalid JSON.
        console.error("[loadChapterAudio] Error:", error);
        return false;
    }
}

function chunkUrl(index) {
    return `${audioBaseUrl}/${chunkFiles[index]}`;
}

// Points currentAudio at a chunk and preloads the one after it
function loadChunk(index) {
    currentChunkIndex = index;
    lastSourceSwap = performance.now();
    currentAudio.src = chunkUrl(index);
    if (index + 1 < chunkFiles.length) {
        nextAudio.src = chunkUrl(index + 1);
    } else {
        nextAudio.removeAttribute('src');
    }
}

function setPlayingState(playing) {
    isPlaying = playing;
    playPauseBtn.innerHTML = playing ? PAUSE_ICON : PLAY_ICON;
    playPauseBtn.setAttribute('aria-label', playing ? 'Pause narration' : 'Play narration');
    playerContainer.classList.toggle('is-playing', playing);
    if (playing) {
        setNeedsTap(false);
    } else {
        playerContainer.classList.remove('is-loading');
        pausedAtScrollY = window.scrollY;
    }
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
        updatePositionState();
    }
    startVisualizer();
    updateFloating();
}

// fromGesture: called from a click/tap, so audio may start and Web Audio may run.
// Otherwise (autoplay after a page change) the browser may refuse; then the play button
// pulses and waits for a tap.
function startPlayback(fromGesture) {
    if (!chunkFiles.length) return;
    if (!currentAudio.src) {
        loadChunk(currentChunkIndex);
    }
    connectAnalyser(currentAudio, fromGesture);
    if (currentAudio.readyState < 3) {
        playerContainer.classList.add('is-loading');
    }
    currentAudio.play().catch((err) => {
        console.error("[startPlayback] Play error:", err);
        if (err.name === 'NotAllowedError') {
            setPlayingState(false);
            setNeedsTap(true);
        }
    });
    setPlayingState(true);
}

function pausePlayback() {
    currentAudio.pause();
    setPlayingState(false);
}

function setNeedsTap(needed) {
    playerContainer.classList.toggle('needs-tap', needed);
    folderInfo.textContent = needed ? 'Press play to keep listening' : '';
}

playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
        pausePlayback();
    } else {
        startPlayback(true);
    }
});

// --- Skip buttons (built here, the chapter pages only contain the play button) ---

function makeSkipButton(icon, label, seconds) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'skip-btn';
    btn.innerHTML = icon;
    btn.setAttribute('aria-label', label);
    btn.title = label;
    btn.addEventListener('click', () => skipBy(seconds));
    return btn;
}

function skipBy(seconds) {
    if (!chunkFiles.length) return;
    seekTo(currentGlobalTime() + seconds);
    revealNarration(false);
}

playPauseBtn.before(makeSkipButton(SKIP_BACK_ICON, `Back ${SKIP_SECONDS} seconds`, -SKIP_SECONDS));
playPauseBtn.after(makeSkipButton(SKIP_FORWARD_ICON, `Forward ${SKIP_SECONDS} seconds`, SKIP_SECONDS));

currentAudio.addEventListener('waiting', () => {
    if (isPlaying) playerContainer.classList.add('is-loading');
});
currentAudio.addEventListener('playing', () => playerContainer.classList.remove('is-loading'));
currentAudio.addEventListener('canplay', () => playerContainer.classList.remove('is-loading'));

// Paused from outside the player (headphones unplugged, another app took the audio...).
// A finished chunk or a source swap also fires 'pause'; those are not real pauses.
currentAudio.addEventListener('pause', () => {
    if (!isPlaying || currentAudio.ended || isSeeking) return;
    if (performance.now() - lastSourceSwap < 1000) return;
    setPlayingState(false);
});

currentAudio.addEventListener('ended', () => {
    console.log("[currentAudio ended] Reached end of chunk index:", currentChunkIndex);
    handleChunkEnded();
});

function handleChunkEnded() {
    currentChunkIndex++;

    if (currentChunkIndex < chunkFiles.length) {
        lastSourceSwap = performance.now();
        currentAudio.src = nextAudio.src; // the chunk we already preloaded
        currentAudio.currentTime = 0;

        const nextIndex = currentChunkIndex + 1;
        if (nextIndex < chunkFiles.length) {
            nextAudio.src = chunkUrl(nextIndex);
        } else {
            nextAudio.removeAttribute('src');
        }

        if (isPlaying) {
            currentAudio.play().catch((err) => console.error("[handleChunkEnded] Play error after chunk switch:", err));
        }
    } else if (isPlaying) {
        // Audiobook style: carry on with the next chapter
        console.log("[handleChunkEnded] Chapter finished, moving on to the next one.");
        changeChapter(1, true).then((moved) => {
            if (!moved) finishChapter(); // last chapter, or the next one has no audio yet
        });
    } else {
        finishChapter();
    }
}

// End of the audio with nowhere to go: back to the start, stopped
function finishChapter() {
    resetPlayer();
    currentChunkIndex = 0;
    currentAudio.removeAttribute('src');
    nextAudio.removeAttribute('src');
    setHighlightedParagraph(null);
}

currentAudio.addEventListener('timeupdate', () => {
    if (!isSeeking) updateProgressUI();
});

// --- Changing chapters while listening ---

async function getChapterList() {
    if (typeof GLOBAL_ALL_CHAPTERS_JSON !== 'undefined' && Array.isArray(GLOBAL_ALL_CHAPTERS_JSON)) {
        return GLOBAL_ALL_CHAPTERS_JSON;
    }
    try {
        const resp = await fetch('../../chapters.json');
        return resp.ok ? await resp.json() : null;
    } catch (e) {
        return null;
    }
}

async function getNeighbourChapter(offset) {
    const chapters = await getChapterList();
    if (!chapters) return null;
    const index = chapters.findIndex((c) => c.filename.replace('.txt', '') === audioFolder);
    const target = index === -1 ? null : chapters[index + offset];
    return target ? { folder: target.filename.replace('.txt', ''), title: cleanTitle(target.title) } : null;
}

function chapterPageUrl(folder) {
    return new URL(`../${encodeURIComponent(folder)}/`, window.location.href).href;
}

function writeResumeState(state) {
    try {
        sessionStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify({ ...state, at: Date.now() }));
    } catch (e) { /* storage unavailable */ }
    resumeStateWritten = true;
}

function takeResumeState() {
    try {
        const raw = sessionStorage.getItem(RESUME_STORAGE_KEY);
        sessionStorage.removeItem(RESUME_STORAGE_KEY);
        const state = raw ? JSON.parse(raw) : null;
        if (state && Date.now() - state.at < RESUME_MAX_AGE_MS) return state;
    } catch (e) { /* storage unavailable */ }
    return null;
}

// A visible page simply navigates (the next page picks the audio up again). A hidden
// page (locked phone, background tab) keeps playing the next chapter right here, because
// a freshly loaded page in the background is usually not allowed to start audio.
// Returns false if there is no chapter to go to.
async function changeChapter(offset, keepPlaying) {
    const target = await getNeighbourChapter(offset);
    if (!target) return false;

    if (document.visibilityState === 'visible') {
        writeResumeState({ folder: target.folder, time: 0, playing: keepPlaying });
        window.location.href = chapterPageUrl(target.folder);
        return true;
    }

    const ok = await loadChapterAudio(target.folder);
    if (!ok) return false;
    audioChapterTitle = target.title;
    updateMediaMetadata();
    if (keepPlaying) startPlayback(false);
    return true;
}

// Back on the page after it moved on to another chapter: open that chapter's page
function syncPageWithAudio() {
    if (audioFolder === PAGE_FOLDER || document.visibilityState !== 'visible') return;
    writeResumeState({ folder: audioFolder, time: currentGlobalTime(), playing: isPlaying });
    window.location.href = chapterPageUrl(audioFolder);
}

document.addEventListener('visibilitychange', syncPageWithAudio);
window.addEventListener('focus', syncPageWithAudio);

// Leaving the page while listening: the next page continues (see the load handler)
let resumeStateWritten = false;
window.addEventListener('pagehide', () => {
    if (isPlaying && !resumeStateWritten) {
        writeResumeState({ folder: audioFolder, time: currentGlobalTime(), playing: true });
    }
});

// Restored from the back/forward cache: the browser paused the audio meanwhile
window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    resumeStateWritten = false;
    takeResumeState();
    if (isPlaying && currentAudio.paused) setPlayingState(false);
});

// --- Lock screen / notification controls ---

function updateMediaMetadata() {
    if (!('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;
    navigator.mediaSession.metadata = new MediaMetadata({
        title: audioChapterTitle || BOOK_TITLE,
        artist: BOOK_TITLE,
        album: BOOK_TITLE,
        artwork: [{ src: new URL('../../cover50.webp', window.location.href).href, type: 'image/webp' }],
    });
}

let lastPositionStateUpdate = 0;

function updatePositionState(force = true) {
    if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
    if (!force && performance.now() - lastPositionStateUpdate < 1000) return;
    lastPositionStateUpdate = performance.now();
    try {
        if (totalTrackLength > 0) {
            navigator.mediaSession.setPositionState({
                duration: totalTrackLength,
                playbackRate: playbackSpeed,
                position: Math.min(Math.max(currentGlobalTime(), 0), totalTrackLength),
            });
        }
    } catch (e) { /* invalid state while a chunk loads */ }
}

if ('mediaSession' in navigator) {
    const handlers = {
        play: () => startPlayback(true),
        pause: () => pausePlayback(),
        stop: () => pausePlayback(),
        seekbackward: (d) => skipBy(-(d.seekOffset || SKIP_SECONDS)),
        seekforward: (d) => skipBy(d.seekOffset || SKIP_SECONDS),
        seekto: (d) => {
            seekTo(d.seekTime);
            revealNarration(false);
        },
        previoustrack: () => changeChapter(-1, isPlaying),
        nexttrack: () => changeChapter(1, isPlaying),
    };
    for (const [action, handler] of Object.entries(handlers)) {
        try {
            navigator.mediaSession.setActionHandler(action, handler);
        } catch (e) { /* action not supported by this browser */ }
    }
}

// --- Floating player: pinned to the top of the screen once scrolled past while playing ---

const floatPlaceholder = document.createElement('div');
floatPlaceholder.className = 'player-placeholder';
playerContainer.before(floatPlaceholder);

let isFloating = false;
let pausedAtScrollY = 0;
let floatCheckQueued = false;

function setFloating(floating) {
    if (floating === isFloating) return;
    if (floating) {
        // Keep the player's space in the page so the text doesn't jump
        const style = getComputedStyle(playerContainer);
        floatPlaceholder.style.height = (playerContainer.offsetHeight + parseFloat(style.marginTop)) + 'px';
    } else {
        floatPlaceholder.style.height = '';
    }
    isFloating = floating;
    playerContainer.classList.toggle('is-floating', floating);
}

function updateFloating() {
    if (!playerContainer.isConnected) return;
    const anchor = isFloating ? floatPlaceholder : playerContainer;
    const scrolledPast = anchor.getBoundingClientRect().bottom < 0;

    if (!scrolledPast) {
        setFloating(false);
    } else if (isPlaying) {
        setFloating(true);
    } else if (isFloating && Math.abs(window.scrollY - pausedAtScrollY) > 150) {
        // Paused while floating: stay for a resume, leave once the reader scrolls on
        setFloating(false);
    }
}

window.addEventListener('scroll', () => {
    if (floatCheckQueued) return;
    floatCheckQueued = true;
    requestAnimationFrame(() => {
        floatCheckQueued = false;
        updateFloating();
    });
}, { passive: true });

// --- Seeking (click/drag on the waveform or the bar, arrow keys on the bar) ---

function globalTimeFromPointer(e) {
    const rect = seekArea.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    return ratio * totalTrackLength;
}

function seekTo(targetGlobalTime) {
    if (!chunkFiles.length) return;
    targetGlobalTime = Math.min(Math.max(targetGlobalTime, 0), totalTrackLength - 0.05);

    let newIndex = chunkBaseTimes.length - 1;
    for (let i = 0; i < chunkBaseTimes.length; i++) {
        const start = chunkBaseTimes[i];
        const end = start + chunkDurations[i];
        if (targetGlobalTime >= start && targetGlobalTime < end) {
            newIndex = i;
            break;
        }
    }

    // If we've jumped to a different chunk (or nothing is loaded yet), update sources
    if (newIndex !== currentChunkIndex || !currentAudio.src) {
        loadChunk(newIndex);
    }

    currentAudio.currentTime = targetGlobalTime - chunkBaseTimes[currentChunkIndex];
    showProgress(targetGlobalTime);
    updatePositionState();

    if (isPlaying) {
        currentAudio.play().catch(err => console.error("[seekTo] Play error:", err));
    }
}

seekArea.addEventListener('pointerdown', (e) => {
    if (!chunkFiles.length || e.button !== 0) return;
    isSeeking = true;
    playerContainer.classList.add('is-seeking');
    seekArea.setPointerCapture(e.pointerId);
    showProgress(globalTimeFromPointer(e));
    revealNarration(false);
});

seekArea.addEventListener('pointermove', (e) => {
    if (!isSeeking) return;
    showProgress(globalTimeFromPointer(e));
    revealNarration(true);
});

function endSeek(e, commit) {
    if (!isSeeking) return;
    isSeeking = false;
    playerContainer.classList.remove('is-seeking');
    if (commit) {
        seekTo(globalTimeFromPointer(e));
    } else {
        updateProgressUI();
    }
}

seekArea.addEventListener('pointerup', (e) => endSeek(e, true));
seekArea.addEventListener('pointercancel', (e) => endSeek(e, false));

progressBarContainer.setAttribute('tabindex', '0');
progressBarContainer.setAttribute('role', 'slider');
progressBarContainer.setAttribute('aria-label', 'Seek');
progressBarContainer.setAttribute('aria-valuemin', '0');
progressBarContainer.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    e.stopPropagation(); // the page uses the arrow keys for previous/next chapter
    skipBy(e.key === 'ArrowRight' ? SKIP_SECONDS : -SKIP_SECONDS);
});

function currentGlobalTime() {
    return (chunkBaseTimes[currentChunkIndex] || 0) + currentAudio.currentTime;
}

function updateProgressUI() {
    if (!chunkFiles.length) return;
    showProgress(currentGlobalTime());
}

let progressRatio = 0;

function showProgress(globalTime) {
    currentTimeSpan.textContent = formatTime(globalTime);
    progressRatio = totalTrackLength > 0 ? Math.min(globalTime / totalTrackLength, 1) : 0;
    progressBar.style.width = (progressRatio * 100) + '%';
    progressBarContainer.setAttribute('aria-valuenow', Math.round(globalTime));
    progressBarContainer.setAttribute('aria-valuetext', `${formatTime(globalTime)} of ${formatTime(totalTrackLength)}`);
    startVisualizer();
    updateReadAlong(globalTime);
}

// --- Volume (remembered across chapters) ---

let volume = 0.5;
let volumeBeforeMute = 0.5;

function loadSavedVolume(key) {
    try {
        const saved = parseFloat(localStorage.getItem(key));
        if (!isNaN(saved) && saved >= 0 && saved <= 1) return saved;
    } catch (e) { /* storage unavailable */ }
    return 0.5;
}

function setVolume(v, save = true) {
    volume = v;
    volumeControl.value = v;
    volumeControl.style.setProperty('--fill', (v * 100) + '%');

    if (gainNode) {
        // Once audio runs through Web Audio the gain node does the work, which also
        // works on iOS where media element volume is read-only.
        gainNode.gain.value = v;
        currentAudio.volume = 1;
        nextAudio.volume = 1;
    } else {
        currentAudio.volume = v;
        nextAudio.volume = v;
    }

    volumeIcon.innerHTML = v === 0 ? VOLUME_OFF_ICON : v < 0.5 ? VOLUME_LOW_ICON : VOLUME_HIGH_ICON;
    volumeIcon.setAttribute('aria-label', v === 0 ? 'Unmute' : 'Mute');

    if (save) {
        try { localStorage.setItem(VOLUME_STORAGE_KEY, String(v)); } catch (e) { /* storage unavailable */ }
    }
}

volumeControl.setAttribute('aria-label', 'Volume');
volumeControl.addEventListener('input', (ev) => {
    setVolume(parseFloat(ev.target.value));
});

volumeIcon.setAttribute('role', 'button');
volumeIcon.setAttribute('tabindex', '0');
function toggleMute() {
    if (volume > 0) {
        volumeBeforeMute = volume;
        try { localStorage.setItem(UNMUTED_VOLUME_STORAGE_KEY, String(volume)); } catch (e) { /* storage unavailable */ }
        setVolume(0);
    } else {
        setVolume(volumeBeforeMute > 0 ? volumeBeforeMute : 0.5);
    }
}
volumeIcon.addEventListener('click', toggleMute);
volumeIcon.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMute();
    }
});

setVolume(loadSavedVolume(VOLUME_STORAGE_KEY), false);
volumeBeforeMute = volume > 0 ? volume : loadSavedVolume(UNMUTED_VOLUME_STORAGE_KEY);

// --- Playback speed (remembered across chapters) ---
// The chapter pages don't contain this row, so it is built here.

const SPEED_STORAGE_KEY = 'audio_speed';
const SPEED_MIN = 0.5;
const SPEED_MAX = 2.5;
const SPEED_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44zm-9.79 6.84a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z"/></svg>';

const speedContainer = document.createElement('div');
speedContainer.className = 'speed-container';
speedContainer.innerHTML = `
    <span class="audio-icon speed-icon" role="button" tabindex="0" title="Reset to 1x" aria-label="Reset speed to 1x">${SPEED_ICON}</span>
    <input type="range" id="speedControl" min="${SPEED_MIN}" max="${SPEED_MAX}" step="0.05" value="1" aria-label="Playback speed">
    <span class="speed-value" aria-hidden="true">1x</span>
`;
const volumeContainer = document.querySelector('.player-container .volume-container');
const playerExtras = document.createElement('div');
playerExtras.className = 'player-extras';
volumeContainer.before(playerExtras);
playerExtras.append(volumeContainer, speedContainer);

const speedControl = document.getElementById('speedControl');
const speedIcon = speedContainer.querySelector('.speed-icon');
const speedValue = speedContainer.querySelector('.speed-value');

function setSpeed(rate, save = true) {
    rate = Math.round(Math.min(Math.max(rate, SPEED_MIN), SPEED_MAX) * 100) / 100;
    speedControl.value = rate;
    speedControl.style.setProperty('--fill', ((rate - SPEED_MIN) / (SPEED_MAX - SPEED_MIN) * 100) + '%');
    speedControl.setAttribute('aria-valuetext', `${rate}x`);
    speedValue.textContent = `${rate}x`;
    playbackSpeed = rate;

    // defaultPlaybackRate survives the src swaps between chunks, playbackRate does not
    for (const audio of [currentAudio, nextAudio]) {
        audio.defaultPlaybackRate = rate;
        audio.playbackRate = rate;
    }

    if (save) {
        try { localStorage.setItem(SPEED_STORAGE_KEY, String(rate)); } catch (e) { /* storage unavailable */ }
    }
    updatePositionState();
}

function loadSavedSpeed() {
    try {
        const saved = parseFloat(localStorage.getItem(SPEED_STORAGE_KEY));
        if (!isNaN(saved) && saved >= SPEED_MIN && saved <= SPEED_MAX) return saved;
    } catch (e) { /* storage unavailable */ }
    return 1;
}

speedControl.addEventListener('input', (ev) => setSpeed(parseFloat(ev.target.value)));
speedIcon.addEventListener('click', () => setSpeed(1));
speedIcon.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setSpeed(1);
    }
});

setSpeed(loadSavedSpeed(), false);

// --- Web Audio graph: source -> analyser -> gain -> speakers ---

let sourceNodeMap = new Map(); // To keep track of existing source nodes

function connectAnalyser(audioElem, fromGesture = true) {
    if (!audioCtx) {
        // Without a user gesture (autoplay after a page change) the context can start
        // suspended, and audio routed into a suspended context is silent. In that case
        // the element plays directly and the next tap on the player wires this up.
        const activated = fromGesture || (navigator.userActivation && navigator.userActivation.isActive);
        const ctx = new AudioContext();
        if (ctx.state !== 'running' && !activated) {
            ctx.close();
            return;
        }
        audioCtx = ctx;
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    if (!analyser) {
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.8;
        gainNode = audioCtx.createGain();
        analyser.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        setVolume(volume, false);
    }

    // Check if the audio element already has a source node
    if (!sourceNodeMap.has(audioElem)) {
        const sourceNode = audioCtx.createMediaElementSource(audioElem);
        sourceNode.connect(analyser);
        sourceNodeMap.set(audioElem, sourceNode);
    }
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ss = `${s < 10 ? '0' : ''}${s}`;
    return h > 0 ? `${h}:${m < 10 ? '0' : ''}${m}:${ss}` : `${m}:${ss}`;
}

function resetPlayer() {
    console.log("[resetPlayer] Called. Stopping audio, resetting UI...");
    currentAudio.pause();
    currentAudio.currentTime = 0;
    nextAudio.pause();
    nextAudio.currentTime = 0;
    setPlayingState(false);
    showProgress(0);
}

// --- Read-along: highlight the paragraph being narrated ---
// The audio has no timestamps, so this is an estimate. tts/tts_book.py cuts every audio
// chunk at a sentence boundary, so the chapter's sentences are first shared out over the
// chunks so each chunk's text length fits its duration; inside a chunk the position is
// then interpolated by characters, with the narrator's pauses after the title and
// between paragraphs. Cheap enough to run on any phone: it is all arithmetic.

// Pause model, tuned against silences decoded from the published audio of 8 chapters
// (99.9% of the time the right paragraph is highlighted). The pause after each sentence
// counts as extra characters; the paragraph pause is what comes on top of that.
const TITLE_PAUSE = 1.3;       // seconds
const PARAGRAPH_PAUSE = 0.2;   // seconds
const SENTENCE_WEIGHT = 8;     // characters
const QUOTE_MAX = 480;         // as in tts/text_prep.py
const READ_GLOW_WIDTH = 220;   // px; wide and faint on purpose, so the estimate's error doesn't show
const READ_GLOW_MAX_LINE_SHARE = 0.55; // on narrow screens: at most this much of a line
const MAX_UNITS_PER_CHUNK = 40;
const SENTENCE_END = /([.!?…]+[”’"')\]]*)\s+/;
const CJK_CHARS = /[぀-ヿ㐀-䶿一-鿿豈-﫿＀-￯]+/g;

let readAlong = null;            // estimate for the page's chapter, built on first use
let highlightedParagraph = null;

function speakableText(text) {
    return text.replace(/\[\^[^\]]*\]/g, '').replace(CJK_CHARS, '').replace(/\s+/g, ' ').trim();
}

function splitSentences(paragraph) {
    // split() with one group yields [text, end, text, end, ..., text], like the Python
    const parts = paragraph.split(SENTENCE_END);
    const out = [];
    for (let i = 0; i < parts.length; i += 2) {
        const s = (parts[i] + (parts[i + 1] || '')).trim();
        if (s) out.push(s);
    }
    return out;
}

function countChar(s, ch) {
    return s.split(ch).length - 1;
}

// Quotations stay in one piece, so a chunk never ends inside one
function mergeQuotes(sentences) {
    const out = [];
    let buf = '', curly = 0, straight = false;
    for (const s of sentences) {
        if (buf && buf.length + 1 + s.length > QUOTE_MAX) {
            out.push(buf);
            buf = ''; curly = 0; straight = false;
        }
        buf = buf ? `${buf} ${s}` : s;
        curly += countChar(s, '“') - countChar(s, '”');
        if (countChar(s, '"') % 2 === 1) straight = !straight;
        if (curly <= 0 && !straight) {
            out.push(buf);
            buf = ''; curly = 0; straight = false;
        }
    }
    if (buf) out.push(buf);
    return out;
}

// The narrated text as units (sentences, or quotes) in reading order
function buildUnits() {
    const units = [];
    const addParagraph = (el, text, pauseBefore) => {
        mergeQuotes(splitSentences(text)).forEach((s, i) => {
            units.push({ el, weight: s.length + SENTENCE_WEIGHT, pauseBefore: i === 0 ? pauseBefore : 0 });
        });
    };

    // The narration starts with "Chapter N: Title."
    const title = speakableText(document.querySelector('#chapterHeadline h2')?.textContent || '');
    if (title) addParagraph(null, /[.!?…:;,]$/.test(title) ? title : title + '.', 0);

    let pause = title ? TITLE_PAUSE : 0;
    for (const el of document.querySelectorAll('#chapterContent paragraph')) {
        const text = speakableText(el.textContent);
        if (/^Notes:?$/i.test(text) || /^\[\^/.test(el.textContent.trim())) break; // footnotes aren't read
        if (!/\w/.test(text)) continue;
        addParagraph(el, text, pause);
        pause = PARAGRAPH_PAUSE;
    }

    // Where each unit sits inside its paragraph, for the glow that moves through it
    let i = 0;
    while (i < units.length) {
        let j = i, total = 0;
        while (j < units.length && units[j].el === units[i].el) total += units[j++].weight;
        for (let offset = 0; i < j; i++) {
            units[i].paraOffset = offset;
            units[i].paraWeight = total;
            offset += units[i].weight;
        }
    }
    return units;
}

// Splits the units over the chunks so each chunk's predicted duration is close to its
// real one. Dynamic programming over (chunk, last unit); tiny for a chapter.
function assignUnitsToChunks(units, durations) {
    const n = units.length, m = durations.length;
    if (m === 0 || n < m) return null;

    const cumWeight = [0], cumPause = [0];
    units.forEach((u, i) => {
        cumWeight.push(cumWeight[i] + u.weight);
        cumPause.push(cumPause[i] + u.pauseBefore);
    });
    const totalDuration = durations.reduce((a, b) => a + b, 0);
    const rate = cumWeight[n] / Math.max(totalDuration - cumPause[n], 1); // weight per second

    // A chunk's own first pause isn't in its audio
    const predicted = (a, b) => (cumWeight[b] - cumWeight[a]) / rate + (cumPause[b] - cumPause[a] - units[a].pauseBefore);

    let prev = new Float64Array(n + 1).fill(Infinity);
    prev[0] = 0;
    const from = [];
    for (let k = 0; k < m; k++) {
        const cur = new Float64Array(n + 1).fill(Infinity);
        const back = new Int32Array(n + 1).fill(-1);
        for (let b = k + 1; b <= n - (m - 1 - k); b++) {
            for (let a = Math.max(k, b - MAX_UNITS_PER_CHUNK); a < b; a++) {
                if (prev[a] === Infinity) continue;
                const diff = predicted(a, b) - durations[k];
                const cost = prev[a] + diff * diff;
                if (cost < cur[b]) {
                    cur[b] = cost;
                    back[b] = a;
                }
            }
        }
        from.push(back);
        prev = cur;
    }
    if (prev[n] === Infinity) return null;

    const bounds = new Array(m + 1);
    bounds[m] = n;
    for (let k = m - 1; k >= 0; k--) bounds[k] = from[k][bounds[k + 1]];

    return durations.map((d, k) => {
        const a = bounds[k], b = bounds[k + 1];
        const pauses = cumPause[b] - cumPause[a] - units[a].pauseBefore;
        const speech = d - pauses;
        return {
            first: a,
            end: b,
            // Each chunk gets its own speaking rate, so drift never carries over
            rate: speech > 0.5 ? (cumWeight[b] - cumWeight[a]) / speech : rate,
        };
    });
}

function buildReadAlong() {
    const units = buildUnits();
    const chunks = assignUnitsToChunks(units, chunkDurations);
    return chunks ? { units, chunks } : null;
}

// Which unit is being spoken at a time inside a chunk, and how far into it (0..1)
function unitAt(chunkIndex, timeInChunk) {
    const { units, chunks } = readAlong;
    const chunk = chunks[chunkIndex];
    if (!chunk) return null;
    let t = 0;
    for (let i = chunk.first; i < chunk.end; i++) {
        if (i > chunk.first) t += units[i].pauseBefore;
        const length = units[i].weight / chunk.rate;
        if (timeInChunk < t) return { unit: units[i], frac: 0 };  // in the pause before it
        if (timeInChunk < t + length) return { unit: units[i], frac: (timeInChunk - t) / length };
        t += length;
    }
    return { unit: units[chunk.end - 1], frac: 1 };
}

function setHighlightedParagraph(el) {
    if (el === highlightedParagraph) return;
    const previous = highlightedParagraph;
    if (previous) {
        previous.classList.remove('read-along-active');
        previous.style.backgroundSize = '';
        previous.style.backgroundPosition = '';
    }
    if (el) el.classList.add('read-along-active');
    highlightedParagraph = el;
    followParagraph(previous, el);
}

// While the narration moves on by itself, scroll along only if the reader was looking at
// the narrated paragraph; someone who scrolled elsewhere is left alone
function followParagraph(previous, el) {
    if (!previous || !el) return;
    const viewTop = isFloating ? playerContainer.getBoundingClientRect().bottom : 0;
    const prev = previous.getBoundingClientRect();
    if (prev.bottom < viewTop || prev.top > window.innerHeight) return;
    scrollParagraphIntoView(el, false);
}

// Moving along the timeline while listening always brings the narrated paragraph into
// view. instant: while dragging, where a smooth scroll would never catch up.
function revealNarration(instant) {
    if (!isPlaying || !highlightedParagraph) return;
    scrollParagraphIntoView(highlightedParagraph, instant);
}

function scrollParagraphIntoView(el, instant) {
    const viewTop = isFloating ? playerContainer.getBoundingClientRect().bottom : 0;
    const viewBottom = window.innerHeight;
    const rect = el.getBoundingClientRect();
    if (rect.top >= viewTop + 8 && rect.bottom <= viewBottom - 40) return;
    const target = window.scrollY + rect.top - viewTop - (viewBottom - viewTop) * 0.2;
    try {
        window.scrollTo({ top: target, behavior: instant ? 'auto' : 'smooth' });
    } catch (e) {
        window.scrollTo(0, target);
    }
}

function updateReadAlong(globalTime) {
    // Only for the page's own chapter, and only once listening has started
    if (audioFolder !== PAGE_FOLDER || !currentAudio.hasAttribute('src') || !chunkFiles.length) {
        setHighlightedParagraph(null);
        return;
    }
    if (!readAlong) {
        readAlong = buildReadAlong();
        if (!readAlong) return;
    }
    let k = chunkBaseTimes.length - 1;
    while (k > 0 && chunkBaseTimes[k] > globalTime) k--;
    const at = unitAt(k, globalTime - chunkBaseTimes[k]);
    setHighlightedParagraph(at ? at.unit.el : null);
    if (at && at.unit.el) placeReadGlow(at.unit.el, (at.unit.paraOffset + at.frac * at.unit.weight) / at.unit.paraWeight);
}

// Moves the faint glow to the estimated spot in the paragraph (done: 0..1). The
// paragraph's background is "sliced", so its lines form one long strip and an x offset
// along that strip lands on the right line.
function placeReadGlow(el, done) {
    let stripWidth = 0, lineWidth = 0;
    for (const rect of el.getClientRects()) {
        stripWidth += rect.width;
        lineWidth = Math.max(lineWidth, rect.width);
    }
    const glowWidth = Math.min(READ_GLOW_WIDTH, lineWidth * READ_GLOW_MAX_LINE_SHARE);
    const x = done * stripWidth - glowWidth / 2;
    el.style.backgroundSize = `${glowWidth.toFixed(0)}px 0.6em, 100% 0.6em`;
    el.style.backgroundPosition = `${x.toFixed(1)}px 60%, 0 60%`;
}

// --- Visualizer ---
// Not a faithful spectrum: bars ease toward a mirrored, blurred version of the frequency
// data on top of a static "waveform" shape, so it moves smoothly and looks calm when paused.

const BAR_WIDTH = 3;
const BAR_GAP = 2;
const EASE = 0.16;

let bars = [];        // current (drawn) heights, 0..1
let idleShape = [];   // resting heights, 0..1
let freqData = null;
let visualizerRunning = false;
let colors = {};

function readColors() {
    const style = getComputedStyle(playerContainer);
    const dim = parseFloat(style.getPropertyValue('--mp-wave-dim'));
    colors = {
        waveDim: isNaN(dim) ? 0.3 : dim,
    };
}

function resizeVisualizer() {
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = visualizerCanvas.clientWidth;
    const cssHeight = visualizerCanvas.clientHeight;
    if (!cssWidth || !cssHeight) return;
    playerContainer.style.setProperty('--mp-track-width', cssWidth + 'px');

    visualizerCanvas.width = Math.round(cssWidth * dpr);
    visualizerCanvas.height = Math.round(cssHeight * dpr);
    canvasCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(8, Math.floor((cssWidth + BAR_GAP) / (BAR_WIDTH + BAR_GAP)));
    idleShape = [];
    for (let i = 0; i < count; i++) {
        const h = 0.32
            + 0.2 * Math.sin(i * 0.21)
            + 0.14 * Math.sin(i * 0.53 + 1.7)
            + 0.1 * Math.sin(i * 1.31 + 0.4);
        idleShape.push(Math.min(Math.max(h, 0.1), 0.85));
    }
    bars = bars.length === count ? bars : idleShape.slice();
    drawBars();
}

function computeTargets() {
    const n = idleShape.length;
    if (!isPlaying || !analyser) return idleShape;

    if (!freqData || freqData.length !== analyser.frequencyBinCount) {
        freqData = new Uint8Array(analyser.frequencyBinCount);
    }
    analyser.getByteFrequencyData(freqData);

    // Mirror around the centre: low frequencies in the middle, highs toward the edges.
    // Speech lives in the lower bins, so only the first ~70 are used.
    const maxBin = Math.min(70, freqData.length - 1);
    const raw = new Array(n);
    for (let i = 0; i < n; i++) {
        const d = Math.abs(i / (n - 1) - 0.5) * 2;
        const pos = 1 + Math.pow(d, 1.4) * (maxBin - 1);
        const lo = Math.floor(pos);
        const frac = pos - lo;
        const v = (freqData[lo] * (1 - frac) + freqData[Math.min(lo + 1, maxBin)] * frac) / 255;
        raw[i] = Math.min(1, Math.pow(v, 1.6) * (1 + d * 0.9));
    }

    // Blur neighbours so adjacent bars never jump independently
    const targets = new Array(n);
    for (let i = 0; i < n; i++) {
        const a = raw[Math.max(i - 2, 0)], b = raw[Math.max(i - 1, 0)], c = raw[i];
        const d = raw[Math.min(i + 1, n - 1)], e = raw[Math.min(i + 2, n - 1)];
        const blurred = (a + 2 * b + 3 * c + 2 * d + e) / 9;
        targets[i] = Math.min(0.95, idleShape[i] * 0.35 + blurred * 0.85);
    }
    return targets;
}

function drawBars() {
    const width = visualizerCanvas.clientWidth;
    const height = visualizerCanvas.clientHeight;
    if (!width || !bars.length) return;

    canvasCtx.clearRect(0, 0, width, height);

    const n = bars.length;
    const step = width / n;
    const progressX = progressRatio * width;
    const gradient = canvasCtx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, "#00bfff"); // Light blue
    gradient.addColorStop(0.5, "#1e90ff"); // Medium blue
    gradient.addColorStop(1, "red");
    canvasCtx.fillStyle = gradient;

    for (let i = 0; i < n; i++) {
        const h = Math.max(2, bars[i] * height);
        const x = i * step + (step - BAR_WIDTH) / 2;
        const y = (height - h) / 2;
        // Already-played bars at full strength, the rest faded
        canvasCtx.globalAlpha = x + BAR_WIDTH / 2 <= progressX ? 1 : colors.waveDim;
        canvasCtx.beginPath();
        if (canvasCtx.roundRect) {
            canvasCtx.roundRect(x, y, BAR_WIDTH, h, BAR_WIDTH / 2);
        } else {
            canvasCtx.rect(x, y, BAR_WIDTH, h);
        }
        canvasCtx.fill();
    }
    canvasCtx.globalAlpha = 1;
}

function visualizerFrame() {
    const targets = computeTargets();
    let moving = false;
    for (let i = 0; i < bars.length; i++) {
        const diff = targets[i] - bars[i];
        bars[i] += diff * EASE;
        if (Math.abs(diff) > 0.002) moving = true;
    }
    drawBars();

    // Keep animating while playing, and after pausing until the bars have settled
    if (isPlaying || moving) {
        requestAnimationFrame(visualizerFrame);
    } else {
        visualizerRunning = false;
    }
}

function startVisualizer() {
    if (visualizerRunning) return;
    visualizerRunning = true;
    requestAnimationFrame(visualizerFrame);
}

readColors();
resizeVisualizer();
if (window.ResizeObserver) {
    new ResizeObserver(resizeVisualizer).observe(visualizerCanvas);
} else {
    window.addEventListener('resize', resizeVisualizer);
}
// The light/dark toggle swaps a class on <body>; pick up the new bar colours
new MutationObserver(() => { readColors(); drawBars(); })
    .observe(document.body, { attributes: true, attributeFilter: ['class'] });
