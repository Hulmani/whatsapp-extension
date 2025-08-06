import React from "react";

export default function Preview({ messages, visible }) {
  if (!visible) return null;

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

  const participants = Array.from(senders).join(" & ") || "N/A";
  const topWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word)
    .join(", ") || "N/A";
  const previewMessages = messages.slice(0, 5);

  return (
    <div id="preview-container">
      <h3>📄 Preview of Scanned Messages</h3>
      <p><strong>Participants:</strong> <span id="participant-names">{participants}</span></p>
      <p><strong>Word Count:</strong> <span id="word-count">{totalWords}</span></p>
      <p><strong>Common Words:</strong> <span id="common-words">{topWords}</span></p>
      <h4>📝 Sample Messages:</h4>
      <ul id="preview-list" className="preview-list">
        {previewMessages.length === 0
          ? <li>Nothing to preview</li>
          : previewMessages.map((msg, idx) => (
              <li key={idx}>{msg.sender || "Someone"}: {msg.text}</li>
            ))}
      </ul>
      <p id="disclaimer" className="disclaimer">
        This is a sample preview. Actual sync functionality is yet to be implemented.
      </p>
    </div>
  );
}