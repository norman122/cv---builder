async function callGeminiFunction(prompt, systemInstruction) {
  const response = await fetch('/.netlify/functions/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, systemInstruction }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || 'Gemini function request failed. Add GEMINI_API_KEY in Netlify environment variables.');
  }

  return data.text || '';
}

async function callAI(prompt, systemInstruction = '') {
  return callGeminiFunction(prompt, systemInstruction);
}

export async function enhanceText(text, type = 'summary') {
  const prompt = `Rewrite this resume ${type} to be more professional, concise, and impactful. Use strong action verbs and quantify achievements where possible. Return ONLY the improved text, no explanations:\n\n"${text}"`;
  return callAI(prompt);
}

export async function generateBullets(role, company, context = '') {
  const prompt = `Generate 4 professional resume bullet points for someone who worked as "${role}" at "${company}". ${context ? `Additional context: ${context}` : ''}\n\nUse strong action verbs, quantify results where possible. Return ONLY the bullet points, one per line, no numbering or dashes.`;
  const result = await callAI(prompt);
  return result.split('\n').filter(line => line.trim()).slice(0, 5);
}

export async function generateSummary(cvData) {
  const sections = cvData.sections || [];
  const experience = sections
    .filter(s => s.type === 'experience')
    .flatMap(s => s.items || [])
    .map(i => `${i.role} at ${i.company}`)
    .join(', ');
  const skills = sections
    .filter(s => s.type === 'skills')
    .flatMap(s => s.categories || [])
    .flatMap(c => c.items || [])
    .join(', ');

  const prompt = `Write a professional 2-3 sentence resume summary for someone with this background:\nTitle: ${cvData.personalInfo.title || 'Professional'}\nExperience: ${experience || 'Not specified'}\nSkills: ${skills || 'Not specified'}\n\nReturn ONLY the summary text, no quotes or explanations.`;
  return callAI(prompt);
}

export async function suggestSkills(role, existingSkills = []) {
  const prompt = `Suggest 8-10 relevant technical and soft skills for a "${role}" role. Exclude these already listed: ${existingSkills.join(', ')}.\n\nReturn ONLY the skills, one per line, no numbering.`;
  const result = await callAI(prompt);
  return result.split('\n').filter(line => line.trim()).slice(0, 10);
}

export async function generateFromJobDescription(jobDescription) {
  const systemInstruction = `You are a professional resume writer. Generate tailored CV content based on a job description. Return valid JSON only.`;
  const prompt = `Based on this job description, generate tailored CV sections. Return a JSON object with this structure:
{
  "title": "suggested job title",
  "summary": "2-3 sentence professional summary",
  "skills": ["skill1", "skill2", ...],
  "keywords": ["keyword1", "keyword2", ...]
}

Job Description:
${jobDescription}`;

  const result = await callAI(prompt, systemInstruction);
  const jsonMatch = result.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error('Failed to parse AI response');
}

export async function chatWithAI(message, cvContext = '', cvDataJSON = '') {
  const systemInstruction = `You are an expert career coach and resume writer assistant built into a CV builder app. Help the user improve their CV. Be concise, actionable, and specific.

You have access to the user's current CV data. When the user asks you to CREATE, BUILD, GENERATE, MODIFY, UPDATE, WRITE, ADD, FIX, EXTRACT, TAILOR, IMPROVE, or CHANGE anything in their CV, you MUST update the CV data.

For any CV creation or modification request, your response MUST start with this exact machine-readable block:
[CV_UPDATE]
{ full updated cvData JSON object }
[/CV_UPDATE]

Then add one short sentence explaining what changed. Do not use markdown fences inside the CV_UPDATE block.

The CV data schema is:
{
  "personalInfo": { "fullName": "", "email": "", "phone": "", "location": "", "title": "", "website": "", "linkedin": "" },
  "sections": [
    // type "text": { "id": "string", "title": "string", "type": "text", "column": "left"|"right", "content": "string" }
    // type "experience": { "id": "string", "title": "string", "type": "experience", "column": "left"|"right", "items": [{ "id": "string", "company": "string", "role": "string", "dates": "string", "location": "string", "bullets": ["string"] }] }
    // type "skills": { "id": "string", "title": "string", "type": "skills", "column": "left"|"right", "categories": [{ "id": "string", "title": "string", "items": ["string"] }] }
    // type "list": { "id": "string", "title": "string", "type": "list", "column": "left"|"right", "items": [{ "id": "string", "title": "string", "subtitle": "string", "date": "string", "institution": "string" }] }
    // type "projects": { "id": "string", "title": "string", "type": "projects", "column": "left"|"right", "items": [{ "id": "string", "name": "string", "description": "string", "tech": "string", "link": "string" }] }
    // type "languages": { "id": "string", "title": "string", "type": "languages", "column": "left"|"right", "items": [{ "id": "string", "language": "string", "level": "string" }] }
  ]
}

Rules:
- When creating or modifying the CV, ALWAYS include the [CV_UPDATE] block with the COMPLETE cvData object (personalInfo + all sections).
- If the current CV is empty, create a complete cvData object from the user's message or uploaded content.
- If the user uploads or pastes an existing resume, extract all available data into the CV schema.
- If the user asks to write a summary, add or update a text section titled "Professional Summary".
- If the user asks for skills, add or update a skills section.
- If the user asks to improve bullets, update the relevant experience bullet arrays.
- Preserve all existing data that the user didn't ask to change.
- Generate unique IDs for new items (use format like "sec_" + random string or "exp_" + random string).
- After the [CV_UPDATE] block, add a brief user-friendly message explaining what you changed.
- If the user is just asking a question (not requesting a change), respond normally without any [CV_UPDATE] block.`;

  let prompt = '';
  if (cvDataJSON) {
    prompt = `Current CV data (JSON):\n${cvDataJSON}\n\nUser message: ${message}`;
  } else if (cvContext) {
    prompt = `Current CV context:\n${cvContext}\n\nUser message: ${message}`;
  } else {
    prompt = message;
  }

  return callAI(prompt, systemInstruction);
}

