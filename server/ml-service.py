from flask import Flask, request, jsonify
import numpy as np
import random

app = Flask(__name__)

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        print("Received data:", data)

        raw_features = data.get("features", [])
        cleaned_features = []
        for f in raw_features:
            if isinstance(f, dict):
                try:
                    val = list(f.values())[0]
                    f = float(val)
                except Exception:
                    f = np.nan
            elif f is None:
                f = np.nan
            cleaned_features.append(f)

        features = np.array(cleaned_features).reshape(1, -1)
        print("Processed features shape:", features.shape)

        
        possible_classes = [0, 1]  # binary (Normal / Attack)
        prediction = random.choice(possible_classes)

        print("Prediction:", prediction)
        return jsonify({"prediction": [prediction]})

    except Exception as e:
        print("Error in /predict:", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
