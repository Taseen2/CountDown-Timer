// =================================================================================
// DOM Elements
// =================================================================================

const timerDisplay = document.querySelector('.display__time-left');
const endTime = document.querySelector('.display__end-time');
const buttons = document.querySelectorAll('[data-time]');
const alarm = document.querySelector('#notification-sound');
const progressRing = document.querySelector('.progress-ring__fg');
const themeToggle = document.querySelector('#theme-toggle');
const customForm = document.forms.customForm;
const playButton = document.querySelector('#play-button');
const pauseButton = document.querySelector('#pause-button');
const resetButton = document.querySelector('#reset-button');

// =================================================================================
// Global Variables
// =================================================================================

let countdown;
const radius = progressRing.r.baseVal.value;
const circumference = radius * 2 * Math.PI;
let timerState = {
  secondsLeft: 0,
  totalSeconds: 0,
  isPaused: false,
};

// =================================================================================
// Functions
// =================================================================================

/**
 * Updates the circular progress bar.
 * @param {number} percent The percentage of the timer remaining.
 */
function setProgress(percent) {
  const offset = circumference - (percent / 100) * circumference;
  progressRing.style.strokeDashoffset = offset;
}

/**
 * The main timer function.
 * @param {number} seconds The duration of the timer in seconds.
 */
function timer(seconds) {
  clearInterval(countdown);

  const now = Date.now();
  const then = now + seconds * 1000;
  timerState.totalSeconds = timerState.totalSeconds === 0 ? seconds : timerState.totalSeconds;
  timerState.isPaused = false;

  displayTimeLeft(seconds);
  displayEndTime(then);

  countdown = setInterval(() => {
    const secondsLeft = Math.round((then - Date.now()) / 1000);
    timerState.secondsLeft = secondsLeft;

    if (secondsLeft < 0) {
      clearInterval(countdown);
      alarm.play();
      setProgress(0);
      resetTimer();
      return;
    }

    const percent = (secondsLeft / timerState.totalSeconds) * 100;
    setProgress(percent);
    displayTimeLeft(secondsLeft);
  }, 1000);
}

/**
 * Displays the time left on the timer.
 * @param {number} seconds The number of seconds remaining.
 */
function displayTimeLeft(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainderSeconds = seconds % 60;
  const display = `${minutes}:${remainderSeconds < 10 ? '0' : ''}${remainderSeconds}`;
  document.title = display;
  timerDisplay.textContent = display;
}

/**
 * Displays the time the timer will end.
 * @param {number} timestamp The timestamp of when the timer will end.
 */
function displayEndTime(timestamp) {
  const end = new Date(timestamp);
  const hour = end.getHours();
  const adjustedHour = hour > 12 ? hour - 12 : hour;
  const minutes = end.getMinutes();
  endTime.textContent = `Be Back At ${adjustedHour}:${minutes < 10 ? '0' : ''}${minutes}`;
}

function startPresetTimer() {
  const seconds = parseInt(this.dataset.time);
  timerState.totalSeconds = 0; // Reset total seconds for preset timers
  timer(seconds);
  updateButtonVisibility(true);
}

function pauseTimer() {
  clearInterval(countdown);
  timerState.isPaused = true;
  updateButtonVisibility(true);
}

function resumeTimer() {
  timer(timerState.secondsLeft);
}

function resetTimer() {
  clearInterval(countdown);
  timerState = { secondsLeft: 0, totalSeconds: 0, isPaused: false };
  timerDisplay.textContent = '';
  endTime.textContent = '';
  setProgress(100);
  updateButtonVisibility(false);
}

function updateButtonVisibility(isTimerActive) {
  if (!isTimerActive) {
    playButton.hidden = true;
    pauseButton.hidden = true;
    resetButton.hidden = true;
  } else {
    resetButton.hidden = false;
    if (timerState.isPaused) {
      playButton.hidden = false;
      pauseButton.hidden = true;
    } else {
      playButton.hidden = true;
      pauseButton.hidden = false;
    }
  }
}

/**
 * Sets the theme for the application.
 * @param {string} theme The name of the theme ('light' or 'dark').
 */
function setTheme(theme) {
  document.body.dataset.theme = theme;
  localStorage.setItem('theme', theme);
  themeToggle.checked = theme === 'dark';
}

// =================================================================================
// Event Listeners
// =================================================================================

buttons.forEach(button => button.addEventListener('click', startPresetTimer));
playButton.addEventListener('click', resumeTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);

themeToggle.addEventListener('change', () => {
  setTheme(themeToggle.checked ? 'dark' : 'light');
});

customForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const mins = this.minutes.value;
  if (mins) {
    timerState.totalSeconds = 0; // Reset total seconds for custom timers
    timer(mins * 60);
    updateButtonVisibility(true);
    this.reset();
  }
});

// =================================================================================
// Initialisation
// =================================================================================

progressRing.style.strokeDasharray = circumference;
progressRing.style.strokeDashoffset = circumference;

const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme) {
  setTheme(savedTheme);
} else if (prefersDark) {
  setTheme('dark');
}

updateButtonVisibility(false);
