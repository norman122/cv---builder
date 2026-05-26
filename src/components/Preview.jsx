import React from 'react';
import { Mail, Phone, MapPin, Globe, Link } from 'lucide-react';



const FONT_SCALE = { small: 0.92, medium: 1, large: 1.08 };

function renderSection(section, theme, isRight = false) {
  const headingClass = isRight
    ? 'text-[10.5px] font-black border-b pb-1 mb-3 tracking-wider leading-none'
    : 'text-[13px] font-black border-b pb-1.5 mb-3 tracking-tight leading-none';

  return (
    <section key={section.id} className="mb-5">
      <h3
        className={headingClass}
        style={{ color: theme.accentColor, borderColor: isRight ? theme.accentColor : '#e2e8f0' }}
      >
        {section.title}
      </h3>

      {section.type === 'text' && (
        <p className="text-[10.5px] leading-relaxed text-slate-600 italic">
          &ldquo;{section.content}&rdquo;
        </p>
      )}

      {section.type === 'experience' && (
        <div className="space-y-4">
          {section.items?.map((exp, i) => (
            <div key={i} className="relative pl-3 border-l-2" style={{ borderColor: '#e2e8f0' }}>
              <div className="flex justify-between items-baseline mb-0.5">
                <h4 className="text-[12px] font-black text-slate-900 tracking-tight">{exp.company}</h4>
                <span className="text-[8px] font-bold text-slate-400 tracking-widest">{exp.dates}</span>
              </div>
              <p className="text-[10.5px] font-bold mb-1.5" style={{ color: theme.secondaryColor }}>{exp.role}</p>
              <ul className="space-y-1">
                {exp.bullets?.filter(Boolean).map((b, bi) => (
                  <li key={bi} className="text-[10px] text-slate-600 leading-snug flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: theme.secondaryColor }} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {section.type === 'skills' && (
        <div className="space-y-3">
          {section.categories?.map((cat, ci) => (
            <div key={ci}>
              <h4 className="text-[9px] font-black mb-1.5 tracking-widest" style={{ color: theme.secondaryColor }}>{cat.title}</h4>
              <div className="flex flex-col gap-1">
                {cat.items?.filter(Boolean).map((skill, si) => (
                  <div key={si} className="text-[10px] font-medium text-slate-700 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-slate-400 rounded-full" />
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {section.type === 'list' && (
        <div className="space-y-3">
          {section.items?.map((item, i) => (
            <div key={i}>
              <p className="text-[10.5px] font-black text-slate-900 leading-tight">{item.title}</p>
              {item.subtitle && <p className="text-[9.5px] font-bold mt-0.5" style={{ color: theme.secondaryColor }}>{item.subtitle}</p>}
              {item.date && <p className="text-[8.5px] text-slate-400 font-bold">{item.date}</p>}
              {item.institution && <p className="text-[8.5px] text-slate-500 italic">{item.institution}</p>}
            </div>
          ))}
        </div>
      )}

      {section.type === 'projects' && (
        <div className="space-y-3">
          {section.items?.map((item, i) => (
            <div key={i}>
              <p className="text-[11px] font-black text-slate-900">{item.name}</p>
              {item.description && <p className="text-[9.5px] text-slate-600 mt-0.5 leading-snug">{item.description}</p>}
              {item.tech && <p className="text-[8.5px] font-bold mt-1" style={{ color: theme.secondaryColor }}>{item.tech}</p>}
            </div>
          ))}
        </div>
      )}

      {section.type === 'languages' && (
        <div className="space-y-2">
          {section.items?.map((item, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-700">{item.language}</span>
              <span className="text-[8.5px] font-medium text-slate-400">{item.level}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function ClassicTemplate({ cvData, theme }) {
  const spacing = theme.spacing === 'compact' ? 'p-[10mm]' : theme.spacing === 'relaxed' ? 'p-[14mm]' : 'p-[11mm]';
  const scale = FONT_SCALE[theme.fontSize] || 1;
  const left = cvData.sections.filter(s => s.column === 'left');
  const right = cvData.sections.filter(s => s.column === 'right');

  return (
    <div className={`bg-white w-[210mm] min-h-[297mm] ${spacing} text-slate-800`} style={{ fontFamily: theme.fontFamily, zoom: scale }}>
      {/* Header */}
      <header className={`border-b-2 pb-4 mb-6 ${theme.headerStyle === 'centered' ? 'text-center' : ''}`} style={{ borderColor: '#e2e8f0' }}>
        <h1 className="text-[29px] font-black tracking-tight mb-2 leading-none" style={{ color: theme.accentColor }}>
          {cvData.personalInfo.fullName}
        </h1>
        {cvData.personalInfo.title && (
          <p className="text-[11px] font-bold mb-2.5" style={{ color: theme.secondaryColor }}>{cvData.personalInfo.title}</p>
        )}
        <div className={`flex flex-wrap gap-x-5 gap-y-1 text-[9.5px] text-slate-500 font-medium ${theme.headerStyle === 'centered' ? 'justify-center' : ''}`}>
          {cvData.personalInfo.email && <span className="flex items-center gap-1.5"><Mail size={10} /> {cvData.personalInfo.email}</span>}
          {cvData.personalInfo.phone && <span className="flex items-center gap-1.5"><Phone size={10} /> {cvData.personalInfo.phone}</span>}
          {cvData.personalInfo.location && <span className="flex items-center gap-1.5"><MapPin size={10} /> {cvData.personalInfo.location}</span>}
          {cvData.personalInfo.website && <span className="flex items-center gap-1.5"><Globe size={10} /> {cvData.personalInfo.website}</span>}
          {cvData.personalInfo.linkedin && <span className="flex items-center gap-1.5"><Link size={10} /> {cvData.personalInfo.linkedin}</span>}
        </div>
      </header>

      {/* Two Column Layout */}
      <div className="grid grid-cols-12 gap-7">
        <div className="col-span-8">
          {left.map(s => renderSection(s, theme, false))}
        </div>
        <div className="col-span-4 border-l border-slate-100 pl-4">
          {right.map(s => renderSection(s, theme, true))}
        </div>
      </div>
    </div>
  );
}

export function ModernTemplate({ cvData, theme }) {
  const spacing = theme.spacing === 'compact' ? 'p-[10mm]' : theme.spacing === 'relaxed' ? 'p-[15mm]' : 'p-[12mm]';
  const scale = FONT_SCALE[theme.fontSize] || 1;
  const left = cvData.sections.filter(s => s.column === 'left');
  const right = cvData.sections.filter(s => s.column === 'right');

  const sidebarAlign = theme.headerStyle === 'centered' ? 'text-center items-center' : '';

  return (
    <div className="bg-white w-[210mm] min-h-[297mm] flex" style={{ fontFamily: theme.fontFamily, zoom: scale }}>
      {/* Sidebar */}
      <div className={`w-[70mm] min-h-full text-white p-6 ${theme.headerStyle === 'bold-banner' ? 'w-[80mm]' : ''}`} style={{ backgroundColor: '#111827' }}>
        <div className={`mb-8 ${sidebarAlign}`}>
          <h1 className={`font-black tracking-tight leading-tight mb-2 ${theme.headerStyle === 'bold-banner' ? 'text-3xl' : 'text-2xl'}`}>{cvData.personalInfo.fullName}</h1>
          {cvData.personalInfo.title && <p className="text-[11px] font-medium opacity-80">{cvData.personalInfo.title}</p>}
        </div>

        <div className={`space-y-2 mb-8 text-[9.5px] opacity-90 ${sidebarAlign}`}>
          {cvData.personalInfo.email && <div className="flex items-center gap-2"><Mail size={10} /> {cvData.personalInfo.email}</div>}
          {cvData.personalInfo.phone && <div className="flex items-center gap-2"><Phone size={10} /> {cvData.personalInfo.phone}</div>}
          {cvData.personalInfo.location && <div className="flex items-center gap-2"><MapPin size={10} /> {cvData.personalInfo.location}</div>}
          {cvData.personalInfo.website && <div className="flex items-center gap-2"><Globe size={10} /> {cvData.personalInfo.website}</div>}
        </div>

        {/* Right sections in sidebar */}
        <div className="space-y-6">
          {right.map(section => (
            <div key={section.id}>
              <h3 className="text-[10px] font-black tracking-widest border-b border-slate-500 pb-1.5 mb-3">{section.title}</h3>
              {section.type === 'skills' && section.categories?.map((cat, ci) => (
                <div key={ci} className="mb-3">
                  <h4 className="text-[8.5px] font-bold tracking-wider opacity-70 mb-1">{cat.title}</h4>
                  {cat.items?.filter(Boolean).map((skill, si) => (
                    <div key={si} className="text-[9.5px] font-medium opacity-90 py-0.5 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-white/50" />{skill}
                    </div>
                  ))}
                </div>
              ))}
              {section.type === 'list' && section.items?.map((item, i) => (
                <div key={i} className="mb-3">
                  <p className="text-[10px] font-bold">{item.title}</p>
                  {item.subtitle && <p className="text-[9px] opacity-70">{item.subtitle}</p>}
                  {item.date && <p className="text-[8px] opacity-50">{item.date}</p>}
                </div>
              ))}
              {section.type === 'languages' && section.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-[9.5px] py-0.5">
                  <span className="font-medium">{item.language}</span>
                  <span className="opacity-60">{item.level}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${spacing}`}>
        {left.map(s => renderSection(s, theme, false))}
      </div>
    </div>
  );
}

export function MinimalTemplate({ cvData, theme }) {
  const spacing = theme.spacing === 'compact' ? 'p-[12mm]' : theme.spacing === 'relaxed' ? 'p-[18mm]' : 'p-[15mm]';
  const scale = FONT_SCALE[theme.fontSize] || 1;
  const allSections = cvData.sections;

  const headerCenter = theme.headerStyle === 'centered' ? 'text-center' : '';
  const isBanner = theme.headerStyle === 'bold-banner';

  return (
    <div className={`bg-white w-[210mm] min-h-[297mm] ${spacing} text-slate-800`} style={{ fontFamily: theme.fontFamily, zoom: scale }}>
      {/* Minimal Header */}
      <header className={`mb-10 ${headerCenter} ${isBanner ? 'rounded-lg px-8 py-6 -mx-4 mb-8' : ''}`} style={isBanner ? { backgroundColor: theme.accentColor, color: 'white' } : {}}>
        <h1 className="text-4xl font-black tracking-tighter mb-1 leading-none" style={{ color: isBanner ? 'white' : theme.accentColor }}>
          {cvData.personalInfo.fullName}
        </h1>
        {cvData.personalInfo.title && (
          <p className={`text-base font-medium mb-4 ${isBanner ? 'opacity-80' : 'text-slate-500'}`}>{cvData.personalInfo.title}</p>
        )}
        <div className={`flex flex-wrap gap-x-5 text-[10px] font-medium ${isBanner ? 'opacity-70 justify-center' : 'text-slate-400'} ${headerCenter ? 'justify-center' : ''}`}>
          {cvData.personalInfo.email && <span>{cvData.personalInfo.email}</span>}
          {cvData.personalInfo.phone && <span>{cvData.personalInfo.phone}</span>}
          {cvData.personalInfo.location && <span>{cvData.personalInfo.location}</span>}
          {cvData.personalInfo.website && <span>{cvData.personalInfo.website}</span>}
        </div>
      </header>

      {/* Single Column - All Sections */}
      <div className="space-y-8">
        {allSections.map(section => (
          <section key={section.id}>
            <h3 className="text-[11px] font-black tracking-widest mb-4 pb-2 border-b" style={{ color: theme.accentColor, borderColor: theme.accentColor + '30' }}>
              {section.title}
            </h3>

            {section.type === 'text' && (
              <p className="text-[11px] leading-relaxed text-slate-600">{section.content}</p>
            )}

            {section.type === 'experience' && (
              <div className="space-y-6">
                {section.items?.map((exp, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-[12px] font-bold text-slate-900">{exp.company}</h4>
                      <span className="text-[9px] text-slate-400">{exp.dates}</span>
                    </div>
                    <p className="text-[10.5px] font-medium mb-2" style={{ color: theme.secondaryColor }}>{exp.role}</p>
                    <ul className="space-y-1 ml-3">
                      {exp.bullets?.filter(Boolean).map((b, bi) => (
                        <li key={bi} className="text-[10px] text-slate-600 leading-snug list-disc">{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {section.type === 'skills' && (
              <div className="space-y-3">
                {section.categories?.map((cat, ci) => (
                  <div key={ci}>
                    <span className="text-[9px] font-bold text-slate-400">{cat.title}: </span>
                    <span className="text-[10px] text-slate-700">{cat.items?.filter(Boolean).join(' · ')}</span>
                  </div>
                ))}
              </div>
            )}

            {section.type === 'list' && (
              <div className="space-y-3">
                {section.items?.map((item, i) => (
                  <div key={i} className="flex justify-between items-baseline">
                    <div>
                      <p className="text-[11px] font-bold text-slate-900">{item.title}</p>
                      {item.subtitle && <p className="text-[9.5px]" style={{ color: theme.secondaryColor }}>{item.subtitle}</p>}
                      {item.institution && <p className="text-[9px] text-slate-400 italic">{item.institution}</p>}
                    </div>
                    {item.date && <span className="text-[8.5px] text-slate-400">{item.date}</span>}
                  </div>
                ))}
              </div>
            )}

            {section.type === 'projects' && (
              <div className="space-y-4">
                {section.items?.map((item, i) => (
                  <div key={i}>
                    <p className="text-[11px] font-bold text-slate-900">{item.name}</p>
                    {item.description && <p className="text-[9.5px] text-slate-600 mt-0.5">{item.description}</p>}
                    {item.tech && <p className="text-[8.5px] font-medium mt-0.5" style={{ color: theme.secondaryColor }}>{item.tech}</p>}
                  </div>
                ))}
              </div>
            )}

            {section.type === 'languages' && (
              <div className="flex flex-wrap gap-4">
                {section.items?.map((item, i) => (
                  <div key={i} className="text-[10px]">
                    <span className="font-bold text-slate-700">{item.language}</span>
                    <span className="text-slate-400 ml-1">({item.level})</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
