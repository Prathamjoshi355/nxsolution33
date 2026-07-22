import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, ArrowRight, Layout, Settings, Cpu, MessageSquareQuote } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('nx_admin_token');
    localStorage.removeItem('nx_admin_user');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Admin Navbar */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-wider font-mono text-white">NX WORKSPACE</h1>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Global Control Console</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-rose-950/20 hover:bg-rose-900 border border-rose-500/20 hover:border-rose-500 text-rose-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </nav>

      {/* Admin Content Area */}
      <main className="flex-grow max-w-4xl w-full mx-auto p-6 md:p-10 space-y-8">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-400" />
            <span>Administrative Hub</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Select an active module below to update live application states or adjust configuration values.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Home Page Manager Card */}
          <div 
            onClick={() => navigate('/superadmin/admin/home-page')}
            className="group bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-1 shadow-xl flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-colors">
                <Layout className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                  Home Page CMS
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Manage the main landing hero text, pulse badges, CTA buttons, trusted logos, and customized advantage grids. Includes complete drafts and live publishing.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-indigo-400 group-hover:text-indigo-300 pt-4 border-t border-slate-800/60">
              <span>Launch Module</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Industry Management Card */}
          <div 
            onClick={() => navigate('/superadmin/admin/industries')}
            className="group bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-1 shadow-xl flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-colors">
                <Cpu className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Industry Management
                </h3>
                <span className="inline-block px-2 py-0.5 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold uppercase rounded tracking-wider">Level 1 of 5</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Configure corporate industries. Manage brand slugs, meta descriptions, unique vector icons, custom CTAs, and navigate directly into Institution management.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:text-emerald-300 pt-4 border-t border-slate-800/60">
              <span>Manage Industries</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Website Management & Pages CMS Card */}
          <div 
            onClick={() => navigate('/superadmin/admin/website-management')}
            className="group bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-1 shadow-xl flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl flex items-center justify-center group-hover:bg-sky-500/20 group-hover:text-sky-300 transition-colors">
                <Layout className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors">
                  Website & Page CMS
                </h3>
                <span className="inline-block px-2 py-0.5 bg-sky-950/40 border border-sky-500/30 text-sky-400 text-[9px] font-bold uppercase rounded tracking-wider">Enterprise Modules</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Redesign Products, Product Details, Case Studies, About Us, Resources, and Contact. Maintain SEO settings, sitemaps, global toggles, and revision backups.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-sky-400 group-hover:text-sky-300 pt-4 border-t border-slate-800/60">
              <span>Open Website Console</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* About Us CMS Card */}
          <div 
            onClick={() => navigate('/superadmin/admin/about-us')}
            className="group bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-1 shadow-xl flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-colors">
                <Layout className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                  About Us CMS
                </h3>
                <span className="inline-block px-2 py-0.5 bg-indigo-950/40 border border-indigo-500/30 text-indigo-400 text-[9px] font-bold uppercase rounded tracking-wider">Page CMS</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Manage the About Us page sections, including Hero banner, Company Info highlights, scale Statistics, Mission/Vision, Leadership Board, Timeline Milestones, and FAQs.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-indigo-400 group-hover:text-indigo-300 pt-4 border-t border-slate-800/60">
              <span>Open About Console</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Technology Ecosystem Module Card */}
          <div 
            onClick={() => navigate('/superadmin/admin/technology-ecosystem')}
            className="group bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-1 shadow-xl flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors">
                <Cpu className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
                  Technology Ecosystem Module
                </h3>
                <span className="inline-block px-2 py-0.5 bg-purple-950/40 border border-purple-500/30 text-purple-400 text-[9px] font-bold uppercase rounded tracking-wider">Single Source of Truth</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Centralized repository for all technology partners and stack brands (HIKVISION, Dahua, Suprema, Matrix, Axis, AWS, etc.). Manage logos, categories, status, and display order.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-purple-400 group-hover:text-purple-300 pt-4 border-t border-slate-800/60">
              <span>Manage Technologies</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Testimonials Module Card */}
          <div 
            onClick={() => navigate('/superadmin/admin/testimonials')}
            className="group bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-1 shadow-xl flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-colors">
                <MessageSquareQuote className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Testimonials Module
                </h3>
                <span className="inline-block px-2 py-0.5 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold uppercase rounded tracking-wider">Single Source of Truth</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Centralized client testimonials repository. Manage client quotes, designations, logos, ratings, photos, and publish statuses. Connects directly with Home Page CMS.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:text-emerald-300 pt-4 border-t border-slate-800/60">
              <span>Manage Testimonials</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
