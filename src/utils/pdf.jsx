import React from 'react';
import { Document, Page, View, Text, StyleSheet, Svg, Path, Circle, Rect, Polyline, Font } from '@react-pdf/renderer';
import LatoRegular from '../fonts/lato-400-normal.ttf';
import LatoItalic from '../fonts/lato-400-italic.ttf';
import LatoBold from '../fonts/lato-700-normal.ttf';
import LatoBlack from '../fonts/lato-900-normal.ttf';

Font.register({
  family: 'Lato',
  fonts: [
    { src: LatoRegular, fontWeight: 400 },
    { src: LatoItalic, fontWeight: 400, fontStyle: 'italic' },
    { src: LatoBold, fontWeight: 700 },
    { src: LatoBlack, fontWeight: 900 },
  ],
});

const FONT_SCALE = { small: 0.92, medium: 1, large: 1.08 };
const LINE_COLOR = '#e2e8f0';
const MARKER_COLOR = '#cbd5e1';
const PANEL_COLOR = '#111827';
const PANEL_LINE_COLOR = '#64748b';

function getContentWeight(cvData) {
  return cvData.sections.reduce((total, section) => {
    if (section.type === 'text') return total + Math.ceil((section.content?.length || 0) / 80);
    if (section.type === 'experience') {
      return total + (section.items || []).reduce((sum, item) => {
        const bulletText = (item.bullets || []).filter(Boolean).join(' ');
        return sum + 5 + Math.ceil(bulletText.length / 95);
      }, 0);
    }
    if (section.type === 'skills') return total + (section.categories || []).reduce((sum, cat) => sum + 2 + (cat.items || []).filter(Boolean).length, 0);
    if (section.type === 'projects') return total + (section.items || []).length * 5;
    if (section.type === 'list') return total + (section.items || []).length * 3;
    if (section.type === 'languages') return total + (section.items || []).length;
    return total + 2;
  }, 0);
}

function getPdfScale(theme, cvData) {
  const baseScale = FONT_SCALE[theme.fontSize] || 1;
  const weight = getContentWeight(cvData);
  const densityScale = weight > 120 ? 0.94 : weight > 92 ? 0.97 : 1;
  return baseScale * densityScale;
}

function getPadding(theme, compact, normal, relaxed) {
  if (theme.spacing === 'compact') return compact;
  if (theme.spacing === 'relaxed') return relaxed;
  return normal;
}

