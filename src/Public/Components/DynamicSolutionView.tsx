import React, { useState, memo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Header from '../Shared/Header/Header';
import Footer from '../Shared/Footer/Footer';
import { ThemeSettings, HeaderSettings, FooterSettings, Solution, Problem, SolutionSection } from '../../types';
import { apiService } from '../Services/api';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  CheckCircle,
  Cpu,
  Server,
  Terminal,
  ArrowRight,
  User,
  Mail,
  Building2,
  Phone,
  MessageSquare,
  ChevronDown
} from 'lucide-react';

interface SolutionViewProps {
  theme: ThemeSettings;
  headerSettings: HeaderSettings;
  footerSettings: FooterSettings;
  isAdminLoggedIn: boolean;
}

interface AlternatingSectionProps {
  id: string;
  index: number;
  section: SolutionSection;
  extraContent?: React.ReactNode;
}

// Extract and format bullet points from any section's custom items data
const getBulletPoints = (section: SolutionSection): string[] => {
  if (!section.items || !Array.isArray(section.items) || section.items.length === 0) return [];

  return section.items.map((item, idx) => {
    if (typeof item === 'string') return item;
    if (typeof item !== 'object' || item === null) return '';

    // Extract human-readable string representation based on section ID and schema structure
    switch (section.id) {
      case 'challenges':
        return item.text || '';
      case 'features':
        return item.title ? `${item.title}: ${item.desc || ''}` : (item.text || '');
      case 'workflow':
        return item.title ? `Step ${idx + 1} - ${item.title}: ${item.desc || ''}` : (item.text || '');
      case 'benefits':
        return item.metric ? `${item.metric} — ${item.label || ''}` : (item.text || '');
      case 'ai-modules':
        return item.name ? `${item.name} (${item.type || ''}): Accuracy ${item.accuracy || ''}` : (item.text || '');
      case 'hardware':
        return item.name ? `${item.name}: ${item.specs || ''}` : (item.text || '');
      case 'software':
        return item.name ? `${item.name}: Platform: ${item.platform || ''}` : (item.text || '');
      case 'case-study':
        return item.label ? `${item.label}: ${item.value || ''}` : (item.text || '');
      case 'faqs':
        return item.q ? `Q: ${item.q} — A: ${item.a || ''}` : (item.text || '');
      default:
        return item.text || item.title || item.label || item.name || '';
    }
  }).filter(str => str && str.trim() !== '');
};

