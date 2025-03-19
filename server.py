import subprocess
from flask import Flask, render_template, request, jsonify
import os


app = Flask(__name__)

# عنوان التلفزيون عبر ADB
TV_IP = "192.168.100.22"  # استبدله بعنوان تلفزيونك

@app.route('/')
def home():
    return render_template("front.html")  # عرض صفحة HTML

@app.route('/play', methods=['POST'])
def play_video():
    data = request.json  # استقبال البيانات من الطلب (JSON)
    video_url = data.get("video_url")  # استخراج رابط الفيديو الذي أدخله المستخدم

    if not video_url:
        return jsonify({"message": "❌ يرجى إدخال رابط فيديو صحيح!"}), 400

    adb_command = [
        "adb", "-s", f"{TV_IP}:5555", "shell", "am", "start",
        "-a", "android.intent.action.VIEW",
        "-d", video_url
    ]
  
    result = subprocess.run(adb_command, capture_output=True, text=True)
   
    # try:
    #     result = subprocess.run(adb_command, capture_output=True, text=True)
    #     if result.returncode == 0:
    #         return jsonify({"message": f"✅ تم تشغيل الفيديو: {video_url}"})
    #     else:
    #         return jsonify({"message": "❌ فشل تشغيل الفيديو!", "error": result.stderr})
    # except Exception as e:
    #     return jsonify({"message": "❌ حدث خطأ أثناء تشغيل الفيديو!", "error": str(e)})
@app.route('/volume_up', methods=['POST'])
def volume_up():
    result = subprocess.run(["adb", "-s", f"{TV_IP}:5555", "shell", "input", "keyevent", "KEYCODE_VOLUME_UP"], capture_output=True, text=True)
    
    if result.returncode == 0:
        return jsonify({"message": "🔊 تم رفع الصوت"})
    else:
        return jsonify({"message": "❌ فشل في رفع الصوت", "error": result.stderr})

# ✅ دالة خفض الصوت
@app.route('/volume_down', methods=['POST'])
def volume_down():
    result = subprocess.run(["adb", "-s", f"{TV_IP}:5555", "shell", "input", "keyevent", "KEYCODE_VOLUME_DOWN"], capture_output=True, text=True)

    if result.returncode == 0:
        return jsonify({"message": "🔉 تم خفض الصوت"})
    else:
        return jsonify({"message": "❌ فشل في خفض الصوت", "error": result.stderr})

# ✅ دالة كتم الصوت
@app.route('/mute', methods=['POST'])
def mute():
    result = subprocess.run(["adb", "-s", f"{TV_IP}:5555", "shell", "input", "keyevent", "KEYCODE_VOLUME_MUTE"], capture_output=True, text=True)

    if result.returncode == 0:
        return jsonify({"message": "🔇 تم كتم الصوت"})
    else:
        return jsonify({"message": "❌ فشل في كتم الصوت", "error": result.stderr})
@app.route('/reboot', methods=['POST'])
def reboot():
    result = subprocess.run(["adb", "reboot"], capture_output=True, text=True)
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))  # Render يحدد المنفذ تلقائيًا
    app.run(host='0.0.0.0', port=port, debug=True)

