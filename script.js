// ===== GLOBAL STATE =====
let soundEnabled = true;
let currentMode = 'clock';

let audioEnabled = false;
let audioCtx;

document.addEventListener('click', () => {
  if (!audioEnabled) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioEnabled = true;
    console.log("Audio unlocked 🔊");
  }
}, { once: true });

// ===== STOPWATCH STATE =====
let stopwatchStartTime = 0;
let stopwatchElapsed = 0;
let stopwatchInterval = null;
let stopwatchRunning = false;
let lapCount = 1;
let lapTimes = [];
let lastLapTime = 0;

// ===== TIMER STATE =====
let timerDuration = 300; // 5 minutes in seconds
let timerRemaining = 300;
let timerInterval = null;
let timerRunning = false;

// ===== FOCUS STATE =====
let focusDuration = 1500; // 25 minutes in seconds
let focusRemaining = 1500;
let focusInterval = null;
let focusRunning = false;
let focusType = 'focus';
let completedSessions = 0;
let totalFocusMinutes = 0;

// ===== DOM ELEMENTS =====
// Mode switching
const modeBtns = document.querySelectorAll('.mode-btn');
const modeContents = document.querySelectorAll('.mode-content');
const soundToggle = document.getElementById('sound-toggle');

// Clock
const clockCanvas = document.getElementById('clock-canvas');
const digitalTime = document.getElementById('digital-time');
const dateDisplay = document.getElementById('date-display');
let clockInterval = null;

// Stopwatch
const stopwatchDisplay = document.getElementById('display');
const startPauseBtn = document.getElementById('startPause');
const lapBtn = document.getElementById('lap');
const resetBtn = document.getElementById('reset');
const lapsList = document.getElementById('laps');
const lapStats = document.getElementById('lap-stats');
const fastestEl = document.getElementById('fastest');
const averageEl = document.getElementById('average');
const slowestEl = document.getElementById('slowest');

// Timer
const timerCanvas = document.getElementById('timer-canvas');
const timerDisplay = document.getElementById('timer-display');
const timerMinutesInput = document.getElementById('timer-minutes');
const timerSecondsInput = document.getElementById('timer-seconds');
const timerStartBtn = document.getElementById('timer-start');
const timerResetBtn = document.getElementById('timer-reset');
const timeAdjustBtns = document.querySelectorAll('.time-adjust');

// Focus
const focusCanvas = document.getElementById('focus-canvas');
const focusDisplay = document.getElementById('focus-display');
const focusLabel = document.getElementById('focus-label');
const focusStartBtn = document.getElementById('focus-start');
const focusResetBtn = document.getElementById('focus-reset');
const presetBtns = document.querySelectorAll('.preset-btn');
const sessionsEl = document.getElementById('sessions');
const totalTimeEl = document.getElementById('total-time');

// ===== UTILITY FUNCTIONS =====
function playSound(freq = 600, duration = 0.1) {
  if (!audioEnabled || !audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.frequency.value = freq;
  osc.type = "sine";

  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioCtx.currentTime + duration
  );

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}


function playClickSound() {
  if (!soundEnabled) return;
  playSound(800, 0.05);
}

function playStartSound() {
  if (!soundEnabled) return;
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Rising tone for start
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(600, audioContext.currentTime + 0.15);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
  } catch (e) {}
}

function playPauseSound() {
  if (!soundEnabled) return;
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Falling tone for pause
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(400, audioContext.currentTime + 0.15);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
  } catch (e) {}
}

function playLapSound() {
  if (!soundEnabled) return;
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Quick beep for lap
    oscillator.frequency.value = 1000;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.08);
  } catch (e) {}
}

function playResetSound() {
  if (!soundEnabled) return;
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Double beep for reset
    oscillator.frequency.value = 500;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.08);
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime + 0.12);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.25);
  } catch (e) {}
}

function playCompleteSound() {
  if (!soundEnabled) return;
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Triple ascending beep for completion
    [600, 800, 1000].forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      const startTime = audioContext.currentTime + (index * 0.15);
      gainNode.gain.setValueAtTime(0.2, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.2);
    });
  } catch (e) {}
}

function vibrate(pattern = 50) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

function formatStopwatchTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);
  
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
}

function formatTimerTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// ===== CLOCK MODE =====

