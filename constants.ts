import type { Prompt } from './types';
import { PromptType } from './types';

export const PROMPTS: Prompt[] = [
  {
    id: 1,
    icon: '🔎',
    title: {
      sk: 'Lokálny SERP & Content Gap Sken',
      en: 'Local SERP & Content Gap Scan'
    },
    timestamp: {
      sk: 'pripravené',
      en: 'ready'
    },
    content: `You are an SEO analyst. For keyword "{{primary_keyword}}" in city "{{city}}", audit the top-10 Google SERP. 
Return JSON array with: rank, url, title, word_count, main_topics[], content_gaps[], intent(info/comm/local), link_profile(DR≈, RD≈), notes.
Then output a "quick_wins" list (≤5) for "{{domain}}" with fields: task, impact(1-5), effort(1-5), why_it_works.`,
    type: PromptType.New,
  },
  {
    id: 2,
    icon: '⚙️',
    title: {
      sk: 'Rank Math Nastavenia + Schema Balík',
      en: 'Rank Math Setup + Schema Pack'
    },
    timestamp: {
      sk: 'pred 15 min',
      en: '15 min ago'
    },
    content: `Act as a WordPress SEO engineer. For brand "{{brand}}", domain "{{domain}}", address "{{address}}", phone "{{phone}}":
1) Generate Rank Math recommended config (as JSON diff or checklist).
2) Output JSON-LD for Organization + LocalBusiness + Service (sk-SK), including geo, openingHours, sameAs.
3) Provide robots.txt and sitemap hints; canonical/HTTPS rules (Nginx + Apache variants) with exact snippets.
4) List 3 safety checks to avoid duplicate meta & schema.`,
    type: PromptType.Urgent,
  },
  {
    id: 3,
    icon: '📝',
    title: {
      sk: 'Long-form Content Brief (sk-SK)',
      en: 'Long-form Content Brief (en-US)'
    },
    timestamp: {
      sk: 'pred 1 h',
      en: '1 hr ago'
    },
    content: `Create an 1 800-word article brief for "{{primary_keyword}}" (locale sk-SK).
Deliver: 
• Title options (CTR-focused) • Outline H1-H3 • PAA questions • Entities (EN/SK) • Internal_link_targets (slugs) • External_sources (3-5, trustworthy) • CTA ideas.
Append: FAQ schema (JSON-LD) + a CSV line: title, meta_title(60), meta_description(155), slug, canonical, h1.`,
    type: PromptType.Success,
  },
  {
    id: 4,
    icon: '⚡',
    title: {
      sk: 'CWV Fix Blueprint (Next.js/React)',
      en: 'CWV Fix Blueprint (Next.js/React)'
    },
    timestamp: {
      sk: 'pred 2 h',
      en: '2 hrs ago'
    },
    content: `Given URL "{{url}}" and stack "{{stack}}", propose code-level fixes to achieve LCP ≤ 1.8s, CLS < 0.1, INP < 200ms.
Output a table: metric, current(est), target, fixes(code), priority, est_gain.
Include snippets for: font preloads, next/image sizing, critical CSS, route-level dynamic import, cache headers, and a sample Lighthouse CI YAML.`,
    type: PromptType.Default,
  },
  {
    id: 5,
    icon: '📍',
    title: {
      sk: 'Google Business Profile • Local Pack',
      en: 'Google Business Profile • Local Pack'
    },
    timestamp: {
      sk: 'pred 3 h',
      en: '3 hrs ago'
    },
    content: `Prepare a GBP optimization package for "{{brand}}" (category "{{primary_category}}").
Return: primary/secondary categories, services list, 5 weekly post drafts (title, copy, CTA, photo_idea), Q&A (10), review reply templates (positive/neutral/negative), UTM scheme for links, and a NAP consistency checklist (site, schema, citations).`,
    type: PromptType.Default,
  },
];
