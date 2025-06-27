// main.js

// --- TV Control Variables (Ensure these are correctly set for your NGROK tunnel) ---
const NGROK_URL = "https://2b55-2001-16a2-fbc9-4b00-108a-d546-95e6-ed33.ngrok-free.app"; // استبدل هذا إذا تغير
const AUTH_TOKEN = "2uYZtQcdE57rSHwjMnNWWad7RfM_NBViPvmREhJNqqw2xECy"; // استبدل هذا إذا تغير

// --- Theme Toggle Logic ---
document.addEventListener('DOMContentLoaded', function () {
    const themeToggleButton = document.getElementById('theme-toggle');
    const bodyElement = document.body;
    const currentTheme = localStorage.getItem('theme');

    function setTheme(theme) {
        if (theme === 'dark') {
            bodyElement.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            if (themeToggleButton) {
                themeToggleButton.setAttribute('aria-pressed', 'true');
                themeToggleButton.setAttribute('aria-label', 'Switch to light mode'); // تحديث aria-label
            }
        } else { // 'light' or null
            bodyElement.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            if (themeToggleButton) {
                themeToggleButton.setAttribute('aria-pressed', 'false');
                themeToggleButton.setAttribute('aria-label', 'Switch to dark mode'); // تحديث aria-label
            }
        }
    }

    // Apply saved theme or default
    if (currentTheme) {
        setTheme(currentTheme);
    } else {
        // Default to light theme or check system preference
        // For simplicity, defaulting to light:
        setTheme('light');
    }

    // Event listener for the theme toggle button
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', function() {
            if (bodyElement.classList.contains('dark-mode')) {
                setTheme('light');
            } else {
                setTheme('dark');
            }
        });
    }
});


// --- TV Control Functions ---
async function sendTvApiRequest(endpoint, body = null, statusElementId = "status") {
    const statusElement = document.getElementById(statusElementId);
    if (!statusElement) {
        console.error(`Status element with ID '${statusElementId}' not found.`);
        return;
    }

    statusElement.innerText = "⏳ Sending command...";

    const fetchOptions = {
        method: 'POST',
        mode: "cors", // Important for NGROK if it's a different origin
        credentials: "omit", // "include" might cause issues if not configured server-side for credentials
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AUTH_TOKEN}` // Ensure AUTH_TOKEN is correct
        }
    };

    if (body) {
        fetchOptions.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${NGROK_URL}${endpoint}`, fetchOptions); // Ensure endpoint starts with '/'
        const data = await response.json(); // Assume server always returns JSON

        if (statusElement) {
            statusElement.innerText = data.message || (response.ok ? "✅ Success!" : "❌ Failed!");
        }
        if (!response.ok) {
            console.error("Server error response:", data);
        }
        return data; // Return data for further processing if needed
    } catch (error) {
        if (statusElement) {
            statusElement.innerText = "❌ Request failed! Check console.";
        }
        console.error("Fetch Error:", error);
        // More specific error for user
        if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
            if (statusElement) statusElement.innerText = "❌ Network error or NGROK/Server unreachable.";
        }
        throw error; // Re-throw for callers if they need to handle it
    }
}


function playVideo() {
    const videoUrlInput = document.getElementById("videoUrl");
    if (!videoUrlInput) {
        console.error("Video URL input not found.");
        return;
    }
    const videoUrl = videoUrlInput.value.trim();

    if (!videoUrl) {
        const statusEl = document.getElementById("status");
        if (statusEl) statusEl.innerText = "❌ Please put the link!";
        return;
    }
    sendTvApiRequest("/play", { video_url: videoUrl });
}

function changeVolume(action) {
    let endpoint = "";
    if (action === 'up') endpoint = '/volume_up';
    else if (action === 'down') endpoint = '/volume_down';
    else if (action === 'mute') endpoint = '/mute';
    else {
        console.error("Invalid volume action:", action);
        return;
    }
    console.log("🔊 Sending volume request to:", endpoint);
    sendTvApiRequest(endpoint);
}

