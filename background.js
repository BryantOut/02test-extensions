chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: "https://pub.jutuike.com/order" }, (newTab) => {
    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
      if (tabId === newTab.id && info.status === "complete") {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["content.js"]
        });
        chrome.tabs.onUpdated.removeListener(listener);
      }
    });
  });
});

// 接收通知请求
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "notify") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon128.png",
      title: msg.title,
      message: msg.message
    });
  }
});
