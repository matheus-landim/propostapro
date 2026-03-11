import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  FileText, 
  Download, 
  Copy, 
  PlusCircle, 
  X,
  Layout,
  User,
  Briefcase,
  Clock,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  Menu,
  FilePlus,
  History,
  CheckCircle2,
  Settings,
  Palette,
  GripVertical,
  Eye,
  Edit3,
  Globe,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence, Reorder, useScroll, useSpring } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
import { Proposal, INITIAL_PROPOSAL, ServiceItem, TimelineStep, ProposalBlock, Testimonial, ResultItem } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Toaster, toast } from 'sonner';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatCurrency = (value: string, currency: 'BRL' | 'USD' | 'EUR') => {
  const num = parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
  const locales: Record<string, string> = {
    BRL: 'pt-BR',
    USD: 'en-US',
    EUR: 'de-DE'
  };
  return new Intl.NumberFormat(locales[currency] || 'pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(num);
};

export default function App() {
  const [proposal, setProposal] = useState<Proposal>({ ...INITIAL_PROPOSAL, id: crypto.randomUUID() });
  const [savedProposals, setSavedProposals] = useState<Proposal[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [editorTab, setEditorTab] = useState<'company' | 'content' | 'style'>('content');
  const [isFullPreview, setIsFullPreview] = useState(false);

  // Load saved proposals
  useEffect(() => {
    const saved = localStorage.getItem('propostapro_saved');
    if (saved) {
      try {
        setSavedProposals(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading proposals', e);
      }
    }
  }, []);

  // Save to localStorage whenever savedProposals changes
  useEffect(() => {
    localStorage.setItem('propostapro_saved', JSON.stringify(savedProposals));
  }, [savedProposals]);

  // Auto-save whenever proposal changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSavedProposals(prev => {
        const existingIndex = prev.findIndex(p => p.id === proposal.id);
        const updatedProposal = { ...proposal, updatedAt: Date.now() };
        
        if (existingIndex >= 0) {
          const newList = [...prev];
          newList[existingIndex] = updatedProposal;
          return newList;
        } else {
          return [updatedProposal, ...prev];
        }
      });
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [proposal]);

  const handleSave = () => {
    const existingIndex = savedProposals.findIndex(p => p.id === proposal.id);
    const updatedProposal = { ...proposal, updatedAt: Date.now() };
    
    if (existingIndex >= 0) {
      const newList = [...savedProposals];
      newList[existingIndex] = updatedProposal;
      setSavedProposals(newList);
    } else {
      setSavedProposals([updatedProposal, ...savedProposals]);
    }
    toast.success('Proposta salva!', {
      description: 'Suas alterações foram salvas no histórico.',
      position: 'bottom-right',
    });
  };

  const handleNew = () => {
    if (confirm('Deseja criar uma nova proposta?')) {
      setProposal({ ...INITIAL_PROPOSAL, id: crypto.randomUUID() });
      setActiveTab('edit');
      setEditorTab('content');
    }
  };

  const handleLoad = (p: Proposal) => {
    setProposal(p);
    setIsSidebarOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir esta proposta?')) {
      setSavedProposals(savedProposals.filter(p => p.id !== id));
      if (proposal.id === id) {
        setProposal({ ...INITIAL_PROPOSAL, id: crypto.randomUUID() });
      }
    }
  };

  const handleDuplicate = (p: Proposal, e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicated = { 
      ...p, 
      id: crypto.randomUUID(), 
      title: `${p.title} (Cópia)`,
      updatedAt: Date.now() 
    };
    setSavedProposals([duplicated, ...savedProposals]);
    setProposal(duplicated);
    setIsSidebarOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    try {
      const data = btoa(unescape(encodeURIComponent(JSON.stringify(proposal))));
      const url = `${window.location.origin}${window.location.pathname}?p=${data}`;
      navigator.clipboard.writeText(url);
      alert('Link da proposta copiado!');
    } catch (e) {
      console.error('Error sharing', e);
    }
  };

  // Load from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pData = params.get('p');
    if (pData) {
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(pData))));
        setProposal({ ...decoded, id: crypto.randomUUID() });
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error('Error decoding share link', e);
      }
    }
  }, []);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    // GSAP animation for the main title when it appears
    const titles = document.querySelectorAll('.animate-title');
    titles.forEach(title => {
      gsap.fromTo(title, 
        { opacity: 0, y: 50, skewY: 7 },
        { 
          opacity: 1, 
          y: 0, 
          skewY: 0, 
          duration: 1.2, 
          ease: "power4.out",
          scrollTrigger: {
            trigger: title,
            start: "top 90%",
            toggleActions: "play none none none"
          }
        }
      );
    });
  }, [proposal.title, activeTab]); // Re-run when title changes or tab switches to preview

  const updateField = (field: keyof Proposal, value: any) => {
    setProposal(prev => ({ ...prev, [field]: value }));
  };

  const addService = () => {
    updateField('services', [...proposal.services, { id: crypto.randomUUID(), description: '' }]);
  };

  const removeService = (id: string) => {
    updateField('services', proposal.services.filter(s => s.id !== id));
  };

  const updateService = (id: string, description: string) => {
    updateField('services', proposal.services.map(s => s.id === id ? { ...s, description } : s));
  };

  const addTimelineStep = () => {
    updateField('timeline', [...proposal.timeline, { id: crypto.randomUUID(), label: '', duration: '' }]);
  };

  const removeTimelineStep = (id: string) => {
    updateField('timeline', proposal.timeline.filter(s => s.id !== id));
  };

  const updateTimelineStep = (id: string, field: keyof TimelineStep, value: string) => {
    updateField('timeline', proposal.timeline.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addTestimonial = () => {
    updateField('testimonials', [...proposal.testimonials, { id: crypto.randomUUID(), author: '', role: '', content: '' }]);
  };

  const removeTestimonial = (id: string) => {
    updateField('testimonials', proposal.testimonials.filter(t => t.id !== id));
  };

  const updateTestimonial = (id: string, field: keyof Testimonial, value: string) => {
    updateField('testimonials', proposal.testimonials.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const addResult = () => {
    updateField('results', [...proposal.results, { id: crypto.randomUUID(), label: '', value: '', description: '' }]);
  };

  const removeResult = (id: string) => {
    updateField('results', proposal.results.filter(r => r.id !== id));
  };

  const updateResult = (id: string, field: keyof ResultItem, value: string) => {
    updateField('results', proposal.results.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField('companyLogo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addBlock = (type: ProposalBlock['type']) => {
    const titles: Record<string, string> = {
      text: 'Novo Bloco de Texto',
      services: 'Nossas Soluções',
      timeline: 'Cronograma',
      investment: 'Investimento',
      scope: 'Escopo Detalhado',
      benefits: 'Benefícios',
      differentials: 'Diferenciais',
      validity: 'Validade',
      observations: 'Observações Finais',
      warranty: 'Garantia',
      custom: 'Bloco Customizado',
      testimonials: 'Depoimentos',
      results: 'Resultados Alcançados'
    };

    const newBlock: ProposalBlock = {
      id: crypto.randomUUID(),
      type,
      title: titles[type] || type.charAt(0).toUpperCase() + type.slice(1),
      content: '',
      isVisible: true
    };
    updateField('blocks', [...proposal.blocks, newBlock]);
    toast.success('Você adicionou um bloco!', {
      description: `O bloco "${newBlock.title}" foi adicionado com sucesso.`,
      position: 'bottom-right',
    });
  };

  const removeBlock = (id: string) => {
    updateField('blocks', proposal.blocks.filter(b => b.id !== id));
  };

  const updateBlock = (id: string, field: keyof ProposalBlock, value: any) => {
    updateField('blocks', proposal.blocks.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const reorderBlocks = (newBlocks: ProposalBlock[]) => {
    updateField('blocks', newBlocks);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f7]">
      <Toaster richColors />
      {/* Header */}
      <header className="no-print sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className={cn(
              "p-2 hover:bg-slate-100 rounded-lg transition-colors",
              isFullPreview && "hidden"
            )}
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center text-white font-bold text-lg">P</div>
            <h1 className="font-bold text-lg tracking-tight text-black hidden sm:block">PropostaPro</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleNew}
            className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-500 hover:text-black transition-colors"
          >
            <FilePlus className="w-4 h-4" />
            Novo
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-500 hover:text-black transition-colors"
          >
            <Save className="w-4 h-4" />
            Salvar
          </button>
          <button 
            onClick={() => setIsFullPreview(!isFullPreview)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors",
              isFullPreview ? "text-[#0071e3]" : "text-slate-500 hover:text-black"
            )}
          >
            {isFullPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isFullPreview ? 'Editar' : 'Visualizar'}
          </button>
          <button 
            onClick={handleShare}
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-500 hover:text-black transition-colors"
          >
            <Copy className="w-4 h-4" />
            Compartilhar
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#0071e3] hover:bg-[#0077ed] rounded-full transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden h-[calc(100vh-64px)]">
        {/* Mobile Tabs */}
        <div className={cn(
          "no-print md:hidden flex border-b border-slate-100 bg-white/80 backdrop-blur-md",
          isFullPreview && "hidden"
        )}>
          <button 
            onClick={() => setActiveTab('edit')}
            className={cn(
              "flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-b-2",
              activeTab === 'edit' ? "border-black text-black" : "border-transparent text-slate-400"
            )}
          >
            Editor
          </button>
          <button 
            onClick={() => setActiveTab('preview')}
            className={cn(
              "flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors border-b-2",
              activeTab === 'preview' ? "border-black text-black" : "border-transparent text-slate-400"
            )}
          >
            Preview
          </button>
        </div>

        {/* Editor Section */}
        <section className={cn(
          "no-print flex-1 overflow-y-auto p-4 md:p-10 bg-[#f5f5f7] md:border-r border-slate-200 transition-all duration-300",
          activeTab === 'preview' ? "hidden md:block" : "block",
          isFullPreview ? "md:hidden" : "md:block"
        )}>
          <div className="max-w-xl mx-auto space-y-8 pb-24">
            {/* Editor Navigation */}
            <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
              <button 
                onClick={() => setEditorTab('company')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all",
                  editorTab === 'company' ? "bg-black text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Empresa
              </button>
              <button 
                onClick={() => setEditorTab('content')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all",
                  editorTab === 'content' ? "bg-black text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Proposta
              </button>
              <button 
                onClick={() => setEditorTab('style')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all",
                  editorTab === 'style' ? "bg-black text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Palette className="w-3.5 h-3.5" />
                Estilo
              </button>
            </div>

            {/* Editor Content */}
            <AnimatePresence mode="wait">
              {editorTab === 'company' && (
                <motion.div 
                  key="company"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Dados da Empresa</h3>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Nome da Empresa</label>
                        <input 
                          type="text" 
                          value={proposal.companyName}
                          onChange={(e) => updateField('companyName', e.target.value)}
                          className="w-full px-4 py-3 bg-[#f5f5f7] border-none rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Logotipo</label>
                        <div className="flex items-center gap-4">
                          {proposal.companyLogo && (
                            <img src={proposal.companyLogo} alt="Logo" className="w-12 h-12 object-contain rounded-xl border border-slate-100" />
                          )}
                          <label className="flex-1 cursor-pointer px-4 py-3 bg-[#f5f5f7] rounded-2xl hover:bg-slate-200 transition-colors text-sm font-semibold text-slate-600 text-center">
                            {proposal.companyLogo ? 'Alterar Logo' : 'Upload Logo'}
                            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                          </label>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Endereço</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                          <input 
                            type="text" 
                            value={proposal.companyAddress}
                            onChange={(e) => updateField('companyAddress', e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-[#f5f5f7] border-none rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all"
                            placeholder="Rua, Número, Cidade - UF"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Website</label>
                        <div className="relative">
                          <Globe className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                          <input 
                            type="text" 
                            value={proposal.companyWebsite}
                            onChange={(e) => updateField('companyWebsite', e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-[#f5f5f7] border-none rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all"
                            placeholder="www.empresa.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {editorTab === 'content' && (
                <motion.div 
                  key="content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Client & Header */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Cliente & Título</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-semibold text-slate-700">Cliente</label>
                          <input 
                            type="text" 
                            value={proposal.clientLabel}
                            onChange={(e) => updateField('clientLabel', e.target.value)}
                            className="text-[10px] font-bold text-slate-400 bg-transparent border-none p-0 focus:ring-0 text-right uppercase tracking-widest"
                            placeholder="Rótulo (ex: Para)"
                          />
                        </div>
                        <input 
                          type="text" 
                          value={proposal.clientName}
                          onChange={(e) => updateField('clientName', e.target.value)}
                          className="w-full px-4 py-3 bg-[#f5f5f7] border-none rounded-2xl focus:ring-2 focus:ring-black outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-semibold text-slate-700">Empresa Cliente</label>
                          <input 
                            type="text" 
                            value={proposal.clientSeparator}
                            onChange={(e) => updateField('clientSeparator', e.target.value)}
                            className="text-[10px] font-bold text-slate-400 bg-transparent border-none p-0 focus:ring-0 text-right uppercase tracking-widest"
                            placeholder="Separador (ex: @)"
                          />
                        </div>
                        <input 
                          type="text" 
                          value={proposal.clientCompany}
                          onChange={(e) => updateField('clientCompany', e.target.value)}
                          className="w-full px-4 py-3 bg-[#f5f5f7] border-none rounded-2xl focus:ring-2 focus:ring-black outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-semibold text-slate-700">Título da Proposta</label>
                          <input 
                            type="text" 
                            value={proposal.heroBadgeLabel}
                            onChange={(e) => updateField('heroBadgeLabel', e.target.value)}
                            className="text-[10px] font-bold text-slate-400 bg-transparent border-none p-0 focus:ring-0 text-right uppercase tracking-widest"
                            placeholder="Rótulo Destaque (ex: Total)"
                          />
                        </div>
                        <input 
                          type="text" 
                          value={proposal.title}
                          onChange={(e) => updateField('title', e.target.value)}
                          className="w-full px-4 py-3 bg-[#f5f5f7] border-none rounded-2xl focus:ring-2 focus:ring-black outline-none font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Subtítulo</label>
                        <input 
                          type="text" 
                          value={proposal.subtitle}
                          onChange={(e) => updateField('subtitle', e.target.value)}
                          className="w-full px-4 py-3 bg-[#f5f5f7] border-none rounded-2xl focus:ring-2 focus:ring-black outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Descrição Geral</label>
                        <textarea 
                          rows={2}
                          value={proposal.description}
                          onChange={(e) => updateField('description', e.target.value)}
                          className="w-full px-4 py-3 bg-[#f5f5f7] border-none rounded-2xl focus:ring-2 focus:ring-black outline-none resize-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Tags / Categorias</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {proposal.tags.map((tag, idx) => (
                            <div key={idx} className="flex items-center gap-1 px-3 py-1 bg-black text-white rounded-full text-xs font-bold">
                              {tag}
                              <button onClick={() => updateField('tags', proposal.tags.filter((_, i) => i !== idx))} className="hover:text-red-400">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Adicionar tag..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const val = (e.target as HTMLInputElement).value.trim();
                                if (val && !proposal.tags.includes(val)) {
                                  updateField('tags', [...proposal.tags, val]);
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }
                            }}
                            className="flex-1 px-4 py-2 bg-[#f5f5f7] border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-semibold text-slate-700">Data da Proposta</label>
                          <input 
                            type="text" 
                            value={proposal.dateLabel}
                            onChange={(e) => updateField('dateLabel', e.target.value)}
                            className="text-[10px] font-bold text-slate-400 bg-transparent border-none p-0 focus:ring-0 text-right uppercase tracking-widest"
                            placeholder="Rótulo (ex: Data)"
                          />
                        </div>
                        <input 
                          type="text" 
                          value={proposal.customDate}
                          onChange={(e) => updateField('customDate', e.target.value)}
                          className="w-full px-4 py-3 bg-[#f5f5f7] border-none rounded-2xl focus:ring-2 focus:ring-black outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-semibold text-slate-700">Prazo de Entrega</label>
                          <input 
                            type="text" 
                            value={proposal.deliveryTimeLabel}
                            onChange={(e) => updateField('deliveryTimeLabel', e.target.value)}
                            className="text-[10px] font-bold text-slate-400 bg-transparent border-none p-0 focus:ring-0 text-right uppercase tracking-widest"
                            placeholder="Editar Rótulo"
                          />
                        </div>
                        <input 
                          type="text" 
                          value={proposal.deliveryTime}
                          onChange={(e) => updateField('deliveryTime', e.target.value)}
                          className="w-full px-4 py-3 bg-[#f5f5f7] border-none rounded-2xl focus:ring-2 focus:ring-black outline-none"
                          placeholder="Ex: 30 dias úteis"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-semibold text-slate-700">Validade da Proposta</label>
                          <input 
                            type="text" 
                            value={proposal.validityLabel}
                            onChange={(e) => updateField('validityLabel', e.target.value)}
                            className="text-[10px] font-bold text-slate-400 bg-transparent border-none p-0 focus:ring-0 text-right uppercase tracking-widest"
                            placeholder="Editar Rótulo"
                          />
                        </div>
                        <input 
                          type="text" 
                          value={proposal.validity}
                          onChange={(e) => updateField('validity', e.target.value)}
                          className="w-full px-4 py-3 bg-[#f5f5f7] border-none rounded-2xl focus:ring-2 focus:ring-black outline-none"
                          placeholder="Ex: 15 dias"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Block Editor */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Blocos da Proposta</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { type: 'text', label: 'Texto' },
                        { type: 'services', label: 'Serviços' },
                        { type: 'timeline', label: 'Cronograma' },
                        { type: 'investment', label: 'Investimento' },
                        { type: 'scope', label: 'Escopo' },
                        { type: 'benefits', label: 'Benefícios' },
                        { type: 'differentials', label: 'Diferenciais' },
                        { type: 'validity', label: 'Validade' },
                        { type: 'observations', label: 'Observações' },
                        { type: 'warranty', label: 'Garantia' },
                        { type: 'testimonials', label: 'Depoimentos' },
                        { type: 'results', label: 'Resultados' },
                        { type: 'custom', label: 'Customizado' }
                      ].map((btn) => (
                        <button 
                          key={btn.type}
                          onClick={() => addBlock(btn.type as any)}
                          className="text-[10px] font-bold uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                          + {btn.label}
                        </button>
                      ))}
                    </div>
                    <div className="pt-2 flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={proposal.showNumbers}
                          onChange={(e) => updateField('showNumbers', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-black focus:ring-black"
                        />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Exibir Números (01, 02...)</span>
                      </label>
                    </div>

                  <Reorder.Group axis="y" values={proposal.blocks} onReorder={reorderBlocks} className="space-y-3">
                      {proposal.blocks.map((block) => (
                        <Reorder.Item 
                          key={block.id} 
                          value={block}
                          className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
                              <input 
                                type="text" 
                                value={block.title}
                                onChange={(e) => updateBlock(block.id, 'title', e.target.value)}
                                className="text-sm font-bold bg-transparent border-none focus:ring-0 outline-none p-0 w-40"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => updateBlock(block.id, 'isVisible', !block.isVisible)}
                                className={cn(
                                  "p-1.5 rounded-lg transition-colors",
                                  block.isVisible ? "text-blue-500 bg-blue-50" : "text-slate-300 bg-slate-50"
                                )}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => removeBlock(block.id)}
                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {['text', 'scope', 'benefits', 'differentials', 'validity', 'observations', 'warranty', 'custom'].includes(block.type) && (
                            <textarea 
                              rows={3}
                              value={block.content}
                              onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
                              className="w-full px-4 py-3 bg-[#f5f5f7] border-none rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all resize-none text-sm"
                              placeholder={`Escreva o conteúdo de ${block.title.toLowerCase()} aqui...`}
                            />
                          )}

                          {block.type === 'services' && (
                            <div className="space-y-3">
                              {proposal.services.map((s) => (
                                <div key={s.id} className="flex gap-2">
                                  <input 
                                    type="text" 
                                    value={s.description}
                                    onChange={(e) => updateService(s.id, e.target.value)}
                                    className="flex-1 px-4 py-2 bg-[#f5f5f7] border-none rounded-xl text-sm outline-none"
                                  />
                                  <button onClick={() => removeService(s.id)} className="text-slate-300 hover:text-red-500"><X className="w-4 h-4" /></button>
                                </div>
                              ))}
                              <button onClick={addService} className="text-xs font-bold text-blue-600">+ Adicionar Serviço</button>
                            </div>
                          )}

                          {block.type === 'investment' && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400">Moeda</label>
                                  <select 
                                    value={proposal.currency}
                                    onChange={(e) => updateField('currency', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#f5f5f7] border-none rounded-xl text-sm outline-none font-bold"
                                  >
                                    <option value="BRL">Real (R$)</option>
                                    <option value="USD">Dólar ($)</option>
                                    <option value="EUR">Euro (€)</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400">Valor</label>
                                  <input 
                                    type="number" 
                                    value={proposal.totalValue}
                                    onChange={(e) => updateField('totalValue', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#f5f5f7] border-none rounded-xl text-sm outline-none font-bold"
                                    placeholder="0.00"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <label className="text-[10px] font-bold text-slate-400">Condições de Pagamento</label>
                                  <input 
                                    type="text" 
                                    value={proposal.paymentTermsLabel}
                                    onChange={(e) => updateField('paymentTermsLabel', e.target.value)}
                                    className="text-[9px] font-bold text-slate-300 bg-transparent border-none p-0 focus:ring-0 text-right uppercase tracking-widest"
                                    placeholder="Editar Rótulo"
                                  />
                                </div>
                                <input 
                                  type="text" 
                                  value={proposal.paymentTerms}
                                  onChange={(e) => updateField('paymentTerms', e.target.value)}
                                  className="w-full px-3 py-2 bg-[#f5f5f7] border-none rounded-xl text-sm outline-none"
                                  placeholder="Ex: 50% entrada + 50% entrega"
                                />
                              </div>
                            </div>
                          )}

                          {block.type === 'timeline' && (
                            <div className="space-y-3">
                              {proposal.timeline.map((s) => (
                                <div key={s.id} className="flex gap-2 items-center">
                                  <input 
                                    type="text" 
                                    value={s.label}
                                    onChange={(e) => updateTimelineStep(s.id, 'label', e.target.value)}
                                    className="flex-1 px-3 py-2 bg-[#f5f5f7] border-none rounded-xl text-sm outline-none"
                                    placeholder="Etapa"
                                  />
                                  <input 
                                    type="text" 
                                    value={s.duration}
                                    onChange={(e) => updateTimelineStep(s.id, 'duration', e.target.value)}
                                    className="w-24 px-3 py-2 bg-[#f5f5f7] border-none rounded-xl text-sm outline-none"
                                    placeholder="Duração"
                                  />
                                  <button onClick={() => removeTimelineStep(s.id)} className="text-slate-300 hover:text-red-500"><X className="w-4 h-4" /></button>
                                </div>
                              ))}
                              <button onClick={addTimelineStep} className="text-xs font-bold text-blue-600">+ Adicionar Etapa</button>
                            </div>
                          )}

                          {block.type === 'testimonials' && (
                            <div className="space-y-4">
                              {proposal.testimonials.map((t) => (
                                <div key={t.id} className="p-4 bg-[#f5f5f7] rounded-2xl space-y-3 relative group/item">
                                  <button 
                                    onClick={() => removeTestimonial(t.id)} 
                                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <div className="grid grid-cols-2 gap-2">
                                    <input 
                                      type="text" 
                                      value={t.author}
                                      onChange={(e) => updateTestimonial(t.id, 'author', e.target.value)}
                                      className="px-3 py-1.5 bg-white border-none rounded-lg text-xs outline-none font-bold"
                                      placeholder="Nome do Cliente"
                                    />
                                    <input 
                                      type="text" 
                                      value={t.role}
                                      onChange={(e) => updateTestimonial(t.id, 'role', e.target.value)}
                                      className="px-3 py-1.5 bg-white border-none rounded-lg text-xs outline-none"
                                      placeholder="Cargo / Empresa"
                                    />
                                  </div>
                                  <textarea 
                                    rows={2}
                                    value={t.content}
                                    onChange={(e) => updateTestimonial(t.id, 'content', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border-none rounded-lg text-xs outline-none resize-none"
                                    placeholder="O que o cliente disse..."
                                  />
                                </div>
                              ))}
                              <button onClick={addTestimonial} className="text-xs font-bold text-blue-600">+ Adicionar Depoimento</button>
                            </div>
                          )}

                          {block.type === 'results' && (
                            <div className="space-y-4">
                              {proposal.results.map((r) => (
                                <div key={r.id} className="p-4 bg-[#f5f5f7] rounded-2xl space-y-3 relative group/item">
                                  <button 
                                    onClick={() => removeResult(r.id)} 
                                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <div className="grid grid-cols-2 gap-2">
                                    <input 
                                      type="text" 
                                      value={r.value}
                                      onChange={(e) => updateResult(r.id, 'value', e.target.value)}
                                      className="px-3 py-1.5 bg-white border-none rounded-lg text-xs outline-none font-bold"
                                      placeholder="Valor (ex: 50%)"
                                    />
                                    <input 
                                      type="text" 
                                      value={r.label}
                                      onChange={(e) => updateResult(r.id, 'label', e.target.value)}
                                      className="px-3 py-1.5 bg-white border-none rounded-lg text-xs outline-none"
                                      placeholder="Métrica (ex: ROI)"
                                    />
                                  </div>
                                  <input 
                                    type="text" 
                                    value={r.description}
                                    onChange={(e) => updateResult(r.id, 'description', e.target.value)}
                                    className="w-full px-3 py-1.5 bg-white border-none rounded-lg text-xs outline-none"
                                    placeholder="Breve descrição do resultado"
                                  />
                                </div>
                              ))}
                              <button onClick={addResult} className="text-xs font-bold text-blue-600">+ Adicionar Resultado</button>
                            </div>
                          )}
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  </div>

                  {/* Footer Texts */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Textos de Rodapé</h3>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-semibold text-slate-700">Observações Finais</label>
                          <input 
                            type="text" 
                            value={proposal.finalObservationsLabel}
                            onChange={(e) => updateField('finalObservationsLabel', e.target.value)}
                            className="text-[10px] font-bold text-slate-400 bg-transparent border-none p-0 focus:ring-0 text-right uppercase tracking-widest"
                            placeholder="Editar Rótulo"
                          />
                        </div>
                        <textarea 
                          rows={2}
                          value={proposal.finalObservations}
                          onChange={(e) => updateField('finalObservations', e.target.value)}
                          className="w-full px-4 py-3 bg-[#f5f5f7] border-none rounded-2xl focus:ring-2 focus:ring-black outline-none resize-none"
                          placeholder="Ex: Valores sujeitos a alteração..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-semibold text-slate-700">Garantia</label>
                          <input 
                            type="text" 
                            value={proposal.warrantyLabel}
                            onChange={(e) => updateField('warrantyLabel', e.target.value)}
                            className="text-[10px] font-bold text-slate-400 bg-transparent border-none p-0 focus:ring-0 text-right uppercase tracking-widest"
                            placeholder="Editar Rótulo"
                          />
                        </div>
                        <textarea 
                          rows={2}
                          value={proposal.warranty}
                          onChange={(e) => updateField('warranty', e.target.value)}
                          className="w-full px-4 py-3 bg-[#f5f5f7] border-none rounded-2xl focus:ring-2 focus:ring-black outline-none resize-none"
                          placeholder="Ex: Suporte técnico incluso por 6 meses..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700">Marca Rodapé</label>
                          <input 
                            type="text" 
                            value={proposal.footerBrandText}
                            onChange={(e) => updateField('footerBrandText', e.target.value)}
                            className="w-full px-4 py-3 bg-[#f5f5f7] border-none rounded-2xl focus:ring-2 focus:ring-black outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700">Subtexto Rodapé</label>
                          <input 
                            type="text" 
                            value={proposal.footerSubText}
                            onChange={(e) => updateField('footerSubText', e.target.value)}
                            className="w-full px-4 py-3 bg-[#f5f5f7] border-none rounded-2xl focus:ring-2 focus:ring-black outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {editorTab === 'style' && (
                <motion.div 
                  key="style"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Personalização Visual</h3>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700">Cor de Destaque</label>
                        <div className="flex flex-wrap gap-3">
                          {['#0071e3', '#000000', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map((color) => (
                            <button 
                              key={color}
                              onClick={() => updateField('accentColor', color)}
                              className={cn(
                                "w-10 h-10 rounded-full border-2 transition-all",
                                proposal.accentColor === color ? "border-black scale-110 shadow-lg" : "border-transparent hover:scale-105"
                              )}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">#</span>
                            <input 
                              type="text" 
                              value={proposal.accentColor.replace('#', '')}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val.length <= 6) updateField('accentColor', `#${val}`);
                              }}
                              className="w-full pl-7 pr-4 py-2 bg-[#f5f5f7] border-none rounded-xl focus:ring-2 focus:ring-black outline-none text-sm font-mono uppercase"
                              placeholder="HEX"
                            />
                          </div>
                          <input 
                            type="color" 
                            value={proposal.accentColor}
                            onChange={(e) => updateField('accentColor', e.target.value)}
                            className="w-10 h-10 rounded-xl border-none outline-none cursor-pointer bg-transparent"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700">Tipografia</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {(['sans', 'serif', 'mono', 'display', 'modern', 'clean'] as const).map((font) => (
                            <button 
                              key={font}
                              onClick={() => updateField('fontFamily', font)}
                              className={cn(
                                "py-3 rounded-2xl border-2 text-xs font-bold capitalize transition-all",
                                proposal.fontFamily === font ? "border-black bg-black text-white" : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                              )}
                            >
                              {font}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700">Tamanho do Texto</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['small', 'medium', 'large'] as const).map((size) => (
                            <button 
                              key={size}
                              onClick={() => updateField('baseTextSize', size)}
                              className={cn(
                                "py-3 rounded-2xl border-2 text-xs font-bold capitalize transition-all",
                                proposal.baseTextSize === size ? "border-black bg-black text-white" : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                              )}
                            >
                              {size === 'small' ? 'Pequeno' : size === 'medium' ? 'Médio' : 'Grande'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Preview Section */}
        <section className={cn(
          "flex-1 overflow-y-auto bg-white p-4 md:p-16 print:p-0 relative",
          (activeTab === 'edit' && !isFullPreview) ? "hidden md:block" : "block"
        )}>
          {/* Scroll Progress Bar */}
          <motion.div 
            className="fixed top-0 left-0 right-0 h-1 z-50 origin-left print:hidden"
            style={{ scaleX, backgroundColor: proposal.accentColor }}
          />

          <div className={cn(
            "max-w-[850px] mx-auto min-h-[1122px] print:min-h-0",
            proposal.fontFamily === 'serif' ? "font-serif" : 
            proposal.fontFamily === 'mono' ? "font-mono" : 
            proposal.fontFamily === 'display' ? "font-display" :
            proposal.fontFamily === 'modern' ? "font-modern" :
            proposal.fontFamily === 'clean' ? "font-clean" :
            "font-sans",
            proposal.baseTextSize === 'small' ? "text-sm" :
            proposal.baseTextSize === 'large' ? "text-lg" :
            "text-base"
          )}>
            <div className="space-y-24 pb-32">
              {/* Hero */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-16 flex flex-col items-center text-center"
              >
                {(proposal.companyLogo || proposal.companyName || proposal.customDate) && (
                  <div className="flex flex-col items-center w-full gap-6">
                    {proposal.companyLogo ? (
                      <motion.img 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        src={proposal.companyLogo} alt="Logo" className="h-12 object-contain" 
                      />
                    ) : proposal.companyName ? (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl font-bold tracking-tight"
                      >
                        {proposal.companyName}
                      </motion.div>
                    ) : null}
                    {proposal.customDate && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-sm font-bold uppercase tracking-widest text-slate-400"
                      >
                        {proposal.customDate}
                      </motion.div>
                    )}
                  </div>
                )}

                <div className="space-y-8 flex flex-col items-center">
                  {proposal.title && (
                    <h2 className={cn(
                      "animate-title font-extrabold tracking-tight text-black leading-[0.95] max-w-4xl",
                      proposal.baseTextSize === 'small' ? "text-5xl md:text-7xl" :
                      proposal.baseTextSize === 'large' ? "text-7xl md:text-9xl" :
                      "text-6xl md:text-8xl"
                    )}>
                      {proposal.title}
                    </h2>
                  )}
                  {proposal.subtitle && (
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.8 }}
                      className={cn(
                        "font-medium max-w-2xl leading-tight",
                        proposal.baseTextSize === 'small' ? "text-xl md:text-2xl" :
                        proposal.baseTextSize === 'large' ? "text-3xl md:text-4xl" :
                        "text-2xl md:text-3xl text-slate-500"
                      )}
                    >
                      {proposal.subtitle}
                    </motion.p>
                  )}
                  
                  {proposal.description && (
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className={cn(
                        "text-slate-400 max-w-2xl leading-relaxed",
                        proposal.baseTextSize === 'small' ? "text-base" :
                        proposal.baseTextSize === 'large' ? "text-xl" :
                        "text-lg"
                      )}
                    >
                      {proposal.description}
                    </motion.p>
                  )}

                  {proposal.tags.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6, staggerChildren: 0.1 }}
                      className="flex flex-wrap justify-center gap-3 pt-4"
                    >
                      {proposal.tags.map((tag, idx) => (
                        <motion.div 
                          key={idx} 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6 + (idx * 0.1) }}
                          className={cn(
                            "px-4 py-2 bg-slate-100 text-slate-600 rounded-full font-bold uppercase tracking-widest",
                            proposal.baseTextSize === 'small' ? "text-[10px]" :
                            proposal.baseTextSize === 'large' ? "text-sm" :
                            "text-xs"
                          )}
                        >
                          {tag}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                  
                  {(proposal.clientName || proposal.clientCompany) && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="pt-8 flex items-center justify-center gap-6"
                    >
                      <div className={cn(
                        "text-slate-400 font-medium",
                        proposal.baseTextSize === 'small' ? "text-sm" :
                        proposal.baseTextSize === 'large' ? "text-lg" :
                        "text-base"
                      )}>
                        {proposal.clientLabel} {proposal.clientName && <span className="text-black font-bold">{proposal.clientName}</span>} {proposal.clientCompany && <>{proposal.clientSeparator} {proposal.clientCompany}</>}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Blocks */}
              <div className="space-y-24">
                {proposal.blocks.filter(b => b.isVisible).map((block, blockIdx) => {
                  // Skip rendering if it's a text-based block and content is empty
                  if (['text', 'scope', 'benefits', 'differentials', 'validity', 'observations', 'warranty', 'custom'].includes(block.type) && !block.content.trim()) {
                    return null;
                  }
                  
                  // Skip services if list is empty
                  if (block.type === 'services' && proposal.services.length === 0) {
                    return null;
                  }

                  // Skip timeline if list is empty
                  if (block.type === 'timeline' && proposal.timeline.length === 0) {
                    return null;
                  }

                  // Skip investment if total value is 0
                  if (block.type === 'investment' && proposal.totalValue === '0') {
                    return null;
                  }

                  // Skip testimonials if list is empty
                  if (block.type === 'testimonials' && proposal.testimonials.length === 0) {
                    return null;
                  }

                  // Skip results if list is empty
                  if (block.type === 'results' && proposal.results.length === 0) {
                    return null;
                  }

                  return (
                    <motion.div 
                      key={block.id} 
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="space-y-12"
                    >
                      {['text', 'scope', 'benefits', 'differentials', 'validity', 'observations', 'warranty', 'custom'].includes(block.type) && (
                        <div className="space-y-8 flex flex-col items-center text-center">
                          <div className="flex flex-col items-center gap-4">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: 48 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.3, duration: 0.8 }}
                              className="h-px bg-slate-100"
                            ></motion.div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">{block.title}</h3>
                          </div>
                          <p className={cn(
                            "font-bold text-black leading-tight max-w-3xl whitespace-pre-wrap mx-auto",
                            proposal.baseTextSize === 'small' ? "text-2xl md:text-3xl" :
                            proposal.baseTextSize === 'large' ? "text-4xl md:text-5xl" :
                            "text-3xl md:text-4xl"
                          )}>
                            {block.content}
                          </p>
                        </div>
                      )}

                      {block.type === 'services' && (
                        <div className="space-y-8">
                          <div className="flex items-center gap-4">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: 48 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.3, duration: 0.8 }}
                              className="h-px bg-slate-100"
                            ></motion.div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">{block.title}</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {proposal.services.map((s, idx) => (
                                <motion.div 
                                  key={s.id} 
                                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                                  whileHover={{ 
                                    y: -8, 
                                    backgroundColor: proposal.accentColor,
                                    color: "#ffffff",
                                    transition: { duration: 0.3 } 
                                  }}
                                  className="p-8 md:p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center min-h-[280px] bg-[#f5f5f7] text-black transition-shadow hover:shadow-2xl cursor-default group gap-4"
                                >
                                    {proposal.showNumbers && (
                                      <div className="text-sm font-bold uppercase tracking-widest opacity-50 group-hover:opacity-100 transition-opacity">0{idx + 1}</div>
                                    )}
                                    <div className={cn(
                                      "font-bold leading-tight max-w-xs break-words",
                                      proposal.baseTextSize === 'small' ? "text-xl md:text-2xl" :
                                      proposal.baseTextSize === 'large' ? "text-3xl md:text-4xl" :
                                      "text-2xl md:text-3xl"
                                    )}>{s.description}</div>
                                  </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {block.type === 'timeline' && (
                        <div className="space-y-8 flex flex-col items-center">
                          <div className="flex flex-col items-center gap-4">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: 48 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.3, duration: 0.8 }}
                              className="h-px bg-slate-100"
                            ></motion.div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">{block.title}</h3>
                          </div>
                          <div className="w-full flex flex-col items-center">
                            {proposal.timeline.map((step, idx) => (
                              <React.Fragment key={step.id}>
                                <motion.div 
                                  initial={{ opacity: 0, y: 20 }}
                                  whileInView={{ opacity: 1, y: 0 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                                  className="flex flex-col items-center group text-center gap-4"
                                >
                                  {proposal.showNumbers && (
                                    <div className={cn(
                                      "font-black opacity-10 transition-opacity group-hover:opacity-30 leading-none",
                                      proposal.baseTextSize === 'small' ? "text-4xl" :
                                      proposal.baseTextSize === 'large' ? "text-6xl" :
                                      "text-5xl"
                                    )} style={{ color: proposal.accentColor }}>0{idx + 1}</div>
                                  )}
                                  <div className="space-y-2">
                                    <div className={cn(
                                      "font-bold text-black leading-tight",
                                      proposal.baseTextSize === 'small' ? "text-xl md:text-2xl" :
                                      proposal.baseTextSize === 'large' ? "text-3xl md:text-4xl" :
                                      "text-2xl md:text-3xl"
                                    )}>{step.label}</div>
                                    <div className="text-slate-400 font-medium tracking-wide uppercase text-xs">{step.duration}</div>
                                  </div>
                                </motion.div>
                                {idx < proposal.timeline.length - 1 && (
                                  <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    whileInView={{ height: 48, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="w-px my-6"
                                    style={{ backgroundColor: proposal.accentColor + '40' }}
                                  />
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      )}

                      {block.type === 'testimonials' && (
                        <div className="space-y-12">
                          <div className="flex flex-col items-center gap-4">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: 48 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.3, duration: 0.8 }}
                              className="h-px bg-slate-100"
                            ></motion.div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">{block.title}</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {proposal.testimonials.map((t, idx) => (
                              <motion.div 
                                key={t.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm space-y-6 flex flex-col items-center text-center"
                              >
                                <div className={cn(
                                  "font-medium text-slate-600 italic leading-relaxed",
                                  proposal.baseTextSize === 'small' ? "text-lg md:text-xl" :
                                  proposal.baseTextSize === 'large' ? "text-2xl md:text-3xl" :
                                  "text-xl md:text-2xl"
                                )}>
                                  "{t.content}"
                                </div>
                                <div className="space-y-1">
                                  <div className="font-bold text-black">{t.author}</div>
                                  <div className="text-sm text-slate-400 font-medium">{t.role}</div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {block.type === 'results' && (
                        <div className="space-y-12">
                          <div className="flex flex-col items-center gap-4">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: 48 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.3, duration: 0.8 }}
                              className="h-px bg-slate-100"
                            ></motion.div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">{block.title}</h3>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {proposal.results.map((r, idx) => (
                              <motion.div 
                                key={r.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 rounded-[2.5rem] bg-[#f5f5f7] flex flex-col items-center text-center space-y-4"
                              >
                                <div className={cn(
                                  "font-black tracking-tighter",
                                  proposal.baseTextSize === 'small' ? "text-4xl" :
                                  proposal.baseTextSize === 'large' ? "text-6xl" :
                                  "text-5xl"
                                )} style={{ color: proposal.accentColor }}>
                                  {r.value}
                                </div>
                                <div className="space-y-1">
                                  <div className="text-sm font-bold uppercase tracking-widest text-black">{r.label}</div>
                                  <div className="text-xs text-slate-400 font-medium max-w-[180px]">{r.description}</div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {block.type === 'investment' && (
                        <div className="space-y-8">
                          <div className="flex flex-col items-center gap-4">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: 48 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.3, duration: 0.8 }}
                              className="h-px bg-slate-100"
                            ></motion.div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">{block.title}</h3>
                          </div>
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            className="bg-[#f5f5f7] rounded-[3rem] p-12 md:p-20 space-y-12 text-center flex flex-col items-center"
                          >
                            <div className="space-y-4 w-full">
                              <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                                className={cn(
                                  "font-extrabold tracking-tighter text-black break-words leading-none",
                                  proposal.baseTextSize === 'small' ? "text-4xl sm:text-5xl md:text-7xl" :
                                  proposal.baseTextSize === 'large' ? "text-6xl sm:text-7xl md:text-9xl" :
                                  "text-5xl sm:text-6xl md:text-8xl"
                                )}
                              >
                                {formatCurrency(proposal.totalValue, proposal.currency)}
                              </motion.div>
                            </div>
                            <div className="pt-12 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                              {proposal.paymentTerms && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  whileInView={{ opacity: 1, y: 0 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: 0.4 }}
                                  className="space-y-2"
                                >
                                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{proposal.paymentTermsLabel}</div>
                                  <div className={cn(
                                    "font-bold",
                                    proposal.baseTextSize === 'small' ? "text-lg" :
                                    proposal.baseTextSize === 'large' ? "text-2xl" :
                                    "text-xl"
                                  )}>{proposal.paymentTerms}</div>
                                </motion.div>
                              )}
                              {proposal.deliveryTime && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  whileInView={{ opacity: 1, y: 0 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: 0.5 }}
                                  className="space-y-2"
                                >
                                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{proposal.deliveryTimeLabel}</div>
                                  <div className={cn(
                                    "font-bold",
                                    proposal.baseTextSize === 'small' ? "text-lg" :
                                    proposal.baseTextSize === 'large' ? "text-2xl" :
                                    "text-xl"
                                  )}>{proposal.deliveryTime}</div>
                                </motion.div>
                              )}
                              {proposal.validity && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  whileInView={{ opacity: 1, y: 0 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: 0.6 }}
                                  className="space-y-2"
                                >
                                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{proposal.validityLabel}</div>
                                  <div className={cn(
                                    "font-bold",
                                    proposal.baseTextSize === 'small' ? "text-lg" :
                                    proposal.baseTextSize === 'large' ? "text-2xl" :
                                    "text-xl"
                                  )}>{proposal.validity}</div>
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Final Touches */}
              {(proposal.finalObservations || proposal.warranty) && (
                <div className="space-y-12 pt-12 border-t border-slate-100 flex flex-col items-center text-center">
                  {proposal.finalObservations && (
                    <div className="space-y-4">
                      <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{proposal.finalObservationsLabel}</div>
                      <div className="text-lg text-slate-600 whitespace-pre-wrap max-w-2xl">{proposal.finalObservations}</div>
                    </div>
                  )}
                  {proposal.warranty && (
                    <div className="space-y-4">
                      <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{proposal.warrantyLabel}</div>
                      <div className="text-lg text-slate-600 whitespace-pre-wrap max-w-2xl">{proposal.warranty}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              {(proposal.companyName || proposal.companyAddress || proposal.companyWebsite || proposal.footerBrandText || proposal.footerSubText) && (
                <div className="pt-24 border-t border-slate-100 flex flex-col items-center text-center gap-12">
                  <div className="space-y-4">
                    {proposal.companyName && <div className="text-2xl font-extrabold tracking-tight">{proposal.companyName}</div>}
                    {(proposal.companyAddress || proposal.companyWebsite) && (
                      <div className="space-y-1 text-sm text-slate-400 font-medium">
                        {proposal.companyAddress && <p>{proposal.companyAddress}</p>}
                        {proposal.companyWebsite && <p>{proposal.companyWebsite}</p>}
                      </div>
                    )}
                  </div>
                  {(proposal.footerBrandText || proposal.footerSubText) && (
                    <div className="space-y-2">
                      {proposal.footerBrandText && <div className="text-sm font-bold" style={{ color: proposal.accentColor }}>{proposal.footerBrandText}</div>}
                      {proposal.footerSubText && <div className="text-xs text-slate-300">{proposal.footerSubText}</div>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Sidebar - Saved Proposals */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-black" />
                  <h2 className="font-bold text-slate-800">Histórico</h2>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {savedProposals.map((p) => (
                  <div 
                    key={p.id}
                    onClick={() => handleLoad(p)}
                    className={cn(
                      "group p-4 rounded-2xl border transition-all cursor-pointer",
                      proposal.id === p.id ? "bg-black text-white border-black" : "bg-white border-slate-100 hover:border-slate-200"
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold line-clamp-1 text-sm">{p.title}</h3>
                      <button onClick={(e) => handleDelete(p.id, e)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="text-xs opacity-60">{p.clientName || 'Sem cliente'}</div>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-slate-100">
                <button onClick={handleNew} className="w-full py-3 bg-black text-white rounded-xl font-bold shadow-lg">+ Nova Proposta</button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
