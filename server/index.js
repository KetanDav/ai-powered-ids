import express from "express"; // needs "type": "module"
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";
import { dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import axios from "axios";
import nodemailer from "nodemailer";

// --- Endpoint Log Schemas and Models ---
const endpointLogSchema = new mongoose.Schema(
  {},
  { strict: false, timestamps: true }
);

// Replace with your actual cluster URLs
const FIREWALL_MONGO_URI =
  process.env.FIREWALL_MONGO_URI || "mongodb+srv://firewall-cluster-url";
const WEBSERVER_MONGO_URI =
  process.env.WEBSERVER_MONGO_URI || "mongodb+srv://webserver-cluster-url";
const IDS_MONGO_URI =
  process.env.IDS_MONGO_URI || "mongodb+srv://ids-cluster-url";

const firewallConn = mongoose.createConnection(FIREWALL_MONGO_URI);
const webserverConn = mongoose.createConnection(WEBSERVER_MONGO_URI);
const idsConn = mongoose.createConnection(IDS_MONGO_URI);

const FirewallLogModel = firewallConn.model("FirewallLog", endpointLogSchema);
const WebserverLogModel = webserverConn.model(
  "WebserverLog",
  endpointLogSchema
);
const IDSLogModel = idsConn.model("IDSLog", endpointLogSchema);

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

// --- Email ALERT Utility --- (Gmail example)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    // Better: keep these in .env
    user: process.env.ALERT_EMAIL_USER || "your@gmail.com",
    pass: process.env.ALERT_EMAIL_PASS || "your-app-password",


  },
});

