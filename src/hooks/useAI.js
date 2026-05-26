import { useState, useCallback } from 'react';
import { chatWithAI, enhanceText, generateBullets, generateSummary, suggestSkills, generateFromJobDescription, generateCvUpdate } from '../utils/ai';

const emptyPersonalInfo = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  title: '',
  website: '',
  linkedin: '',
};

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function findJsonObject(text) {
  if (!text) return null;

  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch) {
    try {
      return JSON.parse(fencedMatch[1].trim());
    } catch {
      // Continue with balanced-brace extraction below.
    }
  }

  const start = text.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    if (depth === 0) {
      try {
        return JSON.parse(text.slice(start, index + 1));
      } catch {
        return null;
      }
    }
  }

  return null;
}

function stripUpdateBlocks(text) {
  return text
    .replace(/\[CV_UPDATE\][\s\S]*?\[\/CV_UPDATE\]/gi, '')
    .replace(/\[CV_UPDATE\][\s\S]*/gi, '')
    .replace(/```(?:json)?\s*[\s\S]*?```/gi, '')
    .trim();
}

function normalizeHeading(line) {
  return line.toUpperCase().replace(/[^A-Z]/g, '');
}

function getSectionType(line) {
  const heading = normalizeHeading(line);
  if (['PROFILE', 'SUMMARY', 'PROFESSIONALSUMMARY', 'ABOUT'].includes(heading)) return 'summary';
  if (['EXPERIENCE', 'WORKEXPERIENCE', 'PROFESSIONALEXPERIENCE', 'EMPLOYMENT'].includes(heading)) return 'experience';
  if (['SKILLS', 'TECHNICALSKILLS', 'CORECOMPETENCIES'].includes(heading)) return 'skills';
  if (['CERTIFICATION', 'CERTIFICATIONS', 'CERTIFICATES'].includes(heading)) return 'certifications';
  if (['EDUCATION', 'ACADEMICBACKGROUND'].includes(heading)) return 'education';
  if (['SOFTSKILLS', 'SOFTSKILL'].includes(heading)) return 'softSkills';
  if (['LANGUAGE', 'LANGUAGES'].includes(heading)) return 'languages';
  if (['PROJECT', 'PROJECTS', 'KEYPROJECTS'].includes(heading)) return 'projects';
  return null;
}

function extractUploadedText(content) {
  const match = content.match(/---\s*\n([\s\S]*?)\n---\s*\n/i);
  return (match?.[1] || content).replace(/--- Page Break ---/g, '\n').trim();
}

function isLikelyDateLine(line) {
  return /\b(19|20)\d{2}\b|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b|present|current/i.test(line);
}

function splitResumeIntoBuckets(text) {
  const lines = text
    .split(/\r?\n/)
    .map(line => line.replace(/^[•\-*]\s*/, '').trim())
    .filter(Boolean);

  const buckets = { header: [] };
  let active = 'header';

  for (const line of lines) {
    const sectionType = getSectionType(line);
    if (sectionType) {
      active = sectionType;
      buckets[active] = buckets[active] || [];
      continue;
    }
    buckets[active] = buckets[active] || [];
    buckets[active].push(line);
  }

  return buckets;
}

function buildListItems(lines, fallbackTitle) {
  const items = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line || line.length < 2) continue;

    const next = lines[index + 1] || '';
    const afterNext = lines[index + 2] || '';
    const date = isLikelyDateLine(next) ? next : isLikelyDateLine(afterNext) ? afterNext : '';
    const subtitle = date === next ? '' : next && !isLikelyDateLine(next) ? next : '';

    items.push({
      id: createId('item'),
      title: line || fallbackTitle,
      subtitle,
      date,
      institution: subtitle,
    });

    if (date === afterNext) index += 2;
    else if (subtitle || date) index += 1;
  }
  return items;
}

