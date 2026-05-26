import React from 'react';
import {
  Award, TrendingUp, FileSearch, ArrowRight, Lightbulb,
  Zap, PlusCircle, RefreshCw,
} from 'lucide-react';

export default function AtsAnalysis({ analysis, onAnalyze, isAnalyzing, hasResume }) {
  if (!hasResume) {
    return (
      <div className="bg-white rounded border border-slate-200 shadow-sm p-8 text-center py-14" id="ats-audit-blank">
        <FileSearch className="w-8 h-8 text-slate-300 mx-auto mb-3" />
        <h3 className="text-xs font-bold text-slate-950 uppercase tracking-widest font-sans">
          ATS Integrity Auditor
        </h3>
        <p className="text-xs text-slate-500 mt-3 max-w-sm mx-auto leading-relaxed">
          Please create or import a CV first. Once the draft is available, Gemini can analyze phrasing, keyword coverage, metrics, and readability.
        </p>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score < 60) return { bg: 'bg-red-50 text-red-800 border-red-100', text: 'text-red-700', stroke: '#ef4444' };
    if (score < 80) return { bg: 'bg-amber-50 text-amber-900 border-amber-100', text: 'text-amber-700', stroke: '#f59e0b' };
    return { bg: 'bg-emerald-50 text-emerald-900 border-emerald-100', text: 'text-emerald-700', stroke: '#0f766e' };
  };

  const scoreDetails = analysis ? getScoreColor(analysis.score) : { bg: 'bg-slate-50', text: 'text-slate-500', stroke: '#64748b' };

  return (
    <div className="bg-white rounded border border-slate-200 shadow-sm p-5 space-y-6 relative" id="ats-audit-report">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-slate-700" />
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">
            ATS Integrity Index
          </h2>
        </div>
        <button
          type="button"
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="text-[10px] font-bold text-slate-800 hover:text-black hover:bg-slate-50 border border-slate-200 rounded px-3 py-1.5 transition-colors flex items-center gap-1.5 uppercase tracking-wider disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Auditing...' : 'Recalculate'}
        </button>
      </div>

      {isAnalyzing ? (
        <div className="py-20 text-center flex flex-col items-center">
          <svg className="animate-spin h-6 w-6 text-slate-900 mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-xs font-bold text-slate-900 uppercase tracking-widest font-sans">Refining Language Matrices...</p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-[260px] leading-relaxed">Scanning action verbs, metric density, keyword coverage, formatting, and readability.</p>
        </div>
      ) : !analysis ? (
        <div className="py-12 text-center">
          <FileSearch className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-xs text-slate-950 font-bold uppercase tracking-wide">Ready For Core Audit</p>
          <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto mb-4 leading-relaxed">
            Run a Gemini audit to review action verbs, quantified impact, ATS keywords, formatting, and recruiter readability.
          </p>
          <button
            type="button"
            onClick={onAnalyze}
            className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded px-4 py-2 transition-colors uppercase tracking-widest"
          >
            Start Core Audit
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 items-center bg-slate-50 p-4 rounded border border-slate-100">
            <div className="flex flex-col items-center justify-center p-2">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="40" className="stroke-slate-200" strokeWidth="5" fill="transparent" />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke={scoreDetails.stroke}
                    strokeWidth="5"
                    fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * analysis.score) / 100}
                    className="transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold font-sans text-slate-950 tracking-tighter">{analysis.score}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-semibold">ATS index</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded mt-3 border ${scoreDetails.bg}`}>
                {analysis.score >= 80 ? 'Elite Match' : analysis.score >= 60 ? 'Competitive' : 'Needs Work'}
              </span>
            </div>

            <div className="space-y-2.5 p-1">
              {[
                ['Action Verbs Performance', analysis.breakdown.verbs, 20],
                ['Metric Quantifiers & Scale', analysis.breakdown.metrics, 25],
                ['Target Keyword Integrity', analysis.breakdown.keywords, 25],
              ].map(([label, value, max]) => (
                <div key={label}>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="font-semibold text-slate-600">{label}</span>
                    <span className="font-mono text-slate-400 font-bold">{value} / {max}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1 rounded overflow-hidden">
                    <div className="bg-slate-900 h-full" style={{ width: `${(value / max) * 100}%` }} />
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[9px] uppercase font-mono text-slate-400 block font-semibold mb-0.5">Formatting</span>
                  <span className="text-xs font-bold text-slate-800">{analysis.breakdown.formatting} / 15</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono text-slate-400 block font-semibold mb-0.5">Readability</span>
                  <span className="text-xs font-bold text-slate-800">{analysis.breakdown.readability} / 15</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Target Keyword Integration Checklist
            </h3>
            <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-100 rounded">
              {analysis.suggestedKeywords.map((kw, i) => (
                <span
                  key={`${kw.keyword}_${i}`}
                  className={`text-[11px] px-2 py-0.5 rounded border font-medium flex items-center gap-1 select-none transition-all ${
                    kw.status === 'matched'
                      ? 'bg-slate-100 text-slate-800 border-slate-200'
                      : 'bg-red-50 text-red-900 border-red-100'
                  }`}
                  title={`${kw.importance === 'high' ? 'High' : 'Medium'} importance keyword suggested for target role.`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${kw.status === 'matched' ? 'bg-slate-900' : 'bg-red-400'}`} />
                  {kw.keyword}
                  <span className="text-[8px] uppercase font-mono opacity-60 font-semibold">
                    {kw.importance === 'high' ? 'High' : 'Med'}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <AuditList
            title="Impact Phrasing Upgrades"
            icon={Zap}
            items={analysis.verbAudit}
            renderItem={(item, i) => (
              <AuditCard key={i} label={`Weak Verb: "${item.foundVerb}"`} index={i} sentence={item.sentence} suggestion={item.suggestion} />
            )}
          />

          <AuditList
            title="Quantified Metrics Needed"
            icon={PlusCircle}
            items={analysis.metricAudit}
            renderItem={(item, i) => (
              <AuditCard key={i} label="Needs Metrics" index={i} sentence={item.sentence} suggestion={item.suggestion} />
            )}
          />

          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-slate-500" />
              Placement Mentoring
            </h3>
            <div className="space-y-2 bg-slate-50 p-4 border border-slate-100 rounded">
              {analysis.coachAdvice.map((tip, i) => (
                <div key={i} className="flex gap-2.5 text-xs text-slate-800 leading-relaxed items-start">
                  <span className="text-slate-900 font-bold font-mono shrink-0 mt-0.5">0{i + 1}.</span>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AuditList({ title, icon: Icon, items, renderItem }) {
  if (!items.length) return null;
  return (
    <div className="space-y-2.5">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-slate-500" />
        {title}
      </h3>
      <div className="space-y-3">{items.map(renderItem)}</div>
    </div>
  );
}

function AuditCard({ label, index, sentence, suggestion }) {
  return (
    <div className="p-3.5 border border-slate-200 rounded space-y-2 text-xs leading-relaxed bg-white transition-colors">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-mono uppercase bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold">
          {label}
        </span>
        <span className="text-[9px] text-slate-400 font-mono shrink-0">#{index + 1}</span>
      </div>
      {sentence && (
        <p className="text-slate-500 italic pl-2 border-l border-slate-300">
          "{sentence}"
        </p>
      )}
      {suggestion && (
        <div className="flex items-start gap-1.5 pt-1.5 border-t border-slate-100 bg-slate-50 p-2 rounded">
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 mt-0.5 shrink-0" />
          <p className="font-semibold text-slate-900 leading-normal">
            <strong className="text-slate-950 underline decoration-slate-900 decoration-1">Suggested:</strong> {suggestion}
          </p>
        </div>
      )}
    </div>
  );
}