function drawClock() {
  if (!clockCanvas) return;
  
  const ctx = clockCanvas.getContext('2d');
  const centerX = clockCanvas.width / 2;
  const centerY = clockCanvas.height / 2;
  const radius = 150;
  
  // Clear canvas
  ctx.clearRect(0, 0, clockCanvas.width, clockCanvas.height);
  
  const now = new Date();
  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();
  
  // Update digital time
  digitalTime.textContent = now.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  // Update date
  dateDisplay.textContent = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).toUpperCase();
  
  //  outer decorative circle
  ctx.strokeStyle = 'rgba(0, 255, 159, 0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 10, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Draw clock face
  ctx.strokeStyle = 'rgba(0, 255, 159, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Added inner circle 
  ctx.strokeStyle = 'rgba(0, 255, 159, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius - 30, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Draw minute markers (60 small lines)
  ctx.strokeStyle = 'rgba(0, 255, 159, 0.2)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 60; i++) {
    if (i % 5 !== 0) { // Skip hour positions
      const angle = (i * 6 - 90) * Math.PI / 180;
      const x1 = centerX + Math.cos(angle) * (radius - 8);
      const y1 = centerY + Math.sin(angle) * (radius - 8);
      const x2 = centerX + Math.cos(angle) * (radius - 3);
      const y2 = centerY + Math.sin(angle) * (radius - 3);
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }
  
  // Draw hour markers (thicker lines)
  ctx.strokeStyle = 'rgba(0, 255, 159, 0.5)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30 - 90) * Math.PI / 180;
    const x1 = centerX + Math.cos(angle) * (radius - 15);
    const y1 = centerY + Math.sin(angle) * (radius - 15);
    const x2 = centerX + Math.cos(angle) * (radius - 5);
    const y2 = centerY + Math.sin(angle) * (radius - 5);
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  
  //  Draw hour numbers 
  ctx.fillStyle = '#00ff9f';
  ctx.font = 'bold 16px Orbitron';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  for (let i = 1; i <= 12; i++) {
    const angle = (i * 30 - 90) * Math.PI / 180;
    const x = centerX + Math.cos(angle) * (radius - 35);
    const y = centerY + Math.sin(angle) * (radius - 35);
    ctx.fillText(i.toString(), x, y);
  }
  
  // Draw second hand (thin, fast-moving)
  const secondAngle = ((seconds + milliseconds / 1000) * 6 - 90) * Math.PI / 180;
  ctx.strokeStyle = '#00ff9f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(
    centerX + Math.cos(secondAngle) * (radius - 25),
    centerY + Math.sin(secondAngle) * (radius - 25)
  );
  ctx.stroke();
  
  // second hand tail 
  ctx.strokeStyle = 'rgba(0, 255, 159, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(
    centerX - Math.cos(secondAngle) * 20,
    centerY - Math.sin(secondAngle) * 20
  );
  ctx.stroke();
  
  // Draw minute hand
  const minuteAngle = ((minutes + seconds / 60) * 6 - 90) * Math.PI / 180;
  ctx.strokeStyle = 'rgba(0, 255, 159, 0.9)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(
    centerX + Math.cos(minuteAngle) * (radius - 40),
    centerY + Math.sin(minuteAngle) * (radius - 40)
  );
  ctx.stroke();
  
  // Draw hour hand
  const hourAngle = ((hours + minutes / 60) * 30 - 90) * Math.PI / 180;
  ctx.strokeStyle = 'rgba(0, 255, 159, 0.7)';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(
    centerX + Math.cos(hourAngle) * (radius - 70),
    centerY + Math.sin(hourAngle) * (radius - 70)
  );
  ctx.stroke();
  
  //Enhanced center dot with glow
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#00ff9f';
  ctx.fillStyle = '#00ff9f';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Add decorative dots at 12, 3, 6, 9 
  ctx.fillStyle = 'rgba(0, 255, 159, 0.4)';
  [0, 90, 180, 270].forEach(deg => {
    const angle = (deg - 90) * Math.PI / 180;
    const x = centerX + Math.cos(angle) * (radius - 25);
    const y = centerY + Math.sin(angle) * (radius - 25);
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
  });
}

function startClock() {
  drawClock();
  clockInterval = setInterval(drawClock, 50);
}

function stopClock() {
  if (clockInterval) {
    clearInterval(clockInterval);
    clockInterval = null;
  }
}

