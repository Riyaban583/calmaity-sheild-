const apiKey = "AIzaSyCdxnIPDON9l6xuqG_O5bQFAFOS9SJWdw8"; // Replace with your actual API key
const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function sendMessage() {
    const userInput = document.getElementById("prompt").value.trim();
    if (!userInput) return;

    displayMessage(userInput, "user");
    document.getElementById("prompt").value = "";

    const response = await getBotResponse(userInput);
    displayMessage(response, "bot");
}

async function getBotResponse(text) {
    try {
        const requestBody = JSON.stringify({
            contents: [{ parts: [{ text }] }]
        });

        const response = await fetch(`${apiUrl}?key=${apiKey}`, { // Corrected template literal usage
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: requestBody
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error: ${response.status} - ${errorText}`); // Corrected error message formatting
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that.";
    } catch (error) {
        console.error("Error fetching response:", error);
        return "There was an issue connecting to the chatbot. Please try again later.";
    }
}

function displayMessage(message, sender) {
    const chatContainer = document.getElementById("chatContainer");
    const chatBox = document.createElement("div");
    chatBox.className = `${sender}-message`; // Corrected class name formatting
    chatBox.textContent = message;
    chatContainer.appendChild(chatBox);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

document.getElementById("prompt").addEventListener("keypress", handleKeyPress);