export async function generateCvUpdate(message, cvDataJSON = '') {
  const systemInstruction = `You are a CV data generator inside a React CV builder app. Return ONLY valid JSON. No markdown, no explanation, no [CV_UPDATE] tags.

Return one complete cvData object with this exact top-level shape:
{
  "personalInfo": { "fullName": "", "email": "", "phone": "", "location": "", "title": "", "website": "", "linkedin": "" },
  "sections": []
}

Supported section types:
- text: { "id": "sec_x", "title": "Professional Summary", "type": "text", "column": "left", "content": "" }
- experience: { "id": "sec_x", "title": "Professional Experience", "type": "experience", "column": "left", "items": [{ "id": "exp_x", "company": "", "role": "", "dates": "", "location": "", "bullets": [] }] }
- skills: { "id": "sec_x", "title": "Skills", "type": "skills", "column": "right", "categories": [{ "id": "cat_x", "title": "", "items": [] }] }
- list: { "id": "sec_x", "title": "Education", "type": "list", "column": "right", "items": [{ "id": "item_x", "title": "", "subtitle": "", "date": "", "institution": "" }] }
- projects: { "id": "sec_x", "title": "Projects", "type": "projects", "column": "left", "items": [{ "id": "proj_x", "name": "", "description": "", "tech": "", "link": "" }] }
- languages: { "id": "sec_x", "title": "Languages", "type": "languages", "column": "right", "items": [{ "id": "lang_x", "language": "", "level": "" }] }

Preserve existing data unless the user asked to change it. If the current CV is empty, create useful sections from the request.`;

  const prompt = cvDataJSON
    ? `Current CV data:\n${cvDataJSON}\n\nUser request:\n${message}`
    : message;

  return callAI(prompt, systemInstruction);
}

export async function fixCvJSON(brokenInput) {
  const systemInstruction = `You are a JSON repair assistant for a CV builder app. Your job is to fix malformed JSON and ensure it matches the required CV data schema. Return ONLY valid JSON, no explanations or markdown.

The correct schema is:
{
  "personalInfo": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "title": "string",
    "website": "string",
    "linkedin": "string"
  },
  "sections": [
    // type "text": { "id": "string", "title": "string", "type": "text", "column": "left"|"right", "content": "string" }
    // type "experience": { "id": "string", "title": "string", "type": "experience", "column": "left"|"right", "items": [{ "id": "string", "company": "string", "role": "string", "dates": "string", "location": "string", "bullets": ["string"] }] }
    // type "skills": { "id": "string", "title": "string", "type": "skills", "column": "left"|"right", "categories": [{ "id": "string", "title": "string", "items": ["string"] }] }
    // type "list": { "id": "string", "title": "string", "type": "list", "column": "left"|"right", "items": [{ "id": "string", "title": "string", "subtitle": "string", "date": "string", "institution": "string" }] }
    // type "projects": { "id": "string", "title": "string", "type": "projects", "column": "left"|"right", "items": [{ "id": "string", "name": "string", "description": "string", "tech": "string", "link": "string" }] }
    // type "languages": { "id": "string", "title": "string", "type": "languages", "column": "left"|"right", "items": [{ "id": "string", "language": "string", "level": "string" }] }
  ]
}

Rules:
- Fix syntax errors (missing quotes, commas, brackets)
- Add missing required fields with empty string defaults
- Generate unique IDs where missing (use format "sec_" + timestamp or "exp_" + timestamp)
- Ensure all sections have "column" field (default "left")
- Preserve all existing data, just fix the structure
- If the input looks like CV data in any format, convert it to the correct schema`;

  const prompt = `Fix this CV JSON data and return valid JSON matching the schema:\n\n${brokenInput}`;
  const result = await callAI(prompt, systemInstruction);

  // Extract JSON from response (in case AI wraps it in markdown)
  const jsonMatch = result.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI could not repair the JSON');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // Validate minimum structure
  if (!parsed.personalInfo || !parsed.sections) {
    throw new Error('Repaired JSON is missing required fields');
  }

  return parsed;
}

export function hasApiKey() {
  return true;
}
