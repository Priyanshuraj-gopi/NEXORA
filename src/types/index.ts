export type SessionStatus =
  | 'pending'
  | 'uploading'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'expired';

export type ProcessingStage =
  | 'uploading'
  | 'preparing'
  | 'generating'
  | 'enhancing'
  | 'finalizing'
  | 'completed';

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'kiosk';

export type AIProvider = 'gemini' | 'openai';

export interface Style {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  prompt: string;
  negative_prompt?: string;
  category: string;
  enabled: boolean;
  featured: boolean;
  sort_order: number;
}

export interface Session {
  id: string;
  created_at: string;
  status: SessionStatus;
  selected_style: string | null;
  input_image: string | null;
  output_image: string | null;
  processing_stage: ProcessingStage | null;
  expires_at: string;
  device: DeviceType | null;
  booth_id: string | null;
  error_message: string | null;
  retry_count: number;
}

export interface Booth {
  id: string;
  name: string;
  location: string | null;
  event: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AnalyticsEntry {
  id: string;
  session_id: string;
  generation_time_ms: number | null;
  style: string | null;
  device: string | null;
  ai_provider: AIProvider | null;
  success: boolean;
  error_type: string | null;
  created_at: string;
}

export interface GenerateRequest {
  sessionId: string;
  styleSlug: string;
  inputImagePath: string;
}

export interface GenerateResponse {
  success: boolean;
  sessionId: string;
  outputImageUrl?: string;
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  sessionId: string;
  imagePath?: string;
  error?: string;
}

export const PROCESSING_STAGES: Record<ProcessingStage, string> = {
  uploading: 'Uploading your image...',
  preparing: 'Preparing transformation...',
  generating: 'Applying AI style...',
  enhancing: 'Enhancing details...',
  finalizing: 'Finalizing your image...',
  completed: 'Your transformation is ready!',
};
