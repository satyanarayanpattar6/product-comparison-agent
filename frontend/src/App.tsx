// import { useState } from 'react';

// // interface MatrixType{
// //   rows: string[][];
// // }

// export default function App() {
//   const [item, setItem] = useState('');
//   const [specs, setSpecs] = useState('Price, Pros, Cons');
//   const [matrix, setMatrix] = useState({ headers: [], rows: [], verdict: '' });
//   const [loading, setLoading] = useState(false);

//   const handleSearch = async () => {
//     setLoading(true);
//     setMatrix({ headers: [], rows: [], verdict: '' });
//     try {
//       const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

//       const response = await fetch(`${BACKEND_URL}/api/compare`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ item, targetSpecs: specs })
//       });
//       const data = await response.json();
//       console.log(data)
//       setMatrix(data);
//     } catch (err) {
//       console.error("Failed fetching comparison:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Check if we have received actual rows from the backend agent
//   const hasData = matrix && matrix.rows && matrix.rows.length > 0;

//   return (
//     <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '900px', margin: '0 auto' }}>
//       <h2>Generic Product Comparison Agent</h2>

//       <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
//         <div style={{ flex: '1', minWidth: '250px' }}>
//           <label style={{ display: 'block', fontWeight: 'bold' }}>Product Name</label>
//           <input
//             style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
//             value={item} onChange={(e) => setItem(e.target.value)}
//           />
//         </div>
//         <div style={{ flex: '2', minWidth: '350px' }}>
//           <label style={{ display: 'block', fontWeight: 'bold' }}>Specifications to Compare (Comma Separated)</label>
//           <input
//             style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
//             value={specs} onChange={(e) => setSpecs(e.target.value)}
//           />
//         </div>
//       </div>

//       <button
//         onClick={handleSearch}
//         disabled={loading}
//         style={{ padding: '0.6rem 2rem', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
//       >
//         {loading ? 'Agent Processing...' : 'Execute Agent Search'}
//       </button>

//       {hasData && (
//         <div style={{ marginTop: '2rem' }}>
//           <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
//             <thead>
//               <tr style={{ background: '#f4f4f4' }}>
//                 {/* 🪲 FIX 2: Fixed variable mismatch. Replaced undefined {h} with {headerText} */}
//                 {matrix.headers.map((headerText, index) => (
//                   <th key={index} style={{ padding: '10px', border: '1px solid #ddd' }}>
//                     {headerText}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//   {(matrix.rows || []).map((row, rowIdx) => {
//     // Safety check to ensure the row exists and is an object
//     if (!row || typeof row !== 'object') return null;

//     // Convert the row object into [key, value] pairs
//     // Example: [['specName', 'Price'], ['amazonValue', '₹71,999'], ['flipkartValue', '₹69,990']]
//     const rowEntries = Object.entries(row);
//     if (rowEntries.length === 0) return null;

//     // 1. The first item in the object is ALWAYS our row title (e.g., "Price", "RAM", "Product Image")
//     const specTitle = String(rowEntries[0][1] || 'N/A');

//     // 2. All remaining items in the object are the platform values
//     const platformValues = rowEntries.slice(1).map(([_, val]) => val);

//     return (
//       <tr key={rowIdx}>
//         {/* Specification Column Label */}
//         <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: '500' }}>
//           {specTitle}
//         </td>

//         {/* Dynamic Platform Columns */}
//         {platformValues.map((cellValue, cellIdx) => {
//           const safeStringValue = typeof cellValue === 'string' ? cellValue : String(cellValue || '');
//           const isImageUrl = safeStringValue.startsWith('http://') || safeStringValue.startsWith('https://');

//           return (
//             <td key={cellIdx} style={{ padding: '10px', border: '1px solid #ddd' }}>
//               {isImageUrl ? (
//                 <img
//                   src={safeStringValue}
//                   alt="Product preview"
//                   style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '4px' }}
//                   onError={(e) => { e.target.style.display = 'none'; }}
//                 />
//               ) : (
//                 safeStringValue || "N/A"
//               )}
//             </td>
//           );
//         })}
//       </tr>
//     );
//   })}
// </tbody>
//           </table>

