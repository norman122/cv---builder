import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, View, Text, StyleSheet, pdf, Svg, Path, Circle, Rect, Polyline, Line, Font } from '@react-pdf/renderer';
import LatoRegular from './fonts/lato-400-normal.ttf';
import LatoItalic from './fonts/lato-400-italic.ttf';
import LatoBold from './fonts/lato-700-normal.ttf';
import LatoBlack from './fonts/lato-900-normal.ttf';

Font.register({
  family: 'Lato',
  fonts: [
    { src: LatoRegular, fontWeight: 400 },
    { src: LatoItalic, fontWeight: 400, fontStyle: 'italic' },
    { src: LatoBold, fontWeight: 700 },
    { src: LatoBlack, fontWeight: 900 },
  ],
});

const pdfStyles = StyleSheet.create({
  page: { fontFamily: 'Lato', padding: '13mm', backgroundColor: '#ffffff', flexDirection: 'column' },
  header: { borderBottomWidth: 2, borderBottomColor: '#0f172a', paddingBottom: 12, marginBottom: 18, alignItems: 'center' },
  name: { fontSize: 28, fontWeight: 900, letterSpacing: 2, marginBottom: 10, color: '#0f172a' },
  contactRow: { flexDirection: 'row', gap: 22, color: '#64748b', fontSize: 9.5 },
  columns: { flexDirection: 'row', gap: 18, flexGrow: 1 },
  leftCol: { flex: 2 },
  rightCol: { flex: 1, borderLeftWidth: 1, borderLeftColor: '#cbd5e1', paddingLeft: 12 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 10.5, fontWeight: 900, color: '#0f172a', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 5, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.2 },
  rightSectionTitle: { fontSize: 10, fontWeight: 900, color: '#0f172a', borderBottomWidth: 2, borderBottomColor: '#0f172a', paddingBottom: 5, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.2 },
  expItem: { paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: '#e2e8f0', marginBottom: 20 },
  expRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  expCompany: { fontSize: 11, fontWeight: 700, color: '#0f172a' },
  expDates: { fontSize: 7.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  expRole: { fontSize: 9.5, fontWeight: 700, color: '#1d4ed8', marginBottom: 9 },
  bullet: { flexDirection: 'row', marginBottom: 5, gap: 7 },
  bulletDot: { width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: '#2563eb', marginTop: 4, flexShrink: 0 },
  bulletText: { fontSize: 9, color: '#475569', flex: 1, lineHeight: 1.5 },
  summaryText: { fontSize: 9, color: '#475569', fontStyle: 'italic', lineHeight: 1.7 },
  skillCategory: { marginBottom: 12 },
  skillCatTitle: { fontSize: 8, fontWeight: 900, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 },
  skillRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  skillDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#94a3b8', flexShrink: 0 },
  skillText: { fontSize: 9, color: '#334155', fontWeight: 400 },
  listItem: { marginBottom: 13 },
  listTitle: { fontSize: 9.5, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase' },
  listSubtitle: { fontSize: 8.5, color: '#1d4ed8', fontWeight: 700, marginTop: 3, marginBottom: 3 },
  listDate: { fontSize: 8, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' },
  listInstitution: { fontSize: 8, color: '#64748b', fontStyle: 'italic' },
});

const toSC = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

const PdfMail = () => (
  <Svg width="9" height="9" viewBox="0 0 24 24">
    <Rect x="2" y="4" width="20" height="16" rx="2" stroke="#64748b" strokeWidth="2" fill="none" />
    <Polyline points="22,7 12,14 2,7" stroke="#64748b" strokeWidth="2" fill="none" />
  </Svg>
);
const PdfPhone = () => (
  <Svg width="9" height="9" viewBox="0 0 24 24">
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="#64748b" strokeWidth="2" fill="none" />
  </Svg>
);
const PdfPin = () => (
  <Svg width="9" height="9" viewBox="0 0 24 24">
    <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" stroke="#64748b" strokeWidth="2" fill="none" />
    <Circle cx="12" cy="10" r="3" stroke="#64748b" strokeWidth="2" fill="none" />
  </Svg>
);

const renderPdfSection = (section, isRight = false) => {
  const titleStyle = isRight ? pdfStyles.rightSectionTitle : pdfStyles.sectionTitle;
  return (
    <View key={section.id} style={pdfStyles.section}>
      <Text style={titleStyle}>{section.title}</Text>
      {section.type === 'text' && (
        <Text style={pdfStyles.summaryText}>"{section.content}"</Text>
      )}
      {section.type === 'experience' && section.items.map(exp => (
        <View key={exp.id} style={pdfStyles.expItem}>
          <View style={pdfStyles.expRow}>
            <Text style={pdfStyles.expCompany}>{toSC(exp.company)}</Text>
            <Text style={pdfStyles.expDates}>{exp.dates}</Text>
          </View>
          <Text style={pdfStyles.expRole}>{toSC(exp.role)}</Text>
          {exp.bullets.filter(Boolean).map((b, bi) => (
            <View key={bi} style={pdfStyles.bullet}>
              <View style={pdfStyles.bulletDot} />
              <Text style={pdfStyles.bulletText}>{b}</Text>
            </View>
          ))}
        </View>
      ))}
      {section.type === 'skills' && section.categories.map(cat => (
        <View key={cat.id} style={pdfStyles.skillCategory}>
          <Text style={pdfStyles.skillCatTitle}>{cat.title}</Text>
          {cat.items.filter(Boolean).map((skill, si) => (
            <View key={si} style={pdfStyles.skillRow}>
              <View style={pdfStyles.skillDot} />
              <Text style={pdfStyles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      ))}
      {section.type === 'list' && section.items.map(item => (
        <View key={item.id} style={pdfStyles.listItem}>
          <Text style={pdfStyles.listTitle}>{item.title}</Text>
          {item.subtitle ? <Text style={pdfStyles.listSubtitle}>{item.subtitle}</Text> : null}
          {item.date ? <Text style={pdfStyles.listDate}>{item.date}</Text> : null}
          {item.institution ? <Text style={pdfStyles.listInstitution}>{item.institution}</Text> : null}
        </View>
      ))}
    </View>
  );
};

const CvDocument = ({ cvData }) => {
  const left = cvData.sections.filter(s => s.column === 'left');
  const right = cvData.sections.filter(s => s.column === 'right');
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.name}>{cvData.personalInfo.fullName}</Text>
          <View style={pdfStyles.contactRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <PdfMail /><Text>{cvData.personalInfo.email.toLowerCase()}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <PdfPhone /><Text>{cvData.personalInfo.phone}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <PdfPin /><Text>{cvData.personalInfo.location}</Text>
            </View>
          </View>
        </View>
        <View style={pdfStyles.columns}>
          <View style={pdfStyles.leftCol}>{left.map(s => renderPdfSection(s, false))}</View>
          <View style={pdfStyles.rightCol}>{right.map(s => renderPdfSection(s, true))}</View>
        </View>
      </Page>
    </Document>
  );
};

const Icons = {
  Download: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="3" y2="15"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  Sparkles: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>,
  ArrowUp: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>,
  ArrowDown: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>,
  Mail: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  Phone: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  MapPin: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
};

const App = () => {
  const [loadingAI, setLoadingAI] = useState(null);
  const [cvData, setCvData] = useState({
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
    },
    sections: []
  });

  // AI Logic
  const handleAIEnhance = async (sectionId, currentText, type = 'summary') => {
    setLoadingAI(sectionId);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      alert('AI feature requires a Gemini API key. Set VITE_GEMINI_API_KEY in your .env file.');
      setLoadingAI(null);
      return;
    }
    const prompt = `Rewrite this resume ${type} to be more professional, using strong action verbs: "${currentText}"`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      const enhanced = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (enhanced) {
        updateSectionField(sectionId, 'content', enhanced.trim());
      }
    } catch (e) { console.error(e); }
    setLoadingAI(null);
  };

  // PDF Download
  const downloadPDF = async () => {
    try {
      const filename = `${cvData.personalInfo.fullName.replace(/\s+/g, '_') || 'My'}_CV.pdf`;
      const blob = await pdf(<CvDocument cvData={cvData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF generation failed: ' + err.message);
    }
  };

  // State Management Helpers
  const updatePersonalInfo = (f, v) => setCvData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [f]: v } }));
  const updateSectionField = (id, field, value) => setCvData(prev => ({
    ...prev, sections: prev.sections.map(s => s.id === id ? { ...s, [field]: value } : s)
  }));

  const moveSection = (idx, dir) => {
    const newS = [...cvData.sections];
    const target = idx + dir;
    if (target < 0 || target >= newS.length) return;
    [newS[idx], newS[target]] = [newS[target], newS[idx]];
    setCvData(prev => ({ ...prev, sections: newS }));
  };

  const addSection = (type) => {
    const base = { id: `sec_${Date.now()}`, column: 'left' };
    let newSection;
    if (type === 'experience') newSection = { ...base, title: 'Experience', type: 'experience', items: [{ id: `exp_${Date.now()}`, company: 'Company', role: 'Role', dates: 'Dates', location: '', bullets: [''] }] };
    else if (type === 'skills') newSection = { ...base, title: 'Skills', type: 'skills', categories: [{ id: `cat_${Date.now()}`, title: 'Group', items: [''] }] };
    else if (type === 'list') newSection = { ...base, title: 'List', type: 'list', items: [{ id: `item_${Date.now()}`, title: '', subtitle: '', date: '' }] };
    else newSection = { ...base, title: 'Summary', type: 'text', content: '' };
    setCvData(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
  };

  const toSentenceCase = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";

  const importRef = useRef(null);
  const [mobileTab, setMobileTab] = useState('editor');
  const [previewScale, setPreviewScale] = useState(1);
  const previewWrapperRef = useRef(null);

  useEffect(() => {
    const A4_PX = 794;
    const update = () => {
      if (!previewWrapperRef.current) return;
      const w = previewWrapperRef.current.offsetWidth - 32;
      if (w > 0) setPreviewScale(Math.min(1, w / A4_PX));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (mobileTab === 'preview' && previewWrapperRef.current) {
      const A4_PX = 794;
      const w = previewWrapperRef.current.offsetWidth - 32;
      if (w > 0) setPreviewScale(Math.min(1, w / A4_PX));
    }
  }, [mobileTab]);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(cvData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cvData.personalInfo.fullName.replace(/\s+/g, '_') || 'CV'}_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (parsed.personalInfo && parsed.sections) {
          setCvData(parsed);
        } else {
          alert('Invalid CV data file.');
        }
      } catch {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="h-screen bg-slate-100 flex flex-col print:bg-white font-sans">
      {/* Mobile Tab Bar */}
      <div className="md:hidden flex bg-slate-900 text-white shrink-0 print:hidden">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-3.5 text-[11px] font-black tracking-widest uppercase transition-colors ${mobileTab === 'editor' ? 'bg-white/10 text-white' : 'text-slate-400'}`}
        >Editor</button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-3.5 text-[11px] font-black tracking-widest uppercase transition-colors ${mobileTab === 'preview' ? 'bg-white/10 text-white' : 'text-slate-400'}`}
        >Preview</button>
      </div>

      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
      {/* Sidebar Editor */}
      <div className={`${mobileTab === 'editor' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-[520px] bg-white shadow-2xl overflow-y-auto border-r border-slate-200 print:hidden shrink-0`}>
        <div className="p-6 border-b bg-slate-50">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="CV Architect" className="w-9 h-9" />
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none uppercase">CV Architect</h1>
              </div>
            </div>
            <button onClick={downloadPDF} className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg font-bold shadow-md transition-all active:scale-95 text-xs">
              <Icons.Download /> Download CV
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={exportJSON} className="flex-1 py-1.5 border border-slate-300 rounded text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition-all">
              ↑ Export DATA
            </button>
            <button onClick={() => importRef.current.click()} className="flex-1 py-1.5 border border-slate-300 rounded text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition-all">
              ↓ Import DATA
            </button>
            <input ref={importRef} type="file" accept=".json" onChange={importJSON} className="hidden" />
          </div>
        </div>

        <div className="p-6 space-y-12">
          {/* Identity */}
          <section>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-1 mb-4">Identity Settings</h2>
            <div className="grid grid-cols-2 gap-3">
              <input value={cvData.personalInfo.fullName} onChange={(e) => updatePersonalInfo('fullName', e.target.value)} placeholder="Name" className="col-span-2 p-2 border rounded text-xs font-bold bg-slate-50" />
              <input value={cvData.personalInfo.email} onChange={(e) => updatePersonalInfo('email', e.target.value)} placeholder="Email" className="p-2 border rounded text-xs bg-slate-50" />
              <input value={cvData.personalInfo.phone} onChange={(e) => updatePersonalInfo('phone', e.target.value)} placeholder="Phone" className="p-2 border rounded text-xs bg-slate-50" />
              <input value={cvData.personalInfo.location} onChange={(e) => updatePersonalInfo('location', e.target.value)} placeholder="Location" className="col-span-2 p-2 border rounded text-xs bg-slate-50" />
            </div>
          </section>

          {/* Section Management */}
          <section>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-1 mb-4">Structure & Content</h2>
            <div className="space-y-6">
              {cvData.sections.map((sec, idx) => (
                <div key={sec.id} className="p-4 border rounded-xl bg-slate-50/50 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-1">
                      <button onClick={() => moveSection(idx, -1)} className="p-1 hover:text-blue-500"><Icons.ArrowUp /></button>
                      <button onClick={() => moveSection(idx, 1)} className="p-1 hover:text-blue-500"><Icons.ArrowDown /></button>
                    </div>
                    <div className="flex gap-2">
                      <select value={sec.column} onChange={(e) => updateSectionField(sec.id, 'column', e.target.value)} className="text-[9px] font-bold border rounded p-1">
                        <option value="left">LEFT</option>
                        <option value="right">RIGHT</option>
                      </select>
                      <button onClick={() => setCvData(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== sec.id) }))} className="text-slate-300 hover:text-red-500"><Icons.Trash /></button>
                    </div>
                  </div>

                  <input value={sec.title} onChange={(e) => updateSectionField(sec.id, 'title', e.target.value)} className="w-full font-black text-xs uppercase border-b mb-3 bg-transparent" />

                  {sec.type === 'text' && (
                    <div className="relative">
                      <textarea value={sec.content} onChange={(e) => updateSectionField(sec.id, 'content', e.target.value)} className="w-full p-2 text-xs border rounded bg-white h-24 resize-none" />
                    </div>
                  )}

                  {sec.type === 'experience' && (
                    <div className="space-y-4">
                      {sec.items.map((item, itemIdx) => (
                        <div key={item.id} className="bg-white p-3 border rounded shadow-sm">
                          <input value={item.company} onChange={(e) => {
                            const newItems = [...sec.items]; newItems[itemIdx] = { ...newItems[itemIdx], company: e.target.value }; updateSectionField(sec.id, 'items', newItems);
                          }} className="w-full text-xs font-bold border-b mb-2" />
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <input value={item.role} onChange={(e) => {
                              const newItems = [...sec.items]; newItems[itemIdx] = { ...newItems[itemIdx], role: e.target.value }; updateSectionField(sec.id, 'items', newItems);
                            }} className="text-[10px] border p-1 rounded" placeholder="Role" />
                            <input value={item.dates} onChange={(e) => {
                              const newItems = [...sec.items]; newItems[itemIdx] = { ...newItems[itemIdx], dates: e.target.value }; updateSectionField(sec.id, 'items', newItems);
                            }} className="text-[10px] border p-1 rounded" placeholder="Dates" />
                          </div>
                          <div className="space-y-1">
                            {item.bullets.map((b, bIdx) => (
                              <div key={bIdx} className="flex gap-1 items-center">
                                <input value={b} onChange={(e) => {
                                  const newItems = [...sec.items]; newItems[itemIdx] = { ...newItems[itemIdx], bullets: [...newItems[itemIdx].bullets] }; newItems[itemIdx].bullets[bIdx] = e.target.value; updateSectionField(sec.id, 'items', newItems);
                                }} className="flex-1 text-[9px] border p-1 rounded" />
                                <button onClick={() => {
                                  const newItems = [...sec.items]; newItems[itemIdx] = { ...newItems[itemIdx], bullets: newItems[itemIdx].bullets.filter((_, i) => i !== bIdx) }; updateSectionField(sec.id, 'items', newItems);
                                }} className="text-slate-300"><Icons.Trash /></button>
                              </div>
                            ))}
                            <button onClick={() => {
                              const newItems = [...sec.items]; newItems[itemIdx] = { ...newItems[itemIdx], bullets: [...newItems[itemIdx].bullets, ""] }; updateSectionField(sec.id, 'items', newItems);
                            }} className="text-[9px] text-blue-600 font-bold">+ POINT</button>
                          </div>
                        </div>
                      ))}
                      <button onClick={() => {
                        const newItems = [...sec.items, { id: Date.now().toString(), company: "New Co", role: "Role", dates: "Dates", location: "", bullets: [""] }];
                        updateSectionField(sec.id, 'items', newItems);
                      }} className="w-full py-2 border-2 border-dashed rounded text-[10px] text-slate-400 font-bold hover:text-blue-500 transition-all">+ ADD WORK ENTRY</button>
                    </div>
                  )}

                  {sec.type === 'skills' && (
                    <div className="space-y-4">
                      {sec.categories.map((cat, catIdx) => (
                        <div key={cat.id} className="bg-white p-2 border rounded shadow-sm">
                          <input value={cat.title} onChange={(e) => {
                            const newCats = [...sec.categories]; newCats[catIdx] = { ...newCats[catIdx], title: e.target.value }; updateSectionField(sec.id, 'categories', newCats);
                          }} className="w-full text-[10px] font-black uppercase mb-2 border-b" />
                          <div className="flex flex-wrap gap-1">
                            {cat.items.map((s, sIdx) => (
                              <div key={sIdx} className="flex items-center gap-1 bg-slate-50 border rounded px-1">
                                <input value={s} onChange={(e) => {
                                  const newCats = [...sec.categories]; newCats[catIdx] = { ...newCats[catIdx], items: [...newCats[catIdx].items] }; newCats[catIdx].items[sIdx] = e.target.value; updateSectionField(sec.id, 'categories', newCats);
                                }} className="text-[9px] w-16 bg-transparent" />
                                <button onClick={() => {
                                  const newCats = [...sec.categories]; newCats[catIdx] = { ...newCats[catIdx], items: newCats[catIdx].items.filter((_, i) => i !== sIdx) }; updateSectionField(sec.id, 'categories', newCats);
                                }} className="text-slate-300 hover:text-red-500"><Icons.Trash /></button>
                              </div>
                            ))}
                            <button onClick={() => {
                              const newCats = [...sec.categories]; newCats[catIdx] = { ...newCats[catIdx], items: [...newCats[catIdx].items, ""] }; updateSectionField(sec.id, 'categories', newCats);
                            }} className="text-blue-600 p-0.5"><Icons.Plus /></button>
                          </div>
                        </div>
                      ))}
                      <button onClick={() => {
                        const newCats = [...sec.categories, { id: Date.now().toString(), title: "New Group", items: [""] }];
                        updateSectionField(sec.id, 'categories', newCats);
                      }} className="w-full py-1 border rounded text-[9px] font-bold text-slate-400">+ ADD CATEGORY</button>
                    </div>
                  )}

                  {sec.type === 'list' && (
                    <div className="space-y-3">
                      {sec.items.map((item, iIdx) => (
                        <div key={item.id} className="bg-white p-2 border rounded relative">
                          <div className="grid grid-cols-2 gap-2">
                            <input value={item.title} onChange={(e) => {
                              const newItems = [...sec.items]; newItems[iIdx] = { ...newItems[iIdx], title: e.target.value }; updateSectionField(sec.id, 'items', newItems);
                            }} placeholder="Title" className="col-span-2 text-xs font-bold border-b mb-1" />
                            <input value={item.subtitle} onChange={(e) => {
                              const newItems = [...sec.items]; newItems[iIdx] = { ...newItems[iIdx], subtitle: e.target.value }; updateSectionField(sec.id, 'items', newItems);
                            }} placeholder="Subtitle" className="text-[9px] border p-1 rounded" />
                            <input value={item.date} onChange={(e) => {
                              const newItems = [...sec.items]; newItems[iIdx] = { ...newItems[iIdx], date: e.target.value }; updateSectionField(sec.id, 'items', newItems);
                            }} placeholder="Date" className="text-[9px] border p-1 rounded" />
                          </div>
                          <button onClick={() => {
                            const newItems = sec.items.filter((_, i) => i !== iIdx); updateSectionField(sec.id, 'items', newItems);
                          }} className="absolute -top-1 -right-1 bg-red-50 text-red-500 rounded-full p-0.5 shadow-sm border border-red-100 hover:bg-red-500 hover:text-white transition-all"><Icons.Trash /></button>
                        </div>
                      ))}
                      <button onClick={() => {
                        const newItems = [...sec.items, { id: Date.now().toString(), title: "", subtitle: "", date: "" }];
                        updateSectionField(sec.id, 'items', newItems);
                      }} className="text-[10px] font-bold text-blue-600 tracking-tight hover:underline">+ ADD ITEM</button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              <button onClick={() => addSection('experience')} className="px-3 py-1 bg-slate-900 text-white rounded text-[9px] font-black">+ WORK</button>
              <button onClick={() => addSection('skills')} className="px-3 py-1 bg-slate-900 text-white rounded text-[9px] font-black">+ SKILLS</button>
              <button onClick={() => addSection('list')} className="px-3 py-1 bg-slate-900 text-white rounded text-[9px] font-black">+ LIST</button>
              <button onClick={() => addSection('text')} className="px-3 py-1 bg-slate-900 text-white rounded text-[9px] font-black">+ SUMMARY</button>
            </div>
          </section>
        </div>
      </div>

      {/* A4 Preview Screen */}
      <div ref={previewWrapperRef} className={`${mobileTab === 'preview' ? 'flex' : 'hidden'} md:flex flex-1 p-4 md:p-8 overflow-y-auto justify-center items-start print:p-0 print:block bg-slate-200`}>
        <div
          id="cv-preview"
          className="bg-white shadow-[0_0_50px_rgba(0,0,0,0.2)] w-[210mm] p-[12mm] text-slate-800 print:shadow-none print:w-full relative"
          style={{ boxSizing: 'border-box', zoom: previewScale }}
        >
          {/* Header */}
          <header className="border-b-2 border-slate-900 pb-5 mb-8 text-center">
            <h1 className="text-4xl font-black tracking-tighter mb-4 text-slate-900 leading-none uppercase">{cvData.personalInfo.fullName}</h1>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-1 text-[11px] text-slate-500 font-bold tracking-wide">
              <span className="flex items-center gap-2 lowercase"><Icons.Mail /> {cvData.personalInfo.email.toLowerCase()}</span>
              <span className="flex items-center gap-2 tracking-normal font-bold"><Icons.Phone /> {cvData.personalInfo.phone}</span>
              <span className="flex items-center gap-2 capitalize font-bold"><Icons.MapPin /> {cvData.personalInfo.location}</span>
            </div>
          </header>

          <div className="grid grid-cols-12 gap-10">
            {/* Left Content Column */}
            <div className="col-span-8 space-y-8">
              {cvData.sections.filter(s => s.column === 'left').map(section => (
                <section key={section.id}>
                  <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-1 mb-4 uppercase tracking-tighter leading-none">
                    {section.title}
                  </h3>

                  {section.type === 'text' && (
                    <p className="text-[11px] leading-relaxed text-slate-600 font-medium italic">
                      &ldquo;{section.content}&rdquo;
                    </p>
                  )}

                  {section.type === 'experience' && (
                    <div className="space-y-6">
                      {section.items.map((exp, i) => (
                        <div key={i} className="relative pl-4 border-l-2 border-slate-200">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <h4 className="text-[13px] font-black text-slate-900 tracking-tight leading-none">
                              {toSentenceCase(exp.company)}
                            </h4>
                            <span className="text-[8.5px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded tracking-widest uppercase">{exp.dates}</span>
                          </div>
                          <div className="flex justify-between items-baseline mb-3">
                            <span className="text-[11.5px] font-bold text-blue-700 tracking-tighter capitalize">
                              {toSentenceCase(exp.role)}
                            </span>
                            <span className="text-[9.5px] text-slate-400 italic font-medium capitalize">{exp.location}</span>
                          </div>
                          <ul className="space-y-1.5">
                            {exp.bullets.map((bullet, bi) => (
                              bullet && (
                                <li key={bi} className="text-[11px] text-slate-600 leading-snug flex items-start gap-2">
                                  <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-600 shrink-0"></span>
                                  <span>{bullet}</span>
                                </li>
                              )
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.type === 'list' && (
                    <div className="space-y-5">
                      {section.items.map((item, i) => (
                        <div key={i}>
                          <p className="text-[11px] font-black text-slate-900 uppercase leading-tight">{item.title}</p>
                          <p className="text-[10px] text-blue-700 font-bold my-1">{item.subtitle}</p>
                          <p className="text-[9px] text-slate-400 font-bold">{item.date}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>

            {/* Sidebar Column */}
            <div className="col-span-4 space-y-8 border-l border-slate-50 pl-3">
              {cvData.sections.filter(s => s.column === 'right').map(section => (
                <section key={section.id}>
                  <h3 className="text-[11.5px] font-black text-slate-900 border-b-2 border-slate-900 pb-1 mb-4 uppercase tracking-wider leading-none">
                    {section.title}
                  </h3>

                  {section.type === 'skills' && (
                    <div className="space-y-6">
                      {section.categories.map((cat, ci) => (
                        <div key={ci}>
                          <h4 className="text-[9.5px] font-black text-blue-700 uppercase mb-2 tracking-widest leading-none">{cat.title}</h4>
                          <div className="flex flex-col gap-1.5">
                            {cat.items.map((skill, si) => (
                              <div key={si} className="text-[10.5px] font-bold text-slate-700 flex items-center gap-1.5 leading-tight">
                                <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                                {skill}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.type === 'list' && (
                    <div className="space-y-5">
                      {section.items.map((item, i) => (
                        <div key={i}>
                          <p className="text-[10.5px] font-black text-slate-900 leading-tight uppercase">{item.title}</p>
                          <p className="text-[9.5px] text-blue-700 font-bold my-1 leading-tight tracking-tight">{item.subtitle}</p>
                          <p className="text-[8.5px] text-slate-400 font-bold mb-1 uppercase tracking-tighter">{item.date}</p>
                          {item.institution && <p className="text-[9px] text-slate-500 italic font-medium">{item.institution}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>

      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { background-color: white !important; -webkit-print-color-adjust: exact; }
          #cv-preview {
            zoom: 1 !important;
            box-shadow: none !important;
            padding: 10mm !important;
            width: 210mm !important;
            height: 297mm !important;
            overflow: hidden !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .print\\:hidden { display: none !important; }
        }
        #cv-preview::-webkit-scrollbar { display: none; }
        input:focus, textarea:focus { border-color: #2563eb !important; background-color: #fff !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