function rebootTV() { // Changed from reboot to rebootTV to avoid conflict if 'reboot' is a global var
    sendTvApiRequest("/reboot");
}

function playPresetVideo(buttonElement) {
    if (!buttonElement) {
        console.error("Button element not provided for preset video.");
        return;
    }
    const url = buttonElement.getAttribute("data-url");
    if (url) {
        const statusEl = document.getElementById("status");
        if (statusEl) statusEl.innerText = `🎬 Playing preset: ${buttonElement.textContent.trim()}`;
        sendTvApiRequest("/play", { video_url: url });
    } else {
        console.error("data-url attribute missing on preset button:", buttonElement);
    }
}

// If you have a "Test Mute" button that calls NGROK directly without using Flask server as proxy
// function testMuteDirectly() {
//     const statusElement = document.getElementById("statusE"); // Or "status"
//     statusElement.innerText = "⏳ Testing mute directly...";
//     fetch(`${NGROK_URL}/mute`, { // Assuming NGROK server has a /mute endpoint for this
//         method: 'POST',
//         mode: "cors",
//         headers: {
//             'Authorization': `Bearer ${AUTH_TOKEN}`,
//             'Content-Type': 'application/json'
//         }
//     })
//     .then(response => {
//         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//         return response.json();
//     })
//     .then(data => {
//         statusElement.innerText = data.message || "✅ Mute test successful (direct).";
//         console.log("Direct Mute Test Response:", data);
//     })
//     .catch(error => {
//         statusElement.innerText = "❌ Direct mute test failed!";
//         console.error("Direct Mute Test Error:", error);
//     });
// }

// --- Currency Converter (if it's on the same page or loaded dynamically) ---
// This function was previously defined in Currency Conventor HTML.
// If that page is separate and loads its own JS, keep it there.
// If you want it in this global main.js, ensure elements exist before calling.
async function convertCurrency() { // Renamed from convert to avoid potential conflicts
    const amountInput = document.getElementById("amount");
    const fromCurrencySelect = document.getElementById("FromCurrency");
    const toCurrencySelect = document.getElementById("ToCurrency");
    const resultElement = document.getElementById("result");

    // Ensure all elements are present before proceeding
    if (!amountInput || !fromCurrencySelect || !toCurrencySelect || !resultElement) {
        console.warn("Currency converter elements not found. Skipping conversion.");
        return;
    }

    const apiKey = "e2e3c8a326c999a6e65b04d6da06002f"; // Your API Key
    const amount = parseFloat(amountInput.value);
    const from = fromCurrencySelect.value;
    const to = toCurrencySelect.value;

    if (isNaN(amount) || amount <= 0) {
        resultElement.innerText = "❌ Please enter a valid positive amount.";
        return;
    }
    if (from === to) {
        resultElement.innerText = `✅ ${amount.toFixed(2)} ${from} = ${amount.toFixed(2)} ${to}`;
        return;
    }

    const url = `https://api.exchangerate.host/convert?access_key=${apiKey}&from=${from}&to=${to}&amount=${amount}`;
    resultElement.innerText = "⏳ Converting...";

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.success === true && typeof data.result === "number") {
            resultElement.innerText = `✅ ${amount.toFixed(2)} ${from} = ${data.result.toFixed(2)} ${to}`;
        } else {
            let errorMessage = "❌ Conversion failed.";
            if (data && data.error && data.error.info) {
                errorMessage = `❌ Error: ${data.error.info}`;
            } else if (response && !response.ok) { // Check response object
                errorMessage = `❌ HTTP error! Status: ${response.status}`;
            }
            resultElement.innerText = errorMessage;
            console.log("API Response (failure or unexpected):", data);
        }
    } catch (error) {
        console.error("Fetch/Network Error (Currency):", error);
        resultElement.innerText = "❌ Something went wrong. Check your internet connection or the console.";
    }
}
// If you have a convert button on the page that uses this, its onclick should be "convertCurrency()"
// e.g., <button onclick="convertCurrency()">Convert</button>