
export interface ReiFormData {
  // Informações básicas
  name: string;
  role: string;
  email: string;
  whatsapp: string;
  companyName: string;
  companySite: string;
  sector: string;
  
  // Expectativas e produto
  expectedResults: string;
  solution: string;
  hasPlans: string;
  advantages: string;
  targetAudience: string;
  idealCustomerProfiles: string;
  demographicProfile: string;
  
  // Problemas e dores
  recurringProblems: string;
  customerPains: string;
  consequencesOfNotBuying: string;
  emotionalResponses: string;
  savesTimeOrMoney: string;
  
  // Comportamento do cliente
  whereCustomersSearch: string;
  problemCauses: string;
  customerLocations: string;
  keywords: string;
  
  // Mercado e concorrência
  challenges: string;
  differentiation: string;
  competitors: string;
  marketTrends: string;
  
  // Vendas e marketing
  salesChannels: string;
  marketingTools: string;
  monthlyAdBudget: string;
  adScheduleRestrictions: string;
  adRegions: string;
  previousStrategies: string;
  salesCycle: string;
  leadNurturing: string;
  decisionFactors: string;
  growthStrategies: string;
  
  // Recursos e processos
  marketingMaterials: string;
  kpis: string;
  limitations: string;
  approvalProcess: string;
}

export interface ReiFormProps {
  onSubmit: (data: ReiFormData) => void;
}
