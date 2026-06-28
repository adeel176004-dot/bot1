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
