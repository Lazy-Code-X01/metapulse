'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isInitializing, setIsInitializing] = useState(true);
  const [companyName, setCompanyName] = useState('MetaPulse');
  const [omConnectionInfo, setOmConnectionInfo] = useState({ url: '', status: 'connected' });

  useEffect(() => {
    const onboarded = localStorage.getItem('metapulse_onboarded');
    
    if (onboarded !== 'true') {
      router.push('/onboarding');
    } else {
      // Only set to false if we are definitely stay here
      setIsInitializing(false);
      
      const storedCompany = localStorage.getItem('metapulse_company');
      if (storedCompany) setCompanyName(storedCompany);

      const storedOmUrl = localStorage.getItem('metapulse_om_url');
      if (storedOmUrl) {
        setOmConnectionInfo(prev => ({ ...prev, url: storedOmUrl }));
      }
    }
  }, [router]);

  // Prevent flash during initialization or redirect
  if (isInitializing) return null;

  const navItems = [
    { name: 'Dashboard', icon: 'lucide:home', href: '/dashboard' },
    { name: 'Incidents', icon: 'lucide:bell', href: '/dashboard/incidents' },
    { name: 'Copilot', icon: 'lucide:user', href: '/dashboard/copilot' },
    { name: 'Settings', icon: 'lucide:settings', href: '/dashboard/settings' },
  ];

  return (
    <div className="flex w-full h-screen overflow-hidden bg-gray-50 font-sans">

      <aside className="w-[260px] flex-shrink-0 flex flex-col justify-between bg-white border-r border-slate-200/80">
        <div>
          {/* Logo & Branding */}
          <div className="px-6 py-8 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <img src="/logos/metapulse-icon.svg" alt="MetaPulse Logo" className="w-6 h-6" />
              </div>
              <span className="text-slate-900 font-extrabold text-xl tracking-tight">MetaPulse</span>
            </div>
            
            {/* Company Workspace Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100/50">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider truncate max-w-[140px]">
                {companyName}
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-200 border ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm shadow-emerald-500/5'
                      : 'text-slate-400 border-transparent hover:text-emerald-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon 
                    icon={item.icon} 
                    className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-500'}`} 
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 space-y-8 border-t border-slate-100">
          {/* Connection Status Card */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-5 transition-all hover:border-emerald-200 group">
             <div className="flex items-center gap-3 mb-3">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
                <span className="text-slate-900 font-bold text-[10px] uppercase tracking-widest">OpenMetadata Status</span>
             </div>
             <div className="flex flex-col gap-1">
               <p className="text-emerald-600 text-xs font-bold leading-none">Connection Live</p>
               <p className="text-slate-400 text-[10px] font-medium truncate group-hover:text-slate-600 transition-colors" title={omConnectionInfo.url}>
                 {omConnectionInfo.url ? new URL(omConnectionInfo.url).hostname : 'Disconnected'}
               </p>
             </div>
          </div>

          <Link href="/" className="flex items-center justify-center gap-2 text-slate-400 hover:text-emerald-600 text-[10px] font-bold uppercase tracking-widest transition-all group py-2">
            <Icon icon="lucide:arrow-left" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Site
          </Link>
        </div>
      </aside>


      <main className="flex-1 overflow-y-auto bg-slate-50 relative">
        {children}
      </main>
    </div>
  );
}
