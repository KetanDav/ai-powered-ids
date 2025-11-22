import { useState, useEffect, useContext } from "react";
import LogAnalysis from "../components/LogAnalysis";
import { IpContext } from "../components/IpContext";
import PieChart from "../components/PieChart";
import "../App.css";
import IPTracker from "../components/IPTracker";

function App() {
  // Second interval to increment logCount every 10 seconds
  const [logCount, setLogCount] = useState(() => {
    const stored = localStorage.getItem("logCount");
    return stored ? parseInt(stored, 10) : 1;
  });
  useEffect(() => {
    const logCountIntervalId = setInterval(() => {
      setLogCount((prev) => {
        const next = prev + 1;
        localStorage.setItem("logCount", next);
        return next;
      });
    }, 10000);
    return () => clearInterval(logCountIntervalId);
  }, []);
  const { setLatestIp } = useContext(IpContext);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let intervalId;
    async function fetchLogs() {
      try {
        const res = await fetch("http://localhost:3000/logs");
        const data = await res.json();
        console.log("Fetched logs from API:", data.logs);
        if (data.logs && Array.isArray(data.logs)) {
          const latestLogs = data.logs.slice(0, logCount);
          const protocolMap = {
            1: "ICMP", 2: "IGMP", 6: "TCP", 17: "UDP", 41: "IPv6", 47: "GRE", 50: "ESP", 51: "AH", 58: "ICMPv6", 89: "OSPF"
          };

          const mergedLogs = latestLogs.map(l => {
            const log = l.log || {};
            const verdict = l.verdict || {};
            // Extract from nested log object, fallback to empty string
            return {
              source_ip: log.source_ip || "",
              dest_ip: log.dest_ip || "",
              protocol: protocolMap[log.protocol] || log.protocol || "",
              threat_score: verdict.threat_score,
              threat_type: verdict.threat_type,
              reason: verdict.reason,
              threat_level: verdict.threat_level,
            };
          });
          console.log("Merged logs for frontend:", mergedLogs);
          setLogs(mergedLogs);
          if (mergedLogs.length > 0) {
            setLatestIp(mergedLogs[0].dest_ip || null);
          }
          setError(null);
        } else {
          console.error("No logs found or logs not an array", data);
          setLogs([]);
          setError("No logs found");
        }
      } catch (err) {
        console.error("Error fetching logs:", err);
        setError("🚨 Failed to fetch logs from server");
        setLogs([]);
      }

    }
    fetchLogs();

    intervalId = setInterval(fetchLogs, 10000);
    return () => clearInterval(intervalId);
  }, [logCount]);

  return (
    <div className="page">
      <div
        className="content-container"
        style={{
          display: "flex",
          flexDirection: "row", // 🔥 left + right layout
          gap: "2vw",
          alignItems: "stretch",
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem 1rem",
          boxSizing: "border-box",
          minHeight: "70vh",
        }}
      >
        {/* Part 1: Log Receiver */}
        <div
          style={{
            maxWidth: "45%",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
            Live SIEM Log Stream
          </h2>

          <div
            className="analysis-box"
            style={{
              flex: 1,
              minWidth: '20vw',
              width: "100%",
              borderRadius: "16px",
              padding: "1.5rem 1rem",
              display: "block", // ✅ flex column so logs stack properly
              gap: "1rem",
              minHeight: "30vh", // ✅ keeps some presence even when empty
              maxHeight: "215vh", // ✅ cap growth
              overflowY: "auto", // ✅ scroll when overflowing
            }}
          >
            {error && (
              <div style={{ color: "red", marginBottom: "1.5em" }}>{error}</div>
            )}

            {!error && logs.length === 0 && (
              <div style={{ color: "yellow", marginBottom: "2em" }}>
                Waiting for logs...
              </div>
            )}

            {logs.map(
              (response, idx) =>
                response &&
                !response.error && <LogAnalysis key={idx} response={response} />
            )}
          </div>
        </div>

        {/* Part 2: Right side (stacked vertically) */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            maxWidth: "50%",
            borderRadius: "16px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            overflow: "hidden",
            height: "auto",
            maxHeight: "2450px",
          }}
        >
          <div style={{ width: "100%" }}>
            <PieChart threatAnalysisData={logs} />
          </div>

          <div style={{ width: "100%", marginTop: "32px" }}>
            <IPTracker threatAnalysisData={logs} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