//           {matrix.verdict && (
//             <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#eef6ff', borderRadius: '4px', borderLeft: '4px solid #0070f3' }}>
//               <strong>🤖 Agent Verdict:</strong>
//               <p style={{ margin: '0.5rem 0 0 0', lineHeight: '1.5' }}>{matrix.verdict}</p>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

import { useState } from "react";
import "./App.css"; // 🚀 Importing separated stylesheet

export default function App() {
  const [item, setItem] = useState("");
  const [specs, setSpecs] = useState("Price, Pros, Cons");
  const [matrix, setMatrix] = useState({ headers: [], rows: [], verdict: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!item.trim()) {
      setError("Please enter a valid product name to query the agent.");
      return;
    }

    setLoading(true);
    setError(null);
    setMatrix({ headers: [], rows: [], verdict: "" });

    try {
      const BACKEND_URL =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

      const response = await fetch(`${BACKEND_URL}/api/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item, targetSpecs: specs }),
      });

      if (!response.ok)
        throw new Error("Failed to communicate with comparison streams.");

      const data = await response.json();
      setMatrix(data);
    } catch (err) {
      console.error("Failed fetching comparison:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected data routing error occurred.",
      );
    } finally {
      setLoading(false);
    }
  };

  const hasData = matrix && matrix.rows && matrix.rows.length > 0;

  return (
    <div className="app-viewport">
      <div className="app-container">
        {/* Header Block */}
        <header className="app-header">
          <h1 className="app-title">AI Product Comparison Engine</h1>
          <p className="app-subtitle">
            Real-time multi-platform data aggregation and specification analysis
          </p>
        </header>

        {/* Input Form Dashboard */}
        <div className="console-card">
          <div className="form-grid">
            <div className="field-group-keyword">
              <label className="form-label">Product Name / Keyword</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Dell S-Series 27 Monitor, Sony XM5..."
                value={item}
                onChange={(e) => setItem(e.target.value)}
              />
            </div>
            <div className="field-group-specs">
              <label className="form-label">
                Specifications to Isolate (Comma Separated)
              </label>
              <input
                type="text"
                className="form-input"
                value={specs}
                onChange={(e) => setSpecs(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="submit-btn"
          >
            {loading ? "Executing Agent Scrapers..." : "Analyze Market Options"}
          </button>
        </div>

        {/* Error Boundaries */}
        {error && (
          <div className="error-banner">
            <strong>Execution Error:</strong> {error}
          </div>
        )}

        {/* Loading Spinner Core */}
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Querying live streams from e-commerce nodes...</p>
          </div>
        )}

        {/* Dynamic Visual Table Matrix */}
        {hasData && !loading && (
          <div className="matrix-card">
            <div className="table-scroll-wrapper">
              <table className="matrix-table">
                <thead>
                  <tr className="table-header-row">
                    {matrix.headers.map((headerText, index) => (
                      <th key={index} className="matrix-th">
                        {headerText}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.rows.map((row, rowIdx) => {
                    if (!row || typeof row !== "object") return null;
                    const rowEntries = Object.entries(row);
                    if (rowEntries.length === 0) return null;

                    const specTitle = String(rowEntries[0][1] || "N/A");
                    const platformValues = rowEntries
                      .slice(1)
                      .map(([_, val]) => val);

                    return (
                      <tr key={rowIdx} className="matrix-row">
                        <td className="matrix-td-label">{specTitle}</td>
                        {platformValues.map((cellValue, cellIdx) => {
                          const safeStringValue =
                            typeof cellValue === "string"
                              ? cellValue.trim()
                              : String(cellValue || "");
                          const isImageUrl =
                            safeStringValue.startsWith("http://") ||
                            safeStringValue.startsWith("https://");

                          return (
                            <td key={cellIdx} className="matrix-td-value">
                              {isImageUrl ? (
                                <img
                                  src={safeStringValue}
                                  alt="Preview"
                                  className="product-img-preview"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                safeStringValue || "N/A"
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Strategic Product Verdict Banner */}
            {matrix.verdict && (
              <div className="verdict-container">
                <span className="verdict-icon">💡</span>
                <div>
                  <h4 className="verdict-title">
                    Strategic Purchasing Verdict
                  </h4>
                  <p className="verdict-text">{matrix.verdict}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
