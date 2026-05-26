import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, Bot, User, Wand2, FileText, Zap, BriefcaseBusiness, Wrench, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

const QUICK_ACTIONS = [
  { icon: FileText, label: 'Write summary', prompt: 'Write me a professional summary based on my CV' },
  { icon: Zap, label: 'Suggest skills', prompt: 'Suggest relevant skills for my role' },
  { icon: Wand2, label: 'Improve bullets', prompt: 'Help me improve my experience bullet points to be more impactful' },
  { icon: BriefcaseBusiness, label: 'Tailor to job', prompt: 'I want to tailor my CV to a specific job. Ask me for the job description.' },
  { icon: Wrench, label: 'Fix CV data', prompt: 'Review my CV data structure for any issues, missing fields, or inconsistencies and suggest fixes.' },
];

export default function AIChat({ messages, isLoading, onSend, hasApiKey }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput('');
  };

  const handleQuickAction = (prompt) => {
    onSend(prompt);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    try {
      let text = '';

      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pages = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          // Reconstruct text with proper spacing and line breaks
          let lastY = null;
          let lineText = '';
          const lines = [];
          for (const item of content.items) {
            if (lastY !== null && Math.abs(item.transform[5] - lastY) > 2) {
              lines.push(lineText.trim());
              lineText = '';
            }
            lineText += (lineText && item.str ? ' ' : '') + item.str;
            lastY = item.transform[5];
          }
          if (lineText.trim()) lines.push(lineText.trim());
          pages.push(lines.filter(Boolean).join('\n'));
        }
        text = pages.join('\n\n--- Page Break ---\n\n');
      } else {
        text = await file.text();
      }

      if (!text.trim()) {
        onSend(`I uploaded "${file.name}" but couldn't extract any readable text from it.`);
        return;
      }
      const prompt = `I'm uploading a file "${file.name}" for you to analyze. Here's the FULL extracted content:\n\n---\n${text}\n---\n\nPlease analyze this thoroughly and help me use it to improve my CV. If it's a job description, tailor my CV to match it. If it's an existing resume, extract ALL the data (name, title, contact info, experience with dates and bullet points, skills, education, languages, projects) and update my CV with everything.`;
      onSend(prompt);
    } catch (err) {
      onSend(`I tried to upload "${file.name}" but couldn't read it. Error: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0 shadow-sm">
                  <Bot size={14} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[12px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-br-md'
                    : 'bg-slate-100 text-slate-700 rounded-bl-md'
                }`}
              >
                <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{
                  __html: msg.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br />')
                }} />
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                  <User size={14} className="text-slate-600" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 items-center"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <div className="flex gap-1.5 px-4 py-3 bg-slate-100 rounded-2xl rounded-bl-md">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3">
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action.prompt)}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
              >
                <action.icon size={14} className="text-slate-400 group-hover:text-blue-500 shrink-0" />
                <span className="text-[10px] font-semibold text-slate-600 group-hover:text-blue-700">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 bg-white">
        {!hasApiKey && (
          <div className="mb-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-700 font-medium">
            Add <code className="bg-amber-100 px-1 rounded">VITE_GEMINI_API_KEY</code> to <code className="bg-amber-100 px-1 rounded">.env</code> to enable AI
          </div>
        )}
        <div className="flex gap-2 items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf,.doc,.docx,.json,.md,.rtf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50 transition-all disabled:opacity-40"
            title="Upload a file (job description, resume, etc.)"
          >
            <Paperclip size={16} />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI to help with your CV..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-slate-50"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white disabled:opacity-40 hover:shadow-lg transition-all active:scale-95"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </form>
    </div>
  );
}
