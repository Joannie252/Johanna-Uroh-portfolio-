import express, { Request, Response } from 'express';
import { GoogleGenAI, Type, ThinkingLevel, GenerateContentResponse } from '@google/genai';
import { authenticateAdmin, AuthRequest } from '../auth.js';
import { query, getAllSettings } from '../db.js';

const router = express.Router();

const FAST_TEXT_MODEL = 'gemini-4-hydrogen';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatGeminiError(err: any, fallbackMessage: string): { status: number; message: string } {
  const msg = String(err?.message || err || '');
  const statusCode = err?.status || err?.code;

  if (statusCode === 403 || statusCode === 400 && msg.toLowerCase().includes('api key')) {
    return {
      status: 403,
      message: 'Gemini API key is invalid or unauthorized. Please check your API key in Settings > Secrets.',
    };
  }
  if (statusCode === 429 || msg.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      message: 'AI rate limit reached. Please wait a moment and try again.',
    };
  }
  if (statusCode === 404 || msg.includes('NOT_FOUND')) {
    return {
      status: 502,
      message: 'Configured Gemini model was unavailable. Please try again.',
    };
  }
  return {
    status: 500,
    message: msg ? `${fallbackMessage} (${msg})` : fallbackMessage,
  };
}

// 1. Generate Project Descriptions & Meta (Admin Only)
router.post('/generate-project-details', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, category, tools, clientName, existingInfo, notes, requestedField } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Project title is required for AI generation.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured. Please set GEMINI_API_KEY in Settings > Secrets.',
      });
      return;
    }

    const systemPrompt = `You are a professional portfolio copywriter assisting Johanna Uroh, a Virtual Assistant & AI Digital Specialist.
Your job is to generate structured case study and portfolio descriptions based STRICTLY on the facts provided by Johanna.

CRITICAL CONSTRAINTS:
- Do NOT invent, assume, or hallucinate: clients, revenue numbers, specific statistics, awards, testimonials, or past employers not mentioned.
- If specific metrics or client results are not provided, focus purely on functional objectives and implementation methods, or use descriptive placeholders such as "[e.g. reduced manual processing time by X%]".
- Maintain a polished, professional, modern tone suited for an executive portfolio.
- Return output strictly adhering to the JSON schema.`;

    const extraNotes = existingInfo || notes || 'None provided';
    const userPrompt = `Project Title: ${title}
Category: ${category || 'General'}
Tools & Technologies: ${Array.isArray(tools) ? tools.join(', ') : tools || 'Not specified'}
Client / Context: ${clientName || 'Portfolio demonstration / Client project'}
Additional Details Provided by Johanna: ${extraNotes}
Target Specific Field (if any): ${requestedField || 'all'}`;

    const response = await ai.models.generateContent({
      model: FAST_TEXT_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            shortDescription: {
              type: Type.STRING,
              description: 'A crisp 1-2 sentence executive overview of the project (under 160 chars).',
            },
            description: {
              type: Type.STRING,
              description: 'Comprehensive 2-3 paragraph professional narrative of the project.',
            },
            challenge: {
              type: Type.STRING,
              description: 'The operational, technical, or business obstacle addressed.',
            },
            solution: {
              type: Type.STRING,
              description: 'The solution engineered by Johanna using the stated tools.',
            },
            process: {
              type: Type.STRING,
              description: 'Step-by-step workflow: Discovery, Implementation, Testing, Deployment.',
            },
            result: {
              type: Type.STRING,
              description: 'The concrete deliverable and functional outcome achieved.',
            },
            seoTitle: {
              type: Type.STRING,
              description: 'Optimized browser title tag (e.g. "Title | Johanna Uroh").',
            },
            seoDescription: {
              type: Type.STRING,
              description: 'Search engine meta description under 155 characters.',
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '5-8 relevant technology and service tags.',
            },
            suggestedTools: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '4-6 relevant tools and technologies for this project.',
            },
          },
          required: [
            'shortDescription',
            'description',
            'challenge',
            'solution',
            'process',
            'result',
            'seoTitle',
            'seoDescription',
            'tags',
            'suggestedTools',
          ],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);
    res.json({
      success: true,
      data: {
        ...parsed,
        seoMetaDescription: parsed.seoDescription,
      },
    });
  } catch (err: any) {
    console.error('Error generating project details with Gemini:', err);
    const formatted = formatGeminiError(err, 'AI generation failed. Please try again or refine your input.');
    res.status(formatted.status).json({ error: formatted.message });
  }
});

