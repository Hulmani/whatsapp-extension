const scanBtn = document.getElementById("scanBtn");
const syncBtn = document.getElementById("syncBtn");
const statusDiv = document.getElementById("status");

let currentChatMessages = [];
const themeToggle = document.getElementById("theme-toggle");

const themeIcon = document.getElementById("theme-icon");
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    themeIcon.innerHTML = document.body.classList.contains("light")
        ? `<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="5" fill="#f7c948"/><g stroke="#f7c948" stroke-width="2"><line x1="11" y1="1" x2="11" y2="4"/><line x1="11" y1="18" x2="11" y2="21"/><line x1="1" y1="11" x2="4" y2="11"/><line x1="18" y1="11" x2="21" y2="11"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="15.66" y1="15.66" x2="17.78" y2="17.78"/><line x1="4.22" y1="17.78" x2="6.34" y2="15.66"/><line x1="15.66" y1="6.34" x2="17.78" y2="4.22"/></g></svg>`
        : `<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M17.5 13.5A7.5 7.5 0 0 1 8.5 4.5a7.5 7.5 0 1 0 9 9z" fill="#25d366"/></svg>`;
});

scanBtn.addEventListener("click", async () => {
statusDiv.textContent = "Scanning chat...";
syncBtn.disabled = true;

// Send message to content script to scrape chat
const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

   // Add this check here:
    if (!tab || !tab.url || !tab.url.startsWith("https://web.whatsapp.com")) {
        statusDiv.textContent = "Please open WhatsApp Web and select a chat.";
        syncBtn.disabled = true;
        return;
    }

chrome.scripting.executeScript({
target: { tabId: tab.id },
function: scrapeWhatsAppChat,
}, (results) => {
if (chrome.runtime.lastError || !results || !results[0]) {
statusDiv.textContent = "Failed to scan chat.";
return;
}
 console.log("Raw scan results:", results); // <--- Add this line
    
currentChatMessages = results[0].result;
statusDiv.textContent = `Found ${currentChatMessages.length} messages.`;

// statusDiv.textContent = `Raw scan results ${results}`;

updatePreview(currentChatMessages);
syncBtn.disabled = false;
});
});

syncBtn.addEventListener("click", () => {
statusDiv.textContent = "Sync to cloud: yet to be implemented.";
});

// Function to scrape WhatsApp chat messages
// function scrapeWhatsAppChat() {
//     try {
//         // Select all spans with these classes (message text)
//         const textElems = document.querySelectorAll('span._ao3e.selectable-text.copyable-text');
//         document.getElementById("status").textContent = `Found ${messageElems.length} messages.`;
//         const messages = [];
//         textElems.forEach((elem) => {
//              if (elem.innerText && elem.innerText.trim() !== "") {
//                 messages.push(elem.innerText.trim());
//             }
//         });
//         return messages;
//     } catch (e) {
//         return [];
//     }
// }

function scrapeWhatsAppChat() {
  try {
    // Select each message container
    const messageElems = document.querySelectorAll("div.copyable-text");
    const messages = [];

    messageElems.forEach((msg) => {
      // Extract meta info from data-pre-plain-text
      const meta = msg.getAttribute("data-pre-plain-text") || "";
      // This typically looks like: "[6:27 PM, 7/24/2025] gampi: "
      const metaMatch = meta.match(/\[(.*?)\]\s(.*?):\s/);
      const timestamp = metaMatch ? metaMatch[1] : "Unknown time";
      const sender = metaMatch ? metaMatch[2] : "You/Other";

      // Extract message text
      const textElem = msg.querySelector("span._ao3e");
      const text = textElem ? textElem.innerText : "";

      if (text) {
        messages.push({
          sender,
          timestamp,
          text,
        });
      }
    });

    return messages;
  } catch (e) {
    console.error("Error scraping messages:", e);
    return [];
  }
}


// Add preview functionality
const previewContainer = document.getElementById("preview-container");
const previewList = document.getElementById("preview-list");
const togglePreviewBtn = document.getElementById("toggle-preview-btn");
const disclaimer = document.getElementById("disclaimer");

let showingPreview = false;


function updatePreview(messages) {
  previewList.innerHTML = "";

  // === Extract participants ===
  const senders = new Set();
  let totalWords = 0;
  const wordFrequency = {};

  messages.forEach((msg) => {
    if (msg.sender) senders.add(msg.sender);

    const words = msg.text.split(/\s+/).filter(Boolean);
    totalWords += words.length;

    words.forEach((word) => {
      const cleaned = word.toLowerCase().replace(/[^\w\s]/g, "");
      if (cleaned.length > 2) {
        wordFrequency[cleaned] = (wordFrequency[cleaned] || 0) + 1;
      }
    });
  });

  const participants = Array.from(senders).join(" & ");
  document.getElementById("participant-names").textContent = participants || "N/A";
  document.getElementById("word-count").textContent = totalWords;

  const topWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word)
    .join(", ");
  document.getElementById("common-words").textContent = topWords || "N/A";

  // === Sample messages ===
  const previewMessages = messages.slice(0, 5);
  previewMessages.forEach((msg) => {
    const li = document.createElement("li");
    li.textContent = `${msg.sender || "Someone"}: ${msg.text}`;
    previewList.appendChild(li);
  });
previewContainer.classList.remove("hidden");
  
togglePreviewBtn.innerHTML = "Hide Preview";
togglePreviewBtn.disabled = false;
disclaimer.classList.remove("hidden");

}

// function updatePreview(messages) {
// previewList.innerHTML = "";
//   console.log("Preview messages:", messages); // Add this line
  
//  if (!messages || messages.length === 0) {
//         const li = document.createElement("li");
//         li.textContent = "Nothing to preview";
//         previewList.appendChild(li);
//         previewContainer.classList.remove("hidden");
    
//         disclaimer.classList.remove("hidden");
//         return;
//     }

// const previewMessages = messages.slice(0, 5);
// previewMessages.forEach((msg, idx) => {
// const li = document.createElement("li");
// li.textContent = msg;
// previewList.appendChild(li);
// });
// previewContainer.classList.remove("hidden");
// //togglePreviewBtn.classList.remove("hidden");
// togglePreviewBtn.innerHTML = "Hide Preview";
// togglePreviewBtn.disabled = false;
// disclaimer.classList.remove("hidden");
// }

togglePreviewBtn.addEventListener("click", () => {
showingPreview = !showingPreview;
previewContainer.classList.toggle("hidden", showingPreview);
togglePreviewBtn.textContent = showingPreview ? "Hide Preview" : "Preview";
});