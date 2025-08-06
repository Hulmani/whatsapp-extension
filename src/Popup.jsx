import React, { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import Preview from "./Preview";
import "./popup.css";

function Popup() {
  const [theme, setTheme] = useState("dark");
  const [status, setStatus] = useState("");
  const [messages, setMessages] = useState([]);
  const [showPreview, setShowPreview] = useState(true);
  const [syncDisabled, setSyncDisabled] = useState(true);
  const [analysis, setAnalysis] = useState(null);

  // Theme toggle handler
  const handleThemeToggle = () => setTheme(theme === "dark" ? "light" : "dark");

// Modified handleScan with retry to avoid Extension context invalidated errors
const handleScan = async () => {
  setStatus("Scanning chat...");
  setSyncDisabled(true);

  if (!window.chrome?.tabs) {
    setStatus("Chrome APIs not available.");
    return;
  }

  try {
    const [tab] = await window.chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url || !tab.url.startsWith("https://web.whatsapp.com")) {
      setStatus("Please open WhatsApp Web and select a chat.");
      setSyncDisabled(true);
      return;
    }

    // Wrap executeScript in a promise to handle errors and retry
    const executeWithRetry = (retries = 2) => {
      return new Promise((resolve, reject) => {
        window.chrome.scripting.executeScript(
          { target: { tabId: tab.id }, func: scrapeWhatsAppChat },
          (results) => {
            if (window.chrome.runtime.lastError) {
              console.warn("Extension context error:", window.chrome.runtime.lastError);
              if (retries > 0) {
                // Retry after a short delay
                setTimeout(() => resolve(executeWithRetry(retries - 1)), 300);
              } else {
                reject(window.chrome.runtime.lastError);
              }
            } else {
              resolve(results);
            }
          }
        );
      });
    };

    const results = await executeWithRetry();

    if (!results || !results[0]) {
      setStatus("Failed to scan chat.");
      return;
    }

    const chatMessages = results[0].result;
    setMessages(chatMessages);
    setStatus(`Found ${chatMessages.length} messages.`);
    setSyncDisabled(false);
  } catch (error) {
    console.error("Scan failed after retries:", error);
    setStatus("Failed to scan chat. Please try again.");
  }
};

  // Sync button handler (placeholder)
  // const handleSync = () => setStatus("Sync to cloud: yet to be implemented.");

  const handleSync = async () => {
    setStatus("Analyzing chat...");
    setAnalysis(null);

    try {
      const res = await fetch("http://localhost:4000/api/chat/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      const data = await res.json();
      setStatus("");
      setAnalysis(data); // <-- Store analysis
    } catch (err) {
      console.error("Error synching/analyzing chat:", err);
      setStatus("Error synching/analyzing chat.");
    }
  };

  // Toggle preview handler
  const handleTogglePreview = () => setShowPreview(!showPreview);

  return (
    <div className={`popup-root ${theme}`}>
      <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
      <h2>WhatsApp Chat Analyzer</h2>
      <button id="scanBtn" onClick={handleScan}>
        Scan This Chat
      </button>
      <button id="syncBtn" onClick={handleSync} disabled={syncDisabled}>
        Sync to Cloud
      </button>
      <div id="status">{status}</div>
      <button
        id="toggle-preview-btn"
        className="btn"
        onClick={handleTogglePreview}
        disabled={messages.length === 0}
        style={{ marginTop: "18px", marginBottom: "8px" }}
      >
        {showPreview ? "Hide Preview" : "Preview"}
      </button>
      <Preview messages={messages} visible={showPreview} />
      {analysis && (
        <div id="analysis-card" className="analysis-card">
          <h3>AI Chat Analysis</h3>
      
          <p>
            <strong>Sentiment:</strong> {analysis.sentiment || "N/A"}
          </p>
          <p>
            <strong>Summary:</strong> {analysis.summary || "N/A"}
          </p>
        </div>
      )}
    </div>
  );
}


// Chrome script to scrape WhatsApp messages
function scrapeWhatsAppChat() {
  try {
    const messageElems = document.querySelectorAll("div.copyable-text");
    const messages = [];
    messageElems.forEach((msg) => {
      const meta = msg.getAttribute("data-pre-plain-text") || "";
      const metaMatch = meta.match(/\[(.*?)\]\s(.*?):\s/);
      const timestamp = metaMatch ? metaMatch[1] : "Unknown time";
      const sender = metaMatch ? metaMatch[2] : "You/Other";
      const textElem = msg.querySelector("span._ao3e");
      const text = textElem ? textElem.innerText : "";
      if (text) {
        const isoTime = timestamp;
        console.log(`Scraped message from ${sender} at ${timestamp}: ${text}`);
        messages.push({ "sender" : sender, "timestamp:" : timestamp, "text":text });
      }
    });
    return messages;
  } catch (e) {
    console.error("Error scraping messages:", e);
    return [];
  }
}

export default Popup;
