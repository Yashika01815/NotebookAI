import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

const getGenAI = () => {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  }
  return genAI;
};

const getModel = (modelName = 'gemini-3.5-flash') => {
  return getGenAI().getGenerativeModel({ model: modelName });
};

export const generateSummary = async (content, type = 'short') => {
  const model = getModel();
  
  const prompts = {
    short: `Provide a concise 2-3 sentence summary of the following document content. Focus on the main topic and key takeaway:\n\n${content.substring(0, 8000)}`,
    detailed: `Provide a comprehensive summary of the following document. Include: main topics covered, key arguments or findings, important details, and conclusions. Structure it in clear paragraphs:\n\n${content.substring(0, 12000)}`,
    insights: `Extract 5-8 key insights from the following document. Return as JSON array of strings:\n\n${content.substring(0, 8000)}\n\nReturn ONLY a JSON array like: ["insight 1", "insight 2", ...]`,
  };

  const result = await model.generateContent(prompts[type]);
  const text = result.response.text();
  
  if (type === 'insights') {
    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return text.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[-•]\s*/, '').trim());
    }
  }
  
  return text;
};

export const generateMindMap = async (content) => {
  const model = getModel();
  
  const prompt = `Analyze the following document and generate a hierarchical mind map structure. 
Return ONLY valid JSON in this exact format:
{
  "title": "Main Topic",
  "children": [
    {
      "title": "Main Branch 1",
      "children": [
        { "title": "Sub-topic 1.1", "children": [] },
        { "title": "Sub-topic 1.2", "children": [] }
      ]
    },
    {
      "title": "Main Branch 2", 
      "children": [
        { "title": "Sub-topic 2.1", "children": [] }
      ]
    }
  ]
}

Document content:
${content.substring(0, 8000)}

Return ONLY the JSON, no markdown, no explanation.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error('Failed to parse mind map JSON from AI response');
  }
};

export const generateFlashcards = async (content) => {
  const model = getModel();
  
  const prompt = `Create 8-12 educational flashcards from the following document content.
Return ONLY valid JSON array in this format:
[
  {
    "front": "Question or concept",
    "back": "Answer or explanation",
    "category": "Topic category"
  }
]

Document content:
${content.substring(0, 8000)}

Return ONLY the JSON array, no markdown.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse flashcards from AI response');
  }
};

export const generateQuiz = async (content) => {
  const model = getModel();
  
  const prompt = `Create a 5-8 question multiple choice quiz based on the following document.
Return ONLY valid JSON array in this format:
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Why this is correct"
  }
]

correctAnswer is the 0-based index of the correct option.

Document content:
${content.substring(0, 8000)}

Return ONLY the JSON array, no markdown.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse quiz from AI response');
  }
};

export const generateKnowledgeGraph = async (content) => {
  const model = getModel();
  
  const prompt = `Analyze the document and extract entities and their relationships for a knowledge graph.
Return ONLY valid JSON in this format:
{
  "nodes": [
    { "id": "1", "label": "Entity Name", "type": "concept|person|organization|event|place" }
  ],
  "edges": [
    { "source": "1", "target": "2", "label": "relationship description" }
  ]
}

Extract 8-15 nodes and their meaningful relationships.

Document content:
${content.substring(0, 8000)}

Return ONLY the JSON, no markdown.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse knowledge graph from AI response');
  }
};

export const generateChatResponse = async (query, context, chatHistory = []) => {
  const model = getModel();
  
  const historyText = chatHistory.slice(-6).map(msg => 
    `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`
  ).join('\n');

  const prompt = `You are NotebookAI, an intelligent document assistant. Answer questions based on the provided document context.

DOCUMENT CONTEXT:
${context}

CONVERSATION HISTORY:
${historyText}

CURRENT QUESTION: ${query}

Instructions:
- Answer based on the document context provided
- Be accurate, helpful, and concise
- If the answer is not in the context, say so clearly
- Reference specific parts of the documents when relevant
- Format your response clearly with markdown when appropriate`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};
