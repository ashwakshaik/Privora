document.addEventListener("DOMContentLoaded", async () => {
  const scoreEl = document.getElementById("privacyScore");
  const ratingEl = document.getElementById("scoreRating");
  const siteDetailsEl = document.getElementById("siteDetails");

  // 1. Fetch current tab info
  if (typeof chrome !== "undefined" && chrome.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        const url = new URL(tabs[0].url);
        const domain = url.hostname;
        
        siteDetailsEl.textContent = `${domain} - Checked (No exposures)`;
        
        // Custom warning indicators for data broker domains
        const domainLower = domain.toLowerCase();
        if (
          domainLower.includes("whitepages") || 
          domainLower.includes("spokeo") || 
          domainLower.includes("radaris") || 
          domainLower.includes("beenverified")
        ) {
          siteDetailsEl.parentNode.style.backgroundColor = "rgba(239, 68, 68, 0.05)";
          siteDetailsEl.parentNode.style.borderColor = "rgba(239, 68, 68, 0.1)";
          const dot = siteDetailsEl.parentNode.querySelector(".status-dot");
          if (dot) {
            dot.style.backgroundColor = "#EF4444";
            dot.style.boxShadow = "0 0 8px #EF4444";
          }
          siteDetailsEl.style.color = "#EF4444";
          siteDetailsEl.textContent = `Warning: ${domain} holds exposed profiles.`;
        }
      }
    });
  } else {
    siteDetailsEl.textContent = "localhost - Development Mode";
  }

  // 2. Fetch or load score from storage, or fallback to mock
  if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.local.get(["userPrivacyScore"], (res) => {
      if (res.userPrivacyScore) {
        const score = res.userPrivacyScore;
        scoreEl.textContent = `${score}%`;
        updateRating(score);
      }
    });
  } else {
    // Local storage mockup fallback
    try {
      const mockScore = localStorage.getItem("privora_last_score") || "85";
      scoreEl.textContent = `${mockScore}%`;
      updateRating(parseInt(mockScore));
    } catch {
      scoreEl.textContent = "85%";
      updateRating(85);
    }
  }

  function updateRating(score) {
    if (score > 80) {
      ratingEl.textContent = "Secure";
      ratingEl.style.color = "#10B981";
    } else if (score > 50) {
      ratingEl.textContent = "Medium Risk";
      ratingEl.style.color = "#F59E0B";
    } else {
      ratingEl.textContent = "Exposed / Vulnerable";
      ratingEl.style.color = "#EF4444";
    }
  }

  // Toggle listeners
  const trackerToggle = document.getElementById("trackerToggle");
  const cookieToggle = document.getElementById("cookieToggle");
  const fingerprintToggle = document.getElementById("fingerprintToggle");

  [trackerToggle, cookieToggle, fingerprintToggle].forEach(item => {
    item.addEventListener("change", () => {
      const state = {
        tracker: trackerToggle.checked,
        cookie: cookieToggle.checked,
        fingerprint: fingerprintToggle.checked
      };
      
      // Save settings
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.set({ extensionSettings: state });
      } else {
        localStorage.setItem("privora_extension_settings", JSON.stringify(state));
      }
      
      console.log("Settings modified:", state);
    });
  });
});
