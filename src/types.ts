export interface PlanFeature {
  text: string;
  info: string;
}

export interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: PlanFeature[];
  description: string;
  isPopular?: boolean;
  active: boolean;
}

export interface UserStats {
  totalMessages: number;
  totalMinutes: number;
  activeAgents: number;
  satisfactionRate: number;
  dailyUsage: { date: string; messages: number; minutes: number }[];
}

export interface UserData extends UserStats {
  uid: string;
  email: string;
  displayName: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
}

export interface VoiceGPTConfig {
  websiteName?: string;
  agentName?: string;
  websiteLinks?: string[];
  customInstructions?: string;
  voiceGender?: 'male' | 'female';
  language?: string;
  personality?: string;
  userId?: string;
  bookingEnabled?: boolean;
  bookingUrl?: string;
  themeColor?: string;
  botIcon?: string;
}

declare global {
  interface Window {
    VOICEGPT_CONFIG?: VoiceGPTConfig;
  }
}