function createStyles(theme, cvData) {
  const padding = getPadding(theme, '8mm', '11mm', '14mm');
  const scale = getPdfScale(theme, cvData);
  const fs = (size) => size * scale;

  return StyleSheet.create({
    page: { fontFamily: 'Lato', padding, backgroundColor: '#ffffff', flexDirection: 'column' },
    header: { borderBottomWidth: 2, borderBottomColor: LINE_COLOR, paddingBottom: 10, marginBottom: 13, alignItems: theme.headerStyle === 'centered' ? 'center' : 'flex-start' },
    name: { fontSize: fs(24), fontWeight: 900, letterSpacing: 0.2, marginBottom: 4, color: theme.accentColor },
    title: { fontSize: fs(9.5), fontWeight: 700, color: theme.secondaryColor, marginBottom: 6 },
    contactRow: { flexDirection: 'row', flexWrap: 'wrap', color: '#64748b', fontSize: fs(8.5) },
    contactItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12, marginBottom: 2 },
    contactIcon: { marginRight: 3 },
    columns: { flexDirection: 'row', flexGrow: 1 },
    leftCol: { width: '67%', paddingRight: 14 },
    rightCol: { width: '33%', borderLeftWidth: 1, borderLeftColor: LINE_COLOR, paddingLeft: 12 },
    section: { marginBottom: 13 },
    sectionTitle: { fontSize: fs(9.5), fontWeight: 900, color: theme.accentColor, borderBottomWidth: 1, borderBottomColor: LINE_COLOR, paddingBottom: 3, marginBottom: 8, letterSpacing: 0.6 },
    rightSectionTitle: { fontSize: fs(8.8), fontWeight: 900, color: theme.accentColor, borderBottomWidth: 1, borderBottomColor: LINE_COLOR, paddingBottom: 3, marginBottom: 8, letterSpacing: 0.7 },
    expItem: { paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: LINE_COLOR, marginBottom: 10 },
    expRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 },
    expCompany: { fontSize: fs(10), fontWeight: 700, color: theme.accentColor },
    expDates: { fontSize: fs(7), fontWeight: 700, color: '#94a3b8', letterSpacing: 0.5 },
    expRole: { fontSize: fs(8.5), fontWeight: 700, color: theme.secondaryColor, marginBottom: 4 },
    bullet: { flexDirection: 'row', marginBottom: 3, paddingLeft: 2 },
    bulletDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: MARKER_COLOR, marginTop: 3.5, marginRight: 5 },
    bulletText: { fontSize: fs(8), color: '#475569', flex: 1, lineHeight: 1.45 },
    summaryText: { fontSize: fs(8.2), color: '#475569', fontStyle: 'italic', lineHeight: 1.7 },
    skillCategory: { marginBottom: 8 },
    skillCatTitle: { fontSize: fs(7), fontWeight: 900, color: theme.secondaryColor, letterSpacing: 0.8, marginBottom: 3 },
    skillRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
    skillDot: { width: 2.5, height: 2.5, borderRadius: 2, backgroundColor: MARKER_COLOR, marginRight: 4 },
    skillText: { fontSize: fs(8), color: '#334155', fontWeight: 400 },
    listItem: { marginBottom: 8 },
    listTitle: { fontSize: fs(8.5), fontWeight: 700, color: theme.accentColor },
    listSubtitle: { fontSize: fs(7.5), color: theme.secondaryColor, fontWeight: 700, marginTop: 1 },
    listDate: { fontSize: fs(7), color: '#94a3b8', fontWeight: 700 },
    listInstitution: { fontSize: fs(7), color: '#64748b', fontStyle: 'italic' },
    projectName: { fontSize: fs(9), fontWeight: 700, color: theme.accentColor },
    projectDesc: { fontSize: fs(7.5), color: '#475569', marginTop: 2, lineHeight: 1.5 },
    projectTech: { fontSize: fs(7), fontWeight: 700, color: theme.secondaryColor, marginTop: 2 },
    langRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
    langName: { fontSize: fs(8.5), fontWeight: 700, color: '#334155' },
    langLevel: { fontSize: fs(7.5), color: '#94a3b8' },
  });
}

