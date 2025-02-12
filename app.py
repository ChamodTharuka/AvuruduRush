from flask import Flask, render_template, jsonify, request
import json
import os

app = Flask(__name__)
app.secret_key = "avurudu_rush_2024"

# Simple JSON file-based storage for scores
SCORES_FILE = "scores.json"

def load_scores():
    if os.path.exists(SCORES_FILE):
        with open(SCORES_FILE, 'r') as f:
            return json.load(f)
    return []

def save_score(player_name, score):
    scores = load_scores()
    scores.append({"name": player_name, "score": score})
    scores.sort(key=lambda x: x["score"], reverse=True)
    scores = scores[:10]  # Keep only top 10
    with open(SCORES_FILE, 'w') as f:
        json.dump(scores, f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/leaderboard')
def leaderboard():
    scores = load_scores()
    return render_template('leaderboard.html', scores=scores)

@app.route('/api/submit_score', methods=['POST'])
def submit_score():
    data = request.get_json()
    save_score(data['name'], data['score'])
    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
