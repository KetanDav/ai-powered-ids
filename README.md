<!-- PROJECT TITLE -->
<h1 align="center">🔥 AI-Driven Threat Detection & Prioritization</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Cybersecurity-AI--Driven-blue?style=for-the-badge">
  <img src="https://img.shields.io/badge/Python-3.10+-blue?style=for-the-badge&logo=python">
  <img src="https://img.shields.io/badge/MongoDB-NoSQL-green?style=for-the-badge&logo=mongodb">
  <img src="https://img.shields.io/badge/Frontend-React%20%7C%20Map%20Visualization-pink?style=for-the-badge&logo=react">
</p>

<p align="center">
🚨 <b>Alert Fatigue is Real</b> – SOC teams face thousands of alerts every day, and missing one critical threat can cost millions.<br>
This project solves that by using <b>AI-driven threat detection, prioritization, and visualization in real-time.</b>
</p>

---

## 📖 Table of Contents

- 🚩 [Problem Statement](#-problem-statement)
- ✨ [Features](#-features)
- 🧠 [System Architecture](#-system-architecture)
- 📊 [Screenshots & Visualizations](#-screenshots--visualizations)
- 🛠 [Tech Stack](#-tech-stack)
- ⚡ [Installation & Setup](#-installation--setup)
- 🖥 [Usage](#-usage)
- 📈 [Example Output](#-example-output)
- 🚀 [Future Enhancements](#-future-enhancements)
- 🤝 [Contributing](#-contributing)
- 📚 [References](#-references)

---

<h1 align="center">🚩 Problem Statement</h1>

Security teams face alert fatigue due to thousands of daily alerts.  
This leads to missed critical threats and delayed incident response.

Our project aims to:  
✅ _Detect_ threats in real-time using AI/ML  
✅ _Prioritize_ threats with risk scoring  
✅ _Visualize_ attacks on a global map  
✅ _Explain_ why each alert was classified as a threat

---

## ✨ Features

- 🔍 _AI-Driven Anomaly Detection_ – Trained on CICIDS 2017 dataset
- 📊 _Statistical IP Analysis_ – Track frequency of malicious IPs, destination ports, etc.
- 🌍 _Global Attack Visualization_ – Map attacker IPs on a world map with red markers
- 🏷 _Threat Prioritization & Explanation_ – Risk score, type and reason
- 🛢 _MongoDB Backend_ – Stores predictions in structured JSON format
- 🖥 _Interactive Dashboard_ – Clean UI to view, filter, and analyze threats

---

## 🧠 System Architecture

```mermaid
graph TD
A[Dataset - CICIDS 2017] -->|Data Cleaning & Merging| B[Model Training]
B --> C[Primary ML Model - Anomaly Detection]
C -->|Normal Traffic| D1[Store in MongoDB]
C -->|Malicious Traffic| C2[Secondary ML Model - Attack Type Classification]
C2 --> D2[Store Detailed Results in MongoDB]
D1 --> E[Backend API]
D2 --> E[Backend API]
E --> F[Frontend Dashboard]
F -->|Visualization| G[Global Attack Map + Risk Scores]




```

<h2>📊 Screenshots & Visualizations</h2>
Below are some key screenshots of our ML model training and prediction workflow:<Br><br>

🧠 Model Training – Trained on the CICIDS 2017 dataset to classify network traffic as Normal or Malicious.<br>

🔎 Primary Prediction – First model classifies incoming logs in real time.<br>

🤖 Secondary Analysis (Gemini Model) – If malicious, a secondary ML model classifies the exact attack type (e.g., DDoS, PortScan).<Br>

🛢 Data Storage – Predictions (both normal & malicious) are pushed into MongoDB for dashboard visualization.<br>

🌍 Visualization – Dashboard maps attackers, shows risk scores, and allows filtering for SOC analysis.<br><br>

<img src="./images/1.png" alt="Screenshot 1" />
<img src="./images/2.png" alt="Screenshot 2" />
<img src="./images/3.png" alt="Screenshot 3" />
<img src="./images/4.png" alt="Screenshot 4" />
<img src="./images/5.png" alt="Screenshot 5" />
<img src="./images/6.png" alt="Screenshot 6" />
<img src="./images/7.png" alt="Screenshot 7" />
<img src="./images/8.png" alt="Screenshot 8" />
<img src="./images/9.png" alt="Screenshot 9" />
<img src="./images/10.png" alt="Screenshot 10" />

<!-- PoC Dashboard Screenshots -->
<img src="./images/fulld.png" alt="Full Dashboard" />
<img src="./images/card.png" alt="Card View" />
<img src="./images/ips.png" alt="IP Stats" />
<img src="./images/map.png" alt="Map Panel" />
<img src="./images/pie.png" alt="Pie Chart" />
<img src="./images/stat.png" alt="Stats Panel" />

<!-- MongoDB Dashboard Screenshot -->
<img src="./images/mongod.png" alt="MongoDB Dashboard" />

<h2>🛠 Tech Stack</h2>

Frontend: React.js, Chart.js

Backend: Node.js (Express)

Database: MongoDB

Machine Learning: Scikit-learn, Pandas, NumPy,

Dataset: CICIDS 2017 (Combined & Preprocessed)

<h2>⚡ Installation & Setup</h2>

# 1️⃣ Clone the repo

git clone https://github.com/devansh436/threat-detection.git<Br>
cd threat-detection

# 2️⃣ Install backend dependencies

cd server<br>
npm install

# 3️⃣ Start the backend server

npm run dev

# 4️⃣ Start the frontend (if React)

cd client<br>
npm install<br>
npm run dev

# 5️⃣ Start the python microservice

pip install -r requirements.txt<br>
python3 ml-service.py

<h2>🖥 Usage</h2>
Upload network logs or use sample data<br>
Model will process logs & generate predictions<br>
Visit dashboard → See threats, risk scores & map visualization<br>
Filter results by threat type or risk level

<h2>📈 Example Output</h2>

{<br>
"source_ip": "192.168.15.22",<br>
"dest_ip": "192.168.10.1",<br>
"protocol": "udp",<br>
"threat_score": 15,<br>
"threat_level": "Low",<br>
"reason": "The log shows a single DNS query (UDP port 53) from a local IP to another local IP. This is generally normal network activity.",<br>
"threat_type": "normal_traffic"<br>
}

<h2>🚀 Future Enhancements</h2>

📈 More explainable AI with SHAP/LIME<br>
🧠 Deep Learning models for advanced detection

<h2>🤝 Contributing</h2>

We welcome contributions!
Feel free to fork this repo, make changes, and submit a pull request.
For major changes, open an issue first to discuss what you would like to change.

<h2>👨‍💻 Team Members</h2>

Ketan Dav (Team Lead)<br>
Devansh Deshpande<br>
Dharm Patel<br>
Aksh Patel<br>
Devarsh Dalwadi

<h2>📚 References</h2>

- [CICIDS 2017 Dataset](https://www.unb.ca/cic/datasets/ids-2017.html)
- [Scikit-learn Documentation](https://scikit-learn.org/stable)
- [MongoDB Docs](https://www.mongodb.com/docs/)
