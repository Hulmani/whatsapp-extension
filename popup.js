const scanBtn = document.getElementById("scanBtn");
const syncBtn = document.getElementById("syncBtn");
const statusDiv = document.getElementById("status");

let currentChatMessages = [];

scanBtn.addEventListener("click", async () => {
statusDiv.textContent = "Scanning chat...";
syncBtn.disabled = true;

// Send message to content script to scrape chat
const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
chrome.scripting.executeScript({
target: { tabId: tab.id },
function: scrapeWhatsAppChat,
}, (results) => {
if (chrome.runtime.lastError || !results || !results[0]) {
statusDiv.textContent = "Failed to scan chat.";
return;
}
currentChatMessages = results[0].result;
statusDiv.textContent = Found `${currentChatMessages.length} messages.`;
syncBtn.disabled = false;
});
});

syncBtn.addEventListener("click", () => {
statusDiv.textContent = "Sync to cloud: yet to be implemented.";
});

// This runs inside the WhatsApp Web page to scrape chat messages
function scrapeWhatsAppChat() {
try {
const messageElems = document.querySelectorAll("[data-testid='msg-container']");
const messages = [];
messageElems.forEach((msg) => {
const textElem = msg.querySelector("span.selectable-text");
if (textElem) {
messages.push(textElem.innerText);
}
});
return messages;
} catch (e) {
return [];
}
}