// Memoized Alternating Section Component for optimal rendering performance
const AlternatingSection = memo(({ id, index, section, extraContent }: AlternatingSectionProps) => {
  if (section.visible === false) return null;

  const hasHeading = !!section.heading && typeof section.heading === 'string' && section.heading.trim() !== '';
  const hasSubHeading = !!section.subHeading && typeof section.subHeading === 'string' && section.subHeading.trim() !== '';
  const hasDescription = !!section.description && typeof section.description === 'string' && section.description.trim() !== '';
  const hasImage = !!section.image && typeof section.image === 'string' && section.image.trim() !== '';
  const bulletPoints = getBulletPoints(section);
  const hasBullets = bulletPoints.length > 0;

  // Render only if there is some valid text/content to display
  if (!hasHeading && !hasSubHeading && !hasDescription && !hasBullets && !extraContent) {
    return null;
  }

  // Alternate background colors: Even rendered sections get White, Odd get very light grey
  const bgClass = index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';

  // Odd sections (index 0, 2, 4...) -> Text Left, Image Right
  // Even sections (index 1, 3, 5...) -> Image Left, Text Right
  const isImageLeft = index % 2 === 1;

  return (
    <section 
      id={id} 
      className={`py-16 md:py-24 border-b border-slate-100 transition-colors duration-300 ${bgClass}`}
    >
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        <motion.div 
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16"
        >
          {/* Text Content Column: Always order-1 on mobile/tablet to appear first */}
          <div 
            className={`w-full lg:w-1/2 space-y-6 ${
              isImageLeft ? 'order-1 lg:order-2' : 'order-1 lg:order-1'
            }`}
          >
            {/* Sub Heading */}
            {hasSubHeading && (
              <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-[#0059bb] bg-[#0059bb]/5 px-3 py-1 rounded-full border border-[#0059bb]/10">
                {section.subHeading}
              </span>
            )}

            {/* Heading */}
            {hasHeading && (
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#00244a] tracking-tight leading-tight">
                {section.heading}
              </h2>
            )}

            {/* Paragraph / Description */}
            {hasDescription && (
              <p className="text-sm md:text-base text-slate-600 leading-relaxed font-medium">
                {section.description}
              </p>
            )}

            {/* Bullet Points */}
            {hasBullets && (
              <ul className="space-y-3 pt-2">
                {bulletPoints.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-[#0059bb]/5 text-[#0059bb] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Specialized interactive / visual content payload */}
            {extraContent && (
              <div className="pt-2 w-full">
                {extraContent}
              </div>
            )}
          </div>

          {/* Image Column: Always order-2 on mobile/tablet to appear second */}
          {hasImage && (
            <div 
              className={`w-full lg:w-1/2 flex items-center justify-center ${
                isImageLeft ? 'order-2 lg:order-1' : 'order-2 lg:order-2'
              }`}
            >
              <motion.div 
                whileHover={{ scale: 1.015 }}
                transition={{ duration: 0.3 }}
                className="w-full aspect-video md:aspect-[4/3] lg:aspect-video xl:aspect-[4/3] bg-white rounded-2xl lg:rounded-3xl overflow-hidden flex items-center justify-center shadow-lg border border-slate-100/80 group transition-all"
              >
                <img
                  src={section.image}
                  alt={section.heading || 'Enterprise Security Solution Detail'}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
});

AlternatingSection.displayName = 'AlternatingSection';

export default function DynamicSolutionView({
  theme,
  headerSettings,
  footerSettings,
  isAdminLoggedIn
}: SolutionViewProps) {
  const { industryPublicId, institutionPublicId, areaPublicId, problemPublicId, modulePublicId, solutionPublicId } = useParams<{
    industryPublicId: string;
    institutionPublicId: string;
    areaPublicId: string;
    problemPublicId: string;
    modulePublicId: string;
    solutionPublicId?: string;
  }>();
  const navigate = useNavigate();

  // Fetch mapping relations & content from database with React Query
  const { data: industryData, isLoading: isIndustryLoading } = useQuery({
    queryKey: ['publicIndustry', industryPublicId],
    queryFn: () => apiService.getPublicIndustry(industryPublicId!),
    enabled: !!industryPublicId,
  });

  const { data: institutionData, isLoading: isInstitutionLoading } = useQuery({
    queryKey: ['publicInstitution', institutionPublicId],
    queryFn: () => apiService.getPublicInstitution(institutionPublicId!),
    enabled: !!institutionPublicId,
  });

  const { data: areaData, isLoading: isAreaLoading } = useQuery({
    queryKey: ['publicArea', areaPublicId],
    queryFn: () => apiService.getPublicArea(areaPublicId!),
    enabled: !!areaPublicId,
  });

  const { data: problemData, isLoading: isProblemLoading } = useQuery({
    queryKey: ['publicProblem', problemPublicId],
    queryFn: () => apiService.getPublicProblem(problemPublicId!),
    enabled: !!problemPublicId,
  });

  const { data: moduleSolutionData, isLoading: isModuleSolutionLoading } = useQuery({
    queryKey: ['publicModuleSolution', modulePublicId],
    queryFn: () => apiService.getPublicModuleSolution(modulePublicId!),
    enabled: !!modulePublicId,
  });

  const { data: solutionDetailData, isLoading: isSolutionDetailLoading } = useQuery({
    queryKey: ['publicSolutionDetail', solutionPublicId],
    queryFn: () => apiService.getPublicSolutionDetail(solutionPublicId!),
    enabled: !!solutionPublicId,
  });

  const industry = industryData?.industry;
  const institution = institutionData?.institution;
  const zone = areaData?.area;
  const problem = problemData?.problem;
  const moduleObj = moduleSolutionData?.module;
  const solution = solutionDetailData?.solution || moduleSolutionData?.solution;

  const loading = isIndustryLoading || isInstitutionLoading || isAreaLoading || isProblemLoading || isModuleSolutionLoading || isSolutionDetailLoading;

  // Robust SEO generation for the Module Solution Page
  useEffect(() => {
    if (!moduleObj || !problem) return;

    const seoTitle = moduleObj.seo?.metaTitle || `${moduleObj.name} - ${problem.name} AI Solution | NX Solution`;
    const seoDesc = moduleObj.seo?.metaDescription || moduleObj.shortDescription || moduleObj.description || `Deploy our advanced ${moduleObj.name} AI solution module to automate threat tracking and neutralize operational challenges in ${problem.name}.`;
    const seoKeywords = moduleObj.seo?.keywords || `${moduleObj.name.toLowerCase()}, ${problem.name.toLowerCase()}, ai module, enterprise safety, automated mitigation, NX Solution`;

    document.title = seoTitle;

    let descTag = document.querySelector('meta[name="description"]');
    if (!descTag) {
      descTag = document.createElement('meta');
      descTag.setAttribute('name', 'description');
      document.head.appendChild(descTag);
    }
    descTag.setAttribute('content', seoDesc);

    let keywordsTag = document.querySelector('meta[name="keywords"]');
    if (!keywordsTag) {
      keywordsTag = document.createElement('meta');
      keywordsTag.setAttribute('name', 'keywords');
      document.head.appendChild(keywordsTag);
    }
    keywordsTag.setAttribute('content', seoKeywords);
  }, [moduleObj, problem]);

  let errorMsg: string | null = null;
  if (!problemPublicId || !modulePublicId) {
    errorMsg = 'No active Problem or Module parameter was provided in the route.';
  } else if (!loading && (!problem || !solution || !moduleObj)) {
    errorMsg = 'No active security Solution is currently mapped to this module.';
  }

  // Accordion State for FAQs
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // CRM Lead Form State
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.email) return;

    try {
      setIsSubmittingLead(true);
      await axios.post('/api/leads/solution', {
        ...leadForm,
        industryId: industry?.id || '',
        institutionId: institution?.id || '',
        zoneId: zone?.id || '',
        problemId: problem?.id || '',
        solutionId: solution?.id || ''
      });
      setLeadSuccess(true);
      setLeadForm({ name: '', email: '', phone: '', company: '', message: '' });
    } catch (err) {
      console.error('Lead submit failed:', err);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header settings={headerSettings} theme={theme} isAdminLoggedIn={isAdminLoggedIn} />
        <main className="flex-grow flex items-center justify-center py-24">
          <div className="text-center space-y-4">
            <div className="w-10 h-10 border-4 border-[#0059bb] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Initializing Enterprise Blueprint...</p>
          </div>
        </main>
        <Footer settings={footerSettings} theme={theme} />
      </div>
    );
  }

  if (errorMsg || !solution || !problem) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header settings={headerSettings} theme={theme} isAdminLoggedIn={isAdminLoggedIn} />
        <main className="flex-grow flex items-center justify-center py-24">
          <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4 animate-pulse" />
            <h1 className="text-lg font-extrabold text-[#00244a] mb-2">Architectural Mapping Required</h1>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              {errorMsg || 'A system mapping error occurred. Please verify relationships inside the administration workspace.'}
            </p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => navigate(-1)} 
                className="px-4 py-2 bg-[#0059bb] hover:bg-[#004796] text-white font-bold text-xs rounded-lg transition-colors"
              >
                Go Back
              </button>
              <Link 
                to="/" 
                className="text-xs text-[#0059bb] hover:underline font-bold"
              >
                Return to Home Portal
              </Link>
            </div>
          </div>
        </main>
        <Footer settings={footerSettings} theme={theme} />
      </div>
    );
  }

  // Extract Section Configurations Helper
  const getSection = (id: string): SolutionSection => {
    const fallback: SolutionSection = {
      id,
      name: '',
      heading: '',
      subHeading: '',
      description: '',
      visible: false,
      items: [],
      displayOrder: 0
    };
    return solution.sections?.find(s => s.id === id) || fallback;
  };

  const heroSec = getSection('hero');
  const probOverviewSec = getSection('problem-overview');
  const challengesSec = getSection('challenges');
  const featuresSec = getSection('features');
  const workflowSec = getSection('workflow');
  const benefitsSec = getSection('benefits');
  const aiModulesSec = getSection('ai-modules');
  const hardwareSec = getSection('hardware');
  const softwareSec = getSection('software');
  const caseStudySec = getSection('case-study');
  const faqsSec = getSection('faqs');
  const ctaSec = getSection('cta');
  const leadFormSec = getSection('lead-form');

  // Unified list of configurations for all 13 sections
  const sectionsToRender = [
    {
      id: 'hero',
      sec: {
        ...heroSec,
        heading: heroSec.heading || `Deploy ${solution.title}`,
        subHeading: heroSec.subHeading || 'ENTERPRISE DEPLOYABLE AI WORKFLOW',
        description: heroSec.description || 'Harness the power of real-time multi-spectral neural networks to automate threat neutralization and incident management across enterprise sectors.',
      }
    },
    {
      id: 'problem-overview',
      sec: {
        ...probOverviewSec,
        heading: probOverviewSec.heading || `Operational Impact of: ${problem.name}`,
        subHeading: probOverviewSec.subHeading || '01. THE TARGET VULNERABILITY',
        description: probOverviewSec.description || problem.description || 'Critical security threat scenario causing liability, workflow blockage, and manual monitoring fatigue.',
      },
      extraContent: (
        <div className="bg-red-50/60 border border-red-100 p-5 rounded-2xl flex items-start gap-3.5 mt-4 shadow-sm">
          <div className="w-9 h-9 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider">Unmitigated Vulnerability Risk</h4>
            <p className="text-xs text-red-700 leading-relaxed font-medium">
              Left unaddressed, this sector remains exposed to malicious intrusion, lack of unified command records, and high latency in incident response times.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'challenges',
      sec: {
        ...challengesSec,
        heading: challengesSec.heading || 'Why Legacy Systems Fail',
        subHeading: challengesSec.subHeading || '02. EXISTING COMPLIANCE FAULTS',
        description: challengesSec.description || 'Traditional systems lack cognitive understanding, leading to expensive workarounds and high false-alarm fatigue.',
      },
      extraContent: challengesSec.items && challengesSec.items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {challengesSec.items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-4 bg-white border border-slate-200/80 rounded-2xl hover:border-red-200/80 transition-all shadow-sm">
              <div className="w-5 h-5 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                !
              </div>
              <p className="text-xs font-semibold text-slate-700 leading-normal">{item.text}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'workflow',
      sec: {
        ...workflowSec,
        heading: workflowSec.heading || 'System Integration Sequence',
        subHeading: workflowSec.subHeading || '04. OPERATIONAL FLOW',
        description: workflowSec.description || 'Step-by-step intelligence loops executing in real-time from event detection to centralized logs.',
      },
      extraContent: workflowSec.items && workflowSec.items.length > 0 && (
        <div className="relative border-l border-slate-200 ml-3 space-y-5 py-2 mt-6">
          {workflowSec.items.map((item, idx) => (
            <div key={idx} className="relative pl-6 group">
              <div className="absolute -left-[5.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border border-[#0059bb] group-hover:bg-[#0059bb] transition-colors"></div>
              <div className="bg-white border border-slate-200/80 p-4 rounded-2xl hover:border-[#0059bb]/20 hover:shadow-sm transition-all shadow-sm">
                <span className="text-[9px] font-mono font-bold text-[#0059bb] block mb-1">STEP {item.step || `0${idx + 1}`}</span>
                <h4 className="text-xs font-bold text-[#00244a] mb-1">{item.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'benefits',
      sec: {
        ...benefitsSec,
        heading: benefitsSec.heading || 'Proven Sector Enhancements',
        subHeading: benefitsSec.subHeading || '05. ENTERPRISE ROI METRICS',
        description: benefitsSec.description || 'Quantified improvements measured across active production nodes.',
      },
      extraContent: benefitsSec.items && benefitsSec.items.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-6">
          {benefitsSec.items.map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-200/80 p-4 rounded-2xl text-center space-y-1 hover:border-[#0059bb]/20 transition-all shadow-sm">
              <div className="text-2xl font-black text-[#0059bb] tracking-tight">{item.metric}</div>
              <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono">{item.label}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'ai-modules',
      sec: {
        ...aiModulesSec,
        heading: aiModulesSec.heading || 'Underlying Neural Blueprints',
        subHeading: aiModulesSec.subHeading || '06. MACHINE LEARNING COGNITION',
        description: aiModulesSec.description || 'Active ML pipelines running concurrently at the edge to categorize events.',
      },
      extraContent: aiModulesSec.items && aiModulesSec.items.length > 0 && (
        <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white mt-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] divide-y divide-slate-100">
              <thead className="bg-slate-50 text-slate-500 font-mono uppercase tracking-wider text-[9px] font-bold">
                <tr>
                  <th className="px-4 py-3">Registry</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {aiModulesSec.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-[#00244a] font-bold flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-[#0059bb]" />
                      <span>{item.name}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.type}</td>
                    <td className="px-4 py-3 text-emerald-600 font-bold text-right font-mono">{item.accuracy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      id: 'hardware',
      sec: {
        ...hardwareSec,
        heading: hardwareSec.heading || 'Deployable Sensors',
        subHeading: hardwareSec.subHeading || '07A. INTEGRATED IoT EDGE HARDWARE',
        description: hardwareSec.description || 'Best paired with enterprise high-speed processing hubs.',
      },
      extraContent: hardwareSec.items && hardwareSec.items.length > 0 && (
        <div className="space-y-3 mt-6">
          {hardwareSec.items.map((item, idx) => (
            <div key={idx} className="p-3.5 flex items-start gap-3 bg-white border border-slate-200/80 rounded-2xl hover:border-[#0059bb]/20 transition-all shadow-sm">
              <div className="w-7 h-7 rounded bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Server className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-[#00244a]">{item.name}</h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.specs}</p>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'software',
      sec: {
        ...softwareSec,
        heading: softwareSec.heading || 'Control Interfaces',
        subHeading: softwareSec.subHeading || '07B. COMPANION OPERATING SOFTWARE',
        description: softwareSec.description || 'Centralized administration dashboard and client applications.',
      },
      extraContent: softwareSec.items && softwareSec.items.length > 0 && (
        <div className="space-y-3 mt-6">
          {softwareSec.items.map((item, idx) => (
            <div key={idx} className="p-3.5 flex items-start gap-3 bg-white border border-slate-200/80 rounded-2xl hover:border-[#0059bb]/20 transition-all shadow-sm">
              <div className="w-7 h-7 rounded bg-blue-50 text-[#0059bb] flex items-center justify-center shrink-0">
                <Terminal className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-[#00244a]">{item.name}</h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.platform}</p>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'case-study',
      sec: {
        ...caseStudySec,
        heading: caseStudySec.heading || 'Strategic Case Study',
        subHeading: caseStudySec.subHeading || '08. PILOT FIELD PERFORMANCE',
        description: caseStudySec.description || 'See how we successfully automated access control for a major global institution.',
      },
      extraContent: (
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 space-y-4 mt-6">
          <p className="text-xs md:text-sm font-semibold text-slate-600 leading-relaxed italic">
            "{caseStudySec.description || 'Integrating the artificial intelligence model inside the pilot facility led to complete telemetry logging within 120 seconds of mounting.'}"
          </p>
          {caseStudySec.items && caseStudySec.items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-blue-100">
              {caseStudySec.items.map((item, idx) => (
                <div key={idx} className="text-center md:text-left space-y-0.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">{item.label}</div>
                  <p className="text-xs text-[#00244a] font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'faqs',
      sec: {
        ...faqsSec,
        heading: faqsSec.heading || 'Frequently Asked Questions',
        subHeading: faqsSec.subHeading || '09. DEPLOYMENT ARCHITECTURE FAQs',
        description: faqsSec.description || 'Got questions about setup, cost, and installation? Find answers below.',
      },
      extraContent: faqsSec.items && faqsSec.items.length > 0 && (
        <div className="space-y-3 mt-6">
          {faqsSec.items.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden transition-all shadow-sm hover:border-[#0059bb]/30">
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full px-5 py-3.5 text-left flex justify-between items-center text-xs font-bold text-[#00244a] hover:bg-slate-50/40 transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#0059bb]' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-[11px] text-slate-500 font-medium leading-relaxed border-t border-slate-100 bg-slate-50/20">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )
    },
    {
      id: 'lead-form',
      sec: {
        ...leadFormSec,
        heading: leadFormSec.heading || 'Request an Enterprise Consultation',
        subHeading: leadFormSec.subHeading || '13. ENTERPRISE DEPLOYMENT REGISTRY',
        description: leadFormSec.description || 'Submit parameters to generate custom integration blueprints instantly.',
      },
      extraContent: (
        <div id="crm-ingest" className="mt-6">
          {leadSuccess ? (
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl text-center space-y-3.5 shadow-sm animate-fade-in">
              <div className="w-10 h-10 bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-5 h-5 animate-bounce" />
              </div>
              <h3 className="font-extrabold text-[#00244a] text-sm">Request Ingested Successfully</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Our sales team and network architects have received this blueprint, noting your specific operational hierarchy:
              </p>
              <div className="bg-slate-50 p-4 rounded-xl text-left text-[10px] font-mono space-y-1 border border-slate-200/80 text-slate-600">
                <div><span className="text-[#0059bb] font-bold">INDUSTRY:</span> {industry?.title || 'Unknown'}</div>
                <div><span className="text-[#0059bb] font-bold">INSTITUTION:</span> {institution?.title || 'Unknown'}</div>
                <div><span className="text-[#0059bb] font-bold">ZONE:</span> {zone?.name || 'Unknown'}</div>
                <div><span className="text-[#0059bb] font-bold">PROBLEM:</span> {problem.name}</div>
                <div><span className="text-[#0059bb] font-bold">MODULE:</span> {moduleObj?.name || 'Unknown'}</div>
                <div><span className="text-emerald-600 font-bold">SOLUTION:</span> {solution.title}</div>
              </div>
              <p className="text-xs text-emerald-600 font-bold pt-1">An architect will contact you within 1 business hour.</p>
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block font-mono">Your Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Admiral Nelson"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0059bb] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block font-mono">Work Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="nelson@enterprise.com"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0059bb] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block font-mono">Contact Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="+1 (555) 019-2834"
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0059bb] focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block font-mono">Organization / Company</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enterprise Security Hub"
                    value={leadForm.company}
                    onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0059bb] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block font-mono">Message / Special Requests</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    rows={3}
                    placeholder="Specify custom integration timeline or constraints..."
                    value={leadForm.message}
                    onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0059bb] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingLead}
                className="w-full py-2.5 bg-[#0059bb] hover:bg-[#004796] disabled:bg-[#0059bb]/50 text-white font-bold text-xs rounded-lg shadow-sm transition-colors uppercase tracking-wider font-mono"
              >
                {isSubmittingLead ? 'Registering...' : 'Submit Deployment Request'}
              </button>
            </form>
          )}
        </div>
      )
    }
  ];

  // Only render visible sections from CMS configuration
  const visibleSections = sectionsToRender.filter(s => s.sec.visible !== false);

  return (
    <div className="flex flex-col min-h-screen bg-[#fbf9f8] text-slate-800 font-sans selection:bg-[#0059bb] selection:text-white">
      <Header settings={headerSettings} theme={theme} isAdminLoggedIn={isAdminLoggedIn} />

      {/* DYNAMIC METADATA BREADCRUMB */}
      <div className="bg-white py-4 w-full">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-xs flex items-center space-x-2 py-1">
          <Link to="/" className="font-semibold text-[#64748B] hover:text-[#0059bb] transition-colors">Home</Link>
          <span className="text-[#64748B] font-semibold">/</span>
          {industry && (
            <>
              <Link to={`/industries/${industryPublicId}`} className="font-semibold text-[#64748B] hover:text-[#0059bb] transition-colors">{industry.name || industry.title}</Link>
              <span className="text-[#64748B] font-semibold">/</span>
            </>
          )}
          {institution && (
            <>
              <Link to={`/industries/${industryPublicId}/${institutionPublicId}`} className="font-semibold text-[#64748B] hover:text-[#0059bb] transition-colors">{institution.name || institution.title}</Link>
              <span className="text-[#64748B] font-semibold">/</span>
            </>
          )}
          {zone && (
            <>
              <Link to={`/industries/${industryPublicId}/${institutionPublicId}/${areaPublicId}`} className="font-semibold text-[#64748B] hover:text-[#0059bb] transition-colors">{zone.name}</Link>
              <span className="text-[#64748B] font-semibold">/</span>
            </>
          )}
          {problem && (
            <>
              <Link to={`/industries/${industryPublicId}/${institutionPublicId}/${areaPublicId}/${problemPublicId}`} className="font-semibold text-[#64748B] hover:text-[#0059bb] transition-colors">{problem.name}</Link>
              <span className="text-[#64748B] font-semibold">/</span>
            </>
          )}
          {moduleObj && (
            <>
              <Link to={`/industries/${industryPublicId}/${institutionPublicId}/${areaPublicId}/${problemPublicId}/${modulePublicId}`} className="font-semibold text-[#64748B] hover:text-[#0059bb] transition-colors">{moduleObj.name}</Link>
              <span className="text-[#64748B] font-semibold">/</span>
            </>
          )}
          <span className="text-slate-900 font-bold">{solution?.title || 'Solution Blueprint'}</span>
        </div>
      </div>

      {/* MAIN REDESIGNED SECTIONS */}
      <main className="flex-grow">
        {visibleSections.map((item, idx) => (
          <AlternatingSection 
            key={item.id} 
            id={item.id} 
            index={idx} 
            section={item.sec} 
            extraContent={item.extraContent} 
          />
        ))}
      </main>

      <Footer settings={footerSettings} theme={theme} />
    </div>
  );
}
