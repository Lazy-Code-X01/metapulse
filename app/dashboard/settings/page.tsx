'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';

export default function SettingsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [company, setCompany] = useState('');
  const [omUrl, setOmUrl] = useState('');
  const [omToken, setOmToken] = useState('');
  const [slackWebhook, setSlackWebhook] = useState('');
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCompany(localStorage.getItem('metapulse_company') || '');
    setOmUrl(localStorage.getItem('metapulse_om_url') || '');
    setOmToken(localStorage.getItem('metapulse_om_token') || '');
    setSlackWebhook(localStorage.getItem('metapulse_slack_webhook') || '');

    // Track scroll for header animation (matches dashboard pattern)
    const mainElement = document.querySelector('main');
    const handleScroll = () => {
      if (mainElement) {
        setIsScrolled(mainElement.scrollTop > 10);
      }
    };

    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (mainElement) {
        mainElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const saveSettings = () => {
    localStorage.setItem('metapulse_company', company);
    localStorage.setItem('metapulse_om_url', omUrl);
    localStorage.setItem('metapulse_om_token', omToken);
    localStorage.setItem('metapulse_slack_webhook', slackWebhook);
    
    setSaveStatus({ type: 'success', message: 'Preferences updated successfully' });
    setTimeout(() => setSaveStatus({ type: null, message: '' }), 3000);
  };

  const resetOnboarding = () => {
    if (confirm('Are you sure you want to reset everything? This will wipe your local configuration.')) {
      localStorage.removeItem('metapulse_onboarded');
      localStorage.removeItem('metapulse_company');
      localStorage.removeItem('metapulse_om_url');
      localStorage.removeItem('metapulse_om_token');
      localStorage.removeItem('metapulse_slack_webhook');
      localStorage.removeItem('metapulse_incidents');
      router.push('/onboarding');
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-full bg-slate-50/50 p-6 md:p-10 relative">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className={`sticky top-0 z-20 border-b border-slate-200/60 bg-slate-50/80 backdrop-blur-md -mx-1 px-1 transition-all duration-500 ${isScrolled ? 'pt-2 pb-4' : 'pb-8'}`}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className={`space-y-4 transition-all duration-500 origin-left ${isScrolled ? 'scale-90 translate-x-2' : 'scale-100'}`}>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Settings</h1>
              <p className="text-sm font-bold text-slate-400 tracking-widest leading-none">Manage your data connections & brand</p>
            </div>
            
            <button 
              onClick={saveSettings}
              className={`group relative bg-emerald-500 hover:opacity-90 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-3 transition-all shadow-2xl shadow-emerald-500/10 active:scale-95 overflow-hidden ${isScrolled ? 'scale-90 -translate-x-2' : 'scale-100'}`}
            >
              Save Changes
            </button>
          </div>
        </div>

        {saveStatus.message && (
          <div className="fixed top-10 right-10 z-50 animate-in fade-in slide-in-from-right-8 duration-500">
             <div className="bg-white border border-emerald-100 shadow-2xl shadow-emerald-500/10 rounded-2xl px-6 py-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                   <Icon icon="solar:check-circle-bold-duotone" width="20" />
                </div>
                <p className="text-sm font-black text-slate-900">{saveStatus.message}</p>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Form Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Identity Section */}
            <section className="bg-white rounded-[2.5rem] border border-slate-200/60 p-10 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/20 group">
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100/50 group-hover:scale-110 transition-transform">
                    <Icon icon="solar:user-id-bold-duotone" width="24" />
                 </div>
                 <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">Who are you?</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Workspace Identity</p>
                 </div>
              </div>
              
              <div className="space-y-3 group/input">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 group-focus-within/input:text-emerald-500 transition-colors">Workspace Name</label>
                <input 
                  type="text" 
                  value={company} 
                  onChange={(e) => setCompany(e.target.value)} 
                  placeholder="e.g. MetaPulse Global"
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all bg-slate-50 focus:bg-white placeholder:text-slate-200 shadow-inner"
                />
              </div>
            </section>

            {/* Data Connection Section */}
            <section className="bg-white rounded-[2.5rem] border border-slate-200/60 p-10 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/20 group">
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100/50 group-hover:scale-110 transition-transform">
                    <Icon icon="solar:database-bold-duotone" width="24" />
                 </div>
                 <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">Data Connection</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connect to your Metadata Server</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3 group/input">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 group-focus-within/input:text-blue-500 transition-colors">Server URL</label>
                  <input 
                    type="text" 
                    value={omUrl} 
                    onChange={(e) => setOmUrl(e.target.value)} 
                    placeholder="https://server.com/api"
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white font-mono placeholder:text-slate-200 shadow-inner"
                  />
                </div>
                <div className="space-y-3 group/input">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 group-focus-within/input:text-blue-500 transition-colors">Access Secret</label>
                  <input 
                    type="password" 
                    value={omToken} 
                    onChange={(e) => setOmToken(e.target.value)} 
                    placeholder="••••••••••••••••"
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white font-mono placeholder:text-slate-200 shadow-inner"
                  />
                </div>
              </div>
            </section>

            {/* Notifications Section */}
            <section className="bg-white rounded-[2.5rem] border border-slate-200/60 p-10 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/20 group">
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100/50 group-hover:scale-110 transition-transform">
                    <Icon icon="solar:bell-bing-bold-duotone" width="24" />
                 </div>
                 <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">Alerts</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Send notifications to Slack</p>
                 </div>
              </div>
              <div className="space-y-3 group/input">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 group-focus-within/input:text-purple-500 transition-colors">Slack Webhook URL</label>
                <input 
                  type="text" 
                  value={slackWebhook} 
                  onChange={(e) => setSlackWebhook(e.target.value)} 
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 transition-all bg-slate-50 focus:bg-white font-mono placeholder:text-slate-200 shadow-inner"
                />
              </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8">
            {/* Context Card */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
               <h3 className="text-xl font-black tracking-tight mb-4">Storage Logic</h3>
               <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                  All preferences are stored in your local session. Personal security tokens are never transmitted to our core servers.
               </p>
               <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                  <Icon icon="solar:shield-check-bold-duotone" className="text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Self-Hosted Mode</span>
               </div>
            </div>

            {/* Reset Area */}
            <section className="bg-red-50/50 rounded-[2.5rem] border border-red-100/50 p-8">
              <div className="space-y-6">
                 <div className="space-y-2">
                    <h2 className="text-[10px] font-black text-red-700 uppercase tracking-widest flex items-center gap-2">
                      <Icon icon="solar:danger-bold-duotone" width="14" /> Danger Zone
                    </h2>
                    <p className="text-xs font-bold text-red-700/60 leading-relaxed">
                      Wipe all data and restart the onboarding tour from scratch. This cannot be undone.
                    </p>
                 </div>
                 <button 
                   onClick={resetOnboarding}
                   className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white bg-red-500 hover:bg-red-600 shadow-xl shadow-red-500/20 transition-all active:scale-95"
                 >
                   Reset Everything
                 </button>
              </div>
            </section>

            {/* Footer Credits */}
            <div className="py-4 text-center space-y-6 opacity-40 hover:opacity-100 transition-opacity">
               <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-[10px] font-black text-white p-1 shadow-lg shadow-slate-200">MP</div>
                  <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">MetaPulse OS v1.4</p>
               </div>
               <div className="flex items-center justify-center gap-6">
                  <a href="#" className="text-[9px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-[0.2em]">Docs</a>
                  <a href="#" className="text-[9px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-[0.2em]">Privacy</a>
                  <a href="#" className="text-[9px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-[0.2em]">Help</a>
               </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
