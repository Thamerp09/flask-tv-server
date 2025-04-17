import subprocess
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS  # ✅ استيراد CORS


app = Flask(__name__)
CORS(app, supports_credentials=True)
TV_IP = "192.168.100.3"  # استبدله بعنوان تلفزيونك

@app.route('/')
def home():
    return render_template('front.html')
@app.route('/play', methods=['POST'])
def play_video():
    data = request.json
    video_url = data.get("video_url")
    print("📥 البيانات المستلمة:", data)
    if not video_url:
        return jsonify({"message": "❌ يرجى إدخال رابط فيديو صحيح!"}), 400

    adb_command = [
        "adb", "-s", f"{TV_IP}:5555", "shell", "am", "start",
        "-a", "android.intent.action.VIEW",
        "-d", video_url
    ]

    print("📺 تشغيل الفيديو بالأمر:", " ".join(adb_command))  # ✅ نطبع الأمر

    result = subprocess.run(adb_command, capture_output=True, text=True)

    print("📤 stderr:", result.stderr)  # ✅ نطبع الرد
    print("📤 return code:", result.returncode)

    if result.returncode == 0:
        return jsonify({"message": f"✅ تم تشغيل الفيديو: {video_url}"})
    else:
        return jsonify({"message": "❌ فشل تشغيل الفيديو!", "error": result.stderr})

@app.route('/volume_up', methods=['POST'])
def volume_up():
    result = subprocess.run(["adb", "-s", f"{TV_IP}:5555", "shell", "input", "keyevent", "KEYCODE_VOLUME_UP"], capture_output=True, text=True)

    if result.returncode == 0:
        return jsonify({"message": "🔊 تم رفع الصوت"})
    else:
        return jsonify({"message": "❌ فشل في رفع الصوت", "error": result.stderr})

@app.route('/volume_down', methods=['POST'])
def volume_down():
    result = subprocess.run(["adb", "-s", f"{TV_IP}:5555", "shell", "input", "keyevent", "KEYCODE_VOLUME_DOWN"], capture_output=True, text=True)

    if result.returncode == 0:
        return jsonify({"message": "🔉 تم خفض الصوت"})
    else:
        return jsonify({"message": "❌ فشل في خفض الصوت", "error": result.stderr})

@app.route('/mute', methods=['POST'])
def mute():
    result = subprocess.run(["adb", "-s", f"{TV_IP}:5555", "shell", "input", "keyevent", "KEYCODE_VOLUME_MUTE"], capture_output=True, text=True)

    if result.returncode == 0:
        return jsonify({"message": "🔇 تم كتم الصوت"})
    else:
        return jsonify({"message": "❌ فشل في كتم الصوت", "error": result.stderr})

@app.route('/reboot', methods=['POST'])
def reboot():
    result = subprocess.run(["adb", "-s", f"{TV_IP}:5555", "shell", "reboot"], capture_output=True, text=True)

    if result.returncode == 0:
        return jsonify({"message": "🔄 يتم إعادة تشغيل التلفزيون الآن..."})
    else:
        return jsonify({"message": "❌ فشل في إعادة تشغيل التلفزيون", "error": result.stderr})

@app.route('/services')
def services():
    return render_template('services.html')
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)



# git add .
# git commit - m "any meassage"
# git push



# command to open video
# "adb", "-s", f"{TV_IP}:5555", "shell", "am", "start",
#         "-n", "com.google.android.youtube.tv/com.google.android.youtube.tv.activity.ShellActivity",
#         "-a", "android.intent.action.VIEW",
#         "-d", video_url


        # "adb", "-s", f"{TV_IP}:5555", "shell", "am", "start" "-a", "android.intent.action.VIEW", "-d", video_url
