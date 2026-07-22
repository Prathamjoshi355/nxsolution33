import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Edit2, Trash2, Copy, Search, ArrowLeft, 
  Save, X, RefreshCw, Check, AlertCircle, MoveUp, MoveDown, Star, MessageSquareQuote,
  Building2, UserCheck, Briefcase, MapPin, FolderKanban, ShieldCheck, Filter
} from 'lucide-react';
import { apiService } from '../../Public/Services/api';
import { TestimonialItem } from '../../types';
import ImageUploader from '../../Public/Components/ImageUploader';
import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function TestimonialsManagement() {
  const navigate = useNavigate();

  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');

  // Form State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [designation, setDesignation] = useState('');
  const [organization, setOrganization] = useState('');
  const [industry, setIndustry] = useState('Education');
  const [clientPhoto, setClientPhoto] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [testimonialText, setTestimonialText] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [projectName, setProjectName] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>('published');
  const [order, setOrder] = useState<number>(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const list = await apiService.getAdminTestimonials();
      setTestimonials(list);
      setError(null);
    } catch (err: any) {
      console.error('Error loading testimonials:', err);
      setError('Failed to fetch Testimonials data. Please try again.');
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
    setClientName('');
    setDesignation('');
    setOrganization('');
    setIndustry('Education');
    setClientPhoto('');
    setCompanyLogo('');
    setTestimonialText('');
    setRating(5);
    setProjectName('');
    setLocation('');
    setStatus('published');
    setOrder(testimonials.length + 1);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: TestimonialItem) => {
    setEditingId(item.id);
    setClientName(item.clientName || '');
    setDesignation(item.designation || '');
    setOrganization(item.organization || '');
    setIndustry(item.industry || 'Education');
    setClientPhoto(item.clientPhoto || '');
    setCompanyLogo(item.companyLogo || '');
    setTestimonialText(item.testimonial || '');
    setRating(item.rating || 5);
    setProjectName(item.projectName || '');
    setLocation(item.location || '');
    setStatus(item.status || 'published');
    setOrder(item.order || 1);
    setIsModalOpen(true);
  };

  const handleDuplicate = async (item: TestimonialItem) => {
    try {
      const dup: any = {
        clientName: `${item.clientName} (Copy)`,
        designation: item.designation,
        organization: item.organization,
        industry: item.industry,
        clientPhoto: item.clientPhoto,
        companyLogo: item.companyLogo,
        testimonial: item.testimonial,
        rating: item.rating || 5,
        projectName: item.projectName,
        location: item.location,
        status: 'draft',
        order: testimonials.length + 1
      };
      await apiService.saveAdminTestimonial(dup);
      showToast('Testimonial duplicated successfully as draft.');
      fetchData();
    } catch (err: any) {
      console.error('Error duplicating:', err);
      alert('Failed to duplicate testimonial.');
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
      await apiService.deleteAdminTestimonial(deleteModal.id);
      showToast('Testimonial deleted successfully.');
      setDeleteModal({ isOpen: false, id: '', name: '', isDeleting: false });
      fetchData();
    } catch (err: any) {
      showToast('Failed to delete testimonial. Please try again.');
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert('Client Name is required.');
      return;
    }
    if (!organization.trim()) {
      alert('Company / Organization is required.');
      return;
    }
    if (!testimonialText.trim()) {
      alert('Testimonial Content is required.');
      return;
    }

    try {
      const payload: TestimonialItem = {
        id: editingId || `testi-${Date.now()}`,
        clientName: clientName.trim(),
        designation: designation.trim() || clientName.trim(),
        organization: organization.trim(),
        industry: industry.trim(),
        clientPhoto,
        companyLogo,
        testimonial: testimonialText.trim(),
        rating,
        projectName: projectName.trim(),
        location: location.trim(),
        status,
        order
      };

      await apiService.saveAdminTestimonial(payload);
      showToast(editingId ? 'Testimonial updated successfully.' : 'New testimonial created successfully.');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Error saving testimonial:', err);
      alert('Failed to save testimonial: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const listCopy = [...filteredTestimonials];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= listCopy.length) return;

    const temp = listCopy[index];
    listCopy[index] = listCopy[targetIndex];
    listCopy[targetIndex] = temp;

    const orderedIds = listCopy.map(t => t.id);
    try {
      await apiService.reorderAdminTestimonials(orderedIds);
      fetchData();
    } catch (err) {
      console.error('Failed to reorder testimonials:', err);
    }
  };

  // Industries extracted dynamically
  const availableIndustries = Array.from(
    new Set(testimonials.map(t => t.industry).filter(Boolean))
  );

  const filteredTestimonials = testimonials.filter(item => {
    const matchesSearch = 
      item.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.testimonial?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesIndustry = industryFilter === 'all' || item.industry === industryFilter;

    return matchesSearch && matchesStatus && matchesIndustry;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-semibold animate-bounce">
          <Check className="w-5 h-5" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <button 
            onClick={() => navigate('/superadmin/admin/dashboard')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white mb-2 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <MessageSquareQuote className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Testimonials Module
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Single Source of Truth
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage client testimonials centrally. Selected testimonials render across Home Page & landing sections without data duplication.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Testimonial
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Search & Filter Toolbar */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by client, organization, quote..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
              >
                <option value="all" className="bg-slate-800">All Statuses</option>
                <option value="published" className="bg-slate-800">Published</option>
                <option value="draft" className="bg-slate-800">Draft</option>
                <option value="archived" className="bg-slate-800">Archived</option>
              </select>
            </div>

            {/* Industry Filter */}
            {availableIndustries.length > 0 && (
              <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
                >
                  <option value="all" className="bg-slate-800">All Industries</option>
                  {availableIndustries.map(ind => (
                    <option key={ind} value={ind} className="bg-slate-800">{ind}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Testimonials List Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
            <p className="text-slate-400 text-sm">Loading Testimonials Module...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-6 rounded-2xl text-center font-medium">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            {error}
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-12 text-center space-y-3">
            <MessageSquareQuote className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-white font-bold text-base">No Testimonials Found</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all' ? 'No items match your search or filter criteria.' : 'Start by adding your first enterprise testimonial.'}
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-2 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-xs"
            >
              <Plus className="w-4 h-4" />
              Add Testimonial
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTestimonials.map((item, index) => (
              <div 
                key={item.id}
                className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-slate-600 transition-all group"
              >
                <div className="space-y-3">
                  {/* Top Bar: Status, Public ID, Order */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        item.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        item.status === 'draft' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {item.status}
                      </span>
                      {item.publicId && (
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                          {item.publicId}
                        </span>
                      )}
                      {item.industry && (
                        <span className="text-[10px] font-semibold text-slate-300 bg-slate-700/50 px-2 py-0.5 rounded-full">
                          {item.industry}
                        </span>
                      )}
                    </div>

                    {/* Order Move controls */}
                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleMoveOrder(index, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(index, 'down')}
                        disabled={index === filteredTestimonials.length - 1}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Quote & Stars */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${i < (item.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} 
                        />
                      ))}
                    </div>
                    <p className="text-slate-200 text-xs md:text-sm font-medium leading-relaxed italic bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/40">
                      “{item.testimonial}”
                    </p>
                  </div>

                  {/* Author Meta */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-3">
                      {item.clientPhoto ? (
                        <img 
                          src={item.clientPhoto} 
                          alt={item.clientName} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-600"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs">
                          {item.clientName.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-white font-bold text-xs md:text-sm">{item.author || item.clientName}</p>
                        <p className="text-slate-400 text-xs">{item.organization}</p>
                        {item.designation && item.designation !== item.clientName && (
                          <p className="text-slate-500 text-[11px]">{item.designation}</p>
                        )}
                      </div>
                    </div>

                    {item.companyLogo && (
                      <img 
                        src={item.companyLogo} 
                        alt="Logo" 
                        className="h-7 max-w-[80px] object-contain opacity-80" 
                      />
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-700/60">
                  <div className="text-[10px] text-slate-500 font-mono">
                    Order: #{item.order || index + 1}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDuplicate(item)}
                      className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs px-2.5 font-semibold"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(item.id, item.clientName)}
                      className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Testimonial Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquareQuote className="w-5 h-5 text-emerald-400" />
                {editingId ? 'Edit Testimonial' : 'Create Enterprise Testimonial'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client / Author Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Author / Client Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Director Operations"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Rendered as author label (e.g. "- Director Operations")</p>
                </div>

                {/* Organization */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Company / Organization <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Leading Educational Institution"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Designation */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Designation (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Facility Manager"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Industry Vertical */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Industry Vertical
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Education">Education</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Smart Cities">Smart Cities</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Retail">Retail</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>

                {/* Rating (1-5 stars) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Rating (1-5 Stars)
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value={5}>5 Stars ⭐⭐⭐⭐⭐</option>
                    <option value={4}>4 Stars ⭐⭐⭐⭐</option>
                    <option value={3}>3 Stars ⭐⭐⭐</option>
                    <option value={2}>2 Stars ⭐⭐</option>
                    <option value={1}>1 Star ⭐</option>
                  </select>
                </div>
              </div>

              {/* Testimonial Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Testimonial Quote Content <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter client testimonial statement..."
                  value={testimonialText}
                  onChange={(e) => setTestimonialText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              {/* Media Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-700/60">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Client Photo (Optional)
                  </label>
                  <ImageUploader 
                    value={clientPhoto}
                    onChange={(url) => setClientPhoto(url)}
                    label="Upload Client Photo"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Company Logo (Optional)
                  </label>
                  <ImageUploader 
                    value={companyLogo}
                    onChange={(url) => setCompanyLogo(url)}
                    label="Upload Company Logo"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Project Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Project Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Smart Campus Security"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    City / Location (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. New Delhi, NCR"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-700 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 cursor-pointer transition-all"
                >
                  <Save className="w-4 h-4" />
                  Save Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete Testimonial"
        itemName={deleteModal.name}
        message={`Are you sure you want to permanently delete the testimonial for "${deleteModal.name}"?`}
        isDeleting={deleteModal.isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: '', name: '', isDeleting: false })}
      />
    </div>
  );
}
