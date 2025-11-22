import pandas as pd

# Load the full dataset
df = pd.read_csv("demo1000.csv")  # replace with your file name

# Column sets
firewall_cols = [
    "Source Port", "Destination Port", "Protocol", "Flow Duration",
    "Fwd PSH Flags", "Bwd PSH Flags", "Fwd URG Flags", "Bwd URG Flags",
    "Fwd Header Length", "Bwd Header Length", "Fwd Packets/s", "Bwd Packets/s",
    "FIN Flag Count", "SYN Flag Count", "RST Flag Count", "PSH Flag Count",
    "ACK Flag Count", "URG Flag Count", "CWE Flag Count", "ECE Flag Count"
]

webserver_cols = [
    "Source Port", "Destination Port", "Protocol", "Flow Duration",
    "Total Fwd Packets", "Total Backward Packets", "Total Length of Fwd Packets",
    "Total Length of Bwd Packets", "Fwd Packet Length Max", "Fwd Packet Length Min",
    "Fwd Packet Length Mean", "Fwd Packet Length Std", "Bwd Packet Length Max",
    "Bwd Packet Length Min", "Bwd Packet Length Mean", "Bwd Packet Length Std",
    "Flow Bytes/s", "Flow Packets/s", "Flow IAT Mean", "Flow IAT Std",
    "Flow IAT Max", "Flow IAT Min"
]

ids_cols = [
    "Source Port", "Destination Port", "Protocol", "Flow Duration",
    "Active Mean", "Active Std", "Active Max", "Active Min",
    "Idle Mean", "Idle Std", "Idle Max", "Idle Min",
    "Init_Win_bytes_forward", "Init_Win_bytes_backward",
    "act_data_pkt_fwd", "min_seg_size_forward"
]

# Save to separate CSVs
df[firewall_cols].to_csv("FirewallLog.csv", index=False)
df[webserver_cols].to_csv("WebserverLog.csv", index=False)
df[ids_cols].to_csv("IDSLog.csv", index=False)

print("CSV files created: FirewallLog.csv, WebserverLog.csv, IDSLog.csv")
