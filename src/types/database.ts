export type AppRole = 'patient' | 'healthworker' | 'admin';
export type TestType = 'malaria';
export type SeverityLevel = 'negative' | 'mild' | 'moderate' | 'severe';
export type SubscriptionPlan = 'free' | 'pro' | 'clinic';
export type TestStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ParasiteDensity = 'low' | 'medium' | 'high' | 'critical';
export type ImageQuality = 'excellent' | 'good' | 'fair' | 'poor';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Test {
  id: string;
  user_id: string;
  test_type: TestType;
  sample_image_url: string | null;
  enhanced_image_url: string | null;
  result_data: Record<string, unknown>;
  severity: SeverityLevel | null;
  confidence_score: number | null;
  ai_findings: string | null;
  who_recommendations: string | null;
  verification_code: string | null;
  status: TestStatus;
  parasite_species: string | null;
  parasite_density: ParasiteDensity | null;
  parasite_stage: string | null;
  image_quality: ImageQuality | null;
  risk_level: RiskLevel | null;
  parasite_count: number | null;
  detected_regions: DetectedRegion[] | unknown;
  quality_issues: string[] | unknown;
  created_at: string;
  updated_at: string;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface DetectedRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  confidence?: number;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface Dataset {
  id: string;
  name: string;
  description: string | null;
  test_type: TestType;
  image_url: string | null;
  classification: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Malaria-specific types
export interface MalariaAnalysisResult {
  parasitesDetected: boolean;
  species: string | null;
  density: ParasiteDensity | null;
  stage: string | null;
  confidence: number;
  findings: string;
  recommendations: string;
  imageQuality: ImageQuality;
}

export interface CalibrationStatus {
  isCalibrated: boolean;
  magnification: string;
  lastCalibration: string | null;
  focusQuality: 'excellent' | 'good' | 'fair' | 'poor';
}
