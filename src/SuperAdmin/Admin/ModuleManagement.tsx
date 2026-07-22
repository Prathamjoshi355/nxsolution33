import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, Edit2, Trash2, Copy, Eye, EyeOff, Search, ArrowLeft, 
  Cpu, Save, X, Globe, Sliders, FileText, AlertCircle, RefreshCw, 
  ArrowRight, Shield, Layers, CheckCircle, Info, ChevronRight
} from 'lucide-react';
import { apiService } from '../../Public/Services/api';
import { Industry, Institution, Zone, Problem, Module } from '../../types';
import ImageUploader from '../../Public/Components/ImageUploader';

import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function ModuleManagement() {
  const { problemId } = useParams<{ problemId: string }>();
  const navigate = useNavigate();

  // Cascade Hierarchy State
  const [industry, setIndustry] = useState<Industry | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [area, setArea] = useState<Zone | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);

  // Modules state
  const [modules, setModules] = useState<Module[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formShortDescription, setFormShortDescription] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formGalleryImages, setFormGalleryImages] = useState<string[]>([]);
  const [formIcon, setFormIcon] = useState('Cpu');
  const [formStatus, setFormStatus] = useState<'draft' | 'published' | 'disabled'>('published');
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(0);
  
  // SEO fields
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [seoMetaImage, setSeoMetaImage] = useState('');

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    if (problemId) {
      fetchCascadeAndModules();
    }
  }, [problemId]);

  const fetchCascadeAndModules = async () => {
    setLoading(true);
    try {
      // 1. Load Problem first
      const allProblems = await apiService.getProblems();
      const matchedProblem = allProblems.find((p: any) => p.id === problemId);
      if (!matchedProblem) {
        setError('The specified Problem node was not found.');
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

      // 5. Fetch modules for this problem
      const fetchedModules = await apiService.getModulesByProblem(problemId);
      setModules(fetchedModules || []);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('An error occurred while loading the Modules Management cascading chain.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingModule(null);
    setFormName('');
    setFormSlug('');
    setFormShortDescription('');
    setFormDescription('');
    setFormCoverImage('');
    setFormGalleryImages([]);
    setFormIcon('Cpu');
    setFormStatus('published');
    setFormDisplayOrder(modules.length + 1);
    setSeoTitle('');
    setSeoDescription('');
    setSeoKeywords('');
    setSeoMetaImage('');
    setIsModalOpen(true);
  };

  const openEditModal = (mod: Module) => {
    setEditingModule(mod);
    setFormName(mod.name || '');
    setFormSlug(mod.slug || '');
    setFormShortDescription(mod.shortDescription || '');
    setFormDescription(mod.description || '');
    setFormCoverImage(mod.coverImage || '');
    setFormGalleryImages(mod.galleryImages || []);
    setFormIcon(mod.icon || 'Cpu');
    setFormStatus(mod.status || 'published');
    setFormDisplayOrder(mod.displayOrder || mod.sortOrder || 0);
    setSeoTitle(mod.seo?.metaTitle || '');
    setSeoDescription(mod.seo?.metaDescription || '');
    setSeoKeywords(mod.seo?.keywords || '');
    setSeoMetaImage(mod.seo?.metaImage || '');
    setIsModalOpen(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('error', 'Module Name is a required parameter.');
      return;
    }

    try {
      const payload: Partial<Module> = {
        id: editingModule?.id,
        problemId: problemId!,
        name: formName.trim(),
        slug: formSlug.trim() || undefined,
        shortDescription: formShortDescription.trim(),
        description: formDescription.trim(),
        coverImage: formCoverImage,
        galleryImages: formGalleryImages,
        icon: formIcon,
        status: formStatus,
        displayOrder: Number(formDisplayOrder),
        sortOrder: Number(formDisplayOrder),
        seo: {
          metaTitle: seoTitle.trim(),
          metaDescription: seoDescription.trim(),
          keywords: seoKeywords.trim(),
          metaImage: seoMetaImage
        }
      };

      const res = await apiService.saveModule(payload);
      if (res.success) {
        showToast('success', editingModule ? `Module "${formName}" updated successfully.` : `Module "${formName}" created successfully.`);
        setIsModalOpen(false);
        fetchCascadeAndModules();
      } else {
        showToast('error', res.error || 'Failed to save Module record.');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Failed to save Module.';
      showToast('error', errMsg);
    }
  };

  const openDeleteModal = async (id: string, name: string) => {
    let blockedMessage: string | null = null;
    try {
      const solutions = await apiService.getSolutionsByModule(id);
      if (solutions && solutions.length > 0) {
        blockedMessage = `Cannot delete "${name}": This Module contains ${solutions.length} active Solution(s). Please remove or reassign all Solutions first.`;
      }
    } catch (e) {
      // disregard if solutions API fails or empty
    }

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
      await apiService.deleteModule(deleteModal.id);
      showToast('success', `Module "${deleteModal.name}" deleted successfully.`);
      setDeleteModal({ isOpen: false, id: '', name: '', blockedMessage: null, isDeleting: false });
      fetchCascadeAndModules();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Failed to delete the Module.';
      showToast('error', errMsg);
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDuplicateModule = async (mod: Module) => {
    const duplicated: Partial<Module> = {
      problemId: mod.problemId,
      name: `${mod.name} (Copy)`,
      slug: `${mod.slug}-copy`,
      shortDescription: mod.shortDescription,
      description: mod.description,
      coverImage: mod.coverImage,
      galleryImages: mod.galleryImages ? [...mod.galleryImages] : [],
      icon: mod.icon || 'Cpu',
      status: 'draft',
      displayOrder: modules.length + 1,
      sortOrder: modules.length + 1,
      seo: mod.seo ? { ...mod.seo } : undefined
    };

    try {
      await apiService.saveModule(duplicated);
      showToast('success', `Duplicated "${mod.name}" successfully into draft state.`);
      fetchCascadeAndModules();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Failed to duplicate Module.';
      showToast('error', errMsg);
    }
  };

  const handleToggleStatus = async (mod: Module) => {
    const nextStatus: 'draft' | 'published' | 'disabled' = 
      mod.status === 'published' ? 'draft' : mod.status === 'draft' ? 'disabled' : 'published';

    try {
      const payload: Partial<Module> = {
        ...mod,
        status: nextStatus
      };
      await apiService.saveModule(payload);
      showToast('success', `Module "${mod.name}" status updated to ${nextStatus}.`);
      fetchCascadeAndModules();
    } catch (err: any) {
      showToast('error', 'Failed to toggle Module status.');
    }
  };

  // Add a gallery image slot
  const handleAddGalleryImage = () => {
    setFormGalleryImages([...formGalleryImages, '']);
  };

  // Update specific gallery image URL
  const handleUpdateGalleryImage = (index: number, url: string) => {
    const nextImages = [...formGalleryImages];
    nextImages[index] = url;
    setFormGalleryImages(nextImages);
  };

  // Remove specific gallery image slot
  const handleRemoveGalleryImage = (index: number) => {
    setFormGalleryImages(formGalleryImages.filter((_, idx) => idx !== index));
  };

  const filteredModules = modules.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.shortDescription && m.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-xs text-slate-400 mt-3 font-medium uppercase tracking-widest font-mono">Loading CMS level 4.5 Modules...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h3 className="text-lg font-bold">Cascade Loading Failure</h3>
        <p className="text-slate-400 text-xs mt-1 max-w-md text-center">{error}</p>
        <button
          onClick={() => navigate('/superadmin/admin/industries')}
          className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Industry Hub</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-2.5 animate-bounce ${
          notification.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-950/90 border-rose-500/30 text-rose-300'
        }`}>
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Admin Navbar */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/superadmin/admin/areas/${area?.id}/problems`)}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
            title="Return to Parent Problems"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-white uppercase font-mono">Module Management</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Problem Context: <span className="text-indigo-400">{problem?.name}</span></p>
            </div>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all hover:scale-[1.02] flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Module</span>
        </button>
      </nav>

      {/* Breadcrumb Path Context Bar */}
      <div className="bg-slate-900/40 border-b border-slate-800/80 px-6 py-3.5 flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-400">
        <span className="hover:text-indigo-400 cursor-pointer transition-colors" onClick={() => navigate('/superadmin/admin/industries')}>Home</span>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="hover:text-indigo-400 cursor-pointer transition-colors" onClick={() => navigate('/superadmin/admin/industries')}>{industry?.name || 'Industry'}</span>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="hover:text-indigo-400 cursor-pointer transition-colors" onClick={() => navigate(`/superadmin/admin/industries/${industry?.id}/institutions`)}>{institution?.name || 'Institution'}</span>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="hover:text-indigo-400 cursor-pointer transition-colors" onClick={() => navigate(`/superadmin/admin/institutions/${institution?.id}/areas`)}>{area?.name || 'Area'}</span>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="hover:text-indigo-400 cursor-pointer transition-colors" onClick={() => navigate(`/superadmin/admin/areas/${area?.id}/problems`)}>{problem?.name || 'Problem'}</span>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-slate-100 font-extrabold">Level 4.5 Modules ({modules.length})</span>
      </div>

      {/* Main CMS Container */}
      <main className="flex-grow p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Quick Help card */}
        <div className="bg-gradient-to-r from-indigo-950/20 via-slate-900 to-slate-900 border border-indigo-500/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs uppercase tracking-wider font-extrabold text-indigo-400 font-mono">Visual Webflow Hierarchy Level 4.5</h4>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Define the modular sub-systems that address the <strong>{problem?.name}</strong> business challenge. A Solution page must belong directly to a Module. Toggle status to instantly update the public portal flow.
            </p>
          </div>
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-2.5 text-center font-mono text-[10px] text-indigo-300">
            Current Problem: {problem?.name}
          </div>
        </div>

        {/* Filters/Search Row */}
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search local modules by title, descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition-all"
            />
          </div>
          <div className="text-xs font-mono text-slate-400">
            Showing {filteredModules.length} of {modules.length} Modules
          </div>
        </div>

        {/* Modules Table / Grid */}
        {filteredModules.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-3xl p-12 text-center space-y-4">
            <div className="w-12 h-12 bg-slate-900 text-slate-500 rounded-2xl flex items-center justify-center mx-auto border border-slate-800">
              <Layers className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h5 className="text-sm font-bold text-slate-300">No Modules Configured</h5>
              <p className="text-xs text-slate-500 max-w-md mx-auto">Create a module below to begin partitioning the parent problem into logical sub-engines.</p>
            </div>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/20 text-indigo-300 hover:text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Module</span>
            </button>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 font-mono text-[9px] uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-6 font-semibold">Display Order</th>
                  <th className="py-3 px-6 font-semibold">Module Name</th>
                  <th className="py-3 px-6 font-semibold">Slug</th>
                  <th className="py-3 px-6 font-semibold">Status</th>
                  <th className="py-3 px-6 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredModules.map((mod) => (
                  <tr key={mod.id} className="hover:bg-slate-900/30 transition-all group">
                    <td className="py-4 px-6 font-mono text-slate-500 font-bold">
                      {mod.displayOrder || mod.sortOrder || 0}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-200">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="hover:text-indigo-400 cursor-pointer font-extrabold text-slate-100" onClick={() => openEditModal(mod)}>{mod.name}</div>
                          {mod.shortDescription && <p className="text-[10px] text-slate-500 font-normal line-clamp-1 mt-0.5 max-w-sm">{mod.shortDescription}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-400">
                      /{mod.slug}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleStatus(mod)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase border tracking-widest ${
                          mod.status === 'published' 
                            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' 
                            : mod.status === 'draft' 
                            ? 'bg-amber-950/40 border-amber-500/30 text-amber-400' 
                            : 'bg-rose-950/40 border-rose-500/30 text-rose-400'
                        }`}
                        title="Click to toggle status"
                      >
                        {mod.status === 'published' ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                        <span>{mod.status || 'published'}</span>
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        
                        {/* Manage Solution action */}
                        <button
                          onClick={() => navigate(`/superadmin/admin/modules/${mod.id}/solution`)}
                          className="px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 rounded-lg text-[10px] font-black tracking-wider uppercase transition-colors flex items-center gap-1"
                          title="Configure Detailed Solution Portal"
                        >
                          <span>Manage Solution</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDuplicateModule(mod)}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 rounded hover:text-slate-200 transition-colors"
                          title="Duplicate Module"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => openEditModal(mod)}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 rounded hover:text-slate-200 transition-colors"
                          title="Edit Module Fields"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => openDeleteModal(mod.id, mod.name)}
                          className="p-1.5 hover:bg-rose-950/30 hover:text-rose-400 text-slate-500 rounded transition-colors"
                          title="Delete Module"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-black text-white">{editingModule ? `Edit Module: ${editingModule.name}` : 'Create New Module Node'}</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModule} className="space-y-6">
              
              {/* Core Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 font-mono">Module Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Face Recognition Enforcement"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all text-xs"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 font-mono">Unique URL Slug (Optional)</label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="e.g. face-recognition (auto-generated if empty)"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all text-xs font-mono"
                  />
                </div>

                {/* Display Order */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 font-mono">Display / Sort Order</label>
                  <input
                    type="number"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all text-xs font-mono"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 font-mono">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e: any) => setFormStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all text-xs"
                  >
                    <option value="published">Published (Visible in flow)</option>
                    <option value="draft">Draft (Visible only in admin)</option>
                    <option value="disabled">Disabled (Hidden from portal)</option>
                  </select>
                </div>

              </div>

              {/* Icon Image Uploader */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <ImageUploader
                  value={formIcon.startsWith('http') ? formIcon : ''}
                  onChange={(url) => setFormIcon(url)}
                  label="Module Representation Icon (Upload Image)"
                  placeholder="Upload a vector graphic or high-contrast PNG"
                />
                {!formIcon.startsWith('http') && (
                  <div className="text-[10px] text-slate-500 font-mono">
                    Defaulting to system Lucide Icon: <strong>{formIcon}</strong>. Upload an image above to override.
                  </div>
                )}
              </div>

              {/* Short & Long Description */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 font-mono">Short Description (Cards & Previews) *</label>
                  <textarea
                    rows={2}
                    value={formShortDescription}
                    onChange={(e) => setFormShortDescription(e.target.value)}
                    placeholder="Provide a concise 1-2 sentence description explaining the module's core function..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all text-xs leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 font-mono">Long Description / Details</label>
                  <textarea
                    rows={4}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Describe how the sub-system functions under the hood, how it acts as an intervention..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all text-xs leading-relaxed"
                  />
                </div>
              </div>

              {/* Cover Image & Gallery Images Section (ALL UPLOADER BASED) */}
              <div className="border-t border-slate-800/60 pt-4 space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-extrabold text-indigo-400 font-mono">Visual Media Assets</h4>
                
                {/* Cover Image Uploader */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                  <ImageUploader
                    value={formCoverImage}
                    onChange={(url) => setFormCoverImage(url)}
                    label="Primary Cover Image"
                    placeholder="Upload module cover banner asset"
                  />
                </div>

                {/* Gallery Images List */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 font-mono">Gallery Media Showcase</span>
                    <button
                      type="button"
                      onClick={handleAddGalleryImage}
                      className="px-2 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Gallery Image</span>
                    </button>
                  </div>

                  {formGalleryImages.length === 0 ? (
                    <p className="text-[10px] text-slate-500 italic">No gallery images added yet. Click above to append showcase assets.</p>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {formGalleryImages.map((img, index) => (
                        <div key={index} className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-xl border border-slate-800/60">
                          <div className="flex-grow">
                            <ImageUploader
                              value={img}
                              onChange={(url) => handleUpdateGalleryImage(index, url)}
                              label={`Gallery Image #${index + 1}`}
                              placeholder="Upload showcase image"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(index)}
                            className="p-1.5 bg-rose-950/40 hover:bg-rose-900 text-rose-400 rounded-xl transition-all border border-rose-500/10 mt-5"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* SEO configuration */}
              <div className="border-t border-slate-800/60 pt-4 space-y-4">
                <div className="flex items-center gap-1.5 text-indigo-400">
                  <Globe className="w-4 h-4" />
                  <h4 className="text-xs uppercase tracking-wider font-extrabold font-mono">Meta Search & SEO Settings</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 font-mono">SEO Title / Meta Title</label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="Custom browser tab title"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 font-mono">SEO Keywords</label>
                    <input
                      type="text"
                      value={seoKeywords}
                      onChange={(e) => setSeoKeywords(e.target.value)}
                      placeholder="e.g. face identification, security module, surveillance"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all text-xs"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 font-mono">SEO Description / Meta Description</label>
                    <textarea
                      rows={2}
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder="Search engine snippet preview text..."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 outline-none transition-all text-xs leading-relaxed"
                    />
                  </div>

                  <div className="md:col-span-2 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                    <ImageUploader
                      value={seoMetaImage}
                      onChange={(url) => setSeoMetaImage(url)}
                      label="Social Media Meta Image (OG Image)"
                      placeholder="Upload social preview thumbnail asset"
                    />
                  </div>

                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4.5 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all hover:scale-[1.01] flex items-center gap-1.5 shadow-lg shadow-indigo-600/10"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingModule ? 'Save Changes' : 'Create Module'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete Module"
        itemName={deleteModal.name}
        message={`Are you sure you want to permanently delete the Module "${deleteModal.name}"?`}
        blockedMessage={deleteModal.blockedMessage}
        isDeleting={deleteModal.isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: '', name: '', blockedMessage: null, isDeleting: false })}
      />
    </div>
  );
}
