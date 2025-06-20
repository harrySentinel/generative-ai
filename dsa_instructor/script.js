// script.js
const chatInput = document.querySelector(".chat-input textarea");
const sendBtn = document.querySelector("#send-btn");
const chatbox = document.querySelector(".chatbox");

let userMessage;

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent = className === "outgoing" 
        ? `<p></p>` 
        : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
};

const createTypingLi = () => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", "incoming");
    chatLi.innerHTML = `
        <span class="material-symbols-outlined">smart_toy</span>
        <div class="typing-animation">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>`;
    return chatLi;
};

// --- THIS IS THE CORRECTED, ROBUST FUNCTION ---
const generateResponse = async (typingLi) => {
    const API_URL = "http://localhost:3000/chat";
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
    };

    try {
        const res = await fetch(API_URL, requestOptions);
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        
        const newChatLi = createChatLi("", "incoming");
        // Use marked.parse to render Markdown from AI, including code blocks
        newChatLi.querySelector("p").innerHTML = marked.parse(data.reply.trim());
        chatbox.replaceChild(newChatLi, typingLi);

    } catch (error) {
        const errorLi = createChatLi("", "incoming error");
        errorLi.querySelector("p").textContent = `Oops! Something went wrong. ${error.message}`;
        chatbox.replaceChild(errorLi, typingLi);

    } finally {
        chatbox.scrollTo(0, chatbox.scrollHeight);
    }
};

const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    chatInput.value = "";
    chatInput.style.height = 'auto';

    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    const typingLi = createTypingLi();
    chatbox.appendChild(typingLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    
    // Pass the "typing" element to the response generator
    generateResponse(typingLi);
};

chatInput.addEventListener("input", () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleChat();
    }
});

sendBtn.addEventListener("click", handleChat);