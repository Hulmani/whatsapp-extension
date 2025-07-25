{
"manifest_version": 3,
"name": "WhatsApp Chat Analyzer",
"version": "1.0",
"description": "Scan WhatsApp chats and sync enriched data to cloud (placeholder).",
"permissions": ["storage", "activeTab", "scripting"],
"host_permissions": ["https://web.whatsapp.com/*"],
"action": {
"default_popup": "popup.html",
"default_icon": {
"16": "icons/icon16.png",
"48": "icons/icon48.png",
"128": "icons/icon128.png"
}
},
"background": {
"service_worker": "background.js"
},
"icons": {
"16": "icons/icon16.png",
"48": "icons/icon48.png",
"128": "icons/icon128.png"
}
}