function createModernStyles(theme, cvData) {
  const padding = getPadding(theme, '8mm', '10mm', '13mm');
  const scale = getPdfScale(theme, cvData);
  const fs = (size) => size * scale;

  return StyleSheet.create({
    page: { fontFamily: 'Lato', flexDirection: 'row', backgroundColor: '#ffffff' },
    sidebar: { width: theme.headerStyle === 'bold-banner' ? '78mm' : '68mm', minHeight: '100%', backgroundColor: PANEL_COLOR, padding: 15, color: '#ffffff' },
    sidebarName: { fontSize: fs(18), fontWeight: 900, color: '#ffffff', marginBottom: 3, letterSpacing: 0.5 },
    sidebarTitle: { fontSize: fs(9), fontWeight: 400, color: '#ffffffcc', marginBottom: 12 },
    sidebarContact: { fontSize: fs(8), color: '#ffffffe6', marginBottom: 4 },
    sidebarSection: { marginTop: 12, marginBottom: 6 },
    sidebarSectionTitle: { fontSize: fs(8.5), fontWeight: 900, color: '#ffffff', borderBottomWidth: 1, borderBottomColor: PANEL_LINE_COLOR, paddingBottom: 3, marginBottom: 6, letterSpacing: 0.8 },
    sidebarSkillCat: { fontSize: fs(7), fontWeight: 700, color: '#ffffffb3', marginBottom: 2 },
    sidebarSkill: { fontSize: fs(8), color: '#ffffffe6', marginBottom: 2, paddingLeft: 4 },
    sidebarListTitle: { fontSize: fs(8.5), fontWeight: 700, color: '#ffffff', marginBottom: 1 },
    sidebarListSub: { fontSize: fs(7.5), color: '#ffffffb3', marginBottom: 1 },
    sidebarListDate: { fontSize: fs(6.5), color: '#ffffff80' },
    sidebarLangRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
    sidebarLangName: { fontSize: fs(8), fontWeight: 700, color: '#ffffff' },
    sidebarLangLevel: { fontSize: fs(7.5), color: '#ffffff99' },
    main: { flex: 1, padding },
    section: { marginBottom: 13 },
    sectionTitle: { fontSize: fs(9.5), fontWeight: 900, color: theme.accentColor, borderBottomWidth: 1, borderBottomColor: LINE_COLOR, paddingBottom: 3, marginBottom: 8, letterSpacing: 0.7 },
    expItem: { paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: LINE_COLOR, marginBottom: 11 },
    expRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 },
    expCompany: { fontSize: fs(10), fontWeight: 700, color: theme.accentColor },
    expDates: { fontSize: fs(7), fontWeight: 700, color: '#94a3b8', letterSpacing: 0.5 },
    expRole: { fontSize: fs(8.5), fontWeight: 700, color: theme.secondaryColor, marginBottom: 4 },
    bullet: { flexDirection: 'row', marginBottom: 3, paddingLeft: 2 },
    bulletDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: MARKER_COLOR, marginTop: 3.5, marginRight: 5 },
    bulletText: { fontSize: fs(8), color: '#475569', flex: 1, lineHeight: 1.45 },
    summaryText: { fontSize: fs(8.2), color: '#475569', fontStyle: 'italic', lineHeight: 1.7 },
    projectName: { fontSize: fs(9), fontWeight: 700, color: theme.accentColor },
    projectDesc: { fontSize: fs(7.5), color: '#475569', marginTop: 2, lineHeight: 1.5 },
    projectTech: { fontSize: fs(7), fontWeight: 700, color: theme.secondaryColor, marginTop: 2 },
    listItem: { marginBottom: 7 },
    listTitle: { fontSize: fs(8.5), fontWeight: 700, color: theme.accentColor },
    listSubtitle: { fontSize: fs(7.5), color: theme.secondaryColor, fontWeight: 700, marginTop: 1 },
    listDate: { fontSize: fs(7), color: '#94a3b8', fontWeight: 700 },
    listInstitution: { fontSize: fs(7), color: '#64748b', fontStyle: 'italic' },
    skillCategory: { marginBottom: 7 },
    skillCatTitle: { fontSize: fs(7), fontWeight: 900, color: theme.secondaryColor, letterSpacing: 0.8, marginBottom: 3 },
    skillRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
    skillDot: { width: 2.5, height: 2.5, borderRadius: 2, backgroundColor: MARKER_COLOR, marginRight: 4 },
    skillText: { fontSize: fs(8), color: '#334155', fontWeight: 400 },
    langRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
    langName: { fontSize: fs(8.5), fontWeight: 700, color: '#334155' },
    langLevel: { fontSize: fs(7.5), color: '#94a3b8' },
  });
}

