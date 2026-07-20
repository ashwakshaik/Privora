document.addEventListener("DOMContentLoaded", () => {
  const statusBadge = document.getElementById("statusBadge");
  const targetUrlEl = document.getElementById("targetUrl");
  const scoreValEl = document.getElementById("scoreVal");
  const sslGradeEl = document.getElementById("sslGrade");
  const safeBrowsingEl = document.getElementById("safeBrowsing");
  const phishingFlagEl = document.getElementById("phishingFlag");
  const scanBtn = document.getElementById("scanBtn");

  function runCheck() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab || !activeTab.url) return;

      const url = new URL(activeTab.url);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        statusBadge.textContent = "System";
        targetUrlEl.textContent = "Internal page";
        scoreValEl.textContent = "100";
        sslGradeEl.textContent = "N/A";
        safeBrowsingEl.textContent = "Safe";
        phishingFlagEl.textContent = "No";
        return;
      }

      targetUrlEl.textContent = url.hostname;
      statusBadge.textContent = "Checking...";

      // Send threat query task message to background worker
      chrome.runtime.sendMessage({ action: "checkUrl", url: activeTab.url }, (response) => {
        if (response && response.success) {
          const payload = response.data;
          scoreValEl.textContent = `${payload.score}%`;
          
          if (payload.score < 50) {
            statusBadge.textContent = "Danger";
            statusBadge.className = "status-badge critical";
          } else {
            statusBadge.textContent = "Secure";
            statusBadge.className = "status-badge safe";
          }

          // Parse findings
          const results = payload.results || [];
          const sslRes = results.find((r) => r.provider.includes("SSL"));
          const sbRes = results.find((r) => r.provider.includes("Safe Browsing"));
          const ptRes = results.find((r) => r.provider.includes("PhishTank"));
          const opRes = results.find((r) => r.provider.includes("OpenPhish"));

          sslGradeEl.textContent = sslRes?.metadata?.sslGrade || "A+";
          safeBrowsingEl.textContent = sbRes?.severity === "critical" ? "Flagged" : "Clean";
          
          const isPhish = ptRes?.metadata?.phishingDetected || opRes?.metadata?.phishingDetected || false;
          phishingFlagEl.textContent = isPhish ? "Phishing Site" : "Clean";
        } else {
          statusBadge.textContent = "Offline";
          scoreValEl.textContent = "Error";
        }
      });
    });
  }

  scanBtn.addEventListener("click", runCheck);
  runCheck();
});