// 2. Improve Writing / Transform Text (Admin Only)
router.post('/improve-text', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { text, mode = 'improve', context } = req.body;

    if (!text || !text.trim()) {
      res.status(400).json({ error: 'Text is required for improvement.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured. Please set GEMINI_API_KEY in Settings > Secrets.',
      });
      return;
    }

    const modePrompts: Record<string, string> = {
      improve: 'Improve clarity, flow, vocabulary, and readability while preserving meaning.',
      professional: 'Rewrite to be executive, authoritative, and business-focused. Eliminate casual slang.',
      concise: 'Make this text significantly tighter and more punchy, removing filler words.',
      engaging: 'Make this dynamic and engaging for portfolio readers, highlighting impact and agency.',
      grammar: 'Correct all spelling, grammatical, punctuation, and typographical mistakes without unnecessary rewording.',
    };

    const instruction = modePrompts[mode] || modePrompts.improve;

    const prompt = `Task: ${instruction}
Context: ${context || 'Portfolio website copy for Johanna Uroh'}

Original Text:
"""
${text}
"""

Return a JSON object with:
- "suggestion": the polished improved text only.
- "explanation": a 1-sentence note explaining what was refined.`;

    const response = await ai.models.generateContent({
      model: FAST_TEXT_MODEL,
      contents: prompt,
      config: {
        systemInstruction: 'You are an elite editorial assistant for executive portfolios. Never invent facts. Return valid JSON only.',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestion: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ['suggestion'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json({
      success: true,
      original: text,
      suggestion: parsed.suggestion || text,
      explanation: parsed.explanation || '',
    });
  } catch (err: any) {
    console.error('Error improving text with Gemini:', err);
    const formatted = formatGeminiError(err, 'AI text transformation failed. Please try again.');
    res.status(formatted.status).json({ error: formatted.message });
  }
});

// 3. Generate Image Alt Text (Admin Only)
router.post('/generate-alt-text', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { imageUrl, projectTitle, filename, context } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured. Please set GEMINI_API_KEY in Settings > Secrets.',
      });
      return;
    }

    const prompt = `Generate concise, descriptive, and accessible alt text for a portfolio image.
Project Title: ${projectTitle || 'Portfolio Work'}
Image File: ${filename || 'image'}
Context: ${context || 'Website screenshot or project deliverable'}
Image URL or Hint: ${imageUrl || ''}

Follow WCAG guidelines: Describe visual elements clearly, avoid starting with "Image of" or "Picture of".
Example format: "Screenshot of Johanna's AI-powered portfolio dashboard showing project management cards and performance charts."
Return JSON with key "altText".`;

    const response = await ai.models.generateContent({
      model: FAST_TEXT_MODEL,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            altText: { type: Type.STRING },
          },
          required: ['altText'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json({
      success: true,
      altText: parsed.altText || `${projectTitle || 'Project'} preview visual`,
    });
  } catch (err: any) {
    console.error('Error generating alt text:', err);
    const formatted = formatGeminiError(err, 'Failed to generate alt text.');
    res.status(formatted.status).json({ error: formatted.message });
  }
});

