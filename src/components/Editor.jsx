import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GripVertical, Trash2, ChevronDown, ChevronRight, Plus, Sparkles,
  Loader2, ArrowUpDown, Columns2, FileText, Briefcase, Zap,
  GraduationCap, FolderGit2, Globe
} from 'lucide-react';
import { SECTION_TYPES } from '../utils/constants';

const SECTION_ICONS = {
  text: FileText,
  experience: Briefcase,
  skills: Zap,
  list: GraduationCap,
  projects: FolderGit2,
  languages: Globe,
};

function SortableSection({ section, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="group">
        <div className="flex items-center gap-1 mb-1">
          <button {...listeners} className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-500">
            <GripVertical size={14} />
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}

function ExperienceEditor({ section, onUpdate, onAIEnhance, aiLoading }) {
  return (
    <div className="space-y-3">
      {section.items.map((item, idx) => (
        <div key={item.id} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <input
              value={item.company}
              onChange={(e) => {
                const items = [...section.items];
                items[idx] = { ...items[idx], company: e.target.value };
                onUpdate({ items });
              }}
              className="text-xs font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-400 outline-none flex-1"
              placeholder="Company"
            />
            <button
              onClick={() => {
                const items = section.items.filter((_, i) => i !== idx);
                onUpdate({ items });
              }}
              className="p-1 text-slate-300 hover:text-red-500 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              value={item.role}
              onChange={(e) => {
                const items = [...section.items];
                items[idx] = { ...items[idx], role: e.target.value };
                onUpdate({ items });
              }}
              className="text-[10px] border border-slate-100 p-1.5 rounded-lg bg-slate-50 focus:bg-white focus:border-blue-300 outline-none"
              placeholder="Role / Title"
            />
            <input
              value={item.dates}
              onChange={(e) => {
                const items = [...section.items];
                items[idx] = { ...items[idx], dates: e.target.value };
                onUpdate({ items });
              }}
              className="text-[10px] border border-slate-100 p-1.5 rounded-lg bg-slate-50 focus:bg-white focus:border-blue-300 outline-none"
              placeholder="Date range"
            />
          </div>
          <div className="space-y-1.5">
            {item.bullets.map((b, bIdx) => (
              <div key={bIdx} className="flex gap-1 items-center">
                <span className="text-slate-300 text-[10px]">•</span>
                <input
                  value={b}
                  onChange={(e) => {
                    const items = [...section.items];
                    const bullets = [...items[idx].bullets];
                    bullets[bIdx] = e.target.value;
                    items[idx] = { ...items[idx], bullets };
                    onUpdate({ items });
                  }}
                  className="flex-1 text-[10px] bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-300 outline-none py-0.5"
                  placeholder="Achievement or responsibility..."
                />
                <button
                  onClick={() => {
                    const items = [...section.items];
                    items[idx] = { ...items[idx], bullets: items[idx].bullets.filter((_, i) => i !== bIdx) };
                    onUpdate({ items });
                  }}
                  className="text-slate-200 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  const items = [...section.items];
                  items[idx] = { ...items[idx], bullets: [...items[idx].bullets, ''] };
                  onUpdate({ items });
                }}
                className="text-[9px] font-bold text-blue-600 hover:text-blue-800"
              >
                + Add point
              </button>
              {onAIEnhance && (
                <button
                  onClick={() => onAIEnhance(section.id, item.role, item.company, idx)}
                  disabled={aiLoading}
                  className="text-[9px] font-bold text-violet-600 hover:text-violet-800 flex items-center gap-1 disabled:opacity-50"
                >
                  {aiLoading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                  AI Generate
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={() => {
          const items = [...section.items, { id: `exp_${Date.now()}`, company: '', role: '', dates: '', location: '', bullets: [''] }];
          onUpdate({ items });
        }}
        className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-[10px] text-slate-400 font-bold hover:text-blue-500 hover:border-blue-300 transition-all"
      >
        + Add Experience
      </button>
    </div>
  );
}

function SkillsEditor({ section, onUpdate }) {
  return (
    <div className="space-y-3">
      {section.categories.map((cat, catIdx) => (
        <div key={cat.id} className="bg-white p-3 rounded-lg border border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <input
              value={cat.title}
              onChange={(e) => {
                const categories = [...section.categories];
                categories[catIdx] = { ...categories[catIdx], title: e.target.value };
                onUpdate({ categories });
              }}
              className="text-[10px] font-black uppercase text-slate-600 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-300 outline-none"
              placeholder="Category name"
            />
            <button
              onClick={() => {
                const categories = section.categories.filter((_, i) => i !== catIdx);
                onUpdate({ categories });
              }}
              className="text-slate-200 hover:text-red-400"
            >
              <Trash2 size={12} />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {cat.items.map((skill, sIdx) => (
              <div key={sIdx} className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1">
                <input
                  value={skill}
                  onChange={(e) => {
                    const categories = [...section.categories];
                    const items = [...categories[catIdx].items];
                    items[sIdx] = e.target.value;
                    categories[catIdx] = { ...categories[catIdx], items };
                    onUpdate({ categories });
                  }}
                  className="text-[10px] w-20 bg-transparent outline-none"
                  placeholder="Skill"
                />
                <button
                  onClick={() => {
                    const categories = [...section.categories];
                    categories[catIdx] = { ...categories[catIdx], items: categories[catIdx].items.filter((_, i) => i !== sIdx) };
                    onUpdate({ categories });
                  }}
                  className="text-slate-300 hover:text-red-400"
                >
                  <Trash2 size={9} />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const categories = [...section.categories];
                categories[catIdx] = { ...categories[catIdx], items: [...categories[catIdx].items, ''] };
                onUpdate({ categories });
              }}
              className="p-1.5 rounded-lg border border-dashed border-slate-200 hover:border-blue-300 text-slate-400 hover:text-blue-500"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={() => {
          const categories = [...section.categories, { id: `cat_${Date.now()}`, title: 'New Category', items: [''] }];
          onUpdate({ categories });
        }}
        className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-[10px] text-slate-400 font-bold hover:text-blue-500 hover:border-blue-300 transition-all"
      >
        + Add Category
      </button>
    </div>
  );
}

function ListEditor({ section, onUpdate }) {
  return (
    <div className="space-y-2">
      {section.items.map((item, idx) => (
        <div key={item.id} className="bg-white p-2.5 rounded-lg border border-slate-100 relative group/item">
          <div className="grid grid-cols-2 gap-2">
            <input
              value={item.title}
              onChange={(e) => {
                const items = [...section.items];
                items[idx] = { ...items[idx], title: e.target.value };
                onUpdate({ items });
              }}
              className="col-span-2 text-xs font-bold bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-300 outline-none"
              placeholder="Title"
            />
            <input
              value={item.subtitle || ''}
              onChange={(e) => {
                const items = [...section.items];
                items[idx] = { ...items[idx], subtitle: e.target.value };
                onUpdate({ items });
              }}
              className="text-[10px] border border-slate-100 p-1.5 rounded bg-slate-50 focus:bg-white outline-none"
              placeholder="Subtitle / Degree"
            />
            <input
              value={item.date || ''}
              onChange={(e) => {
                const items = [...section.items];
                items[idx] = { ...items[idx], date: e.target.value };
                onUpdate({ items });
              }}
              className="text-[10px] border border-slate-100 p-1.5 rounded bg-slate-50 focus:bg-white outline-none"
              placeholder="Date"
            />
            <input
              value={item.institution || ''}
              onChange={(e) => {
                const items = [...section.items];
                items[idx] = { ...items[idx], institution: e.target.value };
                onUpdate({ items });
              }}
              className="col-span-2 text-[10px] border border-slate-100 p-1.5 rounded bg-slate-50 focus:bg-white outline-none"
              placeholder="Institution (optional)"
            />
          </div>
          <button
            onClick={() => {
              const items = section.items.filter((_, i) => i !== idx);
              onUpdate({ items });
            }}
            className="absolute -top-1.5 -right-1.5 opacity-0 group-hover/item:opacity-100 bg-red-50 text-red-400 rounded-full p-0.5 border border-red-100 hover:bg-red-500 hover:text-white transition-all"
          >
            <Trash2 size={10} />
          </button>
        </div>
      ))}
      <button
        onClick={() => {
          const items = [...section.items, { id: `item_${Date.now()}`, title: '', subtitle: '', date: '', institution: '' }];
          onUpdate({ items });
        }}
        className="text-[10px] font-bold text-blue-600 hover:text-blue-800"
      >
        + Add Item
      </button>
    </div>
  );
}

function ProjectsEditor({ section, onUpdate }) {
  return (
    <div className="space-y-3">
      {section.items.map((item, idx) => (
        <div key={item.id} className="bg-white p-3 rounded-lg border border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <input
              value={item.name}
              onChange={(e) => {
                const items = [...section.items];
                items[idx] = { ...items[idx], name: e.target.value };
                onUpdate({ items });
              }}
              className="text-xs font-bold bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-300 outline-none flex-1"
              placeholder="Project name"
            />
            <button
              onClick={() => onUpdate({ items: section.items.filter((_, i) => i !== idx) })}
              className="text-slate-200 hover:text-red-400"
            >
              <Trash2 size={12} />
            </button>
          </div>
          <textarea
            value={item.description}
            onChange={(e) => {
              const items = [...section.items];
              items[idx] = { ...items[idx], description: e.target.value };
              onUpdate({ items });
            }}
            className="w-full text-[10px] border border-slate-100 p-2 rounded-lg bg-slate-50 resize-none h-16 focus:bg-white outline-none"
            placeholder="Brief description..."
          />
          <input
            value={item.tech || ''}
            onChange={(e) => {
              const items = [...section.items];
              items[idx] = { ...items[idx], tech: e.target.value };
              onUpdate({ items });
            }}
            className="w-full mt-1 text-[9px] border border-slate-100 p-1.5 rounded bg-slate-50 focus:bg-white outline-none"
            placeholder="Technologies: React, Node.js, ..."
          />
        </div>
      ))}
      <button
        onClick={() => {
          const items = [...section.items, { id: `proj_${Date.now()}`, name: '', description: '', tech: '', link: '' }];
          onUpdate({ items });
        }}
        className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-[10px] text-slate-400 font-bold hover:text-blue-500 hover:border-blue-300 transition-all"
      >
        + Add Project
      </button>
    </div>
  );
}

function LanguagesEditor({ section, onUpdate }) {
  const levels = ['Native', 'Fluent', 'Professional', 'Intermediate', 'Basic'];
  return (
    <div className="space-y-2">
      {section.items.map((item, idx) => (
        <div key={item.id} className="flex gap-2 items-center">
          <input
            value={item.language}
            onChange={(e) => {
              const items = [...section.items];
              items[idx] = { ...items[idx], language: e.target.value };
              onUpdate({ items });
            }}
            className="flex-1 text-[10px] border border-slate-100 p-1.5 rounded bg-slate-50 focus:bg-white outline-none"
            placeholder="Language"
          />
          <select
            value={item.level}
            onChange={(e) => {
              const items = [...section.items];
              items[idx] = { ...items[idx], level: e.target.value };
              onUpdate({ items });
            }}
            className="text-[10px] border border-slate-100 p-1.5 rounded bg-slate-50"
          >
            {levels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <button
            onClick={() => onUpdate({ items: section.items.filter((_, i) => i !== idx) })}
            className="text-slate-200 hover:text-red-400"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <button
        onClick={() => {
          const items = [...section.items, { id: `lang_${Date.now()}`, language: '', level: 'Professional' }];
          onUpdate({ items });
        }}
        className="text-[10px] font-bold text-blue-600 hover:text-blue-800"
      >
        + Add Language
      </button>
    </div>
  );
}

export default function Editor({ cvData, updatePersonalInfo, updateSection, addSection, removeSection, reorderSections, onAIEnhance, aiLoading }) {
  const [collapsed, setCollapsed] = useState({});
  const [showAddMenu, setShowAddMenu] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = cvData.sections.findIndex(s => s.id === active.id);
      const newIndex = cvData.sections.findIndex(s => s.id === over.id);
      reorderSections(arrayMove(cvData.sections, oldIndex, newIndex));
    }
  };

  const toggleCollapse = (id) => setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-6">
      {/* Personal Info */}
      <section>
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="w-5 h-[2px] bg-blue-500 rounded-full" /> Personal Info
        </h2>
        <div className="space-y-2">
          <input
            value={cvData.personalInfo.fullName}
            onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
            placeholder="Full Name"
            className="w-full p-2.5 border border-slate-100 rounded-lg text-sm font-bold bg-slate-50 focus:bg-white focus:border-blue-300 outline-none transition-all"
          />
          <input
            value={cvData.personalInfo.title || ''}
            onChange={(e) => updatePersonalInfo('title', e.target.value)}
            placeholder="Professional Title (e.g. Software Engineer)"
            className="w-full p-2.5 border border-slate-100 rounded-lg text-xs bg-slate-50 focus:bg-white focus:border-blue-300 outline-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={cvData.personalInfo.email}
              onChange={(e) => updatePersonalInfo('email', e.target.value)}
              placeholder="Email"
              className="p-2 border border-slate-100 rounded-lg text-[11px] bg-slate-50 focus:bg-white focus:border-blue-300 outline-none"
            />
            <input
              value={cvData.personalInfo.phone}
              onChange={(e) => updatePersonalInfo('phone', e.target.value)}
              placeholder="Phone"
              className="p-2 border border-slate-100 rounded-lg text-[11px] bg-slate-50 focus:bg-white focus:border-blue-300 outline-none"
            />
            <input
              value={cvData.personalInfo.location}
              onChange={(e) => updatePersonalInfo('location', e.target.value)}
              placeholder="Location"
              className="p-2 border border-slate-100 rounded-lg text-[11px] bg-slate-50 focus:bg-white focus:border-blue-300 outline-none"
            />
            <input
              value={cvData.personalInfo.website || ''}
              onChange={(e) => updatePersonalInfo('website', e.target.value)}
              placeholder="Website / Portfolio"
              className="p-2 border border-slate-100 rounded-lg text-[11px] bg-slate-50 focus:bg-white focus:border-blue-300 outline-none"
            />
            <input
              value={cvData.personalInfo.linkedin || ''}
              onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
              placeholder="LinkedIn URL"
              className="col-span-2 p-2 border border-slate-100 rounded-lg text-[11px] bg-slate-50 focus:bg-white focus:border-blue-300 outline-none"
            />
          </div>
        </div>
      </section>

      {/* Sections with DnD */}
      <section>
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="w-5 h-[2px] bg-blue-500 rounded-full" /> Sections
        </h2>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={cvData.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {cvData.sections.map((sec) => {
                const Icon = SECTION_ICONS[sec.type] || FileText;
                const isCollapsed = collapsed[sec.id];

                return (
                  <SortableSection key={sec.id} section={sec}>
                    <div className="flex-1 border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm">
                      {/* Section Header */}
                      <div
                        className="flex items-center justify-between px-3 py-2.5 bg-slate-50/80 cursor-pointer hover:bg-slate-100/80 transition-colors"
                        onClick={() => toggleCollapse(sec.id)}
                      >
                        <div className="flex items-center gap-2">
                          <Icon size={13} className="text-slate-400" />
                          <input
                            value={sec.title}
                            onChange={(e) => updateSection(sec.id, { title: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] font-bold uppercase tracking-wide text-slate-700 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-300 outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <select
                            value={sec.column}
                            onChange={(e) => { e.stopPropagation(); updateSection(sec.id, { column: e.target.value }); }}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[8px] font-bold border border-slate-200 rounded px-1.5 py-0.5 bg-white"
                          >
                            <option value="left">LEFT</option>
                            <option value="right">RIGHT</option>
                          </select>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeSection(sec.id); }}
                            className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                          {isCollapsed ? <ChevronRight size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                        </div>
                      </div>

                      {/* Section Body */}
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="p-3">
                              {sec.type === 'text' && (
                                <div>
                                  <textarea
                                    value={sec.content}
                                    onChange={(e) => updateSection(sec.id, { content: e.target.value })}
                                    className="w-full p-2.5 text-[11px] border border-slate-100 rounded-lg bg-slate-50 h-24 resize-none focus:bg-white focus:border-blue-300 outline-none"
                                    placeholder="Write your professional summary..."
                                  />
                                  {onAIEnhance && (
                                    <button
                                      onClick={() => onAIEnhance(sec.id, sec.content, 'summary')}
                                      disabled={aiLoading}
                                      className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-violet-600 hover:text-violet-800 disabled:opacity-50"
                                    >
                                      {aiLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                                      AI Improve
                                    </button>
                                  )}
                                </div>
                              )}
                              {sec.type === 'experience' && (
                                <ExperienceEditor section={sec} onUpdate={(u) => updateSection(sec.id, u)} onAIEnhance={onAIEnhance} aiLoading={aiLoading} />
                              )}
                              {sec.type === 'skills' && (
                                <SkillsEditor section={sec} onUpdate={(u) => updateSection(sec.id, u)} />
                              )}
                              {sec.type === 'list' && (
                                <ListEditor section={sec} onUpdate={(u) => updateSection(sec.id, u)} />
                              )}
                              {sec.type === 'projects' && (
                                <ProjectsEditor section={sec} onUpdate={(u) => updateSection(sec.id, u)} />
                              )}
                              {sec.type === 'languages' && (
                                <LanguagesEditor section={sec} onUpdate={(u) => updateSection(sec.id, u)} />
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </SortableSection>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        {/* Add Section */}
        <div className="mt-4 relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-[11px] font-bold text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={14} /> Add Section
          </button>
          <AnimatePresence>
            {showAddMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl border shadow-xl p-2 z-20 grid grid-cols-2 gap-1"
              >
                {SECTION_TYPES.map(({ type, label, icon }) => {
                  const Icon = SECTION_ICONS[type] || FileText;
                  return (
                    <button
                      key={type}
                      onClick={() => { addSection(type); setShowAddMenu(false); }}
                      className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-blue-50 transition-colors text-left"
                    >
                      <Icon size={14} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-600">{label}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
