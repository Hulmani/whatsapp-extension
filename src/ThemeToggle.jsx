import React from "react";

export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      id="theme-toggle"
      className="btn secondary"
      style={{ float: "right", marginBottom: "10px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}
      aria-label="Toggle theme"
      onClick={onToggle}
    >
      <span id="theme-icon">
        {theme === "light"
          ? <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="5" fill="#f7c948"/><g stroke="#f7c948" strokeWidth="2"><line x1="11" y1="1" x2="11" y2="4"/><line x1="11" y1="18" x2="11" y2="21"/><line x1="1" y1="11" x2="4" y2="11"/><line x1="18" y1="11" x2="21" y2="11"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="15.66" y1="15.66" x2="17.78" y2="17.78"/><line x1="4.22" y1="17.78" x2="6.34" y2="15.66"/><line x1="15.66" y1="6.34" x2="17.78" y2="4.22"/></g></svg>
          : <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M17.5 13.5A7.5 7.5 0 0 1 8.5 4.5a7.5 7.5 0 1 0 9 9z" fill="#25d366"/></svg>
        }
      </span>
    </button>
  );
}