function sendAdminAlert(subject, body) {
  const mailOptions = {
    from: process.env.ALERT_EMAIL_FROM || "your@gmail.com",
    to: process.env.ALERT_EMAIL_TO || "admin@example.com",

    
    subject,
    text: body,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Failed to send alert email:", error);
    } else {
      console.log("----> EMAIL ALERT SENT TO ADMIN:", info.response);
    }
  });
}

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
async function getGeminiResponse(inputLog) {
  const prompt = `You are a cybersecurity threat detection assistant. 
  I will provide you with raw system logs. 
  Your task is to:
  1. Analyze the logs for suspicious or malicious activity.  
  2. Assign a threat score from 0 to 100, where:
    - 0 = No threat
    - 1 to 30 = Low threat
    - 31 to 70 = Medium threat
    - 71 to 100 = High threat
  3. Explain briefly in 1-2 lines why you assigned this score.

  Input Log:
  ${inputLog}

  Output Format (JSON):
  {
    "source_ip" : <src_ip>,
    "dest_ip" : <dest_ip>,
    "protocol": <ip | tcp>,
    "threat_score": <number>,
    "threat_level": "<Low | Medium | High>",
    "reason": "<short explanation>",
    "threat_type": <attack_name | normal_traffic>
  }
  DO NOT USE MARKDOWN TEXT TO REPRESENT JSON, WRITE JSON IN PLAINTEXT.
  `;

  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// --- Main MongoDB connection ---
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/threat_logs";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// Main log schema
const logSchema = new mongoose.Schema({
  log: Object,
  verdict: Object,
  createdAt: { type: Date, default: Date.now },
});
const LogModel = mongoose.model("Log", logSchema);

// --- Routes ---
app.get("/", (req, res) => {
  res.send({ data: "Hello, Express!" });
});

app.get("/get-log", async (req, res) => {
  const logFile = path.join(__dirname, "logs", "demo1000.csv");
  try {
    const csvData = fs.readFileSync(logFile, "utf8");
    const logs = parse(csvData, { columns: true, skip_empty_lines: true });
    if (logs.length === 0)
      return res
        .status(404)
        .json({ response: null, log: null, error: "No logs found" });

    // Pick a random log
    const randomLogObj = logs[Math.floor(Math.random() * logs.length)];

    // Normalize required fields
    const normalizedLog = {
      source_ip: randomLogObj["Source IP"] || "0.0.0.0",
      dest_ip: randomLogObj[" Destination IP"] || "0.0.0.0",
      protocol:
        randomLogObj["Protocol"] || randomLogObj["protocol"] || "unknown",
      ...randomLogObj,
    };

    const randomLog = Object.entries(normalizedLog)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");

    try {
      const output = await getGeminiResponse(randomLog);
      let verdict = null;
      try {
        verdict = JSON.parse(output);
      } catch {
        verdict = { raw: output };
      }
      await LogModel.create({ log: normalizedLog, verdict });
      res.json({ response: output, log: normalizedLog });
    } catch (geminiErr) {
      console.error(geminiErr);
      res.json({
        response: null,
        log: normalizedLog,
        error: geminiErr.message || "Gemini error",
      });
    }
  } catch (err) {
    console.error(err);
    res.json({
      response: null,
      log: null,
      error: "Failed to process log file.",
    });
  }
});

app.post("/api/predict", async (req, res) => {
  try {
    const response = await axios.post("http://127.0.0.1:5000/predict", {
      features: req.body.features,
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/logs", async (req, res) => {
  try {
    const logs = await LogModel.find().sort({ createdAt: -1 }).limit(100);
    res.json({ logs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch logs from MongoDB." });
  }
});

// --- CUSTOM ML LOGGING ---
setInterval(async () => {
  try {
    const firewallLog = await FirewallLogModel.findOne().sort({
      createdAt: -1,
    });
    const webserverLog = await WebserverLogModel.findOne().sort({
      createdAt: -1,
    });
    const idsLog = await IDSLogModel.findOne().sort({ createdAt: -1 });

    console.log(firewallLog);
    console.log(idsLog);
    console.log(webserverLog);

    if (!firewallLog && !webserverLog && !idsLog) return;

    // Normalize fields so source_ip, dest_ip, protocol always exist
    const mergedLog = {
      source_ip:
        firewallLog?.source_ip ||
        webserverLog?.source_ip ||
        idsLog?.source_ip ||
        firewallLog?.["Source IP"] ||
        webserverLog?.["Source IP"] ||
        idsLog?.["Source IP"] ||
        "0.0.0.0",
      dest_ip:
        firewallLog?.dest_ip ||
        webserverLog?.dest_ip ||
        idsLog?.dest_ip ||
        firewallLog?.["Destination IP"] ||
        webserverLog?.["Destination IP"] ||
        idsLog?.["Destination IP"] ||
        "0.0.0.0",
      protocol:
        firewallLog?.protocol ||
        webserverLog?.protocol ||
        idsLog?.protocol ||
        firewallLog?.["Protocol"] ||
        webserverLog?.["Protocol"] ||
        idsLog?.["Protocol"] ||
        "unknown",
      ...firewallLog?._doc,
      ...webserverLog?._doc,
      ...idsLog?._doc,
    };

    // --- Feature extraction ---
    const featureColumns = [
      "Source Port",
      "Destination Port",
      "Protocol",
      "Flow Duration",
      "Total Fwd Packets",
      "Total Backward Packets",
      "Total Length of Fwd Packets",
      "Total Length of Bwd Packets",
      "Fwd Packet Length Max",
      "Fwd Packet Length Min",
      "Fwd Packet Length Mean",
      "Fwd Packet Length Std",
      "Bwd Packet Length Max",
      "Bwd Packet Length Min",
      "Bwd Packet Length Mean",
      "Bwd Packet Length Std",
      "Flow Bytes/s",
      "Flow Packets/s",
      "Flow IAT Mean",
      "Flow IAT Std",
      "Flow IAT Max",
      "Flow IAT Min",
      "Fwd IAT Total",
      "Fwd IAT Mean",
      "Fwd IAT Std",
      "Fwd IAT Max",
      "Fwd IAT Min",
      "Bwd IAT Total",
      "Bwd IAT Mean",
      "Bwd IAT Std",
      "Bwd IAT Max",
      "Bwd IAT Min",
      "Fwd PSH Flags",
      "Bwd PSH Flags",
      "Fwd URG Flags",
      "Bwd URG Flags",
      "Fwd Header Length",
      "Bwd Header Length",
      "Fwd Packets/s",
      "Bwd Packets/s",
      "Min Packet Length",
      "Max Packet Length",
      "Packet Length Mean",
      "Packet Length Std",
      "Packet Length Variance",
      "FIN Flag Count",
      "SYN Flag Count",
      "RST Flag Count",
      "PSH Flag Count",
      "ACK Flag Count",
      "URG Flag Count",
      "CWE Flag Count",
      "ECE Flag Count",
      "Down/Up Ratio",
      "Average Packet Size",
      "Avg Fwd Segment Size",
      "Avg Bwd Segment Size",
      "Fwd Header Length.1",
      "Fwd Avg Bytes/Bulk",
      "Fwd Avg Packets/Bulk",
      "Fwd Avg Bulk Rate",
      "Bwd Avg Bytes/Bulk",
      "Bwd Avg Packets/Bulk",
      "Bwd Avg Bulk Rate",
      "Subflow Fwd Packets",
      "Subflow Fwd Bytes",
      "Subflow Bwd Packets",
      "Subflow Bwd Bytes",
      "Init_Win_bytes_forward",
      "Init_Win_bytes_backward",
      "act_data_pkt_fwd",
      "min_seg_size_forward",
      "Active Mean",
      "Active Std",
      "Active Max",
      "Active Min",
      "Idle Mean",
      "Idle Std",
      "Idle Max",
      "Idle Min",
    ];
    console.log(mergedLog);
    console.log("hello");
    const features = featureColumns.map((col) => {
      let val = mergedLog[col];
      return typeof val === "string" ? Number(val) : val;
    });

    let prediction = 0;
    try {
      const response = await axios.post("http://127.0.0.1:5000/predict", {
        features,
      });
      prediction = response.data.prediction[0];
    } catch (mlErr) {
      console.error("ML service error:", mlErr.message);
      prediction = 1; // fallback
    }

    // --- Store in DB ---
    if (prediction === 0) {
      await LogModel.create({
        log: mergedLog,
        verdict: {
          threat_score: 0,
          threat_type: "normal_traffic",
          reason: "Classified as benign (0) by custom ML model",
          threat_level: "Low",
        },
      });
      console.log("CUSTOM ML LOGGING: Added benign log to MongoDB");
    } else if (prediction === 1) {
      const logString = Object.entries(mergedLog)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
      const output = await getGeminiResponse(logString);
      let verdict = null;
      try {
        verdict = JSON.parse(output);
      } catch {
        verdict = { raw: output };
      }
      await LogModel.create({ log: mergedLog, verdict });
      console.log("CUSTOM ML LOGGING: Added malicious log + Gemini verdict");

      // EMAIL ADMIN ALERT (same idea as second code)
      sendAdminAlert(
        "IDS ALERT: High Risk Packet Detected",
        `A high risk packet was detected!\nDetails:\n${logString}`
      );
    } else {
      await LogModel.create({
        log: mergedLog,
        verdict: {
          threat_type: prediction,
          reason: "Unknown prediction from custom ML model",
        },
      });
      console.log("CUSTOM ML LOGGING: Added log with unknown prediction");
    }
  } catch (err) {
    console.error("CUSTOM ML LOGGING: Failed to process log:", err.message);
  }
}, 7000);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
