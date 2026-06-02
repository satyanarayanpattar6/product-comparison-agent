import { useState } from 'react';

export default function App() {
  const [item, setItem] = useState('MacBook Pro M3');
  const [specs, setSpecs] = useState('Price, Processor, RAM, Battery, Pros, Cons');
  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setMatrix(null);
    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      const response = await fetch(`${BACKEND_URL}/api/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item, targetSpecs: specs })
      });
      const data = await response.json();
      setMatrix(data);
    } catch (err) {
      console.error("Failed fetching comparison:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Generic Product Comparison Agent</h2>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '250px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Product Name</label>
          <input 
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            value={item} onChange={(e) => setItem(e.target.value)} 
          />
        </div>
        <div style={{ flex: '2', minWidth: '350px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Specifications to Compare (Comma Separated)</label>
          <input 
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            value={specs} onChange={(e) => setSpecs(e.target.value)} 
          />
        </div>
      </div>

      <button 
        onClick={handleSearch} 
        disabled={loading}
        style={{ padding: '0.6rem 2rem', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        {loading ? 'Agent Processing...' : 'Execute Agent Search'}
      </button>

      {matrix && (
        <div style={{ marginTop: '2rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f4f4f4' }}>
                {matrix.headers.map((h, i) => (
                  <th key={i} style={{ padding: '10px', border: '1px solid #ddd' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.rows.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: '500' }}>{row.specName}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{row.amazonValue}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{row.flipkartValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#eef6ff', borderRadius: '4px', borderLeft: '4px solid #0070f3' }}>
            <strong>🤖 Agent Verdict:</strong>
            <p style={{ margin: '0.5rem 0 0 0', lineHeight: '1.5' }}>{matrix.verdict}</p>
          </div>
        </div>
      )}
    </div>
  );
}