import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building, Plus, Edit2, Trash2, Copy, Eye, EyeOff, Search, ArrowLeft, 
  Cpu, Save, X, Globe, Sliders, FileText, CheckCircle2, AlertCircle, RefreshCw, PhoneCall, MapPin, ArrowRight
} from 'lucide-react';
import { apiService } from '../../Public/Services/api';
import { Industry, Institution, Zone } from '../../types';
import ImageUploader from '../../Public/Components/ImageUploader';

import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function InstitutionManagement() {
  const { industryId } = useParams<{ industryId: string }>();
  const navigate = useNavigate();

  const [industry, setIndustry] = useState<Industry | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'seo' | 'contact'>('details');

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
  const [formIcon, setFormIcon] = useState('School');
  const [formStatus, setFormStatus] = useState<'draft' | 'published' | 'archived'>('published');
  const [formFeatured, setFormFeatured] = useState(true);

  // Contact
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formWebsite, setFormWebsite] = useState('');

  // SEO
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDesc, setFormSeoDesc] = useState('');
  const [formSeoKeywords, setFormSeoKeywords] = useState('');

  // CTA
  const [formCtaText, setFormCtaText] = useState('Learn More');
  const [formCtaLink, setFormCtaLink] = useState('');

  useEffect(() => {
    if (industryId) {
      fetchData();
    }
  }, [industryId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Parent Industry
      const indList = await apiService.getAdminIndustries();
      const matchedInd = indList.find((i: any) => i.id === industryId);
      if (!matchedInd) {
        setError('The specified parent Industry was not found.');
        return;
      }
      setIndustry(matchedInd);

      // Fetch Institutions for this Industry
      const instList = await apiService.getAdminInstitutions(industryId);
      setInstitutions(instList);

      // Fetch zones to calculate count
      const zoneList = await apiService.getAdminZones();
      setZones(zoneList);

      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch institution records.');
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
    setFormCardImage('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600&auto=format&fit=crop');
    setFormCoverImage('');
    setFormIcon('School');
    setFormStatus('published');
    setFormFeatured(true);
    setFormEmail('');
    setFormPhone('');
    setFormWebsite('');
    setFormSeoTitle('');
    setFormSeoDesc('');
    setFormSeoKeywords('');
    setFormCtaText('Learn More');
    setFormCtaLink('');
    setActiveTab('details');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inst: Institution) => {
    setEditingId(inst.id);
    setFormName(inst.name);
    setFormSlug(inst.slug);
    setFormShortDesc(inst.shortDescription || '');
    setFormDesc(inst.description || '');
    setFormCardImage(inst.cardImage || '');
    setFormCoverImage(inst.coverImage || '');
    setFormIcon(inst.icon || 'School');
    setFormStatus(inst.status || 'published');
    setFormFeatured(inst.featured !== false);
    setFormEmail(inst.contact?.email || '');
    setFormPhone(inst.contact?.phone || '');
    setFormWebsite(inst.contact?.website || '');
    setFormSeoTitle(inst.seo?.metaTitle || '');
    setFormSeoDesc(inst.seo?.metaDescription || '');
    setFormSeoKeywords(inst.seo?.keywords || '');
    setFormCtaText(inst.cta?.buttonText || 'Learn More');
    setFormCtaLink(inst.cta?.buttonLink || '');
    setActiveTab('details');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formSlug) {
      alert('Name and Slug are required fields.');
      return;
    }

    const payload: Partial<Institution> = {
      id: editingId || undefined,
      industryId,
      name: formName,
      slug: formSlug,
      shortDescription: formShortDesc,
      description: formDesc,
      cardImage: formCardImage,
      coverImage: formCoverImage || formCardImage,
      bannerImage: '',
      icon: formIcon,
      contact: {
        email: formEmail,
        phone: formPhone,
        website: formWebsite
      },
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
        ? (institutions.find(i => i.id === editingId)?.sortOrder ?? institutions.length) 
        : institutions.length
    };

    try {
      await apiService.saveAdminInstitution(payload);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save institution.');
    }
  };

  const openDeleteModal = (id: string, name: string) => {
    const associatedCount = zones.filter(z => z.institutionId === id).length;
    const blockedMessage = associatedCount > 0 
      ? `Cannot delete "${name}": This Institution contains ${associatedCount} active Area(s) (Zones). Please remove or reassign all child Areas before deleting.`
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
      await apiService.deleteAdminInstitution(deleteModal.id);
      showToast('success', `Institution "${deleteModal.name}" deleted successfully.`);
      setDeleteModal({ isOpen: false, id: '', name: '', blockedMessage: null, isDeleting: false });
      fetchData();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Unable to delete institution. Please try again.';
      showToast('error', errorMsg);
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDuplicate = async (inst: Institution) => {
    const duplicated: Partial<Institution> = {
      industryId,
      name: `${inst.name} (Copy)`,
      slug: `${inst.slug}-copy`,
      shortDescription: inst.shortDescription,
      description: inst.description,
      cardImage: inst.cardImage,
      coverImage: inst.coverImage,
      bannerImage: '',
      icon: inst.icon,
      contact: { ...inst.contact },
      seo: { ...inst.seo },
      cta: { ...inst.cta },
      status: 'draft',
      featured: inst.featured,
      sortOrder: institutions.length
    };

    try {
      await apiService.saveAdminInstitution(duplicated);
      fetchData();
    } catch (err: any) {
      alert('Failed to duplicate institution.');
    }
  };

  const handleToggleStatus = async (inst: Institution) => {
    const newStatus = inst.status === 'published' ? 'draft' : 'published';
    try {
      await apiService.saveAdminInstitution({
        ...inst,
        status: newStatus
      });
      fetchData();
    } catch (err: any) {
      alert('Failed to update status.');
    }
  };

  const filteredInstitutions = institutions.filter(inst => 
    inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inst.shortDescription || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/superadmin/admin/industries')}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
            title="Return to Industries"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-wider font-mono text-white">NX CMS ARCHITECT</h1>
              <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-widest">Institution Manager • Level 2</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-950/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Institution</span>
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
              <span className="hover:text-slate-300 cursor-pointer" onClick={() => navigate('/superadmin/admin/industries')}>Industries</span>
              <span>/</span>
              <span className="text-slate-500 font-semibold">{industry?.name || 'Industry'}</span>
              <span>/</span>
              <span className="text-indigo-400 font-medium">Institutions</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Institutions inside:</span>
              <span className="text-indigo-400 px-2.5 py-0.5 bg-indigo-950/40 border border-indigo-500/20 rounded-lg text-xs font-mono font-black uppercase tracking-wider">{industry?.name || 'Industry'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Create and manage Institution modules. Each Institution is nested safely inside the parent Industry (Level 2) and contains Areas.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search institutions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-200 outline-none transition-all placeholder:text-slate-600"
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
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
            <span className="text-xs text-slate-400">Loading institution modules...</span>
          </div>
        ) : filteredInstitutions.length === 0 ? (
          <div className="bg-slate-900/20 border border-slate-800 rounded-2xl py-16 text-center">
            <div className="w-12 h-12 bg-slate-900 border border-slate-800 text-slate-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-300">No Institutions Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm ? 'No results matched your query. Try a different search term.' : 'Get started by registering your first Institution module inside this industry.'}
            </p>
          </div>
        ) : (
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/60 bg-slate-900/60 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                    <th className="py-4 px-6">Institution</th>
                    <th className="py-4 px-6">Slug</th>
                    <th className="py-4 px-6">Description</th>
                    <th className="py-4 px-6 text-center">Areas (Zones)</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-xs text-slate-300">
                  {filteredInstitutions.map((inst) => {
                    const zoneCount = zones.filter(z => z.institutionId === inst.id).length;
                    return (
                      <tr key={inst.id} className="hover:bg-slate-900/20 group transition-all">
                        {/* Title & Icon */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                              <span className="text-base font-bold font-mono">{inst.icon ? inst.icon[0] : 'S'}</span>
                            </div>
                            <div>
                              <div className="font-bold text-white group-hover:text-indigo-400 transition-colors">{inst.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{inst.icon || 'School'}</div>
                            </div>
                          </div>
                        </td>

                        {/* Slug */}
                        <td className="py-4 px-6 font-mono text-[11px] text-slate-400">
                          /{inst.slug}
                        </td>

                        {/* Short Desc */}
                        <td className="py-4 px-6 max-w-xs truncate text-slate-400" title={inst.shortDescription}>
                          {inst.shortDescription || <span className="text-slate-600 italic">No description</span>}
                        </td>

                        {/* Areas Count */}
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => navigate(`/superadmin/admin/institutions/${inst.id}/areas`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 rounded-full font-mono font-bold text-[10px] transition-all cursor-pointer"
                            title="Manage Level 3 Areas"
                          >
                            <span>{zoneCount} Areas</span>
                          </button>
                        </td>

                        {/* Status Toggle */}
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleToggleStatus(inst)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider border transition-all ${
                              inst.status === 'published' 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                : inst.status === 'draft'
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                : 'bg-slate-800 border-slate-700 text-slate-500'
                            }`}
                          >
                            {inst.status === 'published' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>{inst.status || 'published'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => navigate(`/superadmin/admin/institutions/${inst.id}/areas`)}
                              className="px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 rounded-lg text-[10px] font-extrabold tracking-wider uppercase transition-colors flex items-center gap-1"
                              title="Manage Level 3 Areas"
                            >
                              <span>Areas</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicate(inst)}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 rounded hover:text-slate-200 transition-colors"
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(inst)}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 rounded hover:text-white transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(inst.id, inst.name)}
                              className="p-1.5 hover:bg-rose-500/10 text-rose-400 rounded hover:text-rose-300 transition-colors"
                              title="Delete Institution"
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
              <span>TOTAL OBJECTS: {filteredInstitutions.length}</span>
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
                  {editingId ? 'Modify Institution Module' : 'Register New Institution'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">Level 2 Node Nested in: {industry?.name}</p>
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
                className={`py-2 px-1 border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'details' ? 'border-indigo-500 text-indigo-400' : 'border-transparent hover:text-slate-300'}`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Details & Media</span>
              </button>
              <button
                onClick={() => setActiveTab('seo')}
                className={`py-2 px-1 border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'seo' ? 'border-indigo-500 text-indigo-400' : 'border-transparent hover:text-slate-300'}`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>SEO Parameters</span>
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`py-2 px-1 border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'contact' ? 'border-indigo-500 text-indigo-400' : 'border-transparent hover:text-slate-300'}`}
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Contact & CTA</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="flex-grow overflow-y-auto p-6 space-y-4 text-xs">
              {activeTab === 'details' && (
                <div className="space-y-4">
                  {/* Industry Auto-Assign Display */}
                  <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-center justify-between">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Assigned Parent Industry:</span>
                    <span className="font-mono text-indigo-400 font-black">{industry?.name} (Auto-Locked)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold uppercase tracking-wider">Institution Name *</label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. K-12 School"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all"
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
                        placeholder="e.g. k-12-school"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all font-mono"
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
                        placeholder="e.g. School"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all font-mono"
                      />
                    </div>

                    {/* Status & Featured */}
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-semibold uppercase tracking-wider">Status</label>
                        <select
                          value={formStatus}
                          onChange={(e) => setFormStatus(e.target.value as any)}
                          className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all"
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
                          className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all"
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
                      placeholder="e.g. Integrated edge security for junior and senior school academies."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all"
                    />
                  </div>

                  {/* Full Description */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold uppercase tracking-wider">Full Content Description</label>
                    <textarea
                      rows={3}
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      placeholder="Detailed overview about hardware access portals, real-time vehicle audits, and student presence tracking technologies."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all resize-none leading-relaxed"
                    />
                  </div>

                  {/* Images */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ImageUploader
                      value={formCardImage}
                      onChange={setFormCardImage}
                      label="Card Image"
                    />

                    <ImageUploader
                      value={formCoverImage}
                      onChange={setFormCoverImage}
                      label="Cover Image"
                    />
                  </div>
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
                      placeholder={formName ? `${formName} Campus Security` : "Meta Title"}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all"
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
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all resize-none leading-relaxed"
                    />
                  </div>

                  {/* Keywords */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold uppercase tracking-wider">Keywords (Comma Separated)</label>
                    <input
                      type="text"
                      value={formSeoKeywords}
                      onChange={(e) => setFormSeoKeywords(e.target.value)}
                      placeholder="e.g. academy security, k12 safety, student access control"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="space-y-4">
                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="contact@academy.edu"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold uppercase tracking-wider">Phone number</label>
                      <input
                        type="text"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="+1 555-0199"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold uppercase tracking-wider">Website URL</label>
                      <input
                        type="text"
                        value={formWebsite}
                        onChange={(e) => setFormWebsite(e.target.value)}
                        placeholder="https://academy.edu"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* CTA button config */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold uppercase tracking-wider">Button Label</label>
                      <input
                        type="text"
                        value={formCtaText}
                        onChange={(e) => setFormCtaText(e.target.value)}
                        placeholder="e.g. Learn More"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-semibold uppercase tracking-wider">Button Action URL</label>
                      <input
                        type="text"
                        value={formCtaLink}
                        onChange={(e) => setFormCtaLink(e.target.value)}
                        placeholder="e.g. /k12-plans"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all font-mono"
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
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-950/20"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingId ? 'Apply Changes' : 'Register Institution'}</span>
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
        title="Delete Institution"
        itemName={deleteModal.name}
        message={`Are you sure you want to permanently delete the Institution "${deleteModal.name}"?`}
        blockedMessage={deleteModal.blockedMessage}
        isDeleting={deleteModal.isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: '', name: '', blockedMessage: null, isDeleting: false })}
      />
    </div>
  );
}
