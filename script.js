const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const welcomeScreen = document.getElementById("welcomeScreen");
const chatHistory = document.getElementById("chatHistory");

let conversations = [];
let currentFeature = "Study Mode"; // Track active feature/mode

async function sendMessage() {
    const message = messageInput.value.trim();

    if (message === "") {
        return;
    }

    if (welcomeScreen) {
        welcomeScreen.style.display = "none";
    }

    addMessage(message, "user");
    messageInput.value = "";
    addHistory(message);
    showTyping();

    try {
        // Backend Flask API call
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message,
                feature: currentFeature
            })
        });

        const data = await response.json();
        removeTyping();

        if (data.reply) {
            addMessage(data.reply, "ai");
        } else {
            addMessage("Error: " + (data.error || "Could not generate response from AI."), "ai");
        }
    } catch (error) {
        removeTyping();
        addMessage("Error connecting to backend server. Make sure app.py is running.", "ai");
    }
}


function addMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message " + sender;

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = sender === "user" ? "👤" : "🤖";

    const content = document.createElement("div");
    content.className = "message-content";
    content.innerHTML = formatText(text);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}


function formatText(text) {
    return text
        .replace(/\n/g, "<br>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}


function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}


function showTyping() {
    const typing = document.createElement("div");
    typing.id = "typing";
    typing.className = "message ai";
    typing.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            Typing...
        </div>
    `;
    chatBox.appendChild(typing);
    chatBox.scrollTop = chatBox.scrollHeight;
}


function removeTyping() {
    const typing = document.getElementById("typing");
    if (typing) {
        typing.remove();
    }
}


function handleEnter(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}


function useSuggestion(text) {
    messageInput.value = text;
    sendMessage();
}


function selectFeature(feature) {
    currentFeature = feature; // Set active feature (e.g., Programming Help, Quiz Generator, etc.)
    messageInput.value = "Help me with " + feature;
    messageInput.focus();
}


function newChat() {
    chatBox.innerHTML = "";
    currentFeature = "Study Mode";

    const welcome = document.createElement("div");
    welcome.id = "welcomeScreen";
    welcome.className = "welcome";

    welcome.innerHTML = `
        <div class="welcome-icon">🤖</div>
        <h2>How can I help you today?</h2>
        <p>
            Ask me about your studies, programming,
            notes, projects, or anything you want to learn.
        </p>
        <div class="suggestions">
            <button onclick="useSuggestion('Explain Artificial Intelligence in simple words')">
                📚 Explain AI
            </button>
            <button onclick="useSuggestion('Help me with Python programming')">
                💻 Python Help
            </button>
            <button onclick="useSuggestion('Give me project ideas for Computer Science')">
                💡 Project Ideas
            </button>
            <button onclick="useSuggestion('Explain BFS in simple words')">
                🧠 Explain BFS
            </button>
        </div>
    `;

    chatBox.appendChild(welcome);
}


function addHistory(message) {
    const item = document.createElement("button");
    item.className = "menu-item";
    item.textContent = "💬 " + message.substring(0, 25);
    item.onclick = function () {
        messageInput.value = message;
        messageInput.focus();
    };
    chatHistory.prepend(item);
}


function toggleTheme() {
    document.body.classList.toggle("dark");
    const darkMode = document.body.classList.contains("dark");
    localStorage.setItem("darkMode", darkMode);
}


function loadTheme() {
    const darkMode = localStorage.getItem("darkMode");
    if (darkMode === "true") {
        document.body.classList.add("dark");
    }
}


function showSettings() {
    document.getElementById("settingsModal").style.display = "flex";
}


function closeSettings() {
    document.getElementById("settingsModal").style.display = "none";
}


function handleFile() {
    const fileInput = document.getElementById("fileInput");
    if (fileInput.files.length === 0) {
        return;
    }
    const file = fileInput.files[0];
    addMessage("📎 File selected: " + file.name, "user");
}


function startVoiceInput() {
    if (!("webkitSpeechRecognition" in window)) {
        alert("Voice input is not supported in this browser.");
        return;
    }
    const recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = function(event) {
        messageInput.value = event.results[0][0].transcript;
    };
}

loadTheme();
