// Usage: node upload-firewall-log.js <csvFilePath>
// Uploads one firewall log every 3 seconds

import mongoose from "mongoose";
import fs from "fs";
import { parse } from "csv-parse/sync";

const MONGO_URI =
  "mongodb+srv://ketandav:ketandav@cluster0.achfpg3.mongodb.net/?appName=Cluster0";

// Get CSV file path from command line
const csvFilePath = process.argv[2];
if (!csvFilePath) {
  console.error("Usage: node upload-firewall-log.js <csvFilePath>");
  process.exit(1);
}

// Columns to upload (Label excluded)
const firewallFeatures = [
  "Source IP",
  "Destination IP",
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
];

// Flexible schema (accepts all fields)
const firewallLogSchema = new mongoose.Schema(
  {},
  { strict: false, timestamps: true }
);
const FirewallLogModel = mongoose.model("FirewallLog", firewallLogSchema);

// --- Upload function ---
async function uploadLogs() {
  await mongoose.connect(MONGO_URI);
  console.log(`✅ Connected to MongoDB as Firewall endpoint`);

  const csvData = fs.readFileSync(csvFilePath, "utf8");
  const logs = parse(csvData, { columns: true, skip_empty_lines: true });

  let i = 0;

  async function uploadNext() {
    if (i >= logs.length) {
      console.log(`✅ Uploaded ${logs.length} logs to FirewallLog collection.`);
      await mongoose.disconnect();
      return;
    }

    const raw = logs[i];
    const log = {};

    // Only include firewall features (ignore Label)
    for (const key of firewallFeatures) {
      if (raw[key] !== undefined) log[key] = raw[key];
    }

    try {
      await FirewallLogModel.create({ ...log, createdAt: new Date() });
      console.log(`📤 Uploaded firewall log ${i + 1}/${logs.length}`);
    } catch (err) {
      console.error(`❌ Error uploading log ${i + 1}:`, err.message);
    }

    i++;
    setTimeout(uploadNext, 3000); // Upload one log every 3 seconds
  }

  uploadNext();
}

// --- Run ---
uploadLogs().catch((err) => {
  console.error("❌ Error uploading logs:", err.message);
  process.exit(1);
});
