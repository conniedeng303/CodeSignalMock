
document.getElementById('auth').style.display = 'block';
document.getElementById('login-btn').addEventListener('click', () => {
  document.getElementById('auth').style.display = 'none';
  document.getElementById('questions').style.display = 'block';
});

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', () => {
  const user = localStorage.getItem('user');
  if (user) {
    document.getElementById('auth').style.display = 'none';
    document.getElementById('questions').style.display = 'block';
  }
});

document.getElementById('login-btn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.success) {
      console.log('Login success');
      localStorage.setItem('user', email);
      document.getElementById('auth').style.display = 'none';
      document.getElementById('questions').style.display = 'block';
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (err) {
    console.error('Login error:', err);
    alert('Something went wrong!');
  }
});

// SIGNUP handler
document.getElementById('register-btn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    alert("Email and password required");
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    console.log('SIGNUP RESPONSE:', data);

    if (data.success) {
      alert('Signup successful!');
      localStorage.setItem('user', email);
      document.getElementById('auth').style.display = 'none';
      document.getElementById('questions').style.display = 'block';
    } else {
      alert(data.message || 'Signup failed');
    }
  } catch (err) {
    console.error('Signup error:', err);
    alert('Something went wrong during signup.');
  }
});


document.getElementById('match').addEventListener('click', () => {
  window.location.href = 'match.html'
})

document.getElementById("submit").addEventListener("click", async () => {
  const difficulties = [
    document.getElementById("diff1").value,
    document.getElementById("diff2").value,
    document.getElementById("diff3").value,
    document.getElementById("diff4").value
  ];

  const topics = [
    document.getElementById("topic1").value.toLowerCase().trim(),
    document.getElementById("topic2").value.toLowerCase().trim(),
    document.getElementById("topic3").value.toLowerCase().trim(),
    document.getElementById("topic4").value.toLowerCase().trim()
  ];

  try {
    const response = await fetch(chrome.runtime.getURL("shared/leetcode-problems.csv"));
    const csvText = await response.text();

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    });

    const problems = parsed.data;

    for (let i = 0; i < 4; i++) {
      const difficulty = difficulties[i].toLowerCase();

      if (difficulty === "null") continue;

      const topic = topics[i];

      const filtered = problems.filter(problem => {
        const hasDifficulty =
          problem.difficulty && problem.difficulty.toLowerCase() === difficulty;

        const hasTopic =
          topic === "" ||
          (problem.related_topics &&
            problem.related_topics.toLowerCase().includes(topic));

        return hasDifficulty && hasTopic;
      });

      if (filtered.length === 0) {
        alert(
          `No problems found for "${difficulty}" with topic "${topic}" (Question ${
            i + 1
          }).`
        );
        continue;
      }

      const random = filtered[Math.floor(Math.random() * filtered.length)];

      if (random.url) {
        chrome.tabs.create({ url: random.url });
      } else {
        console.warn(`Missing URL for problem:`, random);
      }
    }
  } catch (err) {
    console.error("Error loading or parsing CSV:", err);
    alert("Failed to load problem list.");
  }
});

document.getElementById("upload").addEventListener("click", async () => {



});