import React, { useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FlaskConical, Upload, Download, FileSpreadsheet, Pencil, Check, X, Sparkles } from 'lucide-react';

const API = 'http://localhost:8000/api';

const TYPES = [
  { id: 'positive', label: 'Positive' },
  { id: 'negative', label: 'Negative' },
  { id: 'validation', label: 'Validation' },
  { id: 'boundary', label: 'Boundary' },
];

export default function TestCaseGenerator() {
  const [form, setForm] = useState({ module: '', feature: '', user_story: '' });
  const [selectedTypes, setSelectedTypes] = useState(['positive', 'negative', 'validation', 'boundary']);
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('generate');
  const [editingId, setEditingId] = useState(null);
  const [editBuf, setEditBuf] = useState({});
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const toggleType = (t) => setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const generate = async () => {
    if (!form.module || !form.feature) { toast.error('Module and Feature are required'); return; }
    if (!selectedTypes.length) { toast.error('Select at least one test type'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/testcases/generate`, { ...form, test_types: selectedTypes });
      setTestCases(res.data.test_cases);
      toast.success(`${res.data.count} test cases generated!`);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Generation failed');
    } finally { setLoading(false); }
  };

  const exportFile = async (format) => {
    if (!testCases.length) { toast.error('No test cases to export'); return; }
    try {
      const res = await axios.post(`${API}/testcases/export/${format}`, testCases, { responseType: 'blob' });
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url; a.download = `test_cases.${format === 'excel' ? 'xlsx' : 'csv'}`; a.click();
      toast.success('Downloaded!');
    } catch { toast.error('Export failed'); }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post(`${API}/testcases/upload`, formData);
      setTestCases(res.data.test_cases);
      toast.success(`${res.data.count} test cases imported!`);
    } catch (e) { toast.error(e.response?.data?.detail || 'Upload failed'); }
  };

  const startEdit = (tc) => { setEditingId(tc.id); setEditBuf({ ...tc }); };
  const saveEdit = () => {
    setTestCases(prev => prev.map(tc => tc.id === editingId ? { ...editBuf } : tc));
    setEditingId(null);
  };

  const badgeClass = (v) => {
    const map = { positive: 'badge-positive', negative: 'badge-negative', validation: 'badge-validation', boundary: 'badge-boundary', High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low' };
    return `badge ${map[v] || 'badge-low'}`;
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <FlaskConical size={20} color="#1a56db" />
          <h1>Test Case Generator</h1>
        </div>
        <p className="page-subtitle">Generate comprehensive test cases from feature descriptions.</p>
      </div>

      <div className="tab-bar">
        {['generate', 'upload'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'generate' ? <><Sparkles size={13} style={{ marginRight: 5 }} />Generate</> : <><Upload size={13} style={{ marginRight: 5 }} />Upload File</>}
          </button>
        ))}
      </div>

      {tab === 'generate' && (
        <div className="card">
          <div className="form-row">
            <div className="form-group">
              <label>Module Name *</label>
              <input type="text" placeholder="e.g. User Authentication" value={form.module}
                onChange={e => setForm(p => ({ ...p, module: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Feature *</label>
              <input type="text" placeholder="e.g. Login with email & password" value={form.feature}
                onChange={e => setForm(p => ({ ...p, feature: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label>User Story (optional)</label>
            <textarea placeholder="As a user, I want to..." value={form.user_story}
              onChange={e => setForm(p => ({ ...p, user_story: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Test Types</label>
            <div className="checkbox-group">
              {TYPES.map(t => (
                <label key={t.id} className="checkbox-item">
                  <input type="checkbox" checked={selectedTypes.includes(t.id)} onChange={() => toggleType(t.id)} />
                  {t.label}
                </label>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" onClick={generate} disabled={loading}>
            {loading ? <><div className="spinner" />Generating…</> : <><Sparkles size={15} />Generate Test Cases</>}
          </button>
        </div>
      )}

      {tab === 'upload' && (
        <div className="card">
          <div className={`upload-zone ${dragOver ? 'active' : ''}`}
            onClick={() => fileRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files[0]); }}>
            <FileSpreadsheet size={32} color="#1a56db" style={{ opacity: 0.6 }} />
            <p><strong>Click to upload</strong> or drag & drop</p>
            <p>Supports .xlsx and .csv files</p>
            <p style={{ fontSize: 11, color: '#aaa', marginTop: 8 }}>Required columns: title, steps, expected</p>
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.csv" style={{ display: 'none' }}
            onChange={e => handleUpload(e.target.files[0])} />
        </div>
      )}

      {testCases.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="section-header" style={{ padding: '16px 20px', borderBottom: '1px solid #f0eff8', margin: 0 }}>
            <div>
              <h2 style={{ margin: 0 }}>Test Cases</h2>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{testCases.length} test cases</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => exportFile('csv')}><Download size={13} /> CSV</button>
              <button className="btn btn-secondary btn-sm" onClick={() => exportFile('excel')}><Download size={13} /> Excel</button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="tc-table">
              <thead>
                <tr><th>ID</th><th>Title</th><th>Type</th><th>Steps</th><th>Expected</th><th>Priority</th><th></th></tr>
              </thead>
              <tbody>
                {testCases.map(tc => (
                  <tr key={tc.id}>
                    {editingId === tc.id ? (
                      <>
                        <td><code style={{ fontSize: 11 }}>{tc.id}</code></td>
                        <td><input value={editBuf.title} onChange={e => setEditBuf(p => ({ ...p, title: e.target.value }))} style={{ width: '100%', padding: '4px 6px', fontSize: 12 }} /></td>
                        <td><span className={badgeClass(tc.type)}>{tc.type}</span></td>
                        <td><textarea value={editBuf.steps} onChange={e => setEditBuf(p => ({ ...p, steps: e.target.value }))} style={{ width: '100%', fontSize: 11, minHeight: 60 }} /></td>
                        <td><input value={editBuf.expected} onChange={e => setEditBuf(p => ({ ...p, expected: e.target.value }))} style={{ width: '100%', padding: '4px 6px', fontSize: 12 }} /></td>
                        <td><span className={badgeClass(editBuf.priority)}>{editBuf.priority}</span></td>
                        <td>
                          <button className="btn btn-sm" style={{ color: '#1D9E75', background: 'none', border: 'none' }} onClick={saveEdit}><Check size={14} /></button>
                          <button className="btn btn-sm" style={{ color: '#aaa', background: 'none', border: 'none' }} onClick={() => setEditingId(null)}><X size={14} /></button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td><code style={{ fontSize: 11, color: '#1a56db' }}>{tc.id}</code></td>
                        <td style={{ maxWidth: 220 }}>{tc.title}</td>
                        <td><span className={badgeClass(tc.type)}>{tc.type}</span></td>
                        <td style={{ maxWidth: 200, fontSize: 12, color: '#555', whiteSpace: 'pre-line' }}>{tc.steps}</td>
                        <td style={{ maxWidth: 180, fontSize: 12 }}>{tc.expected}</td>
                        <td><span className={badgeClass(tc.priority)}>{tc.priority}</span></td>
                        <td><button className="btn btn-sm" style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }} onClick={() => startEdit(tc)}><Pencil size={13} /></button></td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