// ===== STOPWATCH MODE =====
function updateStopwatch() {
  stopwatchElapsed = Date.now() - stopwatchStartTime;
  stopwatchDisplay.textContent = formatStopwatchTime(stopwatchElapsed);
  
  // Animate hexagons
  const hexInner = document.querySelector('.hex-inner');
  if (stopwatchRunning && hexInner) {
    hexInner.classList.add('running');
  }
}

function startStopwatch() {
  stopwatchStartTime = Date.now() - stopwatchElapsed;
  stopwatchInterval = setInterval(updateStopwatch, 10);
  stopwatchRunning = true;
  startPauseBtn.innerHTML = '<span class="btn-text">PAUSE</span>';
  playStartSound();
  vibrate(50);
}

function pauseStopwatch() {
  clearInterval(stopwatchInterval);
  stopwatchRunning = false;
  startPauseBtn.innerHTML = '<span class="btn-text">RESUME</span>';
  
  const hexInner = document.querySelector('.hex-inner');
  if (hexInner) {
    hexInner.classList.remove('running');
  }
  
  playPauseSound();
  vibrate(50);
}

function resetStopwatch() {
  clearInterval(stopwatchInterval);
  stopwatchElapsed = 0;
  stopwatchRunning = false;
  lapCount = 1;
  lapTimes = [];
  lastLapTime = 0;
  
  stopwatchDisplay.textContent = '00:00.00';
  startPauseBtn.innerHTML = '<span class="btn-text">START</span>';
  lapsList.innerHTML = '';
  lapStats.classList.add('hidden');
  
  const hexInner = document.querySelector('.hex-inner');
  if (hexInner) {
    hexInner.classList.remove('running');
  }
  
  playResetSound();
  vibrate(100);
}

function addLap() {
  if (!stopwatchRunning) return;
  
  const currentLapTime = stopwatchElapsed - lastLapTime;
  lapTimes.push(currentLapTime);
  lastLapTime = stopwatchElapsed;
  
  const li = document.createElement('li');
  li.innerHTML = `
    <span class="lap-number">LAP ${lapCount++}</span>
    <span class="lap-time">${formatStopwatchTime(currentLapTime)}</span>
  `;
  lapsList.insertBefore(li, lapsList.firstChild);
  
  updateLapStats();
  playLapSound();
  vibrate([50, 50]);
}

function updateLapStats() {
  if (lapTimes.length === 0) {
    lapStats.classList.add('hidden');
    return;
  }
  
  lapStats.classList.remove('hidden');
  
  const fastest = Math.min(...lapTimes);
  const slowest = Math.max(...lapTimes);
  const average = lapTimes.reduce((a, b) => a + b, 0) / lapTimes.length;
  
  fastestEl.textContent = formatStopwatchTime(fastest);
  averageEl.textContent = formatStopwatchTime(average);
  slowestEl.textContent = formatStopwatchTime(slowest);
  
  // Highlight fastest and slowest
  const lapItems = lapsList.querySelectorAll('li');
  lapItems.forEach((li, index) => {
    const lapTime = lapTimes[lapTimes.length - 1 - index];
    li.classList.remove('fastest-lap', 'slowest-lap');
    
    if (lapTimes.length > 1) {
      if (lapTime === fastest) {
        li.classList.add('fastest-lap');
      } else if (lapTime === slowest) {
        li.classList.add('slowest-lap');
      }
    }
  });
}

// ===== TIMER MODE =====
function drawTimerProgress() {
  if (!timerCanvas) return;
  
  const ctx = timerCanvas.getContext('2d');
  const centerX = timerCanvas.width / 2;
  const centerY = timerCanvas.height / 2;
  const radius = 105;
  
  ctx.clearRect(0, 0, timerCanvas.width, timerCanvas.height);
  
  // Background circle
  ctx.strokeStyle = 'rgba(0, 217, 255, 0.2)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Progress arc
  const progress = timerRemaining / timerDuration;
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (2 * Math.PI * progress);
  
  ctx.strokeStyle = '#00ffaa';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, startAngle, endAngle);
  ctx.stroke();
}

function updateTimer() {
  timerRemaining--;
  timerDisplay.textContent = formatTimerTime(timerRemaining);
  drawTimerProgress();
  
  if (timerRemaining <= 0) {
    completeTimer();
  }
}

