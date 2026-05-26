const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

function readGeminiText(data) {
  return data?.candidates
    ?.flatMap(candidate => candidate.content?.parts || [])
    ?.map(part => part.text || '')
    ?.join('\n')
    ?.trim() || '';
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { Allow: 'POST' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing GEMINI_API_KEY environment variable' }),
    };
  }

  try {
    const { prompt = '', systemInstruction = '' } = JSON.parse(event.body || '{}');
    const fullPrompt = systemInstruction
      ? `${systemInstruction}\n\nUser request:\n${prompt}`
      : prompt;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: { temperature: 0.25 },
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data?.error?.message || 'Gemini request failed' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ text: readGeminiText(data) }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Gemini function failed' }),
    };
  }
};