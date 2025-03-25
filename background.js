function showNotification(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon.png",
    title: title,
    message: message,
    priority: 2
  });
}

function setupAlarms(settings) {
  chrome.alarms.clearAll(() => {
    chrome.alarms.create("water", { periodInMinutes: Number(settings.waterInterval) });
    chrome.alarms.create("lunch", { when: getNextTimeInMillis(settings.lunchTime) });
    chrome.alarms.create("fika", { when: getNextTimeInMillis(settings.fikaTime) });
  });
}

function getNextTimeInMillis(timeStr) {
  const now = new Date();
  const [h, m] = timeStr.split(":").map(Number);
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime();
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["waterInterval", "lunchTime", "fikaTime"], (settings) => {
    const defaults = {
      waterInterval: "60",
      lunchTime: "12:00",
      fikaTime: "15:00"
    };
    setupAlarms({ ...defaults, ...settings });
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "water") {
    showNotification("💧 Drick vatten!", "Dags att ta en klunk!");
  }
  if (alarm.name === "lunch") {
    showNotification("🍽 Lunchtid!", "Dags att ta en paus och äta.");
    chrome.alarms.create("lunch", { when: getNextTimeInMillis(getTimeFromStorage("lunchTime")) });
  }
  if (alarm.name === "fika") {
    showNotification("☕ Fika!", "Dags att koppla av med en kopp.");
    chrome.alarms.create("fika", { when: getNextTimeInMillis(getTimeFromStorage("fikaTime")) });
  }
});

// Lyssna på meddelande från popupen
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "update-alarms") {
    chrome.storage.sync.get(["waterInterval", "lunchTime", "fikaTime"], (settings) => {
      setupAlarms(settings);
    });
  }
});

// Hjälpfunktion: få aktuell tid från lagring
function getTimeFromStorage(key) {
  let value = "00:00";
  chrome.storage.sync.get([key], (data) => {
    value = data[key] || value;
  });
  return value;
}
