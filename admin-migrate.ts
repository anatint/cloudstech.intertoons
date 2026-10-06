/**
 * Wix CMS Admin Migration Script
 * 
 * Run this script with an API KEY that has admin write permissions.
 * It will:
 * 1. Update Services collection items with structured data fields
 *    (subServices, whyChoose, stats, heroLabels, heroHeadline, ctaCopy)
 * 2. These replace the hardcoded constants in the frontend
 *
 * Usage:
 *   WIX_CLIENT_ID=df0c393b-5bc6-403c-bb55-f4c5cb734dd7 \
 *   WIX_API_KEY=<your-admin-api-key> \
 *   npx tsx admin-migrate.ts
 *
 * NOTE: You need an API key with "Wix Data" write permissions from
 * Wix Dashboard → Settings → API Keys.
 */
import { createClient, OAuthStrategy, ApiKeyStrategy } from '@wix/sdk';
import { items } from '@wix/data';

const clientId = process.env.WIX_CLIENT_ID!;
const apiKey = process.env.WIX_API_KEY;
const siteId = '4ffcfcd6-cb3f-4af1-959b-85296102be43';

function buildClient() {
  if (apiKey) {
    return createClient({
      modules: { items },
      auth: ApiKeyStrategy({ apiKey, siteId }),
    });
  }
  return createClient({
    modules: { items },
    auth: OAuthStrategy({ clientId }),
  });
}

const client = buildClient();

/* ── Service data to seed ── */

