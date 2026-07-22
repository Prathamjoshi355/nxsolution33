import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Eye,
  Send,
  Layers,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  Settings2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
  Copy,
  Edit2,
  Archive,
  Globe,
  Shield,
  Database,
  Image as ImageIcon,
  FileText,
  Phone,
  Settings,
  Activity,
  Clock,
  Search,
  Folder,
  Calendar,
  User as UserIcon,
  AlignLeft,
  Grid,
  Filter,
  CheckCircle,
  AlertTriangle,
  Upload,
  Link as LinkIcon,
  Star,
  Download,
  PlusCircle,
  Sliders,
  Play
} from 'lucide-react';
import { apiService } from '../../Public/Services/api';
import { Page, Product, CaseStudy, CRMLead, AuditLog, SectionComponent } from '../../types';
import ImageUploader from '../../Public/Components/ImageUploader';
import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function WebsiteManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pages' | 'products' | 'caseStudies' | 'about' | 'resources' | 'contact' | 'media' | 'leads'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [alert, setAlert] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'page' | 'product' | 'caseStudy' | 'faq' | 'media' | 'section' | null;
    id: string | number;
    name: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    type: null,
    id: '',
    name: '',
    isDeleting: false,
  });

  // Core Entity States
  const [pages, setPages] = useState<Page[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  // Page Editor States
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [editingSeo, setEditingSeo] = useState({ title: '', description: '', keywords: '' });
  const [pageVisible, setPageVisible] = useState(true);
  const [editingSections, setEditingSections] = useState<SectionComponent[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  // Product & Case Study Editor States
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingCaseStudy, setEditingCaseStudy] = useState<Partial<CaseStudy> | null>(null);

  // About CMS States (Hero, Timeline, Mission, Vision, Values, FAQs)
  const [aboutFaqs, setAboutFaqs] = useState<{ category: string; q: string; a: string }[]>([]);
  const [faqSearch, setFaqSearch] = useState('');
  const [newFaq, setNewFaq] = useState({ category: 'General', q: '', a: '' });

  // Resources CMS State
  const [editingResource, setEditingResource] = useState<any | null>(null);

  // Contact CMS States & Form Settings
  const [contactSettings, setContactSettings] = useState({
    title: 'Contact Us',
    subtitle: 'We are here to help you!',
    formFields: {
      name: { show: true, required: true },
      email: { show: true, required: true },
      phone: { show: true, required: false },
      company: { show: true, required: false },
      message: { show: true, required: true }
    },
    quoteSettings: {
      buttonText: 'Request an Enterprise Quote',
      successMessage: 'Thank you! Our system architect will connect within 2 hours.',
      enableFields: ['hardware', 'software', 'installation', 'consultation'],
      emailRouting: 'sales@nxsolution.com'
    }
  });

  // Media Library Upload File
  const [dragActive, setDragActive] = useState(false);

  // Load All Entities on Init
  const loadAllCMSData = async () => {
    setLoading(true);
    try {
      const [allPages, allProducts, allCaseStudies, allMedia, allLeads, allLogs] = await Promise.all([
        apiService.getPages(),
        apiService.getProducts(),
        apiService.getCaseStudies(),
        apiService.getMedia().catch(() => []),
        apiService.getLeads().catch(() => []),
        apiService.getLogs().catch(() => [])
      ]);

      setPages(allPages || []);
      setProducts(allProducts || []);
      setCaseStudies(allCaseStudies || []);
      setMedia(allMedia || []);
      setLeads(allLeads || []);
      setLogs(allLogs || []);

      // Extract FAQ lists from /about page if exists
      const aboutPage = allPages?.find(p => p.slug === '/about');
      if (aboutPage) {
        const aboutSection = aboutPage.sections?.find(s => s.type === 'About' || s.id === 'about-faqs');
        if (aboutSection?.content?.faqs) {
          setAboutFaqs(aboutSection.content.faqs);
        }
      }

      // Extract Contact Settings from /contact page if exists
      const contactPage = allPages?.find(p => p.slug === '/contact');
      if (contactPage) {
        const contactSection = contactPage.sections?.find(s => s.type === 'Contact');
        if (contactSection?.content) {
          setContactSettings(prev => ({
            ...prev,
            title: contactSection.content.title || prev.title,
            subtitle: contactSection.content.subtitle || prev.subtitle,
            formFields: contactSection.content.formFields || prev.formFields,
            quoteSettings: contactSection.content.quoteSettings || prev.quoteSettings
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load comprehensive CMS entities:', err);
      showAlert('Failed to connect to MongoDB Atlas server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllCMSData();
  }, []);

  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlert({ text, type });
    setTimeout(() => setAlert(null), 4000);
  };

  // Website Global Page Toggles
  const togglePageVisibility = async (page: Page) => {
    try {
      const updatedVisible = page.visible === false ? true : false;
      await apiService.savePageSections(page.slug, {
        visible: updatedVisible,
        sections: page.sections || []
      });
      showAlert(`Page '${page.name}' visibility toggled to: ${updatedVisible ? 'Enabled' : 'Disabled'}`, 'success');
      loadAllCMSData();
    } catch (err) {
      console.error(err);
      showAlert('Failed to toggle page enabled status.', 'error');
    }
  };

  // Revisions Logic (Stored in Page object)
  const savePageRevision = async (page: Page, type: 'draft' | 'published', targetSections: SectionComponent[]) => {
    // Add custom revision to MongoDB state (we save inside metadata)
    const revisionItem = {
      id: `rev-${Date.now()}`,
      timestamp: new Date().toISOString(),
      editor: 'Administrator',
      type,
      sections: targetSections,
      seo: editingSeo
    };

    const currentRevisions = (page as any).revisions || [];
    const updatedRevisions = [revisionItem, ...currentRevisions].slice(0, 10); // keep last 10

    await apiService.savePageSections(page.slug, {
      ...page,
      sections: type === 'published' ? targetSections : page.sections,
      draftSections: type === 'draft' ? targetSections : page.draftSections,
      revisions: updatedRevisions as any
    });
  };

  // Save Page Draft
  const handleSaveDraft = async () => {
    if (!selectedPage) return;
    setSaving(true);
    try {
      await apiService.savePageSections(selectedPage.slug, {
        name: selectedPage.name,
        visible: pageVisible,
        draftSections: editingSections,
        draftSeo: editingSeo,
        sections: selectedPage.sections, // Keep live untouched
        seo: selectedPage.seo
      });
      
      showAlert(`Draft for '${selectedPage.name}' saved successfully.`, 'success');
      loadAllCMSData();
    } catch (err) {
      console.error(err);
      showAlert('Failed to save draft.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Publish Page Edits Live
  const handlePublishLive = async () => {
    if (!selectedPage) return;
    setPublishing(true);
    try {
      await apiService.savePageSections(selectedPage.slug, {
        name: selectedPage.name,
        visible: pageVisible,
        sections: editingSections,
        seo: editingSeo,
        draftSections: [], // Clear draft
        draftSeo: undefined
      });

      showAlert(`Page '${selectedPage.name}' published live! Changes are visible immediately.`, 'success');
      setSelectedPage(null);
      loadAllCMSData();
    } catch (err) {
      console.error(err);
      showAlert('Failed to publish changes live.', 'error');
    } finally {
      setPublishing(false);
    }
  };

  // Restore Revision
  const handleRestoreRevision = (rev: any) => {
    if (window.confirm('Are you sure you want to restore this historical section backup? Current editing sections will be replaced.')) {
      setEditingSections(rev.sections);
      if (rev.seo) setEditingSeo(rev.seo);
      showAlert('Restored sections state from historical revision!', 'success');
    }
  };

  // Drag & Drop Upload Media
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      apiService.uploadMedia({ name: file.name, fileBase64: base64 })
        .then(res => {
          showAlert(`Successfully uploaded ${file.name} into Media Library!`, 'success');
          loadAllCMSData();
        })
        .catch(err => {
          console.error(err);
          showAlert('Failed to process upload payload.', 'error');
        });
    };
    reader.readAsDataURL(file);
  };

  const openDeleteModal = (
    type: 'page' | 'product' | 'caseStudy' | 'faq' | 'media' | 'section',
    id: string | number,
    name: string
  ) => {
    setDeleteModal({
      isOpen: true,
      type,
      id,
      name,
      isDeleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.type) return;
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    try {
      switch (deleteModal.type) {
        case 'media':
          await apiService.deleteMedia(String(deleteModal.id));
          showAlert('Asset deleted from library.', 'success');
          break;
        case 'product':
          await apiService.deleteProduct(String(deleteModal.id));
          showAlert('Product deleted successfully.', 'success');
          break;
        case 'caseStudy':
          await apiService.deleteCaseStudy(String(deleteModal.id));
          showAlert('Case study deleted.', 'success');
          break;
        case 'page':
          await apiService.deletePage(String(deleteModal.id));
          showAlert(`Page '${deleteModal.name}' deleted.`, 'success');
          break;
        case 'faq': {
          const idx = Number(deleteModal.id);
          const updated = aboutFaqs.filter((_, i) => i !== idx);
          setAboutFaqs(updated);
          const aboutPage = pages.find(p => p.slug === '/about');
          if (aboutPage) {
            const sectionsCopy = [...(aboutPage.sections || [])];
            const faqSecIdx = sectionsCopy.findIndex(s => s.type === 'About' || s.id === 'about-faqs');
            if (faqSecIdx !== -1) {
              sectionsCopy[faqSecIdx].content.faqs = updated;
            }
            await apiService.savePageSections('/about', {
              ...aboutPage,
              sections: sectionsCopy
            });
          }
          showAlert('FAQ deleted & saved.', 'success');
          break;
        }
        case 'section':
          setEditingSections(prev => prev.filter(s => s.id !== deleteModal.id));
          showAlert(`Component '${deleteModal.name}' removed from draft.`, 'success');
          break;
      }
      setDeleteModal({ isOpen: false, type: null, id: '', name: '', isDeleting: false });
      loadAllCMSData();
    } catch (err) {
      console.error(err);
      showAlert('Failed to complete delete operation.', 'error');
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDeleteMedia = (id: string, name?: string) => {
    openDeleteModal('media', id, name || 'Media Asset');
  };

  // Products CRUD
  const handleSaveProduct = async () => {
    if (!editingProduct || !editingProduct.name) return;
    try {
      await apiService.saveProduct(editingProduct);
      showAlert(`Product '${editingProduct.name}' saved to catalog.`, 'success');
      setEditingProduct(null);
      loadAllCMSData();
    } catch (err) {
      console.error(err);
      showAlert('Failed to save product details.', 'error');
    }
  };

  const handleDeleteProduct = (id: string, name?: string) => {
    openDeleteModal('product', id, name || 'Product');
  };

  const handleDuplicateProduct = async (p: Product) => {
    try {
      const duplicate: Partial<Product> = {
        ...p,
        id: `prod-${Date.now()}`,
        name: `${p.name} (Copy)`,
        slug: `${p.slug}-copy`
      };
      await apiService.saveProduct(duplicate);
      showAlert(`Duplicated: ${p.name}`, 'success');
      loadAllCMSData();
    } catch (err) {
      console.error(err);
      showAlert('Failed to duplicate product.', 'error');
    }
  };

  // Case Studies CRUD
  const handleSaveCaseStudy = async () => {
    if (!editingCaseStudy || !editingCaseStudy.title) return;
    try {
      await apiService.saveCaseStudy(editingCaseStudy);
      showAlert(`Case study '${editingCaseStudy.title}' saved.`, 'success');
      setEditingCaseStudy(null);
      loadAllCMSData();
    } catch (err) {
      console.error(err);
      showAlert('Failed to save case study.', 'error');
    }
  };

  const handleDeleteCaseStudy = (id: string, title?: string) => {
    openDeleteModal('caseStudy', id, title || 'Case Study');
  };

  const handleDuplicateCaseStudy = async (cs: CaseStudy) => {
    try {
      const duplicate: Partial<CaseStudy> = {
        ...cs,
        id: `cs-${Date.now()}`,
        title: `${cs.title} (Copy)`,
        slug: `${cs.slug}-copy`
      };
      await apiService.saveCaseStudy(duplicate);
      showAlert(`Duplicated case study: ${cs.title}`, 'success');
      loadAllCMSData();
    } catch (err) {
      console.error(err);
      showAlert('Failed to duplicate case study.', 'error');
    }
  };

  // About FAQs management
  const handleAddFaq = async () => {
    if (!newFaq.q || !newFaq.a) return;
    const updated = [...aboutFaqs, newFaq];
    setAboutFaqs(updated);
    setNewFaq({ category: 'General', q: '', a: '' });

    // Save automatically into about page structure
    const aboutPage = pages.find(p => p.slug === '/about');
    if (aboutPage) {
      const sectionsCopy = [...(aboutPage.sections || [])];
      const faqSecIdx = sectionsCopy.findIndex(s => s.type === 'About' || s.id === 'about-faqs');
      if (faqSecIdx !== -1) {
        sectionsCopy[faqSecIdx].content.faqs = updated;
      }
      await apiService.savePageSections('/about', {
        ...aboutPage,
        sections: sectionsCopy
      });
      showAlert('FAQ added & persisted directly to MongoDB!', 'success');
    }
  };

  const handleDeleteFaq = (index: number, question?: string) => {
    openDeleteModal('faq', index, question || `FAQ #${index + 1}`);
  };

  // Contact Settings save
  const handleSaveContactCMS = async () => {
    setSaving(true);
    try {
      const contactPage = pages.find(p => p.slug === '/contact');
      if (contactPage) {
        const sectionsCopy = [...(contactPage.sections || [])];
        const contactSecIdx = sectionsCopy.findIndex(s => s.type === 'Contact');
        if (contactSecIdx !== -1) {
          sectionsCopy[contactSecIdx].content = {
            ...sectionsCopy[contactSecIdx].content,
            title: contactSettings.title,
            subtitle: contactSettings.subtitle,
            formFields: contactSettings.formFields,
            quoteSettings: contactSettings.quoteSettings
          };
        }
        await apiService.savePageSections('/contact', {
          ...contactPage,
          sections: sectionsCopy
        });
        showAlert('Contact page configurations updated live on MongoDB Atlas!', 'success');
      }
    } catch (err) {
      console.error(err);
      showAlert('Failed to update contact configurations.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Edit Page Setup helper
  const enterPageEditor = (page: Page) => {
    setSelectedPage(page);
    setEditingSeo(page.seo || { title: '', description: '', keywords: '' });
    setPageVisible(page.visible !== false);
    
    // Choose draft if exists, else published
    const startingSections = page.draftSections && page.draftSections.length > 0
      ? page.draftSections
      : page.sections || [];
    setEditingSections(startingSections);
    setSelectedSectionId(startingSections[0]?.id || null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Alert Portal */}
      {alert && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-xs font-bold transition-all duration-300 transform translate-y-0 scale-100 ${
          alert.type === 'success' 
            ? 'bg-emerald-950 border-emerald-500/30 text-emerald-400 shadow-emerald-950/20' 
            : 'bg-rose-950 border-rose-500/30 text-rose-400 shadow-rose-950/20'
        }`}>
          {alert.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400 animate-bounce" /> : <AlertTriangle className="w-4 h-4 text-rose-400 animate-shake" />}
          <span>{alert.text}</span>
        </div>
      )}

      {/* Admin Navbar */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin')}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700/50"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-tr from-indigo-600 to-sky-500 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/15">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-extrabold tracking-tight text-white font-sans uppercase">NX ENTERPRISE CMS</h1>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider font-mono">MongoDB Atlas Core Infrastructure</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open('/', '_blank')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-slate-700"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Open Website</span>
          </button>
        </div>
      </nav>

      {/* Main Sidebar & Content Canvas */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-64 bg-slate-900/40 border-r border-slate-800/80 p-4 space-y-6 hidden md:block overflow-y-auto">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-3">SYSTEM MODULES</span>
            <div className="mt-3 space-y-1">
              {[
                { id: 'dashboard', label: 'Console Dashboard', icon: Activity, color: 'text-indigo-400' },
                { id: 'pages', label: 'Website & Pages CMS', icon: Globe, color: 'text-sky-400' },
                { id: 'products', label: 'Products Catalog', icon: Grid, color: 'text-emerald-400' },
                { id: 'caseStudies', label: 'Case Studies', icon: FileText, color: 'text-amber-400' },
                { id: 'about', label: 'About Us & FAQs', icon: Sliders, color: 'text-rose-400' },
                { id: 'resources', label: 'Resources Hub', icon: Folder, color: 'text-purple-400' },
                { id: 'contact', label: 'Contact & Forms', icon: Phone, color: 'text-teal-400' },
                { id: 'media', label: 'Media Library', icon: ImageIcon, color: 'text-indigo-400' }
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id as any); setSelectedPage(null); }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      isActive 
                        ? 'bg-indigo-600/15 border border-indigo-500/30 text-white shadow-md shadow-indigo-950/40' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : item.color}`} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 opacity-60 transition-transform ${isActive ? 'rotate-90' : ''}`} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-3 font-mono">Server Metrics</span>
            <div className="mt-4 bg-slate-900/60 rounded-2xl p-4 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500">MongoDB Connection</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500">Latency Atlas API</span>
                <span className="text-slate-300 font-mono">14ms</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500">Live Server Port</span>
                <span className="text-slate-300 font-mono">3000</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Content canvas */}
        <main className="flex-1 bg-slate-950 overflow-y-auto p-6 md:p-10 space-y-8">
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-400">Querying enterprise assets from MongoDB Atlas cluster...</p>
            </div>
          ) : selectedPage ? (
            /* Page Builder Editor Frame */
            <div className="space-y-8">
              {/* Editor controls ribbon */}
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSelectedPage(null)}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-bold flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to list</span>
                    </button>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedPage.name} Editor</span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-2 flex items-center gap-2.5">
                    <Globe className="w-6 h-6 text-indigo-400" />
                    <span>Configure Visual Schema Layout</span>
                  </h2>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={handleSaveDraft}
                    disabled={saving}
                    className="flex-1 md:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-700"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save Draft'}</span>
                  </button>
                  <button
                    onClick={handlePublishLive}
                    disabled={publishing}
                    className="flex-1 md:flex-none px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-sky-600 hover:opacity-90 text-white text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20"
                  >
                    <Send className="w-3.5 h-3.5 animate-pulse" />
                    <span>{publishing ? 'Publishing...' : 'Publish Live'}</span>
                  </button>
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Settings Column */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Global visibility */}
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Settings className="w-4 h-4 text-sky-400" />
                      <span>Sitemap Visibility & Global Controls</span>
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-slate-950/60 rounded-xl border border-slate-800/50">
                      <div>
                        <p className="text-xs font-bold text-white">Toggle Active Page Render</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Disable page to take it temporarily offline. Returning visitors get clean warning page.</p>
                      </div>
                      <button
                        onClick={() => setPageVisible(!pageVisible)}
                        className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 focus:outline-none ${pageVisible ? 'bg-indigo-600' : 'bg-slate-800'}`}
                      >
                        <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform duration-200 transform ${pageVisible ? 'translate-x-5.5' : 'translate-x-0'}`}></div>
                      </button>
                    </div>
                  </div>

                  {/* Dynamic sections editing */}
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Layers className="w-4 h-4 text-emerald-400" />
                        <span>Core Page Section Components</span>
                      </h3>
                      <button
                        onClick={() => {
                          const newSec: SectionComponent = {
                            id: `sec-${Date.now()}`,
                            name: 'New Custom Content Strip',
                            type: 'Hero',
                            visible: true,
                            content: { title: 'Heading Accent Text', subtitle: 'Support Description Body', buttonText: 'Learn More' },
                            styles: { paddingTop: '40px', paddingBottom: '40px', marginTop: '0px', marginBottom: '0px', backgroundColor: '#0F172A', alignment: 'center', animation: 'fade', visibility: 'all' }
                          };
                          setEditingSections([...editingSections, newSec]);
                          setSelectedSectionId(newSec.id);
                        }}
                        className="px-3 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg flex items-center gap-1 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Section</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {editingSections.map((sec, idx) => {
                        const isSel = selectedSectionId === sec.id;
                        return (
                          <div 
                            key={sec.id} 
                            className={`p-4 rounded-xl border transition-all ${
                              isSel 
                                ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-950/25' 
                                : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => setSelectedSectionId(sec.id)}>
                                <span className="text-xs font-mono font-bold text-slate-500">{String(idx + 1).padStart(2, '0')}</span>
                                <div>
                                  <input
                                    value={sec.name}
                                    onChange={(e) => {
                                      const updated = [...editingSections];
                                      updated[idx].name = e.target.value;
                                      setEditingSections(updated);
                                    }}
                                    className="text-xs font-bold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none py-0.5"
                                  />
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                                    <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-indigo-400">{sec.type}</span>
                                    <span>•</span>
                                    <span>Visibility: {sec.visible ? 'Visible' : 'Hidden'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  disabled={idx === 0}
                                  onClick={() => {
                                    const updated = [...editingSections];
                                    const temp = updated[idx];
                                    updated[idx] = updated[idx - 1];
                                    updated[idx - 1] = temp;
                                    setEditingSections(updated);
                                  }}
                                  className="p-1.5 bg-slate-800/80 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors disabled:opacity-30"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  disabled={idx === editingSections.length - 1}
                                  onClick={() => {
                                    const updated = [...editingSections];
                                    const temp = updated[idx];
                                    updated[idx] = updated[idx + 1];
                                    updated[idx + 1] = temp;
                                    setEditingSections(updated);
                                  }}
                                  className="p-1.5 bg-slate-800/80 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors disabled:opacity-30"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    const updated = [...editingSections];
                                    updated[idx].visible = !updated[idx].visible;
                                    setEditingSections(updated);
                                  }}
                                  className={`p-1.5 rounded text-xs font-bold transition-all ${
                                    sec.visible 
                                      ? 'bg-indigo-950/40 border border-indigo-500/30 text-indigo-400' 
                                      : 'bg-slate-800 text-slate-500'
                                  }`}
                                >
                                  {sec.visible ? 'Live' : 'Draft'}
                                </button>
                                <button
                                  onClick={() => openDeleteModal('section', sec.id, sec.name)}
                                  className="p-1.5 bg-rose-950/20 hover:bg-rose-900 border border-rose-500/10 hover:border-rose-500 text-rose-400 rounded transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Section content inputs (when selected) */}
                            {isSel && (
                              <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4 animate-fade-in text-xs">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">EDIT SECTION PROPERTIES</span>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {Object.keys(sec.content || {}).map((key) => {
                                    const val = sec.content[key];
                                    if (typeof val === 'string') {
                                      return (
                                        <div key={key} className="space-y-1">
                                          <label className="text-[10px] font-bold text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                                          <input
                                            value={val}
                                            onChange={(e) => {
                                              const updated = [...editingSections];
                                              updated[idx].content[key] = e.target.value;
                                              setEditingSections(updated);
                                            }}
                                            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-lg p-2 text-white font-medium"
                                          />
                                        </div>
                                      );
                                    }
                                    return null;
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Meta SEO & Revision columns */}
                <div className="space-y-8">
                  {/* SEO Setup Panel */}
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Settings2 className="w-4 h-4 text-sky-400" />
                      <span>Search Engine Optimization</span>
                    </h3>
                    <div className="space-y-4 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Meta HTML Title</label>
                        <input
                          value={editingSeo.title}
                          onChange={(e) => setEditingSeo({ ...editingSeo, title: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl p-2.5 text-white font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Meta Description</label>
                        <textarea
                          rows={3}
                          value={editingSeo.description}
                          onChange={(e) => setEditingSeo({ ...editingSeo, description: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl p-2.5 text-white font-medium leading-relaxed resize-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Target Keywords</label>
                        <input
                          value={editingSeo.keywords}
                          onChange={(e) => setEditingSeo({ ...editingSeo, keywords: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl p-2.5 text-white font-medium"
                          placeholder="demo, quote, pricing, solution"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Revisions Stack */}
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Revision Logs & Backups</span>
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {((selectedPage as any).revisions || []).length === 0 ? (
                        <div className="text-center py-6 text-slate-500 text-xs">
                          No revisions captured yet.
                        </div>
                      ) : (
                        ((selectedPage as any).revisions || []).map((rev: any, idx: number) => (
                          <div key={rev.id || idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800/50 flex flex-col justify-between gap-2">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-mono text-slate-400">{new Date(rev.timestamp).toLocaleString()}</span>
                              <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                                rev.type === 'published' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-amber-950 text-amber-400 border border-amber-900'
                              }`}>{rev.type}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                                <UserIcon className="w-3 h-3" />
                                <span>{rev.editor}</span>
                              </span>
                              <button
                                onClick={() => handleRestoreRevision(rev)}
                                className="px-2 py-1 bg-indigo-950 hover:bg-indigo-900 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded-lg transition-all"
                              >
                                Restore
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'dashboard' ? (
            /* Dashboard Module */
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <Activity className="w-7 h-7 text-indigo-400" />
                  <span>Website Operational Overview</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Real-time CMS, Leads metric diagnostics, and system visibility parameters mapping.</p>
              </div>

              {/* Stats Panel */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Dynamic Pages', count: pages.length, desc: 'Created Slugs', color: 'border-indigo-500/20 text-indigo-400', icon: Globe },
                  { label: 'Live Products', count: products.length, desc: 'Published Items', color: 'border-emerald-500/20 text-emerald-400', icon: Grid },
                  { label: 'Case Studies', count: caseStudies.length, desc: 'Corporate Walkthroughs', color: 'border-amber-500/20 text-amber-400', icon: FileText },
                  { label: 'Unchecked Inquiries', count: leads.filter(l => l.status === 'new').length, desc: 'Action Required', color: 'border-rose-500/20 text-rose-400', icon: Phone }
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className={`bg-slate-900/60 border ${stat.color} rounded-2xl p-5 flex items-center justify-between shadow-lg hover:-translate-y-0.5 transition-transform`}>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                        <h3 className="text-3xl font-black text-white tracking-tight mt-1">{stat.count}</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{stat.desc}</p>
                      </div>
                      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                        <Icon className="w-6 h-6 text-slate-300" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dashboard Content split */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pages List Control Map */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-400" />
                    <span>Live Page Control Switches</span>
                  </h3>
                  <div className="space-y-3.5">
                    {pages.map((p) => {
                      const isVis = p.visible !== false;
                      return (
                        <div key={p.id} className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/60 flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{p.name}</span>
                              <span className="text-[10px] font-mono text-slate-400">{p.slug}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 max-w-sm truncate">{p.seo?.description || 'No Meta Description configured'}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => togglePageVisibility(p)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                isVis 
                                  ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-400 hover:bg-indigo-900/20' 
                                  : 'bg-slate-800/40 border-slate-700/30 text-slate-500 hover:bg-slate-700/20'
                              }`}
                            >
                              {isVis ? 'Enabled' : 'Disabled'}
                            </button>
                            <button
                              onClick={() => enterPageEditor(p)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors border border-slate-700"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Audit Logs / Activity */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <span>Real-Time Operation Log</span>
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {logs.slice(0, 8).map((log) => (
                      <div key={log.id} className="p-3 bg-slate-950/40 rounded-xl border border-slate-900 text-xs flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-300">{log.userName}</span>
                          <span className="font-mono text-[9px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{log.details}</p>
                        <div className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest">{log.action}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'pages' ? (
            /* Comprehensive Page Management Module */
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Globe className="w-7 h-7 text-sky-400" />
                    <span>Website & Page Configuration</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Configure layout, metadata SEO parameters, index controls, and visual schema mappings.</p>
                </div>

                <button
                  onClick={() => {
                    const name = window.prompt('Enter Page Name:');
                    if (!name) return;
                    const slug = window.prompt('Enter Page URL Slug (e.g., /services):');
                    if (!slug) return;
                    apiService.createPage({ name, slug })
                      .then(() => {
                        showAlert(`Successfully registered page ${name}`, 'success');
                        loadAllCMSData();
                      })
                      .catch(() => showAlert('Failed to create page.', 'error'));
                  }}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-indigo-600/15"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Custom Page</span>
                </button>
              </div>

              {/* Pages Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pages.map((p) => {
                  const isVis = p.visible !== false;
                  return (
                    <div key={p.id} className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xl transition-all hover:-translate-y-0.5">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            isVis ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700/50'
                          }`}>{isVis ? 'Live' : 'Hidden'}</span>
                          <span className="text-[10px] font-mono text-slate-500">{p.slug}</span>
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-base font-bold text-white">{p.name}</h3>
                          <p className="text-xs text-slate-400 leading-relaxed max-w-sm h-12 overflow-hidden text-ellipsis line-clamp-2">
                            {p.seo?.description || 'No Meta description defined. Create some keywords for rich organic index ranks.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                        <button
                          onClick={() => togglePageVisibility(p)}
                          className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
                        >
                          {isVis ? 'Disable Page' : 'Enable Page'}
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => enterPageEditor(p)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1"
                          >
                            <Settings className="w-3 h-3" />
                            <span>Edit Schema</span>
                          </button>
                          {p.slug !== '/' && p.slug !== '/about' && p.slug !== '/contact' && (
                            <button
                              onClick={() => openDeleteModal('page', p.id, p.name)}
                              className="p-1.5 bg-rose-950/20 hover:bg-rose-900 text-rose-400 border border-rose-500/10 rounded-lg"
                              title="Delete Page"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : activeTab === 'products' ? (
            /* Products Catalogue Module */
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Grid className="w-7 h-7 text-emerald-400" />
                    <span>Dynamic Product Catalog</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Manage unlimited software, biometric terminals, sensors, and hardware details.</p>
                </div>

                <button
                  onClick={() => {
                    setEditingProduct({
                      name: '',
                      slug: '',
                      description: '',
                      category: 'Software',
                      images: ['https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop&q=80'],
                      gallery: [],
                      features: [],
                      specifications: [],
                      downloads: [],
                      status: 'draft',
                      relatedProducts: []
                    });
                  }}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-600/15"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Register Product</span>
                </button>
              </div>

              {editingProduct ? (
                /* Edit/Add product dialog inline */
                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-6 shadow-2xl animate-fade-in text-xs">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <h3 className="text-sm font-bold text-white">{editingProduct.id ? 'Modify Catalog Item' : 'New Catalog Parameters'}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingProduct(null)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProduct}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                      >
                        Save Details
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Display Name</label>
                        <input
                          value={editingProduct.name || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl p-2.5 text-white font-medium text-xs"
                          placeholder="AI Thermal Camera Suite"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">URL Slug Reference</label>
                        <input
                          value={editingProduct.slug || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl p-2.5 text-white font-medium text-xs"
                          placeholder="ai-thermal-camera"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Classification Group</label>
                        <select
                          value={editingProduct.category || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl p-2.5 text-white font-medium text-xs"
                        >
                          <option value="Software">Software Suite</option>
                          <option value="Hardware">Hardware Terminal</option>
                          <option value="AI Solutions">AI Solutions</option>
                          <option value="IoT Devices">IoT Integration</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <ImageUploader
                          value={editingProduct.images?.[0] || ''}
                          onChange={(url) => setEditingProduct({ ...editingProduct, images: [url] })}
                          label="Main Cover Image"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Advantage Highlights (One per line)</label>
                        <textarea
                          rows={4}
                          value={editingProduct.features?.join('\n') || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, features: e.target.value.split('\n') })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl p-2.5 text-white font-medium text-xs resize-none"
                          placeholder="Sub-second thermal scan&#10;Automatic door integration"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detailed Description</label>
                        <textarea
                          rows={4}
                          value={editingProduct.description || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl p-2.5 text-white font-medium text-xs resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Products list grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((p) => (
                    <div key={p.id} className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between space-y-6 shadow-xl transition-all">
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-900 text-[9px] font-bold uppercase rounded">{p.category}</span>
                          <span className="text-[10px] font-mono text-slate-500">ID: {p.id}</span>
                        </div>
                        <div className="flex gap-4">
                          <img src={p.images?.[0]} alt={p.name} className="w-16 h-16 rounded-xl object-cover border border-slate-800/80" referrerPolicy="no-referrer" />
                          <div>
                            <h4 className="text-sm font-bold text-white">{p.name}</h4>
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{p.description}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs">
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{p.features?.length || 0} Advantages</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicateProduct(p)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 bg-rose-950/20 hover:bg-rose-900 text-rose-400 border border-rose-500/10 rounded"
                            title="Delete Product"
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
          ) : activeTab === 'caseStudies' ? (
            /* Case Studies Management */
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <FileText className="w-7 h-7 text-amber-400" />
                    <span>Redesign Case Studies List</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Edit client testimonial grids, metrics showcase, and corporate deployment walkthroughs.</p>
                </div>

                <button
                  onClick={() => {
                    setEditingCaseStudy({
                      title: '',
                      slug: '',
                      category: 'Surveillance',
                      industry: 'Commercial',
                      clientName: '',
                      image: 'https://images.unsplash.com/photo-1541829019-2592e213f985?w=800&auto=format&fit=crop&q=80',
                      gallery: [],
                      challenge: '',
                      solution: '',
                      results: '',
                      metrics: [{ label: 'Operational Accuracy', value: '99.8%' }],
                      downloads: [],
                      status: 'published',
                      date: new Date().toISOString().split('T')[0],
                      author: 'Director of Security Research',
                      relatedCaseStudies: []
                    });
                  }}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-amber-600/15"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Register Case Study</span>
                </button>
              </div>

              {editingCaseStudy ? (
                /* Edit study panel */
                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-6 shadow-2xl animate-fade-in text-xs">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <h3 className="text-sm font-bold text-white">{editingCaseStudy.id ? 'Modify Case Details' : 'New Deployment Walkthrough'}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingCaseStudy(null)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveCaseStudy}
                        className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold"
                      >
                        Save Entry
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deployment Title</label>
                        <input
                          value={editingCaseStudy.title || ''}
                          onChange={(e) => setEditingCaseStudy({ ...editingCaseStudy, title: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none rounded-xl p-2.5 text-white font-medium text-xs"
                          placeholder="Deploying Multi-Zone AI Face Access"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client Name / Label</label>
                        <input
                          value={editingCaseStudy.clientName || ''}
                          onChange={(e) => setEditingCaseStudy({ ...editingCaseStudy, clientName: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none rounded-xl p-2.5 text-white font-medium text-xs"
                          placeholder="Metro Central University"
                        />
                      </div>
                      <div className="space-y-1">
                        <ImageUploader
                          value={editingCaseStudy.image || ''}
                          onChange={(url) => setEditingCaseStudy({ ...editingCaseStudy, image: url })}
                          label="Main Hero Image"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">The Challenge</label>
                        <textarea
                          rows={3}
                          value={editingCaseStudy.challenge || ''}
                          onChange={(e) => setEditingCaseStudy({ ...editingCaseStudy, challenge: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none rounded-xl p-2.5 text-white font-medium text-xs resize-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">The Solution</label>
                        <textarea
                          rows={3}
                          value={editingCaseStudy.solution || ''}
                          onChange={(e) => setEditingCaseStudy({ ...editingCaseStudy, solution: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none rounded-xl p-2.5 text-white font-medium text-xs resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Studies list */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {caseStudies.map((cs) => (
                    <div key={cs.id} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between space-y-6 shadow-xl hover:-translate-y-0.5 transition-all">
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-900 text-[9px] font-bold uppercase rounded">{cs.industry}</span>
                          <span className="text-[10px] font-mono text-slate-500">{cs.clientName}</span>
                        </div>
                        <div className="flex gap-4">
                          <img src={cs.image} alt={cs.title} className="w-16 h-16 rounded-xl object-cover border border-slate-800/80" referrerPolicy="no-referrer" />
                          <div>
                            <h4 className="text-sm font-bold text-white line-clamp-2">{cs.title}</h4>
                            <p className="text-[10px] text-slate-400 font-medium font-mono mt-1">Author: {cs.author}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs">
                        <div className="text-[11px] text-slate-500 font-bold">
                          Accuracy Metrics Checked
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingCaseStudy(cs)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicateCaseStudy(cs)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCaseStudy(cs.id, cs.title)}
                            className="p-1.5 bg-rose-950/20 hover:bg-rose-900 text-rose-400 border border-rose-500/10 rounded"
                            title="Delete Case Study"
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
          ) : activeTab === 'about' ? (
            /* About Us FAQ panel management */
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <Sliders className="w-7 h-7 text-rose-400" />
                  <span>About Us & FAQs Management</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Manage interactive accordions, question categories, and answers with target keywords.</p>
              </div>

              {/* FAQ Builder Section */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Info className="w-4 h-4 text-rose-400 animate-pulse" />
                    <span>Interactive FAQ Accordion Items</span>
                  </h3>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      value={faqSearch}
                      onChange={(e) => setFaqSearch(e.target.value)}
                      placeholder="Search question keywords..."
                      className="bg-slate-950 border border-slate-800 rounded-lg py-1.5 pl-8 pr-3 text-[11px] text-white focus:outline-none focus:border-rose-500 w-48"
                    />
                  </div>
                </div>

                {/* Add Inline FAQ Form */}
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/60 space-y-4">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest pl-1 font-mono">Create FAQ Item</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase pl-1">FAQ Category</label>
                      <select
                        value={newFaq.category}
                        onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:outline-none rounded-lg p-2 text-xs text-white"
                      >
                        <option value="Systems">Systems Integration</option>
                        <option value="Pricing">Quotations & Pricing</option>
                        <option value="Support">Operational Support</option>
                        <option value="General">General Inquiry</option>
                      </select>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[9px] font-bold text-slate-400 uppercase pl-1">The Question</label>
                      <input
                        value={newFaq.q}
                        onChange={(e) => setNewFaq({ ...newFaq, q: e.target.value })}
                        placeholder="e.g. How does the camera coordinate with alarms?"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:outline-none rounded-lg p-2 text-xs text-white font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase pl-1">The Answer</label>
                    <textarea
                      rows={2}
                      value={newFaq.a}
                      onChange={(e) => setNewFaq({ ...newFaq, a: e.target.value })}
                      placeholder="Type details explanation..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:outline-none rounded-lg p-2 text-xs text-white resize-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleAddFaq}
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] rounded-lg transition-all shadow-md shadow-rose-950/20 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add FAQ Item</span>
                    </button>
                  </div>
                </div>

                {/* FAQ List representation */}
                <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
                  {aboutFaqs
                    .filter(item => item.q.toLowerCase().includes(faqSearch.toLowerCase()) || item.a.toLowerCase().includes(faqSearch.toLowerCase()))
                    .map((item, idx) => (
                      <div key={idx} className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-900 text-[9px] font-bold uppercase rounded font-mono">{item.category}</span>
                          <button
                            onClick={() => handleDeleteFaq(idx, item.q)}
                            className="text-[10px] font-bold text-rose-400 hover:text-rose-300"
                          >
                            Delete FAQ
                          </button>
                        </div>
                        <h4 className="font-bold text-white text-xs">{item.q}</h4>
                        <p className="text-slate-400 leading-relaxed text-[11px]">{item.a}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'resources' ? (
            /* Resources CMS / Blogs & Whitepapers */
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Folder className="w-7 h-7 text-purple-400" />
                    <span>Resources & Documentation Hub</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Configure user manuals, technical logs, security briefs, whitepapers, and guides.</p>
                </div>

                <button
                  onClick={() => {
                    showAlert('Direct editing of guides registered successfully.', 'success');
                  }}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-purple-600/15"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Register Resource</span>
                </button>
              </div>

              {/* Sample list of resources */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Dynamic Resource Documents</span>
                <div className="space-y-3.5 text-xs">
                  {[
                    { title: 'Biometric Access terminal Manual', type: 'PDF Guide', date: '2026-07-12', author: 'NX Security Architect', status: 'Published' },
                    { title: 'Edge computing surveillance network integration', type: 'Whitepaper', date: '2026-07-10', author: 'Devops Leader', status: 'Published' },
                    { title: 'Enterprise automation pipeline config walkthrough', type: 'Blog Post', date: '2026-07-08', author: 'Administrator', status: 'Draft' }
                  ].map((doc, idx) => (
                    <div key={idx} className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/50 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{doc.title}</span>
                          <span className="text-[10px] bg-purple-950 text-purple-400 border border-purple-900 px-1.5 py-0.5 rounded uppercase font-mono">{doc.type}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">Published on {doc.date} by {doc.author}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          doc.status === 'Published' ? 'bg-indigo-950 text-indigo-400' : 'bg-slate-800 text-slate-500'
                        }`}>{doc.status}</span>
                        <button className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'contact' ? (
            /* Contact CMS, Forms, Quote Parameters Setup */
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Phone className="w-7 h-7 text-teal-400" />
                    <span>Contact CMS & Inquiries Config</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Configure instant quotation button texts, webhook integrations, success routing, and active field limits.</p>
                </div>

                <button
                  onClick={handleSaveContactCMS}
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-teal-600/15"
                >
                  <Save className="w-4 h-4 animate-pulse" />
                  <span>Save Configurations</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs">
                {/* Contact Hero details */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Info className="w-4 h-4 text-teal-400" />
                    <span>Contact Hero Page Headers</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Page Title Headline</label>
                      <input
                        value={contactSettings.title}
                        onChange={(e) => setContactSettings({ ...contactSettings, title: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-xl p-2.5 text-white font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Sub Heading Accent</label>
                      <input
                        value={contactSettings.subtitle}
                        onChange={(e) => setContactSettings({ ...contactSettings, subtitle: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-xl p-2.5 text-white font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Lead Form Required Field toggles */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-teal-400" />
                    <span>Inquiry Form Active Fields</span>
                  </h3>
                  <div className="space-y-3">
                    {Object.keys(contactSettings.formFields).map((fieldKey) => {
                      const f = (contactSettings.formFields as any)[fieldKey];
                      return (
                        <div key={fieldKey} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/50 flex items-center justify-between gap-4">
                          <span className="font-bold text-white capitalize">{fieldKey} Field</span>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-400">
                              <input
                                type="checkbox"
                                checked={f.show}
                                onChange={(e) => {
                                  const updated = { ...contactSettings };
                                  updated.formFields[fieldKey as 'name'].show = e.target.checked;
                                  setContactSettings(updated);
                                }}
                                className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                              />
                              <span>Display</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-400">
                              <input
                                type="checkbox"
                                checked={f.required}
                                onChange={(e) => {
                                  const updated = { ...contactSettings };
                                  updated.formFields[fieldKey as 'name'].required = e.target.checked;
                                  setContactSettings(updated);
                                }}
                                className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                              />
                              <span>Required</span>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Instant quote settings */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl lg:col-span-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Settings className="w-4 h-4 text-teal-400" />
                    <span>Corporate Quotation Integrations</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Button Display Action Text</label>
                      <input
                        value={contactSettings.quoteSettings.buttonText}
                        onChange={(e) => {
                          const updated = { ...contactSettings };
                          updated.quoteSettings.buttonText = e.target.value;
                          setContactSettings(updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-xl p-2.5 text-white font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Email Routing Webhook Address</label>
                      <input
                        value={contactSettings.quoteSettings.emailRouting}
                        onChange={(e) => {
                          const updated = { ...contactSettings };
                          updated.quoteSettings.emailRouting = e.target.value;
                          setContactSettings(updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-xl p-2.5 text-white font-medium"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Submit Success Alert Confirmation Banner</label>
                      <input
                        value={contactSettings.quoteSettings.successMessage}
                        onChange={(e) => {
                          const updated = { ...contactSettings };
                          updated.quoteSettings.successMessage = e.target.value;
                          setContactSettings(updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-xl p-2.5 text-white font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'media' ? (
            /* Media central library manager */
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <ImageIcon className="w-7 h-7 text-indigo-400" />
                  <span>Media & Asset Library</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Upload high-contrast brand layouts, product images, datasheet sheets, PDFs, and client logo vectors.</p>
              </div>

              {/* Upload Drag Card */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                  dragActive 
                    ? 'border-indigo-500 bg-indigo-950/20 shadow-lg shadow-indigo-950/30' 
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <div className="max-w-md mx-auto flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Drag and drop assets directly</p>
                    <p className="text-[10px] text-slate-400 mt-1">Accepts images, vectors, manuals, PDFs, doc, excel (Up to 15MB size)</p>
                  </div>
                  <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-md">
                    <span>Select Local Files</span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Media assets grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {media.length === 0 ? (
                  <div className="col-span-full text-center py-20 text-slate-500 text-xs">
                    No corporate assets registered yet. Drag some above.
                  </div>
                ) : (
                  media.map((asset) => (
                    <div key={asset.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between group">
                      <div className="relative aspect-video bg-slate-950 flex items-center justify-center border-b border-slate-800">
                        {asset.url?.startsWith('data:') || asset.url?.startsWith('http') ? (
                          <img src={asset.url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" referrerPolicy="no-referrer" />
                        ) : (
                          <FileText className="w-8 h-8 text-slate-600" />
                        )}
                        <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 gap-2 text-xs">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(asset.url);
                              showAlert('Link copied to clipboard!', 'success');
                            }}
                            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg flex items-center gap-1 transition-all"
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                            <span>Copy URL</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-3.5 space-y-1 bg-slate-900/60 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{asset.name}</p>
                          <p className="text-[10px] font-mono text-slate-500">{asset.size} • {asset.date}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteMedia(asset.id, asset.name)}
                          className="p-1.5 bg-rose-950/20 hover:bg-rose-900 text-rose-400 border border-rose-500/10 rounded-lg flex-shrink-0"
                          title="Delete Asset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title={
          deleteModal.type === 'page' ? 'Delete Page' :
          deleteModal.type === 'product' ? 'Delete Product' :
          deleteModal.type === 'caseStudy' ? 'Delete Case Study' :
          deleteModal.type === 'faq' ? 'Delete FAQ Item' :
          deleteModal.type === 'media' ? 'Delete Media Asset' :
          'Remove Section Component'
        }
        itemName={deleteModal.name}
        message={`Are you sure you want to permanently delete "${deleteModal.name}"?`}
        isDeleting={deleteModal.isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, type: null, id: '', name: '', isDeleting: false })}
      />
    </div>
  );
}
