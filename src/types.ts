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

export interface VoiceGPTConfig {
  websiteName?: string;
  agentName?: string;
  websiteLinks?: string[];
  customInstructions?: string;
}

declare global {
  interface Window {
    VOICEGPT_CONFIG?: VoiceGPTConfig;
  }
}
