import { Plan } from '../types';

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out VoiceGPT on your website.',
    features: [
      { text: '3 website pages included', info: 'You can train the AI agent on up to 3 individual pages of your website.' },
      { text: '50 messages monthly limit', info: 'The agent will answer up to 50 user queries per month.' },
      { text: 'VoiceGPT branding included', info: 'The chatbot interface will show "Powered by VoiceGPT" at the bottom.' },
      { text: 'Standard response speed', info: 'Queries are processed with our standard priority tier.' },
      { text: 'Email support', info: 'Get help via email within 48 hours.' }
    ],
    active: true
  },
  {
    id: 'basic',
    name: 'Basic',
    price: '$49',
    period: 'per month',
    description: 'Ideal for growing websites that need more power.',
    isPopular: true,
    features: [
      { text: 'Up to 500 website pages', info: 'Train your agent on up to 500 pages for deep site-wide knowledge.' },
      { text: '5,000 messages monthly', info: 'Generous quota of 5,000 automated responses every month.' },
      { text: 'Automatic data refresh', info: 'We automatically re-scan your website pages when you make changes.' },
      { text: 'No VoiceGPT branding', info: 'Remove our branding for a fully white-labeled experience.' },
      { text: 'Priority response speed', info: 'Get faster responses with our high-priority server tier.' },
      { text: 'Priority email support', info: 'Skip the queue with guaranteed 12-hour response times.' }
    ],
    active: false
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$89',
    period: 'per month',
    description: 'For high-traffic sites requiring maximum capacity.',
    features: [
      { text: 'Up to 700 website pages', info: 'Comprehensive training for large enterprise websites or documentation hubs.' },
      { text: '10,000 messages monthly', info: 'Maximum volume for sites with very high traffic and many daily users.' },
      { text: 'Automatic data refresh', info: 'Real-time updates to keep your agent synchronized with your site content.' },
      { text: 'No VoiceGPT branding', info: 'Complete white-label solution for your brand.' },
      { text: 'Ultra-fast response speed', info: 'The fastest possible processing using dedicated hardware resources.' },
      { text: 'Dedicated account manager', info: 'Personal support representative to help optimize your agent.' },
      { text: '24/7 Support', info: 'Round-the-clock emergency assistance and live chat support.' }
    ],
    active: false
  }
];
