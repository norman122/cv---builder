import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { Palette, Type, Layout, Maximize2, Sun } from 'lucide-react';
import { TEMPLATES, FONT_OPTIONS, COLOR_PRESETS } from '../utils/constants';

export default function ThemeCustomizer({ theme, setTheme }) {
  const [showPicker, setShowPicker] = React.useState(null);

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div>
        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
          <Layout size={12} /> Layout Template
        </label>
        <div className="grid grid-cols-3 gap-2">
          {Object.values(TEMPLATES).map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(prev => ({ ...prev, template: t.id }))}
              className={`p-3 rounded-xl border-2 text-center transition-all hover:scale-[1.02] ${
                theme.template === t.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-2xl mb-1">{t.preview}</div>
              <div className="text-[10px] font-bold text-slate-700">{t.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Color Presets */}
      <div>
        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
          <Palette size={12} /> Color Scheme
        </label>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {COLOR_PRESETS.map(preset => (
            <button
              key={preset.name}
              onClick={() => setTheme(prev => ({ ...prev, accentColor: preset.accent, secondaryColor: preset.secondary }))}
              className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                theme.accentColor === preset.accent ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex gap-0.5">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.accent }} />
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.secondary }} />
              </div>
              <span className="text-[9px] font-bold text-slate-600">{preset.name}</span>
            </button>
          ))}
        </div>

        {/* Custom Color Pickers */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <button
              onClick={() => setShowPicker(showPicker === 'accent' ? null : 'accent')}
              className="w-full flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:border-slate-300"
            >
              <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: theme.accentColor }} />
              <span className="text-[9px] font-bold text-slate-500">Primary</span>
            </button>
            {showPicker === 'accent' && (
              <div className="absolute top-full mt-2 z-50 p-3 bg-white rounded-xl shadow-xl border">
                <HexColorPicker color={theme.accentColor} onChange={(c) => setTheme(prev => ({ ...prev, accentColor: c }))} />
              </div>
            )}
          </div>
          <div className="relative flex-1">
            <button
              onClick={() => setShowPicker(showPicker === 'secondary' ? null : 'secondary')}
              className="w-full flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:border-slate-300"
            >
              <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: theme.secondaryColor }} />
              <span className="text-[9px] font-bold text-slate-500">Accent</span>
            </button>
            {showPicker === 'secondary' && (
              <div className="absolute top-full mt-2 z-50 p-3 bg-white rounded-xl shadow-xl border">
                <HexColorPicker color={theme.secondaryColor} onChange={(c) => setTheme(prev => ({ ...prev, secondaryColor: c }))} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Font Selection */}
      <div>
        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
          <Type size={12} /> Font
        </label>
        <div className="space-y-1">
          {FONT_OPTIONS.map(font => (
            <button
              key={font.id}
              onClick={() => setTheme(prev => ({ ...prev, fontFamily: font.family }))}
              className={`w-full text-left px-3 py-2 rounded-lg border transition-all ${
                theme.fontFamily === font.family
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-transparent hover:bg-slate-50'
              }`}
            >
              <span className="text-sm font-medium" style={{ fontFamily: font.family }}>{font.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
          <Type size={12} /> Font Size
        </label>
        <div className="flex gap-2">
          {['small', 'medium', 'large'].map(size => (
            <button
              key={size}
              onClick={() => setTheme(prev => ({ ...prev, fontSize: size }))}
              className={`flex-1 py-2 rounded-lg border text-[10px] font-bold capitalize transition-all ${
                theme.fontSize === size ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Spacing */}
      <div>
        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
          <Maximize2 size={12} /> Spacing
        </label>
        <div className="flex gap-2">
          {['compact', 'normal', 'relaxed'].map(s => (
            <button
              key={s}
              onClick={() => setTheme(prev => ({ ...prev, spacing: s }))}
              className={`flex-1 py-2 rounded-lg border text-[10px] font-bold capitalize transition-all ${
                theme.spacing === s ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Header Style */}
      <div>
        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
          <Sun size={12} /> Header Style
        </label>
        <div className="flex gap-2">
          {['centered', 'left-aligned', 'bold-banner'].map(style => (
            <button
              key={style}
              onClick={() => setTheme(prev => ({ ...prev, headerStyle: style }))}
              className={`flex-1 py-2 rounded-lg border text-[9px] font-bold capitalize transition-all ${
                theme.headerStyle === style ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {style.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
