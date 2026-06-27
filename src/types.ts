export interface AgentVoxConfig {
  websiteName?: string;
  agentName?: string;
  websiteLinks?: string[];
  customInstructions?: string;
}

declare global {
  interface Window {
    AGENTVOX_CONFIG?: AgentVoxConfig;
  }
}
