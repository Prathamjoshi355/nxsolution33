import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Plus, Edit2, Trash2, Copy, Eye, EyeOff, Search, ArrowLeft, 
  Cpu, Save, X, Globe, Sliders, FileText, CheckCircle2, AlertCircle, RefreshCw, FolderOpen
} from 'lucide-react';
import { apiService } from '../../Public/Services/api';
import { Industry, Institution } from '../../types';
import ImageUploader from '../../Public/Components/ImageUploader';

import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function IndustryManagement() {
  const navigate = useNavigate();
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'seo' | 'cta'>('details');

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
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formCardImage, setFormCardImage] = useState('');
  const [formIcon, setFormIcon] = useState('GraduationCap');
  const [formStatus, setFormStatus] = useState<'draft' | 'published' | 'archived'>('published');
  const [formFeatured, setFormFeatured] = useState(true);
  
  // SEO
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDesc, setFormSeoDesc] = useState('');
  const [formSeoKeywords, setFormSeoKeywords] = useState('');

  // CTA
  const [formCtaText, setFormCtaText] = useState('Learn More');
  const [formCtaLink, setFormCtaLink] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const indData = await apiService.getAdminIndustries();
      const instData = await apiService.getAdminInstitutions();
      setIndustries(indData);
      setInstitutions(instData);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch industries data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  // Auto generate slug
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
    setFormCoverImage('https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=600&auto=format&fit=crop');
    setFormCardImage('');
    setFormIcon('GraduationCap');
    setFormStatus('published');
    setFormFeatured(true);
    setFormSeoTitle('');
    setFormSeoDesc('');
    setFormSeoKeywords('');
    setFormCtaText('Learn More');
    setFormCtaLink('');
    setActiveTab('details');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ind: Industry) => {
    setEditingId(ind.id);
    setFormName(ind.name);
    setFormSlug(ind.slug);
    setFormShortDesc(ind.shortDescription || '');
    setFormDesc(ind.description || '');
    setFormCoverImage(ind.coverImage || '');
    setFormCardImage(ind.cardImage || '');
    setFormIcon(ind.icon || 'GraduationCap');
    setFormStatus(ind.status || 'published');
    setFormFeatured(ind.featured !== false);
    setFormSeoTitle(ind.seo?.metaTitle || '');
    setFormSeoDesc(ind.seo?.metaDescription || '');
    setFormSeoKeywords(ind.seo?.keywords || '');
    setFormCtaText(ind.cta?.buttonText || 'Learn More');
    setFormCtaLink(ind.cta?.buttonLink || '');
    setActiveTab('details');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formSlug) {
      alert('Name and Slug are required fields.');
      return;
    }

    const payload: Partial<Industry> = {
      id: editingId || undefined,
      name: formName,
      slug: formSlug,
      shortDescription: formShortDesc,
      description: formDesc,
      coverImage: formCoverImage,
      cardImage: formCardImage || formCoverImage,
      icon: formIcon,
      bannerImage: '',
      seo: {
        metaTitle: formSeoTitle || formName,
        metaDescription: formSeoDesc || formShortDesc,
        keywords: formSeoKeywords
      },
      cta: {
        buttonText: formCtaText,
        buttonLink: formCtaLink
      },
      status: formStatus,
      featured: formFeatured,
      sortOrder: editingId 
        ? (industries.find(i => i.id === editingId)?.sortOrder ?? industries.length) 
        : industries.length
    };

    try {
      await apiService.saveAdminIndustry(payload);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save industry.');
    }
  };

  const openDeleteModal = (id: string, name: string) => {
    const associatedCount = institutions.filter(inst => inst.industryId === id).length;
    const blockedMessage = associatedCount > 0 
      ? `Cannot delete "${name}": This Industry vertical contains ${associatedCount} active Institution(s). Please remove or reassign all child records before deleting.`
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
      await apiService.deleteAdminIndustry(deleteModal.id);
      showToast('success', `Industry "${deleteModal.name}" deleted successfully.`);
      setDeleteModal({ isOpen: false, id: '', name: '', blockedMessage: null, isDeleting: false });
      fetchData();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Unable to delete industry. Please try again.';
      showToast('error', errorMsg);
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDuplicate = async (ind: Industry) => {
    const duplicated: Partial<Industry> = {
      name: `${ind.name} (Copy)`,
      slug: `${ind.slug}-copy`,
      shortDescription: ind.shortDescription,
      description: ind.description,
      coverImage: ind.coverImage,
      cardImage: ind.cardImage,
      icon: ind.icon,
      bannerImage: '',
      seo: { ...ind.seo },
      cta: { ...ind.cta },
      status: 'draft',
      featured: ind.featured,
      sortOrder: industries.length
    };

    try {
      await apiService.saveAdminIndustry(duplicated);
      fetchData();
    } catch (err: any) {
      alert('Failed to duplicate industry.');
    }
  };

  const handleToggleStatus = async (ind: Industry) => {
    const newStatus = ind.status === 'published' ? 'draft' : 'published';
    try {
      await apiService.saveAdminIndustry({
        ...ind,
        status: newStatus
      });
      fetchData();
    } catch (err: any) {
      alert('Failed to update status.');
    }
  };

  const filteredIndustries = industries.filter(ind => 
    ind.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ind.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ind.shortDescription || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin')}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
            title="Return to Hub"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-wider font-mono text-white">NX CMS ARCHITECT</h1>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-widest">Industry Manager • Level 1</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Industry</span>
        </button>
      </nav>

      {/* Main Workspace */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Breadcrumb & Intro */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
          <div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-2">
              <span className="hover:text-slate-300 cursor-pointer" onClick={() => navigate('/admin')}>Dashboard</span>
              <span>/</span>
              <span className="text-emerald-400 font-medium">Industries</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Industry Verticals</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Create and manage enterprise industries. Each Industry acts as the top-level parent (Level 1) of our solution workspace.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search industries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl text-xs text-slate-200 outline-none transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/20 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-xs">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Data Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
            <span className="text-xs text-slate-400">Loading industry modules...</span>
          </div>
        ) : filteredIndustries.length === 0 ? (
          <div className="bg-slate-900/20 border border-slate-800 rounded-2xl py-16 text-center">
            <div className="w-12 h-12 bg-slate-900 border border-slate-800 text-slate-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-300">No Industries Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm ? 'No results matched your query. Try a different search term.' : 'Get started by creating your first Industry vertical module above.'}
            </p>
          </div>
        ) : (
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/60 bg-slate-900/60 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                    <th className="py-4 px-6">Industry/Icon</th>
                    <th className="py-4 px-6">Slug</th>
                    <th className="py-4 px-6">Description</th>
                    <th className="py-4 px-6 text-center">Institutions</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-xs text-slate-300">
                  {filteredIndustries.map((ind) => {
                    const instCount = institutions.filter(inst => inst.industryId === ind.id).length;
                    return (
                      <tr key={ind.id} className="hover:bg-slate-900/20 group transition-all">
                        {/* Title & Icon */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                              <span className="text-base font-bold font-mono">{ind.icon ? ind.icon[0] : 'I'}</span>
                            </div>
                            <div>
                              <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">{ind.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{ind.icon || 'No Icon'}</div>
                            </div>
                          </div>
                        </td>

                        {/* Slug */}
                        <td className="py-4 px-6 font-mono text-[11px] text-slate-400">
                          /industries/{ind.slug}
                        </td>

                        {/* Short Desc */}
                        <td className="py-4 px-6 max-w-xs truncate text-slate-400" title={ind.shortDescription}>
                          {ind.shortDescription || <span className="text-slate-600 italic">No description</span>}
                        </td>

                        {/* Institution Count */}
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => navigate(`/superadmin/admin/industries/${ind.id}/institutions`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-400 rounded-full font-mono font-bold text-[10px] transition-all"
                            title="Manage Level 2 Verticals"
                          >
                            <span>{instCount}</span>
                            <span>→</span>
                          </button>
                        </td>

                        {/* Status Toggle */}
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleToggleStatus(ind)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider border transition-all ${
                              ind.status === 'published' 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                : ind.status === 'draft'
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                : 'bg-slate-800 border-slate-700 text-slate-500'
                            }`}
                          >
                            {ind.status === 'published' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>{ind.status || 'published'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/superadmin/admin/industries/${ind.id}/institutions`)}
                              className="p-1.5 hover:bg-indigo-500/10 text-indigo-400 rounded hover:text-indigo-300 transition-colors"
                              title="Manage Institutions"
                            >
                              <FolderOpen className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDuplicate(ind)}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 rounded hover:text-slate-200 transition-colors"
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(ind)}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 rounded hover:text-white transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(ind.id, ind.name)}
                              className="p-1.5 hover:bg-rose-500/10 text-rose-400 rounded hover:text-rose-300 transition-colors"
                              title="Delete Industry"
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
            <div className="py-3 px-6 border-t border-slate-800/60 bg-slate-900/20 text-[10px] text-slate-500 font-mono flex justify-between">
              <span>ACTIVE SYSTEM REGISTRY</span>
              <span>TOTAL OBJECTS: {filteredIndustries.length}</span>
            </div>
          </div>
        )}
      </main>

      {/* Save Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-white tracking-wider font-mono uppercase">
                  {editingId ? 'Modify Industry Module' : 'Register New Industry'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">Level 1 Solution Node Configuration</p>
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
                <span>Details & Media</span>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold uppercase tracking-wider">Industry Name *</label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Healthcare"
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
                        placeholder="e.g. healthcare"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-slate-200 outline-none transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Icon */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold uppercase tracking-wider">Lucide Icon Identifier</label>
                      <input
                        type="text"
                        value={formIcon}
                        onChange={(e) => setFormIcon(e.target.value)}
                        placeholder="e.g. HeartPulse"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-slate-200 outline-none transition-all font-mono"
                      />
                    </div>

                    {/* Status & Featured */}
                    <div className="grid grid-cols-2 gap-3.5">
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
                  </div>

                  {/* Short Description */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold uppercase tracking-wider">Short Summary</label>
                    <input
                      type="text"
                      value={formShortDesc}
                      onChange={(e) => setFormShortDesc(e.target.value)}
                      placeholder="e.g. Advanced Vision & Access Management for clinics."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-slate-200 outline-none transition-all"
                    />
                  </div>

                  {/* Complete Description */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold uppercase tracking-wider">Full Content Description</label>
                    <textarea
                      rows={3}
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      placeholder="Explain the entire suite of security protocols, dynamic monitoring, and edge-AI camera modules deployed inside this sector."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-slate-200 outline-none transition-all resize-none leading-relaxed"
                    />
                  </div>

                  {/* Cover Image */}
                  <ImageUploader
                    value={formCoverImage}
                    onChange={setFormCoverImage}
                    label="Hero Cover Image"
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
                      placeholder={formName ? `${formName} Security Solutions` : "Meta Title"}
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
                      placeholder="A short descriptive prompt that shows in search engine snippets."
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
                      placeholder="e.g. healthcare, biometric access, vision surveillance"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-slate-200 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'cta' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* CTA Text */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold uppercase tracking-wider">Button Label</label>
                      <input
                        type="text"
                        value={formCtaText}
                        onChange={(e) => setFormCtaText(e.target.value)}
                        placeholder="e.g. Learn More"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-slate-200 outline-none transition-all"
                      />
                    </div>

                    {/* CTA Link */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold uppercase tracking-wider">Custom Action URL (Optional)</label>
                      <input
                        type="text"
                        value={formCtaLink}
                        onChange={(e) => setFormCtaLink(e.target.value)}
                        placeholder="e.g. /contact-specialist"
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
                  <span>{editingId ? 'Apply Changes' : 'Register vertical'}</span>
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
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete Industry Vertical"
        itemName={deleteModal.name}
        message={`Are you sure you want to permanently delete the Industry vertical "${deleteModal.name}"?`}
        blockedMessage={deleteModal.blockedMessage}
        isDeleting={deleteModal.isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: '', name: '', blockedMessage: null, isDeleting: false })}
      />
    </div>
  );
}
