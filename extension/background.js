// Service worker script for Privora Chrome Extension prototype
// Monitors network tab requests and logs data broker match rules

chrome.runtime.onInstalled.addListener(() => {
  console.log("Privora Privacy Guard background service active.");
  
  // Set default settings
  chrome.storage.local.set({
    userPrivacyScore: 85,
    extensionSettings: {
      tracker: true,
      cookie: true,
      fingerprint: false
    }
  });
});

// Listener for Tab navigation changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    try {
      const url = new URL(tab.url);
      const domain = url.hostname;
      
      const brokerList = [
        "whitepages.com",
        "spokeo.com",
        "radaris.com",
        "beenverified.com",
        "intelius.com",
        "truthfinder.com"
      ];
      
      const isBroker = brokerList.some(b => domain.toLowerCase().includes(b));
      
      if (isBroker) {
        // Send a badge alert warning
        chrome.action.setBadgeBackgroundColor({ color: "#EF4444" });
        chrome.action.setBadgeText({ text: "!" });
        console.warn(`Privora Shield: Expose risk detected on ${domain}`);
      } else {
        chrome.action.setBadgeText({ text: "" });
      }
    } catch (e) {
      // Ignored
    }
  }
});