function buildLocalCvFromText(content, currentCvData) {
  const resumeText = extractUploadedText(content);
  if (!resumeText || resumeText.length < 20) return null;

  const buckets = splitResumeIntoBuckets(resumeText);
  const allText = resumeText;
  const header = buckets.header || [];
  const email = allText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
  const phone = allText.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0]?.trim() || '';
  const linkedin = allText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s]+/i)?.[0] || '';
  const website = allText.match(/(?:https?:\/\/)?(?!www\.linkedin\.com)(?:www\.)?[a-z0-9-]+\.[a-z]{2,}(?:\/[^\s]*)?/i)?.[0] || '';
  const fullName = header.find(line => !line.includes('@') && !/^\+?\d/.test(line) && !/linkedin|https?:|www\./i.test(line)) || currentCvData?.personalInfo?.fullName || '';
  const title = header.find(line => line !== fullName && !line.includes('@') && !/^\+?\d/.test(line) && !/linkedin|https?:|www\./i.test(line)) || currentCvData?.personalInfo?.title || '';
  const location = header.find(line => /lebanon|beirut|uae|dubai|usa|canada|france|germany|uk|remote/i.test(line)) || currentCvData?.personalInfo?.location || '';

  const sections = [];
  const summaryLines = buckets.summary || [];
  sections.push({
    id: createId('sec'),
    title: 'Professional Summary',
    type: 'text',
    column: 'left',
    content: summaryLines.join(' ') || `${title || 'Professional'} with experience across ${((buckets.skills || []).slice(0, 4).join(', ')) || 'business and technical delivery'}.`,
  });

  if (buckets.experience?.length) {
    sections.push({
      id: createId('sec'),
      title: 'Professional Experience',
      type: 'experience',
      column: 'left',
      items: [{
        id: createId('exp'),
        company: buckets.experience[0] || '',
        role: buckets.experience[1] && !isLikelyDateLine(buckets.experience[1]) ? buckets.experience[1] : title,
        dates: (buckets.experience.find(isLikelyDateLine) || ''),
        location: '',
        bullets: buckets.experience.slice(2).filter(line => !isLikelyDateLine(line)).slice(0, 8),
      }],
    });
  }

  const skillItems = [...(buckets.skills || []), ...(buckets.softSkills || [])]
    .filter(line => line.length > 1 && !isLikelyDateLine(line));
  if (skillItems.length) {
    sections.push({
      id: createId('sec'),
      title: 'Skills',
      type: 'skills',
      column: 'right',
      categories: [{ id: createId('cat'), title: 'Core Skills', items: skillItems }],
    });
  }

  if (buckets.education?.length) {
    sections.push({
      id: createId('sec'),
      title: 'Education',
      type: 'list',
      column: 'right',
      items: buildListItems(buckets.education, 'Education'),
    });
  }

  if (buckets.certifications?.length) {
    sections.push({
      id: createId('sec'),
      title: 'Certifications',
      type: 'list',
      column: 'right',
      items: buildListItems(buckets.certifications, 'Certification'),
    });
  }

  if (buckets.languages?.length) {
    sections.push({
      id: createId('sec'),
      title: 'Languages',
      type: 'languages',
      column: 'right',
      items: buckets.languages.map(line => ({ id: createId('lang'), language: line, level: '' })),
    });
  }

  if (buckets.projects?.length) {
    sections.push({
      id: createId('sec'),
      title: 'Projects',
      type: 'projects',
      column: 'left',
      items: buckets.projects.map(line => ({ id: createId('proj'), name: line, description: '', tech: '', link: '' })),
    });
  }

  if (sections.length <= 1 && skillItems.length === 0 && !fullName && !title) return null;

  return normalizeCvData({
    personalInfo: {
      fullName,
      email,
      phone,
      location,
      title,
      website: website === linkedin ? '' : website,
      linkedin,
    },
    sections,
  }, currentCvData);
}

function normalizeSection(section, index) {
  const type = section.type || 'text';
  const base = {
    id: section.id || createId('sec'),
    title: section.title || (type === 'text' ? 'Summary' : 'Section'),
    type,
    column: section.column || (['skills', 'list', 'languages'].includes(type) ? 'right' : 'left'),
  };

  if (type === 'experience') {
    return {
      ...base,
      title: section.title || 'Professional Experience',
      column: section.column || 'left',
      items: (section.items || []).map(item => ({
        id: item.id || createId('exp'),
        company: item.company || '',
        role: item.role || '',
        dates: item.dates || '',
        location: item.location || '',
        bullets: Array.isArray(item.bullets) ? item.bullets : [],
      })),
    };
  }

  if (type === 'skills') {
    return {
      ...base,
      title: section.title || 'Skills',
      column: section.column || 'right',
      categories: (section.categories || []).map(category => ({
        id: category.id || createId('cat'),
        title: category.title || 'Skills',
        items: Array.isArray(category.items) ? category.items : [],
      })),
    };
  }

  if (type === 'list') {
    return {
      ...base,
      column: section.column || 'right',
      items: (section.items || []).map(item => ({
        id: item.id || createId('item'),
        title: item.title || '',
        subtitle: item.subtitle || '',
        date: item.date || '',
        institution: item.institution || '',
      })),
    };
  }

  if (type === 'projects') {
    return {
      ...base,
      title: section.title || 'Projects',
      column: section.column || 'left',
      items: (section.items || []).map(item => ({
        id: item.id || createId('proj'),
        name: item.name || '',
        description: item.description || '',
        tech: item.tech || '',
        link: item.link || '',
      })),
    };
  }

  if (type === 'languages') {
    return {
      ...base,
      title: section.title || 'Languages',
      column: section.column || 'right',
      items: (section.items || []).map(item => ({
        id: item.id || createId('lang'),
        language: item.language || '',
        level: item.level || '',
      })),
    };
  }

  return {
    ...base,
    title: section.title || (index === 0 ? 'Professional Summary' : 'Summary'),
    column: section.column || 'left',
    content: section.content || '',
  };
}

