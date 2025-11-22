import "../App.css";
import { useState, useEffect } from "react";

const IPTracker = ({ threatAnalysisData = [] }) => {
  const [ipCounts, setIpCounts] = useState({});

  useEffect(() => {
    const newIpCounts = {};
    threatAnalysisData.forEach((threat) => {
      if (threat && threat.dest_ip) {
        const ip = threat.dest_ip.trim();
        if (isValidIP(ip)) {
          newIpCounts[ip] = (newIpCounts[ip] || 0) + 1;
        }
      }
    });
    setIpCounts(newIpCounts);
  }, [threatAnalysisData]);

  const isValidIP = (ip) => {
    const ipRegex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  const clearData = () => setIpCounts({});

  const chartData = Object.entries(ipCounts).map(([ip, count]) => ({
    ip,
    count,
  }));
  const maxCount =
    chartData.length > 0 ? Math.max(...chartData.map((d) => d.count)) : 0;

  return (
    <div>
      <h2 className="tracker-title">IP Tracker</h2>

      <div className="analysis-box">
        <div className="form-container">
          <div>
            <p className="tracker-subtitle">
              Automatically tracking IPs from threat analysis data
            </p>

            <button type="button" onClick={clearData} className="clear-btn">
              Clear Data
            </button>

            <div className="stats">
              <div className="infoCard low">
                <h3>Total IPs</h3>
                <p>{Object.keys(ipCounts).length}</p>
              </div>
              <div className="infoCard medium">
                <h3>Total Requests</h3>
                <p>{Object.values(ipCounts).reduce((a, b) => a + b, 0)}</p>
              </div>
              <div className="infoCard high">
                <h3>Most Active IP</h3>
                <p>
                  {chartData.length > 0
                    ? chartData.reduce(
                      (max, item) => (item.count > max.count ? item : max),
                      chartData[0]
                    ).ip
                    : "None"}
                </p>
              </div>
            </div>

            {chartData.length > 0 && (
              <div className="infoCard chart-card">
                <h3>IP Address Request Distribution</h3>
                <div className="bar-container">
                  {chartData
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10)
                    .map(({ ip, count }) => {
                      const barHeight = Math.max((count / maxCount) * 250, 20);
                      return (
                        <div key={ip} className="bar-wrapper">
                          <div
                            className="bar"
                            style={{ height: `${barHeight}px` }}
                            title={`${ip}: ${count} requests`}
                          >
                            <div className="bar-count">{count}</div>
                          </div>
                          <div className="bar-label">{ip}</div>
                        </div>
                      );
                    })}
                </div>
                <div className="bar-scale">
                  <span>0 requests</span>
                  <span>Max: {maxCount} requests</span>
                </div>
              </div>
            )}

            {chartData.length > 0 && (
              <div className="ip-list">
                <h3>IP Details ({chartData.length} IPs)</h3>
                <div className="ip-items">
                  {chartData
                    .sort((a, b) => b.count - a.count)
                    .map(({ ip, count }) => (
                      <div key={ip} className="ip-item">
                        <p>{ip}</p>
                        <span>{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IPTracker;
