if (window.location.protocol === "http:" || window.location.protocol === "https:") {
  chrome.runtime.sendMessage({ action: "checkUrl", url: window.location.href }, (response) => {
    if (response && response.success) {
      const payload = response.data;
      const results = payload.results || [];
      const ptRes = results.find((r) => r.provider.includes("PhishTank"));
      const opRes = results.find((r) => r.provider.includes("OpenPhish"));
      const isPhish = ptRes?.metadata?.phishingDetected || opRes?.metadata?.phishingDetected || false;

      if (isPhish) {
        // Draw Full-screen Phishing Warning Overlay banner
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.backgroundColor = "#7f1d1d";
        overlay.style.color = "#fafafa";
        overlay.style.zIndex = "2147483647";
        overlay.style.display = "flex";
        overlay.style.flexDirection = "column";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.fontFamily = "sans-serif";
        overlay.style.padding = "20px";
        overlay.style.boxSizing = "border-box";
        overlay.style.textAlign = "center";

        overlay.innerHTML = `
          <h1 style="font-size: 38px; margin-bottom: 20px; font-weight: 900;">⚠️ DECEPTIVE SITE BLOCKED</h1>
          <p style="font-size: 16px; max-width: 600px; margin-bottom: 30px; line-height: 1.6; color: #fca5a5;">
            Privora Shield has verified this host as a deceptive phishing page targeting credential harvesting.
          </p>
          <button id="privoraGoBack" style="padding: 12px 28px; background-color: #fafafa; color: #7f1d1d; border: none; font-size: 15px; font-weight: bold; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
            Leave Page Immediately
          </button>
        `;

        document.documentElement.appendChild(overlay);

        const goBackBtn = document.getElementById("privoraGoBack");
        if (goBackBtn) {
          goBackBtn.addEventListener("click", () => {
            window.history.back();
            // Fallback if no history
            setTimeout(() => {
              window.location.href = "about:blank";
            }, 300);
          });
        }
      }
    }
  });
}
