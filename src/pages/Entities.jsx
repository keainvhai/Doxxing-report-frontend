import React, { useEffect, useState } from "react";
import { fetchEntities } from "../api";
import "../styles/Entities.css"; // ✅ 样式文件

const Entities = () => {
  const [entities, setEntities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedEntity, setExpandedEntity] = useState(null); // ✅ 控制展开状态

  useEffect(() => {
    const getEntities = async () => {
      try {
        const { data } = await fetchEntities();
        setEntities(data);
      } catch (err) {
        console.error("❌ Error fetching entities:", err);
        setError("Failed to load entities.");
      } finally {
        setLoading(false);
      }
    };

    getEntities();
  }, []);

  // 搜索过滤
  const filteredEntities = entities.filter((entity) =>
    entity.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="entities-container">
      <h2>Entities</h2>

      {/* ✅ 搜索框 */}
      <input
        type="text"
        placeholder="Search entities..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-box"
      />

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {/* ✅ 实体列表表格 */}
      {!loading && !error && (
        <table className="entities-table">
          <thead>
            <tr>
              <th>Entity</th>
              <th>Incident Count</th>
              <th>View Reports</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntities.length > 0 ? (
              filteredEntities.map((entity, index) => (
                <React.Fragment key={index}>
                  <tr>
                    <td>{entity.name}</td>
                    {/* <td>{entity.count} Incidents</td> */}
                    <td
                      className="incident-count"
                      onClick={() =>
                        setExpandedEntity(
                          expandedEntity === entity.name ? null : entity.name
                        )
                      }
                    >
                      {entity.count} Incidents
                    </td>
                    <td>
                      <button
                        className="toggle-btn"
                        onClick={() =>
                          setExpandedEntity(
                            expandedEntity === entity.name ? null : entity.name
                          )
                        }
                      >
                        {expandedEntity === entity.name
                          ? "Hide"
                          : "Show Reports"}
                      </button>
                    </td>
                  </tr>
                  {/* ✅ 显示 entity 相关的 reports */}
                  {expandedEntity === entity.name &&
                    entity.reports.length > 0 && (
                      <tr>
                        <td></td>
                        <td colSpan="1">
                          <ul className="report-list">
                            {entity.reports.map((report) => (
                              <li key={report.id}>
                                <a href={`/report/${report.id}`}>
                                  {report.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td></td>
                      </tr>
                    )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="no-results">
                  No entities found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Entities;
