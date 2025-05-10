const NGROK_URL = "https://2b55-2001-16a2-fbc9-4b00-108a-d546-95e6-ed33.ngrok-free.app";
const AUTH_TOKEN = "2uYZtQcdE57rSHwjMnNWWad7RfM_NBViPvmREhJNqqw2xECy";

function playVideo() {
    const videoUrl = document.getElementById("videoUrl").value.trim();
    if (!videoUrl) {
        document.getElementById("status").innerText = "Please put the link !";
        return;
    }
    document.getElementById("status").innerText = "Running...";

    fetch(`${NGROK_URL}/play`, {
        method: 'POST',
        mode: "cors",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AUTH_TOKEN}`
        },
        body: JSON.stringify({ video_url: videoUrl })
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById("status").innerText = data.message;
        })
        .catch(error => {
            document.getElementById("status").innerText = "❌ فشل في إرسال الطلب!";
            console.error("Error:", error);
        });
}

function changeVolume(action) {
    let url = "";

    if (action === 'up') url = `${NGROK_URL}/volume_up`;
    else if (action === 'down') url = `${NGROK_URL}/volume_down`;
    else if (action === 'mute') url = `${NGROK_URL}/mute`;

    console.log("🔊 طلب تم إرساله إلى:", url);

    fetch(url, {
        method: 'POST',
        mode: "cors",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AUTH_TOKEN}`
        }
    })
        .then(response => response.json())
}

function rebootTV() {
    document.getElementById("status").innerText = "⏳ جارٍ إعادة تشغيل التلفزيون...";
    fetch(`${NGROK_URL}/reboot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById("status").innerText = data.message;
        })
        .catch(error => {
            document.getElementById("status").innerText = "❌ فشل في إرسال الطلب!";
            console.error("Error:", error);
        });
}

function playPresetVideo(button) {
    let url = button.getAttribute("data-url");
    document.getElementById("status").innerText = "🎬 تم التشغيل";

    fetch(`${NGROK_URL}/play`, {
        method: 'POST',
        mode: "cors",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AUTH_TOKEN}`
        },
        body: JSON.stringify({ video_url: url })
    });
}
