document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(["waterInterval", "lunchTime", "fikaTime"], (data) => {
    document.getElementById("water").value = data.waterInterval || 60;
    document.getElementById("lunch").value = data.lunchTime || "12:00";
    document.getElementById("fika").value = data.fikaTime || "15:00";
  });

  document.getElementById("save").addEventListener("click", () => {
    const settings = {
      waterInterval: document.getElementById("water").value,
      lunchTime: document.getElementById("lunch").value,
      fikaTime: document.getElementById("fika").value
    };

    chrome.storage.sync.set(settings, () => {
      // Skicka ett meddelande till service workern (background.js) att uppdatera alarm
      chrome.runtime.sendMessage({ type: "update-alarms" });
      window.close();
    });
  });
});
