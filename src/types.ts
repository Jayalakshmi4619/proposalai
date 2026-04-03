export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  profession: string;
  hourlyRate: number;
  city?: string;
  gstNumber?: string;
  phone?: string;
  skills?: string[];
  bio?: string;
  totalProposals: number;
  wonProposals: number;
  totalRevenue: number;
  createdAt: string;
}

export interface ScopePhase {
  phase: string;
  phaseNumber: number;
  deliverables: string[];
  duration: string;
  description: string;
}

export interface Milestone {
  milestone: string;
  description: string;
  day: string;
  paymentPercentage: number;
  amountInr: number;
}

export interface PricingItem {
  task: string;
  description: string;
  hours: number;
  ratePerHour: number;
  amount: number;
}

export interface PricingBreakdown {
  model: 'fixed' | 'hourly' | 'milestone';
  currency: 'INR';
  items: PricingItem[];
  subtotal: number;
  buffer: number;
  bufferPercentage: number;
  gstApplicable: boolean;
  gstAmount: number;
  gstPercentage: number;
  total: number;
  totalInWords: string;
}

export interface ContractClause {
  id: string;
  title: string;
  category: string;
  content: string;
  isRecommended: boolean;
  enabled?: boolean;
}

export interface PaymentTerms {
  advance: number;
  milestone: number;
  delivery: number;
  advanceAmount: number;
  milestoneAmount: number;
  deliveryAmount: number;
  latePenalty: string;
  paymentMethods: string[];
}

export interface Proposal {
  id?: string;
  userId: string;
  title: string;
  clientName?: string;
  clientEmail?: string;
  projectType: string;
  clientType: string;
  complexity: 'basic' | 'standard' | 'premium';
  rawDescription: string;
  executiveSummary: string;
  scopeOfWork: ScopePhase[];
  exclusions: string[];
  assumptions: string[];
  timeline: Milestone[];
  pricingBreakdown: PricingBreakdown;
  contractClauses: ContractClause[];
  paymentTerms: PaymentTerms;
  revisionPolicy: string;
  validityPeriod: string;
  projectRisks: string[];
  totalValueInr: number;
  status: 'draft' | 'sent' | 'won' | 'lost';
  createdAt: string;
  updatedAt: string;
}
