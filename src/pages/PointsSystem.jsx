import React from "react";

const PointsSystem = () => {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>🎯 Points & Contribution System</h1>
      <p>
        Earn points by contributing to the platform! Your actions help improve
        the community and may unlock badges or levels in the future.
      </p>

      <h2 style={{ marginTop: "1.5rem" }}>📌 How to Earn Points</h2>
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}
      >
        <thead>
          <tr>
            <th style={thStyle}>Action</th>
            <th style={thStyle}>Points</th>
            <th style={thStyle}>Limit / Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdStyle}>Submit a report</td>
            <td style={tdStyle}>+10</td>
            <td style={tdStyle}>Up to 3 per day</td>
          </tr>
          <tr>
            <td style={tdStyle}>Report approved</td>
            <td style={tdStyle}>+20</td>
            <td style={tdStyle}>Encourages high-quality contributions</td>
          </tr>
          <tr>
            <td style={tdStyle}>Post a comment (manual or AI-generated)</td>
            <td style={tdStyle}>+5</td>
            <td style={tdStyle}>Max 5 per day</td>
          </tr>
          <tr>
            <td style={tdStyle}>Chat with the AI comment assistant</td>
            <td style={tdStyle}>+1</td>
            <td style={tdStyle}>Up to 5 points/day</td>
          </tr>
          <tr>
            <td style={tdStyle}>Subscribe to a report</td>
            <td style={tdStyle}>+3</td>
            <td style={tdStyle}>Only once per report</td>
          </tr>
          {/* <tr>
            <td style={tdStyle}>Check updates for subscribed reports</td>
            <td style={tdStyle}>+2</td>
            <td style={tdStyle}>Up to 3 per day</td>
          </tr> */}
          <tr>
            <td style={tdStyle}>Daily login</td>
            <td style={tdStyle}>+2</td>
            <td style={tdStyle}>Once per day</td>
          </tr>
        </tbody>
      </table>

      <h2 style={{ marginTop: "2rem" }}>🏆 Level System</h2>
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}
      >
        <thead>
          <tr>
            <th style={thStyle}>Level</th>
            <th style={thStyle}>Points Required</th>
            <th style={thStyle}>Title</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdStyle}>Level 1</td>
            <td style={tdStyle}>0–49</td>
            <td style={tdStyle}>Newcomer</td>
          </tr>
          <tr>
            <td style={tdStyle}>Level 2</td>
            <td style={tdStyle}>50–99</td>
            <td style={tdStyle}>Observer</td>
          </tr>
          <tr>
            <td style={tdStyle}>Level 3</td>
            <td style={tdStyle}>100–199</td>
            <td style={tdStyle}>Contributor</td>
          </tr>
          <tr>
            <td style={tdStyle}>Level 4</td>
            <td style={tdStyle}>200–349</td>
            <td style={tdStyle}>Active Contributor</td>
          </tr>
          <tr>
            <td style={tdStyle}>Level 5</td>
            <td style={tdStyle}>350–549</td>
            <td style={tdStyle}>Investigator</td>
          </tr>
          <tr>
            <td style={tdStyle}>Level 6</td>
            <td style={tdStyle}>550–799</td>
            <td style={tdStyle}>Advocate</td>
          </tr>
          <tr>
            <td style={tdStyle}>Level 7</td>
            <td style={tdStyle}>800–1099</td>
            <td style={tdStyle}>Defender</td>
          </tr>
          <tr>
            <td style={tdStyle}>Level 8</td>
            <td style={tdStyle}>1100–1499</td>
            <td style={tdStyle}>Watcher</td>
          </tr>
          <tr>
            <td style={tdStyle}>Level 9</td>
            <td style={tdStyle}>1500–1999</td>
            <td style={tdStyle}>Sentinel</td>
          </tr>
          <tr>
            <td style={tdStyle}>Level 10</td>
            <td style={tdStyle}>2000+</td>
            <td style={tdStyle}>Guardian</td>
          </tr>
        </tbody>
      </table>

      <p style={{ marginTop: "1rem", fontStyle: "italic" }}>
        *You can earn up to 100 points per day.
      </p>
    </div>
  );
};

const thStyle = {
  borderBottom: "1px solid #ccc",
  padding: "0.75rem",
  textAlign: "left",
  backgroundColor: "#f8f8f8",
};

const tdStyle = {
  padding: "0.75rem",
  borderBottom: "1px solid #eee",
};

export default PointsSystem;
