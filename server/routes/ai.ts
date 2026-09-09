import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { authenticateAdmin, AuthRequest } from '../auth.js';
import { query, queryOne } from '../db.js';

const router = express.Router();

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

// 1. Generate Project Descriptions & Meta (Admin Only)
router.post('/generate-project-details', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, category, tools, clientName, existingInfo, requestedField } = req.body;

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

    const userPrompt = `Project Title: ${title}
Category: ${category || 'General'}
Tools & Technologies: ${Array.isArray(tools) ? tools.join(', ') : tools || 'Not specified'}
Client / Context: ${clientName || 'Portfolio demonstration / Client project'}
Additional Details Provided by Johanna: ${existingInfo || 'None provided'}
Target Specific Field (if any): ${requestedField || 'all'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
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
          ],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Error generating project details with Gemini:', err);
    res.status(500).json({
      error: 'AI generation failed. Please try again or refine your input.',
      details: err?.message,
    });
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
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an elite editorial assistant for executive portfolios. Never invent facts. Return valid JSON only.',
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
    res.status(500).json({ error: 'AI text transformation failed. Please try again.' });
  }
});

// 3. Generate Image Alt Text (Admin Only)
router.post('/generate-alt-text', authenticateAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { imageUrl, projectTitle, filename, context } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured.',
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
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
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
    res.status(500).json({ error: 'Failed to generate alt text.' });
  }
});

// 4. Admin Dedicated AI Assistant (/admin/ai)
router.post('/chat-admin', authenticateAdmin, async (req: AuthRequest, res: Response) => {
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

    // Retrieve database summary for Johanna to assist accurately
    const projectRows = await query('SELECT title, slug, category, status, featured, tools FROM projects');
    const serviceRows = await query('SELECT title, features FROM services WHERE active = 1');

    const contextData = {
      projects: projectRows,
      services: serviceRows,
      adminName: req.user?.name || 'Johanna Uroh',
    };

    const systemPrompt = `You are Johanna Uroh's dedicated Admin Content & Portfolio AI Specialist inside her CMS (/admin/ai).
You help Johanna manage, write, format, brainstorm, and optimize her portfolio content, case studies, project pitches, service packages, and SEO metadata.

CURRENT PORTFOLIO REPOSITORY SUMMARY:
${JSON.stringify(contextData, null, 2)}

GUIDELINES:
- Offer actionable, high-quality suggestions for case study structures, tags, client pitch emails, and project descriptions.
- Strictly adhere to verified data in the portfolio; do not fabricate awards or revenue statistics.
- If Johanna asks for draft case studies or service ideas, provide clear, copy-paste ready markdown.`;

    const chat = ai.chats.create({
      model: 'gemini-3.8-flash',
      config: {
        systemInstruction: systemPrompt,
      },
      history: Array.isArray(conversationHistory)
        ? conversationHistory.map((h: any) => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text || h.content || '' }],
          }))
        : [],
    });

    const response = await chat.sendMessage({ message: message.trim() });
    res.json({
      success: true,
      reply: response.text || "I'm here to assist with your portfolio content. How can I help?",
    });
  } catch (err: any) {
    console.error('Error in admin AI chat:', err);
    res.status(500).json({ error: 'AI Assistant encountered an error. Please try again.' });
  }
});

// 5. Public Website AI Assistant (Bottom-Right Widget)
router.post('/chat-public', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.json({
        success: true,
        reply: "Johanna's AI assistant is currently warming up. In the meantime, please feel free to reach out directly via the Contact section or email her at urohjohanna25@gmail.com!",
        suggestedAction: '/contact',
      });
      return;
    }

    // Retrieve ONLY verified public data (ONLY PUBLISHED projects, active services, public experience)
    const publishedProjects = await query(
      `SELECT title, slug, shortDescription, category, tools, services, projectDate, projectUrl, githubUrl
       FROM projects WHERE status = 'PUBLISHED' ORDER BY featured DESC, publishedAt DESC`
    );

    const activeServices = await query(
      `SELECT title, description, features FROM services WHERE active = 1 ORDER BY orderIndex ASC`
    );

    const publicExperience = await query(
      `SELECT role, organization, period, description, type FROM experience ORDER BY orderIndex ASC`
    );

    const publicKnowledge = {
      portfolioOwner: 'Johanna Uroh',
      headline: 'Virtual Assistant & AI Digital Specialist',
      coreCompetencies: [
        'AI & Prompt Engineering (Google AI Studio, ChatGPT)',
        'Modern Web Development (React, TypeScript, Tailwind CSS)',
        'Virtual Assistance & Executive Operations',
        'Financial Education & Content Strategy',
      ],
      contactEmail: 'urohjohanna25@gmail.com',
      publishedProjects,
      activeServices,
      publicExperience,
    };

    const systemPrompt = `You are the friendly, helpful AI portfolio assistant on Johanna Uroh's official personal website.
Your role is to answer questions from visitors, potential clients, and collaborators about Johanna's services, skills, portfolio projects, experience, and contact options.

VERIFIED KNOWLEDGE BASE (STRICT TRUTH):
${JSON.stringify(publicKnowledge, null, 2)}

STRICT SAFETY & BEHAVIOR RULES:
1. ONLY answer using facts from the verified knowledge base above. NEVER invent projects, clients, awards, or statistics.
2. If a visitor asks about something not in Johanna's portfolio or you do not know the answer, politely state:
   "I don't have that specific detail in Johanna's portfolio, but you can message her directly via the Contact section to discuss your project!"
3. NEVER reveal confidential admin information, drafts, passwords, unpublished work, or internal system configurations.
4. When relevant, invite the visitor to explore her work or click "Work With Johanna" / visit her contact page.
5. Keep answers concise, warm, professional, and easy to read (1-3 brief paragraphs or scannable bullet points).`;

    const chat = ai.chats.create({
      model: 'gemini-3.8-flash',
      config: {
        systemInstruction: systemPrompt,
      },
      history: Array.isArray(conversationHistory)
        ? conversationHistory.map((h: any) => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text || h.content || '' }],
          }))
        : [],
    });

    const response = await chat.sendMessage({ message: message.trim() });
    res.json({
      success: true,
      reply: response.text || "I'd be happy to share more about Johanna's work! Would you like to check out her projects or get in touch?",
      suggestedAction: '/contact',
    });
  } catch (err: any) {
    console.error('Error in public AI chat:', err);
    res.json({
      success: true,
      reply: "Thank you for visiting! You can explore Johanna's published projects on the Work page or reach her directly using the Contact form.",
      suggestedAction: '/contact',
    });
  }
});

export default router;
