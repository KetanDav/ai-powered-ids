import React, { useState, useEffect } from "react";

const PieChart = ({ threatAnalysisData = [], onClearHistory }) => {
  const [threatData, setThreatData] = useState([]);
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [newThreatType, setNewThreatType] = useState("");
  const [manualThreats, setManualThreats] = useState([]);
  const [threatColorMap, setThreatColorMap] = useState({}); // Dynamic color mapping

  // Predefined color palette for dynamic assignment
  const colorPalette = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#c084fc",
    "#e879f9",
    "#ec4899",
    "#f43f5e",
    "#fb7185",
    "#fda4af",
    "#fecaca",
    "#fed7aa",
    "#fef3c7",
    "#d9f99d",
    "#bbf7d0",
    "#a7f3d0",
    "#99f6e4",
    "#a5f3fc",
    "#bae6fd",
    "#ddd6fe",
    "#e9d5ff",
    "#f3e8ff",
    "#fce7f3",
    "#dc2626",
    "#ea580c",
    "#d97706",
    "#65a30d",
    "#16a34a",
    "#059669",
    "#0d9488",
    "#0891b2",
    "#0284c7",
    "#2563eb",
    "#4f46e5",
    "#7c3aed",
    "#9333ea",
    "#a21caf",
    "#be185d",
    "#e11d48",
    "#b91c1c",
    "#c2410c",
    "#b45309",
    "#4d7c0f",
    "#15803d",
    "#047857",
    "#0f766e",
    "#0e7490",
    "#0369a1",
    "#1d4ed8",
    "#4338ca",
    "#6d28d9",
    "#7e22ce",
    "#a21caf",
    "#be185d",
    "#e11d48",
  ];

  // Generate a unique color for a threat type
  const getColorForThreatType = (threatType) => {
    // If already assigned a color, return it
    if (threatColorMap[threatType]) {
      return threatColorMap[threatType];
    }

    // Get already used colors
    const usedColors = Object.values(threatColorMap);

    // Find first available color from palette
    let availableColor = colorPalette.find(
      (color) => !usedColors.includes(color)
    );

    // If all palette colors are used, generate a random unique color
    if (!availableColor) {
      availableColor = generateRandomColor(threatType, usedColors);
    }

    // Update the color map
    setThreatColorMap((prev) => ({
      ...prev,
      [threatType]: availableColor,
    }));

    return availableColor;
  };

  // Generate a random unique color that's not already used
  const generateRandomColor = (threatType, usedColors) => {
    let attempts = 0;
    let color;

    do {
      // Use threat type string to generate a consistent seed
      let hash = 0;
      for (let i = 0; i < threatType.length; i++) {
        hash = threatType.charCodeAt(i) + ((hash << 5) - hash) + attempts;
      }

      // Generate HSL color with good saturation and lightness
      const hue = Math.abs(hash % 360);
      const saturation = 60 + (Math.abs(hash) % 40); // 60-100%
      const lightness = 45 + (Math.abs(hash) % 20); // 45-65%

      color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      attempts++;
    } while (usedColors.includes(color) && attempts < 50);

    return color;
  };

  // Process threat analysis data to create chart data
  useEffect(() => {
    // Combine both automatic analysis data and manual threat entries
    const allThreats = [...threatAnalysisData, ...manualThreats];

    if (allThreats.length === 0) {
      setThreatData([]);
      return;
    }

    const threatCounts = {};

    allThreats.forEach((analysis) => {
      if (analysis && analysis.threat_type) {
        const threatType = analysis.threat_type;
        threatCounts[threatType] = (threatCounts[threatType] || 0) + 1;
      }
    });

    const processedData = Object.entries(threatCounts).map(([type, count]) => ({
      type: type,
      count: count,
      color: getColorForThreatType(type), // Dynamically assign unique color
    }));

    setThreatData(processedData);
  }, [threatAnalysisData, manualThreats]);

  // Add manual threat type
  const addThreatType = () => {
    if (newThreatType.trim()) {
      const threatType = newThreatType.trim();
      setManualThreats((prev) => [...prev, { threat_type: threatType }]);
      setNewThreatType("");
    }
  };

  // Handle key press in input
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addThreatType();
    }
  };

  // Clear all data (both manual and analysis data)
  const clearAllData = () => {
    setManualThreats([]);
    setThreatColorMap({}); // Clear color mappings
    if (onClearHistory) {
      onClearHistory();
    }
  };

  // Calculate total and percentages
  const totalThreats = threatData.reduce((sum, item) => sum + item.count, 0);
  const dataWithPercentages = threatData.map((item) => ({
    ...item,
    percentage: ((item.count / totalThreats) * 100).toFixed(1),
  }));

  // Create SVG path for pie slices
  const createPieSlice = (
    startAngle,
    endAngle,
    innerRadius = 0,
    outerRadius = 100
  ) => {
    const start = polarToCartesian(0, 0, outerRadius, endAngle);
    const end = polarToCartesian(0, 0, outerRadius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    const d = [
      "M",
      0,
      0,
      "L",
      start.x,
      start.y,
      "A",
      outerRadius,
      outerRadius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      "Z",
    ].join(" ");

    return d;
  };

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  // Generate pie slices
  let currentAngle = 0;
  const pieSlices = dataWithPercentages.map((item, index) => {
    const sliceAngle = (item.count / totalThreats) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    const slice = {
      ...item,
      startAngle,
      endAngle,
      path: createPieSlice(startAngle, endAngle),
      index,
    };

    currentAngle += sliceAngle;
    return slice;
  });

  const svgStyle = {
    width: "320px",
    height: "320px",
    margin: "0 auto",
    display: "block",
  };

  const legendStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "var(--space-3)",
    marginTop: "var(--space-6)",
    justifyContent: "center",
  };

  const legendItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-2)",
    padding: "var(--space-2) var(--space-3)",
    background: "var(--color-elevated)",
    borderRadius: "var(--radius-sm)",
    border: "1px solid rgba(255,255,255,0.08)",
    fontSize: "14px",
    color: "var(--color-text)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  const statsContainerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "var(--space-4)",
    marginTop: "var(--space-6)",
  };

  const statItemStyle = {
    background: "var(--color-elevated)",
    padding: "var(--space-4)",
    borderRadius: "var(--radius-md)",
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.06)",
  };

  return (
    <div>
      <h2
        style={{
          textAlign: "center",
          marginBottom: "var(--space-6)",
          color: "var(--color-text)",
          fontSize: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-4)",
        }}
      >
        Threat Type Distribution
      </h2>
      <div className="analysis-box">
        {threatData.length > 0 && (
          <button
            onClick={clearAllData}
            style={{
              padding: "8px 16px",
              fontSize: "12px",
              background: "var(--color-danger)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              fontWeight: "600",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => (e.target.style.background = "#dc2626")}
            onMouseOut={(e) =>
              (e.target.style.background = "var(--color-danger)")
            }
          >
            Clear All
          </button>
        )}
        <div>
          {threatData.length === 0 ? (
            // Empty state
            <div
              style={{
                textAlign: "center",
                padding: "var(--space-10)",
                color: "var(--color-text-muted)",
              }}
            >
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  margin: "0 auto var(--space-4)",
                  borderRadius: "50%",
                  border: "3px dashed rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "48px",
                }}
              >
                📊
              </div>
              <h3
                style={{
                  color: "var(--color-text-muted)",
                  marginBottom: "var(--space-2)",
                }}
              >
                No Threats Detected Yet
              </h3>
              <p
                style={{
                  color: "var(--color-text-muted)",
                  fontSize: "14px",
                  maxWidth: "300px",
                  margin: "0 auto",
                }}
              >
                Start analyzing log entries or manually add threat types above
                to see distribution patterns here.
              </p>
            </div>
          ) : (
            <>
              {/* SVG Pie Chart */}
              <svg style={svgStyle} viewBox="-120 -120 240 240">
                {pieSlices.map((slice) => (
                  <path
                    key={slice.type}
                    d={slice.path}
                    fill={slice.color}
                    stroke="var(--color-bg)"
                    strokeWidth="2"
                    style={{
                      cursor: "pointer",
                      opacity: hoveredSlice === slice.index ? 0.8 : 1,
                      transform:
                        hoveredSlice === slice.index
                          ? "scale(1.05)"
                          : "scale(1)",
                      transformOrigin: "center",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={() => setHoveredSlice(slice.index)}
                    onMouseLeave={() => setHoveredSlice(null)}
                  >
                    <title>{`${slice.type}: ${slice.count} (${slice.percentage}%)`}</title>
                  </path>
                ))}

                {/* Center text */}
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--color-text)"
                  fontSize="14"
                  fontWeight="bold"
                >
                  Total: {totalThreats}
                </text>
              </svg>

              {/* Legend */}
              <div style={legendStyle}>
                {dataWithPercentages.map((item, index) => (
                  <div
                    key={item.type}
                    style={{
                      ...legendItemStyle,
                      transform:
                        hoveredSlice === index ? "scale(1.05)" : "scale(1)",
                      boxShadow:
                        hoveredSlice === index
                          ? "0 4px 12px rgba(0,0,0,0.3)"
                          : "none",
                    }}
                    onMouseEnter={() => setHoveredSlice(index)}
                    onMouseLeave={() => setHoveredSlice(null)}
                  >
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor: item.color,
                        borderRadius: "50%",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontWeight: "500" }}>{item.type}</span>
                    <span
                      style={{
                        color: "var(--color-text-muted)",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>

              {/* Statistics */}
              <div style={statsContainerStyle}>
                <div style={statItemStyle}>
                  <h4
                    style={{
                      margin: "0 0 var(--space-2)",
                      color: "var(--color-danger)",
                      fontSize: "16px",
                    }}
                  >
                    Attack Types
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "var(--color-text)",
                    }}
                  >
                    {dataWithPercentages
                      .filter(
                        (item) =>
                          ![
                            "BENIGN",
                            "Normal Traffic",
                            "normal_traffic",
                            "Legitimate",
                            "Safe",
                          ].some((benign) =>
                            item.type
                              .toLowerCase()
                              .includes(benign.toLowerCase())
                          )
                      )
                      .reduce((sum, item) => sum + item.count, 0)}
                  </p>
                </div>

                <div style={statItemStyle}>
                  <h4
                    style={{
                      margin: "0 0 var(--space-2)",
                      color: "var(--color-primary)",
                      fontSize: "16px",
                    }}
                  >
                    Unique Types
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "var(--color-text)",
                    }}
                  >
                    {dataWithPercentages.length}
                  </p>
                </div>

                <div style={statItemStyle}>
                  <h4
                    style={{
                      margin: "0 0 var(--space-2)",
                      color: "var(--color-success)",
                      fontSize: "16px",
                    }}
                  >
                    Benign Traffic
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "var(--color-text)",
                    }}
                  >
                    {dataWithPercentages
                      .filter((item) =>
                        [
                          "BENIGN",
                          "Normal Traffic",
                          "normal_traffic",
                          "Legitimate",
                          "Safe",
                        ].some((benign) =>
                          item.type.toLowerCase().includes(benign.toLowerCase())
                        )
                      )
                      .reduce((sum, item) => sum + item.count, 0)}
                  </p>
                </div>
              </div>

              {/* Most Common Threat */}
              <div
                style={{
                  marginTop: "var(--space-6)",
                  padding: "var(--space-4)",
                  background: "var(--color-elevated)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  textAlign: "center",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 var(--space-2)",
                    color: "var(--color-text-muted)",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  Most Common Threat Type
                </h4>
                {(() => {
                  const mostCommon = dataWithPercentages
                    .filter(
                      (item) =>
                        ![
                          "BENIGN",
                          "Normal Traffic",
                          "normal_traffic",
                          "Legitimate",
                          "Safe",
                        ].some((benign) =>
                          item.type.toLowerCase().includes(benign.toLowerCase())
                        )
                    )
                    .reduce(
                      (max, item) => (item.count > max.count ? item : max),
                      { count: 0, type: "None" }
                    );

                  return (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "var(--space-2)",
                      }}
                    >
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          backgroundColor:
                            mostCommon.color || "var(--color-text-muted)",
                          borderRadius: "50%",
                        }}
                      />
                      <p
                        style={{
                          margin: 0,
                          fontSize: "18px",
                          fontWeight: "bold",
                          color: "var(--color-text)",
                        }}
                      >
                        {mostCommon.type}{" "}
                        {mostCommon.count > 0 ? `(${mostCommon.count})` : ""}
                      </p>
                    </div>
                  );
                })()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PieChart;