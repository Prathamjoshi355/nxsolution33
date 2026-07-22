import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, Edit2, Trash2, Copy, Eye, EyeOff, Search, ArrowLeft, 
  Cpu, Save, X, Globe, Sliders, FileText, AlertCircle, RefreshCw, 
  ArrowRight, Shield, Layers, HelpCircle, Check, Sparkles, AlertTriangle, 
  ArrowUp, ArrowDown, ExternalLink, Settings, CheckCircle, Info, ToggleLeft, ToggleRight, Layout
} from 'lucide-react';
import { apiService } from '../../Public/Services/api';
import { Industry, Institution, Zone, Problem, Solution, SolutionSection, Module } from '../../types';
import ImageUploader from '../../Public/Components/ImageUploader';
import DeleteConfirmationModal from './DeleteConfirmationModal';

// Supported icons for user selection
const AVAILABLE_ICONS = [
  'Shield', 'Cpu', 'Layers', 'AlertTriangle', 'Activity', 'CheckCircle', 
  'Sparkles', 'Globe', 'Sliders', 'FileText', 'Server', 'Database', 
  'Cloud', 'Monitor', 'Smartphone', 'UserCheck', 'TrendingUp', 'Terminal'
];

export default function SolutionManagement() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();

  // Cascade Hierarchy State
  const [industry, setIndustry] = useState<Industry | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [area, setArea] = useState<Zone | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  
  // Core Solution State
  const [solution, setSolution] = useState<Solution | null>(null);
  const [sections, setSections] = useState<SolutionSection[]>([]);
  const [solutionTitle, setSolutionTitle] = useState('');
  const [solutionSlug, setSolutionSlug] = useState('');
  const [solutionStatus, setSolutionStatus] = useState<'draft' | 'published' | 'archived'>('published');

  // CMS Visual State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Tracks unsaved status of sections to warn administrator
  const [unsavedSections, setUnsavedSections] = useState<Record<string, boolean>>({});
  
  // Validation Errors state
  const [validationErrors, setValidationErrors] = useState<string[] | null>(null);

  // Delete Solution Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    isDeleting: boolean;
  }>({
    isOpen: false,
    isDeleting: false,
  });

  const handleDeleteSolutionClick = () => {
    if (!solution?.id) return;
    setDeleteModal({ isOpen: true, isDeleting: false });
  };

  const handleConfirmDeleteSolution = async () => {
    if (!solution?.id) return;
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    try {
      await apiService.deleteSolution(solution.id);
      showToast('success', 'Solution engine deleted successfully.');
      setDeleteModal({ isOpen: false, isDeleting: false });
      setTimeout(() => {
        navigate(`/superadmin/admin/problems/${problem?.id}/modules`);
      }, 1000);
    } catch (err: any) {
      showToast('error', 'Failed to delete Solution record.');
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  // Helper to validate that all 13 sections satisfy constraints
  const validateAllSections = (): string[] => {
    const errors: string[] = [];
    if (!sections || sections.length !== 13) {
      errors.push(`A valid Solution must contain exactly 13 sections. Current count is ${sections?.length || 0}.`);
      return errors;
    }

    sections.forEach((sec) => {
      const sectionName = sec.name || sec.id;
      
      // 1. Image uploaded check
      if (!sec.image || typeof sec.image !== 'string' || sec.image.trim() === '') {
        errors.push(`Section "${sectionName}": Image is mandatory but has not been uploaded.`);
      }

      // 2. Description OR Bullet Points (items list) check
      const hasDescription = sec.description && typeof sec.description === 'string' && sec.description.trim() !== '';
      const hasItems = Array.isArray(sec.items) && sec.items.length > 0;

      if (!hasDescription && !hasItems) {
        errors.push(`Section "${sectionName}": Must contain either a Description or Bullet Points (items list).`);
      }
    });

    return errors;
  };
  
  // Collapsed status of each of the 13 sections
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    'basic-details': false,
    'hero': true,
    'problem-overview': true,
    'challenges': true,
    'features': true,
    'workflow': true,
    'benefits': true,
    'ai-modules': true,
    'hardware': true,
    'software': true,
    'case-study': true,
    'faqs': true,
    'cta': true,
    'lead-form': true,
    'seo': true
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  useEffect(() => {
    if (moduleId) {
      fetchCascadeAndSolution();
    }
  }, [moduleId]);

  const fetchCascadeAndSolution = async () => {
    setLoading(true);
    try {
      // 0. Load Module first
      const allModules = await apiService.getModules();
      const matchedModule = allModules.find((m: any) => m.id === moduleId);
      if (!matchedModule) {
        setError('The specified level 4.5 Module Node was not found.');
        setLoading(false);
        return;
      }
      setModule(matchedModule);

      // 1. Load Problem
      const allProblems = await apiService.getProblems();
      const matchedProblem = allProblems.find((p: any) => p.id === matchedModule.problemId);
      if (!matchedProblem) {
        setError('The specified level 4 Problem Node was not found.');
        setLoading(false);
        return;
      }
      setProblem(matchedProblem);

      // 2. Load Parent Area (Zone)
      const allZones = await apiService.getAdminZones();
      const matchedZone = allZones.find((z: any) => z.id === matchedProblem.zoneId || z.id === matchedProblem.areaId);
      if (matchedZone) {
        setArea(matchedZone);
        
        // 3. Load Institution
        const allInstitutions = await apiService.getAdminInstitutions();
        const matchedInstitution = allInstitutions.find((inst: any) => inst.id === matchedZone.institutionId);
        if (matchedInstitution) {
          setInstitution(matchedInstitution);

          // 4. Load Industry
          const allIndustries = await apiService.getAdminIndustries();
          const matchedIndustry = allIndustries.find((ind: any) => ind.id === matchedInstitution.industryId);
          if (matchedIndustry) {
            setIndustry(matchedIndustry);
          }
        }
      }

      // 5. Load or Initialize Solution mapped to this Module
      const existingSolutions = await apiService.getSolutionsByModule(moduleId);
      if (existingSolutions && existingSolutions.length > 0) {
        const sol = existingSolutions[0];
        setSolution(sol);
        setSolutionTitle(sol.title);
        setSolutionSlug(sol.slug);
        setSolutionStatus(sol.status || 'published');
        setSections(sol.sections || []);
      } else {
        // Initialize a brand new solution on the fly
        const initialTitle = `AI Solution: ${matchedModule.name}`;
        const initialSlug = matchedModule.slug ? `${matchedModule.slug}-solution` : `sol-${Date.now()}`;
        
        const payload: Partial<Solution> = {
          moduleId: matchedModule.id,
          problemId: matchedProblem.id,
          title: initialTitle,
          slug: initialSlug,
          heroTitle: `Enterprise AI Automation for ${matchedModule.name}`,
          heroSubtitle: `Level 5 Integrated Tactical Countermeasure`,
          status: 'draft',
          industryId: matchedProblem.industryId,
          institutionId: matchedProblem.institutionId,
          zoneId: matchedProblem.zoneId || matchedProblem.areaId || ''
        };

        const res = await apiService.saveSolution(payload);
        if (res.success && res.solution) {
          setSolution(res.solution);
          setSolutionTitle(res.solution.title);
          setSolutionSlug(res.solution.slug);
          setSolutionStatus(res.solution.status || 'draft');
          setSections(res.solution.sections || []);
          showToast('success', 'A brand new Level 5 Solution Node workspace has been initialized.');
        } else {
          // Fallback fetch
          const retrySolutions = await apiService.getSolutionsByModule(moduleId);
          if (retrySolutions && retrySolutions.length > 0) {
            setSolution(retrySolutions[0]);
            setSections(retrySolutions[0].sections || []);
          }
        }
      }
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('An error occurred while building the Solution Management cascading chain.');
    } finally {
      setLoading(false);
    }
  };

  // Expand / Collapse all toggler
  const handleToggleAll = (expand: boolean) => {
    const newState = Object.keys(collapsedSections).reduce((acc, key) => {
      acc[key] = !expand;
      return acc;
    }, {} as Record<string, boolean>);
    setCollapsedSections(newState);
  };

  const toggleSection = (key: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Helper to update standard fields of a section
  const updateSectionField = (sectionId: string, field: keyof SolutionSection, value: any) => {
    setSections(prev => prev.map(sec => sec.id === sectionId ? { ...sec, [field]: value } : sec));
    setUnsavedSections(prev => ({ ...prev, [sectionId]: true }));
  };

  // Helper to update structured items in list-based sections
  const updateSectionItems = (sectionId: string, newItems: any[]) => {
    setSections(prev => prev.map(sec => sec.id === sectionId ? { ...sec, items: newItems } : sec));
    setUnsavedSections(prev => ({ ...prev, [sectionId]: true }));
  };

  // Save changes specifically for one section
  const handleSaveSection = async (sectionId: string) => {
    if (!solution) return;
    setValidationErrors(null);

    // Enforce full validation for saving/publishing
    const errors = validateAllSections();
    if (errors.length > 0) {
      setValidationErrors(errors);
      showToast('error', 'Validation Blocked: All 13 sections must have an image and either a Description or Bullet Points.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      // Find updated section from state
      const targetSection = sections.find(s => s.id === sectionId);
      if (!targetSection) return;

      // Prepare updated sections array
      const updatedSections = sections.map(s => s.id === sectionId ? targetSection : s);

      const payload: Partial<Solution> = {
        ...solution,
        title: solutionTitle,
        slug: solutionSlug,
        status: solutionStatus,
        sections: updatedSections,
        industryId: industry?.id || solution.industryId,
        institutionId: institution?.id || solution.institutionId,
        zoneId: area?.id || solution.zoneId
      };

      await apiService.saveSolution(payload);
      setUnsavedSections(prev => ({ ...prev, [sectionId]: false }));
      showToast('success', `Section "${targetSection.name}" saved successfully.`);
      
      // Refresh local reference
      const existingSolutions = await apiService.getSolutionsByModule(moduleId!);
      if (existingSolutions && existingSolutions.length > 0) {
        setSolution(existingSolutions[0]);
      }
    } catch (err: any) {
      showToast('error', 'Failed to save section content.');
    }
  };

  // Save the entire page including general fields and all sections
  const handleSaveAll = async () => {
    if (!solution) return;
    setValidationErrors(null);

    if (!solutionTitle || !solutionSlug) {
      showToast('error', 'Solution Title and Slug are required parameters.');
      return;
    }

    // Enforce full validation for saving/publishing
    const errors = validateAllSections();
    if (errors.length > 0) {
      setValidationErrors(errors);
      showToast('error', 'Validation Blocked: All 13 sections must have an image and either a Description or Bullet Points.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const payload: Partial<Solution> = {
        ...solution,
        title: solutionTitle,
        slug: solutionSlug,
        status: solutionStatus,
        sections,
        industryId: industry?.id || solution.industryId,
        institutionId: institution?.id || solution.institutionId,
        zoneId: area?.id || solution.zoneId
      };

      await apiService.saveSolution(payload);
      setUnsavedSections({});
      showToast('success', 'Complete Level 5 Solution configuration synchronized perfectly with database.');
      
      // Refresh
      const existingSolutions = await apiService.getSolutionsByModule(moduleId!);
      if (existingSolutions && existingSolutions.length > 0) {
        setSolution(existingSolutions[0]);
      }
    } catch (err: any) {
      showToast('error', 'An error occurred during global solution synchronization.');
    }
  };

  // Add a new row to items array inside a section
  const handleAddItemToSection = (sectionId: string, defaultObj: any) => {
    const sec = sections.find(s => s.id === sectionId);
    if (!sec) return;
    const currentItems = Array.isArray(sec.items) ? [...sec.items] : [];
    
    // Auto increment step or generate a simple temporary ID
    const newItem = { ...defaultObj, id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}` };
    if (defaultObj.step !== undefined) {
      const nextStepNum = currentItems.length + 1;
      newItem.step = nextStepNum < 10 ? `0${nextStepNum}` : `${nextStepNum}`;
    }

    updateSectionItems(sectionId, [...currentItems, newItem]);
  };

  // Remove a row from items array inside a section
  const handleRemoveItemFromSection = (sectionId: string, itemId: string, itemIndex?: number) => {
    const sec = sections.find(s => s.id === sectionId);
    if (!sec) return;
    let currentItems = Array.isArray(sec.items) ? [...sec.items] : [];
    
    if (itemId) {
      currentItems = currentItems.filter(item => item.id !== itemId);
    } else if (itemIndex !== undefined) {
      currentItems = currentItems.filter((_, idx) => idx !== itemIndex);
    }

    // Re-adjust steps number if workflow
    if (sectionId === 'workflow') {
      currentItems = currentItems.map((item, idx) => {
        const stepNum = idx + 1;
        return {
          ...item,
          step: stepNum < 10 ? `0${stepNum}` : `${stepNum}`
        };
      });
    }

    updateSectionItems(sectionId, currentItems);
  };

  // Reordering rows (Move Up / Move Down)
  const handleMoveItem = (sectionId: string, index: number, direction: 'up' | 'down') => {
    const sec = sections.find(s => s.id === sectionId);
    if (!sec) return;
    const currentItems = Array.isArray(sec.items) ? [...sec.items] : [];
    
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === currentItems.length - 1) return;

    const swapWithIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = currentItems[index];
    currentItems[index] = currentItems[swapWithIndex];
    currentItems[swapWithIndex] = temp;

    // Adjust workflow steps
    if (sectionId === 'workflow') {
      currentItems.forEach((item, idx) => {
        const stepNum = idx + 1;
        item.step = stepNum < 10 ? `0${stepNum}` : `${stepNum}`;
      });
    }

    updateSectionItems(sectionId, currentItems);
  };

  // Lead fields options list generator
  const getLeadFieldStatus = (field: string, items: any[]) => {
    const matched = items?.find(item => item.field === field);
    return matched ? matched.status : 'optional'; // default is optional
  };

  const handleUpdateLeadFieldStatus = (field: string, status: 'required' | 'optional' | 'hidden', items: any[]) => {
    let currentItems = Array.isArray(items) ? [...items] : [];
    const idx = currentItems.findIndex(item => item.field === field);
    if (idx > -1) {
      currentItems[idx].status = status;
    } else {
      currentItems.push({ field, status });
    }
    updateSectionItems('lead-form', currentItems);
  };

  // Auto generation of solution slug
  const handleGenerateSlug = () => {
    if (!solutionTitle) return;
    const generated = solutionTitle
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setSolutionSlug(generated);
  };

  // Preview Button Action
  const previewUrl = industry && institution && area && problem
    ? `/industries/${industry.slug}/${institution.slug}/${area.slug}/${problem.slug}`
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Toast Alert Banner */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-bounce ${
          notification.type === 'success' 
            ? 'bg-emerald-950 border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-950 border-rose-500/30 text-rose-400'
        }`}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 animate-pulse" />
          <span className="text-xs font-bold font-mono uppercase">{notification.message}</span>
        </div>
      )}

      {/* Navigation Header */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={() => navigate(`/superadmin/admin/problems/${problem?.id}/modules`)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
            title="Return to Modules"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-wider font-mono text-white">NX CMS ARCHITECT</h1>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-widest">Solution Engine • Level 5</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-extrabold tracking-wide rounded-xl transition-all flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              <span>Preview Public Page</span>
            </a>
          )}
          
          {solution?.id && (
            <button
              onClick={handleDeleteSolutionClick}
              className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              title="Delete Solution Engine"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Solution</span>
            </button>
          )}

          <button
            onClick={handleSaveAll}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold tracking-wider uppercase rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-950/20"
          >
            <Save className="w-4 h-4" />
            <span>Sync Complete CMS</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Cascade Breadcrumbs and Context Header */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="text-xs text-slate-400 flex flex-wrap items-center gap-1.5 font-medium">
              <span className="hover:text-slate-300 cursor-pointer" onClick={() => navigate('/admin')}>Dashboard</span>
              <span>&gt;</span>
              <span className="hover:text-slate-300 cursor-pointer" onClick={() => navigate('/superadmin/admin/industries')}>Industries</span>
              <span>&gt;</span>
              <span className="hover:text-slate-300 cursor-pointer" onClick={() => navigate('/superadmin/admin/industries')}>{industry?.name || 'Industry'}</span>
              <span>&gt;</span>
              <span className="hover:text-slate-300 cursor-pointer" onClick={() => navigate(`/superadmin/admin/industries/${industry?.id}/institutions`)}>{institution?.name || 'Institution'}</span>
              <span>&gt;</span>
              <span className="hover:text-slate-300 cursor-pointer" onClick={() => navigate(`/superadmin/admin/institutions/${institution?.id}/areas`)}>{area?.name || 'Area'}</span>
              <span>&gt;</span>
              <span className="hover:text-slate-300 cursor-pointer" onClick={() => navigate(`/superadmin/admin/areas/${area?.id}/problems`)}>{problem?.name || 'Problem'}</span>
              <span>&gt;</span>
              <span className="hover:text-slate-300 cursor-pointer" onClick={() => navigate(`/superadmin/admin/problems/${problem?.id}/modules`)}>{module?.name || 'Module'}</span>
              <span>&gt;</span>
              <span className="text-emerald-400 font-extrabold font-mono uppercase">Solution Engine</span>
            </div>

            {/* Complete Cascade Hierarchy Labels (Read Only, zero manual selection required) */}
            <div className="flex flex-wrap items-center gap-4 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Level 1:</span>
                <span className="text-xs font-semibold text-slate-300 font-mono">{industry?.name || 'Loading...'}</span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Level 2:</span>
                <span className="text-xs font-semibold text-slate-300 font-mono">{institution?.name || 'Loading...'}</span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Level 3 Area:</span>
                <span className="text-xs font-semibold text-slate-300 font-mono">{area?.name || 'Loading...'}</span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Level 4 Problem:</span>
                <span className="text-xs font-semibold text-slate-300 font-mono">{problem?.name || 'Loading...'}</span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Level 4.5 Module:</span>
                <span className="text-xs font-extrabold text-indigo-400 font-mono">{module?.name || 'Loading...'}</span>
              </div>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight pt-1">
              Solution Configuration Engine
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Design the complete public page experience for the <span className="text-indigo-400 font-bold">{module?.name}</span> module. Customize all 13 modules, recommended hardware/software matrices, interactive workflows, enterprise lead parameters, and rich media assets independently.
            </p>
          </div>

          {/* Quick collapse/expand controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleAll(true)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-300 tracking-wider uppercase transition-all"
            >
              Expand All Modules
            </button>
            <button
              onClick={() => handleToggleAll(false)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-300 tracking-wider uppercase transition-all"
            >
              Collapse All
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/20 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-xs font-bold">
            <AlertCircle className="w-5 h-5 flex-shrink-0 animate-pulse" />
            <span>{error}</span>
          </div>
        )}

        {validationErrors && validationErrors.length > 0 && (
          <div className="p-6 bg-rose-950/20 border border-rose-500/30 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 flex-shrink-0 animate-bounce" />
              <div>
                <h3 className="text-sm font-extrabold tracking-wider font-mono uppercase">CMS Validation Blocking Error</h3>
                <p className="text-[11px] text-rose-300 font-medium">The solution cannot be saved or published until all 13 sections satisfy image and content rules.</p>
              </div>
            </div>
            <div className="bg-slate-950/80 rounded-xl p-4 border border-rose-500/10 space-y-2 max-h-60 overflow-y-auto">
              {validationErrors.map((err, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs font-mono text-rose-300">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>{err}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setValidationErrors(null)}
                className="px-3.5 py-1.5 bg-rose-900/40 hover:bg-rose-900/60 border border-rose-500/20 text-rose-200 text-[10px] font-bold uppercase rounded-lg transition-all"
              >
                Dismiss Warning
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
            <span className="text-xs text-slate-400 font-mono">Loading Solution modules...</span>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* CARD: Basic Solution Details */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <button
                onClick={() => toggleSection('basic-details')}
                className="w-full bg-slate-950/60 hover:bg-slate-900/80 px-6 py-4 flex items-center justify-between border-b border-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold tracking-wider font-mono uppercase text-white">
                      Basic Solution Workspace Parameters
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">Configure Solution Title, Slug and Status</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-bold px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-500/30 rounded font-mono uppercase">Core Config</span>
                  <span className="text-slate-500 text-xs">{collapsedSections['basic-details'] ? '▼' : '▲'}</span>
                </div>
              </button>

              {!collapsedSections['basic-details'] && (
                <div className="p-6 space-y-4 text-xs font-semibold">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 uppercase tracking-wider">Solution Name *</label>
                      <input
                        type="text"
                        required
                        value={solutionTitle}
                        onChange={(e) => setSolutionTitle(e.target.value)}
                        placeholder="e.g. Automated CCTV Access Control Engine"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all"
                      />
                    </div>

                    {/* Slug */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Solution Slug *</span>
                        <button
                          type="button"
                          onClick={handleGenerateSlug}
                          className="text-[9px] text-indigo-400 hover:underline uppercase font-bold"
                        >
                          Auto Generate from Name
                        </button>
                      </label>
                      <input
                        type="text"
                        required
                        value={solutionSlug}
                        onChange={(e) => setSolutionSlug(e.target.value)}
                        placeholder="e.g. automated-cctv-access-control"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Status */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 uppercase tracking-wider">Publication Status</label>
                      <select
                        value={solutionStatus}
                        onChange={(e) => setSolutionStatus(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all font-mono"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    {/* Hierarchy Info (Disabled editing as requested) */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 uppercase tracking-wider">Problem Link (Read Only)</label>
                      <input
                        type="text"
                        disabled
                        value={problem?.name || ''}
                        className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-900 rounded-xl text-slate-500 outline-none cursor-not-allowed"
                      />
                    </div>

                    {/* Area Link */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 uppercase tracking-wider">Facility Area Link (Read Only)</label>
                      <input
                        type="text"
                        disabled
                        value={area?.name || ''}
                        className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-900 rounded-xl text-slate-500 outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Loop through each of the sections inside the sections state */}
            {sections.map((sec, secIdx) => {
              const isCollapsed = collapsedSections[sec.id] !== false;
              const hasUnsaved = unsavedSections[sec.id] === true;

              return (
                <div key={sec.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  {/* Section Collapsible Trigger */}
                  <div className="w-full bg-slate-950/40 hover:bg-slate-950/60 px-6 py-4 flex items-center justify-between border-b border-slate-800/50 transition-colors">
                    <button
                      type="button"
                      onClick={() => toggleSection(sec.id)}
                      className="flex items-center gap-3 text-left flex-grow focus:outline-none"
                    >
                      <div className={`p-2 rounded-xl ${sec.visible ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700/60'}`}>
                        <Layout className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold tracking-wider font-mono uppercase text-white">
                            {secIdx + 1}. {sec.name}
                          </h3>
                          {hasUnsaved && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Unsaved Changes" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">ID: {sec.id} • Section Heading and items configuration</p>
                      </div>
                    </button>

                    <div className="flex items-center gap-4">
                      {/* Visibility Switch */}
                      <button
                        onClick={() => updateSectionField(sec.id, 'visible', !sec.visible)}
                        className={`px-2.5 py-1 rounded font-bold text-[9px] uppercase tracking-wider transition-all flex items-center gap-1 border ${
                          sec.visible 
                            ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-400' 
                            : 'bg-slate-950 border-slate-800 text-slate-500'
                        }`}
                        title="Toggle visibility"
                      >
                        {sec.visible ? 'Visible' : 'Hidden'}
                      </button>

                      {/* Save Specific Section Button */}
                      <button
                        onClick={() => handleSaveSection(sec.id)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wider uppercase transition-all flex items-center gap-1 ${
                          hasUnsaved 
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950/20' 
                            : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                        }`}
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Section</span>
                      </button>

                      <button onClick={() => toggleSection(sec.id)} className="text-slate-500 text-xs">
                        {isCollapsed ? '▼' : '▲'}
                      </button>
                    </div>
                  </div>

                  {/* Section Content Editor */}
                  {!isCollapsed && (
                    <div className="p-6 space-y-4 text-xs font-semibold">
                      
                      {/* Generic Fields: Heading, Subheading, Description (where applicable) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-slate-400 uppercase tracking-wider">Section Primary Heading</label>
                          <input
                            type="text"
                            value={sec.heading || ''}
                            onChange={(e) => updateSectionField(sec.id, 'heading', e.target.value)}
                            placeholder="e.g. Deploy Automated Countermeasures"
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-slate-400 uppercase tracking-wider">Section Sub Heading</label>
                          <input
                            type="text"
                            value={sec.subHeading || ''}
                            onChange={(e) => updateSectionField(sec.id, 'subHeading', e.target.value)}
                            placeholder="e.g. INTEGRATED LEVEL 5 SOLUTION"
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-slate-400 uppercase tracking-wider">Rich Text Description / Overview</label>
                        <textarea
                          rows={3}
                          value={sec.description || ''}
                          onChange={(e) => updateSectionField(sec.id, 'description', e.target.value)}
                          placeholder="Provide the primary marketing text or technical explanation for this section..."
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all font-sans leading-relaxed"
                        />
                      </div>

                      {/* Section Image Uploader (Dedicated for every section) */}
                      <div className="pt-2 border-t border-slate-800/40">
                        <ImageUploader
                          value={sec.image || ''}
                          onChange={(url) => updateSectionField(sec.id, 'image', url)}
                          label="Section Dedicated Image"
                          placeholder="Upload or paste image URL for this section"
                        />
                      </div>

                      {/* Custom Section-Specific Renderings */}
                      
                      {/* Section 1: Hero Section Assets */}
                      {sec.id === 'hero' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div className="space-y-1.5">
                            <label className="text-slate-400 uppercase tracking-wider">Button Text CTA</label>
                            <input
                              type="text"
                              value={sec.buttonText || ''}
                              onChange={(e) => updateSectionField(sec.id, 'buttonText', e.target.value)}
                              placeholder="e.g. Deploy Solution"
                              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all"
                            />
                          </div>
                        </div>
                      )}

                      {/* Section 4: Architecture Layers Editor (Edge, AI, Cloud, Dashboard) */}
                      {sec.id === 'challenges' && (
                        <div className="space-y-4 pt-4 border-t border-slate-800/60">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Section Challenges List Items</h4>
                            <button
                              type="button"
                              onClick={() => handleAddItemToSection('challenges', { text: 'New Challenge Vulnerability' })}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold uppercase transition-all"
                            >
                              + Add Challenge Node
                            </button>
                          </div>

                          <div className="space-y-2.5">
                            {(sec.items || []).map((item, idx) => (
                              <div key={item.id || idx} className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                                <div className="text-[10px] font-mono text-slate-600 font-bold">{idx + 1}</div>
                                <input
                                  type="text"
                                  value={item.text || ''}
                                  onChange={(e) => {
                                    const updated = [...(sec.items || [])];
                                    updated[idx].text = e.target.value;
                                    updateSectionItems('challenges', updated);
                                  }}
                                  placeholder="Enter challenge description..."
                                  className="flex-grow bg-transparent outline-none text-slate-300 placeholder:text-slate-700 font-sans"
                                />
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveItem('challenges', idx, 'up')}
                                    className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === (sec.items || []).length - 1}
                                    onClick={() => handleMoveItem('challenges', idx, 'down')}
                                    className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItemFromSection('challenges', item.id, idx)}
                                    className="p-1 text-rose-500 hover:text-rose-400"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section 6: Key Features Cards */}
                      {sec.id === 'features' && (
                        <div className="space-y-4 pt-4 border-t border-slate-800/60">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Features Cards List</h4>
                            <button
                              type="button"
                              onClick={() => handleAddItemToSection('features', { title: 'New Advanced Feature', desc: 'Brief description of features capability.', icon: 'Shield' })}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold uppercase transition-all"
                            >
                              + Add Feature Card
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(sec.items || []).map((item, idx) => (
                              <div key={item.id || idx} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3 relative group">
                                <div className="flex items-center justify-between">
                                  <select
                                    value={item.icon || 'Shield'}
                                    onChange={(e) => {
                                      const updated = [...(sec.items || [])];
                                      updated[idx].icon = e.target.value;
                                      updateSectionItems('features', updated);
                                    }}
                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-400 font-mono text-[10px]"
                                  >
                                    {AVAILABLE_ICONS.map(ic => (
                                      <option key={ic} value={ic}>{ic}</option>
                                    ))}
                                  </select>

                                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-all">
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() => handleMoveItem('features', idx, 'up')}
                                      className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30"
                                    >
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={idx === (sec.items || []).length - 1}
                                      onClick={() => handleMoveItem('features', idx, 'down')}
                                      className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30"
                                    >
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveItemFromSection('features', item.id, idx)}
                                      className="p-1 text-rose-500 hover:text-rose-400"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="space-y-1.5">
                                  <input
                                    type="text"
                                    value={item.title || ''}
                                    onChange={(e) => {
                                      const updated = [...(sec.items || [])];
                                      updated[idx].title = e.target.value;
                                      updateSectionItems('features', updated);
                                    }}
                                    placeholder="Feature Title..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-200"
                                  />
                                  <textarea
                                    rows={2}
                                    value={item.desc || ''}
                                    onChange={(e) => {
                                      const updated = [...(sec.items || [])];
                                      updated[idx].desc = e.target.value;
                                      updateSectionItems('features', updated);
                                    }}
                                    placeholder="Feature description text..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-400"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section 5: Step-by-Step Workflow steps */}
                      {sec.id === 'workflow' && (
                        <div className="space-y-4 pt-4 border-t border-slate-800/60">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Deployment Workflow Pipeline</h4>
                            <button
                              type="button"
                              onClick={() => handleAddItemToSection('workflow', { step: '01', title: 'New Workflow Phase', desc: 'Detail step execution parameters.' })}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold uppercase transition-all"
                            >
                              + Add Workflow Step
                            </button>
                          </div>

                          <div className="space-y-3">
                            {(sec.items || []).map((item, idx) => (
                              <div key={item.id || idx} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center gap-4 group">
                                <div className="text-lg font-black text-indigo-400 font-mono tracking-wider">
                                  {item.step || `0${idx + 1}`}
                                </div>

                                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                                  <input
                                    type="text"
                                    value={item.title || ''}
                                    onChange={(e) => {
                                      const updated = [...(sec.items || [])];
                                      updated[idx].title = e.target.value;
                                      updateSectionItems('workflow', updated);
                                    }}
                                    placeholder="Step Title..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200"
                                  />
                                  <input
                                    type="text"
                                    value={item.desc || ''}
                                    onChange={(e) => {
                                      const updated = [...(sec.items || [])];
                                      updated[idx].desc = e.target.value;
                                      updateSectionItems('workflow', updated);
                                    }}
                                    placeholder="Step description..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-400"
                                  />
                                </div>

                                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-all self-end md:self-auto">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveItem('workflow', idx, 'up')}
                                    className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === (sec.items || []).length - 1}
                                    onClick={() => handleMoveItem('workflow', idx, 'down')}
                                    className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItemFromSection('workflow', item.id, idx)}
                                    className="p-1 text-rose-500 hover:text-rose-400"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section 7: Quantifiable Benefits */}
                      {sec.id === 'benefits' && (
                        <div className="space-y-4 pt-4 border-t border-slate-800/60">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Return on Investment Benefits (Metrics Cards)</h4>
                            <button
                              type="button"
                              onClick={() => handleAddItemToSection('benefits', { metric: '99%', label: 'Efficiency Improvement' })}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold uppercase transition-all"
                            >
                              + Add Metric Benefit
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {(sec.items || []).map((item, idx) => (
                              <div key={item.id || idx} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2 relative group">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Metric Card</span>
                                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-all">
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() => handleMoveItem('benefits', idx, 'up')}
                                      className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30"
                                    >
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={idx === (sec.items || []).length - 1}
                                      onClick={() => handleMoveItem('benefits', idx, 'down')}
                                      className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30"
                                    >
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveItemFromSection('benefits', item.id, idx)}
                                      className="p-1 text-rose-500 hover:text-rose-400"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="space-y-1.5">
                                  <input
                                    type="text"
                                    value={item.metric || ''}
                                    onChange={(e) => {
                                      const updated = [...(sec.items || [])];
                                      updated[idx].metric = e.target.value;
                                      updateSectionItems('benefits', updated);
                                    }}
                                    placeholder="Value (e.g. 99.8% or < 1s)..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-200 font-mono font-bold text-center text-xs"
                                  />
                                  <input
                                    type="text"
                                    value={item.label || ''}
                                    onChange={(e) => {
                                      const updated = [...(sec.items || [])];
                                      updated[idx].label = e.target.value;
                                      updateSectionItems('benefits', updated);
                                    }}
                                    placeholder="Metric Label (e.g. Reduction rate)..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-400 text-center"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section 8: Core AI Modules */}
                      {sec.id === 'ai-modules' && (
                        <div className="space-y-4 pt-4 border-t border-slate-800/60">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Deep Learning Core AI Models</h4>
                            <button
                              type="button"
                              onClick={() => handleAddItemToSection('ai-modules', { name: 'NX-VisionModel', type: 'Classification Engine', accuracy: '95%' })}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold uppercase transition-all"
                            >
                              + Add Core AI Model
                            </button>
                          </div>

                          <div className="space-y-2.5">
                            {(sec.items || []).map((item, idx) => (
                              <div key={item.id || idx} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 relative group">
                                <div className="space-y-1">
                                  <label className="text-[9px] text-slate-500 uppercase">Model Identifier Name</label>
                                  <input
                                    type="text"
                                    value={item.name || ''}
                                    onChange={(e) => {
                                      const updated = [...(sec.items || [])];
                                      updated[idx].name = e.target.value;
                                      updateSectionItems('ai-modules', updated);
                                    }}
                                    placeholder="Model Code name..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-200 font-mono"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] text-slate-500 uppercase">Model Framework Type</label>
                                  <input
                                    type="text"
                                    value={item.type || ''}
                                    onChange={(e) => {
                                      const updated = [...(sec.items || [])];
                                      updated[idx].type = e.target.value;
                                      updateSectionItems('ai-modules', updated);
                                    }}
                                    placeholder="Framework details..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-400"
                                  />
                                </div>
                                <div className="space-y-1 flex items-center justify-between gap-2">
                                  <div className="flex-grow">
                                    <label className="text-[9px] text-slate-500 uppercase">Target Accuracy Score</label>
                                    <input
                                      type="text"
                                      value={item.accuracy || ''}
                                      onChange={(e) => {
                                        const updated = [...(sec.items || [])];
                                        updated[idx].accuracy = e.target.value;
                                        updateSectionItems('ai-modules', updated);
                                      }}
                                      placeholder="Accuracy percent..."
                                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-emerald-400 font-bold"
                                    />
                                  </div>
                                  <div className="flex items-center gap-1 opacity-65 group-hover:opacity-100 transition-all self-end pb-1">
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() => handleMoveItem('ai-modules', idx, 'up')}
                                      className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30"
                                    >
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={idx === (sec.items || []).length - 1}
                                      onClick={() => handleMoveItem('ai-modules', idx, 'down')}
                                      className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30"
                                    >
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveItemFromSection('ai-modules', item.id, idx)}
                                      className="p-1 text-rose-500 hover:text-rose-400"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section 8: Hardware requirements */}
                      {sec.id === 'hardware' && (
                        <div className="space-y-4 pt-4 border-t border-slate-800/60">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Supported Hardware Infrastructure</h4>
                            <button
                              type="button"
                              onClick={() => handleAddItemToSection('hardware', { name: 'NX Edge Camera Unit', specs: '12MP, PoE Connection' })}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold uppercase transition-all"
                            >
                              + Add Hardware Item
                            </button>
                          </div>

                          <div className="space-y-3">
                            {(sec.items || []).map((item, idx) => (
                              <div key={item.id || idx} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center gap-4 group">
                                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                                  <input
                                    type="text"
                                    value={item.name || ''}
                                    onChange={(e) => {
                                      const updated = [...(sec.items || [])];
                                      updated[idx].name = e.target.value;
                                      updateSectionItems('hardware', updated);
                                    }}
                                    placeholder="Device Hardware Name..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 font-bold"
                                  />
                                  <input
                                    type="text"
                                    value={item.specs || ''}
                                    onChange={(e) => {
                                      const updated = [...(sec.items || [])];
                                      updated[idx].specs = e.target.value;
                                      updateSectionItems('hardware', updated);
                                    }}
                                    placeholder="Device specifications details..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-400"
                                  />
                                </div>

                                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-all self-end md:self-auto">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveItem('hardware', idx, 'up')}
                                    className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === (sec.items || []).length - 1}
                                    onClick={() => handleMoveItem('hardware', idx, 'down')}
                                    className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItemFromSection('hardware', item.id, idx)}
                                    className="p-1 text-rose-500 hover:text-rose-400"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section 9: Software Requirements */}
                      {sec.id === 'software' && (
                        <div className="space-y-4 pt-4 border-t border-slate-800/60">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Supported Software requirements</h4>
                            <button
                              type="button"
                              onClick={() => handleAddItemToSection('software', { name: 'NX Admin Dashboard client', platform: 'CentOS / CentOS / Windows' })}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold uppercase transition-all"
                            >
                              + Add Software Client
                            </button>
                          </div>

                          <div className="space-y-3">
                            {(sec.items || []).map((item, idx) => (
                              <div key={item.id || idx} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center gap-4 group">
                                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                                  <input
                                    type="text"
                                    value={item.name || ''}
                                    onChange={(e) => {
                                      const updated = [...(sec.items || [])];
                                      updated[idx].name = e.target.value;
                                      updateSectionItems('software', updated);
                                    }}
                                    placeholder="Software System console name..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 font-bold"
                                  />
                                  <input
                                    type="text"
                                    value={item.platform || ''}
                                    onChange={(e) => {
                                      const updated = [...(sec.items || [])];
                                      updated[idx].platform = e.target.value;
                                      updateSectionItems('software', updated);
                                    }}
                                    placeholder="Operative Platform requirements..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-400"
                                  />
                                </div>

                                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-all self-end md:self-auto">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveItem('software', idx, 'up')}
                                    className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === (sec.items || []).length - 1}
                                    onClick={() => handleMoveItem('software', idx, 'down')}
                                    className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItemFromSection('software', item.id, idx)}
                                    className="p-1 text-rose-500 hover:text-rose-400"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section 10: Case Studies and Success Stories */}
                      {sec.id === 'case-study' && (
                        <div className="space-y-4 pt-4 border-t border-slate-800/60">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Section Case Study Data Metrics</h4>
                            <button
                              type="button"
                              onClick={() => handleAddItemToSection('case-study', { label: 'Metric/Header', value: 'Data Value detail' })}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold uppercase transition-all"
                            >
                              + Add Case Metric
                            </button>
                          </div>

                          <div className="space-y-3">
                            {(sec.items || []).map((item, idx) => (
                              <div key={item.id || idx} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center gap-4 group">
                                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                                  <input
                                    type="text"
                                    value={item.label || ''}
                                    onChange={(e) => {
                                      const updated = [...(sec.items || [])];
                                      updated[idx].label = e.target.value;
                                      updateSectionItems('case-study', updated);
                                    }}
                                    placeholder="e.g. Client Name or Metric Header..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-300 font-extrabold"
                                  />
                                  <input
                                    type="text"
                                    value={item.value || ''}
                                    onChange={(e) => {
                                      const updated = [...(sec.items || [])];
                                      updated[idx].value = e.target.value;
                                      updateSectionItems('case-study', updated);
                                    }}
                                    placeholder="e.g. Delhi High School or 98% Decrease..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-400"
                                  />
                                </div>

                                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-all self-end md:self-auto">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveItem('case-study', idx, 'up')}
                                    className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === (sec.items || []).length - 1}
                                    onClick={() => handleMoveItem('case-study', idx, 'down')}
                                    className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItemFromSection('case-study', item.id, idx)}
                                    className="p-1 text-rose-500 hover:text-rose-400"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section 11: Frequently Asked Questions FAQ */}
                      {sec.id === 'faqs' && (
                        <div className="space-y-4 pt-4 border-t border-slate-800/60">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Frequently Asked Questions list</h4>
                            <button
                              type="button"
                              onClick={() => handleAddItemToSection('faqs', { q: 'New FAQ Question?', a: 'Detailed answer response parameter.' })}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold uppercase transition-all"
                            >
                              + Add New FAQ
                            </button>
                          </div>

                          <div className="space-y-3.5">
                            {(sec.items || []).map((item, idx) => (
                              <div key={item.id || idx} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3 relative group">
                                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                                  <span className="text-[10px] font-bold font-mono text-slate-500">FAQ NODE #{idx + 1}</span>
                                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-all">
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() => handleMoveItem('faqs', idx, 'up')}
                                      className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30"
                                    >
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={idx === (sec.items || []).length - 1}
                                      onClick={() => handleMoveItem('faqs', idx, 'down')}
                                      className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30"
                                    >
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveItemFromSection('faqs', item.id, idx)}
                                      className="p-1 text-rose-500 hover:text-rose-400"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="space-y-2.5">
                                  <input
                                    type="text"
                                    value={item.q || ''}
                                    onChange={(e) => {
                                      const updated = [...(sec.items || [])];
                                      updated[idx].q = e.target.value;
                                      updateSectionItems('faqs', updated);
                                    }}
                                    placeholder="FAQ Question text..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 font-extrabold"
                                  />
                                  <textarea
                                    rows={2}
                                    value={item.a || ''}
                                    onChange={(e) => {
                                      const updated = [...(sec.items || [])];
                                      updated[idx].a = e.target.value;
                                      updateSectionItems('faqs', updated);
                                    }}
                                    placeholder="FAQ Answer details..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-400"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section 12: CTA Buttons */}
                      {sec.id === 'cta' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div className="space-y-1.5">
                            <label className="text-slate-400 uppercase tracking-wider">Button CTA Text</label>
                            <input
                              type="text"
                              value={sec.buttonText || ''}
                              onChange={(e) => updateSectionField(sec.id, 'buttonText', e.target.value)}
                              placeholder="e.g. Request assessment"
                              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-slate-400 uppercase tracking-wider">Button CTA Link</label>
                            <input
                              type="text"
                              value={sec.buttonUrl || ''}
                              onChange={(e) => updateSectionField(sec.id, 'buttonUrl', e.target.value)}
                              placeholder="e.g. /leads/consulting"
                              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all"
                            />
                          </div>
                        </div>
                      )}

                      {/* Section 13: Enterprise Lead Form fields setup */}
                      {sec.id === 'lead-form' && (
                        <div className="space-y-4 pt-4 border-t border-slate-800/60">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-slate-400 uppercase tracking-wider">CTA Button Text inside Form</label>
                              <input
                                type="text"
                                value={sec.buttonText || ''}
                                onChange={(e) => updateSectionField(sec.id, 'buttonText', e.target.value)}
                                placeholder="e.g. Submit Consultation Request"
                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-slate-400 uppercase tracking-wider">Form Success message</label>
                              <input
                                type="text"
                                value={sec.buttonUrl || ''} // Reusing buttonUrl to store success message safely
                                onChange={(e) => updateSectionField(sec.id, 'buttonUrl', e.target.value)}
                                placeholder="e.g. Thank you! Our security architect will reach out within 1 business hour."
                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all"
                              />
                            </div>
                          </div>

                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 pt-2">Form Fields Config & Validation Rules</h4>
                          
                          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 divide-y divide-slate-900">
                            {[
                              { label: 'Full Visitor Name', field: 'name' },
                              { label: 'Corporate Email', field: 'email' },
                              { label: 'Phone Number', field: 'phone' },
                              { label: 'Company Brand Name', field: 'company' },
                              { label: 'Work Designation', field: 'designation' },
                              { label: 'Organization Level', field: 'organization' },
                              { label: 'Location City', field: 'city' },
                              { label: 'Location State', field: 'state' },
                              { label: 'Location Country', field: 'country' },
                              { label: 'Requirement Message', field: 'message' }
                            ].map((fld) => {
                              const currentStatus = getLeadFieldStatus(fld.field, sec.items || []);
                              return (
                                <div key={fld.field} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-medium text-slate-300">
                                  <span>{fld.label}</span>
                                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateLeadFieldStatus(fld.field, 'required', sec.items || [])}
                                      className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md transition-colors ${currentStatus === 'required' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                      Required
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateLeadFieldStatus(fld.field, 'optional', sec.items || [])}
                                      className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md transition-colors ${currentStatus === 'optional' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                      Optional
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateLeadFieldStatus(fld.field, 'hidden', sec.items || [])}
                                      className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md transition-colors ${currentStatus === 'hidden' ? 'bg-slate-800 text-slate-300' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                      Hidden
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}

            {/* CARD: SEO Parameters */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <button
                onClick={() => toggleSection('seo')}
                className="w-full bg-slate-950/60 hover:bg-slate-900/80 px-6 py-4 flex items-center justify-between border-b border-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="p-2 bg-slate-800 border border-slate-700/60 rounded-xl text-slate-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold tracking-wider font-mono uppercase text-white">
                      SEO & Social Metadata Parameters
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">Configure meta titles, tags, and indexing rules</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded font-mono uppercase font-bold">SEO Config</span>
                  <span className="text-slate-500 text-xs">{collapsedSections['seo'] ? '▼' : '▲'}</span>
                </div>
              </button>

              {!collapsedSections['seo'] && (
                <div className="p-6 space-y-4 text-xs font-semibold">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-400 uppercase tracking-wider">Meta Title Tag</label>
                      <input
                        type="text"
                        value={solution?.seo?.metaTitle || ''}
                        onChange={(e) => {
                          setSolution(prev => prev ? { ...prev, seo: { ...prev.seo, metaTitle: e.target.value } } : null);
                          setUnsavedSections(prev => ({ ...prev, 'seo': true }));
                        }}
                        placeholder="Google Search result title header..."
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 uppercase tracking-wider">Robots Indexing Directive</label>
                      <input
                        type="text"
                        value={solution?.seo?.robots || 'index, follow'}
                        onChange={(e) => {
                          setSolution(prev => prev ? { ...prev, seo: { ...prev.seo, robots: e.target.value } } : null);
                          setUnsavedSections(prev => ({ ...prev, 'seo': true }));
                        }}
                        placeholder="e.g. index, follow or noindex, nofollow"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-400 uppercase tracking-wider">Canonical URL Link</label>
                      <input
                        type="text"
                        value={solution?.seo?.canonicalUrl || ''}
                        onChange={(e) => {
                          setSolution(prev => prev ? { ...prev, seo: { ...prev.seo, canonicalUrl: e.target.value } } : null);
                          setUnsavedSections(prev => ({ ...prev, 'seo': true }));
                        }}
                        placeholder="https://nxsolution.in/industries/..."
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all font-mono"
                      />
                    </div>

                    <ImageUploader
                      value={solution?.seo?.openGraphImage || ''}
                      onChange={(url) => {
                        setSolution(prev => prev ? { ...prev, seo: { ...prev.seo, openGraphImage: url } } : null);
                        setUnsavedSections(prev => ({ ...prev, 'seo': true }));
                      }}
                      label="Open Graph Image (OG Image)"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 uppercase tracking-wider">SEO Keywords (comma separated)</label>
                    <input
                      type="text"
                      value={solution?.seo?.keywords || ''}
                      onChange={(e) => {
                        setSolution(prev => prev ? { ...prev, seo: { ...prev.seo, keywords: e.target.value } } : null);
                        setUnsavedSections(prev => ({ ...prev, 'seo': true }));
                      }}
                      placeholder="e.g. cctv, security analytics, intrusion detection..."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 uppercase tracking-wider">Meta Description Description</label>
                    <textarea
                      rows={3}
                      value={solution?.seo?.metaDescription || ''}
                      onChange={(e) => {
                        setSolution(prev => prev ? { ...prev, seo: { ...prev.seo, metaDescription: e.target.value } } : null);
                        setUnsavedSections(prev => ({ ...prev, 'seo': true }));
                      }}
                      placeholder="Provide target 150-160 characters summary for Search results snippets..."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all font-sans leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => handleSaveSection('seo')}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase transition-all flex items-center gap-1.5 ${
                        unsavedSections['seo'] 
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                      }`}
                    >
                      <Save className="w-4 h-4" />
                      <span>Save SEO Section</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </main>

      {/* Footer System Credits */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 px-6 mt-12 text-center text-[11px] text-slate-500 font-mono">
        <p>NX ENTERPRISE HIERARCHY CMS ENGINE • VERSION 4.2.5 • LIVE SYNC ACTIVE</p>
      </footer>
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete Solution Engine"
        itemName={solutionTitle || module?.name}
        message={`Are you sure you want to permanently delete the Solution Engine portal for "${solutionTitle || module?.name}"?`}
        isDeleting={deleteModal.isDeleting}
        onConfirm={handleConfirmDeleteSolution}
        onCancel={() => setDeleteModal({ isOpen: false, isDeleting: false })}
      />
    </div>
  );
}
