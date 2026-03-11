export interface ServiceItem {
  id: string;
  description: string;
}

export interface TimelineStep {
  id: string;
  label: string;
  duration: string;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  content: string;
  avatar?: string;
}

export interface ResultItem {
  id: string;
  label: string;
  value: string;
  description: string;
}

export type BlockType = 'text' | 'services' | 'timeline' | 'investment' | 'image' | 'scope' | 'benefits' | 'differentials' | 'validity' | 'observations' | 'warranty' | 'custom' | 'testimonials' | 'results';

export interface ProposalBlock {
  id: string;
  type: BlockType;
  title: string;
  content: string; // For text blocks
  isVisible: boolean;
}

export interface Proposal {
  id: string;
  updatedAt: number;
  
  // Customization
  accentColor: string;
  fontFamily: 'sans' | 'serif' | 'mono' | 'display' | 'modern' | 'clean';
  baseTextSize: 'small' | 'medium' | 'large';
  
  // Client Info
  clientName: string;
  clientLabel: string;
  clientCompany: string;
  clientSeparator: string;
  clientEmail: string;
  clientPhone: string;
  
  // Proposal Details
  title: string;
  subtitle: string;
  description: string;
  customDate: string;
  dateLabel: string;
  heroBadgeLabel: string;
  tags: string[];
  
  // Blocks
  blocks: ProposalBlock[];
  showNumbers: boolean;
  serviceLabel: string;
  timelineLabel: string;
  
  // Content Data
  services: ServiceItem[];
  timeline: TimelineStep[];
  testimonials: Testimonial[];
  results: ResultItem[];
  deliveryTime: string;
  deliveryTimeLabel: string;
  validity: string;
  validityLabel: string;
  currency: 'BRL' | 'USD' | 'EUR';
  totalValue: string;
  paymentTerms: string;
  paymentTermsLabel: string;
  
  // Final touches
  finalObservations: string;
  finalObservationsLabel: string;
  warranty: string;
  warrantyLabel: string;
  
  // Footer
  footerBrandText: string;
  footerSubText: string;
  
  // Company Info
  companyName: string;
  companyLogo: string;
  companyAddress: string;
  companyWebsite: string;
}

export const INITIAL_PROPOSAL: Proposal = {
  id: '',
  updatedAt: Date.now(),
  accentColor: '#0071e3',
  fontFamily: 'sans',
  baseTextSize: 'medium',
  clientName: '',
  clientLabel: 'Para',
  clientCompany: '',
  clientSeparator: '@',
  clientEmail: '',
  clientPhone: '',
  title: 'Proposta de Marketing Estratégico',
  subtitle: 'Transformando sua presença digital com inteligência e performance.',
  description: 'Nossa agência foca em resultados reais. Esta proposta detalha como pretendemos elevar o patamar da sua marca no mercado.',
  customDate: new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' }),
  dateLabel: 'Data',
  heroBadgeLabel: '',
  tags: ['Marketing Digital', 'Performance', 'Estratégia'],
  blocks: [
    { id: '1', type: 'text', title: 'Sobre Nós', content: 'Somos especialistas em crescimento acelerado para empresas do setor tecnológico.', isVisible: true },
    { id: '2', type: 'services', title: 'Nossas Soluções', content: '', isVisible: true },
    { id: '3', type: 'timeline', title: 'Cronograma', content: '', isVisible: true },
    { id: '5', type: 'results', title: 'Resultados Alcançados', content: '', isVisible: true },
    { id: '6', type: 'testimonials', title: 'O Que Dizem Nossos Clientes', content: '', isVisible: true },
    { id: '4', type: 'investment', title: 'Investimento', content: '', isVisible: true },
  ],
  showNumbers: true,
  serviceLabel: 'Serviço',
  timelineLabel: 'Etapa',
  services: [{ id: '1', description: 'Gestão de Tráfego Pago' }],
  timeline: [{ id: '1', label: 'Onboarding', duration: '3 dias' }],
  testimonials: [
    { id: '1', author: 'João Silva', role: 'CEO na TechStart', content: 'O trabalho da equipe superou todas as nossas expectativas. Os resultados foram imediatos.' }
  ],
  results: [
    { id: '1', label: 'ROI', value: '450%', description: 'Retorno sobre investimento no primeiro trimestre.' }
  ],
  deliveryTime: '30 dias',
  deliveryTimeLabel: 'Prazo de Entrega',
  validity: '15 dias',
  validityLabel: 'Validade',
  currency: 'BRL',
  totalValue: '12500',
  paymentTerms: 'À vista com 5% de desconto ou 3x sem juros.',
  paymentTermsLabel: 'Condições de Pagamento',
  finalObservations: 'Valores sujeitos a alteração após 30 dias.',
  finalObservationsLabel: 'Observações',
  warranty: 'Suporte técnico incluso por 6 meses.',
  warrantyLabel: 'Garantia',
  footerBrandText: 'PropostaPro Enterprise',
  footerSubText: 'Gerado digitalmente',
  companyName: 'Marketing Pro Agency',
  companyLogo: '',
  companyAddress: 'Av. Paulista, 1000 - São Paulo, SP',
  companyWebsite: 'www.marketingpro.com',
};
