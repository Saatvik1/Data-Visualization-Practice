#Basic backend template from flask documentation

from flask import Flask, jsonify, request
import csv
from flask_cors import CORS



app = Flask(__name__)
CORS(app)

def read_csv_file(filepath):
    data = []
    with open(filepath, newline='', encoding='utf-8', errors='replace') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            data.append(row)
    return data

@app.route('/data', methods=['GET'])
def get_csv_data():
    data = read_csv_file('../data/spotify-2023.csv')  
    return jsonify(data)

@app.route('/test', methods=['GET'])
def test():
    return "WHY"

@app.route('/topfive', methods=['POST'])
def top_five():
    counts = request.json  
    sorted_counts = sorted(counts.items(), key=lambda x: x[1], reverse=True)
    top_five = sorted_counts[:5]
    
    other_count = sum(count for _, count in sorted_counts[5:])
    
    result = {key: value for key, value in top_five}
    
    if other_count > 0:
        result['Other'] = other_count
    
    return jsonify(result)



if __name__ == '__main__':
    app.run(debug=True, port=5000) 