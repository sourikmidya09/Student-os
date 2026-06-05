export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, systemPrompt } = req.body;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`,
        'HTTP-Referer': 'https://student-os-lilac.vercel.app',
        'X-Title': 'Student OS',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4-5',
        max_tokens: 2048,
        messages: [
          {
            role: 'system',
            content: systemPrompt || 'You are an intelligent academic assistant inside Student OS. Help with studying, research, writing, problem-solving, and career guidance. Be concise, clear, and helpful. Format your responses with markdown when appropriate.',
          },
          ...messages,
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'API error' });
    }

    return res.status(200).json({ content: data.choices[0]?.message?.content || '' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}