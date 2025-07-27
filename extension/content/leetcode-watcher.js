let lastStatus = "";

const observer = new MutationObserver(() => {
  const result = document.querySelector('[data-e2e-submission-result]');
  if (result) {
    const status = result.textContent.trim();
    if (status === "Accepted" && status !== lastStatus) {
      lastStatus = status;

      console.log("Accepted solution detected!");
      window.postMessage({ type: "LEETCODE_ACCEPTED" }, "*");


      observer.disconnect();
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
