export const TEMPLATES = {
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional two-column layout',
    preview: '📄',
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Bold sidebar with accent colors',
    preview: '🎨',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean single-column design',
    preview: '✨',
  },
};

export const FONT_OPTIONS = [
  { id: 'inter', name: 'Inter', family: 'Inter, sans-serif' },
  { id: 'lato', name: 'Lato', family: 'Lato, sans-serif' },
  { id: 'georgia', name: 'Georgia', family: 'Georgia, serif' },
  { id: 'merriweather', name: 'Merriweather', family: 'Merriweather, serif' },
  { id: 'mono', name: 'JetBrains Mono', family: 'JetBrains Mono, monospace' },
];

export const COLOR_PRESETS = [
  { name: 'Slate', accent: '#0f172a', secondary: '#1d4ed8' },
  { name: 'Ocean', accent: '#0c4a6e', secondary: '#0891b2' },
  { name: 'Forest', accent: '#14532d', secondary: '#16a34a' },
  { name: 'Wine', accent: '#4c0519', secondary: '#be123c' },
  { name: 'Purple', accent: '#3b0764', secondary: '#7c3aed' },
  { name: 'Amber', accent: '#451a03', secondary: '#d97706' },
];

export const DEFAULT_THEME = {
  template: 'classic',
  accentColor: '#0f172a',
  secondaryColor: '#1d4ed8',
  fontFamily: 'Inter, sans-serif',
  fontSize: 'medium',
  spacing: 'normal',
  headerStyle: 'centered',
};

export const DEFAULT_CV_DATA = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    title: '',
    website: '',
    linkedin: '',
  },
  sections: [],
};

export const SECTION_TYPES = [
  { type: 'text', label: 'Summary', icon: 'FileText' },
  { type: 'experience', label: 'Experience', icon: 'Briefcase' },
  { type: 'skills', label: 'Skills', icon: 'Zap' },
  { type: 'list', label: 'Education / List', icon: 'GraduationCap' },
  { type: 'projects', label: 'Projects', icon: 'FolderGit2' },
  { type: 'languages', label: 'Languages', icon: 'Globe' },
];
