document.getElementById("open").addEventListener("click", async () => {
  const difficulties = [
    document.getElementById("diff1").value,
    document.getElementById("diff2").value,
    document.getElementById("diff3").value,
    document.getElementById("diff4").value
  ];

  try {
    const response = await fetch(chrome.runtime.getURL("shared/leetcode-problems.csv"));
    const csvText = await response.text();

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    });

    const problems = parsed.data;

    for (let i = 0; i < difficulties.length; i++) {
      const difficulty = difficulties[i].toLowerCase();
      if (difficulty == "NULL") {
        continue;
      }

      const filtered = problems.filter(
        p => p.difficulty && p.difficulty.toLowerCase() === difficulty
      );

      if (filtered.length === 0) {
        alert(`No problems found for "${difficulty}" (Question ${i + 1}).`);
        continue;
      }

      const random = filtered[Math.floor(Math.random() * filtered.length)];

      if (random.url) {
        chrome.tabs.create({ url: random.url });
      } else {
        console.warn(`No URL found for problem:`, random);
      }
    }

  } catch (err) {
    console.error("Failed to load or parse CSV:", err);
    alert("Could not load problem list.");
  }
});