// 4. Admin Dedicated AI Assistant (/admin/ai & Dashboard Quick Assistant)
router.post('/chat-admin', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  const wantsStream = Boolean(req.body?.stream);

  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured. Please attach your API key in Settings > Secrets.',
      });
      return;
    }

    // Retrieve compact database summary concurrently for fastest response latency
    const [projectRows, serviceRows, siteSettings] = await Promise.all([
      query<{ title: string; category: string; status: string; tools: string }>(
        'SELECT title, category, status, tools FROM projects ORDER BY updatedAt DESC LIMIT 20'
      ),
      query<{ title: string; description: string }>(
        'SELECT title, description FROM services WHERE active = 1 ORDER BY orderIndex ASC'
      ),
      getAllSettings(),
    ]);

    const projectsSummary = projectRows
      .map((p) => `- ${p.title} [${p.category}, ${p.status}]`)
      .join('\n');
    const servicesSummary = serviceRows.map((s) => `- ${s.title}`).join('\n');
    const adminName = siteSettings.profile_name || req.user?.name || 'Johanna Uroh';

    const systemPrompt = `You are ${adminName}'s fast, dedicated Admin Content & Portfolio AI Specialist inside her CMS.
Help manage, write, format, brainstorm, and optimize portfolio content, case studies, project pitches, service packages, and SEO metadata.

PORTFOLIO SUMMARY:
Projects:
${projectsSummary || '- None yet'}
Active Services:
${servicesSummary || '- None yet'}

GUIDELINES:
- Answer directly, concisely, and quickly with actionable, copy-paste ready markdown when drafting copy.
- Strictly adhere to verified portfolio facts; do not fabricate awards, clients, or revenue statistics.`;

    const chat = ai.chats.create({
      model: FAST_TEXT_MODEL,
      config: {
        systemInstruction: systemPrompt,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
      history: Array.isArray(conversationHistory)
        ? conversationHistory.slice(-12).map((h: any) => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text || h.content || '' }],
          }))
        : [],
    });

    if (wantsStream) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      try {
        const streamResponse = await chat.sendMessageStream({ message: message.trim() });
        for await (const chunk of streamResponse) {
          const c = chunk as GenerateContentResponse;
          if (c.text) {
            res.write(`data: ${JSON.stringify({ chunk: c.text })}\n\n`);
          }
        }
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      } catch (streamErr: any) {
        console.error('Error streaming admin AI chat:', streamErr);
        const formatted = formatGeminiError(streamErr, 'AI Assistant encountered an error. Please try again.');
        res.write(`data: ${JSON.stringify({ error: formatted.message })}\n\n`);
        res.end();
      }
      return;
    }

    const response = await chat.sendMessage({ message: message.trim() });
    res.json({
      success: true,
      reply: response.text || "I'm here to assist with your portfolio content. How can I help?",
    });
  } catch (err: any) {
    console.error('Error in admin AI chat:', err);
    const formatted = formatGeminiError(err, 'AI Assistant encountered an error. Please try again.');
    if (wantsStream && res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: formatted.message })}\n\n`);
      res.end();
    } else {
      res.status(formatted.status).json({ error: formatted.message });
    }
  }
});

// 5. Public Website AI Assistant
router.post('/chat-public', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured.',
      });
      return;
    }

    // Retrieve ONLY verified public data concurrently
    const [publishedProjects, activeServices, publicExperience, siteSettings] = await Promise.all([
      query(
        `SELECT title, slug, shortDescription, category, tools, services, projectDate, projectUrl, githubUrl
         FROM projects WHERE status = 'PUBLISHED' ORDER BY featured DESC, publishedAt DESC`
      ),
      query(
        `SELECT title, description, features FROM services WHERE active = 1 ORDER BY orderIndex ASC`
      ),
      query(
        `SELECT role, organization, period, description, type FROM experience ORDER BY orderIndex ASC`
      ),
      getAllSettings(),
    ]);

    const ownerName = siteSettings.profile_name || 'Johanna Uroh';
    const ownerHeadline = siteSettings.profile_headline || 'Virtual Assistant & AI Digital Specialist';
    const ownerEmail = siteSettings.profile_email || 'urohjohanna25@gmail.com';

    const publicKnowledge = {
      portfolioOwner: ownerName,
      headline: ownerHeadline,
      coreCompetencies: [
        'AI & Prompt Engineering (Google AI Studio, ChatGPT)',
        'Modern Web Development (React, TypeScript, Tailwind CSS)',
        'Virtual Assistance & Executive Operations',
        'Financial Education & Content Strategy',
      ],
      contactEmail: ownerEmail,
      publishedProjects,
      activeServices,
      publicExperience,
    };

    const systemPrompt = `You are the friendly, helpful AI portfolio assistant on ${ownerName}'s official personal website.
Your role is to answer questions from visitors, potential clients, and collaborators about services, skills, portfolio projects, experience, and contact options.

VERIFIED KNOWLEDGE BASE (STRICT TRUTH):
${JSON.stringify(publicKnowledge)}

STRICT SAFETY & BEHAVIOR RULES:
1. ONLY answer using facts from the verified knowledge base above. NEVER invent projects, clients, awards, or statistics.
2. If a visitor asks about something not in the portfolio or you do not know the answer, politely state:
   "I don't have that specific detail in the portfolio, but you can reach out directly via the Contact section to discuss your project!"
3. NEVER reveal confidential admin information, drafts, passwords, unpublished work, or internal system configurations.
4. Keep answers concise, warm, professional, and easy to read (1-3 brief paragraphs or scannable bullet points).`;

    const chat = ai.chats.create({
      model: FAST_TEXT_MODEL,
      config: {
        systemInstruction: systemPrompt,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
      history: Array.isArray(conversationHistory)
        ? conversationHistory.slice(-10).map((h: any) => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text || h.content || '' }],
          }))
        : [],
    });

    const response = await chat.sendMessage({ message: message.trim() });
    res.json({
      success: true,
      reply: response.text || "I'd be happy to share more! Would you like to check out the projects or get in touch?",
      suggestedAction: '/contact',
    });
  } catch (err: any) {
    console.error('Error in public AI chat:', err);
    const formatted = formatGeminiError(err, 'AI chat request failed.');
    res.status(formatted.status).json({ error: formatted.message });
  }
});

export default router;
