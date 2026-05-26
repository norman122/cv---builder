import { useState, useCallback } from 'react';
import { chatWithAI, enhanceText, generateBullets, generateSummary, suggestSkills, generateFromJobDescription } from '../utils/ai';

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

      // Check if the AI wants to update the CV
      const updateMatch = response.match(/\[CV_UPDATE\]([\s\S]*?)\[\/CV_UPDATE\]/);
      let displayContent = response;

      if (updateMatch && updateCvData) {
        try {
          const jsonStr = updateMatch[1].trim();
          const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const newCvData = JSON.parse(jsonMatch[0]);
            if (newCvData.personalInfo && newCvData.sections) {
              updateCvData(newCvData);
              displayContent = response.replace(/\[CV_UPDATE\][\s\S]*?\[\/CV_UPDATE\]/, '').trim();
              displayContent = (displayContent || '✅ CV updated successfully!');
            }
          }
        } catch (parseErr) {
          console.error('Failed to parse CV update from AI:', parseErr);
          displayContent = response.replace(/\[CV_UPDATE\][\s\S]*?\[\/CV_UPDATE\]/, '').trim();
          displayContent = displayContent || '⚠️ I tried to update your CV but the data format was invalid. Please try again.';
        }
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
