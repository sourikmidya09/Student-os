const isLocal = window.location.hostname === 'localhost';

export async function sendMessage(messages, apiKey, systemPrompt = '') {
  if (isLocal) {
    // Local development — use API key directly
    if (!apiKey || apiKey === '' || apiKey === '') {
      throw new Error('API_KEY_MISSING');
    }
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
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
          ...messages.map(m => ({ role: m.role, content: m.content })),
        ],
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'API error');
    return data.choices[0]?.message?.content || '';

  } else {
    // Production — call our backend which hides the key
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        systemPrompt,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'API error');
    return data.content || '';
  }
}

export async function generateRoadmap(careerGoal, apiKey) {
  const systemPrompt = `You are a career coach. Generate a detailed career roadmap as a JSON object.
Return ONLY valid JSON, no markdown fences, no explanation.

Schema:
{
  "title": "Career goal title",
  "description": "Brief description",
  "duration": "Estimated total time",
  "phases": [
    {
      "id": "phase-1",
      "title": "Phase name",
      "duration": "e.g. 3 months",
      "description": "What this phase is about",
      "milestones": [
        {
          "id": "m-1",
          "title": "Milestone title",
          "description": "What to accomplish",
          "type": "skill|project|certification|experience",
          "completed": false
        }
      ]
    }
  ],
  "resources": [
    { "title": "Resource name", "type": "book|course|website|tool" }
  ]
}`;

  const response = await sendMessage(
    [{ role: 'user', content: `Create a detailed career roadmap for: ${careerGoal}. Include 3-5 phases with 3-5 milestones each.` }],
    apiKey,
    systemPrompt
  );

  try {
    return JSON.parse(response);
  } catch {
    throw new Error('Failed to parse roadmap. Please try again.');
  }
}