const SERVICE_DATA: Record<string, {
  subServices: Array<{ icon: string; title: string; desc: string }>;
  whyChoose: string[];
  stats: Array<{ value: string; label: string }>;
  heroLabels: string[];
  heroHeadline: { black: string; blue: string; suffix?: string };
  ctaHeading: string;
  ctaSub: string;
  ctaBtnText: string;
}> = {
  'shopify-developers-kerala': {
    subServices: [
      { icon: 'Store', title: 'Shopify Store Development', desc: 'Custom Shopify stores designed to reflect your brand and maximise conversions.' },
      { icon: 'Palette', title: 'Shopify Theme Customization', desc: 'Beautiful, responsive & SEO-friendly themes customised to match your business.' },
      { icon: 'Code2', title: 'Shopify App Development', desc: 'Custom apps and integrations to extend store functionality and improve performance.' },
      { icon: 'MoveRight', title: 'Migration to Shopify', desc: 'Seamless migration from any platform to Shopify with zero data loss.' },
      { icon: 'Gauge', title: 'Shopify Speed Optimization', desc: 'Improve your store speed, performance and boost SEO rankings for better user experience.' },
      { icon: 'Headphones', title: 'Support & Maintenance', desc: 'Ongoing support, updates and maintenance to keep your store running smoothly.' },
    ],
    whyChoose: [
      'Official Shopify Partners with experienced developers',
      'Deep understanding of eCommerce & user experience',
      'Custom solutions tailored to your business goals',
      'Transparent communication & on-time delivery',
      'Post-launch support to help your business grow',
    ],
    stats: [
      { value: '170+', label: 'Shopify Stores Launched' },
      { value: '98%', label: 'Client Satisfaction' },
      { value: '5+', label: 'Years of Shopify Experience' },
      { value: '24/7', label: 'Support & Maintenance' },
    ],
    heroLabels: ['Shopify Certified Experts', '100+ Stores Delivered', 'On-time Delivery', 'Ongoing Support & Maintenance'],
    heroHeadline: { black: 'Build. Scale. Succeed with', blue: 'Shopify Experts', suffix: 'in Kerala' },
    ctaHeading: 'Ready to Build Your Dream Shopify Store?',
    ctaSub: "Let's create a powerful eCommerce store that drives sales and grows your brand.",
    ctaBtnText: 'Request a Free Quote',
  },
  'ai-development': {
    subServices: [
      { icon: 'Bot', title: 'Custom AI Solutions', desc: 'Bespoke AI applications and LLM integrations tailored to your business processes.' },
      { icon: 'Code2', title: 'LLM Integration', desc: 'Integrate GPT-4, Claude, Gemini and other LLMs into your existing products.' },
      { icon: 'Zap', title: 'AI-Powered Chatbots', desc: 'Intelligent conversational agents that understand context and resolve queries.' },
      { icon: 'Gauge', title: 'Predictive Analytics', desc: 'Data-driven models to forecast trends and inform smarter business decisions.' },
      { icon: 'Cloud', title: 'AI Infrastructure', desc: 'Scalable cloud-native AI pipelines built for reliability and performance.' },
      { icon: 'Headphones', title: 'AI Consulting', desc: 'Strategy sessions to identify the highest-ROI AI opportunities for your team.' },
    ],
    whyChoose: [
      'Full-stack AI engineers with LLM production experience',
      'Agnostic approach — we choose the right model, not the trendy one',
      'End-to-end delivery from research to deployment',
      'Security-first engineering with data privacy at every step',
      'Ongoing fine-tuning and model performance monitoring',
    ],
    stats: [
      { value: '50+', label: 'AI Projects Delivered' },
      { value: '98%', label: 'Client Satisfaction' },
      { value: '10+', label: 'LLM Integrations' },
      { value: '24/7', label: 'Production Monitoring' },
    ],
    heroLabels: ['Certified AI Engineers', '50+ AI Projects', 'Production-Grade Quality', '24/7 Monitoring'],
    heroHeadline: { black: 'Build Smarter Products with', blue: 'Custom AI Development' },
    ctaHeading: 'Ready to Add AI to Your Product?',
    ctaSub: "Tell us your challenge. We'll find the right AI solution together.",
    ctaBtnText: 'Talk to an AI Expert',
  },
  'ai-automations': {
    subServices: [
      { icon: 'Zap', title: 'Workflow Automation', desc: 'Automate repetitive tasks across your tools, CRMs, ERPs and databases.' },
      { icon: 'Bot', title: 'RPA Solutions', desc: 'Robotic Process Automation for data entry, document processing and reporting.' },
      { icon: 'Code2', title: 'API Integrations', desc: 'Connect your software stack with reliable, well-tested API pipelines.' },
      { icon: 'Globe', title: 'Web Scraping & ETL', desc: 'Automated data collection, transformation and loading into your warehouses.' },
      { icon: 'Gauge', title: 'Process Optimisation', desc: 'Identify bottlenecks and re-engineer workflows for maximum throughput.' },
      { icon: 'Headphones', title: 'Ongoing Monitoring', desc: '24/7 alerting and maintenance to keep your automation pipelines healthy.' },
    ],
    whyChoose: [
      'Certified automation engineers across n8n, Make and custom stacks',
      'Handles complex conditional logic and multi-step pipelines',
      'Integrates with 500+ tools and APIs out of the box',
      'Fully documented automations your team can maintain',
      '24/7 monitoring with instant alert on failure',
    ],
    stats: [
      { value: '200+', label: 'Workflows Automated' },
      { value: '60%', label: 'Average Time Saved' },
      { value: '48+', label: 'Industries Served' },
      { value: '24/7', label: 'Pipeline Monitoring' },
    ],
    heroLabels: ['200+ Automations Built', '60% Avg Time Saved', 'No-Code + Custom Code', '24/7 Pipeline Alerts'],
    heroHeadline: { black: 'Save Hours Every Week with', blue: 'AI-Powered Automations' },
    ctaHeading: 'Ready to Automate Your Business?',
    ctaSub: "Share your workflow. We'll automate it — saving you hours every week.",
    ctaBtnText: 'Get a Free Automation Audit',
  },
  'ecommerce-development': {
    subServices: [
      { icon: 'ShoppingBag', title: 'Custom E-commerce Stores', desc: 'Conversion-focused online stores built on Shopify, WooCommerce or custom stacks.' },
      { icon: 'Palette', title: 'UX/UI Design', desc: 'Research-led design that guides shoppers to the checkout with minimal friction.' },
      { icon: 'Code2', title: 'Payment Integration', desc: 'Razorpay, Stripe, PayPal and regional gateways integrated securely.' },
      { icon: 'MoveRight', title: 'Platform Migration', desc: 'Move from any legacy platform without losing products, orders or SEO rankings.' },
      { icon: 'Gauge', title: 'Performance & SEO', desc: 'Core Web Vitals optimisation and structured data to rank and convert better.' },
      { icon: 'Headphones', title: 'Post-launch Support', desc: 'Retainer-based support, feature development and growth consulting.' },
    ],
    whyChoose: [
      'Certified Shopify, WooCommerce and BigCommerce partners',
      'UI/UX designed from customer journey research',
      'Conversion-rate optimisation built into every build',
      'Transparent milestones and fixed-scope pricing',
      'Growth consulting and analytics included post-launch',
    ],
    stats: [
      { value: '250+', label: 'E-commerce Stores Built' },
      { value: '98%', label: 'Client Satisfaction' },
      { value: '8+', label: 'Years of Experience' },
      { value: '24/7', label: 'Support & Maintenance' },
    ],
    heroLabels: ['250+ Stores Built', 'Conversion-First Design', 'Multi-Platform Expertise', 'Post-launch Support'],
    heroHeadline: { black: 'Launch & Grow with', blue: 'Expert eCommerce Development' },
    ctaHeading: 'Ready to Launch Your Online Store?',
    ctaSub: "Tell us about your product. We'll design and build the store you deserve.",
    ctaBtnText: 'Request a Free Quote',
  },
  'mobile-app-development': {
    subServices: [
      { icon: 'Smartphone', title: 'Native iOS Development', desc: 'High-performance iPhone and iPad apps crafted in Swift with native UX.' },
      { icon: 'Smartphone', title: 'Native Android Development', desc: 'Robust Kotlin-based Android apps for phones, tablets and wearables.' },
      { icon: 'Code2', title: 'Cross-Platform (Flutter)', desc: 'One codebase, two stores. Beautiful Flutter apps that feel native on both platforms.' },
      { icon: 'Gauge', title: 'App Performance Audit', desc: 'Diagnose and fix crashes, ANRs, memory leaks and slow load times.' },
      { icon: 'Store', title: 'App Store Publishing', desc: 'End-to-end App Store Connect and Google Play publishing, including review support.' },
      { icon: 'Headphones', title: 'Maintenance & Updates', desc: 'Ongoing OS compatibility updates, security patches and feature rollouts.' },
    ],
    whyChoose: [
      'Native iOS (Swift) and Android (Kotlin) specialists',
      'Flutter expertise for cost-efficient cross-platform apps',
      'Design system approach for a consistent, branded feel',
      'CI/CD pipelines for fast, reliable feature releases',
      'App Store Connect & Google Play management included',
    ],
    stats: [
      { value: '24+', label: 'Android Apps Delivered' },
      { value: '44+', label: 'iOS Apps Delivered' },
      { value: '98%', label: 'Client Satisfaction' },
      { value: '24/7', label: 'Post-launch Support' },
    ],
    heroLabels: ['iOS & Android Experts', '68+ Apps Published', 'Flutter Specialists', 'App Store Support'],
    heroHeadline: { black: 'Ship Faster with', blue: 'Mobile App Experts' },
    ctaHeading: 'Ready to Build Your Mobile App?',
    ctaSub: "Share your app idea. We'll scope, design, and ship it fast.",
    ctaBtnText: 'Get a Free App Estimate',
  },
};

