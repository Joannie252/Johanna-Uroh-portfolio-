import crypto from 'crypto';
import { execute, queryOne } from './db.js';
import { hashPassword } from './auth.js';

export async function seedDatabase(): Promise<void> {
  // Check if admin user exists
  const existingAdmin = await queryOne('SELECT id FROM users LIMIT 1');
  if (!existingAdmin) {
    console.log('Seeding initial admin user for Johanna Uroh...');
    const adminEmail = process.env.ADMIN_EMAIL || 'urohjohanna25@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'johanna2026!';
    const passwordHash = await hashPassword(adminPassword);
    const userId = crypto.randomUUID();
    const now = new Date().toISOString();

    await execute(
      `INSERT INTO users (id, email, passwordHash, name, role, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, adminEmail, passwordHash, 'Johanna Uroh', 'admin', now]
    );
    console.log(`Admin account created for: ${adminEmail}`);
  }

  // Check if projects exist
  const existingProjects = await queryOne('SELECT id FROM projects LIMIT 1');
  if (!existingProjects) {
    console.log('Seeding initial sample projects (clearly marked as sample/demo data)...');
    const now = new Date().toISOString();

    const sampleProjects = [
      {
        id: crypto.randomUUID(),
        title: 'AI-Powered Research & Workflow Assistant',
        slug: 'ai-powered-research-workflow-assistant',
        shortDescription: 'Custom AI agent workflows and structured prompt pipelines designed to synthesize research and streamline executive decision-making.',
        description: 'Developed an end-to-end intelligent research assistant that integrates customized LLM prompt templates, document extraction, and rapid synthesis for busy professionals.',
        category: 'AI',
        services: JSON.stringify(['AI & Prompt Engineering', 'Virtual Assistance']),
        tools: JSON.stringify(['Google AI Studio', 'ChatGPT', 'React', 'TypeScript', 'Notion']),
        clientName: 'Sample / Demo Project',
        projectDate: 'January 2026',
        projectUrl: 'https://example.com/demo-ai-assistant',
        githubUrl: 'https://github.com/johannauroh/ai-research-assistant',
        coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
        images: JSON.stringify([
          {
            id: crypto.randomUUID(),
            url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
            alt: 'AI Workflow Dashboard',
            orderIndex: 0
          },
          {
            id: crypto.randomUUID(),
            url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
            alt: 'Analytics & Prompt Pipeline',
            orderIndex: 1
          }
        ]),
        caseStudy: 'A comprehensive study on integrating generative AI into daily executive workflows to reduce manual research hours by over 60%.',
        challenge: 'Executives spent hours manually parsing lengthy industry PDFs, transcribing meetings, and creating structured action summaries.',
        solution: 'Built automated multi-stage prompt chains and a clean interface allowing instant document ingestion, key-takeaway summarization, and task extraction.',
        process: '1. Requirement gathering & workflow mapping.\n2. Prompt architecture & zero-shot/few-shot testing in Google AI Studio.\n3. Frontend interface build with responsive layout.\n4. User testing & feedback iteration.',
        result: 'Achieved high accuracy document synthesis, reducing research time from 4 hours to under 30 minutes per topic.',
        featured: 1,
        status: 'PUBLISHED',
        tags: JSON.stringify(['AI', 'Automation', 'Productivity', 'Prompt Engineering']),
        seoTitle: 'AI-Powered Research & Workflow Assistant | Johanna Uroh',
        seoDescription: 'Case study of an AI-driven workflow assistant created by Johanna Uroh.',
        createdAt: now,
        updatedAt: now,
        publishedAt: now
      },
      {
        id: crypto.randomUUID(),
        title: 'Modern Brand Digital Platform',
        slug: 'modern-brand-digital-platform',
        shortDescription: 'High-performance, accessible web platform built with React, Vite, and Tailwind with custom interactive components.',
        description: 'Designed and built a sleek, dynamic web application focusing on refined typography, mobile responsiveness, and intuitive navigation.',
        category: 'Web Development',
        services: JSON.stringify(['Website Development', 'Vibe Coding']),
        tools: JSON.stringify(['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Canva']),
        clientName: 'Sample / Demo Project',
        projectDate: 'December 2025',
        projectUrl: 'https://example.com/brand-platform',
        githubUrl: 'https://github.com/johannauroh/brand-platform',
        coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
        images: JSON.stringify([
          {
            id: crypto.randomUUID(),
            url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
            alt: 'Digital Platform Mockup',
            orderIndex: 0
          }
        ]),
        caseStudy: 'Crafting a high-conversion digital presence using modern frontend standards and intentional micro-interactions.',
        challenge: 'The brand lacked a cohesive digital identity and suffered from slow load times and confusing navigation on mobile devices.',
        solution: 'Re-engineered the interface from the ground up with responsive layouts, accessible color contrast, and fast client-side navigation.',
        process: 'Discovery -> UI wireframing -> Component architecture -> Rapid vibe coding -> Performance profiling.',
        result: 'Delivered a lighthouse score of 98+ and seamless cross-device compatibility.',
        featured: 1,
        status: 'PUBLISHED',
        tags: JSON.stringify(['Frontend', 'Web Development', 'UI/UX', 'Performance']),
        seoTitle: 'Modern Brand Digital Platform | Johanna Uroh',
        seoDescription: 'Web application case study by Johanna Uroh.',
        createdAt: now,
        updatedAt: now,
        publishedAt: now
      },
      {
        id: crypto.randomUUID(),
        title: 'Executive Virtual Operations & Calendar System',
        slug: 'executive-virtual-operations-calendar-system',
        shortDescription: 'Comprehensive executive virtual assistance setup: inbox zero protocol, calendar orchestration, and client communication playbook.',
        description: 'Implemented a streamlined virtual assistance framework for executive leaders, managing high-volume email traffic, confidential scheduling, and travel logistics.',
        category: 'Virtual Assistance',
        services: JSON.stringify(['Virtual Assistance', 'Content Strategy']),
        tools: JSON.stringify(['Google Workspace', 'Notion', 'Microsoft Office', 'Slack', 'Canva']),
        clientName: 'Sample / Demo Project',
        projectDate: 'November 2025',
        projectUrl: '',
        githubUrl: '',
        coverImage: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1200&auto=format&fit=crop',
        images: JSON.stringify([
          {
            id: crypto.randomUUID(),
            url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1200&auto=format&fit=crop',
            alt: 'Executive Workspace',
            orderIndex: 0
          }
        ]),
        caseStudy: 'Virtual support architecture that restored 15+ hours weekly to C-level founders.',
        challenge: 'Double bookings, missed vendor communications, and chaotic project tracking across scattered spreadsheets.',
        solution: 'Consolidated task tracking into Notion databases and synchronized Google Calendar with buffer blocks and standardized response templates.',
        process: 'Audit existing bottlenecks -> Establish triage filters -> Build master Notion dashboard -> Onboard leadership team.',
        result: 'Maintained Inbox Zero daily and eliminated calendar scheduling conflicts entirely.',
        featured: 0,
        status: 'PUBLISHED',
        tags: JSON.stringify(['Virtual Assistant', 'Executive Support', 'Operations']),
        seoTitle: 'Executive Virtual Operations | Johanna Uroh',
        seoDescription: 'Virtual assistance workflow management case study.',
        createdAt: now,
        updatedAt: now,
        publishedAt: now
      },
      {
        id: crypto.randomUUID(),
        title: 'Interactive Financial Literacy Starter Kit',
        slug: 'interactive-financial-literacy-starter-kit',
        shortDescription: 'Educational budgeting calculators, debt payoff visualizations, and student financial wellness guide.',
        description: 'An upcoming interactive educational toolkit helping young adults understand personal budgeting, compound interest, and savings habits.',
        category: 'Financial Education',
        services: JSON.stringify(['Financial Education', 'Digital Skills Training']),
        tools: JSON.stringify(['React', 'TypeScript', 'Google AI Studio', 'Canva']),
        clientName: 'Personal Initiative (In Progress)',
        projectDate: 'February 2026',
        projectUrl: '',
        githubUrl: '',
        coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200&auto=format&fit=crop',
        images: JSON.stringify([]),
        caseStudy: 'Draft project currently being authored by Johanna in the CMS.',
        challenge: 'Demystifying financial terms for students entering the workforce.',
        solution: 'Interactive micro-calculators and step-by-step digital visual guides.',
        process: 'Researching curriculum and building simulation models.',
        result: 'In active draft development.',
        featured: 0,
        status: 'DRAFT', // Deliberately DRAFT to demonstrate CMS draft functionality!
        tags: JSON.stringify(['Finance', 'Education', 'Interactive', 'Draft']),
        seoTitle: 'Financial Literacy Starter Kit | Johanna Uroh',
        seoDescription: 'Financial education guide and interactive toolkit.',
        createdAt: now,
        updatedAt: now,
        publishedAt: null
      }
    ];

    for (const p of sampleProjects) {
      await execute(
        `INSERT INTO projects (
          id, title, slug, shortDescription, description, category,
          services, tools, clientName, projectDate, projectUrl, githubUrl,
          coverImage, images, caseStudy, challenge, solution, process,
          result, featured, status, tags, seoTitle, seoDescription,
          createdAt, updatedAt, publishedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.id, p.title, p.slug, p.shortDescription, p.description, p.category,
          p.services, p.tools, p.clientName, p.projectDate, p.projectUrl, p.githubUrl,
          p.coverImage, p.images, p.caseStudy, p.challenge, p.solution, p.process,
          p.result, p.featured, p.status, p.tags, p.seoTitle, p.seoDescription,
          p.createdAt, p.updatedAt, p.publishedAt
        ]
      );
    }
  }

  // Check if services exist
  const existingServices = await queryOne('SELECT id FROM services LIMIT 1');
  if (!existingServices) {
    console.log('Seeding initial services...');
    const now = new Date().toISOString();
    const services = [
      {
        id: crypto.randomUUID(),
        title: 'Virtual Assistance',
        description: 'Comprehensive administrative, organizational, and executive support ensuring seamless daily operations.',
        icon: 'briefcase',
        features: JSON.stringify([
          'Executive Calendar & Meeting Management',
          'Email Triage & Inbox Zero Protocols',
          'Travel Logistics & Itinerary Planning',
          'Data Organization & Document Preparation'
        ]),
        orderIndex: 0,
        active: 1
      },
      {
        id: crypto.randomUUID(),
        title: 'AI & Prompt Engineering',
        description: 'Harnessing generative AI models and custom prompting frameworks to automate repetitive workflows.',
        icon: 'sparkles',
        features: JSON.stringify([
          'Custom System Prompt Design & Evaluation',
          'Workflow Automation with Google AI Studio & ChatGPT',
          'AI-Assisted Research & Knowledge Synthesis',
          'AI Integration Roadmaps for Small Teams'
        ]),
        orderIndex: 1,
        active: 1
      },
      {
        id: crypto.randomUUID(),
        title: 'Website Development & Vibe Coding',
        description: 'Building modern, fast, and accessible digital websites from concept to full launch.',
        icon: 'code',
        features: JSON.stringify([
          'Modern React & TypeScript Single Page Apps',
          'Custom CMS-driven Portfolio & Business Sites',
          'Rapid Prototyping & Interactive UI Design',
          'Mobile-First Responsive Layouts'
        ]),
        orderIndex: 2,
        active: 1
      },
      {
        id: crypto.randomUUID(),
        title: 'Content Strategy & Copywriting',
        description: 'Crafting persuasive, well-structured written and visual content across digital channels.',
        icon: 'file-text',
        features: JSON.stringify([
          'Editorial Calendar Creation',
          'Long-Form Article & Case Study Writing',
          'Social Media Copywriting & Micro-content',
          'Brand Voice Guidelines'
        ]),
        orderIndex: 3,
        active: 1
      },
      {
        id: crypto.randomUUID(),
        title: 'Digital Skills Training',
        description: 'Empowering individuals and teams with practical technical skills and modern productivity software.',
        icon: 'graduation-cap',
        features: JSON.stringify([
          'Google Workspace & Productivity Tools Coaching',
          'Practical AI Tools Training for Beginners',
          'Notion Workspace Architecture Setup',
          'Self-Paced Guides & Video Walkthroughs'
        ]),
        orderIndex: 4,
        active: 1
      },
      {
        id: crypto.randomUUID(),
        title: 'Financial Education',
        description: 'Accessible, relatable financial literacy concepts and budgeting principles for young adults.',
        icon: 'trending-up',
        features: JSON.stringify([
          'Personal Budgeting Frameworks',
          'Savings & Emergency Fund Roadmaps',
          'Debt Payoff Strategy Walkthroughs',
          'Interactive Calculation Tools'
        ]),
        orderIndex: 5,
        active: 1
      }
    ];

    for (const s of services) {
      await execute(
        `INSERT INTO services (id, title, description, icon, features, orderIndex, active, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [s.id, s.title, s.description, s.icon, s.features, s.orderIndex, s.active, now]
      );
    }
  }

  // Check testimonials
  const existingTestimonials = await queryOne('SELECT id FROM testimonials LIMIT 1');
  if (!existingTestimonials) {
    console.log('Seeding initial demo testimonials (clearly marked as sample data)...');
    const now = new Date().toISOString();
    const testimonials = [
      {
        id: crypto.randomUUID(),
        clientName: 'Sample Client (Demo)',
        role: 'Founder & CEO',
        company: 'Demo Agency',
        content: 'Johanna took our chaotic digital schedules and completely revolutionized how our team handles executive communications. Efficient, proactive, and exceptionally skilled with AI tools.',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        rating: 5,
        projectTitle: 'Executive Operations & Calendar System',
        active: 1,
        isDemo: 1
      },
      {
        id: crypto.randomUUID(),
        clientName: 'Creative Director (Demo)',
        role: 'Lead Strategist',
        company: 'Demo Studio',
        content: 'Her ability to pair practical virtual assistance with modern vibe coding and prompt engineering makes her a rare powerhouse. Highly recommended!',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
        rating: 5,
        projectTitle: 'Modern Brand Digital Platform',
        active: 1,
        isDemo: 1
      }
    ];

    for (const t of testimonials) {
      await execute(
        `INSERT INTO testimonials (id, clientName, role, company, content, avatarUrl, rating, projectTitle, active, isDemo, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [t.id, t.clientName, t.role, t.company, t.content, t.avatarUrl, t.rating, t.projectTitle, t.active, t.isDemo, now]
      );
    }
  }

  // Check experience & education
  const existingExp = await queryOne('SELECT id FROM experience LIMIT 1');
  if (!existingExp) {
    console.log('Seeding experience & education items...');
    const now = new Date().toISOString();
    const items = [
      {
        id: crypto.randomUUID(),
        role: 'Virtual Assistant & Digital Specialist',
        organization: 'Independent Practice / Freelance',
        period: '2023 - Present',
        description: 'Providing strategic executive support, prompt engineering workflows, and frontend web development for businesses and creative professionals.',
        orderIndex: 0,
        type: 'experience'
      },
      {
        id: crypto.randomUUID(),
        role: 'AI & Digital Productivity Lead',
        organization: 'Digital Projects & Consulting',
        period: '2024 - Present',
        description: 'Designing AI-integrated systems using Google AI Studio and ChatGPT to accelerate content strategy and task turnaround times.',
        orderIndex: 1,
        type: 'experience'
      },
      {
        id: crypto.randomUUID(),
        role: 'Digital Skills & Technology Training',
        organization: 'Professional Certification & Coursework',
        period: '2023 - 2025',
        description: 'Intensive coursework in Modern Web Development (React, TypeScript), Prompt Engineering, and Executive Virtual Operations.',
        orderIndex: 0,
        type: 'education'
      }
    ];

    for (const item of items) {
      await execute(
        `INSERT INTO experience (id, role, organization, period, description, orderIndex, type, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [item.id, item.role, item.organization, item.period, item.description, item.orderIndex, item.type, now]
      );
    }
  }

  // Seed default site settings if not present
  const existingSettings = await queryOne('SELECT key FROM site_settings LIMIT 1');
  if (!existingSettings) {
    console.log('Seeding initial site settings & configuration...');
    const now = new Date().toISOString();
    const defaultSettings: Array<[string, string]> = [
      ['profile_name', 'Johanna Uroh'],
      ['profile_headline', 'Virtual Assistant & AI Digital Specialist'],
      ['profile_bio', "I turn ideas into useful digital solutions. Exploring the intersection of generative AI, high-impact web design, content strategy, and executive digital operations."],
      ['profile_picture', '/uploads/johanna_uroh_avatar.jpg'],
      ['profile_email', process.env.ADMIN_EMAIL || 'urohjohanna25@gmail.com'],
      ['profile_socials', JSON.stringify({
        linkedin: 'https://linkedin.com',
        github: 'https://github.com',
        twitter: 'https://twitter.com'
      })],
      ['email_notifications', 'true'],
      ['notify_contact_message', 'true'],
      ['notify_project_published', 'true'],
      ['notify_project_updated', 'false'],
      ['notify_blog_post', 'false'],
      ['notify_system_alerts', 'true'],
      ['notification_email', process.env.ADMIN_EMAIL || 'urohjohanna25@gmail.com'],
      ['ai_features_enabled', 'true'],
      ['analytics_enabled', 'true'],
      ['animation_intensity', 'Full'], // 'Full' | 'Reduced' | 'Off'
      ['default_project_category', 'All'],
      ['featured_count_limit', '3'],
      ['items_per_page', '6'],
    ];

    for (const [k, v] of defaultSettings) {
      await execute(
        'INSERT INTO site_settings (key, value, updatedAt) VALUES (?, ?, ?)',
        [k, v, now]
      );
    }

    // Seed initial activity log
    const activityId = crypto.randomUUID();
    await execute(
      `INSERT INTO activity_logs (id, action, entityType, entityId, entityTitle, adminEmail, details, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        activityId,
        'SYSTEM_INITIALIZED',
        'system',
        'core',
        'System Initialization',
        process.env.ADMIN_EMAIL || 'urohjohanna25@gmail.com',
        'Portfolio system initialized with default settings, security policies, and CMS structure.',
        now
      ]
    );
  }

  // Check if products exist
  const existingProducts = await queryOne('SELECT id FROM products LIMIT 1');
  if (!existingProducts) {
    console.log('Seeding initial sample digital products (clearly identifiable demo educational resources)...');
    const now = new Date().toISOString();

    const sampleProducts = [
      {
        id: crypto.randomUUID(),
        title: 'The Executive Virtual Assistant & AI Playbook',
        slug: 'executive-va-ai-playbook',
        shortDescription: 'A practical, field-tested guide on integrating generative AI into modern executive assistance and workflow operations.',
        fullDescription: `# The Executive Virtual Assistant & AI Playbook\n\nDesigned specifically for ambitious virtual assistants, digital coordinators, and project managers looking to elevate their standard workflows with cutting-edge AI systems.\n\nThis comprehensive playbook breaks down everyday administrative friction into streamlined, repeatable AI pipelines—empowering you to deliver 10x the output in half the time.\n\n### Core Highlights:\n- Executive calendar & email triage prompt matrices\n- Meeting intelligence: converting transcripts into executive summaries and action items\n- Confidentiality & safety guidelines when handling sensitive executive data\n- Reusable prompt snippets for instant deployment`,
        coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop',
        category: 'Guides & Playbooks',
        price: 29,
        currency: 'USD',
        whatYouWillLearn: JSON.stringify([
          'Master executive prompt engineering for email triage and scheduling',
          'Automate synthesis of lengthy reports, PDFs, and meeting recordings',
          'Implement reliable confidentiality and data safety protocols',
          'Position yourself as a modern, high-value AI-augmented specialist'
        ]),
        targetAudience: JSON.stringify([
          'Virtual Assistants looking to modernize their skillset',
          'Executive Assistants and Operations Coordinators',
          'Freelancers managing multi-client workflows'
        ]),
        whatIncluded: JSON.stringify([
          '82-page downloadable PDF Playbook',
          '45+ copy-paste executive AI prompt templates',
          'Workflow checklist and SOP cheat sheet',
          'Lifetime access to guide updates and errata'
        ]),
        previewUrl: 'https://example.com/preview/executive-va-playbook.pdf',
        purchaseUrl: 'https://gumroad.com',
        featured: 1,
        published: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        id: crypto.randomUUID(),
        title: 'Notion Workflow OS for Digital Specialists',
        slug: 'notion-workflow-os-digital-specialists',
        shortDescription: 'All-in-one Notion workspace engineered to manage client projects, digital deliverables, content pipelines, and administrative tasks.',
        fullDescription: `# Notion Workflow OS for Digital Specialists\n\nA centralized, aesthetic, and battle-tested Notion operating system configured to handle the entire lifecycle of client engagements.\n\nStop juggling fragmented spreadsheets, scattered notes, and missing links. This system brings your project tracker, CRM, deliverable checklists, and resource library together into one cohesive workspace.\n\n### What Makes It Special:\n- Fully connected relational databases (Clients ↔ Projects ↔ Tasks ↔ Deliverables)\n- Pre-built client onboarding dashboard that you can share directly with clients\n- Clean minimal aesthetics optimized for both light and dark mode\n- Includes video walkthrough and setup instructions`,
        coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop',
        category: 'Templates',
        price: 39,
        currency: 'USD',
        whatYouWillLearn: JSON.stringify([
          'Structure and maintain a professional freelance or agency CRM',
          'Track multi-phase projects and milestones with minimal friction',
          'Deploy shared client portals that impress stakeholders',
          'Streamline daily focus using prioritized task views'
        ]),
        targetAudience: JSON.stringify([
          'Freelance digital specialists & consultants',
          'Virtual assistants managing client portfolios',
          'Creative professionals seeking organized project delivery'
        ]),
        whatIncluded: JSON.stringify([
          'Full Notion Template with one-click duplication',
          'Client Portal dashboard template',
          '15-minute video walkthrough & setup tutorial',
          'Pre-configured relational databases and views'
        ]),
        previewUrl: 'https://notion.so',
        purchaseUrl: 'https://gumroad.com',
        featured: 1,
        published: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        id: crypto.randomUUID(),
        title: 'Practical Prompt Engineering Handbook',
        slug: 'practical-prompt-engineering-handbook',
        shortDescription: 'Essential handbook and cheat sheets for mastering structured prompting across ChatGPT, Claude, and Google AI Studio.',
        fullDescription: `# Practical Prompt Engineering Handbook\n\nDemystify prompt engineering with actionable frameworks rather than vague theory. This handbook teaches you how to construct zero-shot, few-shot, and chain-of-thought prompts that yield consistent, high-fidelity responses.\n\nWhether you are drafting client communications, formatting structured JSON data, or generating creative campaign concepts, these recipes eliminate hallucination and guesswork.\n\n### Included Frameworks:\n- The R-C-O-F Framework (Role, Context, Objective, Format)\n- Chain-of-Density summarization techniques\n- Formatting enforcement for tabular and structured outputs\n- Handling edge cases and minimizing hallucination`,
        coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop',
        category: 'Ebooks & Handouts',
        price: 19,
        currency: 'USD',
        whatYouWillLearn: JSON.stringify([
          'Construct reliable prompt frameworks for repeatable business tasks',
          'Leverage few-shot examples for consistent tone and syntax',
          'Extract structured insights from messy transcripts and raw notes',
          'Troubleshoot and refine outputs when models deviate'
        ]),
        targetAudience: JSON.stringify([
          'Professionals seeking practical, day-to-day AI fluency',
          'Content creators, researchers, and technical writers',
          'Virtual team leaders optimizing prompt libraries'
        ]),
        whatIncluded: JSON.stringify([
          '60-page PDF Handbook (EPUB & PDF formats included)',
          'Printable 2-page Quick Reference Cheat Sheet',
          'Notion prompt library with 60+ categorized templates',
          'Direct community forum access for Q&A'
        ]),
        previewUrl: 'https://example.com/preview/prompt-handbook-sample.pdf',
        purchaseUrl: 'https://gumroad.com',
        featured: 1,
        published: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        id: crypto.randomUUID(),
        title: 'Client Onboarding & Project SOP Kit',
        slug: 'client-onboarding-project-sop-kit',
        shortDescription: 'Standard Operating Procedures (SOPs), email scripts, intake forms, and kick-off agendas for seamless client kickoff.',
        fullDescription: `# Client Onboarding & Project SOP Kit\n\nFirst impressions determine the trajectory of every client relationship. This turnkey kit gives you every template, questionnaire, agreement checklist, and email sequence required to deliver a polished onboarding experience.\n\nTested across dozens of client engagements, these SOPs clarify expectations, establish communication boundaries, and build trust from day one.\n\n### Key Assets Inside:\n- Intake questionnaire templates (Google Forms & Notion format)\n- 5-part email kickoff sequence with boundary setting templates\n- Project kickoff call slide deck and agenda template\n- Offboarding checklist and testimonial collection sequence`,
        coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop',
        category: 'Templates',
        price: 24,
        currency: 'USD',
        whatYouWillLearn: JSON.stringify([
          'Execute a professional client intake without back-and-forth emails',
          'Establish project scope, timelines, and communication expectations',
          'Run effective 30-minute project kickoff meetings',
          'Collect 5-star testimonials systematically upon project wrap-up'
        ]),
        targetAudience: JSON.stringify([
          'Service providers, freelancers, and agency owners',
          'Specialists stepping up to enterprise or high-ticket clients',
          'Anyone experiencing scope creep and disorganized kickoffs'
        ]),
        whatIncluded: JSON.stringify([
          'Google Docs & Word editable SOP templates',
          'Client Intake questionnaire form template',
          '10 ready-to-send client communication email scripts',
          'Kickoff meeting slide deck presentation (Keynote & Canva links)'
        ]),
        previewUrl: undefined,
        purchaseUrl: 'https://gumroad.com',
        featured: 0,
        published: 1,
        createdAt: now,
        updatedAt: now
      }
    ];

    for (const p of sampleProducts) {
      await execute(
        `INSERT INTO products (
          id, title, slug, shortDescription, fullDescription, coverImage,
          category, price, currency, whatYouWillLearn, targetAudience,
          whatIncluded, previewUrl, purchaseUrl, featured, published,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.id,
          p.title,
          p.slug,
          p.shortDescription,
          p.fullDescription,
          p.coverImage,
          p.category,
          p.price,
          p.currency,
          p.whatYouWillLearn,
          p.targetAudience,
          p.whatIncluded,
          p.previewUrl || null,
          p.purchaseUrl,
          p.featured,
          p.published,
          p.createdAt,
          p.updatedAt
        ]
      );
    }
    console.log('Sample digital products seeded successfully.');
  }
}
