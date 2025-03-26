function showNotification(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon.png",
    title: title,
    message: message,
    priority: 2
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

// Lägg upp alarm vid installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["waterInterval", "lunchTime", "fikaTime", "enableWater", "enableLunch", "enableFika"], (settings) => {
    const defaults = {
      waterInterval: "60",
      lunchTime: "12:00",
      fikaTime: "15:00",
      enableWater: true,
      enableLunch: true,
      enableFika: true
    };
    setupAlarms({ ...defaults, ...settings });
  });
});

// Skapa alarm baserat på inställningar
function setupAlarms(settings) {
  chrome.alarms.clearAll(() => {
    if (settings.enableWater) {
      chrome.alarms.create("water", {
        periodInMinutes: Number(settings.waterInterval)
      });
    }

    if (settings.enableLunch) {
      chrome.alarms.create("lunch", {
        when: getNextTimeInMillis(settings.lunchTime)
      });
    }

    if (settings.enableFika) {
      chrome.alarms.create("fika", {
        when: getNextTimeInMillis(settings.fikaTime)
      });
    }
  });
}

// Lyssna på alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "water") {
    showNotification("💧 Drick vatten!", "Dags att ta en klunk!");
  }

  if (alarm.name === "lunch") {
    showNotification("🍽 Lunchtid!", "Dags att ta en paus och äta.");
    chrome.storage.sync.get(["lunchTime"], (data) => {
      const lunchTime = data.lunchTime || "12:00";
      chrome.alarms.create("lunch", {
        when: getNextTimeInMillis(lunchTime)
      });
    });
  }

  if (alarm.name === "fika") {
    showNotification("☕ Fika!", "Dags att koppla av med en kopp.");
    chrome.storage.sync.get(["fikaTime"], (data) => {
      const fikaTime = data.fikaTime || "15:00";
      chrome.alarms.create("fika", {
        when: getNextTimeInMillis(fikaTime)
      });
    });
  }
});

// Lyssna på uppdateringar från popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "update-alarms") {
    chrome.storage.sync.get(["waterInterval", "lunchTime", "fikaTime", "enableWater", "enableLunch", "enableFika"], (settings) => {
      setupAlarms(settings);
    });
  }
});
