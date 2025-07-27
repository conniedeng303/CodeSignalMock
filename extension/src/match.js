const socket = io('http://localhost:3000');
let currentRoomId = null;

const diff = document.getElementById('diff');
const topic = document.getElementById('topic');
const matchBtn = document.getElementById('match');
const backBtn = document.getElementById('back');
const statusDiv = document.getElementById('match-status');

socket.emit('joinRoom', {
  roomId: 'testRoom123',
  password: 'abc',
});

socket.on('roomReady', ({ roomId }) => {
  currentRoomId = roomId;
  alert(`Connected to room: ${roomId}`);
});

matchBtn.addEventListener('click', async () => {
  const difficulty = diff.value.toLowerCase();
  const topicValue = topic.value.toLowerCase().trim();

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
      alert('No matching problem found.');
      return;
    }

    const random = filtered[Math.floor(Math.random() * filtered.length)];

    socket.emit('sendQuestionToRoom', {
      roomId: currentRoomId,
      question: {
        url: random.url,
        title: random.title,
        difficulty: random.difficulty,
        topic: random.related_topics
      }
    });
  } catch (err) {
    console.error('CSV Error:', err);
    alert('Failed to load question list.');
  }
});

socket.on('startMatch', (question) => {
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

  if (statusDiv) statusDiv.textContent = msg;
});

backBtn.addEventListener('click', () => {
  window.location.href = 'app.html';
});
