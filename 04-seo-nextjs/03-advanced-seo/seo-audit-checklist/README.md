# SEO Audit Checklist

## Table of Contents

1. [Introduction](#introduction)
2. [Technical SEO Audit](#technical-seo-audit)
3. [On-Page SEO Audit](#on-page-seo-audit)
4. [Off-Page SEO Audit](#off-page-seo-audit)
5. [Content Audit](#content-audit)
6. [Performance Audit](#performance-audit)
7. [Mobile Audit](#mobile-audit)
8. [Tools](#tools)
9. [Monitoring](#monitoring)
10. [Common Issues & Remediation](#common-issues--remediation)
11. [Scoring System](#scoring-system)
12. [Best Practices](#best-practices)

---

## Introduction

An SEO audit is a systematic analysis of a website's search engine optimization. It identifies issues that prevent a site from ranking well, prioritizes fixes, and tracks improvements over time.

A comprehensive audit covers technical infrastructure, on-page elements, content quality, performance, and off-page signals.

## Technical SEO Audit

### Crawlability

| Check | What to Look For |
|-------|-----------------|
| robots.txt | Exists, doesn't block important pages |
| Sitemap | Valid XML, submitted to Search Console |
| Crawl errors | 404s, 5xx errors, redirect chains |
| JavaScript rendering | Content visible without JS |
| URL structure | Clean, hierarchical, no parameters for main content |
| HTTPS | All pages served over HTTPS |
| Redirects | No chains, no loops, 301 for permanent |

### Indexation

| Check | What to Look For |
|-------|-----------------|
| Indexed pages | Match between intended and actual indexed pages |
| noindex tags | Only on pages that shouldn't be indexed |
| Canonical tags | Self-referencing, no conflicts |
| Duplicate content | Canonicals set, no thin duplicates |
| Hreflang | Correct for multi-language sites |

### Site Architecture

| Check | What to Look For |
|-------|-----------------|
| URL depth | Important pages within 3 clicks of homepage |
| Internal linking | All pages discoverable through links |
| Orphan pages | No pages without internal links |
| Navigation | Logical hierarchy, breadcrumbs |

## On-Page SEO Audit

### Meta Tags

| Check | Criteria |
|-------|----------|
| Title tags | Unique, 50-60 chars, includes primary keyword |
| Meta descriptions | Unique, 150-160 chars, compelling |
| H1 tags | One per page, includes primary keyword |
| Heading hierarchy | Logical H1→H2→H3 structure |
| Image alt text | Descriptive, present on all non-decorative images |
| Open Graph tags | Complete OG and Twitter tags |
| Structured data | Valid JSON-LD for relevant schema types |

### Content Quality

| Check | Criteria |
|-------|----------|
| Word count | Adequate for topic (min 300 for most pages) |
| Keyword usage | Natural, in title, H1, first paragraph |
| Readability | Appropriate reading level for audience |
| Freshness | Content regularly updated |
| Uniqueness | No duplicate content from other pages/sites |

## Off-Page SEO Audit

| Check | What to Look For |
|-------|-----------------|
| Backlink profile | Quality over quantity |
| Referring domains | Diverse, authoritative sources |
| Anchor text | Natural distribution, not over-optimized |
| Toxic links | Disavow spammy/harmful links |
| Brand mentions | Unlinked mentions to convert |
| Social signals | Active social media presence |

## Content Audit

### Content Inventory

For each page, evaluate:

1. **Traffic**: Is it getting organic traffic?
2. **Rankings**: What keywords does it rank for?
3. **Engagement**: Bounce rate, time on page
4. **Conversions**: Does it contribute to goals?
5. **Quality**: Is it comprehensive, accurate, up-to-date?
6. **Action**: Keep, update, merge, or remove

### Content Gap Analysis

- What topics do competitors cover that you don't?
- What questions does your audience ask?
- What keywords have search volume but no content?

## Performance Audit

| Metric | Good | Needs Work |
|--------|------|-----------|
| LCP | ≤ 2.5s | > 4.0s |
| CLS | ≤ 0.1 | > 0.25 |
| INP | ≤ 200ms | > 500ms |
| TTFB | ≤ 800ms | > 1800ms |
| Total page weight | < 1.5MB | > 3MB |
| Number of requests | < 50 | > 100 |
| JavaScript size | < 300KB | > 500KB |

### Performance Checks

- Core Web Vitals pass (real user data)
- Lighthouse performance score ≥ 90
- Images optimized (format, size, lazy loading)
- CSS/JS minified and compressed
- Browser caching configured
- CDN in use

## Mobile Audit

| Check | Criteria |
|-------|----------|
| Mobile-friendly | Passes Google's mobile-friendly test |
| Viewport meta | Properly configured |
| Touch targets | Min 48×48px with spacing |
| Font sizes | Minimum 16px body text |
| Content parity | Same content as desktop |
| No horizontal scroll | Content fits viewport |
| Mobile page speed | Core Web Vitals pass on mobile |

## Tools

### Free Tools

| Tool | Purpose |
|------|---------|
| Google Search Console | Index coverage, performance, errors |
| Google PageSpeed Insights | CWV, Lighthouse score, field data |
| Google Rich Results Test | Structured data validation |
| Lighthouse (Chrome DevTools) | Full page audit |
| Bing Webmaster Tools | Bing-specific insights |
| Schema Markup Validator | JSON-LD validation |

### Paid Tools

| Tool | Purpose |
|------|---------|
| Ahrefs | Backlinks, keywords, site audit |
| SEMrush | Comprehensive SEO suite |
| Screaming Frog | Technical crawl analysis |
| Moz Pro | Domain authority, link analysis |
| Sitebulb | Visual site audit |

### Next.js Specific

| Tool | Purpose |
|------|---------|
| `next build` | Build-time analysis, bundle size |
| `@next/bundle-analyzer` | JavaScript bundle visualization |
| Vercel Analytics | Real user metrics |
| Vercel Speed Insights | Core Web Vitals monitoring |

## Monitoring

### What to Monitor

1. **Search Console**: Weekly check for new issues
2. **Core Web Vitals**: Monthly CrUX report
3. **Rankings**: Track target keywords
4. **Traffic**: Organic traffic trends
5. **Indexation**: Pages indexed vs submitted
6. **Errors**: 4xx, 5xx, crawl errors
7. **Backlinks**: New and lost links

### Alerting

Set up alerts for:
- Sudden traffic drops (> 20% week-over-week)
- New crawl errors
- Core Web Vitals regression
- Security issues (manual actions)
- Server downtime

## Common Issues & Remediation

### Critical Issues

| Issue | Impact | Fix |
|-------|--------|-----|
| Site not HTTPS | High | Migrate to HTTPS, set up 301 redirects |
| robots.txt blocking important pages | High | Update robots.txt |
| Missing sitemap | High | Generate and submit sitemap |
| Massive crawl errors | High | Fix broken pages, set up redirects |
| No mobile optimization | High | Implement responsive design |

### High Priority

| Issue | Impact | Fix |
|-------|--------|-----|
| Duplicate content | High | Add canonicals, consolidate |
| Missing/duplicate titles | High | Write unique titles |
| Slow page speed (LCP > 4s) | High | Optimize images, server, JS |
| Broken internal links | Medium | Update or remove links |
| Missing alt text | Medium | Add descriptive alt text |

### Medium Priority

| Issue | Impact | Fix |
|-------|--------|-----|
| Missing structured data | Medium | Add JSON-LD schemas |
| Thin content pages | Medium | Expand or consolidate |
| Missing meta descriptions | Medium | Write compelling descriptions |
| Layout shift (CLS > 0.1) | Medium | Add image dimensions, reserve space |
| Missing Open Graph tags | Low | Add OG metadata |

## Scoring System

### Category Weights

| Category | Weight |
|----------|--------|
| Technical SEO | 30% |
| On-Page SEO | 25% |
| Performance | 25% |
| Content | 15% |
| Mobile | 5% |

### Scoring Per Check

- **Pass**: Full points
- **Warning**: Half points (minor issue)
- **Fail**: Zero points (critical issue)

### Overall Score Interpretation

| Score | Rating | Action |
|-------|--------|--------|
| 90-100 | Excellent | Monitor, minor tweaks |
| 70-89 | Good | Address specific issues |
| 50-69 | Needs Work | Prioritize critical fixes |
| 30-49 | Poor | Comprehensive remediation needed |
| 0-29 | Critical | Major overhaul required |

## Best Practices

### Audit Frequency

- **Full audit**: Quarterly
- **Technical check**: Monthly
- **Performance check**: Weekly
- **Content review**: Monthly

### Do

- Prioritize fixes by impact and effort
- Track changes and measure results
- Compare against competitors
- Automate recurring checks
- Document findings and share with team

### Don't

- Don't try to fix everything at once
- Don't ignore mobile
- Don't chase vanity metrics
- Don't forget to re-audit after changes
- Don't use black-hat techniques (keyword stuffing, hidden text, link schemes)

---

## Exercises

See `exercises.ts` for hands-on practice implementing SEO auditors, scoring systems, and report generators.
