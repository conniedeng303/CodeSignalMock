const socket = io('http://localhost:3000');
let currentRoomId = null;

const diff = document.getElementById('diff');
const topic = document.getElementById('topic');
const matchBtn = document.getElementById('match');
const backBtn = document.getElementById('back');
const connectBtn = document.getElementById('connect');
const roomIdInput = document.getElementById('room-id');
const passwordInput = document.getElementById('room-pass');
const statusDiv = document.getElementById('match-status');
const waitingDiv = document.getElementById('waiting');
const setupDiv = document.getElementById('setup');
let roomPassword = '';

function initRoom(roomId, password) {
  socket.emit('createRoom', {
    roomId,
    password,
    config: {}
  });
}

socket.on('roomCreated', (roomId) => {
  currentRoomId = roomId;
  if (statusDiv) {
    statusDiv.textContent = `Created room: ${roomId}`;
    statusDiv.classList.remove('hidden');
  }
});

socket.on('roomError', (msg) => {
  if (msg === 'Room already exists') {
    socket.emit('joinRoom', { roomId: currentRoomId, password: roomPassword });
  } else {
    if (statusDiv) {
      statusDiv.textContent = msg;
      statusDiv.classList.remove('hidden');
    } else {
      alert(msg);
    }
  }
});

socket.on('roomReady', ({ roomId }) => {
  currentRoomId = roomId;
  if (statusDiv) {
    statusDiv.textContent = `Connected to room: ${roomId}`;
    statusDiv.classList.remove('hidden');
  }
});

connectBtn.addEventListener('click', () => {
  const id = roomIdInput.value.trim();
  roomPassword = passwordInput.value;
  if (!id) {
    alert('Please enter a room ID');
    return;
  }
  initRoom(id, roomPassword);
});

matchBtn.addEventListener('click', async () => {
  const difficulty = diff.value.toLowerCase();
  const topicValue = topic.value.toLowerCase().trim();

  if (!currentRoomId) {
    alert('Please connect to a room first.');
    return;
  }

  setupDiv.classList.add('hidden');
  if (waitingDiv) waitingDiv.classList.remove('hidden');

  try {
    const response = await fetch(chrome.runtime.getURL('shared/leetcode-problems.csv'));
    const csvText = await response.text();
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    });

    const problems = parsed.data;

    const filtered = problems.filter(problem =>
      problem.difficulty?.toLowerCase() === difficulty &&
      (topicValue === '' || problem.related_topics?.toLowerCase().includes(topicValue))
    );

    if (filtered.length === 0) {
      if (waitingDiv) waitingDiv.classList.add('hidden');
      alert('No matching problem found.');
      setupDiv.classList.remove('hidden');
      return;
    }

    const random = filtered[Math.floor(Math.random() * filtered.length)];

    socket.emit('playerReady', {
      roomId: currentRoomId,
      question: {
        url: random.url,
        title: random.title,
        difficulty: random.difficulty,
        topic: random.related_topics
      }
    });
  } catch (err) {
    if (waitingDiv) waitingDiv.classList.add('hidden');
    setupDiv.classList.remove('hidden');
    console.error('CSV Error:', err);
    alert('Failed to load question list.');
  }
});

socket.on('startMatch', (question) => {
  if (waitingDiv) waitingDiv.classList.add('hidden');
  if (statusDiv) statusDiv.classList.add('hidden');
  const confirmed = confirm(`Open this question?\n${question.title} (${question.difficulty})`);
  if (confirmed && question.url) {
    console.log("➡ Opening question:", question.url);
    chrome.tabs.create({ url: question.url }, (tab) => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content/leetcode-watcher.js']
      }, () => {
        console.log("✅ LeetCode watcher injected");
      });
    });
  }
});

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data.type === "LEETCODE_ACCEPTED") {
    console.log("🎉 You solved it!");
    socket.emit("playerSolved", { roomId: currentRoomId });
  }
});

socket.on('matchOver', ({ winnerSocket }) => {
  const msg = (socket.id === winnerSocket)
    ? "🎉 You won!"
    : "❌ You lost! Your opponent solved it first.";

  if (statusDiv) {
    statusDiv.textContent = msg;
    statusDiv.classList.remove('hidden');
  }
  if (waitingDiv) waitingDiv.classList.add('hidden');
});

backBtn.addEventListener('click', () => {
  window.location.href = 'app.html';
});
