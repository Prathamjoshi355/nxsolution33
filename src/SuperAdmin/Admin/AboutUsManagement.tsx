import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Globe, Eye, Shield, Layers, 
  Trash2, Plus, Edit, MoveUp, MoveDown, Copy, 
  CheckCircle, AlertCircle, FileText, Upload, RefreshCw, 
  Settings, UserPlus, ToggleLeft, ToggleRight, MessageSquare,
  HelpCircle, Image as ImageIcon, Calendar, Award, Trophy, Users, TrendingUp, Info
} from 'lucide-react';
import { apiService } from '../../Public/Services/api';
import { Page, SectionComponent } from '../../types';
import ImageUploader from '../../Public/Components/ImageUploader';
import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function AboutUsManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'hero' | 'company' | 'stats' | 'mission' | 'values' | 'team' | 'timeline' | 'faqs' | 'revisions'>('settings');

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'bullet' | 'stat' | 'value' | 'team' | 'timeline' | 'faq' | null;
    index: number;
    name: string;
  }>({
    isOpen: false,
    type: null,
    index: -1,
    name: '',
  });

  const openDeleteModal = (
    type: 'bullet' | 'stat' | 'value' | 'team' | 'timeline' | 'faq',
    index: number,
    name: string
  ) => {
    setDeleteModal({
      isOpen: true,
      type,
      index,
      name,
    });
  };

  const handleConfirmItemDelete = () => {
    if (deleteModal.index < 0 || !deleteModal.type) return;
    const idx = deleteModal.index;
    switch (deleteModal.type) {
      case 'bullet':
        setCompanyContent((prev: any) => ({
          ...prev,
          bullets: (prev.bullets || []).filter((_: any, i: number) => i !== idx)
        }));
        showAlert('Bullet point removed.');
        break;
      case 'stat':
        setStats(prev => prev.filter((_, i) => i !== idx));
        showAlert('Stat item removed.');
        break;
      case 'value':
        setValues(prev => prev.filter((_, i) => i !== idx));
        showAlert('Value item removed.');
        break;
      case 'team':
        setTeam(prev => prev.filter((_, i) => i !== idx));
        showAlert('Team member removed.');
        break;
      case 'timeline':
        setTimeline(prev => prev.filter((_, i) => i !== idx));
        showAlert('Timeline event removed.');
        break;
      case 'faq':
        setFaqs(prev => prev.filter((_, i) => i !== idx));
        showAlert('FAQ item removed.');
        break;
    }
    setDeleteModal({ isOpen: false, type: null, index: -1, name: '' });
  };

  // Page State
  const [page, setPage] = useState<Page | null>(null);
  const [pageVisible, setPageVisible] = useState(true);
  const [seo, setSeo] = useState({ title: '', description: '', keywords: '' });
  const [sections, setSections] = useState<SectionComponent[]>([]);
  const [revisions, setRevisions] = useState<any[]>([]);

  // Local Section Edit States
  const [heroContent, setHeroContent] = useState<any>({});
  const [companyContent, setCompanyContent] = useState<any>({});
  const [stats, setStats] = useState<any[]>([]);
  const [missionVision, setMissionVision] = useState<any>({});
  const [values, setValues] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  // Temporary Editing Modal/Form states
  const [editingStat, setEditingStat] = useState<any | null>(null);
  const [editingValue, setEditingValue] = useState<any | null>(null);
  const [editingTeam, setEditingTeam] = useState<any | null>(null);
  const [editingTimeline, setEditingTimeline] = useState<any | null>(null);
  const [editingFaq, setEditingFaq] = useState<any | null>(null);

  // Load About Page Data
  const loadPageData = async () => {
    setLoading(true);
    try {
      const allPages = await apiService.getPages();
      const aboutPage = allPages.find(p => p.slug === '/about') || allPages.find(p => p.slug === '/about-us');
      
      if (aboutPage) {
        setPage(aboutPage);
        setPageVisible(aboutPage.visible);
        setSeo(aboutPage.seo || { title: '', description: '', keywords: '' });
        setSections(aboutPage.sections || []);
        setRevisions((aboutPage as any).revisions || []);

        // Load section specifics
        const heroSec = aboutPage.sections.find(s => s.type === 'AboutHero');
        if (heroSec) setHeroContent(heroSec.content || {});

        const compSec = aboutPage.sections.find(s => s.type === 'AboutCompany');
        if (compSec) setCompanyContent(compSec.content || {});

        const statsSec = aboutPage.sections.find(s => s.type === 'AboutStats');
        if (statsSec) setStats(statsSec.content?.stats || []);

        const mvSec = aboutPage.sections.find(s => s.type === 'AboutMissionVision');
        if (mvSec) setMissionVision(mvSec.content || {});

        const valSec = aboutPage.sections.find(s => s.type === 'AboutValues');
        if (valSec) setValues(valSec.content?.values || []);

        const teamSec = aboutPage.sections.find(s => s.type === 'AboutLeadership');
        if (teamSec) setTeam(teamSec.content?.team || []);

        const timeSec = aboutPage.sections.find(s => s.type === 'AboutTimeline');
        if (timeSec) setTimeline(timeSec.content?.milestones || []);

        // FAQ Section or fallback from About
        const faqSec = aboutPage.sections.find(s => s.type === 'About' || s.id === 'about-faqs');
        if (faqSec) setFaqs(faqSec.content?.faqs || []);
      } else {
        showAlert('About page not found in CMS directory.', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Failed to connect to MongoDB server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlert({ text, type });
    setTimeout(() => setAlert(null), 4000);
  };

  // Re-build all sections array with updated content states
  const getMergedSections = (): SectionComponent[] => {
    return sections.map(sec => {
      if (sec.type === 'AboutHero') {
        return { ...sec, content: heroContent };
      }
      if (sec.type === 'AboutCompany') {
        return { ...sec, content: companyContent };
      }
      if (sec.type === 'AboutStats') {
        return { ...sec, content: { ...sec.content, stats } };
      }
      if (sec.type === 'AboutMissionVision') {
        return { ...sec, content: missionVision };
      }
      if (sec.type === 'AboutValues') {
        return { ...sec, content: { ...sec.content, values } };
      }
      if (sec.type === 'AboutLeadership') {
        return { ...sec, content: { ...sec.content, team } };
      }
      if (sec.type === 'AboutTimeline') {
        return { ...sec, content: { ...sec.content, milestones: timeline } };
      }
      if (sec.type === 'About' || sec.id === 'about-faqs') {
        return { ...sec, content: { ...sec.content, faqs } };
      }
      return sec;
    });
  };

  // Save changes to database (Published or Draft)
  const handleSave = async (status: 'published' | 'draft') => {
    if (!page) return;
    setSaving(true);
    try {
      const mergedSec = getMergedSections();
      const payload: any = {
        name: page.name,
        visible: pageVisible,
        seo: status === 'published' ? seo : page.seo,
        sections: status === 'published' ? mergedSec : page.sections,
        draftSeo: status === 'draft' ? seo : page.draftSeo,
        draftSections: status === 'draft' ? mergedSec : page.draftSections,
      };

      // Add revision
      const revisionItem = {
        id: `rev-${Date.now()}`,
        timestamp: new Date().toISOString(),
        editor: 'CMS Super Admin',
        type: status,
        sections: mergedSec,
        seo
      };
      payload.revisions = [revisionItem, ...revisions].slice(0, 10);

      await apiService.savePageSections(page.slug, payload);
      showAlert(`Successfully saved as ${status === 'published' ? '🟢 Published Live' : '🟡 Offline Draft'}!`, 'success');
      loadPageData();
    } catch (err) {
      console.error(err);
      showAlert('Failed to save to database.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Restore Revision helper
  const handleRestoreRevision = async (rev: any) => {
    if (!page) return;
    setLoading(true);
    try {
      setSeo(rev.seo || page.seo);
      setSections(rev.sections || []);
      
      // Update specific components instantly
      const heroSec = rev.sections.find((s: any) => s.type === 'AboutHero');
      if (heroSec) setHeroContent(heroSec.content || {});

      const compSec = rev.sections.find((s: any) => s.type === 'AboutCompany');
      if (compSec) setCompanyContent(compSec.content || {});

      const statsSec = rev.sections.find((s: any) => s.type === 'AboutStats');
      if (statsSec) setStats(statsSec.content?.stats || []);

      const mvSec = rev.sections.find((s: any) => s.type === 'AboutMissionVision');
      if (mvSec) setMissionVision(mvSec.content || {});

      const valSec = rev.sections.find((s: any) => s.type === 'AboutValues');
      if (valSec) setValues(valSec.content?.values || []);

      const teamSec = rev.sections.find((s: any) => s.type === 'AboutLeadership');
      if (teamSec) setTeam(teamSec.content?.team || []);

      const timeSec = rev.sections.find((s: any) => s.type === 'AboutTimeline');
      if (timeSec) setTimeline(timeSec.content?.milestones || []);

      const faqSec = rev.sections.find((s: any) => s.type === 'About' || s.id === 'about-faqs');
      if (faqSec) setFaqs(faqSec.content?.faqs || []);

      showAlert('Successfully restored revision in editor. Remember to Save/Publish changes!', 'success');
    } catch (err) {
      console.error(err);
      showAlert('Failed to restore revision.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Reorder lists helper
  const moveItem = (list: any[], setList: (list: any[]) => void, index: number, direction: 'up' | 'down') => {
    const updated = [...list];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    
    // Swap
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setList(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-10 h-10 animate-spin text-indigo-500 mx-auto" />
          <p className="text-xs font-mono text-slate-400">CONNECTING TO MONGODB CLUSTERS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Alert Banner */}
      {alert && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 border transition-all animate-fade-in ${
          alert.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200' : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
        }`}>
          {alert.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span className="text-xs font-bold leading-none">{alert.text}</span>
        </div>
      )}

      {/* Admin Navbar */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/superadmin/admin/website-management')}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold tracking-wider font-mono text-white">NX CMS</h1>
              <span className="px-2 py-0.5 bg-indigo-950 text-indigo-400 border border-indigo-500/30 text-[9px] font-bold uppercase rounded-md tracking-widest">ABOUT US</span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest block">Enterprise Page Editor</span>
          </div>
        </div>

        {/* Global Control Toolbar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/25"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Publish Live</span>
          </button>
          <a
            href="/about"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Page</span>
          </a>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-grow flex flex-col lg:flex-row">
        {/* Left Sidebar Menu */}
        <aside className="w-full lg:w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-1.5">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block px-3 mb-2">CMS CONTROLS</span>
          {[
            { id: 'settings', label: 'Website & SEO Settings', icon: Settings },
            { id: 'hero', label: 'Section 1: About Hero', icon: Layers },
            { id: 'company', label: 'Section 2: Company Info', icon: Info },
            { id: 'stats', label: 'Section 3: Statistics', icon: TrendingUp },
            { id: 'mission', label: 'Section 4: Mission & Vision', icon: Shield },
            { id: 'values', label: 'Section 5: Company Values', icon: Award },
            { id: 'team', label: 'Section 6: Leadership Team', icon: Users },
            { id: 'timeline', label: 'Section 7: Milestones', icon: Calendar },
            { id: 'faqs', label: 'Section 8: FAQ Panel', icon: HelpCircle },
            { id: 'revisions', label: 'Version History', icon: RefreshCw },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${
                  active 
                    ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-extrabold' 
                    : 'border border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Dynamic Panel Content */}
        <main className="flex-grow p-6 md:p-8 max-w-4xl w-full mx-auto space-y-8 overflow-y-auto">
          {/* TAB 1: WEBSITE & SEO SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-indigo-400" />
                    <span>Website Metadata Settings</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">Configure global accessibility, SEO metadata index, and sitemap settings for the public about page.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Page Status / Visibility</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPageVisible(true)}
                        className={`flex-1 py-2.5 rounded-xl border font-bold transition-all ${
                          pageVisible 
                            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' 
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        🔴 Active / Published
                      </button>
                      <button
                        onClick={() => setPageVisible(false)}
                        className={`flex-1 py-2.5 rounded-xl border font-bold transition-all ${
                          !pageVisible 
                            ? 'bg-rose-950/40 border-rose-500/30 text-rose-400' 
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        🔒 Temporarily Offline
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sitemap URL Slug</label>
                    <input
                      disabled
                      value="/about"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-500 font-mono text-xs cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SEO Meta Title</label>
                    <input
                      value={seo.title || ''}
                      onChange={e => setSeo({ ...seo, title: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl p-2.5 text-white font-semibold text-xs"
                      placeholder="About Us - Leading AI Security Surveillance Platforms"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SEO Meta Description</label>
                    <textarea
                      rows={3}
                      value={seo.description || ''}
                      onChange={e => setSeo({ ...seo, description: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl p-2.5 text-white text-xs"
                      placeholder="Learn more about NX Solution: our mission, values, history, leadership team, and credentials in executing enterprise AI security networks."
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Keywords (comma separated)</label>
                    <input
                      value={seo.keywords || ''}
                      onChange={e => setSeo({ ...seo, keywords: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl p-2.5 text-white text-xs"
                      placeholder="about us, security automation, AI cameras, smart monitoring, NX team"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ABOUT HERO */}
          {activeTab === 'hero' && (
            <div className="space-y-6 animate-fade-in text-xs">
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    <span>Hero Section Configuration</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">Modify display heading, floating values, badges, and the primary high-resolution background image.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Badge Tagline Text</label>
                    <input
                      value={heroContent.badgeText || ''}
                      onChange={e => setHeroContent({ ...heroContent, badgeText: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl p-2.5 text-white text-xs font-semibold"
                      placeholder="Pioneering Enterprise AI Hardware"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Main Heading Title</label>
                    <input
                      value={heroContent.title || ''}
                      onChange={e => setHeroContent({ ...heroContent, title: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl p-2.5 text-white text-xs font-bold"
                      placeholder="Empowering Safe & Autonomous Facilities"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subtitle Paragraph</label>
                    <textarea
                      rows={3}
                      value={heroContent.subtitle || ''}
                      onChange={e => setHeroContent({ ...heroContent, subtitle: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl p-2.5 text-white text-xs"
                      placeholder="NX Solution designs next-generation edge CCTV nodes, barrier mechanical relays, and visual management boards for modern businesses."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary Button Text</label>
                    <input
                      value={heroContent.ctaText || ''}
                      onChange={e => setHeroContent({ ...heroContent, ctaText: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl p-2.5 text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary Button URL</label>
                    <input
                      value={heroContent.ctaUrl || ''}
                      onChange={e => setHeroContent({ ...heroContent, ctaUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl p-2.5 text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Secondary Button Text</label>
                    <input
                      value={heroContent.secondaryCtaText || ''}
                      onChange={e => setHeroContent({ ...heroContent, secondaryCtaText: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl p-2.5 text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Secondary Button URL</label>
                    <input
                      value={heroContent.secondaryCtaUrl || ''}
                      onChange={e => setHeroContent({ ...heroContent, secondaryCtaUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl p-2.5 text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Badge Metric Value</label>
                    <input
                      value={heroContent.experienceValue || ''}
                      onChange={e => setHeroContent({ ...heroContent, experienceValue: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl p-2.5 text-white text-xs"
                      placeholder="10+"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Badge Metric Label</label>
                    <input
                      value={heroContent.experienceLabel || ''}
                      onChange={e => setHeroContent({ ...heroContent, experienceLabel: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl p-2.5 text-white text-xs"
                      placeholder="Years of Active Field Innovation"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <ImageUploader
                      value={heroContent.bgImage || ''}
                      onChange={url => setHeroContent({ ...heroContent, bgImage: url })}
                      label="Hero Supporting Image"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMPANY INFORMATION */}
          {activeTab === 'company' && (
            <div className="space-y-6 animate-fade-in text-xs">
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Info className="w-5 h-5 text-indigo-400" />
                    <span>Company Information Details</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">Manage description paragraphs, lateral illustrations, and bullet points highlights.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subtitle Tagline</label>
                      <input
                        value={companyContent.subtitle || ''}
                        onChange={e => setCompanyContent({ ...companyContent, subtitle: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-semibold text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Section Title</label>
                      <input
                        value={companyContent.title || ''}
                        onChange={e => setCompanyContent({ ...companyContent, title: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paragraph Description 1</label>
                    <textarea
                      rows={3}
                      value={companyContent.desc1 || ''}
                      onChange={e => setCompanyContent({ ...companyContent, desc1: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paragraph Description 2</label>
                    <textarea
                      rows={3}
                      value={companyContent.desc2 || ''}
                      onChange={e => setCompanyContent({ ...companyContent, desc2: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <ImageUploader
                      value={companyContent.image || ''}
                      onChange={url => setCompanyContent({ ...companyContent, image: url })}
                      label="Lateral Content Image"
                    />
                  </div>

                  {/* Bullet checklist highlights */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">CHECKLIST BULLET ITEMS</span>
                      <button
                        type="button"
                        onClick={() => {
                          const items = companyContent.bullets || [];
                          setCompanyContent({
                            ...companyContent,
                            bullets: [...items, { text: 'New custom highlights bullet line', icon: 'Check' }]
                          });
                        }}
                        className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Highlight
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(companyContent.bullets || []).map((bullet: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                          <input
                            value={bullet.text || ''}
                            onChange={e => {
                              const updated = [...companyContent.bullets];
                              updated[idx].text = e.target.value;
                              setCompanyContent({ ...companyContent, bullets: updated });
                            }}
                            className="flex-grow bg-transparent border-none text-white text-xs font-semibold focus:outline-none"
                          />
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => {
                                const list = [...companyContent.bullets];
                                const temp = list[idx];
                                list[idx] = list[idx - 1];
                                list[idx - 1] = temp;
                                setCompanyContent({ ...companyContent, bullets: list });
                              }}
                              className="p-1 hover:bg-slate-900 rounded text-slate-500 hover:text-white disabled:opacity-20"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === companyContent.bullets.length - 1}
                              onClick={() => {
                                const list = [...companyContent.bullets];
                                const temp = list[idx];
                                list[idx] = list[idx + 1];
                                list[idx + 1] = temp;
                                setCompanyContent({ ...companyContent, bullets: list });
                              }}
                              className="p-1 hover:bg-slate-900 rounded text-slate-500 hover:text-white disabled:opacity-20"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteModal('bullet', idx, `Bullet point ${idx + 1}`)}
                              className="p-1 hover:bg-slate-900 rounded text-rose-500 hover:bg-rose-950/20"
                              title="Delete bullet"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STATISTICS */}
          {activeTab === 'stats' && (
            <div className="space-y-6 animate-fade-in text-xs">
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-400" />
                      <span>Company Performance Counters</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">Manage numbers, percentages, titles, and supporting descriptive texts.</p>
                  </div>
                  <button
                    onClick={() => setEditingStat({ value: '100+', label: 'New Counter', icon: 'Clock', desc: 'Description label text.' })}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Stat</span>
                  </button>
                </div>

                {editingStat && (
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-4">
                    <h4 className="font-bold text-white text-xs">{editingStat.id ? 'Modify Performance Counter' : 'New Performance Counter'}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Metric Counter Value</label>
                        <input
                          value={editingStat.value || ''}
                          onChange={e => setEditingStat({ ...editingStat, value: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                          placeholder="e.g. 500+"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Metric Counter Label</label>
                        <input
                          value={editingStat.label || ''}
                          onChange={e => setEditingStat({ ...editingStat, label: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                          placeholder="e.g. Active Enterprises"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Icon Tag Name</label>
                        <input
                          value={editingStat.icon || ''}
                          onChange={e => setEditingStat({ ...editingStat, icon: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                          placeholder="Clock / Users / Trophy"
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Quick Description Summary</label>
                        <textarea
                          rows={2}
                          value={editingStat.desc || ''}
                          onChange={e => setEditingStat({ ...editingStat, desc: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 text-[10px]">
                      <button
                        onClick={() => setEditingStat(null)}
                        className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const updated = [...stats];
                          const matchIdx = editingStat.idx !== undefined ? editingStat.idx : -1;
                          if (matchIdx > -1) {
                            updated[matchIdx] = editingStat;
                          } else {
                            updated.push(editingStat);
                          }
                          setStats(updated);
                          setEditingStat(null);
                        }}
                        className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg"
                      >
                        Commit Card
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-850">
                      <div>
                        <span className="font-extrabold text-white font-mono text-sm mr-2">{stat.value}</span>
                        <span className="font-bold text-slate-300">{stat.label}</span>
                        <p className="text-[10px] text-slate-500 mt-0.5">{stat.desc}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => moveItem(stats, setStats, idx, 'up')}
                          className="p-1 hover:bg-slate-900 rounded text-slate-400"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveItem(stats, setStats, idx, 'down')}
                          className="p-1 hover:bg-slate-900 rounded text-slate-400"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingStat({ ...stat, idx })}
                          className="p-1.5 hover:bg-indigo-950 rounded text-indigo-400"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal('stat', idx, stat.label || `Stat #${idx + 1}`)}
                          className="p-1.5 hover:bg-rose-950 rounded text-rose-500"
                          title="Delete stat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MISSION & VISION */}
          {activeTab === 'mission' && (
            <div className="space-y-6 animate-fade-in text-xs">
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-400" />
                    <span>Mission & Vision Configuration</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">Configure alignment headings, supporting vector tags, and the central corporate quote block.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mission Card */}
                  <div className="space-y-4 bg-slate-950 p-5 rounded-xl border border-slate-850">
                    <h4 className="font-extrabold text-white text-xs border-b border-slate-850 pb-2">CORPORATE MISSION STATEMENT</h4>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Mission Header</label>
                        <input
                          value={missionVision.missionTitle || ''}
                          onChange={e => setMissionVision({ ...missionVision, missionTitle: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Mission Text Description</label>
                        <textarea
                          rows={4}
                          value={missionVision.missionDesc || ''}
                          onChange={e => setMissionVision({ ...missionVision, missionDesc: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Mission Vector Icon</label>
                        <input
                          value={missionVision.missionIcon || ''}
                          onChange={e => setMissionVision({ ...missionVision, missionIcon: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                          placeholder="Compass"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vision Card */}
                  <div className="space-y-4 bg-slate-950 p-5 rounded-xl border border-slate-850">
                    <h4 className="font-extrabold text-white text-xs border-b border-slate-850 pb-2">CORPORATE VISION STATEMENT</h4>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Vision Header</label>
                        <input
                          value={missionVision.visionTitle || ''}
                          onChange={e => setMissionVision({ ...missionVision, visionTitle: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Vision Text Description</label>
                        <textarea
                          rows={4}
                          value={missionVision.visionDesc || ''}
                          onChange={e => setMissionVision({ ...missionVision, visionDesc: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Vision Vector Icon</label>
                        <input
                          value={missionVision.visionIcon || ''}
                          onChange={e => setMissionVision({ ...missionVision, visionIcon: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                          placeholder="Eye"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Corporate Quote */}
                  <div className="space-y-1 md:col-span-2 bg-slate-950 p-5 rounded-xl border border-slate-850">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Vision Corporate Quote</label>
                    <textarea
                      rows={2}
                      value={missionVision.quote || ''}
                      onChange={e => setMissionVision({ ...missionVision, quote: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white italic font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: COMPANY VALUES */}
          {activeTab === 'values' && (
            <div className="space-y-6 animate-fade-in text-xs">
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-400" />
                      <span>Company Core Values</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">Manage core enterprise values, vectors icons tags, and description sentences.</p>
                  </div>
                  <button
                    onClick={() => setEditingValue({ title: 'Absolute Safety', icon: 'ShieldCheck', desc: 'Detail values guidelines.' })}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Value</span>
                  </button>
                </div>

                {editingValue && (
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-4">
                    <h4 className="font-bold text-white text-xs">{editingValue.id ? 'Modify Core Value' : 'New Core Value'}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Value Title</label>
                        <input
                          value={editingValue.title || ''}
                          onChange={e => setEditingValue({ ...editingValue, title: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Icon Class Name</label>
                        <input
                          value={editingValue.icon || ''}
                          onChange={e => setEditingValue({ ...editingValue, icon: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                          placeholder="ShieldCheck / Cpu / RefreshCw"
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Value Statement Description</label>
                        <textarea
                          rows={2}
                          value={editingValue.desc || ''}
                          onChange={e => setEditingValue({ ...editingValue, desc: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 text-[10px]">
                      <button
                        onClick={() => setEditingValue(null)}
                        className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const updated = [...values];
                          const matchIdx = editingValue.idx !== undefined ? editingValue.idx : -1;
                          if (matchIdx > -1) {
                            updated[matchIdx] = editingValue;
                          } else {
                            updated.push(editingValue);
                          }
                          setValues(updated);
                          setEditingValue(null);
                        }}
                        className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg"
                      >
                        Commit Value
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {values.map((val, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-850">
                      <div>
                        <span className="px-2 py-1 bg-slate-900 text-slate-400 border border-slate-800 rounded font-mono text-[9px] uppercase tracking-wider mr-2">{val.icon}</span>
                        <span className="font-bold text-white">{val.title}</span>
                        <p className="text-[10px] text-slate-500 mt-0.5">{val.desc}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => moveItem(values, setValues, idx, 'up')}
                          className="p-1 hover:bg-slate-900 rounded text-slate-400"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveItem(values, setValues, idx, 'down')}
                          className="p-1 hover:bg-slate-900 rounded text-slate-400"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingValue({ ...val, idx })}
                          className="p-1.5 hover:bg-indigo-950 rounded text-indigo-400"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal('value', idx, val.title || `Value #${idx + 1}`)}
                          className="p-1.5 hover:bg-rose-950 rounded text-rose-500"
                          title="Delete value"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: LEADERSHIP TEAM */}
          {activeTab === 'team' && (
            <div className="space-y-6 animate-fade-in text-xs">
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-400" />
                      <span>Executive Leadership Directory</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">Manage company board members, profile photos, descriptive bios, and social links profiles.</p>
                  </div>
                  <button
                    onClick={() => setEditingTeam({ name: 'John Doe', role: 'Chief Executive Officer', avatar: '', bio: 'CEO Biography statement.', linkedin: 'https://linkedin.com' })}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-1 shadow-lg shadow-indigo-600/20 transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Enlist Director</span>
                  </button>
                </div>

                {editingTeam && (
                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-2xl">
                    <h4 className="font-extrabold text-white text-xs border-b border-slate-850 pb-2">{editingTeam.idx !== undefined ? 'Modify Director Details' : 'Enlist New Director'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Director Full Name</label>
                        <input
                          value={editingTeam.name || ''}
                          onChange={e => setEditingTeam({ ...editingTeam, name: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-semibold text-xs"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Corporate Role / Designation</label>
                        <input
                          value={editingTeam.role || ''}
                          onChange={e => setEditingTeam({ ...editingTeam, role: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-semibold text-xs"
                          placeholder="Founder & Chief Executive Officer"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Biography / Executive Overview</label>
                        <textarea
                          rows={3}
                          value={editingTeam.bio || ''}
                          onChange={e => setEditingTeam({ ...editingTeam, bio: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white text-xs"
                          placeholder="Over 15 years engineering high-performance hardware biometric systems..."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">LinkedIn URL</label>
                        <input
                          value={editingTeam.linkedin || ''}
                          onChange={e => setEditingTeam({ ...editingTeam, linkedin: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white text-xs font-mono"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <ImageUploader
                          value={editingTeam.avatar || ''}
                          onChange={url => setEditingTeam({ ...editingTeam, avatar: url })}
                          label="Profile Photo"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 text-[10px] pt-2 border-t border-slate-900">
                      <button
                        onClick={() => setEditingTeam(null)}
                        className="px-4 py-2 bg-slate-800 text-slate-400 rounded-xl font-bold"
                      >
                        Discard Details
                      </button>
                      <button
                        onClick={() => {
                          const updated = [...team];
                          const matchIdx = editingTeam.idx !== undefined ? editingTeam.idx : -1;
                          if (matchIdx > -1) {
                            updated[matchIdx] = editingTeam;
                          } else {
                            updated.push(editingTeam);
                          }
                          setTeam(updated);
                          setEditingTeam(null);
                        }}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg"
                      >
                        Commit Director
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {team.map((member, idx) => (
                    <div key={idx} className="bg-slate-950 rounded-2xl border border-slate-850 p-4 flex flex-col justify-between space-y-4">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0">
                          {member.avatar ? (
                            <img src={member.avatar} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600"><Users className="w-4 h-4" /></div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-white text-xs">{member.name}</h4>
                          <span className="text-[9px] font-bold uppercase text-indigo-400 tracking-wider leading-none mt-1 block">{member.role}</span>
                          <p className="text-[10px] text-slate-400 mt-2 line-clamp-2 leading-normal">{member.bio}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-900 text-[10px]">
                        <span className="text-slate-500 font-mono text-[9px]">Active Status</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveItem(team, setTeam, idx, 'up')}
                            className="p-1 hover:bg-slate-900 rounded text-slate-400"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveItem(team, setTeam, idx, 'down')}
                            className="p-1 hover:bg-slate-900 rounded text-slate-400"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingTeam({ ...member, idx })}
                            className="p-1 hover:bg-indigo-950 rounded text-indigo-400"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openDeleteModal('team', idx, member.name || `Team Member #${idx + 1}`)}
                            className="p-1 hover:bg-rose-950 rounded text-rose-500"
                            title="Delete team member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-6 animate-fade-in text-xs">
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-400" />
                      <span>Company Corporate Timeline</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">Configure chronological milestones, achievements, and structural breakthrough years.</p>
                  </div>
                  <button
                    onClick={() => setEditingTimeline({ year: '2026', title: 'Smart Breakthrough', desc: 'Milestones summary details.' })}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Milestone</span>
                  </button>
                </div>

                {editingTimeline && (
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-4">
                    <h4 className="font-bold text-white text-xs">{editingTimeline.idx !== undefined ? 'Modify Milestones Card' : 'New Milestone Card'}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Milestone Year</label>
                        <input
                          value={editingTimeline.year || ''}
                          onChange={e => setEditingTimeline({ ...editingTimeline, year: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-bold font-mono"
                          placeholder="e.g. 2026"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Breakthrough Title</label>
                        <input
                          value={editingTimeline.title || ''}
                          onChange={e => setEditingTimeline({ ...editingTimeline, title: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-bold"
                          placeholder="e.g. Inception & Research"
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Breakthrough Description</label>
                        <textarea
                          rows={3}
                          value={editingTimeline.desc || ''}
                          onChange={e => setEditingTimeline({ ...editingTimeline, desc: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 text-[10px]">
                      <button
                        onClick={() => setEditingTimeline(null)}
                        className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const updated = [...timeline];
                          const matchIdx = editingTimeline.idx !== undefined ? editingTimeline.idx : -1;
                          if (matchIdx > -1) {
                            updated[matchIdx] = editingTimeline;
                          } else {
                            updated.push(editingTimeline);
                          }
                          setTimeline(updated);
                          setEditingTimeline(null);
                        }}
                        className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg"
                      >
                        Commit Milestone
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {timeline.map((stone, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-850">
                      <div>
                        <span className="text-indigo-400 font-extrabold font-mono text-xs block tracking-widest">{stone.year}</span>
                        <span className="font-bold text-white text-xs mt-0.5 block">{stone.title}</span>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal max-w-lg">{stone.desc}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => moveItem(timeline, setTimeline, idx, 'up')}
                          className="p-1 hover:bg-slate-900 rounded text-slate-400"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveItem(timeline, setTimeline, idx, 'down')}
                          className="p-1 hover:bg-slate-900 rounded text-slate-400"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingTimeline({ ...stone, idx })}
                          className="p-1.5 hover:bg-indigo-950 rounded text-indigo-400"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal('timeline', idx, stone.title || `Event ${stone.year || idx + 1}`)}
                          className="p-1.5 hover:bg-rose-950 rounded text-rose-500"
                          title="Delete timeline event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: FAQS */}
          {activeTab === 'faqs' && (
            <div className="space-y-6 animate-fade-in text-xs">
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-indigo-400" />
                      <span>Corporate About FAQs Management</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">Control interactive customer query lists, dynamic tags, categories, and explanatory answers.</p>
                  </div>
                  <button
                    onClick={() => setEditingFaq({ q: 'What is the standard SLA count?', a: 'Standard SLA response takes less than 4 working hours.' })}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add FAQ</span>
                  </button>
                </div>

                {editingFaq && (
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-4">
                    <h4 className="font-bold text-white text-xs">{editingFaq.idx !== undefined ? 'Modify FAQ Details' : 'New Corporate FAQ'}</h4>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Frequently Asked Question</label>
                        <input
                          value={editingFaq.q || ''}
                          onChange={e => setEditingFaq({ ...editingFaq, q: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-semibold"
                          placeholder="What is your hardware lock response guarantee?"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Informative Answer</label>
                        <textarea
                          rows={3}
                          value={editingFaq.a || ''}
                          onChange={e => setEditingFaq({ ...editingFaq, a: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white leading-relaxed"
                          placeholder="Describe clear, helpful enterprise feedback details..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 text-[10px]">
                      <button
                        onClick={() => setEditingFaq(null)}
                        className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const updated = [...faqs];
                          const matchIdx = editingFaq.idx !== undefined ? editingFaq.idx : -1;
                          if (matchIdx > -1) {
                            updated[matchIdx] = editingFaq;
                          } else {
                            updated.push(editingFaq);
                          }
                          setFaqs(updated);
                          setEditingFaq(null);
                        }}
                        className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg"
                      >
                        Commit FAQ
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="bg-slate-950 rounded-xl border border-slate-850 p-4 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] text-indigo-400 font-extrabold uppercase font-mono tracking-wider">QUESTION {idx + 1}</span>
                          <h4 className="font-bold text-white text-xs mt-0.5">{faq.q}</h4>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => moveItem(faqs, setFaqs, idx, 'up')}
                            className="p-1 hover:bg-slate-900 rounded text-slate-400"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveItem(faqs, setFaqs, idx, 'down')}
                            className="p-1 hover:bg-slate-900 rounded text-slate-400"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingFaq({ ...faq, idx })}
                            className="p-1 hover:bg-indigo-950 rounded text-indigo-400"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openDeleteModal('faq', idx, faq.q || `FAQ #${idx + 1}`)}
                            className="p-1 hover:bg-rose-950 rounded text-rose-500"
                            title="Delete FAQ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 border-t border-slate-900 pt-2 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: REVISIONS / VERSION HISTORY */}
          {activeTab === 'revisions' && (
            <div className="space-y-6 animate-fade-in text-xs">
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-indigo-400" />
                    <span>Version History & Rollbacks</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">Review the last 10 page save events. Instant rollback enables restoring previous draft/published states safely.</p>
                </div>

                <div className="space-y-3">
                  {revisions.length === 0 ? (
                    <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-850 text-slate-500">
                      No previous revisions available for this page yet. Save drafts or publish changes to trigger history tracking.
                    </div>
                  ) : (
                    revisions.map((rev, idx) => (
                      <div key={rev.id || idx} className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">Revision #{revisions.length - idx}</span>
                            <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded font-mono tracking-wider ${
                              rev.type === 'published' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' : 'bg-amber-950 text-amber-400 border border-amber-500/20'
                            }`}>
                              {rev.type === 'published' ? 'Live Published' : 'Offline Draft'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-1.5 font-mono">Timestamp: {new Date(rev.timestamp).toLocaleString()} &bull; Edited by: {rev.editor || 'Super Admin'}</span>
                        </div>

                        <button
                          onClick={() => handleRestoreRevision(rev)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-indigo-650 hover:text-white border border-slate-800 text-slate-300 font-extrabold text-[10px] rounded-lg transition-all"
                        >
                          Restore State
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Confirm Removal"
        itemName={deleteModal.name}
        message={`Are you sure you want to remove "${deleteModal.name}"? This action will take effect in draft mode until saved.`}
        isDeleting={false}
        onConfirm={handleConfirmItemDelete}
        onCancel={() => setDeleteModal({ isOpen: false, type: null, index: -1, name: '' })}
      />
    </div>
  );
}