function createMinimalStyles(theme, cvData) {
  const padding = getPadding(theme, '10mm', '13mm', '16mm');
  const scale = getPdfScale(theme, cvData);
  const fs = (size) => size * scale;
  const isBanner = theme.headerStyle === 'bold-banner';

  return StyleSheet.create({
    page: { fontFamily: 'Lato', padding, backgroundColor: '#ffffff', flexDirection: 'column' },
    header: { marginBottom: 16, alignItems: theme.headerStyle === 'centered' ? 'center' : 'flex-start', ...(isBanner ? { backgroundColor: theme.accentColor, padding: 13, borderRadius: 6, marginLeft: -8, marginRight: -8 } : {}) },
    name: { fontSize: fs(28), fontWeight: 900, letterSpacing: -0.5, color: isBanner ? '#ffffff' : theme.accentColor, marginBottom: 2 },
    title: { fontSize: fs(11), fontWeight: 400, color: isBanner ? '#ffffffcc' : '#64748b', marginBottom: 8 },
    contactRow: { flexDirection: 'row', flexWrap: 'wrap', fontSize: fs(8.5), color: isBanner ? '#ffffffb3' : '#94a3b8' },
    contactItem: { marginRight: 12, marginBottom: 2 },
    section: { marginBottom: 14 },
    sectionTitle: { fontSize: fs(9.5), fontWeight: 900, color: theme.accentColor, borderBottomWidth: 1, borderBottomColor: LINE_COLOR, paddingBottom: 3, marginBottom: 8, letterSpacing: 0.8 },
    expItem: { marginBottom: 11 },
    expRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 },
    expCompany: { fontSize: fs(10.5), fontWeight: 700, color: '#1e293b' },
    expDates: { fontSize: fs(7.5), color: '#94a3b8' },
    expRole: { fontSize: fs(9), fontWeight: 400, color: theme.secondaryColor, marginBottom: 4 },
    bullet: { flexDirection: 'row', marginBottom: 3, paddingLeft: 10 },
    bulletDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: MARKER_COLOR, marginTop: 3.5, marginRight: 5 },
    bulletText: { fontSize: fs(8), color: '#475569', flex: 1, lineHeight: 1.45 },
    summaryText: { fontSize: fs(9), color: '#475569', lineHeight: 1.7 },
    skillCategory: { marginBottom: 5 },
    skillCatTitle: { fontSize: fs(7.5), fontWeight: 700, color: '#94a3b8' },
    skillText: { fontSize: fs(8.5), color: '#334155' },
    listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
    listTitle: { fontSize: fs(9.5), fontWeight: 700, color: '#1e293b' },
    listSubtitle: { fontSize: fs(8), color: theme.secondaryColor, marginTop: 1 },
    listDate: { fontSize: fs(7.5), color: '#94a3b8' },
    listInstitution: { fontSize: fs(7.5), color: '#94a3b8', fontStyle: 'italic' },
    projectName: { fontSize: fs(9.5), fontWeight: 700, color: '#1e293b' },
    projectDesc: { fontSize: fs(8), color: '#475569', marginTop: 2, lineHeight: 1.5 },
    projectTech: { fontSize: fs(7.5), fontWeight: 700, color: theme.secondaryColor, marginTop: 2 },
    langRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
    langName: { fontSize: fs(8.5), fontWeight: 700, color: '#334155' },
    langLevel: { fontSize: fs(7.5), color: '#94a3b8' },
  });
}

const PdfMail = () => (
  <Svg width="8" height="8" viewBox="0 0 24 24">
    <Rect x="2" y="4" width="20" height="16" rx="2" stroke="#64748b" strokeWidth="2" fill="none" />
    <Polyline points="22,7 12,14 2,7" stroke="#64748b" strokeWidth="2" fill="none" />
  </Svg>
);
const PdfPhone = () => (
  <Svg width="8" height="8" viewBox="0 0 24 24">
    <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="#64748b" strokeWidth="2" fill="none" />
  </Svg>
);
const PdfPin = () => (
  <Svg width="8" height="8" viewBox="0 0 24 24">
    <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" stroke="#64748b" strokeWidth="2" fill="none" />
    <Circle cx="12" cy="10" r="3" stroke="#64748b" strokeWidth="2" fill="none" />
  </Svg>
);

