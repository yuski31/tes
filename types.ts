export interface CoreService {
  name: string;
  description: string;
  features: string[];
}

export interface TechStackItem {
  category: string;
  technologies: string[];
}

export interface MonetizationModel {
  strategy: string;
  description: string;
  pricingDetails: string[];
  keyMetrics: string[];
}

export interface ArchitecturalComponent {
  component: string;
  description: string;
  technologies: string[];
}

export interface RoadmapPhase {
  phase: string;
  title: string;
  focus: string[];
  kpis: string[];
  milestones: string[];
}

export interface TeamRole {
    title: string;
    responsibilities: string[];
}

export interface Competitor {
    name: string;
    strengths: string[];
    weaknesses: string[];
}

export interface CompetitiveAnalysis {
    competitors: Competitor[];
    keyDifferentiators: string[];
}

export interface Blueprint {
  companyName: string;
  missionStatement: string;
  visionStatement: string;
  coreServices: CoreService[];
  targetAudience: string[];
  uiUxPrinciples: string[];
  techStack: TechStackItem[];
  monetization: MonetizationModel[];
  architecturalBlueprint: ArchitecturalComponent[];
  roadmap: RoadmapPhase[];
  teamStructure: TeamRole[];
  competitiveAnalysis: CompetitiveAnalysis;
}

export interface ComparisonItem {
  technologyName: string;
  pros: string[];
  cons:string[];
  bestUseCases: string[];
}

export type ComparisonData = ComparisonItem[];

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model: string; // 'user' for user messages, or the model name for assistant messages
}
