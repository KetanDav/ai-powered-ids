import Navbar from "../components/Navbar";

const team = [
  {
    name: "Devarsh Dalwadi",
    skills: ["ML", "DBMS","CyberSec"],
    linkedin: "https://www.linkedin.com/in/devarshdalwadi/",
    photo: 'devarsh.jpg',
  },
  {
    name: "Ketan Dav",
    skills: ["APIs", "MongoDB", "React","ML"],
    linkedin: "https://www.linkedin.com/in/ketandav/",
    photo: 'ketan.jpg',
  },
];

export default function About() {
  return (
    <div className="page">
      <div
        style={{
          maxWidth: 600,
          marginBottom: "10vw",
          margin: "2rem auto",
          padding: "1.5rem",
          background: "rgba(30,41,59,0.7)",
          borderRadius: 16,
          color: "#f8fafc",
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        }}
      >
        <h2 style={{ fontWeight: 800, fontSize: "2rem", marginBottom: "1rem" }}>
          About Us
        </h2>
        <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>
          <b>Threat Detection & Scoring</b> is a hackathon project focused on
          real-time threat scoring from network logs. Our goal is to help
          organizations quickly identify and respond to potential security
          threats using intelligent analysis.
        </p>
        <h3
          style={{
            fontWeight: 700,
            fontSize: "1.2rem",
            marginBottom: "0.5rem",
          }}
        >
          Team Members
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.2rem",
          }}
        >
          {team.map((member) => (
            <div
              key={member.name}
              style={{
                background: "rgba(17,24,39,0.85)",
                borderRadius: 12,
                padding: "1rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "#1e293b",
                  marginBottom: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  color: "#64748b",
                }}
              >
                {/* Photo placeholder: could use initials or an icon */}
                {member.photo ? (
                  <img
                    src={member.photo}
                    alt={member.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                    }}
                  />
                ) : (
                  member.name[0]
                )}
              </div>
              <div
                style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 4 }}
              >
                {member.name}
              </div>
              <div
                style={{
                  fontSize: "0.95rem",
                  color: "#fbbf24",
                  marginBottom: 6,
                }}
              >
                {member.skills.join(", ")}
              </div>
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#38bdf8",
                  fontSize: "0.95rem",
                  textDecoration: "none",
                  marginTop: 2,
                }}
              >
                LinkedIn
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
