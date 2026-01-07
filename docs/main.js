let CONFIG = {
    MULTIPLICATION_MIN: 6,
    MULTIPLICATION_MAX: 9,
    ADDITION_MIN: 1,
    ADDITION_MAX: 10,
    SUBTRACTION_MIN: 1,
    SUBTRACTION_MAX: 20,
    COMPARISON_LIMIT: 10000,
    FREQUENCIES: {
        MATH_VS_COMPARISON: 1.0,
        ADDITION_VS_MULTIPLICATION_VS_SUBTRACTION: [0, 1, 0],
        MATH_TYPE_STANDARD: 3,
        MATH_TYPE_LEFT: 1,
        MATH_TYPE_RIGHT: 1
    }
};

// Load config from localStorage if available
const savedConfig = localStorage.getItem('game-config');
if (savedConfig) {
    try {
        CONFIG = JSON.parse(savedConfig);
    } catch (e) {
        console.error("Failed to parse saved config", e);
    }
}

async function fetchConfig() {
    try {
        const response = await fetch('./config.json');
        if (response.ok) {
            CONFIG = await response.json();
            localStorage.setItem('game-config', JSON.stringify(CONFIG));
        }
    } catch (e) {
        // Silently fail as requested
        console.log("Failed to fetch remote config, using local/default ones.");
    }
}

fetchConfig();

const historyContainer = document.getElementById('history');
const messageElement = document.getElementById('message');
const scoreContainer = document.getElementById('score-container');
const installButton = document.getElementById('install-button');

let expectedValue = 0;
let activeInput = null;
let score = 0;
let audioCtx = null;
let deferredPrompt;

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => {
                console.log('SW registered!', reg);
                // Check for updates
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New content is available, reload the page
                            window.location.reload();
                        }
                    });
                });
            })
            .catch(err => console.log('SW registration failed: ', err));
    });
}

// Initial question
generateQuestion();

// Handle PWA installation
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI notify the user they can add to home screen
    installButton.style.display = 'block';
});

installButton.addEventListener('click', (e) => {
    // hide our user interface that shows our A2HS button
    installButton.style.display = 'none';
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
        } else {
            console.log('User dismissed the A2HS prompt');
        }
        deferredPrompt = null;
    });
});

window.addEventListener('appinstalled', (event) => {
    console.log('App was installed');
    installButton.style.display = 'none';
});
