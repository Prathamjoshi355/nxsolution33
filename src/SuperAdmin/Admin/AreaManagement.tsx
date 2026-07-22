import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, Edit2, Trash2, Copy, Eye, EyeOff, Search, ArrowLeft, 
  Cpu, Save, X, Globe, Sliders, FileText, AlertCircle, RefreshCw, 
  ArrowRight, Shield, Layers, HelpCircle, Check, CheckCircle, Sparkles, AlertTriangle
} from 'lucide-react';
import { apiService } from '../../Public/Services/api';
import { Industry, Institution, Zone, Problem } from '../../types';
import ImageUploader from '../../Public/Components/ImageUploader';

import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function AreaManagement() {
  const { institutionId } = useParams<{ institutionId: string }>();
  const navigate = useNavigate();

  const [industry, setIndustry] = useState<Industry | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [areas, setAreas] = useState<Zone[]>([]);
  const [problemsMap, setProblemsMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'media' | 'seo' | 'cta'>('details');

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
    blockedMessage: string | null;
    isDeleting: boolean;
  }>({
    isOpen: false,
    id: '',
    name: '',
    blockedMessage: null,
    isDeleting: false,
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCardImage, setFormCardImage] = useState('');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formBannerImage, setFormBannerImage] = useState('');
  const [formIcon, setFormIcon] = useState('Shield');
  const [formPriority, setFormPriority] = useState('Medium');
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
  const [formCtaText, setFormCtaText] = useState('Explore Area Solutions');
  const [formCtaLink, setFormCtaLink] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Sorting State
  const [sortField, setSortField] = useState<keyof Zone>('sortOrder');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter State
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');

  useEffect(() => {
    if (institutionId) {
      fetchData();
    }
  }, [institutionId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch parent hierarchy (Industries & Institutions)
      const industriesList = await apiService.getAdminIndustries();
      const institutionsList = await apiService.getAdminInstitutions();
      
      const matchedInstitution = institutionsList.find((inst: any) => inst.id === institutionId);
      if (!matchedInstitution) {
        setError('The parent Institution record was not found.');
        setLoading(false);
        return;
      }
      setInstitution(matchedInstitution);

      const matchedIndustry = industriesList.find((ind: any) => ind.id === matchedInstitution.industryId);
      setIndustry(matchedIndustry || null);

      // 2. Fetch Areas (Zones) for this Institution
      // We call the public API getZones endpoint to retrieve all status states
      const zonesList = await apiService.getZones(undefined, institutionId);
      setAreas(zonesList);

      // 3. Fetch Problem count per Zone
      const countMap: Record<string, number> = {};
      for (const zone of zonesList) {
        try {
          const problems = await apiService.getAdminProblems(zone.id);
          countMap[zone.id] = problems.length;
        } catch (err) {
          console.warn(`Could not fetch problems for zone ${zone.id}`, err);
          countMap[zone.id] = 0;
        }
      }
      setProblemsMap(countMap);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('An error occurred while building the Area workspace context.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate Slug on form name change (only for new Area creation)
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
    setFormCardImage('https://images.unsplash.com/photo-1590402421685-65c2b485aa68?q=80&w=600&auto=format&fit=crop');
    setFormCoverImage('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop');
    setFormBannerImage('');
    setFormIcon('Shield');
    setFormPriority('Medium');
    setFormRiskLevel('Medium');
    setFormDisplayOrder(areas.length + 1);
    setFormStatus('published');
    setFormFeatured(false);
    setFormSortOrder(areas.length + 1);
    setFormSeoTitle('');
    setFormSeoDesc('');
    setFormSeoKeywords('');
    setFormCtaText('Explore Area Solutions');
    setFormCtaLink('');
    setActiveTab('details');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (zone: Zone) => {
    setEditingId(zone.id);
    setFormName(zone.name);
    setFormSlug(zone.slug);
    setFormShortDesc(zone.shortDescription || zone.subHeading || '');
    setFormDesc(zone.description || '');
    setFormCardImage(zone.cardImage || zone.image || '');
    setFormCoverImage(zone.coverImage || '');
    setFormBannerImage(zone.bannerImage || '');
    setFormIcon(zone.icon || 'Shield');
    setFormPriority(zone.priority || 'Medium');
    setFormRiskLevel(zone.riskLevel || 'Medium');
    setFormDisplayOrder(zone.displayOrder ?? zone.sortOrder ?? 0);
    setFormStatus(zone.status || 'published');
    setFormFeatured(zone.featured === true || zone.isFeatured === true);
    setFormSortOrder(zone.sortOrder ?? 0);
    setFormSeoTitle(zone.seo?.metaTitle || '');
    setFormSeoDesc(zone.seo?.metaDescription || '');
    setFormSeoKeywords(zone.seo?.keywords || '');
    setFormCtaText(zone.cta?.buttonText || 'Explore Area Solutions');
    setFormCtaLink(zone.cta?.buttonLink || '');
    setActiveTab('details');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formSlug) {
      alert('Area Name and URL Slug are mandatory fields.');
      return;
    }

    const payload: Partial<Zone> = {
      id: editingId || undefined,
      industryId: industry?.id || '',
      institutionId: institutionId || '',
      name: formName,
      slug: formSlug,
      heading: formName,
      subHeading: formShortDesc || 'Choose the Security Area',
      description: formDesc,
      image: formCardImage,
      cardImage: formCardImage,
      coverImage: formCoverImage,
      bannerImage: formBannerImage,
      icon: formIcon,
      priority: formPriority,
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
      await apiService.saveAdminZone(payload);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'An error occurred while saving the Area registration.');
    }
  };

  const openDeleteModal = (id: string, name: string) => {
    const problemsCount = problemsMap[id] || 0;
    const blockedMessage = problemsCount > 0 
      ? `Cannot delete "${name}": This Area node contains ${problemsCount} active Problem(s). Please remove or reassign all child Problems before deleting this Area.`
      : null;

    setDeleteModal({
      isOpen: true,
      id,
      name,
      blockedMessage,
      isDeleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    try {
      await apiService.deleteAdminZone(deleteModal.id);
      showToast('success', `Area "${deleteModal.name}" deleted successfully.`);
      setDeleteModal({ isOpen: false, id: '', name: '', blockedMessage: null, isDeleting: false });
      fetchData();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Unable to delete Area record. Please try again.';
      showToast('error', errorMsg);
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDuplicate = async (zone: Zone) => {
    const duplicated: Partial<Zone> = {
      industryId: zone.industryId,
      institutionId: zone.institutionId,
      name: `${zone.name} (Copy)`,
      slug: `${zone.slug}-copy`,
      heading: `${zone.name} (Copy)`,
      subHeading: zone.subHeading || zone.shortDescription,
      description: zone.description,
      image: zone.image || zone.cardImage,
      cardImage: zone.cardImage || zone.image,
      coverImage: zone.coverImage,
      bannerImage: zone.bannerImage,
      icon: zone.icon || 'Shield',
      priority: zone.priority || 'Medium',
      riskLevel: zone.riskLevel || 'Medium',
      status: 'draft',
      featured: zone.featured === true || zone.isFeatured === true,
      isFeatured: zone.featured === true || zone.isFeatured === true,
      sortOrder: areas.length + 1,
      displayOrder: areas.length + 1,
      seo: { ...zone.seo },
      cta: { ...zone.cta }
    };

    try {
      await apiService.saveAdminZone(duplicated);
      fetchData();
    } catch (err: any) {
      alert('An error occurred while duplicating the Area node.');
    }
  };

  const handleToggleStatus = async (zone: Zone) => {
    const newStatus = zone.status === 'published' ? 'draft' : 'published';
    try {
      await apiService.saveAdminZone({
        ...zone,
        status: newStatus
      });
      fetchData();
    } catch (err: any) {
      alert('Failed to toggle status state.');
    }
  };

  const handleSort = (field: keyof Zone) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter & Search computation
  const filteredAreas = areas.filter(zone => {
    const matchesSearch = 
      zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (zone.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (zone.shortDescription || zone.subHeading || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ? true : zone.status === statusFilter;
    const matchesRisk = riskFilter === 'all' ? true : (zone.riskLevel || 'Medium').toLowerCase() === riskFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesRisk;
  });

  // Sorting computation
  const sortedAreas = [...filteredAreas].sort((a, b) => {
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

  // Pagination computation
  const totalPages = Math.ceil(sortedAreas.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAreas = sortedAreas.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Dynamic Header */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/superadmin/admin/industries/${industry?.id}/institutions`)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
            title="Return to Institution Workspace"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-wider font-mono text-white">NX CMS ARCHITECT</h1>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-widest">Area Manager • Level 3</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Area Node</span>
        </button>
      </nav>

      {/* Main Workspace */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Hierarchy Context Widget */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="hover:text-slate-300 cursor-pointer" onClick={() => navigate('/admin')}>Dashboard</span>
              <span>/</span>
              <span className="hover:text-slate-300 cursor-pointer" onClick={() => navigate('/superadmin/admin/industries')}>Industries</span>
              <span>/</span>
              <span className="text-slate-400 font-medium font-mono">[{industry?.name}]</span>
              <span>/</span>
              <span className="hover:text-slate-300 cursor-pointer" onClick={() => navigate(`/superadmin/admin/industries/${industry?.id}/institutions`)}>{institution?.name}</span>
              <span>/</span>
              <span className="text-emerald-400 font-bold">Areas</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Level 1:</span>
              <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-0.5 rounded font-mono font-medium">{industry?.name || 'Unassigned'}</span>
              
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Level 2:</span>
              <span className="text-xs bg-indigo-950/50 border border-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded font-mono font-medium">{institution?.name || 'Unassigned'}</span>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight pt-1">
              Area (Zone) Management
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Configure facilities, campuses, or critical zones. These Level 3 nodes isolate specific architectural vulnerabilities where technical Problems occur.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search input */}
            <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search Areas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs text-slate-200 outline-none transition-all placeholder:text-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-slate-900/20 border border-slate-900 px-6 py-3.5 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Quick Filters:</span>
            
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Status:</span>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All States</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Risk Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Risk Level:</span>
              <select 
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Risks</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono">
            {filteredAreas.length === areas.length ? `TOTAL NODES: ${areas.length}` : `MATCHED: ${filteredAreas.length} / ${areas.length}`}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/20 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-xs">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Areas List Grid / Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
            <span className="text-xs text-slate-400">Loading spatial Area modules...</span>
          </div>
        ) : sortedAreas.length === 0 ? (
          <div className="bg-slate-900/20 border border-slate-800 rounded-2xl py-20 text-center">
            <div className="w-12 h-12 bg-slate-900 border border-slate-800 text-slate-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-300">No Areas Registered</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'all' || riskFilter !== 'all'
                ? 'No registered areas matched your search filter parameters.'
                : 'Get started by creating your first Area (Zone) node for this Institution.'}
            </p>
          </div>
        ) : (
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/60 bg-slate-900/60 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                    <th className="py-4 px-6 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('name')}>Area / Icon</th>
                    <th className="py-4 px-6 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('slug')}>Slug</th>
                    <th className="py-4 px-6">Risk / Priority</th>
                    <th className="py-4 px-6 text-center">Problems</th>
                    <th className="py-4 px-6 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('status')}>Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-xs text-slate-300">
                  {currentAreas.map((zone) => {
                    const probCount = problemsMap[zone.id] || 0;
                    return (
                      <tr key={zone.id} className="hover:bg-slate-900/20 group transition-all">
                        {/* Area Icon & details */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex-shrink-0 relative">
                              {zone.cardImage || zone.image ? (
                                <img 
                                  src={zone.cardImage || zone.image} 
                                  alt={zone.name} 
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900">
                                  <Layers className="w-5 h-5" />
                                </div>
                              )}
                              {zone.featured && (
                                <span className="absolute bottom-0 right-0 bg-amber-500 text-slate-950 text-[8px] font-black uppercase px-1 rounded-tl-md tracking-widest">F</span>
                              )}
                            </div>
                            <div>
                              <div className="font-extrabold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                                <span>{zone.name}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 max-w-xs truncate mt-0.5" title={zone.shortDescription || zone.subHeading}>
                                {zone.shortDescription || zone.subHeading || 'No description provided'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Slug */}
                        <td className="py-4 px-6 font-mono text-[11px] text-slate-400">
                          /{zone.slug}
                        </td>

                        {/* Risk / Priority */}
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-500 uppercase font-semibold">Risk:</span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                (zone.riskLevel || '').toLowerCase() === 'critical'
                                  ? 'bg-rose-950/60 border border-rose-500/30 text-rose-400'
                                  : (zone.riskLevel || '').toLowerCase() === 'high'
                                  ? 'bg-orange-950/60 border border-orange-500/30 text-orange-400'
                                  : 'bg-slate-800 border border-slate-700 text-slate-400'
                              }`}>
                                {zone.riskLevel || 'Medium'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-500 uppercase font-semibold">Priority:</span>
                              <span className="text-slate-300 font-mono text-[10px]">{zone.priority || 'Medium'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Number of Problems */}
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => navigate(`/superadmin/admin/areas/${zone.id}/problems`)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 rounded-full font-mono font-bold text-[10px] transition-all"
                            title="Manage Level 4 Problems"
                          >
                            <span>{probCount}</span>
                            <span className="text-[8px] uppercase font-bold text-indigo-500 group-hover:text-indigo-400 ml-0.5">Problems</span>
                          </button>
                        </td>

                        {/* Status Toggle */}
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleToggleStatus(zone)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider border transition-all ${
                              zone.status === 'published' 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                : zone.status === 'draft'
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                : 'bg-slate-800 border-slate-700 text-slate-500'
                            }`}
                          >
                            {zone.status === 'published' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>{zone.status || 'published'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => navigate(`/superadmin/admin/areas/${zone.id}/problems`)}
                              className="px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 rounded-lg text-[10px] font-extrabold tracking-wider uppercase transition-colors flex items-center gap-1"
                              title="Manage Area Problems"
                            >
                              <span>Problems</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicate(zone)}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 rounded hover:text-slate-200 transition-colors"
                              title="Duplicate Node"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(zone)}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 rounded hover:text-white transition-colors"
                              title="Edit Node"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(zone.id, zone.name)}
                              className="p-1.5 hover:bg-rose-500/10 text-rose-400 rounded hover:text-rose-300 transition-colors"
                              title="Delete Area Node"
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

            {/* Pagination / Table Footer */}
            <div className="py-4 px-6 border-t border-slate-800/60 bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <span className="text-slate-500 font-mono text-[10px]">
                SHOWING {indexOfFirstItem + 1} TO {Math.min(indexOfLastItem, sortedAreas.length)} OF {sortedAreas.length} AREAS
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
                          ? 'bg-emerald-600 text-white' 
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

      {/* Save Area Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-white tracking-wider font-mono uppercase">
                  {editingId ? 'Modify Area (Zone) Workspace' : 'Register New Area Node'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">Level 3 Solution Workspace Node Configuration</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="bg-slate-950/40 border-b border-slate-800/50 px-6 py-2 flex items-center gap-4 text-xs font-semibold text-slate-400">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-2 px-1 border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'details' ? 'border-emerald-500 text-emerald-400' : 'border-transparent hover:text-slate-300'}`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Basic Details</span>
              </button>
              <button
                onClick={() => setActiveTab('media')}
                className={`py-2 px-1 border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'media' ? 'border-emerald-500 text-emerald-400' : 'border-transparent hover:text-slate-300'}`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Media Assets</span>
              </button>
              <button
                onClick={() => setActiveTab('seo')}
                className={`py-2 px-1 border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'seo' ? 'border-emerald-500 text-emerald-400' : 'border-transparent hover:text-slate-300'}`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>SEO Parameters</span>
              </button>
              <button
                onClick={() => setActiveTab('cta')}
                className={`py-2 px-1 border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'cta' ? 'border-emerald-500 text-emerald-400' : 'border-transparent hover:text-slate-300'}`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>CTA Button</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="flex-grow overflow-y-auto p-6 space-y-4 text-xs">
              
              {activeTab === 'details' && (
                <div className="space-y-4">
                  
                  {/* Parent Lock-ins Display */}
                  <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                      <span className="text-slate-500 uppercase tracking-wider text-[9px] font-bold">Assigned Industry (L1)</span>
                      <div className="font-mono text-slate-300 font-bold">{industry?.name || 'Education'} (Locked)</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-500 uppercase tracking-wider text-[9px] font-bold">Assigned Institution (L2)</span>
                      <div className="font-mono text-indigo-400 font-extrabold">{institution?.name || 'Schools'} (Locked)</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold uppercase tracking-wider">Area Name *</label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Playground"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-slate-200 outline-none transition-all"
                      />
                    </div>

                    {/* Slug */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold uppercase tracking-wider">URL Slug *</label>
                      <input
                        type="text"
                        required
                        value={formSlug}
                        onChange={(e) => setFormSlug(e.target.value)}
                        placeholder="e.g. playground"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-slate-200 outline-none transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Priority */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold uppercase tracking-wider">Priority</label>
                      <select
                        value={formPriority}
                        onChange={(e) => setFormPriority(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-slate-200 outline-none transition-all"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>

                    {/* Risk Level */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold uppercase tracking-wider">Risk Level</label>
                      <select
                        value={formRiskLevel}
                        onChange={(e) => setFormRiskLevel(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-slate-200 outline-none transition-all"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>

                    {/* Display / Sort Order */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold uppercase tracking-wider">Display Order</label>
                      <input
                        type="number"
                        value={formDisplayOrder}
                        onChange={(e) => {
                          setFormDisplayOrder(Number(e.target.value));
                          setFormSortOrder(Number(e.target.value));
                        }}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-slate-200 outline-none transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* Settings status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold uppercase tracking-wider">Status</label>
                      <select
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-slate-200 outline-none transition-all"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold uppercase tracking-wider">Featured Flag</label>
                      <select
                        value={formFeatured ? 'yes' : 'no'}
                        onChange={(e) => setFormFeatured(e.target.value === 'yes')}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-slate-200 outline-none transition-all"
                      >
                        <option value="yes">Yes (Featured)</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  </div>

                  {/* Short Description */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold uppercase tracking-wider">Short Summary</label>
                    <input
                      type="text"
                      value={formShortDesc}
                      onChange={(e) => setFormShortDesc(e.target.value)}
                      placeholder="e.g. Critical perimeter boundaries, recreational fields, and outdoor activity areas."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-slate-200 outline-none transition-all"
                    />
                  </div>

                  {/* Full Description */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold uppercase tracking-wider">Full Content Description</label>
                    <textarea
                      rows={3}
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      placeholder="Outline any special security protocols, patrol routes, and video monitoring parameters configured inside this facility area."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-slate-200 outline-none transition-all resize-none leading-relaxed"
                    />
                  </div>

                </div>
              )}

              {activeTab === 'media' && (
                <div className="space-y-4">
                  {/* Icon and Card Image */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold uppercase tracking-wider">Lucide Icon Identifier</label>
                      <input
                        type="text"
                        value={formIcon}
                        onChange={(e) => setFormIcon(e.target.value)}
                        placeholder="e.g. Shield, MapPin, Building2"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-slate-200 outline-none transition-all font-mono"
                      />
                    </div>

                    <ImageUploader
                      value={formCardImage}
                      onChange={setFormCardImage}
                      label="Card Thumbnail"
                    />
                  </div>

                  {/* Cover Image */}
                  <ImageUploader
                    value={formCoverImage}
                    onChange={setFormCoverImage}
                    label="Hero Cover Image"
                  />

                  {/* Banner Image */}
                  <ImageUploader
                    value={formBannerImage}
                    onChange={setFormBannerImage}
                    label="Banner Image"
                  />
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-4">
                  {/* Meta Title */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold uppercase tracking-wider">SEO Meta Title</label>
                    <input
                      type="text"
                      value={formSeoTitle}
                      onChange={(e) => setFormSeoTitle(e.target.value)}
                      placeholder={formName ? `${formName} Surveillance Area` : "Meta Title"}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-slate-200 outline-none transition-all"
                    />
                  </div>

                  {/* Meta Description */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold uppercase tracking-wider">SEO Meta Description</label>
                    <textarea
                      rows={3}
                      value={formSeoDesc}
                      onChange={(e) => setFormSeoDesc(e.target.value)}
                      placeholder="A brief metadata summary describing this area's threat surface."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-slate-200 outline-none transition-all resize-none leading-relaxed"
                    />
                  </div>

                  {/* Keywords */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold uppercase tracking-wider">Keywords (Comma Separated)</label>
                    <input
                      type="text"
                      value={formSeoKeywords}
                      onChange={(e) => setFormSeoKeywords(e.target.value)}
                      placeholder="e.g. playground, biometric surveillance, perimeter defense"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-slate-200 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'cta' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* CTA Button Text */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold uppercase tracking-wider">Button Label</label>
                      <input
                        type="text"
                        value={formCtaText}
                        onChange={(e) => setFormCtaText(e.target.value)}
                        placeholder="e.g. Explore Area Solutions"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-slate-200 outline-none transition-all"
                      />
                    </div>

                    {/* CTA Link */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold uppercase tracking-wider">Button Action URL</label>
                      <input
                        type="text"
                        value={formCtaLink}
                        onChange={(e) => setFormCtaLink(e.target.value)}
                        placeholder="e.g. /solutions-explorer"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-slate-200 outline-none transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-950 -mx-6 -mb-6 p-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/20"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingId ? 'Apply Changes' : 'Register Area'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce ${
          notification.type === 'success' 
            ? 'bg-emerald-950 border-emerald-500/50 text-emerald-300' 
            : 'bg-rose-950 border-rose-500/50 text-rose-300'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete Area Node"
        itemName={deleteModal.name}
        message={`Are you sure you want to permanently delete the Area node "${deleteModal.name}"?`}
        blockedMessage={deleteModal.blockedMessage}
        isDeleting={deleteModal.isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: '', name: '', blockedMessage: null, isDeleting: false })}
      />
    </div>
  );
}