async function main() {
  if (!apiKey) {
    console.error('ERROR: WIX_API_KEY environment variable is required.');
    console.error('Get an API key from: Wix Dashboard → Settings → API Keys');
    console.error('The key needs "Wix Data" write permissions.');
    console.error('');
    console.error('Usage:');
    console.error('  WIX_CLIENT_ID=df0c393b-5bc6-403c-bb55-f4c5cb734dd7 \\');
    console.error('  WIX_API_KEY=<your-key> \\');
    console.error('  npx tsx admin-migrate.ts');
    process.exit(1);
  }

  // Fetch all services
  const res = await client.items.query('Services').limit(50).find();
  console.log(`Found ${res.items.length} services.`);

  for (const item of res.items as any[]) {
    const data = SERVICE_DATA[item.slug];
    if (!data) {
      console.log(`⏩ Skipping "${item.title}" (slug: ${item.slug}) — no migration data`);
      continue;
    }

    console.log(`✏️  Updating "${item.title}" (slug: ${item.slug})...`);
    
    try {
      await client.items.update('Services', {
        ...item,
        subServices: data.subServices,
        whyChoose: data.whyChoose,
        stats: data.stats,
        heroLabels: data.heroLabels,
        heroHeadline: data.heroHeadline,
        ctaHeading: data.ctaHeading,
        ctaSub: data.ctaSub,
        ctaBtnText: data.ctaBtnText,
      });
      console.log(`   ✅ Done.`);
    } catch (err: any) {
      console.error(`   ❌ Failed: ${err.message?.substring(0, 200)}`);
    }
  }

  console.log('\n✅ Migration complete!');
}

main().catch(console.error);
