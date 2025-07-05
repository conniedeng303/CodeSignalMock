
document.getElementById('auth').style.display = 'block';
document.getElementById('login-btn').addEventListener('click', () => {
  document.getElementById('auth').style.display = 'none';
  document.getElementById('questions').style.display = 'block';
});

document.getElementById('register-btn').addEventListener('click', () => {
  document.getElementById('auth').style.display = 'none';
  document.getElementById('questions').style.display = 'block';
});

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