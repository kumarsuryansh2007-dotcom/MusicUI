/**
 * AuraStream - Premium Core Frontend Architecture Model
 * Mock Playback Engine and Micro-interactions Configuration
 */

// ==========================================
// 1. RAW DATA DICTIONARY STATE (10 TRACK DECK)
// ==========================================
const trackDeck = [
    { id: 1, title: "Midnight Melancholy", artist: "Neon Horizon", duration: "3:45", seconds: 225, art: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80" },
    { id: 2, title: "Cybernetic Oasis", artist: "Vector Prime", duration: "4:12", seconds: 252, art: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=150&q=80" },
    { id: 3, title: "After Hours Dreamer", artist: "Glitch Mobius", duration: "2:58", seconds: 178, art: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=150&q=80" },
    { id: 4, title: "Tokyo Drift Neon", artist: "Harajuku Ghost", duration: "3:21", seconds: 201, art: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=150&q=80" },
    { id: 5, title: "Retrograde Descent", artist: "Starlight Voyager", duration: "5:04", seconds: 304, art: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=150&q=80" },
    { id: 6, title: "Sublime Resonance", artist: "Nebula Echo", duration: "3:33", seconds: 213, art: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80" },
    { id: 7, title: "Synthetic Rainfalls", artist: "Chroma Shift", duration: "2:45", seconds: 165, art: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=150&q=80" },
    { id: 8, title: "Glitch In The System", artist: "Pixel Rogue", duration: "4:01", seconds: 241, art: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=150&q=80" },
    { id: 9, title: "Aura Horizon Wave", artist: "Solaris Sun", duration: "3:15", seconds: 195, art: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=150&q=80" },
    { id: 10, title: "Overdrive Core", artist: "Cyberpunk Syndicate", duration: "3:52", seconds: 232, art: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=150&q=80" }
];

// ==========================================
// 2. STATE MANAGER DECLARATIONS
// ==========================================
let currentTrackIndex = 0;
let isPlaying = false;
let currentPlaybackSeconds = 78; // Start point seed data
let playbackInterval = null;
let isShuffle = false;
let isRepeat = false;

// DOM Target Handlers
const mainTrackArt = document.getElementById("main-track-art");
const mainTrackTitle = document.getElementById("main-track-title");
const mainTrackArtist = document.getElementById("main-track-artist");
const visualizer = document.getElementById("visualizer-container");

const footerArt = document.getElementById("footer-art");
const footerTitle = document.getElementById("footer-title");
const footerArtist = document.getElementById("footer-artist");

const btnPlayPause = document.getElementById("btn-play-pause");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const btnShuffle = document.getElementById("btn-shuffle");
const btnRepeat = document.getElementById("btn-repeat");

const currentTimeDisplay = document.getElementById("current-time");
const totalDurationDisplay = document.getElementById("total-duration");
const progressTimelineFill = document.getElementById("progress-timeline-fill");
const progressScrubber = document.getElementById("progress-scrubber");

const volumeScrubber = document.getElementById("volume-scrubber");
const volumeFill = document.getElementById("volume-fill");
const volumeIcon = document.getElementById("volume-icon");
const queueTracksContainer = document.getElementById("queue-tracks-container");

// ==========================================
// 3. INITIALIZATION ORCHESTRATION ENGINE
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    buildQueueUI();
    loadTrack(currentTrackIndex);
    setupEventListeners();
    updateTimelineUI();
});

// Render Queue List Items Dom Tree
function buildQueueUI() {
    queueTracksContainer.innerHTML = "";
    trackDeck.forEach((track, index) => {
        const item = document.createElement("div");
        item.className = `queue-item ${index === currentTrackIndex ? 'active' : ''}`;
        item.setAttribute("data-index", index);

        item.innerHTML = `
            <img src="${track.art}" alt="Thumb" class="q-thumb">
            <div class="q-meta">
                <div class="q-title">${track.title}</div>
                <div class="q-artist">${track.artist}</div>
            </div>
            <div class="q-duration">${track.duration}</div>
        `;

        item.addEventListener("click", () => {
            currentTrackIndex = index;
            loadTrack(currentTrackIndex);
            playTrack();
        });

        queueTracksContainer.appendChild(item);
    });
    document.getElementById("queue-count").innerText = `${trackDeck.length} Tracks`;
}

// ==========================================
// 4. AUDIO DECK CONTROL INTERFACE STRATEGIES
// ==========================================
function loadTrack(index) {
    const track = trackDeck[index];

    // Core Elements Update Matrix
    mainTrackTitle.innerText = track.title;
    mainTrackArtist.innerText = track.artist;
    mainTrackArt.src = track.art;

    footerTitle.innerText = track.title;
    footerArtist.innerText = track.artist;
    footerArt.src = track.art;

    totalDurationDisplay.innerText = track.duration;
    currentPlaybackSeconds = 0;

    // Realign active states on layout lists
    document.querySelectorAll(".queue-item").forEach((el, idx) => {
        el.classList.toggle("active", idx === index);
    });

    updateTimelineUI();
}

function togglePlayPause() {
    if (isPlaying) {
        pauseTrack();
    } else {
        playTrack();
    }
}

function playTrack() {
    isPlaying = true;
    btnPlayPause.innerHTML = `<i class="fa-solid fa-pause"></i>`;
    mainTrackArt.classList.remove("paused");
    visualizer.classList.add("playing");

    // Clear existing loop trackers before instantiation
    clearInterval(playbackInterval);
    playbackInterval = setInterval(() => {
        const currentTrack = trackDeck[currentTrackIndex];
        if (currentPlaybackSeconds < currentTrack.seconds) {
            currentPlaybackSeconds++;
            updateTimelineUI();
        } else {
            handleTrackEnding();
        }
    }, 1000);
}

function pauseTrack() {
    isPlaying = false;
    btnPlayPause.innerHTML = `<i class="fa-solid fa-play"></i>`;
    mainTrackArt.classList.add("paused");
    visualizer.classList.remove("playing");
    clearInterval(playbackInterval);
}

function handleTrackEnding() {
    if (isRepeat) {
        currentPlaybackSeconds = 0;
        updateTimelineUI();
    } else {
        nextTrack();
    }
}

function nextTrack() {
    if (isShuffle) {
        currentTrackIndex = Math.floor(Math.random() * trackDeck.length);
    } else {
        currentTrackIndex = (currentTrackIndex + 1) % trackDeck.length;
    }
    loadTrack(currentTrackIndex);
    if (isPlaying) playTrack();
}

function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + trackDeck.length) % trackDeck.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) playTrack();
}

// ==========================================
// 5. SCRUBBERS AND VISUAL TIMELINE RENDERING
// ==========================================
function updateTimelineUI() {
    const currentTrack = trackDeck[currentTrackIndex];

    // Compute Text Layout Timestamp
    const mins = Math.floor(currentPlaybackSeconds / 60);
    const secs = currentPlaybackSeconds % 60;
    currentTimeDisplay.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    // Percent calculation Matrix
    const percent = (currentPlaybackSeconds / currentTrack.seconds) * 100;
    progressScrubber.value = percent || 0;
    progressTimelineFill.style.width = `${percent}%`;
}

// ==========================================
// 6. EVENT INTERACTION HANDLERS REGISTRATION
// ==========================================
function setupEventListeners() {
    btnPlayPause.addEventListener("click", togglePlayPause);
    btnNext.addEventListener("click", nextTrack);
    btnPrev.addEventListener("click", prevTrack);

    btnShuffle.addEventListener("click", () => {
        isShuffle = !isShuffle;
        btnShuffle.classList.toggle("active", isShuffle);
    });

    btnRepeat.addEventListener("click", () => {
        isRepeat = !isRepeat;
        btnRepeat.classList.toggle("active", isRepeat);
    });

    // Timeline Seek Interaction
    progressScrubber.addEventListener("input", (e) => {
        const currentTrack = trackDeck[currentTrackIndex];
        const targetPercent = e.target.value;
        currentPlaybackSeconds = Math.floor((targetPercent / 100) * currentTrack.seconds);
        updateTimelineUI();
    });

    // Sound Mixer / Vol Sliders
    volumeScrubber.addEventListener("input", (e) => {
        const volVal = e.target.value;
        volumeFill.style.width = `${volVal}%`;

        // Dynamic Icon adaptation matrix transformation
        if (volVal == 0) {
            volumeIcon.className = "fa-solid fa-volume-xmark";
        } else if (volVal < 40) {
            volumeIcon.className = "fa-solid fa-volume-low";
        } else {
            volumeIcon.className = "fa-solid fa-volume-high";
        }
    });

    // Liked Toggle Heart Micro Interaction
    const heartBtn = document.getElementById("footer-like");
    heartBtn.addEventListener("click", () => {
        heartBtn.classList.toggle("active");
    });

    // Category chips click micro-interactions
    document.querySelectorAll(".chip").forEach(chip => {
        chip.addEventListener("click", () => {
            document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
        });
    });
}