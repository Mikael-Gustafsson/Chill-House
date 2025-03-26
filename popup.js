document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get([
    "waterInterval", "lunchTime", "fikaTime",
    "enableWater", "enableLunch", "enableFika"
  ], (data) => {
    document.getElementById("water").value = data.waterInterval || 60;
    document.getElementById("lunch").value = data.lunchTime || "12:00";
    document.getElementById("fika").value = data.fikaTime || "15:00";
    document.getElementById("enableWater").checked = data.enableWater ?? true;
    document.getElementById("enableLunch").checked = data.enableLunch ?? true;
    document.getElementById("enableFika").checked = data.enableFika ?? true;
  });

  document.getElementById("save").addEventListener("click", () => {
    const settings = {
      waterInterval: document.getElementById("water").value,
      lunchTime: document.getElementById("lunch").value,
      fikaTime: document.getElementById("fika").value,
      enableWater: document.getElementById("enableWater").checked,
      enableLunch: document.getElementById("enableLunch").checked,
      enableFika: document.getElementById("enableFika").checked
    };

    chrome.storage.sync.set(settings, () => {
      chrome.runtime.sendMessage({ type: "update-alarms" });
      window.close();
    });
  });

  // Hämta väder
  fetch("http://localhost:3000/api/weather")
    .then(res => res.json())
    .then(data => {
      const box = document.getElementById("weatherBox");
      box.textContent = data.message || "Ingen väderinfo.";
    })
    .catch(() => {
      document.getElementById("weatherBox").textContent = "⚠️ Kunde inte hämta väder.";
    });
});


document.getElementById("openMusic").addEventListener("click", () => {
  chrome.tabs.create({ url: "https://www.youtube.com/watch?v=FJQVRqQV4SA" });
});