function renderPdfSection(section, styles, isRight = false) {
  const titleStyle = isRight ? styles.rightSectionTitle : styles.sectionTitle;

  return (
    <View key={section.id} style={styles.section}>
      <Text style={titleStyle} minPresenceAhead={36}>{section.title}</Text>

      {section.type === 'text' && (
        <Text style={styles.summaryText}>{section.content}</Text>
      )}

      {section.type === 'experience' && section.items?.map(exp => (
        <View key={exp.id} style={styles.expItem}>
          <View wrap={false}>
            <View style={styles.expRow}>
              <Text style={styles.expCompany}>{exp.company}</Text>
              <Text style={styles.expDates}>{exp.dates}</Text>
            </View>
            <Text style={styles.expRole}>{exp.role}</Text>
          </View>
          {exp.bullets?.filter(Boolean).map((b, bi) => (
            <View key={bi} style={styles.bullet}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{b}</Text>
            </View>
          ))}
        </View>
      ))}

      {section.type === 'skills' && section.categories?.map(cat => (
        <View key={cat.id} style={styles.skillCategory}>
          <Text style={styles.skillCatTitle}>{cat.title}</Text>
          {cat.items?.filter(Boolean).map((skill, si) => (
            <View key={si} style={styles.skillRow}>
              <View style={styles.skillDot} />
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      ))}

      {section.type === 'list' && section.items?.map(item => (
        <View key={item.id} style={styles.listItem}>
          <Text style={styles.listTitle}>{item.title}</Text>
          {item.subtitle ? <Text style={styles.listSubtitle}>{item.subtitle}</Text> : null}
          {item.date ? <Text style={styles.listDate}>{item.date}</Text> : null}
          {item.institution ? <Text style={styles.listInstitution}>{item.institution}</Text> : null}
        </View>
      ))}

      {section.type === 'projects' && section.items?.map(item => (
        <View key={item.id} style={styles.listItem || { marginBottom: 10 }}>
          <Text style={styles.projectName}>{item.name}</Text>
          {item.description ? <Text style={styles.projectDesc}>{item.description}</Text> : null}
          {item.tech ? <Text style={styles.projectTech}>{item.tech}</Text> : null}
        </View>
      ))}

      {section.type === 'languages' && section.items?.map(item => (
        <View key={item.id} style={styles.langRow}>
          <Text style={styles.langName}>{item.language}</Text>
          <Text style={styles.langLevel}>{item.level}</Text>
        </View>
      ))}
    </View>
  );
}

/* ===== CLASSIC TEMPLATE (two-column) ===== */
function ClassicDocument({ cvData, theme }) {
  const styles = createStyles(theme, cvData);
  const left = cvData.sections.filter(s => s.column === 'left');
  const right = cvData.sections.filter(s => s.column === 'right');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{cvData.personalInfo.fullName}</Text>
          {cvData.personalInfo.title && <Text style={styles.title}>{cvData.personalInfo.title}</Text>}
          <View style={styles.contactRow}>
            {cvData.personalInfo.email && (
              <View style={styles.contactItem}>
                <View style={styles.contactIcon}><PdfMail /></View><Text>{cvData.personalInfo.email}</Text>
              </View>
            )}
            {cvData.personalInfo.phone && (
              <View style={styles.contactItem}>
                <View style={styles.contactIcon}><PdfPhone /></View><Text>{cvData.personalInfo.phone}</Text>
              </View>
            )}
            {cvData.personalInfo.location && (
              <View style={styles.contactItem}>
                <View style={styles.contactIcon}><PdfPin /></View><Text>{cvData.personalInfo.location}</Text>
              </View>
            )}
            {cvData.personalInfo.website && (
              <View style={styles.contactItem}>
                <Text>{cvData.personalInfo.website}</Text>
              </View>
            )}
            {cvData.personalInfo.linkedin && (
              <View style={styles.contactItem}>
                <Text>{cvData.personalInfo.linkedin}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.columns}>
          <View style={styles.leftCol}>{left.map(s => renderPdfSection(s, styles, false))}</View>
          <View style={styles.rightCol}>{right.map(s => renderPdfSection(s, styles, true))}</View>
        </View>
      </Page>
    </Document>
  );
}

/* ===== MODERN TEMPLATE (sidebar) ===== */
function ModernDocument({ cvData, theme }) {
  const styles = createModernStyles(theme, cvData);
  const left = cvData.sections.filter(s => s.column === 'left');
  const right = cvData.sections.filter(s => s.column === 'right');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <Text style={styles.sidebarName}>{cvData.personalInfo.fullName}</Text>
          {cvData.personalInfo.title && <Text style={styles.sidebarTitle}>{cvData.personalInfo.title}</Text>}
          {cvData.personalInfo.email && <Text style={styles.sidebarContact}>{cvData.personalInfo.email}</Text>}
          {cvData.personalInfo.phone && <Text style={styles.sidebarContact}>{cvData.personalInfo.phone}</Text>}
          {cvData.personalInfo.location && <Text style={styles.sidebarContact}>{cvData.personalInfo.location}</Text>}
          {cvData.personalInfo.website && <Text style={styles.sidebarContact}>{cvData.personalInfo.website}</Text>}
          {cvData.personalInfo.linkedin && <Text style={styles.sidebarContact}>{cvData.personalInfo.linkedin}</Text>}

          {right.map(section => (
            <View key={section.id} style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionTitle}>{section.title}</Text>
              {section.type === 'skills' && section.categories?.map((cat, ci) => (
                <View key={ci} style={{ marginBottom: 6 }}>
                  <Text style={styles.sidebarSkillCat}>{cat.title}</Text>
                  {cat.items?.filter(Boolean).map((skill, si) => (
                    <Text key={si} style={styles.sidebarSkill}>• {skill}</Text>
                  ))}
                </View>
              ))}
              {section.type === 'list' && section.items?.map((item, i) => (
                <View key={i} style={{ marginBottom: 6 }}>
                  <Text style={styles.sidebarListTitle}>{item.title}</Text>
                  {item.subtitle && <Text style={styles.sidebarListSub}>{item.subtitle}</Text>}
                  {item.date && <Text style={styles.sidebarListDate}>{item.date}</Text>}
                </View>
              ))}
              {section.type === 'languages' && section.items?.map((item, i) => (
                <View key={i} style={styles.sidebarLangRow}>
                  <Text style={styles.sidebarLangName}>{item.language}</Text>
                  <Text style={styles.sidebarLangLevel}>{item.level}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          {left.map(s => renderPdfSection(s, styles, false))}
        </View>
      </Page>
    </Document>
  );
}

/* ===== MINIMAL TEMPLATE (single column) ===== */
function MinimalDocument({ cvData, theme }) {
  const styles = createMinimalStyles(theme, cvData);
  const allSections = cvData.sections;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{cvData.personalInfo.fullName}</Text>
          {cvData.personalInfo.title && <Text style={styles.title}>{cvData.personalInfo.title}</Text>}
          <View style={styles.contactRow}>
            {cvData.personalInfo.email && <Text style={styles.contactItem}>{cvData.personalInfo.email}</Text>}
            {cvData.personalInfo.phone && <Text style={styles.contactItem}>{cvData.personalInfo.phone}</Text>}
            {cvData.personalInfo.location && <Text style={styles.contactItem}>{cvData.personalInfo.location}</Text>}
            {cvData.personalInfo.website && <Text style={styles.contactItem}>{cvData.personalInfo.website}</Text>}
            {cvData.personalInfo.linkedin && <Text style={styles.contactItem}>{cvData.personalInfo.linkedin}</Text>}
          </View>
        </View>

        {allSections.map(section => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle} minPresenceAhead={36}>{section.title}</Text>

            {section.type === 'text' && (
              <Text style={styles.summaryText}>{section.content}</Text>
            )}

            {section.type === 'experience' && section.items?.map((exp, i) => (
              <View key={i} style={styles.expItem}>
                <View wrap={false}>
                  <View style={styles.expRow}>
                    <Text style={styles.expCompany}>{exp.company}</Text>
                    <Text style={styles.expDates}>{exp.dates}</Text>
                  </View>
                  <Text style={styles.expRole}>{exp.role}</Text>
                </View>
                {exp.bullets?.filter(Boolean).map((b, bi) => (
                  <View key={bi} style={styles.bullet}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}

            {section.type === 'skills' && section.categories?.map((cat, ci) => (
              <View key={ci} style={styles.skillCategory}>
                <Text style={styles.skillCatTitle}>{cat.title}: </Text>
                <Text style={styles.skillText}>{cat.items?.filter(Boolean).join(' · ')}</Text>
              </View>
            ))}

            {section.type === 'list' && section.items?.map((item, i) => (
              <View key={i} style={styles.listItem}>
                <View>
                  <Text style={styles.listTitle}>{item.title}</Text>
                  {item.subtitle && <Text style={styles.listSubtitle}>{item.subtitle}</Text>}
                  {item.institution && <Text style={styles.listInstitution}>{item.institution}</Text>}
                </View>
                {item.date && <Text style={styles.listDate}>{item.date}</Text>}
              </View>
            ))}

            {section.type === 'projects' && section.items?.map((item, i) => (
              <View key={i} style={{ marginBottom: 10 }}>
                <Text style={styles.projectName}>{item.name}</Text>
                {item.description && <Text style={styles.projectDesc}>{item.description}</Text>}
                {item.tech && <Text style={styles.projectTech}>{item.tech}</Text>}
              </View>
            ))}

            {section.type === 'languages' && section.items?.map((item, i) => (
              <View key={i} style={styles.langRow}>
                <Text style={styles.langName}>{item.language}</Text>
                <Text style={styles.langLevel}>{item.level}</Text>
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}

export function PdfDocument({ cvData, theme }) {
  switch (theme.template) {
    case 'modern':
      return <ModernDocument cvData={cvData} theme={theme} />;
    case 'minimal':
      return <MinimalDocument cvData={cvData} theme={theme} />;
    default:
      return <ClassicDocument cvData={cvData} theme={theme} />;
  }
}
