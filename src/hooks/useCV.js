import { useState, useCallback } from 'react';
import { DEFAULT_CV_DATA, DEFAULT_THEME } from '../utils/constants';
import { fixCvJSON } from '../utils/ai';

export function useCV() {
  const [cvData, setCvData] = useState(() => {
    const saved = localStorage.getItem('cv-architect-data');
    return saved ? JSON.parse(saved) : DEFAULT_CV_DATA;
  });

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('cv-architect-theme');
    return saved ? JSON.parse(saved) : DEFAULT_THEME;
  });

  const save = useCallback((data, themeData) => {
    localStorage.setItem('cv-architect-data', JSON.stringify(data));
    localStorage.setItem('cv-architect-theme', JSON.stringify(themeData));
  }, []);

  const updateCvData = useCallback((updater) => {
    setCvData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      save(next, theme);
      return next;
    });
  }, [theme, save]);

  const updateTheme = useCallback((updater) => {
    setTheme(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      save(cvData, next);
      return next;
    });
  }, [cvData, save]);

  const updatePersonalInfo = useCallback((field, value) => {
    updateCvData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  }, [updateCvData]);

  const updateSection = useCallback((id, updates) => {
    updateCvData(prev => ({
      ...prev,
      sections: prev.sections.map(s => (s.id === id ? { ...s, ...updates } : s)),
    }));
  }, [updateCvData]);

  const addSection = useCallback((type) => {
    const id = `sec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    let newSection;

    switch (type) {
      case 'experience':
        newSection = { id, title: 'Experience', type: 'experience', column: 'left', items: [{ id: `exp_${Date.now()}`, company: '', role: '', dates: '', location: '', bullets: [''] }] };
        break;
      case 'skills':
        newSection = { id, title: 'Skills', type: 'skills', column: 'right', categories: [{ id: `cat_${Date.now()}`, title: 'Category', items: [''] }] };
        break;
      case 'list':
        newSection = { id, title: 'Education', type: 'list', column: 'right', items: [{ id: `item_${Date.now()}`, title: '', subtitle: '', date: '', institution: '' }] };
        break;
      case 'projects':
        newSection = { id, title: 'Projects', type: 'projects', column: 'left', items: [{ id: `proj_${Date.now()}`, name: '', description: '', tech: '', link: '' }] };
        break;
      case 'languages':
        newSection = { id, title: 'Languages', type: 'languages', column: 'right', items: [{ id: `lang_${Date.now()}`, language: '', level: 'Professional' }] };
        break;
      default:
        newSection = { id, title: 'Summary', type: 'text', column: 'left', content: '' };
    }

    updateCvData(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
    return id;
  }, [updateCvData]);

  const removeSection = useCallback((id) => {
    updateCvData(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== id),
    }));
  }, [updateCvData]);

  const moveSection = useCallback((fromIndex, toIndex) => {
    updateCvData(prev => {
      const sections = [...prev.sections];
      const [moved] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, moved);
      return { ...prev, sections };
    });
  }, [updateCvData]);

  const reorderSections = useCallback((newOrder) => {
    updateCvData(prev => ({ ...prev, sections: newOrder }));
  }, [updateCvData]);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify({ cvData, theme }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cvData.personalInfo.fullName.replace(/\s+/g, '_') || 'CV'}_backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [cvData, theme]);

  const importJSON = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const raw = ev.target.result;

        // Try direct parse first
        try {
          const parsed = JSON.parse(raw);
          if (parsed.cvData && parsed.cvData.personalInfo) {
            setCvData(parsed.cvData);
            if (parsed.theme) setTheme(parsed.theme);
            save(parsed.cvData, parsed.theme || theme);
            resolve({ fixed: false });
            return;
          } else if (parsed.personalInfo && parsed.sections) {
            setCvData(parsed);
            save(parsed, theme);
            resolve({ fixed: false });
            return;
          }
        } catch {
          // JSON parse failed — fall through to AI repair
        }

        // AI repair attempt
        try {
          const fixed = await fixCvJSON(raw);
          setCvData(fixed);
          save(fixed, theme);
          resolve({ fixed: true });
        } catch (aiErr) {
          reject(new Error('Could not parse or repair the file: ' + aiErr.message));
        }
      };
      reader.readAsText(file);
    });
  }, [save, theme]);

  return {
    cvData,
    theme,
    setCvData: updateCvData,
    setTheme: updateTheme,
    updatePersonalInfo,
    updateSection,
    addSection,
    removeSection,
    moveSection,
    reorderSections,
    exportJSON,
    importJSON,
  };
}
