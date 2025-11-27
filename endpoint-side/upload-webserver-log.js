// Usage: node upload-webserver-log.js <csvFilePath>
// Uploads one webserver log every 3 seconds

import mongoose from "mongoose";
import fs from "fs";
import { parse } from "csv-parse/sync";

const MONGO_URI =
  "mongodb+srv://ketandav:ketandav@cluster0.achfpg3.mongodb.net/?appName=Cluster0";

// Get CSV file path from command line
const csvFilePath = process.argv[2];
if (!csvFilePath) {
  console.error("Usage: node upload-webserver-log.js <csvFilePath>");
  process.exit(1);
}



// Webserver features (Label excluded)
const webserverFeatures = [
  "Source IP",
  "Destination IP",
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

// Schema is flexible (to prevent key mismatches)
const webserverLogSchema = new mongoose.Schema(
  {},
  { strict: false, timestamps: true }
);
const WebserverLogModel = mongoose.model("WebserverLog", webserverLogSchema);

// --- Upload function ---
async function uploadLogs() {
  await mongoose.connect(MONGO_URI);
  console.log(`✅ Connected to MongoDB as Webserver endpoint`);

  const csvData = fs.readFileSync(csvFilePath, "utf8");
  const logs = parse(csvData, { columns: true, skip_empty_lines: true });

  let i = 0;

  async function uploadNext() {
    if (i >= logs.length) {
      console.log(
        `✅ Uploaded ${logs.length} logs to WebserverLog collection.`
      );
      await mongoose.disconnect();
      return;
    }

    const raw = logs[i];
    const log = {};

    // Include only specified features (skip Label)
    for (const key of webserverFeatures) {
      if (raw[key] !== undefined) log[key] = raw[key];
    }

    try {
      await WebserverLogModel.create({ ...log, createdAt: new Date() });
      console.log(`📤 Uploaded webserver log ${i + 1}/${logs.length}`);
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
  console.error("❌ Fatal error:", err.message);
  process.exit(1);
});
