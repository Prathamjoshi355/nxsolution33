import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Edit2, Trash2, Copy, Search, ArrowLeft, 
  Cpu, Save, X, Globe, RefreshCw, ArrowRight, Shield, 
  Layers, Check, Sparkles, AlertCircle, MoveUp, MoveDown, ExternalLink, Image as ImageIcon
} from 'lucide-react';
import { apiService } from '../../Public/Services/api';
import { TechnologyItem, TechnologyCategory } from '../../types';
import ImageUploader from '../../Public/Components/ImageUploader';
import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function TechnologyManagement() {
  const navigate = useNavigate();

  const [technologies, setTechnologies] = useState<TechnologyItem[]>([]);
  const [categories, setCategories] = useState<TechnologyCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    id: '',
    name: '',
    isDeleting: false,
  });

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form State for Add / Edit Technology
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formLogo, setFormLogo] = useState('');
  const [formCategory, setFormCategory] = useState('CCTV');
  const [formWebsite, setFormWebsite] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<'published' | 'draft' | 'archived'>('published');
  const [formOrder, setFormOrder] = useState<number>(1);

  // Category Add Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [techList, catList] = await Promise.all([
        apiService.getAdminTechnologies(),
        apiService.getTechnologyCategories()
      ]);
      setTechnologies(techList);
      setCategories(catList);
      setError(null);
    } catch (err: any) {
      console.error('Error loading technologies:', err);
      setError('Failed to fetch Technology Ecosystem data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormName('');
    setFormLogo('');
    setFormCategory(categories[0]?.name || 'CCTV');
    setFormWebsite('');
    setFormDescription('');
    setFormStatus('published');
    setFormOrder(technologies.length + 1);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tech: TechnologyItem) => {
    setEditingId(tech.id);
    setFormName(tech.name);
    setFormLogo(tech.logo || '');
    setFormCategory(tech.category || categories[0]?.name || 'CCTV');
    setFormWebsite(tech.website || '');
    setFormDescription(tech.description || '');
    setFormStatus(tech.status || 'published');
    setFormOrder(tech.order || 1);
    setIsModalOpen(true);
  };

  const handleDuplicate = async (tech: TechnologyItem) => {
    try {
      const dupTech: any = {
        name: `${tech.name} (Copy)`,
        logo: tech.logo,
        category: tech.category,
        website: tech.website,
        description: tech.description,
        status: 'draft',
        order: technologies.length + 1
      };
      await apiService.saveAdminTechnology(dupTech);
      showToast(`Duplicated "${tech.name}" successfully.`);
      fetchData();
    } catch (err: any) {
      alert('Error duplicating technology: ' + err.message);
    }
  };

  const openDeleteModal = (id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      id,
      name,
      isDeleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    try {
      await apiService.deleteAdminTechnology(deleteModal.id);
      showToast(`Deleted technology "${deleteModal.name}" successfully.`);
      setDeleteModal({ isOpen: false, id: '', name: '', isDeleting: false });
      fetchData();
    } catch (err: any) {
      showToast(`Error deleting technology: ${err.message || 'Please try again.'}`);
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleSaveTechnology = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Please enter Technology Name.');
      return;
    }

    try {
      const techPayload: any = {
        id: editingId || undefined,
        name: formName.trim(),
        logo: formLogo,
        category: formCategory,
        website: formWebsite.trim(),
        description: formDescription.trim(),
        status: formStatus,
        order: Number(formOrder) || 1
      };

      await apiService.saveAdminTechnology(techPayload);
      showToast(editingId ? `Updated technology "${formName}"` : `Added new technology "${formName}"`);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert('Error saving technology: ' + err.message);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await apiService.addTechnologyCategory(newCategoryName.trim());
      showToast(`Added category "${newCategoryName.trim()}"`);
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert('Error adding category: ' + err.message);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const newItems = [...filteredTechnologies];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;

    // Swap order
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;

    const orderedIds = newItems.map(t => t.id);
    try {
      await apiService.reorderAdminTechnologies(orderedIds);
      showToast('Reordered technologies');
      fetchData();
    } catch (err: any) {
      alert('Error reordering: ' + err.message);
    }
  };

  // Filtered List
  const filteredTechnologies = technologies.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Category counts
  const publishedCount = technologies.filter(t => t.status === 'published').length;
  const draftCount = technologies.filter(t => t.status === 'draft').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-emerald-400 font-semibold text-xs animate-bounce">
          <Check className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Admin Top Bar Navigation */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/superadmin/admin')}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700 flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <h1 className="text-base font-extrabold text-white tracking-tight">Technology Ecosystem CMS</h1>
            </div>
            <p className="text-[11px] text-slate-400">Single Source of Truth for Technology Partners & Stack Modules</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Categories ({categories.length})</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Technology</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-6">
        {/* Stat Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Technologies</p>
              <h3 className="text-2xl font-black text-white mt-1">{technologies.length}</h3>
            </div>
            <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Published Partners</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">{publishedCount}</h3>
            </div>
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Draft / Archived</p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">{draftCount}</h3>
            </div>
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Categories</p>
              <h3 className="text-2xl font-black text-sky-400 mt-1">{categories.length}</h3>
            </div>
            <div className="w-10 h-10 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search technology by name or description..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Category:</span>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <button
              onClick={fetchData}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700"
              title="Refresh Technology List"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
            <span>Loading Technology Ecosystem Repository...</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-6 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <span>{error}</span>
            </div>
            <button onClick={fetchData} className="px-3 py-1.5 bg-rose-900 hover:bg-rose-800 text-white rounded-lg font-bold">
              Retry
            </button>
          </div>
        )}

        {/* Technology Items Table */}
        {!loading && !error && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {filteredTechnologies.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <Cpu className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold">No Technology Partners Found</p>
                <p className="text-xs text-slate-500">Try adjusting your filter settings or click "Add Technology" to create a new partner entry.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4 w-16 text-center">Order</th>
                      <th className="py-3.5 px-4 w-20">Logo</th>
                      <th className="py-3.5 px-4">Technology Brand</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Official Website</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                    {filteredTechnologies.map((tech, idx) => (
                      <tr key={tech.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Order & Move buttons */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-slate-500 text-[11px] font-mono w-4">{idx + 1}</span>
                            <div className="flex flex-col gap-0.5">
                              <button
                                disabled={idx === 0}
                                onClick={() => handleMoveOrder(idx, 'up')}
                                className="p-0.5 text-slate-400 hover:text-indigo-400 disabled:opacity-20"
                                title="Move Up"
                              >
                                <MoveUp className="w-3 h-3" />
                              </button>
                              <button
                                disabled={idx === filteredTechnologies.length - 1}
                                onClick={() => handleMoveOrder(idx, 'down')}
                                className="p-0.5 text-slate-400 hover:text-indigo-400 disabled:opacity-20"
                                title="Move Down"
                              >
                                <MoveDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Logo Thumbnail */}
                        <td className="py-3 px-4">
                          <div className="w-12 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden p-1">
                            {tech.logo ? (
                              <img src={tech.logo} alt={tech.name} className="max-h-full max-w-full object-contain" />
                            ) : (
                              <span className="text-[10px] font-black text-slate-500 tracking-wider">
                                {tech.name.substring(0, 3).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Name & Short Description */}
                        <td className="py-3 px-4">
                          <div>
                            <span className="font-bold text-white text-sm">{tech.name}</span>
                            {tech.description && (
                              <p className="text-[11px] text-slate-400 truncate max-w-xs">{tech.description}</p>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className="inline-block px-2.5 py-1 bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                            {tech.category || 'General'}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-4">
                          {tech.status === 'published' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-lg">
                              <Check className="w-3 h-3" /> Published
                            </span>
                          ) : tech.status === 'draft' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-950/60 border border-amber-500/30 text-amber-400 text-[10px] font-bold rounded-lg">
                              <AlertCircle className="w-3 h-3" /> Draft
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-bold rounded-lg">
                              Archived
                            </span>
                          )}
                        </td>

                        {/* Official Website Link */}
                        <td className="py-3 px-4">
                          {tech.website ? (
                            <a
                              href={tech.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sky-400 hover:text-sky-300 font-semibold inline-flex items-center gap-1 transition-colors text-[11px]"
                            >
                              <span>{tech.website.replace(/^https?:\/\//, '')}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-slate-600 text-[11px]">N/A</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(tech)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg transition-colors"
                              title="Edit Technology"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicate(tech)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg transition-colors"
                              title="Duplicate Technology"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(tech.id, tech.name)}
                              className="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-rose-400 rounded-lg transition-colors"
                              title="Delete Technology"
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
          </div>
        )}
      </div>

      {/* Add / Edit Technology Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-extrabold text-white">
                  {editingId ? 'Edit Technology Partner' : 'Add New Technology Partner'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTechnology} className="space-y-5">
              {/* Name & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Technology Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HIKVISION, Dahua, AWS"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-300">Category</label>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="text-[10px] text-indigo-400 hover:underline font-bold"
                    >
                      + Add Category
                    </button>
                  </div>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Logo Image Upload Component */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Brand Logo (Image Upload / Vector Logo)
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Upload official SVG, PNG, WebP or JPG logo (Max 5MB).
                </p>
                <ImageUploader
                  value={formLogo}
                  onChange={setFormLogo}
                  placeholder="Upload technology partner logo..."
                  aspectRatio="logo"
                />
              </div>

              {/* Official Website & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Official Website URL</label>
                  <input
                    type="url"
                    placeholder="https://www.hikvision.com"
                    value={formWebsite}
                    onChange={e => setFormWebsite(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Display Order Number</label>
                  <input
                    type="number"
                    min="1"
                    value={formOrder}
                    onChange={e => setFormOrder(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Leading CCTV & Video Surveillance Solutions"
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Publish Status</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-semibold">
                    <input
                      type="radio"
                      name="techStatus"
                      value="published"
                      checked={formStatus === 'published'}
                      onChange={() => setFormStatus('published')}
                      className="accent-emerald-500"
                    />
                    <span>Published</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-semibold">
                    <input
                      type="radio"
                      name="techStatus"
                      value="draft"
                      checked={formStatus === 'draft'}
                      onChange={() => setFormStatus('draft')}
                      className="accent-amber-500"
                    />
                    <span>Draft</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-semibold">
                    <input
                      type="radio"
                      name="techStatus"
                      value="archived"
                      checked={formStatus === 'archived'}
                      onChange={() => setFormStatus('archived')}
                      className="accent-slate-500"
                    />
                    <span>Archived</span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Technology</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-extrabold text-white">Manage Technology Categories</h3>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                placeholder="New category name..."
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl"
              >
                Add
              </button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Existing Categories:</p>
              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                  <span key={c.id} className="px-3 py-1 bg-slate-950 border border-slate-800 text-slate-300 text-xs font-semibold rounded-lg">
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete Technology"
        itemName={deleteModal.name}
        message={`Are you sure you want to permanently delete "${deleteModal.name}" from Technology Ecosystem?`}
        isDeleting={deleteModal.isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: '', name: '', isDeleting: false })}
      />
    </div>
  );
}
