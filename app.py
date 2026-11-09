import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from google import genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini API client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

@app.route("/")
def home():
    return send_from_directory(app.root_path, "index.html")

@app.route("/<path:filename>")
def frontend_files(filename):
    return send_from_directory(app.root_path, filename)

@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        user_message = data.get("message", "")
        feature = data.get("feature", "Study Mode")
        
        # Prompt construction
        prompt = f"Act as an AI Study Assistant in '{feature}' mode. User query: {user_message}"

        # Generate response
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt,
            config={"temperature": 0.7},
        )
        
        return jsonify({"reply": response.text})
    
    except Exception as e:
        print("Detailed Error:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001)