function startTimer() {
  if (timerRemaining <= 0) return;
  
  timerRunning = true;
  timerInterval = setInterval(updateTimer, 1000);
  timerStartBtn.innerHTML = '<span class="btn-text">PAUSE</span>';
  
  playStartSound();
  vibrate(50);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerStartBtn.innerHTML = '<span class="btn-text">RESUME</span>';
 
  playPauseSound();
  vibrate(50);
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  
  const minutes = parseInt(timerMinutesInput.value) || 0;
  const seconds = parseInt(timerSecondsInput.value) || 0;
  timerDuration = minutes * 60 + seconds;
  timerRemaining = timerDuration;
  
  timerDisplay.textContent = formatTimerTime(timerRemaining);
  timerStartBtn.innerHTML = '<span class="btn-text">START</span>';
  drawTimerProgress();
  playResetSound();
  vibrate(100);
}

function completeTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerStartBtn.innerHTML = '<span class="btn-text">START</span>';
  
  playCompleteSound();
  vibrate([200, 100, 200]);
  document.querySelector('.container').classList.add('complete');
  setTimeout(() => {
    document.querySelector('.container').classList.remove('complete');
  }, 1500);
  
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Timer Complete!', {
      body: 'Your timer has finished.',
      icon: '⏱️'
    });
  }
}

function updateTimerInputs() {
  const minutes = parseInt(timerMinutesInput.value) || 0;
  const seconds = parseInt(timerSecondsInput.value) || 0;
  
  timerMinutesInput.value = String(minutes).padStart(2, '0');
  timerSecondsInput.value = String(seconds).padStart(2, '0');
  
  timerDuration = minutes * 60 + seconds;
  timerRemaining = timerDuration;
  timerDisplay.textContent = formatTimerTime(timerRemaining);
  drawTimerProgress();
}

// ===== FOCUS MODE =====

function drawFocusProgress() {
  if (!focusCanvas) return;
  
  const ctx = focusCanvas.getContext('2d');
  const centerX = focusCanvas.width / 2;
  const centerY = focusCanvas.height / 2;
  const radius = 100;
  
  ctx.clearRect(0, 0, focusCanvas.width, focusCanvas.height);
  
  // Background circle
  ctx.strokeStyle = 'rgba(0, 255, 159, 0.2)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Progress arc
  const progress = focusRemaining / focusDuration;
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (2 * Math.PI * progress);
  
  ctx.strokeStyle = '#00ff9f';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, startAngle, endAngle);
  ctx.stroke();
}

function updateFocus() {
  focusRemaining--;
  focusDisplay.textContent = formatTimerTime(focusRemaining);
  drawFocusProgress();
  
  if (focusRemaining <= 0) {
    completeFocus();
  }
}

function startFocus() {
  if (focusRemaining <= 0) return;
  
  focusRunning = true;
  focusInterval = setInterval(updateFocus, 1000);
  focusStartBtn.innerHTML = '<span class="btn-text">PAUSE</span>';
  playStartSound();
  vibrate(50);
}

function pauseFocus() {
  clearInterval(focusInterval);
  focusRunning = false;
  focusStartBtn.innerHTML = '<span class="btn-text">RESUME</span>';
  playPauseSound();
  vibrate(50);
}

function resetFocus() {
  clearInterval(focusInterval);
  focusRunning = false;
  focusRemaining = focusDuration;
  focusDisplay.textContent = formatTimerTime(focusRemaining);
  focusStartBtn.innerHTML = '<span class="btn-text">START</span>';
  drawFocusProgress();
  playResetSound();
  vibrate(100);
}

function completeFocus() {
  clearInterval(focusInterval);
  focusRunning = false;
  focusStartBtn.innerHTML = '<span class="btn-text">START</span>';
  
  if (focusType === 'focus') {
    completedSessions++;
    totalFocusMinutes += focusDuration / 60;
    sessionsEl.textContent = completedSessions;
    totalTimeEl.textContent = Math.floor(totalFocusMinutes) + 'm';
  }
   
  playCompleteSound();
  vibrate([200, 100, 200, 100, 200]);
  document.querySelector('.container').classList.add('complete');
  setTimeout(() => {
    document.querySelector('.container').classList.remove('complete');
  }, 1500);
  
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Focus Session Complete! 🎉', {
      body: focusType === 'focus' ? 'Time for a break!' : 'Ready for another session?',
      icon: '🍅'
    });
  }
}

