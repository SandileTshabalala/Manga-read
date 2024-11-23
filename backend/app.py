from flask import Flask, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

KITSU_API_BASE = "https://kitsu.io/api/edge"

@app.route('/api/anime', methods=['GET'])
def get_anime_list():
    try:
        # Get trending anime from Kitsu API
        response = requests.get(f"{KITSU_API_BASE}/trending/anime", headers={
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json'
        })
        data = response.json()
        
        # Transform the data to match our frontend structure
        anime_list = []
        for item in data['data']:
            attributes = item['attributes']
            anime_list.append({
                'id': item['id'],
                'title': attributes['canonicalTitle'],
                'image': attributes['posterImage']['large'],
                'description': attributes['synopsis']
            })
        
        return jsonify(anime_list)
    except Exception as e:
        print(f"Error fetching anime list: {str(e)}")
        return jsonify({"error": "Failed to fetch anime list"}), 500

@app.route('/api/anime/<string:anime_id>', methods=['GET'])
def get_anime_details(anime_id):
    try:
        # Get anime details from Kitsu API
        response = requests.get(f"{KITSU_API_BASE}/anime/{anime_id}", headers={
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json'
        })
        data = response.json()
        
        attributes = data['data']['attributes']
        anime = {
            'id': data['data']['id'],
            'title': attributes['canonicalTitle'],
            'image': attributes['posterImage']['large'],
            'description': attributes['synopsis'],
            'rating': attributes['averageRating'],
            'status': attributes['status'],
            'episodeCount': attributes['episodeCount'],
            'episodeLength': attributes['episodeLength'],
            'startDate': attributes['startDate'],
            'endDate': attributes['endDate'],
            'ageRating': attributes['ageRating'],
            'ageRatingGuide': attributes['ageRatingGuide']
        }
        
        return jsonify(anime)
    except Exception as e:
        print(f"Error fetching anime details: {str(e)}")
        return jsonify({"error": "Failed to fetch anime details"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
