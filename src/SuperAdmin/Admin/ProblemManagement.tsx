import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, Edit2, Trash2, Copy, Eye, EyeOff, Search, ArrowLeft, 
  Cpu, Save, X, Globe, Sliders, FileText, AlertCircle, RefreshCw, 
  ArrowRight, Shield, Layers, HelpCircle, Check, Sparkles, AlertTriangle, Trash
} from 'lucide-react';
import { apiService } from '../../Public/Services/api';
import { Industry, Institution, Zone, Problem } from '../../types';
import ImageUploader from '../../Public/Components/ImageUploader';

import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function ProblemManagement() {
  const { areaId } = useParams<{ areaId: string }>();
  const navigate = useNavigate();

  const [industry, setIndustry] = useState<Industry | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [area, setArea] = useState<Zone | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'media' | 'seo' | 'cta'>('details');

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    ids: string[];
    name: string;
    blockedMessage: string | null;
    isDeleting: boolean;
  }>({
    isOpen: false,
    ids: [],
    name: '',
    blockedMessage: null,
    isDeleting: false,
  });

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCardImage, setFormCardImage] = useState('');
  const [formBannerImage, setFormBannerImage] = useState('');
  const [formIcon, setFormIcon] = useState('AlertTriangle');
  const [formSeverity, setFormSeverity] = useState('Medium');
  const [formPriority, setFormPriority] = useState('Medium');
  const [formCategory, setFormCategory] = useState('Security');
  const [formRiskLevel, setFormRiskLevel] = useState('Medium');
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<'draft' | 'published' | 'archived'>('published');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formSortOrder, setFormSortOrder] = useState<number>(0);

  // SEO
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDesc, setFormSeoDesc] = useState('');
  const [formSeoKeywords, setFormSeoKeywords] = useState('');

  // CTA
  const [formCtaText, setFormCtaText] = useState('Open Solution Details');
  const [formCtaLink, setFormCtaLink] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Sorting State
  const [sortField, setSortField] = useState<keyof Problem>('sortOrder');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter State
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  // Bulk Actions Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (areaId) {
      fetchData();
    }
  }, [areaId]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Load Parent Area (Zone)
      const allZones = await apiService.getAdminZones();
      const matchedZone = allZones.find((z: any) => z.id === areaId);
      
      if (!matchedZone) {
        setError('The specified facility Area node was not found.');
        setLoading(false);
        return;
      }
      setArea(matchedZone);

      // 2. Load Parent Institution and Industry
      const allInstitutions = await apiService.getAdminInstitutions();
      const matchedInstitution = allInstitutions.find((inst: any) => inst.id === matchedZone.institutionId);
      if (matchedInstitution) {
        setInstitution(matchedInstitution);
        const allIndustries = await apiService.getAdminIndustries();
        const matchedIndustry = allIndustries.find((ind: any) => ind.id === matchedInstitution.industryId);
        if (matchedIndustry) {
          setIndustry(matchedIndustry);
        }
      }

      // 3. Load problems belonging to this Area
      // Uses the robust backend getAdminProblems(zoneId) route which we optimized
      const problemsList = await apiService.getAdminProblems(areaId);
      setProblems(problemsList);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('An error occurred while loading the parent hierarchy and problem records.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate Slug on name change for new creation
  useEffect(() => {
    if (!editingId && formName) {
      const generated = formName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormSlug(generated);
    }
  }, [formName, editingId]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormName('');
    setFormSlug('');
    setFormShortDesc('');
    setFormDesc('');
    setFormCardImage('https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=600&auto=format&fit=crop');
    setFormBannerImage('');
    setFormIcon('AlertTriangle');
    setFormSeverity('Medium');
    setFormPriority('Medium');
    setFormCategory('Security');
    setFormRiskLevel('Medium');
    setFormDisplayOrder(problems.length + 1);
    setFormStatus('published');
    setFormFeatured(false);
    setFormSortOrder(problems.length + 1);
    setFormSeoTitle('');
    setFormSeoDesc('');
    setFormSeoKeywords('');
    setFormCtaText('Open Solution Details');
    setFormCtaLink('');
    setActiveTab('details');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prob: Problem) => {
    setEditingId(prob.id);
    setFormName(prob.name);
    setFormSlug(prob.slug);
    setFormShortDesc(prob.shortDescription || '');
    setFormDesc(prob.description || '');
    setFormCardImage(prob.cardImage || prob.image || '');
    setFormBannerImage(prob.bannerImage || '');
    setFormIcon(prob.icon || 'AlertTriangle');
    setFormSeverity(prob.severity || 'Medium');
    setFormPriority(prob.priority || 'Medium');
    setFormCategory(prob.category || 'Security');
    setFormRiskLevel(prob.riskLevel || 'Medium');
    setFormDisplayOrder(prob.displayOrder ?? prob.sortOrder ?? 0);
    setFormStatus(prob.status || 'published');
    setFormFeatured(prob.featured === true || prob.isFeatured === true);
    setFormSortOrder(prob.sortOrder ?? 0);
    setFormSeoTitle(prob.seo?.metaTitle || '');
    setFormSeoDesc(prob.seo?.metaDescription || '');
    setFormSeoKeywords(prob.seo?.keywords || '');
    setFormCtaText(prob.cta?.buttonText || 'Open Solution Details');
    setFormCtaLink(prob.cta?.buttonLink || '');
    setActiveTab('details');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formSlug) {
      showToast('error', 'Problem Name and Slug are required fields.');
      return;
    }

    const payload: Partial<Problem> = {
      id: editingId || undefined,
      industryId: industry?.id || area?.industryId || '',
      institutionId: institution?.id || area?.institutionId || '',
      zoneId: areaId,
      areaId: areaId,
      name: formName,
      slug: formSlug,
      description: formDesc,
      shortDescription: formShortDesc,
      cardImage: formCardImage,
      image: formCardImage,
      bannerImage: formBannerImage,
      icon: formIcon,
      severity: formSeverity,
      priority: formPriority,
      category: formCategory,
      riskLevel: formRiskLevel,
      status: formStatus,
      featured: formFeatured,
      isFeatured: formFeatured,
      sortOrder: Number(formSortOrder),
      displayOrder: Number(formDisplayOrder),
      seo: {
        metaTitle: formSeoTitle || formName,
        metaDescription: formSeoDesc || formShortDesc,
        keywords: formSeoKeywords
      },
      cta: {
        buttonText: formCtaText,
        buttonLink: formCtaLink
      }
    };

    try {
      await apiService.saveProblem(payload);
      setIsModalOpen(false);
      showToast('success', editingId ? 'Problem workspace updated.' : 'New Problem node successfully registered.');
      fetchData();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'An error occurred while saving the Problem record.';
      showToast('error', errMsg);
    }
  };

  const openDeleteModal = (id: string, name: string) => {
    const matched = problems.find(p => p.id === id);
    const blockedMessage = matched && (matched as any).hasSolution
      ? `Cannot delete "${name}": This Problem already contains an active Solution. Please remove the Solution first before deleting this Problem.`
      : null;

    setDeleteModal({
      isOpen: true,
      ids: [id],
      name,
      blockedMessage,
      isDeleting: false,
    });
  };

  const openBulkDeleteModal = () => {
    if (selectedIds.length === 0) return;

    const withSolution = selectedIds.filter(id => {
      const p = problems.find(prob => prob.id === id);
      return p && (p as any).hasSolution;
    });

    const blockedMessage = withSolution.length > 0
      ? `Cannot delete selected items: ${withSolution.length} of the selected Problem(s) contain active Solutions. Please remove their Solutions first.`
      : null;

    setDeleteModal({
      isOpen: true,
      ids: selectedIds,
      name: `${selectedIds.length} Selected Problems`,
      blockedMessage,
      isDeleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.ids.length === 0) return;
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    try {
      let count = 0;
      for (const id of deleteModal.ids) {
        await apiService.deleteProblem(id);
        count++;
      }
      showToast('success', `${count === 1 ? 'Problem record' : `${count} Problem nodes`} deleted successfully.`);
      setSelectedIds([]);
      setDeleteModal({ isOpen: false, ids: [], name: '', blockedMessage: null, isDeleting: false });
      fetchData();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Failed to delete Problem record(s). Please try again.';
      showToast('error', errMsg);
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDuplicate = async (prob: Problem) => {
    const duplicated: Partial<Problem> = {
      industryId: prob.industryId,
      institutionId: prob.institutionId,
      zoneId: prob.zoneId,
      areaId: prob.areaId,
      name: `${prob.name} (Copy)`,
      slug: `${prob.slug}-copy`,
      description: prob.description,
      shortDescription: prob.shortDescription,
      cardImage: prob.cardImage || prob.image,
      image: prob.image || prob.cardImage,
      bannerImage: prob.bannerImage,
      icon: prob.icon || 'AlertTriangle',
      severity: prob.severity || 'Medium',
      priority: prob.priority || 'Medium',
      category: prob.category || 'Security',
      riskLevel: prob.riskLevel || 'Medium',
      status: 'draft',
      featured: prob.featured === true || prob.isFeatured === true,
      isFeatured: prob.featured === true || prob.isFeatured === true,
      sortOrder: problems.length + 1,
      displayOrder: problems.length + 1,
      seo: prob.seo ? { ...prob.seo } : undefined,
      cta: prob.cta ? { ...prob.cta } : undefined
    };

    try {
      await apiService.saveProblem(duplicated);
      showToast('success', `Duplicated "${prob.name}". Solution mapping was reset.`);
      fetchData();
    } catch (err: any) {
      showToast('error', 'Failed to duplicate Problem.');
    }
  };

  const handleToggleStatus = async (prob: Problem) => {
    const newStatus = prob.status === 'published' ? 'draft' : 'published';
    try {
      await apiService.saveProblem({
        ...prob,
        status: newStatus
      });
      showToast('success', `Status updated to ${newStatus}.`);
      fetchData();
    } catch (err: any) {
      showToast('error', 'Failed to change publication status.');
    }
  };

  // Sort helper
  const handleSort = (field: keyof Problem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter & Search logic
  const filteredProblems = problems.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.shortDescription || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ? true : p.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' ? true : (p.severity || 'Medium').toLowerCase() === severityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  // Sort logic
  const sortedProblems = [...filteredProblems].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (valA === undefined) valA = '';
    if (valB === undefined) valB = '';

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortDirection === 'asc' 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA);
    } else {
      return sortDirection === 'asc' 
        ? (valA as number) - (valB as number) 
        : (valB as number) - (valA as number);
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedProblems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProblems = sortedProblems.slice(indexOfFirstItem, indexOfLastItem);

  // Bulk operations helpers
  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === currentProblems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentProblems.map(p => p.id));
    }
  };

  const handleBulkStatusChange = async (newStatus: 'published' | 'draft') => {
    if (selectedIds.length === 0) return;
    try {
      let count = 0;
      for (const id of selectedIds) {
        const prob = problems.find(p => p.id === id);
        if (prob) {
          await apiService.saveProblem({ ...prob, status: newStatus });
          count++;
        }
      }
      showToast('success', `Bulk operation successful: ${count} problems modified.`);
      setSelectedIds([]);
      fetchData();
    } catch (err) {
      showToast('error', 'Error occurred during bulk action.');
    }
  };

  const handleBulkDelete = () => {
    openBulkDeleteModal();
  };

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
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/superadmin/admin/institutions/${area?.institutionId}/areas`)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
            title="Return to Area Hierarchy"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-wider font-mono text-white">NX CMS ARCHITECT</h1>
              <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-widest">Problem Manager • Level 4</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-950/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Problem Node</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Dynamic Context Breadcrumbs Card */}
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
              <span className="text-indigo-400 font-extrabold font-mono uppercase">Problems</span>
            </div>

            {/* Hierarchical metadata layout */}
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
                <span className="text-xs font-extrabold text-emerald-400 font-mono">{area?.name || 'Loading...'}</span>
              </div>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight pt-1">
              Vulnerability Problem Workspace
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Define the architectural problems and technical threats that occur inside <span className="text-emerald-400 font-bold">{area?.name}</span>. Every registered Problem module maps to a Level 5 Solution containing visual deployment cards, integrations, and FAQs.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search Problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-200 outline-none transition-all placeholder:text-slate-600 font-medium"
            />
          </div>
        </div>

        {/* Filters and Bulk Actions Toolbar */}
        <div className="bg-slate-900/20 border border-slate-900 px-6 py-3.5 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <span className="text-slate-500 font-black uppercase tracking-wider text-[10px]">Filter Stack:</span>
            
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Status:</span>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-300 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
              >
                <option value="all">All States</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Severity:</span>
              <select 
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-300 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Selected Bulk Operations Banner */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 bg-indigo-950/40 border border-indigo-500/20 px-3.5 py-1.5 rounded-lg text-xs">
              <span className="text-indigo-400 font-bold font-mono">SELECTED: {selectedIds.length}</span>
              <span className="text-slate-600">|</span>
              <button 
                onClick={() => handleBulkStatusChange('published')}
                className="text-emerald-400 hover:text-emerald-300 hover:underline text-[11px] font-bold uppercase tracking-wider"
              >
                Publish All
              </button>
              <button 
                onClick={() => handleBulkStatusChange('draft')}
                className="text-amber-400 hover:text-amber-300 hover:underline text-[11px] font-bold uppercase tracking-wider ml-2"
              >
                Draft All
              </button>
              <button 
                onClick={handleBulkDelete}
                className="text-rose-400 hover:text-rose-300 hover:underline text-[11px] font-bold uppercase tracking-wider ml-2 flex items-center gap-1"
              >
                <Trash className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          )}

          <div className="text-[10px] text-slate-500 font-mono">
            {filteredProblems.length === problems.length ? `TOTAL: ${problems.length}` : `MATCHED: ${filteredProblems.length} / ${problems.length}`}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/20 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-xs font-bold">
            <AlertCircle className="w-5 h-5 flex-shrink-0 animate-pulse" />
            <span>{error}</span>
          </div>
        )}

        {/* Problems List Workspace */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
            <span className="text-xs text-slate-400 font-mono">Aligning telemetry variables...</span>
          </div>
        ) : sortedProblems.length === 0 ? (
          <div className="bg-slate-900/20 border border-slate-800 rounded-2xl py-20 text-center">
            <div className="w-12 h-12 bg-slate-900 border border-slate-800 text-slate-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-300 font-mono uppercase">No problems registered in this Area</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              {searchTerm || statusFilter !== 'all' || severityFilter !== 'all'
                ? 'No problems matched your selected search criteria.'
                : 'Click "New Problem Node" above to isolate your first Level 4 security problem.'}
            </p>
          </div>
        ) : (
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/60 bg-slate-900/60 text-slate-400 text-[10px] uppercase font-extrabold tracking-widest">
                    <th className="py-4 px-6 w-10 text-center">
                      <input 
                        type="checkbox"
                        checked={selectedIds.length === currentProblems.length && currentProblems.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded bg-slate-900 border-slate-800 focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="py-4 px-6 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('name')}>Problem / Icon</th>
                    <th className="py-4 px-6 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('severity')}>Severity</th>
                    <th className="py-4 px-6">Slug/URL Relationship</th>
                    <th className="py-4 px-6 text-center">Solution Indicator</th>
                    <th className="py-4 px-6 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('status')}>Status</th>
                    <th className="py-4 px-6 text-right">Workspace actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-xs text-slate-300">
                  {currentProblems.map((prob) => {
                    const isSelected = selectedIds.includes(prob.id);
                    const hasSolution = (prob as any).hasSolution;
                    return (
                      <tr key={prob.id} className={`hover:bg-slate-900/20 group transition-all ${isSelected ? 'bg-indigo-950/10' : ''}`}>
                        
                        {/* Checkbox */}
                        <td className="py-4 px-6 text-center">
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(prob.id)}
                            className="rounded bg-slate-900 border-slate-800 focus:ring-0 cursor-pointer"
                          />
                        </td>

                        {/* Problem name */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex-shrink-0 relative">
                              {prob.cardImage || prob.image ? (
                                <img 
                                  src={prob.cardImage || prob.image} 
                                  alt={prob.name} 
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900">
                                  <Cpu className="w-5 h-5" />
                                </div>
                              )}
                              {prob.featured && (
                                <span className="absolute bottom-0 right-0 bg-amber-500 text-slate-950 text-[8px] font-black uppercase px-1 rounded-tl-md tracking-widest">F</span>
                              )}
                            </div>
                            <div>
                              <div className="font-extrabold text-white group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                                <span>{prob.name}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 max-w-xs truncate mt-0.5" title={prob.shortDescription}>
                                {prob.shortDescription || 'No description provided'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Severity */}
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            (prob.severity || 'Medium').toLowerCase() === 'critical'
                              ? 'bg-rose-950/60 border border-rose-500/30 text-rose-400 animate-pulse'
                              : (prob.severity || 'Medium').toLowerCase() === 'high'
                              ? 'bg-orange-950/60 border border-orange-500/30 text-orange-400'
                              : (prob.severity || 'Medium').toLowerCase() === 'low'
                              ? 'bg-slate-800 border border-slate-700 text-slate-400'
                              : 'bg-indigo-950/60 border border-indigo-500/30 text-indigo-400'
                          }`}>
                            {prob.severity || 'Medium'}
                          </span>
                        </td>

                        {/* URL Relation */}
                        <td className="py-4 px-6 font-mono text-[10px] text-slate-500">
                          <div className="max-w-xs truncate" title={`/industries/${industry?.slug}/${institution?.slug}/${area?.slug}/${prob.slug}`}>
                            /{prob.slug}
                          </div>
                        </td>

                        {/* Has Solution Indicator */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center">
                            {hasSolution ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full font-bold text-[9px] uppercase tracking-wider">
                                <Check className="w-3 h-3" />
                                <span>Solution Available</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-500 rounded-full font-bold text-[9px] uppercase tracking-wider">
                                <X className="w-3 h-3" />
                                <span>No Solution</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleToggleStatus(prob)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[9px] uppercase tracking-widest border transition-all ${
                              prob.status === 'published' 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                : prob.status === 'draft'
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                : 'bg-slate-800 border-slate-700 text-slate-500'
                            }`}
                          >
                            {prob.status === 'published' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>{prob.status || 'published'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            
                            {/* Manage Modules action */}
                            <button
                              onClick={() => navigate(`/superadmin/admin/problems/${prob.id}/modules`)}
                              className="px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 rounded-lg text-[10px] font-black tracking-wider uppercase transition-colors flex items-center gap-1"
                              title="Configure Level 5 Modules"
                            >
                              <span>Manage Modules</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDuplicate(prob)}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 rounded hover:text-slate-200 transition-colors"
                              title="Duplicate Problem node"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(prob)}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 rounded hover:text-white transition-colors"
                              title="Modify details"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(prob.id, prob.name)}
                              className="p-1.5 hover:bg-rose-500/10 text-rose-400 rounded hover:text-rose-300 transition-colors"
                              title="Delete Problem Node"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="py-4 px-6 border-t border-slate-800/60 bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold">
              <span className="text-slate-500 font-mono text-[10px]">
                TELEMETRY: SHOWING {indexOfFirstItem + 1} TO {Math.min(indexOfLastItem, sortedProblems.length)} OF {sortedProblems.length} PROBLEMS
              </span>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-[11px] transition-all"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`w-7.5 h-7.5 rounded-lg text-[11px] font-bold font-mono transition-all ${
                        currentPage === idx + 1 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-[11px] transition-all"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Register / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-white tracking-wider font-mono uppercase">
                  {editingId ? 'Modify Problem Configuration' : 'Register New Problem Node'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">Level 4 Problem Workspace Node Parameters</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="bg-slate-950/40 border-b border-slate-800/50 px-6 py-2 flex items-center gap-4 text-xs font-bold text-slate-400">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`py-2 px-1 border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'details' ? 'border-indigo-500 text-indigo-400' : 'border-transparent hover:text-slate-300'}`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Basic Details</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('media')}
                className={`py-2 px-1 border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'media' ? 'border-indigo-500 text-indigo-400' : 'border-transparent hover:text-slate-300'}`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Media Assets</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('seo')}
                className={`py-2 px-1 border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'seo' ? 'border-indigo-500 text-indigo-400' : 'border-transparent hover:text-slate-300'}`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>SEO Parameters</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cta')}
                className={`py-2 px-1 border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'cta' ? 'border-indigo-500 text-indigo-400' : 'border-transparent hover:text-slate-300'}`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>CTA Settings</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="flex-grow overflow-y-auto p-6 space-y-4 text-xs font-semibold">
              
              {activeTab === 'details' && (
                <div className="space-y-4">
                  
                  {/* Read Only Parent Hierarchy Context */}
                  <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-300">
                    <div className="space-y-0.5">
                      <span className="text-slate-500 uppercase tracking-wider text-[9px] font-black">Level 1 Industry</span>
                      <div className="font-mono font-bold truncate">{industry?.name || 'Education'}</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-500 uppercase tracking-wider text-[9px] font-black">Level 2 Institution</span>
                      <div className="font-mono font-bold truncate">{institution?.name || 'Schools'}</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-500 uppercase tracking-wider text-[9px] font-black">Level 3 Area Node</span>
                      <div className="font-mono font-extrabold text-emerald-400 truncate">{area?.name}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 uppercase tracking-wider">Problem Title *</label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Unauthorized Facility Entry"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all"
                      />
                    </div>

                    {/* Slug */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 uppercase tracking-wider">Unique URL Slug *</label>
                      <input
                        type="text"
                        required
                        value={formSlug}
                        onChange={(e) => setFormSlug(e.target.value)}
                        placeholder="e.g. unauthorized-facility-entry"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {/* Severity */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 uppercase tracking-wider">Severity</label>
                      <select
                        value={formSeverity}
                        onChange={(e) => setFormSeverity(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>

                    {/* Priority */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 uppercase tracking-wider">Priority</label>
                      <select
                        value={formPriority}
                        onChange={(e) => setFormPriority(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>

                    {/* Category Classification */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 uppercase tracking-wider">Category Classification</label>
                      <input
                        type="text"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        placeholder="e.g. Security, Safety"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all"
                      />
                    </div>

                    {/* Display Order */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 uppercase tracking-wider">Display Order</label>
                      <input
                        type="number"
                        value={formDisplayOrder}
                        onChange={(e) => {
                          setFormDisplayOrder(Number(e.target.value));
                          setFormSortOrder(Number(e.target.value));
                        }}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* Settings status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-400 uppercase tracking-wider">Status</label>
                      <select
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all font-mono"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 uppercase tracking-wider">Featured Flag</label>
                      <select
                        value={formFeatured ? 'yes' : 'no'}
                        onChange={(e) => setFormFeatured(e.target.value === 'yes')}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all"
                      >
                        <option value="yes">Yes (Featured)</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  </div>

                  {/* Short Description */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 uppercase tracking-wider">Short Abstract Description</label>
                    <input
                      type="text"
                      value={formShortDesc}
                      onChange={(e) => setFormShortDesc(e.target.value)}
                      placeholder="e.g. Intruders bypass standard perimeter locks and access school fields undetected."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all"
                    />
                  </div>

                  {/* Full Description */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 uppercase tracking-wider">Full Problem Breakdown Description</label>
                    <textarea
                      rows={3}
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      placeholder="Outline any key threat scenarios, hardware limitations, or operational failure points causing this problem."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all resize-none leading-relaxed"
                    />
                  </div>

                </div>
              )}

              {activeTab === 'media' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Icon */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 uppercase tracking-wider">Lucide Icon Identifier</label>
                      <input
                        type="text"
                        value={formIcon}
                        onChange={(e) => setFormIcon(e.target.value)}
                        placeholder="e.g. ShieldAlert, Skull, MapPin"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all font-mono"
                      />
                    </div>

                    {/* Card Thumbnail Image */}
                    <ImageUploader
                      value={formCardImage}
                      onChange={setFormCardImage}
                      label="Card Thumbnail"
                    />
                  </div>

                  {/* Banner Image */}
                  <ImageUploader
                    value={formBannerImage}
                    onChange={setFormBannerImage}
                    label="Banner Cover Image"
                  />
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-4">
                  {/* Meta Title */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 uppercase tracking-wider">SEO Meta Title</label>
                    <input
                      type="text"
                      value={formSeoTitle}
                      onChange={(e) => setFormSeoTitle(e.target.value)}
                      placeholder={formName ? `${formName} | Level 4 Threat Analysis` : "Meta Title"}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all"
                    />
                  </div>

                  {/* Meta Description */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 uppercase tracking-wider">SEO Meta Description</label>
                    <textarea
                      rows={3}
                      value={formSeoDesc}
                      onChange={(e) => setFormSeoDesc(e.target.value)}
                      placeholder="A short abstract summary describing this security problem for search indexes."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all resize-none leading-relaxed"
                    />
                  </div>

                  {/* Keywords */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 uppercase tracking-wider">Meta Keywords (Comma Separated)</label>
                    <input
                      type="text"
                      value={formSeoKeywords}
                      onChange={(e) => setFormSeoKeywords(e.target.value)}
                      placeholder="e.g. trespassers, security vulnerability, physical defense, school fence"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'cta' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* CTA Button Text */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 uppercase tracking-wider">Action Button Text</label>
                      <input
                        type="text"
                        value={formCtaText}
                        onChange={(e) => setFormCtaText(e.target.value)}
                        placeholder="e.g. Open Solution Details"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all"
                      />
                    </div>

                    {/* CTA Link */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 uppercase tracking-wider">Action Button Link / Target</label>
                      <input
                        type="text"
                        value={formCtaLink}
                        onChange={(e) => setFormCtaLink(e.target.value)}
                        placeholder="e.g. /contact or leave empty"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions Footer */}
              <div className="bg-slate-950 border-t border-slate-800 px-6 py-4 flex items-center justify-end gap-3 -mx-6 -mb-6 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl font-bold font-mono text-[11px] uppercase tracking-wider transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold font-mono text-[11px] uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-950/20"
                >
                  <Save className="w-4 h-4" />
                  <span>Commit Node Changes</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.ids.length > 1 ? "Bulk Delete Problems" : "Delete Problem Record"}
        itemName={deleteModal.name}
        message={`Are you sure you want to permanently delete ${deleteModal.ids.length > 1 ? `these ${deleteModal.ids.length} selected Problem records` : `the Problem record "${deleteModal.name}"`}?`}
        blockedMessage={deleteModal.blockedMessage}
        isDeleting={deleteModal.isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, ids: [], name: '', blockedMessage: null, isDeleting: false })}
      />
    </div>
  );
}
