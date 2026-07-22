import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionComponent, ThemeSettings, Product, CaseStudy, Solution } from '../../types';
import { apiService } from '../Services/api';

interface SectionRendererProps {
  section: SectionComponent;
  theme: ThemeSettings;
  products?: Product[];
  onFormSubmit?: (leadPayload: any) => void;
}

export default function SectionRenderer({ section, theme, products = [], onFormSubmit }: SectionRendererProps) {
  if (section.id === 'home-features' || section.id === 'home-cta') {
    return null;
  }
  const { content, styles, type } = section;
  const navigate = useNavigate();
  const location = useLocation();
  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [dbIndustries, setDbIndustries] = useState<any[]>([]);
  const [dbSolutions, setDbSolutions] = useState<Solution[]>([]);
  const [dbTechnologies, setDbTechnologies] = useState<any[]>([]);
  const [dbTestimonials, setDbTestimonials] = useState<any[]>([]);
  const [solutionPaths, setSolutionPaths] = useState<Record<string, string>>({});

  useEffect(() => {
    if (type === 'OurSolutions') {
      Promise.all([
        apiService.getAdminIndustries().catch(() => []),
        apiService.getAdminInstitutions().catch(() => []),
        apiService.getAdminZones().catch(() => []),
        apiService.getProblems().catch(() => []),
        apiService.getModules().catch(() => []),
        apiService.getSolutions().catch(() => [])
      ]).then(([industries, institutions, zones, problems, modules, solutions]) => {
        const pathMap: Record<string, string> = {};
        solutions.forEach((sol: any) => {
          const mod = modules.find((m: any) => m.id === sol.moduleId) || modules[0];
          const prob = problems.find((p: any) => p.id === (sol.problemId || mod?.problemId)) || problems[0];
          const zone = zones.find((z: any) => z.id === (sol.zoneId || prob?.zoneId)) || zones[0];
          const inst = institutions.find((i: any) => i.id === (sol.institutionId || zone?.institutionId)) || institutions[0];
          const ind = industries.find((i: any) => i.id === (sol.industryId || inst?.industryId)) || industries[0];

          const indPub = ind?.publicId || ind?.slug || 'education';
          const instPub = inst?.publicId || inst?.slug || 'school';
          const zonePub = zone?.publicId || zone?.slug || 'main-gate';
          const probPub = prob?.publicId || prob?.slug || 'unauthorized-entry';
          const modPub = mod?.publicId || mod?.slug || 'sentinel-ai';
          const solPub = sol.publicId || sol.id;

          pathMap[sol.id] = `/industries/${indPub}/${instPub}/${zonePub}/${probPub}/${modPub}/${solPub}`;
        });
        setSolutionPaths(pathMap);
      }).catch(err => console.error('Error resolving solution paths in top-level SectionRenderer:', err));
    }
  }, [type, dbSolutions]);

  useEffect(() => {
    if (type === 'Industries' || type === 'IndustriesServe') {
      apiService.getPublicIndustries()
        .then(res => {
          if (res) setDbIndustries(res);
        })
        .catch(err => console.error('Failed to load public industries in SectionRenderer:', err));
    }
  }, [type]);

  useEffect(() => {
    if (type === 'OurSolutions') {
      apiService.getSolutions()
        .then(res => {
          if (res) setDbSolutions(res);
        })
        .catch(err => console.error('Failed to load solutions in SectionRenderer:', err));
    }
  }, [type]);

  useEffect(() => {
    if (type === 'TechnologyEcosystem' || type === 'TechnologyPartners') {
      apiService.getTechnologies()
        .then(res => {
          if (res && res.length > 0) setDbTechnologies(res);
        })
        .catch(err => console.error('Failed to load technologies in SectionRenderer:', err));
    }
  }, [type]);

  useEffect(() => {
    if (type === 'ClientsTrustUs' || type === 'AboutTestimonials') {
      apiService.getTestimonials()
        .then(res => {
          if (res && res.length > 0) setDbTestimonials(res);
        })
        .catch(err => console.error('Failed to load testimonials in SectionRenderer:', err));
    }
  }, [type]);

  const sliderRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const updateArrowVisibility = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    if (type === 'IndustriesServe') {
      updateArrowVisibility();
      const t1 = setTimeout(updateArrowVisibility, 100);
      const t2 = setTimeout(updateArrowVisibility, 500);
      window.addEventListener('resize', updateArrowVisibility);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        window.removeEventListener('resize', updateArrowVisibility);
      };
    }
  }, [dbIndustries, type]);

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(updateArrowVisibility, 350);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeftState(sliderRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    sliderRef.current.scrollLeft = scrollLeftState - walk;
    updateArrowVisibility();
  };

  const [successMsg, setSuccessMsg] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [activeProductTab, setActiveProductTab] = useState('All Products');
  const [quoteProduct, setQuoteProduct] = useState<string | null>(null);

  // Interactive About page states
  const [selectedDownload, setSelectedDownload] = useState<any | null>(null);
  const [downloadLeadForm, setDownloadLeadForm] = useState({ name: '', email: '', phone: '', company: '' });
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [activeContactFormTab, setActiveContactFormTab] = useState<'contact' | 'demo' | 'callback' | 'partner'>('contact');
  const [contactLeadForm, setContactLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    preferredDate: '',
    preferredTime: '',
    productName: 'NX Sentinel System',
    partnerType: 'System Integrator'
  });
  const [aboutContactSuccess, setAboutContactSuccess] = useState(false);
  const [selectedGalleryMedia, setSelectedGalleryMedia] = useState<any | null>(null);
  
  // Interactive FAQ States for corporate about us template
  const [aboutFaqSearch, setAboutFaqSearch] = useState('');
  const [aboutFaqCategory, setAboutFaqCategory] = useState('All');
  const [aboutFaqOpenId, setAboutFaqOpenId] = useState<number | null>(0);

  // Dynamic Case Studies State
  const [dynamicCaseStudies, setDynamicCaseStudies] = useState<CaseStudy[]>([]);
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);
  const [csLeadForm, setCsLeadForm] = useState({ name: '', email: '', phone: '', company: '', message: '', requestedDownload: '' });
  const [csLeadSuccess, setCsLeadSuccess] = useState(false);
  const [activeLeadType, setActiveLeadType] = useState<'similar' | 'pdf' | 'demo' | 'callback' | 'help'>('similar');
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (type === 'CaseStudies' || type === 'OurCurrentWork') {
      apiService.getCaseStudies()
        .then(data => {
          setDynamicCaseStudies(data.filter(cs => cs.status === 'published'));
        })
        .catch(err => console.error('Failed to load dynamic case studies:', err));
    }
  }, [type]);

  // Resolve Lucide icons dynamically
  const renderIcon = (iconName: string, className = 'w-6 h-6') => {
    const IconComp = (Icons as any)[iconName] || Icons.HelpCircle;
    return <IconComp className={className} />;
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLeadForm({ ...leadForm, [e.target.name]: e.target.value });
  };

  const submitLead = async (source: 'contact' | 'demo' | 'product_enquiry', extraDetails = {}) => {
    if (!leadForm.name || !leadForm.email) return;
    setSubmitting(true);
    try {
      await apiService.submitLead({
        name: leadForm.name,
        email: leadForm.email,
        phone: leadForm.phone,
        company: 'Visitor',
        message: leadForm.message || `Form submission from page via ${source}`,
        source,
        details: extraDetails
      });
      setSuccessMsg(true);
      setLeadForm({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSuccessMsg(false), 5000);
      if (onFormSubmit) onFormSubmit({ source, ...extraDetails });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const submitCSLead = async (e: React.FormEvent, source: string, payload: any = {}) => {
    e.preventDefault();
    if (!csLeadForm.name || !csLeadForm.email) return;
    setSubmitting(true);
    try {
      await apiService.submitLead({
        name: csLeadForm.name,
        email: csLeadForm.email,
        phone: csLeadForm.phone,
        company: csLeadForm.company || 'Visitor Org',
        message: csLeadForm.message || `Submitted inquiry for source stage ${source}`,
        source: source as any,
        details: {
          caseStudyId: selectedCaseStudy?.id,
          caseStudyName: selectedCaseStudy?.title,
          leadType: activeLeadType,
          ...payload
        }
      });
      setCsLeadSuccess(true);
      setCsLeadForm({ name: '', email: '', phone: '', company: '', message: '', requestedDownload: '' });
      setTimeout(() => setCsLeadSuccess(false), 5000);
      if (onFormSubmit) onFormSubmit({ source, ...payload });
    } catch (err) {
      console.error('Failed submitting Case Study B2B Lead:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAIQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery || !selectedCaseStudy) return;
    setAiLoading(true);
    
    setTimeout(() => {
      const q = aiQuery.toLowerCase();
      let ans = `Thanks for your question regarding "${selectedCaseStudy.title}". Our deep learning edge networks are custom calibrated to address this scenario. `;
      
      if (q.includes('metric') || q.includes('result') || q.includes('percent') || q.includes('reduction') || q.includes('drop') || q.includes('save') || q.includes('accuracy')) {
        const metricsStr = selectedCaseStudy.metrics?.map(m => `"${m.label}: ${m.value}"`).join(', ') || 'N/A';
        ans += `The primary recorded performance metrics for this project include: ${metricsStr}. These metrics are verified by daily automated logs.`;
      } else if (q.includes('challenge') || q.includes('problem') || q.includes('issue') || q.includes('pain') || q.includes('gate') || q.includes('before')) {
        ans += `Prior to our deployment, the client faced major issues: "${selectedCaseStudy.challenge}".`;
      } else if (q.includes('solution') || q.includes('how') || q.includes('hardware') || q.includes('camera') || q.includes('software')) {
        ans += `We integrated a dedicated server running custom computer-vision algorithms: "${selectedCaseStudy.solution}". This provides sub-second trigger alerts.`;
      } else if (q.includes('price') || q.includes('cost') || q.includes('quote') || q.includes('much') || q.includes('budget')) {
        ans += `B2B deployment costs depend on the number of camera feeds, barrier widths, and physical locking triggers. Please use the "Request Quote for similar premises" form on the left, and our architect will engineer custom bill-of-materials pricing coordinates for you!`;
      } else {
        ans += `We implemented: "${selectedCaseStudy.solution}" which effectively solved: "${selectedCaseStudy.challenge}", producing an outstanding result: "${selectedCaseStudy.results}". Would you like us to schedule a site inspection or simulation run for your premises?`;
      }
      
      setAiResponse(ans);
      setAiLoading(false);

      // Track as lead to CRM!
      apiService.submitLead({
        name: 'AI Help Assistant Visitor',
        email: 'ai-helper@nx-workspace.ai',
        phone: 'Interactive Chatbot',
        company: selectedCaseStudy.clientName,
        message: `User asked AI Chatbot: "${aiQuery}"`,
        source: 'ai_help_choosing' as any,
        details: {
          caseStudyId: selectedCaseStudy.id,
          caseStudyName: selectedCaseStudy.title,
          userQuestion: aiQuery,
          botAnswer: ans
        }
      }).catch(err => console.error(err));
    }, 800);
  };

  if (!section.visible) return null;

  // Animation map
  const animationClass =
    styles.animation === 'fade'
      ? 'animate-fade-in'
      : styles.animation === 'slide-up'
      ? 'animate-slide-up'
      : styles.animation === 'scale-up'
      ? 'animate-scale-up'
      : '';

  // Alignment map
  const alignClass =
    styles.alignment === 'center'
      ? 'text-center flex flex-col items-center justify-center'
      : styles.alignment === 'right'
      ? 'text-right flex flex-col items-end'
      : 'text-left';

  const isHero = type === 'Hero';
  const bgImg = section.id === 'home-hero'
    ? (content.backgroundImage || styles.backgroundImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9pO5Y1ow4MdXwejzbNoQpKc8kKIgBfcmqj0uiUy_jli6aPXxXe2mxzYQIS7BSBa7REo2COHvEOAXcTBmFCY6240FnJpRGFDGI3efzXqT3wyhSh7HWHCIZwSBg5KMa24Z9CtkU2HEk0oPgZddCSkyq2hH6ltaV7Hp3YZ5whP8GhHutnu19UlDL4Y3ppGX9_zbP2D1jUCYI5tz2nBGEXauOtziro2JnOF69Pq7Ol0HgYpxQ_Rs3GnUXLpH9YLdijgSq047e6Gu7FKI')
    : (content.backgroundImage || styles.backgroundImage || (isHero ? 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop' : undefined));

  if (section.id === 'home-hero') {
    return (
      <section
        id="section-home-hero"
        className="relative w-full max-w-[1590px] mx-auto min-h-screen flex flex-col justify-center overflow-hidden text-[#dde5db] pt-[62px] pb-12"
      >
        {/* Interactive Background Collage */}
        {bgImg && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img 
              src={bgImg} 
              alt="Industrial and Enterprise Operations Background" 
              className="w-full h-full object-cover transition-all duration-1000"
            />
            {/* Overlays to keep premium contrast and readability */}
    
          </div>
        )}

        {/* Animated WebGL-like Shader Overlay (Pseudo-layer for network lines) */}
        <div 
          className="absolute inset-0 z-30 pointer-events-none" 
          style={{ 
            backgroundImage: ' (transparent 0)', 
            backgroundSize: '40px 40px' 
          }} 
        />

        {/* Central Hero Content */}
        <div className="relative z-40 w-full max-w-[701px] mx-auto px-4 md:px-0 text-center flex flex-col items-center">
          {/* Headline */}
          <h1 className="font-sans text-[42px] tracking-tight text-[#dde5db] mb-8 max-w-5xl leading-[1.1] font-extrabold text-center">
            {content.title ? (
              <span dangerouslySetInnerHTML={{ __html: content.title }} />
            ) : (
              <>Engineering <br />Intelligent <span className="text-[#5bdf8c]">Solutions</span> <br />for Modern Operations</>
            )}
          </h1>

          {/* Subtext */}
          {content.subtitle && (
            <p className="font-sans text-[#bccabc] text-[14px] leading-[16px] max-w-2xl mx-auto mb-10 text-center">
              <span dangerouslySetInnerHTML={{ __html: content.subtitle }} />
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-50">
            <Link
              to={content.ctaUrl || "/industries"}
              className="group flex items-center justify-center gap-2 bg-[#5bdf8c] text-[#00391b] font-bold h-[46px] w-[237.262px] rounded-lg shadow-2xl shadow-[#5bdf8c]/20 hover:bg-[#38c172] hover:text-[#004924] transition-all duration-300"
            >
              <span>{content.ctaText || "Explore Industries"}</span>
              <Icons.ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to={content.secondaryCtaUrl || "/contact"}
              className="flex items-center gap-2 bg-transparent text-white border border-white/20 hover:border-white/50 px-10 py-4 rounded-lg backdrop-blur-sm transition-all duration-300 hover:text-[#5bdf8c]"
            >
              <Icons.Calendar className="w-5 h-5 text-[#5bdf8c]" />
              <span className="font-semibold">{content.secondaryCtaText || "Schedule Consultation"}</span>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id={`section-${section.id}`}
      className={`relative w-full overflow-hidden transition-all duration-300 ${animationClass}`}
      style={{
        paddingTop: section.id === 'home-hero' ? undefined : '56px',
        paddingBottom: section.id === 'home-hero' ? undefined : '56px',
        marginTop: '0px',
        marginBottom: '0px',
        backgroundColor: section.id === 'home-hero' ? (bgImg ? undefined : '#0F172A') : '#FFFFFF',
        color: styles.textColor || '#1E293B',
        ...(bgImg && section.id === 'home-hero' ? {
          backgroundImage: `url(${bgImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        } : {})
      }}
    >
      {/* Background Overlay to ensure contrast and premium readability */}
      {bgImg && section.id === 'home-hero' && (
        <div className="absolute inset-0 bg-slate-950/80 pointer-events-none z-0" />
      )}
      
      <div className="max-w-[1400px] mx-auto px-4 md:px-12 relative z-10">
        
        {/* BREADCRUMB SECTION */}
        {type === 'Breadcrumb' && location.pathname !== '/institution' && (
          <div className="flex items-center space-x-2 text-xs py-1">
            <span className="font-semibold" style={{ color: content.color || '#64748B' }}>
              {content.homeText || 'Home'}
            </span>
            <span style={{ color: content.color || '#64748B' }}>
              {content.separator || '/'}
            </span>
            <span className="font-bold text-slate-900">
              {content.currentText || 'Industries'}
            </span>
          </div>
        )}

        {/* CTA SECTION */}
        {type === 'CTA' && (
          <div className="text-center space-y-6 max-w-4xl mx-auto py-4">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: styles.headingColor || '#FFFFFF' }}>
              {content.title}
            </h2>
            <p className="text-sm text-gray-200/95 leading-relaxed max-w-2xl mx-auto">
              {content.subtitle}
            </p>
            {content.ctaText && (
              <div className="pt-2">
                <Link
                  to={content.ctaUrl || '/contact'}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-xs font-semibold shadow-md bg-white text-blue-600 transition-opacity hover:opacity-95"
                >
                  {content.ctaText}
                </Link>
              </div>
            )}
          </div>
        )}

        {/* HERO SECTION */}
        {type === 'Hero' && (
          <div className={`${alignClass} space-y-8`}>
            {/* Badges Container */}
            <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl">
              {content.badges && content.badges.map((badge: any, idx: number) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border border-gray-800/20 bg-gray-900/40 text-gray-200"
                >
                  {renderIcon(badge.icon, "w-3.5 h-3.5 text-blue-400")}
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>

            {/* Title / Subtitle */}
            <div className="max-w-3xl space-y-4">
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
                style={{ color: styles.headingColor || '#FFFFFF' }}
              >
                {content.title}
              </h1>
              <p className="text-base md:text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
                {content.subtitle}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to={content.ctaUrl}
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold shadow-md text-white transition-opacity hover:opacity-95"
                style={{ backgroundColor: theme.primaryColor }}
              >
                {content.ctaText}
              </Link>
              <Link
                to={content.secondaryCtaUrl}
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold border border-gray-700 hover:bg-gray-800 text-white transition-all"
              >
                {content.secondaryCtaText}
              </Link>
            </div>

            {/* Trusted Logos */}
            {content.logos && (
              <div className="pt-12 border-t border-gray-800/40 w-full">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-6">
                  {content.trustedText}
                </span>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center justify-center opacity-60">
                  {content.logos.map((logo: string, idx: number) => (
                    <div
                      key={idx}
                      className="text-xs font-extrabold tracking-widest text-center text-gray-400 font-mono select-none border border-gray-800/40 py-2.5 rounded-lg"
                    >
                      {logo}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* INDUSTRIES SECTION */}
        {type === 'Industries' && (
          <div className="space-y-10">
            <div className={`${alignClass} space-y-3 max-w-3xl mx-auto`}>
              <span 
                className="text-xs font-bold uppercase tracking-wider" 
                style={{ 
                  color: section.id === 'industries-grid' ? '#00244A' : theme.primaryColor,
                  ...(section.id === 'industries-grid' ? { fontSize: '48px', lineHeight: '57.6px' } : {})
                }}
              >
                {content.title}
              </span>
              <h2 
                className="text-3xl font-bold tracking-tight text-slate-900"
                style={section.id === 'industries-grid' ? { fontWeight: 'normal', fontSize: '18px', lineHeight: '28px' } : {}}
              >
                {content.subtitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {(() => {
                const publishedFromDb = (dbIndustries || []).filter(
                  (ind: any) => (ind.status || 'published').toLowerCase() === 'published'
                );

                let itemsToMap: any[] = [];
                if (publishedFromDb.length > 0) {
                  const cfgMap = new Map();
                  (content.items || []).forEach((item: any) => {
                    const key = (item.id || item.publicId || item.slug || item.title || '').toLowerCase();
                    if (key) cfgMap.set(key, item);
                  });

                  itemsToMap = publishedFromDb.map((ind: any) => {
                    const cfg = cfgMap.get((ind.id || '').toLowerCase()) ||
                               cfgMap.get((ind.publicId || '').toLowerCase()) ||
                               cfgMap.get((ind.slug || '').toLowerCase()) ||
                               cfgMap.get((ind.name || '').toLowerCase());

                    return {
                      id: ind.id || ind.publicId,
                      publicId: ind.publicId || ind.slug || ind.id,
                      slug: ind.slug || ind.publicId,
                      title: ind.name || ind.title || cfg?.title || 'Industry Vertical',
                      desc: ind.shortDescription || ind.description || cfg?.desc || 'Enterprise & Industrial Vertical',
                      image: ind.cardImage || ind.coverImage || cfg?.image,
                      icon: ind.icon || cfg?.icon || 'Building2',
                      link: `/industries/${ind.publicId || ind.slug || ind.id}`
                    };
                  });
                } else {
                  itemsToMap = content.items || [];
                }

                return itemsToMap.map((item: any) => {
                  const hasImg = !!item.image;
                  return (
                    <div
                      key={item.id || item.publicId || item.slug}
                      onClick={() => {
                        const matchedDbInd = dbIndustries.find(
                          (ind: any) =>
                            ind.name?.toLowerCase() === item.title?.toLowerCase() ||
                            ind.slug?.toLowerCase() === item.title?.toLowerCase() ||
                            ind.slug?.toLowerCase() === item.slug?.toLowerCase() ||
                            ind.publicId === item.publicId ||
                            ind.id === item.id
                        );

                        if (matchedDbInd) {
                          navigate(`/industries/${matchedDbInd.publicId || matchedDbInd.slug}`);
                          return;
                        }

                        if (item.link || item.actionUrl) {
                          const targetLink = item.link || item.actionUrl;
                          if (targetLink === '/institution') {
                            const edu = dbIndustries.find((ind: any) => ind.name?.toLowerCase() === 'education');
                            if (edu) {
                              navigate(`/industries/${edu.publicId}`);
                              return;
                            }
                          }
                          navigate(targetLink);
                          return;
                        }
                        const rawSlug = item.publicId || item.slug || item.title?.toLowerCase().replace(/\s+/g, '-');
                        const cleanSlug = rawSlug ? rawSlug.replace(/^\/?industries\/?/, '').replace(/^\//, '') : '';
                        navigate(`/industries/${cleanSlug}`);
                      }}
                      className="group bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md hover:border-[#0059bb] transition-all duration-300 cursor-pointer hover:-translate-y-2"
                      style={section.id === 'industries-grid' ? { height: '199px' } : {}}
                    >
                      <div 
                        className="w-12 h-12 bg-blue-50/50 flex items-center justify-center mb-3 group-hover:bg-blue-50 transition-colors overflow-hidden border border-slate-100"
                        style={{ borderRadius: section.id === 'industries-grid' ? '100px' : '12px' }}
                      >
                        {hasImg ? (
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="text-[#0059bb] transition-colors">
                            {renderIcon(item.icon, "w-6 h-6")}
                          </div>
                        )}
                      </div>
                      <h3 
                        className="text-sm md:text-base font-bold text-[#00244a] mb-1.5 transition-colors group-hover:text-[#0059bb]"
                        style={section.id === 'industries-grid' ? { fontSize: '16px', lineHeight: '24px' } : {}}
                      >
                        {item.title}
                      </h3>
                      <p 
                        className="text-xs text-slate-500 line-clamp-2 leading-relaxed max-w-[140px] mx-auto"
                        style={section.id === 'industries-grid' ? { lineHeight: '14.4px' } : {}}
                      >
                        {item.desc}
                      </p>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* INDUSTRIES WE SERVE SECTION FOR HOME PAGE */}
        {type === 'IndustriesServe' && (
          <div className="w-full mx-auto py-0">
            
            {/* Header: Left-Aligned exactly like the reference */}
            <div className="flex items-center gap-2.5 mb-6">
              <h2 className="text-[13px] font-black tracking-wider text-slate-800 uppercase font-sans">
                {content.title || 'INDUSTRIES WE SERVE'}
              </h2>
            </div>

            {/* Carousel slider with outside navigation arrows */}
            <div className="relative select-none">
              
              {/* Left Navigation Arrow */}
              {showLeftArrow && (
                <button
                  onClick={() => scrollSlider('left')}
                  className="absolute left-1 md:left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:scale-105 active:scale-95 transition-all duration-200"
                  title="Scroll Left"
                >
                  <Icons.ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
              )}

              {/* Slider Area */}
              <div
                ref={sliderRef}
                onScroll={updateArrowVisibility}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeaveOrUp}
                onMouseUp={handleMouseLeaveOrUp}
                onMouseMove={handleMouseMove}
                className="no-scrollbar overflow-x-auto scroll-smooth flex gap-3 pb-2 select-none touch-pan-x"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {(() => {
                  const publishedFromDb = (dbIndustries || []).filter(
                    (ind: any) => (ind.status || 'published').toLowerCase() === 'published'
                  );

                  let displayIndustries: any[] = [];

                  if (publishedFromDb.length > 0) {
                    const cfgMap = new Map();
                    if (content.items && Array.isArray(content.items)) {
                      content.items.forEach((cfg: any) => {
                        if (cfg.id) cfgMap.set(cfg.id, cfg);
                        if (cfg.publicId) cfgMap.set(cfg.publicId, cfg);
                        if (cfg.slug) cfgMap.set(cfg.slug, cfg);
                      });
                    }

                    const processedDbIds = new Set<string>();

                    if (content.items && Array.isArray(content.items)) {
                      content.items.forEach((cfgItem: any) => {
                        const dbMatch = publishedFromDb.find((ind: any) => 
                          ind.id === cfgItem.id || 
                          ind.publicId === cfgItem.publicId || 
                          ind.publicId === cfgItem.id ||
                          ind.slug === cfgItem.slug
                        );
                        if (dbMatch) {
                          processedDbIds.add(dbMatch.id);
                          const isHomeVisible = cfgItem.visible !== undefined ? cfgItem.visible : true;
                          if (isHomeVisible !== false) {
                            displayIndustries.push({
                              ...dbMatch,
                              isHomeFeatured: cfgItem.featured !== undefined ? cfgItem.featured : dbMatch.featured,
                              homePageImage: cfgItem.homePageImage
                            });
                          }
                        }
                      });
                    }

                    publishedFromDb.forEach((ind: any) => {
                      if (!processedDbIds.has(ind.id)) {
                        displayIndustries.push({
                          ...ind,
                          isHomeFeatured: ind.featured || false
                        });
                      }
                    });
                  } else {
                    displayIndustries = (content.items || []).filter((item: any) => item.visible !== false);
                  }

                  return displayIndustries;
                })().map((item: any) => {
                  let homeImgUrl = '';
                  if (item.homePageImage) {
                    if (typeof item.homePageImage === 'string') {
                      homeImgUrl = item.homePageImage;
                    } else if (item.homePageImage.url) {
                      homeImgUrl = item.homePageImage.url;
                    }
                  }
                  const displayImg = homeImgUrl || item.cardImage || item.coverImage;
                  const hasImg = !!displayImg;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (!isDragging) {
                          navigate(`/industries/${item.publicId || item.slug}`);
                        }
                      }}
                      className={`group flex-shrink-0 w-[155px] h-[135px] bg-white rounded-lg border overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-emerald-500 hover:-translate-y-0.5 transition-all duration-250 cursor-pointer flex flex-col relative ${
                        item.isHomeFeatured 
                          ? 'border-emerald-500/50' 
                          : 'border-slate-200/50'
                      }`}
                    >
                      {/* Card Image Area with Zoom */}
                      <div className="relative h-[75px] w-full overflow-hidden bg-slate-50 flex-shrink-0">
                        {hasImg ? (
                          <img 
                            src={displayImg} 
                            alt={item.name} 
                            className="w-full h-full object-cover transition-transform duration-250 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                            draggable="false"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-600">
                            {renderIcon(item.icon || 'Sparkles', "w-6 h-6")}
                          </div>
                        )}
                      </div>

                      {/* Overlapping Small Green Circular Icon Background */}
                      <div className="absolute left-3 top-[75px] -translate-y-1/2 z-10 w-[30px] h-[30px] rounded-full border border-emerald-500 bg-white flex items-center justify-center text-emerald-600 shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex-shrink-0 transition-transform duration-250 group-hover:scale-105">
                        {renderIcon(item.icon || 'Sparkles', "w-[16px] h-[16px]")}
                      </div>

                      {/* Card Footer with text indented to sit beside the overlapping icon */}
                      <div className="h-[60px] w-full pl-[44px] pr-2 flex items-center bg-white flex-shrink-0 select-none">
                        {/* Industry Name */}
                        <span className="text-[12px] font-bold text-slate-850 truncate select-none leading-none">
                          {item.name}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Explore Card CTA exactly matching layout, height, and style */}
                <Link
                  to="/industries"
                  className="group flex-shrink-0 w-[155px] h-[135px] bg-white rounded-lg border border-dashed border-slate-300 hover:border-emerald-500 hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 flex flex-col items-center justify-center p-3 text-center cursor-pointer"
                >
                  <Icons.LayoutGrid className="w-6 h-6 text-emerald-500 transition-transform group-hover:scale-105" />
                  <span className="text-[12px] font-bold text-slate-800 leading-tight mt-2 px-1 max-w-full truncate">
                    Explore All
                  </span>
                  <span className="text-[12px] font-bold text-slate-800 leading-none">
                    Industries
                  </span>
                  <Icons.ArrowRight className="w-4 h-4 text-slate-500 mt-2 transform group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Right Navigation Arrow */}
              {showRightArrow && (
                <button
                  onClick={() => scrollSlider('right')}
                  className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:scale-105 active:scale-95 transition-all duration-200"
                  title="Scroll Right"
                >
                  <Icons.ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              )}
            </div>

            {/* Custom Styles to hide scrollbars */}
            <style>{`
              .no-scrollbar::-webkit-scrollbar {
                display: none;
              }
              .no-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>
          </div>
        )}

        {/* SOLUTION PROCESS SECTION */}
        {type === 'SolutionProcess' && (() => {
          const isEnabled = content.settings?.enabled !== false && content.status !== 'disabled';
          if (!isEnabled) return null;

          const sectionHeader = content.sectionHeader || {
            badgeNumber: "05",
            badgeText: "OUR SOLUTION ENGINEERING PROCESS",
            badgeColor: "#22c55e",
            headingColor: "#1e293b"
          };

          const steps = (content.processSteps || [])
            .filter((s: any) => s.status !== false)
            .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

          const settings = content.settings || {
            backgroundColor: "#ffffff",
            connectorColor: "#22c55e",
            connectorStyle: "dotted",
            connectorEnabled: true,
            connectorAnimation: "none",
            connectorThickness: "1.5",
            containerWidth: "max-w-7xl",
            gap: 40,
            topPadding: "60",
            bottomPadding: "60",
            stepGap: "12",
            iconGap: "16",
            alignment: "center"
          };

          const bgCol = settings.backgroundColor || '#ffffff';
          const connCol = settings.connectorColor || '#22c55e';
          const connStyle = settings.connectorStyle || 'dotted';
          const connEnabled = settings.connectorEnabled !== false;
          const connThickness = settings.connectorThickness || '1.5';
          const connAnim = settings.connectorAnimation || 'none';
          const containerW = settings.containerWidth || 'max-w-7xl';
          const topPad = settings.topPadding !== undefined ? `${settings.topPadding}px` : '60px';
          const botPad = settings.bottomPadding !== undefined ? `${settings.bottomPadding}px` : '60px';
          const stepGapPx = settings.stepGap !== undefined ? `${settings.stepGap}px` : '12px';
          const align = settings.alignment || 'center';

          // Render icon or uploaded assets
          const renderStepIcon = (step: any) => {
            const size = step.iconSize || '36';
            const iconColor = step.iconColor || '#059669';
            
            // Check if step.icon starts with "data:" or "/assets" or similar (uploaded)
            if (step.icon && (step.icon.startsWith('data:') || step.icon.includes('/') || step.icon.startsWith('blob:'))) {
              return (
                <img 
                  src={step.icon} 
                  alt={step.title} 
                  style={{ width: `${size}px`, height: `${size}px` }} 
                  className="object-contain"
                />
              );
            }
            return renderIcon(step.icon || 'Sparkles', `w-[${size}px] h-[${size}px]`);
          };

          return (
            <section 
              id="section-home-solution-process" 
              className="w-full relative transition-all duration-300 bg-white"
              style={{ 
                backgroundColor: '#ffffff',
                paddingTop: '56px',
                paddingBottom: '56px',
                marginTop: '0px',
                marginBottom: '0px',
              }}
            >
              <div className="max-w-[1400px] mx-auto px-4 md:px-12">
                
                {/* Header: Centered or Left aligned */}
                <div className={`flex items-center gap-2.5 mb-8 ${align === 'center' ? 'justify-center' : 'justify-start'}`}>
                  <h2 
                    className="text-[13px] font-black tracking-wider uppercase font-sans text-slate-800"
                  >
                    {sectionHeader.badgeText || 'OUR SOLUTION ENGINEERING PROCESS'}
                  </h2>
                </div>

                {/* Horizontal steps flow */}
                <div className="select-none">
                  <div className="no-scrollbar overflow-x-auto flex items-start gap-3 md:gap-0 md:flex-row md:justify-between pb-6 select-none touch-pan-x">
                    {steps.map((step: any, idx: number) => {
                      const circleSize = step.circleSize || '90';
                      const titleCol = step.titleColor || '#1e293b';
                      const subtitleCol = step.subtitleColor || '#64748b';
                      const iconBg = step.iconBgColor || '#ffffff';
                      const borderCol = step.circleBorderColor || '#e2e8f0';
                      const iconCol = step.iconColor || '#059669';

                      return (
                        <React.Fragment key={step.id || idx}>
                          {/* Step Node */}
                          <div 
                            className="flex flex-col items-center flex-shrink-0 w-28 md:w-32 group cursor-pointer transition-transform duration-250 hover:-translate-y-1"
                            style={{ gap: stepGapPx }}
                          >
                            {/* Circle Container */}
                            <div 
                              className="rounded-full border flex items-center justify-center shadow-sm transition-all duration-250 group-hover:shadow-md"
                              style={{ 
                                width: `${circleSize}px`, 
                                height: `${circleSize}px`,
                                backgroundColor: iconBg,
                                borderColor: borderCol,
                                color: iconCol
                              }}
                            >
                              {renderStepIcon(step)}
                            </div>

                            {/* Titles */}
                            <div className="text-center select-none">
                              {/* Splitted or full title */}
                              {step.title ? (
                                <p 
                                  className="text-[12.5px] md:text-[13.5px] font-bold leading-tight"
                                  style={{ color: titleCol }}
                                >
                                  {step.title}
                                </p>
                              ) : null}
                              {step.subtitle ? (
                                <p 
                                  className="text-[11.5px] md:text-[12.5px] font-medium leading-tight mt-0.5"
                                  style={{ color: subtitleCol }}
                                >
                                  {step.subtitle}
                                </p>
                              ) : null}
                              {step.description ? (
                                <p className="text-[10px] text-slate-400 mt-1 max-w-[120px] mx-auto leading-normal hidden md:block">
                                  {step.description}
                                </p>
                              ) : null}
                            </div>
                          </div>

                          {/* Dotted Connector Arrow */}
                          {connEnabled && idx < steps.length - 1 && (
                            <div 
                              className="flex flex-shrink-0 items-center justify-center w-8 md:flex-grow md:w-auto px-1"
                              style={{ height: `${circleSize}px` }}
                            >
                              <svg 
                                width="100%" 
                                height="12" 
                                viewBox="0 0 32 12" 
                                fill="none" 
                                xmlns="http://www.w3.org/2000/svg" 
                                className={`min-w-[20px] max-w-[60px] ${connAnim === 'pulse' ? 'animate-pulse' : connAnim === 'bounce' ? 'animate-bounce' : ''}`}
                                style={{ color: connCol }}
                              >
                                <path 
                                  d="M1 6H27" 
                                  stroke="currentColor" 
                                  strokeWidth={connThickness} 
                                  strokeDasharray={connStyle === 'dotted' ? '1 3' : connStyle === 'dashed' ? '5 5' : 'none'} 
                                  strokeLinecap="round" 
                                />
                                <path 
                                  d="M24 3L29 6L24 9" 
                                  stroke="currentColor" 
                                  strokeWidth={connThickness} 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                />
                              </svg>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Styles to hide scrollbars */}
                <style>{`
                  .no-scrollbar::-webkit-scrollbar {
                    display: none;
                  }
                  .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }
                `}</style>
              </div>
            </section>
          );
        })()}

        {/* OUR SOLUTIONS SECTION */}
        {type === 'OurSolutions' && (() => {
          const isEnabled = content.status !== 'disabled';
          if (!isEnabled) return null;

          const sectionHeader = content.sectionHeader || {
            badgeNumber: "06",
            badgeText: "OUR SOLUTIONS",
            badgeColor: "#16A34A",
            headingColor: "#1e293b"
          };

          // Build dynamic cards from selectedSolutions OR fallback to legacy cards
          const selectedSolutions = content.selectedSolutions || [];
          let displayCards = [];

          if (selectedSolutions.length > 0) {
            displayCards = selectedSolutions
              .filter((sel: any) => sel.enabled !== false)
              .map((sel: any, idx: number) => {
                const matchedSol = dbSolutions.find(s => s.id === sel.solutionId);
                const solName = matchedSol ? matchedSol.title : 'NX Solution';
                const solIcon = matchedSol ? (matchedSol.sections?.find((s: any) => s.id === 'hero')?.icon || 'Sparkles') : 'Sparkles';
                const solStatus = matchedSol ? matchedSol.status : 'published';

                const displayTitle = sel.customTitle || solName;
                const displaySubtitle = sel.subtitle || '';

                let iconElement = null;
                if (sel.homeIcon) {
                  if (typeof sel.homeIcon === 'string' && sel.homeIcon.trim().length > 0) {
                    if (sel.homeIcon.startsWith('http') || sel.homeIcon.startsWith('/') || sel.homeIcon.startsWith('data:')) {
                      iconElement = <img src={sel.homeIcon} alt={displayTitle} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />;
                    } else {
                      iconElement = renderIcon(sel.homeIcon, 'w-8 h-8');
                    }
                  } else if (typeof sel.homeIcon === 'object' && sel.homeIcon.url) {
                    iconElement = <img src={sel.homeIcon.url} alt={sel.homeIcon.alt || displayTitle} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />;
                  }
                }

                if (!iconElement) {
                  iconElement = renderIcon(solIcon || 'Sparkles', 'w-8 h-8');
                }

                return {
                  id: sel.solutionId || `sol-${idx}`,
                  title: displayTitle,
                  subtitle: displaySubtitle,
                  iconElement: iconElement,
                  status: solStatus,
                  order: sel.order || (idx + 1)
                };
              })
              .filter((c: any) => c.status === 'published')
              .sort((a: any, b: any) => a.order - b.order);
          } else {
            // Legacy/Pre-seeded cards fallback
            displayCards = (content.cards || [])
              .filter((c: any) => c.status !== false)
              .map((card: any, idx: number) => ({
                id: card.id || `card-${idx}`,
                title: card.title,
                subtitle: card.subtitle || '',
                iconElement: renderIcon(card.icon || 'Sparkles', 'w-8 h-8'),
                status: 'published',
                order: card.order || (idx + 1)
              }))
              .sort((a: any, b: any) => a.order - b.order);
          }

          const bgCol = styles.backgroundColor || '#ffffff';
          const topPad = styles.paddingTop || '60px';
          const botPad = styles.paddingBottom || '60px';
          const align = styles.alignment || 'left';
          const containerW = content.settings?.containerWidth || 'max-w-7xl';

          return (
            <section 
              id="section-home-our-solutions" 
              className="w-full relative transition-all duration-300 bg-white"
              style={{ 
                backgroundColor: '#ffffff',
                paddingTop: '56px',
                paddingBottom: '56px',
                marginTop: '0px',
                marginBottom: '0px',
              }}
            >
              <div className="max-w-[1400px] mx-auto px-4 md:px-12">
                
                {/* Header: Centered or Left aligned */}
                <div className={`flex items-center gap-2.5 mb-8 ${align === 'center' ? 'justify-center' : 'justify-start'}`}>
                  <h2 
                    className="text-[13px] font-black tracking-wider uppercase font-sans text-slate-800"
                  >
                    {sectionHeader.badgeText || 'OUR SOLUTIONS'}
                  </h2>
                </div>

                {/* Cards Container with responsive horizontal scroll and desktop grid */}
                <div className="w-full overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0">
                  <div className="flex flex-nowrap lg:grid lg:grid-cols-9 gap-3 w-full min-w-max lg:min-w-0">
                    {displayCards.map((card: any) => {
                      const cardEl = (
                        <div 
                          className="flex flex-col items-center justify-center text-center p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-emerald-500/30 transition-all duration-300 group cursor-pointer w-[140px] md:w-[160px] lg:w-auto h-[165px] flex-shrink-0 snap-start select-none"
                        >
                          {/* Icon */}
                          <div 
                            className="w-12 h-12 flex items-center justify-center mb-4 rounded-full bg-slate-50 text-emerald-600 transition-transform duration-300 group-hover:scale-110"
                          >
                            {card.iconElement}
                          </div>

                          {/* Text Content */}
                          <div className="space-y-1 w-full overflow-hidden">
                            <h3 
                              className="text-[12px] font-extrabold tracking-tight text-slate-800 line-clamp-2 leading-snug px-1"
                            >
                              {card.title}
                            </h3>
                            {card.subtitle ? (
                              <p 
                                className="text-[10px] font-medium leading-tight text-slate-400 line-clamp-1 px-1"
                              >
                                {card.subtitle}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      );

                      const linkPath = solutionPaths[card.id];
                      if (linkPath) {
                        return (
                          <Link key={card.id} to={linkPath} className="no-underline block">
                            {cardEl}
                          </Link>
                        );
                      }

                      return (
                        <div key={card.id} className="block">
                          {cardEl}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

        {/* OUR CURRENT WORK SECTION */}
        {type === 'OurCurrentWork' && (() => {
          const isEnabled = content.status !== 'disabled';
          if (!isEnabled) return null;

          const sectionHeader = content.sectionHeader || {
            badgeNumber: "07",
            badgeText: "OUR CURRENT WORK",
            badgeColor: "#16A34A",
            headingColor: "#1e293b"
          };

          // Determine cards to render based on selected projects array or legacy fallback
          let displayCards: any[] = [];
          if (content.selectedProjects && Array.isArray(content.selectedProjects) && content.selectedProjects.length > 0) {
            displayCards = content.selectedProjects
              .filter((sp: any) => sp.enabled !== false)
              .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
              .map((sp: any, idx: number) => {
                const matchedCs = dynamicCaseStudies.find((cs: any) => cs.id === sp.projectId);
                return {
                  id: sp.projectId || idx,
                  title: sp.customTitle || matchedCs?.title || 'Featured Project',
                  subtitle: sp.subtitle || matchedCs?.clientName || matchedCs?.industry || 'Location',
                  image: sp.homeImage || matchedCs?.image || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
                  statusText: sp.statusText || 'Active Project',
                  statusColor: sp.statusColor || '#16A34A',
                  slug: matchedCs?.slug || matchedCs?.id || 'case-studies'
                };
              });
          } else if (dynamicCaseStudies && dynamicCaseStudies.length > 0) {
            // Fallback to top database case studies
            displayCards = dynamicCaseStudies.slice(0, 6).map((cs: any, idx: number) => ({
              id: cs.id,
              title: cs.title,
              subtitle: cs.clientName || cs.industry || 'Indore, MP',
              image: cs.image || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
              statusText: idx % 2 === 0 ? 'Active Project' : 'Active Research',
              statusColor: idx % 2 === 0 ? '#16A34A' : '#EA580C',
              slug: cs.slug || cs.id
            }));
          } else {
            // Legacy content fallback
            displayCards = content.cards || [];
          }

          const bgCol = styles.backgroundColor || '#ffffff';
          const topPad = styles.paddingTop || '60px';
          const bottomPad = styles.paddingBottom || '60px';
          const align = styles.alignment || 'left';
          const containerW = content.settings?.containerWidth || 'max-w-7xl';

          return (
            <section 
              id="section-home-our-current-work" 
              className="w-full relative transition-all duration-300 bg-white"
              style={{ 
                backgroundColor: '#ffffff',
                paddingTop: '56px',
                paddingBottom: '56px',
                marginTop: '0px',
                marginBottom: '0px',
              }}
            >
              <div className="max-w-[1400px] mx-auto px-4 md:px-12">
                
                {/* Header: Centered or Left aligned */}
                <div className={`flex items-center gap-2.5 mb-8 ${align === 'center' ? 'justify-center' : 'justify-start'}`}>
                  <h2 
                    className="text-[13px] font-black tracking-wider uppercase font-sans text-slate-800"
                  >
                    {sectionHeader.badgeText || 'OUR CURRENT WORK'}
                  </h2>
                </div>

                {/* Cards Container with responsive horizontal scroll and desktop grid */}
                <div className="w-full overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0">
                  <div className="flex flex-nowrap lg:grid lg:grid-cols-6 gap-4 w-full min-w-max lg:min-w-0">
                    {displayCards.map((card: any, idx: number) => {
                      const cardUrl = card.slug ? `/case-studies/${card.slug}` : (content.exploreUrl || '/case-studies');

                      return (
                        <Link 
                          key={card.id || idx}
                          to={cardUrl}
                          className="flex flex-col bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-emerald-500/30 transition-all duration-300 w-[210px] md:w-[230px] lg:w-auto h-[320px] flex-shrink-0 snap-start select-none group cursor-pointer"
                        >
                          {/* Image */}
                          <div className="w-full h-[130px] overflow-hidden bg-slate-50 relative">
                            <img 
                              src={card.image} 
                              alt={card.title} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 flex flex-col justify-between p-4 text-center">
                            <div className="space-y-1.5">
                              <h3 className="text-[12px] font-extrabold tracking-tight text-slate-800 line-clamp-2 leading-snug px-1 group-hover:text-emerald-600 transition-colors">
                                {card.title}
                              </h3>
                              <p className="text-[11px] font-semibold text-slate-400 truncate">
                                {card.subtitle}
                              </p>
                            </div>

                            {/* Status Pill */}
                            <div className="pt-2">
                              <span 
                                className="inline-block px-3 py-1 rounded-md text-[10px] font-bold text-white transition-opacity duration-300 hover:opacity-90 shadow-xs"
                                style={{ backgroundColor: card.statusColor || '#16A34A' }}
                              >
                                {card.statusText}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Explore Button */}
                <div className="flex justify-center mt-8">
                  <Link 
                    to={content.exploreUrl || '/case-studies'} 
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 rounded-lg text-slate-700 hover:text-slate-900 text-[11px] font-black uppercase tracking-wider transition-all duration-300 shadow-sm cursor-pointer"
                  >
                    <span>{content.exploreText || 'Explore All Projects'}</span>
                    {renderIcon("ArrowRight", "w-3.5 h-3.5 text-slate-500")}
                  </Link>
                </div>

              </div>
            </section>
          );
        })()}

        {/* TECHNOLOGY ECOSYSTEM SECTION */}
        {(type === 'TechnologyEcosystem' || type === 'TechnologyPartners') && (() => {
          const isEnabled = content.status !== 'disabled';
          if (!isEnabled) return null;

          const sectionHeader = content.sectionHeader || {
            badgeNumber: "08",
            badgeText: "TECHNOLOGY ECOSYSTEM",
            badgeColor: "#16A34A",
            headingColor: "#1e293b"
          };

          let topLogos = content.logosTopRow || [];
          let bottomLogos = content.logosBottomRow || [];

          if (dbTechnologies && dbTechnologies.length > 0) {
            const activeTechs = dbTechnologies
              .filter(t => t.status === 'published')
              .sort((a, b) => (a.order || 0) - (b.order || 0));
            
            if (activeTechs.length > 0) {
              const half = Math.ceil(activeTechs.length / 2);
              topLogos = activeTechs.slice(0, half);
              bottomLogos = activeTechs.slice(half);
            }
          }

          if (topLogos.length === 0) {
            topLogos = [
              { id: "tech-1", name: "HIKVISION" },
              { id: "tech-2", name: "dahua" },
              { id: "tech-3", name: "MATRIX" },
              { id: "tech-4", name: "suprema" },
              { id: "tech-5", name: "AXIS" },
              { id: "tech-6", name: "BOSCH" },
              { id: "tech-7", name: "Honeywell" },
              { id: "tech-8", name: "CP PLUS" }
            ];
          }

          if (bottomLogos.length === 0) {
            bottomLogos = [
              { id: "tech-9", name: "ZKTeco" },
              { id: "tech-10", name: "eSSL" },
              { id: "tech-11", name: "MANTRA" },
              { id: "tech-12", name: "D-Link" },
              { id: "tech-13", name: "tp-link" },
              { id: "tech-14", name: "UBIQUITI NETWORKS" },
              { id: "tech-15", name: "Microsoft" },
              { id: "tech-16", name: "aws" },
              { id: "tech-17", name: "Google Cloud" },
              { id: "tech-18", name: "ONVIF" },
              { id: "tech-19", name: "MQTT" }
            ];
          }


          const caption = content.captionText || "Compatible with leading enterprise hardware and software technologies based on project requirements.";

          const bgCol = styles.backgroundColor || '#ffffff';
          const topPad = styles.paddingTop || '40px';
          const bottomPad = styles.paddingBottom || '60px';
          const align = styles.alignment || 'left';
          const containerW = content.settings?.containerWidth || 'max-w-7xl';

          const renderBrandLogo = (brand: { name: string; logo?: string }) => {
            if (brand.logo) {
              return <img src={brand.logo} alt={brand.name} className="h-6 md:h-7 object-contain max-w-[120px]" referrerPolicy="no-referrer" />;
            }
            const cleanName = (brand.name || '').toLowerCase().trim();
            if (cleanName.includes('hikvision')) {
              return (
                <div className="flex items-center select-none">
                  <span className="font-extrabold text-sm md:text-base tracking-tighter text-[#D00000] italic font-sans">
                    HIK<span className="text-[#333333]">VISION</span>
                  </span>
                </div>
              );
            }
            if (cleanName.includes('dahua')) {
              return (
                <div className="flex flex-col items-center leading-none select-none">
                  <span className="font-extrabold text-sm md:text-base text-[#C80000] tracking-tight italic font-sans">
                    alhua
                  </span>
                  <span className="text-[5px] md:text-[6px] tracking-widest font-extrabold text-slate-800 -mt-0.5">
                    TECHNOLOGY
                  </span>
                </div>
              );
            }
            if (cleanName.includes('matrix')) {
              return (
                <div className="flex items-center gap-1.5 leading-none select-none">
                  <div className="grid grid-cols-3 gap-0.5 w-3.5 h-3.5 flex-shrink-0">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="bg-[#007070] rounded-[0.5px]"></div>
                    ))}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-black text-xs md:text-sm text-[#006666] tracking-widest font-sans">MATRIX</span>
                    <span className="text-[5px] font-extrabold tracking-tight text-slate-800">TELECOM | SECURITY</span>
                  </div>
                </div>
              );
            }
            if (cleanName.includes('suprema')) {
              return (
                <div className="flex flex-col text-left leading-none select-none">
                  <span className="font-extrabold text-sm md:text-base text-[#C00000] tracking-tight font-sans">suprema</span>
                  <span className="text-[5px] md:text-[6px] text-slate-700 font-bold -mt-0.5">Security & Biometrics</span>
                </div>
              );
            }
            if (cleanName.includes('axis')) {
              return (
                <div className="flex flex-col items-center leading-none select-none">
                  <div className="flex items-center gap-0.5">
                    <span className="font-black text-sm md:text-base text-slate-900 tracking-wider font-sans">AXIS</span>
                    <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[9px] border-b-amber-500"></div>
                  </div>
                  <span className="text-[5px] font-black text-slate-800 tracking-wider">COMMUNICATIONS</span>
                </div>
              );
            }
            if (cleanName.includes('bosch')) {
              return (
                <div className="flex items-center gap-1.5 leading-none select-none">
                  <div className="w-4 h-4 rounded-full border-2 border-slate-700 flex items-center justify-center text-[8px] font-black text-slate-800 flex-shrink-0">B</div>
                  <div className="flex flex-col text-left">
                    <span className="font-black text-sm md:text-base text-[#E2001A] tracking-wider font-sans">BOSCH</span>
                    <span className="text-[5px] text-slate-600 font-semibold">Invented for life</span>
                  </div>
                </div>
              );
            }
            if (cleanName.includes('honeywell')) {
              return (
                <span className="font-black text-sm md:text-base text-[#EE3124] tracking-tight font-sans select-none">Honeywell</span>
              );
            }
            if (cleanName.includes('cp plus') || cleanName.includes('cpplus')) {
              return (
                <div className="flex items-center gap-1 leading-none select-none">
                  <span className="text-[#CC0000] font-black text-xs">✕</span>
                  <div className="flex flex-col text-left">
                    <span className="font-black text-xs md:text-sm text-[#CC0000] tracking-tight font-sans">CP PLUS</span>
                    <span className="text-[5px] text-slate-700 font-bold">Intelligent Security Systems</span>
                  </div>
                </div>
              );
            }
            if (cleanName.includes('zkteco')) {
              return (
                <span className="font-extrabold text-sm md:text-base tracking-tight font-sans select-none">
                  <span className="text-slate-800">ZK</span>
                  <span className="text-[#7CB342]">Teco</span>
                </span>
              );
            }
            if (cleanName.includes('essl')) {
              return (
                <div className="flex flex-col text-left leading-none select-none">
                  <span className="font-black text-sm md:text-base text-[#0040A0] italic font-sans">eSSL</span>
                  <span className="text-[5px] text-slate-600 font-bold">Security at Fingertips</span>
                </div>
              );
            }
            if (cleanName.includes('mantra')) {
              return (
                <div className="flex flex-col text-left leading-none select-none">
                  <span className="font-black text-xs md:text-sm text-[#0040B0] tracking-wider font-sans">MANTRA</span>
                  <span className="text-[5px] text-[#CC0000] font-bold">Innovation that counts</span>
                </div>
              );
            }
            if (cleanName.includes('d-link')) {
              return (
                <span className="font-black text-sm md:text-base text-[#0066A0] tracking-tight font-sans select-none">D-Link</span>
              );
            }
            if (cleanName.includes('tp-link')) {
              return (
                <div className="flex items-center gap-1 leading-none select-none">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#00A0B0] flex items-center justify-center text-white text-[7px] font-black flex-shrink-0">tp</div>
                  <span className="font-bold text-sm md:text-base text-slate-800 font-sans">tp-link</span>
                </div>
              );
            }
            if (cleanName.includes('ubiquiti')) {
              return (
                <div className="flex items-center gap-1 leading-none select-none">
                  <span className="font-bold text-slate-900 text-xs">U</span>
                  <div className="flex flex-col text-left">
                    <span className="font-black text-[11px] md:text-xs text-slate-900 tracking-wider font-sans">UBIQUITI</span>
                    <span className="text-[5px] text-slate-600 font-extrabold tracking-widest">NETWORKS</span>
                  </div>
                </div>
              );
            }
            if (cleanName.includes('microsoft')) {
              return (
                <div className="flex items-center gap-1.5 leading-none select-none">
                  <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5 flex-shrink-0">
                    <div className="bg-[#F25022]"></div>
                    <div className="bg-[#7FBA00]"></div>
                    <div className="bg-[#00A4EF]"></div>
                    <div className="bg-[#FFB900]"></div>
                  </div>
                  <span className="font-semibold text-xs md:text-sm text-slate-700 font-sans">Microsoft</span>
                </div>
              );
            }
            if (cleanName.includes('aws')) {
              return (
                <div className="flex flex-col items-center leading-none select-none">
                  <span className="font-black text-sm md:text-base text-slate-900 tracking-tight font-sans">aws</span>
                  <div className="w-4 h-0.5 border-b-2 border-amber-500 rounded-full -mt-0.5"></div>
                </div>
              );
            }
            if (cleanName.includes('google cloud')) {
              return (
                <div className="flex items-center gap-1.5 leading-none select-none">
                  <div className="w-3.5 h-3.5 relative flex items-center justify-center flex-shrink-0">
                    <div className="w-3 h-3 rounded-full border-2 border-blue-500 border-t-red-500 border-r-amber-500 border-b-green-500"></div>
                  </div>
                  <span className="font-semibold text-xs md:text-sm text-slate-700 font-sans">Google Cloud</span>
                </div>
              );
            }
            if (cleanName.includes('onvif')) {
              return (
                <span className="font-black text-sm md:text-base text-[#002878] tracking-widest font-sans select-none">Onvif</span>
              );
            }
            if (cleanName.includes('mqtt')) {
              return (
                <div className="flex items-center gap-1 leading-none select-none">
                  <span className="text-purple-700 font-black text-xs">📶</span>
                  <span className="font-black text-xs md:text-sm text-[#3C096C] font-sans">MQTT</span>
                </div>
              );
            }
            return <span className="font-bold text-xs text-slate-800">{brand.name}</span>;
          };

          return (
            <section 
              id="section-home-technology-ecosystem" 
              className="w-full relative transition-all duration-300 bg-white"
              style={{ 
                backgroundColor: '#ffffff',
                paddingTop: '56px',
                paddingBottom: '56px',
                marginTop: '0px',
                marginBottom: '0px',
              }}
            >
              <div className="max-w-[1400px] mx-auto px-4 md:px-12">
                
                {/* Section Header */}
                <div className={`flex items-center gap-2.5 mb-6 ${align === 'center' ? 'justify-center' : 'justify-start'}`}>
                  <h2 
                    className="text-[13px] font-black tracking-wider uppercase font-sans text-slate-800"
                  >
                    {sectionHeader.badgeText || 'TECHNOLOGY ECOSYSTEM'}
                  </h2>
                </div>

                {/* Main Outer Box with Left/Right Green Arrows */}
                <div className="relative w-full bg-white border border-slate-200/90 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xs">
                  
                  {/* Left Arrow */}
                  <button 
                    type="button" 
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#16A34A] hover:text-emerald-700 transition-colors p-1"
                    aria-label="Previous technologies"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Right Arrow */}
                  <button 
                    type="button" 
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#16A34A] hover:text-emerald-700 transition-colors p-1"
                    aria-label="Next technologies"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Logos Container */}
                  <div className="px-6 md:px-10 space-y-8 md:space-y-10">
                    
                    {/* Top Row */}
                    <div className="flex flex-wrap items-center justify-between gap-y-6 gap-x-4 md:gap-x-8">
                      {topLogos.map((brand: any, idx: number) => (
                        <div key={brand.id || idx} className="flex items-center justify-center flex-1 min-w-[100px] md:min-w-[110px]">
                          {renderBrandLogo(brand)}
                        </div>
                      ))}
                    </div>

                    {/* Bottom Row */}
                    <div className="flex flex-wrap items-center justify-between gap-y-6 gap-x-3 md:gap-x-6">
                      {bottomLogos.map((brand: any, idx: number) => (
                        <div key={brand.id || idx} className="flex items-center justify-center flex-1 min-w-[85px] md:min-w-[95px]">
                          {renderBrandLogo(brand)}
                        </div>
                      ))}
                    </div>

                  </div>

                </div>

                {/* Caption Text Below Container */}
                {caption && (
                  <p className="text-center text-xs md:text-[13px] font-semibold text-slate-700 mt-6 tracking-tight">
                    {caption}
                  </p>
                )}

              </div>
            </section>
          );
        })()}

        {/* CLIENTS TRUST US SECTION */}
        {(type === 'ClientsTrustUs' || type === 'AboutTestimonials') && (() => {
          const isEnabled = content.status !== 'disabled';
          if (!isEnabled) return null;

          const sectionHeader = content.sectionHeader || {
            badgeNumber: "09",
            badgeText: "CLIENTS TRUST US",
            badgeColor: "#16A34A",
            headingColor: "#1e293b"
          };

          const selectedRefs: any[] = content.selectedTestimonials || [];

          let testimonialsList: Array<{ id: string; quote: string; author: string; organization?: string }> = [];

          if (selectedRefs.length > 0 && dbTestimonials.length > 0) {
            testimonialsList = selectedRefs
              .filter((ref: any) => ref.enabled !== false)
              .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
              .map((ref: any) => {
                const item = dbTestimonials.find((t: any) => t.id === ref.testimonialId);
                if (!item) return null;
                const authorStr = item.author || item.clientName || '';
                return {
                  id: item.id,
                  quote: item.testimonial,
                  author: authorStr.startsWith('-') ? authorStr : `- ${authorStr}`,
                  organization: item.organization || item.designation || ''
                };
              })
              .filter((t): t is any => t !== null);
          }

          if (testimonialsList.length === 0) {
            if (dbTestimonials && dbTestimonials.length > 0) {
              testimonialsList = dbTestimonials.map((item: any) => {
                const authorStr = item.author || item.clientName || '';
                return {
                  id: item.id,
                  quote: item.testimonial,
                  author: authorStr.startsWith('-') ? authorStr : `- ${authorStr}`,
                  organization: item.organization || item.designation || ''
                };
              });
            } else {
              testimonialsList = content.testimonials || [];
            }
          }

          const bgCol = styles.backgroundColor || '#ffffff';
          const topPad = styles.paddingTop || '40px';
          const bottomPad = styles.paddingBottom || '60px';
          const align = styles.alignment || 'left';
          const containerW = content.settings?.containerWidth || 'max-w-7xl';

          const itemsPerPage = 2;
          const totalPages = Math.max(Math.ceil(testimonialsList.length / itemsPerPage), 1);
          const [activePageIndex, setActivePageIndex] = useState(0);

          const currentPageItems = testimonialsList.slice(
            activePageIndex * itemsPerPage,
            activePageIndex * itemsPerPage + itemsPerPage
          );

          return (
            <section
              id="section-home-clients-trust-us"
              className="w-full relative transition-all duration-300 bg-white"
              style={{
                backgroundColor: '#ffffff',
                paddingTop: '56px',
                paddingBottom: '56px',
                marginTop: '0px',
                marginBottom: '0px',
              }}
            >
              <div className="max-w-[1400px] mx-auto px-4 md:px-12">
                
                {/* Section Header */}
                <div className={`flex items-center gap-2.5 mb-6 md:mb-8 ${align === 'center' ? 'justify-center' : 'justify-start'}`}>
                  <h2 
                    className="text-[13px] md:text-sm font-black tracking-wider uppercase font-sans text-slate-800"
                  >
                    {sectionHeader.badgeText || 'CLIENTS TRUST US'}
                  </h2>
                </div>

                {/* Cards Grid (Side by side 2 columns) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  {currentPageItems.map((testi: any, idx: number) => (
                    <div 
                      key={testi.id || idx}
                      className="bg-white border border-slate-200/90 rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all duration-300 min-h-[220px]"
                    >
                      <div className="space-y-3">
                        {/* Big Dark Quote Mark */}
                        <div className="text-2xl md:text-3xl font-black text-slate-900 leading-none select-none font-serif">
                          “
                        </div>
                        {/* Quote Text */}
                        <p className="text-slate-800 text-xs md:text-sm font-medium leading-relaxed">
                          {testi.quote}
                        </p>
                      </div>

                      {/* Author & Organization */}
                      <div className="mt-6 pt-2">
                        <p className="font-bold text-slate-900 text-xs md:text-sm">
                          {testi.author}
                        </p>
                        {testi.organization && (
                          <p className="text-slate-600 text-xs md:text-sm font-medium mt-0.5">
                            {testi.organization}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Dots */}
                <div className="flex items-center justify-center gap-2 mt-6 md:mt-8">
                  {Array.from({ length: Math.max(totalPages, 4) }).map((_, dotIdx) => {
                    const isActive = dotIdx === (activePageIndex % Math.max(totalPages, 1));
                    return (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={() => setActivePageIndex(dotIdx % totalPages)}
                        aria-label={`Go to slide ${dotIdx + 1}`}
                        className={`transition-all duration-300 rounded-full ${
                          isActive 
                            ? 'w-2.5 h-2.5 bg-[#16A34A]' 
                            : 'w-2 h-2 bg-slate-300 hover:bg-slate-400 cursor-pointer'
                        }`}
                      />
                    );
                  })}
                </div>

              </div>
            </section>
          );
        })()}

        {/* INSTITUTION SECTION */}
        {type === 'Institution' && (
          <div className="space-y-10">
            {/* Breadcrumb & Header */}
            <div className="w-full text-center mb-stack-lg">
              <div className="text-on-surface-variant font-label-sm text-label-sm mb-stack-md flex justify-center items-center gap-2">
                <span className="cursor-pointer hover:text-secondary transition-colors" onClick={() => navigate('/')}>Home</span>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant select-none">chevron_right</span>
                <span className="cursor-pointer hover:text-secondary transition-colors" onClick={() => navigate('/industries')}>Education</span>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant select-none">chevron_right</span>
                <span className="text-secondary font-bold">Institution</span>
              </div>
              <h1 className="text-headline-xl font-headline-xl text-primary mb-stack-sm">
                {content.title || 'Education'}
              </h1>
              <p className="text-body-lg font-body-lg text-on-surface-variant">
                {content.subtitle || 'Select the type of Institution'}
              </p>
            </div>

            <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter mt-stack-lg">
              {content.items && content.items.filter((item: any) => item.visible !== false).map((item: any, idx: number) => {
                const clickLink = item.buttonLink || item.link || item.slug || '/contact';
                return (
                  <div
                    key={item.id || idx}
                    onClick={() => navigate(clickLink)}
                    className="group flex flex-col items-center justify-center p-5 bg-white border border-slate-200/80 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md hover:border-[#0059bb] cursor-pointer hover:-translate-y-2"
                  >
                    {item.image ? (
                      <div className="w-[45%] md:w-[50%] mx-auto mb-3 overflow-hidden rounded-xl aspect-square border border-slate-100 bg-slate-50">
                        <img
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          src={item.image}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-blue-50/50 flex items-center justify-center text-[#0059bb] mb-3 transition-colors group-hover:bg-blue-50 border border-slate-100">
                        {renderIcon(item.icon, "w-7 h-7")}
                      </div>
                    )}
                    <h3 className="text-sm md:text-base font-bold text-[#00244a] mb-1.5 text-center group-hover:text-[#0059bb] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 text-center max-w-[140px] leading-relaxed line-clamp-2 mx-auto">
                      {item.description || item.desc || ''}
                    </p>
                    {item.button && (
                      <div className="mt-3 text-[11px] font-bold text-secondary group-hover:underline flex items-center justify-center gap-1">
                        <span>{item.button}</span>
                        <span>&rarr;</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AREA SECTION */}
        {type === 'Area' && (
          <div className="space-y-10">
            <div className={`${alignClass} space-y-3 max-w-3xl mx-auto`}>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.primaryColor }}>
                {content.title}
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                {content.subtitle}
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {content.items && content.items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  onClick={() => navigate(item.link)}
                  className="group bg-white rounded-xl border border-gray-100 p-5 text-center shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col items-center space-y-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50/55 text-blue-600 flex items-center justify-center">
                    {renderIcon(item.icon, "w-5 h-5")}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 group-hover:text-blue-600">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROBLEM SECTION */}
        {type === 'Problem' && (
          <div className="space-y-10">
            <div className={`${alignClass} space-y-3 max-w-3xl mx-auto`}>
              <span 
                className="text-xs font-bold uppercase tracking-wider" 
                style={{ 
                  color: section.id === 'problem-selector' ? '#00244a' : theme.primaryColor,
                  ...(section.id === 'problem-selector' ? { fontSize: '38px', lineHeight: '57.6px' } : {})
                }}
              >
                {content.title}
              </span>
              <h2 
                className="text-3xl font-bold tracking-tight text-slate-900"
                style={section.id === 'problem-selector' ? { fontSize: '18px', lineHeight: '28.8px', color: '#757579' } : {}}
              >
                {content.subtitle}
              </h2>
            </div>

            <div className={section.id === 'problem-selector' ? "w-full flex flex-wrap justify-center gap-6" : "grid grid-cols-2 md:grid-cols-4 gap-5"}>
              {content.items && content.items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  onClick={() => navigate(item.link)}
                  className={section.id === 'problem-selector'
                    ? "group bg-white rounded-xl border border-slate-200/80 p-6 flex flex-col items-center justify-center text-center hover:shadow-md hover:border-[#006dff] transition-all duration-300 cursor-pointer hover:-translate-y-2 shadow-sm"
                    : "group bg-red-50/20 hover:bg-red-50/40 rounded-xl border border-red-100/50 p-5 text-center transition-all cursor-pointer flex flex-col items-center space-y-3"
                  }
                  style={section.id === 'problem-selector' ? { width: '270px', height: '199px' } : {}}
                >
                  <div 
                    className={section.id === 'problem-selector' ? "w-10 h-10 flex items-center justify-center bg-red-100/50 text-red-500" : "w-10 h-10 rounded-lg bg-red-100/50 text-red-500 flex items-center justify-center"}
                    style={section.id === 'problem-selector' ? { borderRadius: '100px', marginTop: '26px' } : {}}
                  >
                    {renderIcon(item.icon, "w-5 h-5")}
                  </div>
                  <div>
                    <h4 
                      className="font-semibold text-sm text-red-950 group-hover:text-red-700"
                      style={section.id === 'problem-selector' ? { fontSize: '16px', lineHeight: '33.6px' } : {}}
                    >
                      {item.title}
                    </h4>
                    <p 
                      className="text-[11px] text-red-700/60 mt-0.5"
                      style={section.id === 'problem-selector' ? { fontSize: '12px', lineHeight: '14.4px' } : {}}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SOLUTION SECTION */}
        {type === 'Solution' && (
          <div className="space-y-16">
            {/* TOP HERO SECTION */}
            <div className="bg-white text-slate-900 rounded-3xl p-8 md:p-12 relative overflow-hidden">
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Left content column */}
                <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                    {content.subtitle || "AI-Powered Security & Access Control Solution"}
                  </span>
                  <h1 
                    className="font-extrabold tracking-tight leading-none text-slate-900"
                    style={{ fontSize: "20px", lineHeight: "28px" }}
                  >
                    {content.title || "Unauthorized Entry at Main Gate"}
                  </h1>
                  <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
                    {content.problemDesc || "Unauthorized people enter the school premises, which seriously compromises the safety and security of students, teachers, and administrative staff."}
                  </p>
                  
                  {content.challenges && content.challenges.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {content.challengesHeading || "Critical Gating Challenges Solved:"}
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {content.challenges.map((challenge: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                            <Icons.AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <span>{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Right image column */}
                <img 
                  src={content.image || "https://images.unsplash.com/photo-1541829019-2592e213f985?w=800&auto=format&fit=crop&q=80"}
                  alt="Solution overview"
                  className="lg:col-span-5 w-full h-[280px] md:h-[340px] object-cover hover:scale-[1.01] transition-transform duration-300 order-1 lg:order-2"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* 13 ALTERNATING FEATURE SECTIONS */}
            <div className="space-y-12">
              {[
                {
                  title: "AI Entrance Gates & High-Precision Turnstiles",
                  subtitle: "Smart Access Control & Barrier Integration",
                  desc: "Deploy intelligent physical barriers equipped with sub-second AI facial recognition scanners and automated biometric gating. Prevent tailgating and unauthorized access at key entry points with real-time operational logging.",
                  points: [
                    "Sub-second biometric facial scanning verification",
                    "Dynamic tailgating detection with immediate security desk alerts",
                    "Robust hardware compatibility with multiple gate and turnstile types",
                    "Automatic fail-safe and emergency trigger mechanisms"
                  ],
                  image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop&q=80"
                },
                {
                  title: "Dynamic Visitor Logging & Instant Verification",
                  subtitle: "Digital Visitor Management",
                  desc: "Say goodbye to manual registers and unreliable paper registries. Our digital self-service visitor kiosks capture real-time photo-proofing, authenticate government-issued IDs, and print dynamic QR access badges instantly.",
                  points: [
                    "Intuitive self-service check-in kiosks for quick guest logging",
                    "Live photo verification matching visiting personnel to databases",
                    "Temporary QR-coded visitor passes restricting access to specific zones",
                    "Cloud-based centralized visitor history and active dashboard tracker"
                  ],
                  image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80"
                },
                {
                  title: "Continuous AI Surveillance & Perimeter Intrusion Guard",
                  subtitle: "Real-Time Smart Camera Monitoring",
                  desc: "Transform standard CCTV networks into active perimeter security guards. Our computer vision software analyzes active feeds to identify humans, unauthorized vehicles, and perimeter crossing breaches with zero passive latency.",
                  points: [
                    "Real-time object detection categorizing humans, vehicles, and objects",
                    "Virtual-fence boundary configuration with instant telemetry alerts",
                    "PTZ camera auto-tracking focusing on target intrusion events",
                    "Highly responsive mobile notifications dispatched to active guard teams"
                  ],
                  image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop&q=80"
                },
                {
                  title: "Automated Vehicle Parking & ANPR License Plate Systems",
                  subtitle: "Autonomous Vehicle Access Controls",
                  desc: "Streamline campus and facility vehicle access through automatic number plate recognition (ANPR). Match license plates instantly against whitelist or blacklist databases to trigger barriers automatically.",
                  points: [
                    "High-accuracy camera reading plate text under challenging lighting",
                    "Automated barrier control for whitelisted corporate and visitor cars",
                    "Real-time blacklist plate match notifications to prevent entry",
                    "Peak-hour traffic analytics optimizing driveway logistics"
                  ],
                  image: "https://images.unsplash.com/photo-1616432043562-3671ea2e5259?w=600&auto=format&fit=crop&q=80"
                },
                {
                  title: "Server Room & High-Security Asset Biometric Protection",
                  subtitle: "Restricted Zone Access Guarding",
                  desc: "Secure mission-critical rooms, laboratories, and high-value physical assets. Incorporate multi-factor biometric authentications requiring matching credentials before electronic lock release.",
                  points: [
                    "Drizzle-edge multi-biometric fingerprint and facial authentication",
                    "Custom restriction profiles based on scheduled access windows",
                    "Silent duress alerts dispatching response teams on forced entry",
                    "Anti-passback protocols preventing physical credential swapping"
                  ],
                  image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80"
                },
                {
                  title: "AI Fire, Smoke & Thermal Safety Hazard Warners",
                  subtitle: "Environmental Hazard Early Alert System",
                  desc: "Detect potential industrial hazards and electrical overheating within seconds. Thermal cameras and computer-vision-powered smoke trackers trigger immediate evacuation protocols before physical sensor activation.",
                  points: [
                    "Optical-based computer vision smoke and open flame trackers",
                    "Thermal boundary monitoring detecting component overheating",
                    "Automatic physical exit door release on active fire alerts",
                    "Direct integration with campus loudspeakers and broadcast networks"
                  ],
                  image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80"
                },
                {
                  title: "Enterprise Multi-Location Smart Attendance & Shift Sync",
                  subtitle: "B2B Employee Productivity Management",
                  desc: "Connect workforces seamlessly. Secure wall-mounted tablets and geofenced mobile checks automate time tracking, calculate active hours, and sync seamlessly into payroll modules.",
                  points: [
                    "Liveness-checked facial scanning preventing proxy clocking",
                    "Geofenced mobile application logging for field workers",
                    "Real-time corporate shift synchronization and schedule alerts",
                    "Overtime and performance metrics exports for HR reviews"
                  ],
                  image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80"
                },
                {
                  title: "Crowd Density, Loitering & Heatmap Visualizations",
                  subtitle: "Space Optimization & Security Analytics",
                  desc: "Manage spatial density and optimize physical footfall flow. AI camera analytics generate active heatmaps, detect crowded lobbies, and trigger alerts when groups exceed threshold capacities.",
                  points: [
                    "Visual density heatmaps identifying high-traffic areas",
                    "Loitering detection triggers for individuals stationary in secure zones",
                    "Automated queue length notifications to route administrative staff",
                    "Spatial occupancy analytics maximizing facility leasing layout"
                  ],
                  image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&auto=format&fit=crop&q=80"
                },
                {
                  title: "Patrol Guard Verification & Incident Reporting Checkpoints",
                  subtitle: "Active Security Patrolling Verification",
                  desc: "Ensure complete patrol route coverage with real-time waypoint reporting. Security personnel check in at physical NFC tags and upload photo logs directly to supervisors via robust mobile workflows.",
                  points: [
                    "NFC and QR checkpoint tag verification preventing missed patrols",
                    "Instant incident photo uploads with automatic GPS coordinates",
                    "Supervisor dashboard showing patrol guard locations in real-time",
                    "Automated PDF shift reports dispatched at the close of hours"
                  ],
                  image: "https://images.unsplash.com/photo-1508847154043-be12a3b1819e?w=600&auto=format&fit=crop&q=80"
                },
                {
                  title: "Campus-Wide SIP Emergency Paging & Alerts",
                  subtitle: "Critical Incident Broadcast Network",
                  desc: "Respond to security events in real-time. Broadcast high-priority instructions, play recorded sirens, or dispatch mass-text notifications across the entire corporate campus with single-click command portals.",
                  points: [
                    "One-click web portal triggering multi-site emergency sirens",
                    "Integrated SIP intercom paging system for clear audio instructions",
                    "Automated mass SMS and WhatsApp notifications to personnel",
                    "Real-time visual map displaying status of active fire escape routes"
                  ],
                  image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80"
                },
                {
                  title: "Smart Inventory Tracking & Asset BLE Beacon Guard",
                  subtitle: "High-Value Corporate Asset Security",
                  desc: "Stop corporate equipment theft. Equip expensive server stacks, lab assets, and corporate laptops with active BLE (Bluetooth Low Energy) beacon tags that trigger alerts when approaching restricted borders.",
                  points: [
                    "BLE tags broadcasting real-time location metrics to sensors",
                    "Geofenced boundary limits detecting asset movement off-premises",
                    "Automatic exit gate locking on unauthorized asset movement",
                    "Dynamic physical item counts showing active warehouse stock levels"
                  ],
                  image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80"
                },
                {
                  title: "AI Voice-Enabled Gate Intercom & Front-Desk Panels",
                  subtitle: "Integrated Visitor Desk Communication Hub",
                  desc: "Manage high-traffic visitor gates and lobbies remotely. High-definition intercom units allow remote staff to speak, verify visiting targets, and release mechanical gates with clear digital clarity.",
                  points: [
                    "Noise-canceling speaker arrays for clear communication in noisy environments",
                    "Remote physical gate unlock buttons from any browser terminal",
                    "Automated helpdesk ticket logging for visitor inquiries",
                    "High-definition video feeds paired with standard SIP voice streams"
                  ],
                  image: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=600&auto=format&fit=crop&q=80"
                },
                {
                  title: "Unified Central Command Control Room Dashboard",
                  subtitle: "Multi-Site Administrative Control Center",
                  desc: "Gain total operational visibility. Combine multiple physical facility streams, access logs, active visitor alerts, and biometric triggers into a single command dashboard for administrators.",
                  points: [
                    "Multi-stream video wall view supporting high-definition feeds",
                    "Consolidated event log showing active gate and lock operations",
                    "Interactive incident management console to triage alert events",
                    "Custom scheduled report outputs in Excel, PDF, or secure API feed"
                  ],
                  image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80"
                }
              ].map((sect, idx) => {
                const isImageOnRight = idx % 2 === 0;
                return (
                  <div 
                    key={idx}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white rounded-2xl p-8 transition-all duration-300"
                  >
                    {isImageOnRight ? (
                      <>
                        {/* Left Content */}
                        <div className="space-y-4">
                          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                            {sect.subtitle}
                          </span>
                          <h3 
                            className="font-extrabold text-slate-900 tracking-tight"
                            style={{ fontSize: "20px", lineHeight: "28px" }}
                          >
                            {sect.title}
                          </h3>
                          <p className="text-sm text-slate-500 leading-relaxed">
                            {sect.desc}
                          </p>
                          {sect.points && sect.points.length > 0 && (
                            <ul className="space-y-2 pt-2">
                              {sect.points.map((pt, pIdx) => (
                                <li key={pIdx} className="flex items-start gap-2.5 text-xs text-slate-600">
                                  <Icons.CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                  <span>{pt}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        {/* Right Image (Direct child of grid) */}
                        <img 
                          src={sect.image} 
                          alt={sect.title} 
                          className="w-full h-[280px] md:h-[340px] object-cover hover:scale-[1.01] transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </>
                    ) : (
                      <>
                        {/* Left Image (Direct child of grid) */}
                        <img 
                          src={sect.image} 
                          alt={sect.title} 
                          className="w-full h-[280px] md:h-[340px] object-cover hover:scale-[1.01] transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        {/* Right Content */}
                        <div className="space-y-4">
                          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                            {sect.subtitle}
                          </span>
                          <h3 
                            className="font-extrabold text-slate-900 tracking-tight"
                            style={{ fontSize: "20px", lineHeight: "28px" }}
                          >
                            {sect.title}
                          </h3>
                          <p className="text-sm text-slate-500 leading-relaxed">
                            {sect.desc}
                          </p>
                          {sect.points && sect.points.length > 0 && (
                            <ul className="space-y-2 pt-2">
                              {sect.points.map((pt, pIdx) => (
                                <li key={pIdx} className="flex items-start gap-2.5 text-xs text-slate-600">
                                  <Icons.CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                  <span>{pt}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* EXPERIENCE DEMO SECTION */}
            <div className="bg-white rounded-2xl p-8 max-w-3xl mx-auto space-y-6">
              <div className="text-center space-y-1.5">
                <h3 className="text-xl font-bold text-slate-900">Experience the AI Proof</h3>
                <p className="text-xs text-gray-400">Request a live simulation audit matching your facility blueprint.</p>
              </div>

              {successMsg ? (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100">
                  <Icons.CheckCircle className="w-12 h-12 text-emerald-500 animate-bounce" />
                  <h4 className="font-bold">Demo Request Received!</h4>
                  <p className="text-xs">One of our Enterprise Solutions Architects will contact you shortly.</p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitLead('demo', { pageContext: content.title });
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Your Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={leadForm.name}
                        onChange={handleFormChange}
                        placeholder="John Doe"
                        className="w-full bg-white border border-slate-200/80 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Work Email</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={leadForm.email}
                        onChange={handleFormChange}
                        placeholder="john@company.com"
                        className="w-full bg-white border border-slate-200/80 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={leadForm.phone}
                      onChange={handleFormChange}
                      placeholder="+91 9999 123 456"
                      className="w-full bg-white border border-slate-200/80 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Custom Notes</label>
                    <textarea
                      name="message"
                      value={leadForm.message}
                      onChange={handleFormChange}
                      rows={3}
                      placeholder="Specify your gate width or active flow counts."
                      className="w-full bg-white border border-slate-200/80 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full text-center py-2.5 rounded-lg text-xs font-semibold text-white shadow-md transition-opacity hover:opacity-90"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {submitting ? 'Scheduling Verification...' : content.ctaText || 'Book a Demo'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* PRODUCTS SECTION */}
        {type === 'Products' && (
          <div className="space-y-10">
            {/* Header Section */}
            <div className="text-center mb-section-padding">
              <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-stack-sm">
                {content.title || 'Products'}
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
                {content.subtitle || 'Integrated Hardware, Software & AI Solutions'}
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap justify-center gap-stack-sm mb-section-padding">
              {[
                { label: 'All Products', value: 'All Products' },
                { label: 'Software', value: 'Software' },
                { label: 'Hardware', value: 'Hardware' },
                { label: 'AI Solutions', value: 'AI Solutions' },
                { label: 'IoT Devices', value: 'IoT Devices' }
              ].map((filter) => {
                const isActive = activeProductTab === filter.value;
                return (
                  <button
                    key={filter.value}
                    onClick={() => setActiveProductTab(filter.value)}
                    className={`px-6 py-2 rounded-full font-label-md text-label-md transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-secondary text-on-secondary'
                        : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            {/* Product categories lists */}
            {(() => {
              // Group filtered products by category
              const filteredProducts = products.filter((p) => {
                if (p.status !== 'published') return false;
                if (activeProductTab === 'All Products') return true;
                if (activeProductTab === 'Software') return p.category?.toLowerCase().includes('software');
                if (activeProductTab === 'Hardware') return p.category?.toLowerCase().includes('hardware');
                if (activeProductTab === 'AI Solutions') {
                  return p.name?.toLowerCase().includes('ai') || 
                         p.description?.toLowerCase().includes('ai') || 
                         p.description?.toLowerCase().includes('deep-learning');
                }
                if (activeProductTab === 'IoT Devices') {
                  return p.category?.toLowerCase().includes('hardware') || 
                         p.description?.toLowerCase().includes('iot') || 
                         p.description?.toLowerCase().includes('sensor') ||
                         p.name?.toLowerCase().includes('dome') ||
                         p.name?.toLowerCase().includes('terminal');
                }
                return true;
              });

              // Get unique categories for those filtered products
              const categories = Array.from(new Set(filteredProducts.map(p => p.category || 'Hardware Solutions')));

              if (filteredProducts.length === 0) {
                return (
                  <div className="text-center py-10 text-on-surface-variant font-body-md">
                    No products found matching this filter.
                  </div>
                );
              }

              return categories.map((catName) => {
                const catProds = filteredProducts.filter(p => (p.category || 'Hardware Solutions') === catName);
                if (catProds.length === 0) return null;

                return (
                  <section key={catName} className="mb-section-padding">
                    <h2 className="font-headline-md text-headline-md text-primary mb-stack-lg border-b border-surface-variant pb-2">
                      {catName}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
                      {catProds.map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => navigate(`/product-details?slug=${prod.slug}`)}
                          className="bg-surface-container-lowest border border-surface-variant rounded-lg p-stack-md flex flex-col items-start hover:shadow-md transition-shadow cursor-pointer group"
                        >
                          <div className="w-full h-40 bg-surface-container mb-stack-md rounded flex items-center justify-center overflow-hidden">
                            <img
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              src={prod.images?.[0] || 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop&q=80'}
                              alt={prod.name}
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <h3 className="font-label-md text-label-md text-primary mb-1">
                            {prod.name}
                          </h3>
                          <p className="font-label-sm text-label-sm text-on-surface-variant mb-stack-md line-clamp-2">
                            {prod.description}
                          </p>
                          <span className="mt-auto font-label-sm text-label-sm text-secondary group-hover:underline">
                            View Details
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              });
            })()}
          </div>
        )}

        {/* CASE STUDIES SECTION */}
        {type === 'CaseStudies' && (
          <div className="space-y-10">
            {/* Header Section */}
            <div className="text-center mb-section-padding">
              <h1 className="text-headline-lg-mobile md:text-headline-xl text-primary mb-stack-md">
                {content.title || 'Case Studies'}
              </h1>
              <p className="text-body-md md:text-body-lg text-on-surface-variant max-w-2xl mx-auto">
                {content.subtitle || 'Real Solutions. Real Results. Explore how our AI-powered infrastructure transforms security and efficiency across diverse industries.'}
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap justify-center gap-stack-sm mb-stack-lg">
              {['All', 'Education', 'Healthcare', 'Corporate', 'Manufacturing', 'Smart City'].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-full font-label-sm border transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-secondary text-on-secondary border-secondary'
                        : 'bg-surface text-on-surface-variant border-outline-variant hover:border-secondary hover:text-secondary'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Case Studies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {content.items && content.items
                .filter((item: any) => activeTab === 'All' || item.category === activeTab)
                .map((item: any) => (
                  <div
                    key={item.id}
                    className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col group hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="h-48 overflow-hidden relative bg-surface-container">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={item.image}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-stack-md flex flex-col flex-grow">
                      <span className="text-label-sm text-secondary mb-stack-sm uppercase tracking-wider">
                        {item.category}
                      </span>
                      <h3 className="text-headline-md mb-stack-sm text-primary">
                        {item.title}
                      </h3>
                      <p className="text-body-md text-on-surface-variant mb-stack-lg flex-grow line-clamp-3">
                        {item.desc}
                      </p>
                      <Link
                        to="/contact"
                        className="text-label-md text-secondary hover:text-primary-container flex items-center mt-auto font-bold"
                      >
                        Read More <span className="material-symbols-outlined ml-1 text-sm select-none">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ABOUT SECTION */}
        {type === 'About' && (() => {
          const FAQS_DATA = [
            {
              category: 'Systems',
              q: 'How does the AI face terminal integrate with existing turnstiles?',
              a: 'Our face terminal supports standard Wiegand and relay signal triggers. It can integrate directly with major mechanical turnstiles, speed gates, and magnetic lock brands, dispatching unlock signals in less than 300ms of verification.'
            },
            {
              category: 'Security',
              q: 'Is my biometric data secure and compliant?',
              a: 'Absolutely. We do not store full biometric raw images. All faces are converted into secure 512-byte irreversible hash arrays stored locally on-premise or within private, encrypted networks, fully complying with local GDPR and data privacy standards.'
            },
            {
              category: 'Systems',
              q: 'What happens to the access control gates during a power failure?',
              a: 'All mechanical doors and smart turnstiles are configured with standard fail-safe mechanisms. In the event of power loss or critical fire alarms, magnetic locks release automatically to enable safe emergency evacuations.'
            },
            {
              category: 'Corporate',
              q: 'Can we schedule a custom system audit of our facility?',
              a: 'Yes, our engineering team can review your building layout and design a full blueprint specifying optimal camera placements, barrier selections, and network topology. Contact our regional support desk to set up a site visit.'
            },
            {
              category: 'Security',
              q: 'Does the system support multi-site centralized management?',
              a: 'Yes. The NX Central Command software enables you to combine security feeds, visitor tracking logs, and employee attendance metrics across multiple physical office branches into a single unified cloud dashboard.'
            },
            {
              category: 'Corporate',
              q: 'What is the standard warranty and post-deployment support structure?',
              a: 'We offer a standard 24-month replacement warranty on all physical gating and terminal hardware, paired with 24/7 dedicated telephone and live remote diagnostic support plans tailored for enterprise clients.'
            }
          ];

          const actualFaqs = content.faqs && content.faqs.length > 0 ? content.faqs : FAQS_DATA;
          const filteredFaqs = actualFaqs.filter((faq: any) => {
            const matchesCategory = aboutFaqCategory === 'All' || faq.category === aboutFaqCategory;
            const matchesSearch = faq.q.toLowerCase().includes(aboutFaqSearch.toLowerCase()) || 
                                  faq.a.toLowerCase().includes(aboutFaqSearch.toLowerCase());
            return matchesCategory && matchesSearch;
          });

          return (
            <div className="w-full space-y-16 text-left">
              {/* LARGE SPACIOUS HERO BANNER AT THE ABSOLUTE TOP OF FLOW */}
              <div className="w-full relative bg-slate-950 min-h-[360px] md:min-h-[480px] flex items-center justify-start overflow-hidden rounded-3xl border border-slate-800 shadow-xl">
                {/* Background Image - Highly Visible with Contrast Overlay */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={content.bgImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSrf9ZOMfkjmWqt_piMmaVvhnezqEZmQWU-cci5hEHxnt1nLnf6xBtDXdtaHOXCQPcTws8kgf_Nt_1gpGHy7rXsK6Ud8mrnkIHWO807VIPYZfArNxnC-Z17EJhBunL1yB4szj_mGclMxCsmwI01cEwM9SHaoiOO-ECDn4N5ujdIYnmEFoZYNYyF5A83zbGIJDikH91GKDS55Vwtrh75ZpO2waZPG6W4_1cCN63rSC2D3syG1oHfJXznwBFCfdXu1NfL3nzM48aTEtL'} 
                    alt="Corporate Overview Banner" 
                    className="w-full h-full object-cover opacity-85 scale-100"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle dark gradient overlay to ensure text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/70 to-transparent"></div>
                </div>

                {/* Overlaid Headline & Support Text */}
                <div className="relative z-10 max-w-3xl px-6 md:px-12 py-10 md:py-16 text-left space-y-5">
                  <span className="text-[10px] md:text-xs font-bold text-blue-400 uppercase tracking-widest block">
                    {content.subtitle || 'Building Smarter, Safer & Better Tomorrow'}
                  </span>
                  <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                    {content.title || 'About NX Solution'}
                  </h1>
                  <p className="text-xs md:text-base text-slate-300 font-medium leading-relaxed max-w-2xl">
                    {content.desc || 'NX Solution is an AI-powered technology company providing smart, integrated and scalable solutions for every industry. We combine AI, IoT, Software and Hardware to solve real-world operational challenges.'}
                  </p>
                </div>
              </div>

              {/* STICKY HORIZONTAL SECTION ANCHOR MENU */}
              <div className="border border-slate-200/80 bg-white sticky top-2 z-20 shadow-sm rounded-xl py-1 px-2 mb-10 overflow-x-auto no-scrollbar">
                <div className="flex justify-start md:justify-center items-center py-2 px-1 gap-6 md:gap-10">
                  <button 
                    onClick={() => {
                      const el = document.getElementById('company-profile');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-blue-600 border-b-2 border-blue-600 pb-1 flex-shrink-0 transition-all hover:text-blue-800"
                  >
                    Company Profile
                  </button>
                  <button 
                    onClick={() => {
                      const el = document.getElementById('why-choose-us');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 pb-1 flex-shrink-0 transition-all"
                  >
                    Why Choose Us
                  </button>
                  <button 
                    onClick={() => {
                      const el = document.getElementById('interactive-faqs');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 pb-1 flex-shrink-0 transition-all"
                  >
                    Product FAQs
                  </button>
                  <button 
                    onClick={() => {
                      const el = document.getElementById('corporate-contacts');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 pb-1 flex-shrink-0 transition-all"
                  >
                    Contact Info
                  </button>
                </div>
              </div>

              {/* CARD-BASED SECTIONAL STORYTELLING */}
              <div id="company-profile" className="space-y-16 md:space-y-24 scroll-mt-20">
                {/* Story Block 1 - Who We Are */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
                  <div className="space-y-5">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">
                      {content.whoBadge || 'WHO WE ARE'}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                      {content.whoTitle || 'Redefining Physical Security with Computer Vision'}
                    </h2>
                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                      {content.whoDesc || 'At NX Solution, we bridge physical boundaries with intelligent code. Our automated systems enable educational institutions, hospitals, and high-tech corporate campuses to achieve reliable 24/7 gate entry tracking, sub-second biometric turnstile checks, and real-time blacklisted vehicle alerts.'}
                    </p>
                    <div className="pt-2">
                      <button 
                        onClick={() => {
                          const el = document.getElementById('interactive-faqs');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider group transition-all"
                      >
                        {content.whoCta || 'Explore Systems FAQ'} <Icons.ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                  {/* Content Anchor Image */}
                  <div className="w-full h-[280px] md:h-[360px] rounded-2xl overflow-hidden border border-slate-100 shadow-md">
                    <img 
                      src={content.featureImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3JHjsRsSrD7BeyvR8Euxaa7Svd4lEKmPooHQZLfDyfXyI1ZZgQXoVAaHG4jFH0a3P4eI6KVp6T76OSm3OSj29gWmPy3XsUTIogjK0zA-9KDMXAiwWZxZSeNjoYTlWbPJGShhfAE7uhGOcCpK5Oal2r3Sg1GC5hdkSCPObndIxfoqqCu2Vd_Z_wfhJKD1PENqt2D-R46Ko67_JbmV76Zrj7mOCBSV-zDmTUkxgzg7k8KYs8RUXXKPEF9shBzhGSjMXlt0L_kF0irk_'} 
                      alt="NX Tech Operations" 
                      className="w-full h-full object-cover hover:scale-[1.01] transition-all duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Story Block 2 - Sustainability */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
                  {/* Image Left on Desktop */}
                  <div className="w-full h-[280px] md:h-[360px] rounded-2xl overflow-hidden border border-slate-100 shadow-md lg:order-1">
                    <img 
                      src={content.sustainabilityImage || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80"} 
                      alt="Corporate Sustainability" 
                      className="w-full h-full object-cover hover:scale-[1.01] transition-all duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-5 lg:order-2">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">
                      {content.sustainabilityBadge || 'SUSTAINABILITY'}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                      {content.sustainabilityTitle || 'Eco-Friendly Hardware & Smart Facility Efficiency'}
                    </h2>
                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                      {content.sustainabilityDesc || 'We believe intelligent monitoring should preserve both safety and the planet. Our state-of-the-art turnstile gates and camera control boards are designed with smart power states, reducing carbon footprints by up to 35% during low-flow weekend hours while remaining fully responsive to trigger alerts.'}
                    </p>
                    <div className="pt-2">
                      <button 
                        onClick={() => {
                          const el = document.getElementById('corporate-contacts');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-800 uppercase tracking-wider group transition-all"
                      >
                        {content.sustainabilityCta || 'Request Green Blueprint'} <Icons.ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* METRICS & STATS PANEL */}
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 md:p-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
                  {content.stats && content.stats.map((stat: any, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <div className="text-3xl md:text-4xl font-extrabold text-blue-600">
                        {stat.value}
                      </div>
                      <div className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CORE VALUES & WHY CHOOSE US */}
              <div id="why-choose-us" className="space-y-8 scroll-mt-20">
                <div className="text-center space-y-2 max-w-xl mx-auto">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                    CORPORATE STRENGTHS
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {content.whyTitle || 'Why Choose NX Solution?'}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {content.whyBadges && content.whyBadges.map((badge: any, idx: number) => (
                    <div 
                      key={idx} 
                      className="bg-white border-2 border-slate-100 hover:border-blue-500 rounded-2xl p-5 shadow-sm transition-all duration-300 flex items-start gap-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        {renderIcon(badge.icon, "w-5 h-5")}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">
                          {badge.text}
                        </h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          Enterprise-tested engineering built to operate smoothly with 99.9% sub-second operational uptime.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* HIKVISION-STYLE DYNAMIC FAQ MODULE */}
              <div id="interactive-faqs" className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 md:p-10 space-y-8 scroll-mt-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                      {content.faqBadge || 'PRODUCT SUPPORT'}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {content.faqTitle || 'Technical System FAQ'}
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      {content.faqDesc || 'Instantly search common hardware compatibility and software regulatory questions.'}
                    </p>
                  </div>

                  {/* FAQ Search Bar */}
                  <div className="relative w-full md:w-80">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Icons.Search className="w-4 h-4" />
                    </span>
                    <input 
                      type="text" 
                      value={aboutFaqSearch}
                      onChange={(e) => setAboutFaqSearch(e.target.value)}
                      placeholder="Search FAQ keywords..."
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                {/* FAQ Category Filters */}
                <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
                  {['All', 'Systems', 'Security', 'Corporate'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setAboutFaqCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                        aboutFaqCategory === cat 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* FAQ Accordion List */}
                <div className="space-y-3">
                  {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((faq, idx) => {
                      const isOpen = aboutFaqOpenId === idx;
                      return (
                        <div 
                          key={idx}
                          className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm"
                        >
                          <button
                            onClick={() => setAboutFaqOpenId(isOpen ? null : idx)}
                            className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-semibold text-xs md:text-sm text-slate-900 hover:bg-slate-50/50 transition-colors focus:outline-none"
                          >
                            <span>{faq.q}</span>
                            <span className="text-slate-400">
                              {isOpen ? <Icons.Minus className="w-4 h-4" /> : <Icons.Plus className="w-4 h-4" />}
                            </span>
                          </button>
                          
                          {isOpen && (
                            <div className="px-5 pb-4 pt-1 text-[11px] md:text-xs text-slate-500 leading-relaxed border-t border-slate-50">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-xs text-slate-400">
                      No matching FAQ questions found for "{aboutFaqSearch}".
                    </div>
                  )}
                </div>
              </div>

              {/* TRUST-ORIENTED CONTACT MODULE */}
              <div id="corporate-contacts" className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-slate-900 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden scroll-mt-20">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-950/30 via-slate-900 to-slate-950 opacity-90 z-0"></div>
                
                <div className="lg:col-span-5 relative z-10 space-y-6">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">
                    {content.contactBadge || 'GLOBAL OFFICE'}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    {content.contactTitle || 'Contact NX Headquarters'}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {content.contactDesc || 'Have questions about specific hardware compatibility, enterprise pricing structures, or regional deployment options? Reach out to our physical central helpdesk.'}
                  </p>

                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <div className="flex items-start gap-3 text-xs text-slate-300">
                      <Icons.MapPin className="w-4.5 h-4.5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-white">{content.contactOfficeTitle || 'Main Corporate Office'}</p>
                        <p className="text-[11px] text-slate-400">{content.contactOfficeValue || 'Sector 62, Electronic City, Noida, UP - 201301'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <Icons.PhoneCall className="w-4.5 h-4.5 text-blue-400 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-white">{content.contactPhoneTitle || 'Central Desk Helpline'}</p>
                        <p className="text-[11px] text-slate-400">{content.contactPhoneValue || '+91 (120) 4567 890'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <Icons.Mail className="w-4.5 h-4.5 text-blue-400 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-white">{content.contactMailTitle || 'Corporate Inquiries'}</p>
                        <p className="text-[11px] text-slate-400">{content.contactMailValue || 'contact@nx-solution.com'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Message Form */}
                <div className="lg:col-span-7 relative z-10 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
                  <h4 className="text-sm font-bold">Send Direct Inquiry</h4>
                  {aboutContactSuccess ? (
                    <div className="bg-emerald-950/40 border border-emerald-900/60 rounded-xl p-6 text-center space-y-3">
                      <Icons.CheckCircle className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                      <p className="text-xs font-bold text-emerald-200">Message Dispatched Successfully</p>
                      <p className="text-[10px] text-slate-400">Our regional sales lead will follow up via email within 24 hours.</p>
                      <button 
                        onClick={() => setAboutContactSuccess(false)}
                        className="text-[10px] font-bold text-blue-400 hover:underline"
                      >
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (onFormSubmit) {
                          onFormSubmit({
                            name: contactLeadForm.name,
                            email: contactLeadForm.email,
                            phone: contactLeadForm.phone,
                            company: contactLeadForm.company,
                            message: `Direct inquiry from corporate About Page: ${contactLeadForm.message}`,
                            source: 'AboutPageDirectForm'
                          });
                        }
                        setAboutContactSuccess(true);
                      }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase text-slate-400">Full Name</label>
                          <input 
                            type="text" 
                            required
                            value={contactLeadForm.name}
                            onChange={(e) => setContactLeadForm({...contactLeadForm, name: e.target.value})}
                            placeholder="John Doe"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase text-slate-400">Work Email</label>
                          <input 
                            type="email" 
                            required
                            value={contactLeadForm.email}
                            onChange={(e) => setContactLeadForm({...contactLeadForm, email: e.target.value})}
                            placeholder="john@company.com"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase text-slate-400">Phone</label>
                          <input 
                            type="text" 
                            value={contactLeadForm.phone}
                            onChange={(e) => setContactLeadForm({...contactLeadForm, phone: e.target.value})}
                            placeholder="+91 9999 123 456"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase text-slate-400">Company</label>
                          <input 
                            type="text" 
                            value={contactLeadForm.company}
                            onChange={(e) => setContactLeadForm({...contactLeadForm, company: e.target.value})}
                            placeholder="ABC Enterprises"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-slate-400">Your Inquiry</label>
                        <textarea 
                          rows={3}
                          value={contactLeadForm.message}
                          onChange={(e) => setContactLeadForm({...contactLeadForm, message: e.target.value})}
                          placeholder="Please include details about turnstile layout or gate requirements..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full text-center py-2.5 rounded-lg text-xs font-bold text-white shadow-md transition-opacity hover:opacity-90"
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        Submit Corporate Inquiry
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* RESOURCES SECTION */}
        {type === 'Resources' && (
          <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.primaryColor }}>
                  {content.title}
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  {content.subtitle}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {content.blogs && content.blogs.map((blog: any) => (
                <div
                  key={blog.id}
                  className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  <div className="relative aspect-video bg-gray-100 overflow-hidden">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      referrerPolicy="no-referrer"
                      className="object-cover w-full h-full group-hover:scale-102 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[9px] font-bold uppercase tracking-widest text-slate-900 px-2 py-1 rounded shadow-sm">
                      {blog.category}
                    </span>
                  </div>
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-medium text-gray-400">{blog.date}</span>
                      <h3 className="font-bold text-sm text-gray-950 leading-snug group-hover:text-blue-600 transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                        {blog.desc}
                      </p>
                    </div>
                    <Link
                      to="/contact"
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      Read Article <Icons.ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABOUT NX SECTION (AS IT IS FROM USER SCREENSHOT) */}
        {type === 'AboutNX' && (() => {
          // Robust mapping of content array fallbacks to prevent crashes
          const paragraphs = content.paragraphs && content.paragraphs.length > 0
            ? content.paragraphs
            : [
                content.paragraph1 || "NX Solution is an AI & IoT Solution Engineering company that designs and deploys intelligent ecosystems to solve complex operational challenges across industries.",
                content.paragraph2 || "We don't sell products. We engineer complete solutions around real operational challenges.",
                content.paragraph3 || "Every organization is unique. Every challenge is different. That's why every solution we build is designed specifically for your operational environment."
              ].filter(Boolean);

          const featureCards = content.featureCards && content.featureCards.length > 0
            ? content.featureCards
            : [
                {
                  id: 'card-mission',
                  title: content.missionTitle || 'MISSION',
                  description: content.missionDesc || 'Simplifying complex operations through intelligent technology ecosystems.',
                  icon: content.missionIcon || 'Target',
                  status: true,
                  styles: {
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    iconColor: '#16A34A',
                    hoverEffect: true,
                    shadow: true,
                    borderRadius: '1rem'
                  }
                },
                {
                  id: 'card-vision',
                  title: content.visionTitle || 'VISION',
                  description: content.visionDesc || 'Building smarter, safer and future-ready organizations.',
                  icon: content.visionIcon || 'Eye',
                  status: true,
                  styles: {
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    iconColor: '#16A34A',
                    hoverEffect: true,
                    shadow: true,
                    borderRadius: '1rem'
                  }
                },
                {
                  id: 'card-philosophy',
                  title: content.philosophyTitle || 'CORE PHILOSOPHY',
                  description: content.philosophyDesc || "We don't sell products. We engineer complete solutions around real operational challenges.",
                  icon: content.philosophyIcon || 'Lightbulb',
                  status: true,
                  styles: {
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    iconColor: '#16A34A',
                    hoverEffect: true,
                    shadow: true,
                    borderRadius: '1rem'
                  }
                }
              ];

          const activeCards = featureCards.filter((c: any) => c.status !== false);

          const renderCardIcon = (iconName: string, customColor?: string) => {
            if (!iconName) return renderIcon("Target", "w-5 h-5");
            const trimmed = iconName.trim();
            if (trimmed.startsWith('<svg')) {
              return <div className="w-5 h-5 flex items-center justify-center text-current" dangerouslySetInnerHTML={{ __html: trimmed }} />;
            }
            if (trimmed.startsWith('http') || trimmed.startsWith('data:')) {
              return <img src={trimmed} alt="Icon" className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />;
            }
            return renderIcon(trimmed, "w-5 h-5");
          };

          // Layout calculations
          const imgPosition = content.imagePosition || 'right';
          const contentAlign = content.alignment || 'left';
          
          // Cards Layout
          const cardsColDesktop = content.cardsLayoutDesktop || '3';
          const cardsColTablet = content.cardsLayoutTablet || '2';
          const cardsColMobile = content.cardsLayoutMobile || '1';

          let gridColsClass = 'grid-cols-1 md:grid-cols-3';
          if (cardsColDesktop === '4') gridColsClass = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
          else if (cardsColDesktop === '2') gridColsClass = 'grid-cols-1 md:grid-cols-2';
          else if (cardsColDesktop === '1') gridColsClass = 'grid-cols-1';
          else {
            // Respect custom configs
            const mobileCol = cardsColMobile === '2' ? 'grid-cols-2' : 'grid-cols-1';
            const tabletCol = cardsColTablet === '3' ? 'md:grid-cols-3' : (cardsColTablet === '1' ? 'md:grid-cols-1' : 'md:grid-cols-2');
            const desktopCol = cardsColDesktop === '4' ? 'lg:grid-cols-4' : (cardsColDesktop === '2' ? 'lg:grid-cols-2' : (cardsColDesktop === '1' ? 'lg:grid-cols-1' : 'lg:grid-cols-3'));
            gridColsClass = `${mobileCol} ${tabletCol} ${desktopCol}`;
          }

          return (
            <div 
              className={`w-full space-y-12 py-8`}
              style={{ textAlign: contentAlign as any }}
            >
              <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center ${imgPosition === 'left' ? '' : ''}`}>
                {/* Text Column */}
                <div className={`space-y-6 lg:col-span-7 ${imgPosition === 'left' ? 'lg:order-last' : ''}`}>
                  {/* Section Title with Badge */}
                  <div className={`flex items-center gap-2.5 ${contentAlign === 'center' ? 'justify-center' : 'justify-start'}`}>
                    <h2 className="text-[13px] md:text-sm font-black tracking-wider text-slate-800 uppercase font-sans">
                      {content.badgeText || 'ABOUT NX SOLUTION'}
                    </h2>
                  </div>

                  {/* Main Title if different */}
                  {content.title && content.title !== (content.badgeText || 'ABOUT NX SOLUTION') && (
                    <h3 
                      className="text-2xl md:text-3xl font-black tracking-tight"
                      style={{ color: styles.headingColor || '#0F172A' }}
                      dangerouslySetInnerHTML={{ __html: content.title }}
                    />
                  )}

                  {/* Paragraphs */}
                  <div className="space-y-5 text-sm md:text-[15px] leading-relaxed font-normal" style={{ color: styles.textColor || '#475569' }}>
                    {paragraphs.map((para: string, pIdx: number) => (
                      <p key={pIdx} className="leading-relaxed font-normal" dangerouslySetInnerHTML={{ __html: para }} />
                    ))}
                  </div>

                  {/* Interactive future-ready Buttons */}
                  {((content.showPrimaryBtn && content.primaryBtnText) || (content.showSecondaryBtn && content.secondaryBtnText)) && (
                    <div className={`flex flex-wrap gap-4 pt-2 ${contentAlign === 'center' ? 'justify-center' : 'justify-start'}`}>
                      {content.showPrimaryBtn && content.primaryBtnText && (
                        <a
                          href={content.primaryBtnUrl || '#'}
                          target={content.primaryBtnTarget || '_self'}
                          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-bold text-xs bg-[#16A34A] hover:bg-[#15803d] text-white transition-all shadow-md shadow-emerald-600/15"
                        >
                          {content.primaryBtnText}
                        </a>
                      )}
                      {content.showSecondaryBtn && content.secondaryBtnText && (
                        <a
                          href={content.secondaryBtnUrl || '#'}
                          target={content.secondaryBtnTarget || '_self'}
                          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-bold text-xs border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all"
                        >
                          {content.secondaryBtnText}
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Right/Left Image Column */}
                <div className={`lg:col-span-5 ${imgPosition === 'left' ? '' : ''}`}>
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-slate-100 shadow-md">
                    <img
                      src={content.image || "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?q=80&w=800&auto=format&fit=crop"}
                      alt={content.imageAlt || "About NX Solution Team"}
                      className="w-full h-full object-cover"
                      loading={content.lazyLoading !== false ? "lazy" : "eager"}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Cards Row */}
              {activeCards.length > 0 && (
                <div className={`grid ${gridColsClass} gap-6 pt-4`}>
                  {activeCards.map((card: any, index: number) => {
                    const cardStyle = card.styles || {};
                    const isHoverEnabled = cardStyle.hoverEffect !== false;
                    const isShadowEnabled = cardStyle.shadow !== false;
                    const bRadius = cardStyle.borderRadius || '1rem';
                    const bgCol = cardStyle.backgroundColor || '#FFFFFF';
                    const borderCol = cardStyle.borderColor || '#E2E8F0';
                    const iconCol = cardStyle.iconColor || '#16A34A';

                    return (
                      <div
                        key={card.id || index}
                        className={`p-6 md:p-8 flex flex-col justify-between border transition-all duration-300 min-h-[160px]`}
                        style={{
                          backgroundColor: bgCol,
                          borderColor: borderCol,
                          borderRadius: bRadius,
                          boxShadow: isShadowEnabled ? '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)' : 'none',
                        }}
                        onMouseEnter={(e) => {
                          if (isHoverEnabled) {
                            e.currentTarget.style.borderColor = iconCol;
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (isHoverEnabled) {
                            e.currentTarget.style.borderColor = borderCol;
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = isShadowEnabled ? '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)' : 'none';
                          }
                        }}
                      >
                        <div className="space-y-4">
                          <div className={`flex items-center gap-3 ${contentAlign === 'center' ? 'justify-center' : 'justify-start'}`}>
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ 
                                backgroundColor: `${iconCol}10`, // 10% opacity
                                color: iconCol
                              }}
                            >
                              {renderCardIcon(card.icon, iconCol)}
                            </div>
                            <h3 
                              className="font-extrabold tracking-wider text-xs md:text-sm uppercase"
                              style={{ color: styles.headingColor || '#0F172A' }}
                            >
                              {card.title}
                            </h3>
                          </div>
                          <p 
                            className="text-xs md:text-sm leading-relaxed font-normal"
                            style={{ color: styles.textColor || '#64748B' }}
                          >
                            {card.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* CHALLENGES TO SOLUTIONS SECTION */}
        {type === 'ChallengesToSolutions' && (() => {
          // Dynamic parameters mapping
          const badgeNo = content.badge || '03';
          const badgeTxt = content.badgeText || 'FROM CHALLENGES TO SOLUTIONS';
          const badgeBg = content.badgeBgColor || '#15803D';
          const badgeColor = content.badgeTextColor || '#FFFFFF';
          const headingColor = content.headingColor || '#0F172A';
          const sectionBg = styles.backgroundColor || '#FFFFFF';
          const sectionPaddTop = styles.paddingTop || '48px';
          const sectionPaddBot = styles.paddingBottom || '48px';
          const sectionMarginTop = styles.marginTop || '0px';
          const sectionMarginBottom = styles.marginBottom || '0px';
          const cardGap = content.cardGap || '1rem'; // 16px by default
          const containerWidth = content.containerWidth || 'max-w-7xl';

          // Arrow settings
          const showArrows = content.showArrows !== false;
          const arrowIcon = content.arrowIcon || 'ArrowRight';
          const arrowColor = content.arrowColor || '#64748B';
          const arrowSize = content.arrowSize || '24px';
          const arrowAnimation = content.arrowAnimation || 'animate-pulse';

          // Column 1 values
          const col1Title = content.col1Title || 'OPERATIONAL CHALLENGES';
          const col1HeaderBg = content.col1Color || '#B91C1C';
          const col1BorderColor = content.col1BorderColor || '#FEE2E2'; // border-red-100
          const col1CardBg = content.col1CardBg || '#FFF8F8';
          const challengesList = (content.challenges || []).filter((item: any) => item.status !== false);

          // Column 2 values
          const col2Title = content.col2Title || 'OUR ENGINEERING APPROACH';
          const col2HeaderBg = content.col2Color || '#1D4ED8';
          const col2BorderColor = content.col2BorderColor || '#DBEAFE'; // border-blue-100
          const col2CardBg = content.col2CardBg || '#F0F7FF';
          const showConnectors = content.showConnectors !== false;
          const connectorStyle = content.connectorStyle || 'dotted';
          const connectorColor = content.connectorColor || col2HeaderBg;
          const connectorThickness = content.connectorThickness || 2;
          const engineeringStepsList = (content.engineeringSteps || []).filter((item: any) => item.status !== false);

          // Column 3 values
          const col3Title = content.col3Title || 'INTELLIGENT OUTCOMES';
          const col3HeaderBg = content.col3Color || '#15803D';
          const col3BorderColor = content.col3BorderColor || '#D1FAE5'; // border-emerald-100
          const col3CardBg = content.col3CardBg || '#F4FBF7';
          const outcomesList = (content.outcomes || []).filter((item: any) => item.status !== false);

          // Helper to resolve Icons beautifully (Lucide, base64, SVG, Material Icons)
          const renderIconOrImg = (iconVal: string, fallbackIcon: string, className = 'w-5 h-5', styleObj = {}) => {
            const val = (iconVal || fallbackIcon).trim();
            if (val.startsWith('data:image/') || val.startsWith('http://') || val.startsWith('https://')) {
              return <img src={val} className={className} alt="icon" style={{ ...styleObj, objectFit: 'contain' }} referrerPolicy="no-referrer" />;
            }
            if (val.startsWith('<svg') && val.endsWith('</svg>')) {
              return <div className={className} style={styleObj} dangerouslySetInnerHTML={{ __html: val }} />;
            }
            if (val.startsWith('material:')) {
              const iconName = val.replace('material:', '');
              return <span className={`material-icons ${className}`} style={{ fontSize: '18px', ...styleObj }}>{iconName}</span>;
            }
            const IconComp = (Icons as any)[val] || (Icons as any)[fallbackIcon] || Icons.HelpCircle;
            return <IconComp className={className} style={styleObj} />;
          };

          // Render arrow component
          const renderConnectorArrow = (arrowIconName: string, isDesktop: boolean) => {
            let ArrowComponent = isDesktop 
              ? ((Icons as any)[arrowIconName] || Icons.ArrowRight)
              : ((Icons as any)[arrowIconName === 'ArrowRight' ? 'ArrowDown' : arrowIconName] || Icons.ArrowDown);
            return (
              <div className="flex items-center justify-center py-2 lg:py-0 lg:px-2" style={{ color: arrowColor }}>
                <ArrowComponent style={{ width: arrowSize, height: arrowSize }} className={arrowAnimation} />
              </div>
            );
          };

          const layoutDesktopCols = content.layoutDesktop || '3';

          let gridClasses = 'flex flex-col lg:flex-row items-stretch justify-between';
          if (layoutDesktopCols === '1') {
            gridClasses = 'flex flex-col items-center max-w-xl mx-auto';
          }

          return (
            <div 
              className="w-full transition-colors duration-300 bg-white" 
              style={{ 
                backgroundColor: '#ffffff',
                paddingTop: '0px',
                paddingBottom: '0px',
                marginTop: '0px',
                marginBottom: '0px'
              }} 
              id="section-challenges-solutions"
            >
              <div className="w-full mx-auto">
                {/* Header block matching user's layout */}
                <div className="flex items-center gap-2.5 mb-8 justify-start">
                  <h2 
                    className="text-[13px] md:text-sm font-black tracking-wider text-slate-800 uppercase font-sans"
                  >
                    {badgeTxt || 'FROM CHALLENGES TO SOLUTIONS'}
                  </h2>
                </div>

                {/* Grid of Columns with connecting arrows */}
                <div 
                  className={gridClasses} 
                  style={{ gap: cardGap }}
                >
                  
                  {/* Column 1: OPERATIONAL CHALLENGES */}
                  <div 
                    className="flex-1 flex flex-col rounded-xl overflow-hidden shadow-sm border transition-all duration-300"
                    style={{ 
                      backgroundColor: col1CardBg, 
                      borderColor: col1BorderColor,
                      borderRadius: content.borderRadius || '12px',
                      boxShadow: content.shadow === 'none' ? 'none' : undefined
                    }}
                  >
                    <div 
                      className="text-white py-3.5 px-4 font-bold text-sm tracking-wider text-center uppercase"
                      style={{ backgroundColor: col1HeaderBg }}
                    >
                      {col1Title}
                    </div>
                    <div className="p-5 flex-grow flex flex-col justify-between gap-3">
                      {challengesList.map((item: any, idx: number) => (
                        <div 
                          key={item.id || idx} 
                          className={`flex items-start gap-4 p-3 bg-white rounded-lg border border-red-50/50 shadow-[0_1px_2px_rgba(185,28,28,0.03)] transition-all ${content.hoverEffect !== false ? 'hover:scale-[1.01] hover:shadow-md' : ''}`}
                        >
                          <div 
                            className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0"
                            style={{ color: col1HeaderBg }}
                          >
                            {renderIconOrImg(item.icon, 'ClipboardList', 'w-5 h-5')}
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-slate-800 font-bold text-sm md:text-base leading-snug">{item.title}</span>
                            {item.description && (
                              <span className="text-slate-500 text-xs mt-0.5 leading-relaxed">{item.description}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Arrow 1 */}
                  {showArrows && renderConnectorArrow(arrowIcon, true)}

                  {/* Column 2: OUR ENGINEERING APPROACH */}
                  <div 
                    className="flex-grow-1 flex-1 flex flex-col rounded-xl overflow-hidden shadow-sm border transition-all duration-300"
                    style={{ 
                      backgroundColor: col2CardBg, 
                      borderColor: col2BorderColor,
                      borderRadius: content.borderRadius || '12px',
                      boxShadow: content.shadow === 'none' ? 'none' : undefined
                    }}
                  >
                    <div 
                      className="text-white py-3.5 px-4 font-bold text-sm tracking-wider text-center uppercase"
                      style={{ backgroundColor: col2HeaderBg }}
                    >
                      {col2Title}
                    </div>
                    <div className="p-5 flex-grow flex flex-col justify-center items-stretch gap-1">
                      {engineeringStepsList.map((item: any, idx: number, arr: any[]) => (
                        <React.Fragment key={item.id || idx}>
                          <div 
                            className={`flex items-start gap-4 p-2.5 bg-white rounded-lg border border-blue-50/50 shadow-[0_1px_2px_rgba(29,78,216,0.03)] transition-all ${content.hoverEffect !== false ? 'hover:scale-[1.01] hover:shadow-md' : ''}`}
                          >
                            <div 
                              className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 font-extrabold text-sm"
                              style={{ color: col2HeaderBg }}
                            >
                              {renderIconOrImg(item.icon, 'Eye', 'w-5 h-5')}
                            </div>
                            <div className="flex flex-col text-left">
                              <div className="flex items-center gap-1.5">
                                {item.stepNumber && (
                                  <span className="text-xs text-blue-600 font-extrabold">{item.stepNumber}.</span>
                                )}
                                <span className="text-slate-800 font-bold text-sm md:text-base leading-snug">{item.title}</span>
                              </div>
                              {item.description && (
                                <span className="text-slate-500 text-xs mt-0.5 leading-relaxed">{item.description}</span>
                              )}
                            </div>
                          </div>
                          {showConnectors && idx < arr.length - 1 && (
                            <div className="flex justify-start pl-7 py-1">
                              <div className="flex flex-col items-center ml-0.5">
                                <div 
                                  style={{
                                    height: '16px',
                                    borderLeftWidth: `${connectorThickness}px`,
                                    borderLeftStyle: connectorStyle === 'dotted' ? 'dotted' : connectorStyle === 'dashed' ? 'dashed' : 'solid',
                                    borderColor: connectorColor
                                  }}
                                />
                                <Icons.ChevronDown className="w-3 h-3 -mt-1" style={{ color: connectorColor }} />
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Arrow 2 */}
                  {showArrows && renderConnectorArrow(arrowIcon, true)}

                  {/* Column 3: INTELLIGENT OUTCOMES */}
                  <div 
                    className="flex-1 flex flex-col rounded-xl overflow-hidden shadow-sm border transition-all duration-300"
                    style={{ 
                      backgroundColor: col3CardBg, 
                      borderColor: col3BorderColor,
                      borderRadius: content.borderRadius || '12px',
                      boxShadow: content.shadow === 'none' ? 'none' : undefined
                    }}
                  >
                    <div 
                      className="text-white py-3.5 px-4 font-bold text-sm tracking-wider text-center uppercase"
                      style={{ backgroundColor: col3HeaderBg }}
                    >
                      {col3Title}
                    </div>
                    <div className="p-5 flex-grow flex flex-col justify-between gap-3">
                      {outcomesList.map((item: any, idx: number) => (
                        <div 
                          key={item.id || idx} 
                          className={`flex items-start gap-4 p-3 bg-white rounded-lg border border-emerald-50/50 shadow-[0_1px_2px_rgba(21,128,61,0.03)] transition-all ${content.hoverEffect !== false ? 'hover:scale-[1.01] hover:shadow-md' : ''}`}
                        >
                          <div 
                            className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0"
                            style={{ color: col3HeaderBg }}
                          >
                            {renderIconOrImg(item.icon, 'Brain', 'w-5 h-5')}
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-slate-800 font-bold text-sm md:text-base leading-snug">{item.title}</span>
                            {item.description && (
                              <span className="text-slate-500 text-xs mt-0.5 leading-relaxed">{item.description}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          );
        })()}

        {/* ABOUT HERO SECTION */}
        {type === 'AboutHero' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-6">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
                {renderIcon(content.badgeIcon || "Sparkles", "w-3.5 h-3.5")}
                <span>{content.badgeText || "CORPORATE SUMMARY"}</span>
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-none">
                {content.title || "We Build Smarter, Safer & Better Tomorrows"}
              </h1>
              <p className="text-sm md:text-base text-slate-500 leading-relaxed max-w-xl">
                {content.subtitle || "NX Solution engineers high-precision AI vision software, edge biometrics access systems, and automated security layers to secure modern enterprises."}
              </p>
              
              {content.badges && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {content.badges.map((badge: any, idx: number) => (
                    <span key={idx} className="inline-flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 text-xs text-slate-600 font-medium">
                      {renderIcon(badge.icon || "Check", "w-3 h-3 text-emerald-500")}
                      <span>{badge.text}</span>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                {content.ctaText && (
                  <Link
                    to={content.ctaUrl || "/contact"}
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {content.ctaText}
                  </Link>
                )}
                {content.secondaryCtaText && (
                  <Link
                    to={content.secondaryCtaUrl || "/#grid"}
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 bg-white"
                  >
                    {content.secondaryCtaText}
                  </Link>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-video lg:aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
                <img
                  src={content.bgImage || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop"}
                  alt="About NX Hero"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              {content.experienceValue && (
                <div className="absolute -bottom-6 -left-6 bg-white border border-slate-100 rounded-xl p-4 shadow-xl flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    {renderIcon("Award", "w-6 h-6")}
                  </div>
                  <div>
                    <span className="block text-xl font-extrabold text-slate-900 leading-none">{content.experienceValue}</span>
                    <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5 block">{content.experienceLabel || "Years Experience"}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABOUT COMPANY SECTION */}
        {type === 'AboutCompany' && (
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-6 ${content.imagePos === 'left' ? 'lg:flex-row-reverse' : ''}`}>
            <div className={`space-y-6 ${content.imagePos === 'left' ? 'lg:order-2' : ''}`}>
              <div className="space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">
                  {content.subtitle || "COMPANY OVERVIEW"}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                  {content.title || "The Enterprise Technology Architecture Platform"}
                </h2>
              </div>
              
              <div className="space-y-4 text-sm text-slate-500 leading-relaxed">
                <p>{content.desc1 || "Founded with a mission to deliver smarter hardware and software products, NX Solution builds high-performance surveillance nodes, computer vision servers, and biometric authentication panels."}</p>
                <p>{content.desc2 || "We combine artificial intelligence, state-of-the-art telemetry sensors, and lightweight software interfaces to deliver absolute facility awareness across schools, healthcare zones, and heavy industrial yards."}</p>
              </div>

              {content.bullets && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {content.bullets.map((bullet: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center mt-0.5">
                        {renderIcon(bullet.icon || "Check", "w-3.5 h-3.5")}
                      </div>
                      <span className="text-xs text-slate-600 font-medium leading-tight">{bullet.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`${content.imagePos === 'left' ? 'lg:order-1' : ''}`}>
              <div className="aspect-video bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-md">
                <img
                  src={content.image || "https://images.unsplash.com/photo-1541829019-2592e213f985?w=800&auto=format&fit=crop"}
                  alt="Company information illustration"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ABOUT STATS SECTION */}
        {type === 'AboutStats' && (
          <div className="space-y-10 py-6">
            {(content.title || content.subtitle) && (
              <div className={`${alignClass} space-y-2 max-w-2xl mx-auto`}>
                <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">{content.title || "PERFORMANCE COUNTERS"}</span>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">{content.subtitle || "Proven at B2B Enterprise Scale"}</h2>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(content.stats || []).map((stat: any, idx: number) => (
                <div key={idx} className="bg-white border border-slate-100 rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col space-y-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    {renderIcon(stat.icon || "TrendingUp", "w-5 h-5")}
                  </div>
                  <div className="space-y-1">
                    <span className="block text-3xl font-extrabold text-slate-900 leading-none">{stat.value}</span>
                    <span className="block text-xs font-bold text-slate-700">{stat.label}</span>
                    <p className="text-[11px] text-slate-400 leading-normal mt-1">{stat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABOUT MISSION VISION SECTION */}
        {type === 'AboutMissionVision' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-8 border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[320px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl"></div>
              <div className="space-y-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  {renderIcon(content.missionIcon || "Compass", "w-6 h-6")}
                </div>
                <h3 className="text-xl font-bold tracking-tight">{content.missionTitle || "Our Corporate Mission"}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {content.missionDesc || "To engineer fully integrated enterprise hardware and smart visual software. We empower institutions and factories to create self-aware facility perimeters, removing unauthorized access gaps, and protecting operational integrity."}
                </p>
              </div>
              <div className="border-t border-slate-800 pt-4 mt-6 text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                INTEGRITY &bull; PRECISION &bull; IMPACT
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm flex flex-col justify-between min-h-[320px]">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  {renderIcon(content.visionIcon || "Eye", "w-6 h-6")}
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{content.visionTitle || "Our Corporate Vision"}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {content.visionDesc || "To establish NX Solution as the absolute global standard in responsive AI-driven physical protection. By leveraging decentralized computer vision nodes, secure IoT protocol layers, and autonomous mechanical barriers, we build a smarter, safer tomorrow."}
                </p>
              </div>
              {content.quote && (
                <div className="border-l-2 border-blue-500 pl-4 mt-6 text-xs italic text-slate-500 font-medium">
                  "{content.quote}"
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABOUT VALUES SECTION */}
        {type === 'AboutValues' && (
          <div className="space-y-10 py-6">
            {(content.title || content.subtitle) && (
              <div className={`${alignClass} space-y-2 max-w-2xl mx-auto`}>
                <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">{content.title || "OUR GUIDING PHILOSOPHY"}</span>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">{content.subtitle || "The Pillars of NX Solution"}</h2>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(content.values || []).map((val: any, idx: number) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-6 flex items-start gap-4 hover:bg-white hover:border-blue-100 hover:shadow-sm transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {renderIcon(val.icon || "HelpCircle", "w-5 h-5")}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-slate-800 text-sm">{val.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{val.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABOUT LEADERSHIP SECTION */}
        {type === 'AboutLeadership' && (
          <div className="space-y-10 py-6">
            {(content.title || content.subtitle) && (
              <div className={`${alignClass} space-y-2 max-w-2xl mx-auto`}>
                <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">{content.title || "EXECUTIVE LEADERSHIP"}</span>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">{content.subtitle || "The Visionaries Behind NX"}</h2>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(content.team || []).map((member: any, idx: number) => (
                <div key={idx} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                  <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                    <img
                      src={member.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop"}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-5 space-y-2.5">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm leading-tight">{member.name}</h4>
                      <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block mt-0.5">{member.role}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal line-clamp-3">{member.bio}</p>
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-[11px] font-bold text-slate-500 hover:text-blue-600 gap-1 pt-1.5 border-t border-slate-50 w-full"
                      >
                        {renderIcon("Linkedin", "w-3 h-3")}
                        <span>Connect on LinkedIn</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABOUT TIMELINE SECTION */}
        {type === 'AboutTimeline' && (
          <div className="space-y-10 py-6">
            {(content.title || content.subtitle) && (
              <div className={`${alignClass} space-y-2 max-w-2xl mx-auto`}>
                <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">{content.title || "OUR CHRONOLOGICAL TIMELINE"}</span>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">{content.subtitle || "The Journey of Innovation"}</h2>
              </div>
            )}

            <div className="max-w-4xl mx-auto relative pl-6 sm:pl-8 border-l border-slate-100 space-y-8 py-2">
              {(content.milestones || []).map((stone: any, idx: number) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-blue-600 group-hover:bg-blue-600 transition-colors flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 group-hover:bg-white"></div>
                  </div>
                  <div className="bg-white border border-slate-100 p-5 rounded-xl hover:border-blue-100 hover:shadow-sm transition-all">
                    <span className="text-xs font-extrabold text-blue-600 font-mono tracking-wider">{stone.year}</span>
                    <h4 className="font-bold text-slate-800 text-sm mt-0.5">{stone.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">{stone.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABOUT CERTIFICATIONS SECTION */}
        {type === 'AboutCertifications' && (
          <div className="space-y-10 py-6">
            {(content.title || content.subtitle) && (
              <div className={`${alignClass} space-y-2 max-w-2xl mx-auto`}>
                <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">{content.title || "GOVERNMENT & GLOBAL COMPLIANCE"}</span>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">{content.subtitle || "Enterprise Security Certifications"}</h2>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(content.certs || []).map((cert: any, idx: number) => (
                <div key={idx} className="bg-white border border-slate-100 rounded-xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      {renderIcon("Award", "w-5 h-5")}
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm leading-tight">{cert.title}</h4>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block">{cert.authority} &bull; {cert.year}</span>
                    <p className="text-[11px] text-slate-400 leading-normal mt-1">{cert.desc}</p>
                  </div>
                  <div className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded inline-block self-start border border-emerald-100">
                    Active & Verified
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABOUT AWARDS SECTION */}
        {type === 'AboutAwards' && (
          <div className="space-y-10 py-6">
            {(content.title || content.subtitle) && (
              <div className={`${alignClass} space-y-2 max-w-2xl mx-auto`}>
                <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">{content.title || "INDUSTRY RECOGNITIONS"}</span>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">{content.subtitle || "Awards & Achievements"}</h2>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {(content.awards || []).map((award: any, idx: number) => (
                <div key={idx} className="bg-blue-50/20 border border-blue-100/40 rounded-xl p-5 space-y-3 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600/5 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    {renderIcon("Trophy", "w-5 h-5")}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{award.title}</h4>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide block mt-0.5">{award.giver} &bull; {award.year}</span>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{award.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABOUT PARTNERS SECTION */}
        {type === 'AboutPartners' && (
          <div className="space-y-8 py-6">
            {(content.title || content.subtitle) && (
              <div className={`${alignClass} space-y-2 max-w-2xl mx-auto`}>
                <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">{content.title || "ECOSYSTEM PARTNERS"}</span>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">{content.subtitle || "Collaborating with Leading Technologies"}</h2>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 opacity-75">
              {(content.partners || []).map((part: any, idx: number) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-100 hover:shadow-sm transition-all py-4 px-3 rounded-lg text-center flex flex-col justify-center items-center">
                  <span className="block text-xs font-extrabold tracking-wider text-slate-700 font-mono leading-none">{part.name}</span>
                  <span className="text-[9px] text-slate-400 mt-1 leading-none">{part.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABOUT GALLERY SECTION */}
        {type === 'AboutGallery' && (
          <div className="space-y-10 py-6">
            {(content.title || content.subtitle) && (
              <div className={`${alignClass} space-y-2 max-w-2xl mx-auto`}>
                <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">{content.title || "MEDIA ARCHIVE GALLERY"}</span>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">{content.subtitle || "Visual Glimpses of NX Success"}</h2>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(content.media || []).map((item: any, idx: number) => (
                <div
                  key={idx}
                  onClick={() => setSelectedGalleryMedia(item)}
                  className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                >
                  <div className="aspect-video bg-slate-900 relative overflow-hidden flex items-center justify-center">
                    <img
                      src={item.thumb || item.url}
                      alt={item.caption || "Gallery item thumbnail"}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/95 text-blue-600 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        {renderIcon(item.type === 'video' ? "Play" : "Eye", "w-5 h-5 fill-current")}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <p className="text-[11px] text-slate-500 leading-normal font-medium">{item.caption}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Gallery Lightbox Modal Popup */}
            {selectedGalleryMedia && (
              <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedGalleryMedia(null)}></div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden w-full max-w-4xl shadow-2xl relative z-10 flex flex-col">
                  <button
                    onClick={() => setSelectedGalleryMedia(null)}
                    className="absolute top-4 right-4 text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 p-2 rounded-full z-20 cursor-pointer transition-colors"
                  >
                    {renderIcon("X", "w-4 h-4")}
                  </button>
                  <div className="aspect-video w-full bg-black flex items-center justify-center">
                    {selectedGalleryMedia.type === 'video' ? (
                      <iframe
                        src={selectedGalleryMedia.url}
                        title="Gallery Video Preview"
                        className="w-full h-full"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <img
                        src={selectedGalleryMedia.url}
                        alt="Gallery Lightbox Preview"
                        className="max-h-[70vh] object-contain max-w-full"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                  {selectedGalleryMedia.caption && (
                    <div className="p-5 bg-slate-900 border-t border-slate-800 text-slate-300 text-xs">
                      {selectedGalleryMedia.caption}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABOUT TESTIMONIALS SECTION */}
        {type === 'AboutTestimonials' && (
          <div className="space-y-10 py-6">
            {(content.title || content.subtitle) && (
              <div className={`${alignClass} space-y-2 max-w-2xl mx-auto`}>
                <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">{content.title || "CLIENT FEEDBACK"}</span>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">{content.subtitle || "The Voices of Verified Value"}</h2>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(content.testimonials || []).map((t: any, idx: number) => (
                <div key={idx} className="bg-white border border-slate-100 rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: t.rating || 5 }).map((_, i) => (
                        <span key={i} className="text-sm">★</span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed italic">"{t.quote}"</p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-50">
                      <img
                        src={t.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop"}
                        alt={t.author}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs leading-none">{t.author}</h4>
                      <span className="text-[10px] text-slate-400 block mt-1">{t.role} &bull; {t.company}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABOUT DOWNLOADS SECTION */}
        {type === 'AboutDownloads' && (
          <div className="space-y-10 py-6">
            {(content.title || content.subtitle) && (
              <div className={`${alignClass} space-y-2 max-w-2xl mx-auto`}>
                <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">{content.title || "CORPORATE DOWNLOAD CENTER"}</span>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">{content.subtitle || "PDF Resources & Solution Frameworks"}</h2>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {(content.downloads || []).map((dl: any) => (
                <div
                  key={dl.id}
                  onClick={() => {
                    setSelectedDownload(dl);
                    setDownloadSuccess(false);
                  }}
                  className="bg-white border border-slate-100 hover:border-blue-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-xl p-5 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      {renderIcon("FileText", "w-5 h-5")}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-xs leading-snug line-clamp-2">{dl.label}</h4>
                      <span className="text-[9px] text-slate-400 font-bold block mt-1 uppercase">{dl.fileType || "PDF"} &bull; {dl.size || "Unknown Size"}</span>
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-50 text-slate-400 group-hover:text-blue-600 transition-colors">
                    {renderIcon("ArrowDown", "w-4 h-4")}
                  </div>
                </div>
              ))}
            </div>

            {/* B2B Download Gateway Modal Dialog */}
            {selectedDownload && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedDownload(null)}></div>
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden w-full max-w-md shadow-2xl relative z-10 p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block">Enterprise Download Gateway</span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">Unlock "{selectedDownload.label}"</h3>
                    </div>
                    <button
                      onClick={() => setSelectedDownload(null)}
                      className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-1 rounded-full cursor-pointer transition-colors"
                    >
                      {renderIcon("X", "w-4 h-4")}
                    </button>
                  </div>

                  {downloadSuccess ? (
                    <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-xl text-center space-y-3">
                      <Icons.CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                      <h4 className="font-bold text-emerald-900 text-sm">Access Authenticated!</h4>
                      <p className="text-xs text-emerald-700">Your profile download should launch in a separate window. If blocked by popups, click below to open:</p>
                      <a
                        href={selectedDownload.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        {renderIcon("Download", "w-3.5 h-3.5")}
                        <span>Download PDF Manually</span>
                      </a>
                    </div>
                  ) : (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!downloadLeadForm.name || !downloadLeadForm.email) return;
                        setSubmitting(true);
                        try {
                          await apiService.submitLead({
                            name: downloadLeadForm.name,
                            email: downloadLeadForm.email,
                            phone: downloadLeadForm.phone,
                            company: downloadLeadForm.company || 'Enterprise Org',
                            message: `Requested secured corporate file: "${selectedDownload.label}"`,
                            source: 'career_application' as any, // Using legal source type matching typescript
                            details: {
                              action: 'profile_download',
                              fileName: selectedDownload.label,
                              fileId: selectedDownload.id,
                              fileSize: selectedDownload.size
                            }
                          });
                          setDownloadSuccess(true);
                          setDownloadLeadForm({ name: '', email: '', phone: '', company: '' });
                          // Auto open the file
                          window.open(selectedDownload.url, '_blank');
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setSubmitting(false);
                        }
                      }}
                      className="space-y-4"
                    >
                      <p className="text-xs text-slate-400">Please provide your coordinates to instantly sync with our technical resource repositories.</p>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Full Name</label>
                          <input
                            type="text"
                            required
                            value={downloadLeadForm.name}
                            onChange={(e) => setDownloadLeadForm({ ...downloadLeadForm, name: e.target.value })}
                            placeholder="John Doe"
                            className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Corporate Email</label>
                          <input
                            type="email"
                            required
                            value={downloadLeadForm.email}
                            onChange={(e) => setDownloadLeadForm({ ...downloadLeadForm, email: e.target.value })}
                            placeholder="john@company.com"
                            className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Phone Number</label>
                          <input
                            type="text"
                            value={downloadLeadForm.phone}
                            onChange={(e) => setDownloadLeadForm({ ...downloadLeadForm, phone: e.target.value })}
                            placeholder="+91"
                            className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Company / Organization</label>
                          <input
                            type="text"
                            value={downloadLeadForm.company}
                            onChange={(e) => setDownloadLeadForm({ ...downloadLeadForm, company: e.target.value })}
                            placeholder="Enterprise Org"
                            className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full text-center py-2.5 rounded-lg text-xs font-semibold text-white shadow-md transition-opacity hover:opacity-95 cursor-pointer"
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        {submitting ? 'Registering Access...' : 'Authenticate & Download'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABOUT CONTACT/ENQUIRY MULTI-TAB CRM FORM SECTION */}
        {type === 'AboutContact' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch py-6">
            <div className="bg-slate-900 rounded-2xl p-8 text-white flex flex-col justify-between space-y-12">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-2">
                    {content.tagText || "B2B COOPERATIVE DESK"}
                  </span>
                  <h2 className="text-3xl font-extrabold tracking-tight">
                    {content.title || "Request an Engineering Solution Consultation"}
                  </h2>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                  {content.desc || "Select your target B2B workspace department to trigger custom telemetry modeling or arrange direct simulations in physical test facilities."}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5 text-xs">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 text-blue-400 flex items-center justify-center flex-shrink-0">
                    {renderIcon("MapPin", "w-4.5 h-4.5")}
                  </div>
                  <div>
                    <h4 className="font-bold">National Innovation Center</h4>
                    <p className="text-slate-400 mt-1 text-[11px]">NX Solution, 123, Tech Park, Noida, Uttar Pradesh, India</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5 text-xs">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 text-blue-400 flex items-center justify-center flex-shrink-0">
                    {renderIcon("PhoneCall", "w-4.5 h-4.5")}
                  </div>
                  <div>
                    <h4 className="font-bold">Enterprise Hotline</h4>
                    <p className="text-slate-400 mt-1 text-[11px]">+91 8009 123 456 &bull; support@nxsolution.in</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5 text-xs">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 text-blue-400 flex items-center justify-center flex-shrink-0">
                    {renderIcon("Clock", "w-4.5 h-4.5")}
                  </div>
                  <div>
                    <h4 className="font-bold">Response Guarantee</h4>
                    <p className="text-slate-400 mt-1 text-[11px]">All inquiries automatically created as leads in sales pipeline with 4-hour SLA responses.</p>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-4 flex items-center gap-1 font-mono">
                <span>SECURE SSL 256-BIT ENCRYPTION &bull; GDPR COMPLIANT</span>
              </div>
            </div>

            <div className="bg-white border border-slate-100 shadow-xl rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{content.formHeading || "Interactive CRM Gateway"}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Choose inquiry type to route directly to appropriate pipelines.</p>
                </div>

                {/* Form Tabs */}
                <div className="flex flex-wrap border-b border-slate-100 pb-1.5 gap-2">
                  {[
                    { id: 'contact', label: 'General Message' },
                    { id: 'demo', label: 'Book Demo' },
                    { id: 'callback', label: 'Request Callback' },
                    { id: 'partner', label: 'Partner Inquiry' }
                  ].map((tab) => {
                    const isActive = activeContactFormTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setActiveContactFormTab(tab.id as any);
                          setAboutContactSuccess(false);
                        }}
                        className={`text-xs font-bold px-2.5 py-1.5 border-b-2 cursor-pointer transition-all ${
                          isActive
                            ? 'border-blue-600 text-blue-600 font-extrabold'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {aboutContactSuccess ? (
                  <div className="p-6 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-center space-y-3">
                    <Icons.CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                    <h4 className="font-bold text-sm">Opportunity Registered!</h4>
                    <p className="text-xs">Your request was logged inside the B2B pipeline database under source "<strong>{activeContactFormTab}</strong>". Notification alerts have been dispatched to our Solutions Desk.</p>
                    <button
                      type="button"
                      onClick={() => setAboutContactSuccess(false)}
                      className="text-xs font-bold text-blue-600 underline cursor-pointer"
                    >
                      Submit another inquiry
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!contactLeadForm.name || !contactLeadForm.phone) return;
                      setSubmitting(true);
                      try {
                        const emailField = contactLeadForm.email || `${contactLeadForm.name.toLowerCase().replace(/\s+/g, '')}@noemail.com`;
                        
                        let pipelineDetails: any = {
                          inquiryType: activeContactFormTab,
                          interestDepartment: activeContactFormTab === 'partner' ? 'Partnerships Group' : 'Solutions Delivery Center'
                        };

                        let customMessage = contactLeadForm.message;

                        if (activeContactFormTab === 'demo') {
                          pipelineDetails.preferredDate = contactLeadForm.preferredDate;
                          pipelineDetails.productOfChoice = contactLeadForm.productName;
                          customMessage = `Preferred Demo Date: ${contactLeadForm.preferredDate}. Product: ${contactLeadForm.productName}. Message: ${contactLeadForm.message}`;
                        } else if (activeContactFormTab === 'callback') {
                          pipelineDetails.preferredTime = contactLeadForm.preferredTime;
                          customMessage = `Callback Request! Best Time: ${contactLeadForm.preferredTime}. Message: ${contactLeadForm.message}`;
                        } else if (activeContactFormTab === 'partner') {
                          pipelineDetails.partnerType = contactLeadForm.partnerType;
                          customMessage = `Partner Application! Type: ${contactLeadForm.partnerType}. Message: ${contactLeadForm.message}`;
                        }

                        await apiService.submitLead({
                          name: contactLeadForm.name,
                          email: emailField,
                          phone: contactLeadForm.phone,
                          company: contactLeadForm.company || 'Enterprise Visitor Org',
                          message: customMessage || `Form submission via multi-tab CMSAboutContact: ${activeContactFormTab}`,
                          source: (activeContactFormTab === 'demo' ? 'demo' : 'contact') as any,
                          details: pipelineDetails
                        });

                        setAboutContactSuccess(true);
                        setContactLeadForm({
                          name: '',
                          email: '',
                          phone: '',
                          company: '',
                          subject: '',
                          message: '',
                          preferredDate: '',
                          preferredTime: '',
                          productName: 'NX Sentinel System',
                          partnerType: 'System Integrator'
                        });
                      } catch (err) {
                        console.error('Failed storing lead inside MongoDB:', err);
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                    className="space-y-4"
                  >
                    {/* Common fields: Name, Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Your Name *</label>
                        <input
                          type="text"
                          required
                          value={contactLeadForm.name}
                          onChange={(e) => setContactLeadForm({ ...contactLeadForm, name: e.target.value })}
                          placeholder="John Doe"
                          className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 text-slate-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Phone Number *</label>
                        <input
                          type="text"
                          required
                          value={contactLeadForm.phone}
                          onChange={(e) => setContactLeadForm({ ...contactLeadForm, phone: e.target.value })}
                          placeholder="+91"
                          className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 text-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Email and Company (Optional except general/partner) */}
                    {activeContactFormTab !== 'callback' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Corporate Email *</label>
                          <input
                            type="email"
                            required
                            value={contactLeadForm.email}
                            onChange={(e) => setContactLeadForm({ ...contactLeadForm, email: e.target.value })}
                            placeholder="john@company.com"
                            className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 text-slate-900 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Company Name</label>
                          <input
                            type="text"
                            value={contactLeadForm.company}
                            onChange={(e) => setContactLeadForm({ ...contactLeadForm, company: e.target.value })}
                            placeholder="Enterprise Org"
                            className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 text-slate-900 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Tab specific context inputs */}
                    {activeContactFormTab === 'demo' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/20 border border-blue-100/50 p-4 rounded-xl">
                        <div>
                          <label className="text-[10px] font-bold text-blue-700 uppercase block mb-1">Preferred Date</label>
                          <input
                            type="date"
                            value={contactLeadForm.preferredDate}
                            onChange={(e) => setContactLeadForm({ ...contactLeadForm, preferredDate: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-blue-700 uppercase block mb-1">Target Product</label>
                          <select
                            value={contactLeadForm.productName}
                            onChange={(e) => setContactLeadForm({ ...contactLeadForm, productName: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                          >
                            <option value="NX AI Dome Camera">NX AI Dome Camera</option>
                            <option value="NX Sentinel System">NX Sentinel System</option>
                            <option value="NX Face Terminal Pro">NX Face Terminal Pro</option>
                            <option value="IoT Safety Radars">IoT Safety Radars</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {activeContactFormTab === 'callback' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/20 border border-blue-100/50 p-4 rounded-xl">
                        <div>
                          <label className="text-[10px] font-bold text-blue-700 uppercase block mb-1">Best Time Slot</label>
                          <input
                            type="text"
                            value={contactLeadForm.preferredTime}
                            onChange={(e) => setContactLeadForm({ ...contactLeadForm, preferredTime: e.target.value })}
                            placeholder="e.g. Tomorrow 3 PM"
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-blue-700 uppercase block mb-1">Reason for Callback</label>
                          <select
                            value={contactLeadForm.subject}
                            onChange={(e) => setContactLeadForm({ ...contactLeadForm, subject: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                          >
                            <option value="Quotation Inquiry">Quotation Inquiry</option>
                            <option value="Technical Feasibility">Technical Feasibility</option>
                            <option value="Support Request">Support Request</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {activeContactFormTab === 'partner' && (
                      <div className="bg-blue-50/20 border border-blue-100/50 p-4 rounded-xl">
                        <label className="text-[10px] font-bold text-blue-700 uppercase block mb-1">Your Partnership Model</label>
                        <select
                          value={contactLeadForm.partnerType}
                          onChange={(e) => setContactLeadForm({ ...contactLeadForm, partnerType: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                        >
                          <option value="System Integrator">System Integrator / Installer</option>
                          <option value="Value Added Reseller">Value Added Reseller (VAR)</option>
                          <option value="OEM Partner">OEM / Branding Partner</option>
                          <option value="Affiliate Distributor">Regional Distributor</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Message Detail</label>
                      <textarea
                        value={contactLeadForm.message}
                        onChange={(e) => setContactLeadForm({ ...contactLeadForm, message: e.target.value })}
                        rows={3}
                        placeholder="Please include details about camera count or physical gate configurations..."
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-2.5 rounded-lg text-xs font-bold text-white shadow-md cursor-pointer transition-opacity hover:opacity-90"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      {submitting ? 'Registering Lead Opportunity...' : 'Transmitting B2B Request'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CONTACT SECTION */}
        {type === 'Contact' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
            {/* Left Coordinates */}
            <div className="bg-slate-900 rounded-2xl p-8 text-white flex flex-col justify-between space-y-10">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-2">
                    Connect With Us
                  </span>
                  <h2 className="text-3xl font-extrabold tracking-tight">
                    Let's Build Something Smarter
                  </h2>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
                  We specialize in tailoring custom visual networks, CCTV integration layers, and gate controllers. Schedule an engineering call.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 text-xs">
                  <Icons.MapPin className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold">Headquarters</h4>
                    <p className="text-gray-400 mt-1">NX Solution, 123, Tech Park, Noida, Uttar Pradesh, India</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-xs">
                  <Icons.Phone className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold">Phone Number</h4>
                    <p className="text-gray-400 mt-1">+91 8009 123 456</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-xs">
                  <Icons.Mail className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold">Email Support</h4>
                    <p className="text-gray-400 mt-1">info@nxsolution.in</p>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-gray-500 border-t border-gray-800 pt-4 flex items-center gap-1">
                <Icons.Clock className="w-4 h-4" />
                <span>Working Hours: Mon - Sat: 9:00 AM - 7:00 PM</span>
              </div>
            </div>

            {/* Right Contact Form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-8 space-y-6 flex flex-col justify-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{content.title}</h3>
                <p className="text-xs text-gray-400 mt-1">{content.subtitle}</p>
              </div>

              {successMsg ? (
                <div className="p-6 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-center space-y-2">
                  <Icons.CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h4 className="font-bold">Inquiry Transmitted!</h4>
                  <p className="text-xs">Your request was logged in our enterprise CRM. A technician will follow up shortly.</p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitLead('contact');
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={leadForm.name}
                      onChange={handleFormChange}
                      placeholder="Jane Smith"
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={leadForm.email}
                        onChange={handleFormChange}
                        placeholder="jane@domain.com"
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Phone Number</label>
                      <input
                        type="text"
                        name="phone"
                        value={leadForm.phone}
                        onChange={handleFormChange}
                        placeholder="+91"
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Your Message</label>
                    <textarea
                      name="message"
                      required
                      rows={4}
                      value={leadForm.message}
                      onChange={handleFormChange}
                      placeholder="Outline your security specifications here..."
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 rounded-lg text-xs font-semibold text-white shadow"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {submitting ? 'Transmitting Inquiries...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
