export type ArticleStatus = 'pending' | 'writing' | 'written' | 'published' | 'posted';

export interface AdminArticle {
  id: string;
  title: { ru: string; en: string; de: string };
  date: string;
  category: string;
  tags: string[];
  image: string;
  status: string;
  postedToSocial: boolean;
  sentDate: string | null;
}

export interface ArticleTopic {
  id: string;
  topic: string;
  category: string;
  suggestedTags: string[];
  status: ArticleStatus;
  articleId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalArticles: number;
  publishedCount: number;
  draftCount: number;
  postedToSocialCount: number;
  pendingTopicsCount: number;
  lastPublishedDate: string | null;
}

export interface ArticlesResponse {
  articles: AdminArticle[];
  topics: ArticleTopic[];
}

export interface SocialStatus {
  id: string;
  title: string;
  slug: string;
  posted: boolean;
  sentDate: string | null;
}

export interface LoginResponse {
  token: string;
  expiresIn: string;
}

// === Типы публикаций ===

export type PublicationType = 'article' | 'social-post' | 'story';
export type SocialPostSubType = 'text-image' | 'video';
export type SocialNetwork = 'telegram' | 'vk' | 'facebook' | 'instagram' | 'youtube';

export type PipelineStepStatus = 'pending' | 'running' | 'completed' | 'error' | 'skipped';

export interface PipelineStep {
  id: string;
  name: string;
  description: string;
  status: PipelineStepStatus;
  promptKey: string;
  customPrompt?: string;
  result?: string;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface PipelineJob {
  id: string;
  publicationType: PublicationType;
  subType?: SocialPostSubType;
  topic: string;
  steps: PipelineStep[];
  currentStep: number;
  status: 'running' | 'paused' | 'completed' | 'error' | 'cancelled';
  targetNetworks: SocialNetwork[];
  createdAt: string;
  updatedAt: string;
}

export interface Publication {
  id: string;
  type: PublicationType;
  subType?: SocialPostSubType;
  topic: string;
  content: {
    ru?: string;
    en?: string;
    de?: string;
  };
  image?: string;
  video?: string;
  targetNetworks: SocialNetwork[];
  publishedNetworks: SocialNetwork[];
  status: 'draft' | 'ready' | 'publishing' | 'published' | 'error';
  pipelineJobId?: string;
  createdAt: string;
  publishedAt?: string;
}

export interface SocialNetworkConfig {
  enabled: boolean;
  configured: boolean;
  name: string;
  note?: string;
  via?: 'direct' | 'buffer';
}

export interface PromptTemplate {
  key: string;
  label: string;
  template: string;
}

export interface ExtendedAdminStats extends AdminStats {
  totalPublications: number;
  socialPostsCount: number;
  storiesCount: number;
  activePipelines: number;
  connectedNetworks: number;
}

export interface SettingsResponse {
  socialConfig: Record<SocialNetwork, SocialNetworkConfig>;
  promptTemplates: Record<string, string>;
}

export interface PublicationsResponse {
  publications: Publication[];
  total: number;
}

export interface PipelineJobsResponse {
  jobs: PipelineJob[];
}

// === API ключи ===

export type ApiKeyStatus = 'configured' | 'not_configured' | 'error' | 'checking';

export interface ApiKeyExtraVar {
  key: string;
  maskedValue: string | null;
  configured: boolean;
}

export interface ApiKeyInfo {
  id: string;
  name: string;
  description: string;
  maskedValue: string | null;
  status: ApiKeyStatus;
  docUrl: string;
  docLabel: string;
  hasExtraVars?: boolean;
  extraVars?: ApiKeyExtraVar[];
}

export interface ApiKeyTestResult {
  status: 'ok' | 'error';
  message: string;
}