// ===== EVENT LISTENERS =====

// Mode switching
modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.mode;
    
    // Stop all running timers
    stopClock();
    
    // Update UI
    modeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    modeContents.forEach(content => {
      content.classList.remove('active');
    });
    
    document.getElementById(`${mode}-mode`).classList.add('active');
    currentMode = mode;
    
    // Start clock if in clock mode
    if (mode === 'clock') {
      startClock();
    }
    
    playClickSound();
  });
});

// Sound toggle
soundToggle.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundToggle.classList.toggle('muted');
  vibrate(30);
  if (soundEnabled) playClickSound();
});

// Stopwatch controls
startPauseBtn.addEventListener('click', () => {
  if (!stopwatchRunning) {
    startStopwatch();
  } else {
    pauseStopwatch();
  }
});

lapBtn.addEventListener('click', addLap);
resetBtn.addEventListener('click', resetStopwatch);

// Timer controls
timerStartBtn.addEventListener('click', () => {
  if (!timerRunning) {
    startTimer();
  } else {
    pauseTimer();
  }
});

timerResetBtn.addEventListener('click', resetTimer);

timerMinutesInput.addEventListener('input', updateTimerInputs);
timerSecondsInput.addEventListener('input', updateTimerInputs);

timerMinutesInput.addEventListener('blur', () => {
  const value = parseInt(timerMinutesInput.value) || 0;
  timerMinutesInput.value = String(Math.max(0, Math.min(99, value))).padStart(2, '0');
  updateTimerInputs();
});

timerSecondsInput.addEventListener('blur', () => {
  const value = parseInt(timerSecondsInput.value) || 0;
  timerSecondsInput.value = String(Math.max(0, Math.min(59, value))).padStart(2, '0');
  updateTimerInputs();
});

timeAdjustBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const unit = btn.dataset.unit;
    const delta = parseInt(btn.dataset.delta);
    
    if (unit === 'minutes') {
      let value = parseInt(timerMinutesInput.value) + delta;
      value = Math.max(0, Math.min(99, value));
      timerMinutesInput.value = String(value).padStart(2, '0');
    } 
    else {
      let value = parseInt(timerSecondsInput.value) + delta;
      value = Math.max(0, Math.min(59, value));
      timerSecondsInput.value = String(value).padStart(2, '0');
    }
    
    updateTimerInputs();
    playClickSound();
  });
});

// Focus controls
focusStartBtn.addEventListener('click', () => {
  if (!focusRunning) {
    startFocus();
  } else {
    pauseFocus();
  }
});

focusResetBtn.addEventListener('click', resetFocus);

presetBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const minutes = parseInt(btn.dataset.time);
    const type = btn.dataset.type;
    
    focusDuration = minutes * 60;
    focusRemaining = focusDuration;
    focusType = type;
    
    presetBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const labels = {
      focus: 'FOCUS SESSION',
      break: 'SHORT BREAK',
      long: 'LONG BREAK'
    };
    focusLabel.textContent = labels[type];
    
    resetFocus();
    //  Using click sound 
    playClickSound();
  });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    
    if (currentMode === 'stopwatch') {
      startPauseBtn.click();
    } else if (currentMode === 'timer') {
      timerStartBtn.click();
    } else if (currentMode === 'focus') {
      focusStartBtn.click();
    }
  } else if (e.key === 'l' || e.key === 'L') {
    if (currentMode === 'stopwatch') {
      lapBtn.click();
    }
  } else if (e.key === 'r' || e.key === 'R') {
    if (currentMode === 'stopwatch') {
      resetBtn.click();
    } else if (currentMode === 'timer') {
      timerResetBtn.click();
    } else if (currentMode === 'focus') {
      focusResetBtn.click();
    }
  }
});

// ===== INITIALIZATION =====

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

// Start in clock mode
startClock();
 
timerMinutesInput.value = '05';
timerSecondsInput.value = '00';
updateTimerInputs();

// Initialize focus
drawFocusProgress();

console.log('⚡ CHRONOS Time Keeper Initialized');
console.log('Keyboard Shortcuts:');
console.log('  Space/Enter - Start/Pause');
console.log('  L - Lap (Stopwatch)');
console.log('  R - Reset');