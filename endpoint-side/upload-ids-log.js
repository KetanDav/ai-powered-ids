// Usage: node upload-ids-log.js <csvFilePath>
// Uploads one log every 1 second

import mongoose from "mongoose";
import fs from "fs";
import { parse } from "csv-parse/sync";

const MONGO_URI =
  "mongodb+srv://ketandav:ketandav@cluster0.achfpg3.mongodb.net/?appName=Cluster0";

const csvFilePath = process.argv[2];
if (!csvFilePath) {
  console.error("Usage: node upload-ids-log.js <csvFilePath>");
  process.exit(1);
}

// --- Define strict schema (no Label field) ---
const idsLogSchema = new mongoose.Schema(
  {
    Source_IP: String,
    Destination_IP: String,
    Flow_ID: String,
    Source_Port: Number,
    Destination_Port: Number,
    Protocol: String,
    Timestamp: String,
    Flow_Duration: Number,
    Total_Fwd_Packets: Number,
    Total_Backward_Packets: Number,
    Total_Length_of_Fwd_Packets: Number,
    Total_Length_of_Bwd_Packets: Number,
    Fwd_Packet_Length_Max: Number,
    Fwd_Packet_Length_Min: Number,
    Fwd_Packet_Length_Mean: Number,
    Fwd_Packet_Length_Std: Number,
    Bwd_Packet_Length_Max: Number,
    Bwd_Packet_Length_Min: Number,
    Bwd_Packet_Length_Mean: Number,
    Bwd_Packet_Length_Std: Number,
    Flow_Bytes_per_s: Number,
    Flow_Packets_per_s: Number,
    Flow_IAT_Mean: Number,
    Flow_IAT_Std: Number,
    Flow_IAT_Max: Number,
    Flow_IAT_Min: Number,
    Fwd_IAT_Total: Number,
    Fwd_IAT_Mean: Number,
  },
  { timestamps: true }
);

const IDSLogModel = mongoose.model("IDSLog", idsLogSchema);

// --- Upload function ---
async function uploadLogs() {
  await mongoose.connect(MONGO_URI);
  console.log(`✅ Connected to MongoDB`);

  const csvData = fs.readFileSync(csvFilePath, "utf8");
  const logs = parse(csvData, { columns: true, skip_empty_lines: true });

  let i = 0;

  async function uploadNext() {
    if (i >= logs.length) {
      console.log(`✅ Uploaded ${logs.length} logs to MongoDB.`);
      await mongoose.disconnect();
      return;
    }

    const raw = logs[i];
    // Build object without Label column
    const log = {
      Source_IP: raw["Source IP"],
      Destination_IP: raw["Destination IP"],
      Flow_ID: raw["Flow ID"],
      Source_Port: Number(raw["Source Port"]),
      Destination_Port: Number(raw["Destination Port"]),
      Protocol: raw["Protocol"],
      Timestamp: raw["Timestamp"],
      Flow_Duration: Number(raw["Flow Duration"]),
      Total_Fwd_Packets: Number(raw["Total Fwd Packets"]),
      Total_Backward_Packets: Number(raw["Total Backward Packets"]),
      Total_Length_of_Fwd_Packets: Number(raw["Total Length of Fwd Packets"]),
      Total_Length_of_Bwd_Packets: Number(raw["Total Length of Bwd Packets"]),
      Fwd_Packet_Length_Max: Number(raw["Fwd Packet Length Max"]),
      Fwd_Packet_Length_Min: Number(raw["Fwd Packet Length Min"]),
      Fwd_Packet_Length_Mean: Number(raw["Fwd Packet Length Mean"]),
      Fwd_Packet_Length_Std: Number(raw["Fwd Packet Length Std"]),
      Bwd_Packet_Length_Max: Number(raw["Bwd Packet Length Max"]),
      Bwd_Packet_Length_Min: Number(raw["Bwd Packet Length Min"]),
      Bwd_Packet_Length_Mean: Number(raw["Bwd Packet Length Mean"]),
      Bwd_Packet_Length_Std: Number(raw["Bwd Packet Length Std"]),
      Flow_Bytes_per_s: Number(raw["Flow Bytes/s"]),
      Flow_Packets_per_s: Number(raw["Flow Packets/s"]),
      Flow_IAT_Mean: Number(raw["Flow IAT Mean"]),
      Flow_IAT_Std: Number(raw["Flow IAT Std"]),
      Flow_IAT_Max: Number(raw["Flow IAT Max"]),
      Flow_IAT_Min: Number(raw["Flow IAT Min"]),
      Fwd_IAT_Total: Number(raw["Fwd IAT Total"]),
      Fwd_IAT_Mean: Number(raw["Fwd IAT Mean"]),
    };

    try {
      await IDSLogModel.create(log);
      console.log(`📤 Uploaded log ${i + 1}/${logs.length}`);
    } catch (err) {
      console.error(`❌ Error uploading log ${i + 1}:`, err.message);
    }

    i++;
    setTimeout(uploadNext, 1000); // Upload one record every second
  }

  uploadNext();
}

// --- Run ---
uploadLogs().catch((err) => {
  console.error("❌ Fatal error:", err.message);
  process.exit(1);
});
