import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Upload, FileDown, Sparkles, Palette, PenTool,
  Eye, Bot, X, Menu, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import { useCV } from './hooks/useCV';
import { useAI } from './hooks/useAI';
import Editor from './components/Editor';
import AIChat from './components/AIChat';
import ThemeCustomizer from './components/ThemeCustomizer';
import { ClassicTemplate, ModernTemplate, MinimalTemplate } from './components/Preview';
import { downloadPDF } from './utils/pdf';

const TABS = [
  { id: 'editor', label: 'Editor', icon: PenTool },
  { id: 'design', label: 'Design', icon: Palette },
  { id: 'ai', label: 'AI Assistant', icon: Bot },
];

function App() {
  const {
    cvData, theme, setCvData, setTheme,
    updatePersonalInfo, updateSection, addSection, removeSection,
    moveSection, reorderSections, exportJSON, importJSON,
  } = useCV();

  const ai = useAI(cvData, setCvData);
  const [activeTab, setActiveTab] = useState('editor');
  const [mobileView, setMobileView] = useState('editor'); // 'editor' | 'preview'
  const [isExporting, setIsExporting] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const importRef = useRef(null);
  const previewRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(1);

  // Preview scaling
  useEffect(() => {
    const updateScale = () => {
      if (!previewRef.current) return;
      const containerWidth = previewRef.current.offsetWidth - 64;
      const A4_WIDTH = 794; // 210mm in px at 96dpi
      if (containerWidth > 0) {
        setPreviewScale(Math.min(1, containerWidth / A4_WIDTH));
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [sidebarCollapsed]);

  // AI section enhancement
  const handleAIEnhance = async (sectionId, textOrRole, typeOrCompany, itemIdx) => {
    if (typeof itemIdx === 'number') {
      const bullets = await ai.generateBulletsForRole(textOrRole, typeOrCompany);
      if (bullets.length > 0) {
        const sections = cvData.sections.map(s => {
          if (s.id === sectionId && s.type === 'experience') {
            const items = [...s.items];
            items[itemIdx] = { ...items[itemIdx], bullets };
            return { ...s, items };
          }
          return s;
        });
        setCvData(prev => ({ ...prev, sections }));
      }
      return;
    }

    const enhanced = await ai.enhanceSectionText(textOrRole, typeOrCompany);
    if (enhanced) {
      updateSection(sectionId, { content: enhanced.trim() });
    }
  };

  // PDF download
  const handleDownload = async () => {
    setIsExporting(true);
    try {
      await downloadPDF(cvData, theme);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF export failed: ' + err.message);
    }
    setIsExporting(false);
  };

  // File import
  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await importJSON(file);
      if (result?.fixed) {
        alert('✨ AI repaired your JSON file and imported it successfully!');
      }
    } catch (err) {
      alert(err.message);
    }
    e.target.value = '';
  };

  // Template renderer
  const renderPreview = () => {
    const props = { cvData, theme };
    switch (theme.template) {
      case 'modern': return <ModernTemplate {...props} />;
      case 'minimal': return <MinimalTemplate {...props} />;
      default: return <ClassicTemplate {...props} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100 font-sans overflow-hidden">
      {/* Top Bar */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hidden md:flex"
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
              <span className="text-white font-black text-[10px]">CV</span>
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-800 tracking-tight leading-none">CV Architect</h1>
              <p className="text-[9px] text-slate-400 font-medium">AI-Powered Resume Builder</p>
            </div>
          </div>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex md:hidden gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setMobileView('editor')}
            className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${mobileView === 'editor' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
          >
            <PenTool size={14} />
          </button>
          <button
            onClick={() => setMobileView('preview')}
            className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${mobileView === 'preview' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
          >
            <Eye size={14} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => importRef.current?.click()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Upload size={12} /> Import
          </button>
          <button
            onClick={exportJSON}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <FileDown size={12} /> Export
          </button>
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-black text-white text-[11px] font-bold shadow-md transition-all active:scale-95 disabled:opacity-60"
          >
            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            <span className="hidden sm:inline">Download PDF</span>
          </button>
          <input ref={importRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 480, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`${mobileView === 'editor' ? 'flex' : 'hidden'} md:flex flex-col bg-white border-r border-slate-200 overflow-hidden shrink-0 w-full md:w-[480px]`}
            >
              {/* Sidebar Tabs */}
              <div className="flex border-b border-slate-100 shrink-0 bg-slate-50/50">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 bg-white'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <tab.icon size={13} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === 'editor' && (
                  <div className="p-5">
                    <Editor
                      cvData={cvData}
                      updatePersonalInfo={updatePersonalInfo}
                      updateSection={updateSection}
                      addSection={addSection}
                      removeSection={removeSection}
                      reorderSections={reorderSections}
                      onAIEnhance={handleAIEnhance}
                      aiLoading={ai.isLoading}
                    />
                  </div>
                )}
                {activeTab === 'design' && (
                  <div className="p-5">
                    <ThemeCustomizer theme={theme} setTheme={setTheme} />
                  </div>
                )}
                {activeTab === 'ai' && (
                  <AIChat
                    messages={ai.messages}
                    isLoading={ai.isLoading}
                    onSend={ai.sendMessage}
                    hasApiKey={ai.hasApiKey}
                  />
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Preview Panel */}
        <div
          ref={previewRef}
          className={`${mobileView === 'preview' ? 'flex' : 'hidden'} md:flex flex-1 overflow-y-auto justify-center items-start p-4 md:p-8 bg-slate-200/50`}
        >
          <div
            className="shadow-[0_4px_60px_rgba(0,0,0,0.15)] rounded-sm"
            style={{ transform: `scale(${previewScale})`, transformOrigin: 'top center' }}
          >
            {renderPreview()}
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { background-color: white !important; }
        }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}

export default App;
