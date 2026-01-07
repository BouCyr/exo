//preier message en dur pour la gestion du pluriel
const firstScore = "Bravo, ton premier point !";
const scoreMessages = [
    "Super ! {n} victoires !",
    "Bravo ! Déjà {n} points !",
    "Championne ! {n} réussis !", //TODO [cboucher][30/12/2025] Gestion fem/masc ?
    "Génial ! Score : {n} !",
    "Top ! Tu en as {n} !",
    "Incroyable ! {n} d'affilée !",
    "Extra ! {n} bonnes réponses !",
    "Magnifique ! {n} dans la poche !",
    "Trop fort ! Déjà {n} !",
    "Waouh ! {n} et ça continue !"
];

const neonClasses = ['neon-blue', 'neon-pink', 'neon-yellow', 'neon-green'];

function playDing() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    function playNote(freq, start, duration, volume) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'triangle'; // Milder than saw, richer than sine
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.05, start + duration);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(volume, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, start + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(start);
        osc.stop(start + duration);
    }

    // Upbeat "da-ding!" sound
    playNote(523.25, now, 0.15, 0.15); // C5
    playNote(783.99, now + 0.1, 0.3, 0.2); // G5
}

function updateScore() {
    score++;
    let msgTemplate = scoreMessages[(score - 1) % scoreMessages.length];
    if(score===1) {
        //passe passe pour la gestion du pluriel
        msgTemplate = firstScore;
    }
    scoreContainer.textContent = msgTemplate.replace('{n}', score);
    
    // Cycle neon colors
    scoreContainer.className = neonClasses[(score - 1) % neonClasses.length];

    if (score > 0) {
        scoreContainer.style.display = 'block';
    }
}

function onCorrectAnswer(element) {
    playDing();
    messageElement.textContent = 'Bravo !';
    messageElement.className = 'message success';
    if (element.tagName === 'INPUT') {
        element.readOnly = true;
    }
    updateScore();
    
    // Generate next question immediately to avoid losing focus
    generateQuestion();
    
    setTimeout(() => {
        messageElement.textContent = '';
    }, 400);
}