function normalizeCvData(candidate, currentCvData) {
  if (!candidate || typeof candidate !== 'object') return null;

  const source = candidate.cvData || candidate;
  const personalInfo = {
    ...emptyPersonalInfo,
    ...(currentCvData?.personalInfo || {}),
    ...(source.personalInfo || {}),
  };

  const sections = Array.isArray(source.sections)
    ? source.sections.map(normalizeSection)
    : currentCvData?.sections || [];

  if (!source.personalInfo && !Array.isArray(source.sections)) return null;

  return { personalInfo, sections };
}

function extractCvUpdate(response, currentCvData) {
  const taggedMatch = response.match(/\[CV_UPDATE\]([\s\S]*?)\[\/CV_UPDATE\]/i);
  const candidate = taggedMatch ? findJsonObject(taggedMatch[1]) : findJsonObject(response);
  const nextCvData = normalizeCvData(candidate, currentCvData);

  return {
    nextCvData,
    displayContent: stripUpdateBlocks(response),
  };
}

function isCvChangeRequest(content) {
  return /\b(create|build|generate|make|modify|update|write|add|fix|extract|tailor|improve|rewrite|change|replace|upload|uploaded|resume|cv|summary|skills|experience|education|project|language|certification|bullet)\b/i.test(content);
}

export function useAI(cvData, updateCvData) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your AI resume assistant. I can help you:\n\n• **Improve** your bullet points and summary\n• **Generate** content from a job description\n• **Suggest** skills for your role\n• **Write** a professional summary\n\nJust ask me anything about your CV!",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const getCvContext = useCallback(() => {
    if (!cvData) return '';
    const parts = [];
    parts.push(`Name: ${cvData.personalInfo.fullName}`);
    parts.push(`Title: ${cvData.personalInfo.title || 'Not set'}`);

    cvData.sections.forEach(sec => {
      if (sec.type === 'text') parts.push(`Summary: ${sec.content}`);
      if (sec.type === 'experience') {
        sec.items?.forEach(item => {
          parts.push(`Experience: ${item.role} at ${item.company} (${item.dates})`);
          item.bullets?.forEach(b => b && parts.push(`  - ${b}`));
        });
      }
      if (sec.type === 'skills') {
        sec.categories?.forEach(cat => {
          parts.push(`Skills (${cat.title}): ${cat.items?.join(', ')}`);
        });
      }
    });

    return parts.join('\n');
  }, [cvData]);

  const sendMessage = useCallback(async (content) => {
    const userMsg = { id: `user_${Date.now()}`, role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const cvDataJSON = cvData ? JSON.stringify(cvData) : '';
      const response = await chatWithAI(content, getCvContext(), cvDataJSON);

      let { nextCvData, displayContent: parsedDisplayContent } = extractCvUpdate(response, cvData);
      let displayContent = parsedDisplayContent || response;

      if (!nextCvData && updateCvData && isCvChangeRequest(content)) {
        const forcedUpdate = await generateCvUpdate(content, cvDataJSON);
        const forcedResult = extractCvUpdate(forcedUpdate, cvData);
        if (forcedResult.nextCvData) {
          nextCvData = forcedResult.nextCvData;
          displayContent = stripUpdateBlocks(response) || 'CV updated successfully.';
        }
      }

      if (!nextCvData && updateCvData && isCvChangeRequest(content)) {
        const localCvData = buildLocalCvFromText(content, cvData);
        if (localCvData) {
          nextCvData = localCvData;
          displayContent = 'I imported the resume text into your CV. Review the sections and refine any details you want adjusted.';
        }
      }

      if (nextCvData && updateCvData) {
        updateCvData(nextCvData);
        displayContent = displayContent || 'CV updated successfully.';
      }

      const assistantMsg = { id: `ai_${Date.now()}`, role: 'assistant', content: displayContent };
      setMessages(prev => [...prev, assistantMsg]);
      return displayContent;
    } catch (err) {
      const errorMsg = { id: `err_${Date.now()}`, role: 'assistant', content: `❌ Error: ${err.message}` };
      setMessages(prev => [...prev, errorMsg]);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getCvContext, cvData, updateCvData]);

  const enhanceSectionText = useCallback(async (text, type) => {
    setIsLoading(true);
    try {
      const result = await enhanceText(text, type);
      return result;
    } catch (err) {
      console.error('AI enhance error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateBulletsForRole = useCallback(async (role, company, context) => {
    setIsLoading(true);
    try {
      return await generateBullets(role, company, context);
    } catch (err) {
      console.error('AI bullets error:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateCvSummary = useCallback(async () => {
    if (!cvData) return null;
    setIsLoading(true);
    try {
      return await generateSummary(cvData);
    } catch (err) {
      console.error('AI summary error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [cvData]);

  const suggestSkillsForRole = useCallback(async (role, existing) => {
    setIsLoading(true);
    try {
      return await suggestSkills(role, existing);
    } catch (err) {
      console.error('AI skills error:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateFromJob = useCallback(async (jobDescription) => {
    setIsLoading(true);
    try {
      return await generateFromJobDescription(jobDescription);
    } catch (err) {
      console.error('AI job parse error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    enhanceSectionText,
    generateBulletsForRole,
    generateCvSummary,
    suggestSkillsForRole,
    generateFromJob,
    hasApiKey: true,
  };
}
