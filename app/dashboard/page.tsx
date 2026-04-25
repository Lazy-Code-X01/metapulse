'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import type { IncidentReport, OpenMetadataAsset } from '@/types';

export default function DashboardHome() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState('MetaPulse');
  const [assets, setAssets] = useState<OpenMetadataAsset[]>([]);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [greeting, setGreeting] = useState('Good morning');

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 17) setGreeting('Good afternoon');
    else if (hour >= 17) setGreeting('Good evening');

    const storedCompany = localStorage.getItem('metapulse_company');
    if (storedCompany) setCompanyName(storedCompany);

    // Track scroll for header animation
    const mainElement = document.querySelector('main');
    const handleScroll = () => {
      if (mainElement) {
        setIsScrolled(mainElement.scrollTop > 10);
      }
    };

    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll);
    }

    const fetchData = async () => {
      try {
        const omUrl = localStorage.getItem('metapulse_om_url') || '';
        const omToken = localStorage.getItem('metapulse_om_token') || '';

        // Fetch Assets
        const assetRes = await fetch('/api/assets', {
          headers: {
            'x-om-url': omUrl,
            'x-om-token': omToken,
          },
        });
        const assetData = await assetRes.json();
        if (assetData.tables) setAssets(assetData.tables);

        // Load Incidents
        const storedIncidents = localStorage.getItem('metapulse_incidents');
        if (storedIncidents) {
          setIncidents(JSON.parse(storedIncidents));
        }
      } catch (e) {
        console.error('Failed to fetch dashboard data', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (mainElement) {
        mainElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const stats = useMemo(() => {
    const totalTables = assets.length;
    const uniqueOwners = new Set(
      assets
        .map((a) => {
          const mainOwner = a.owner || a.owners?.[0];
          return mainOwner?.name || mainOwner?.displayName;
        })
        .filter(Boolean)
    ).size;
    const activeIncidents = incidents.filter((i) =>
      ['open', 'investigating'].includes(i.status.toLowerCase())
    ).length;

    const withDescriptions = assets.filter(
      (a) => a.description && a.description.trim() !== ''
    ).length;
    const healthScore = totalTables > 0 ? Math.round((withDescriptions / totalTables) * 100) : 0;

    return {
      totalTables,
      uniqueOwners,
      activeIncidents,
      healthScore,
    };
  }, [assets, incidents]);

  const chartData = useMemo(() => {
    if (stats.totalTables === 0) return [];

    return [{ name: 'Today', score: stats.healthScore }];
  }, [stats.totalTables, stats.healthScore]);

  if (!mounted) return null;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* SECTION 1: HEADER (Sticky) */}
      <div
        className={`sticky top-0 z-30 -mt-10 transition-all duration-300 -mx-6 md:-mx-10 px-6 md:px-10 ${
          isScrolled
            ? 'bg-slate-50/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm pt-4 pb-3'
            : 'bg-transparent pt-8 pb-4'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div
            className={`space-y-1 transition-all duration-300 ${isScrolled ? 'scale-90 origin-left' : 'scale-100'}`}
          >
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
              {greeting},{' '}
              <span className="text-emerald-600 uppercase text-2xl tracking-tighter">
                {companyName}
              </span>
            </h1>
            <p className="text-slate-400 font-medium text-sm">Everything looks good today.</p>
          </div>

          <div
            className={`flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-slate-200/60 shadow-sm self-start md:self-center transition-all duration-500 ${
              isScrolled ? 'scale-90 shadow-md border-emerald-100 translate-x-2' : 'scale-100'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-slate-200">
              {companyName.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-900 leading-none tracking-tight">
                {companyName}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Admin
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Total data tables',
            value: stats.totalTables,
            icon: 'lucide:database',
            color: 'text-blue-600',
            desc: stats.totalTables > 0 ? 'All the data we track' : 'No tables found in catalog',
          },
          {
            label: 'People in charge',
            value: stats.uniqueOwners,
            icon: 'lucide:users',
            color: 'text-purple-600',
            desc: stats.uniqueOwners > 0 ? 'Verified team members' : 'No owners assigned yet',
          },
          {
            label: 'Things to fix',
            value: stats.activeIncidents,
            icon: 'lucide:flame',
            color: 'text-red-600',
            desc: stats.activeIncidents > 0 ? 'Active data problems' : 'No issues detected',
          },
          {
            label: 'Quality score',
            value: `${stats.healthScore}%`,
            icon: 'lucide:shield-check',
            color: 'text-emerald-600',
            desc: stats.totalTables > 0 ? 'How healthy your data is' : 'Add descriptions to track health',
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="relative overflow-hidden bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col transition-all hover:shadow-md hover:border-slate-300 group"
          >
            {/* Background Icon Blur Effect */}
            <div className="absolute -top-4 -right-4 transition-transform group-hover:scale-125 duration-500">
              <Icon
                icon={kpi.icon}
                className={`w-28 h-28 ${kpi.color} opacity-[0.03] blur-[1px]`}
              />
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">
                {kpi.label}
              </p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter mb-1">
                {kpi.value}
              </p>
              <p className="text-[10px] text-slate-400 font-medium mt-auto pt-4">{kpi.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 3: TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* LEFT COLUMN: Health Chart (60%) */}
        <div className="lg:col-span-6 bg-white border border-slate-200/60 rounded-3xl p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Data health history
              </h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                The last 7 days
              </p>
            </div>
          </div>

          <div className="h-[320px] w-full flex flex-col">
            {chartData.length > 0 ? (
              <>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                        dy={15}
                      />
                      <YAxis
                        domain={[0, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                        dx={-10}
                      />
                      <Tooltip
                        cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                        contentStyle={{
                          borderRadius: '20px',
                          border: '1px solid #f1f5f9',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)',
                          padding: '16px',
                          backgroundColor: '#ffffff',
                        }}
                        itemStyle={{ fontWeight: '900', color: '#064e3b', fontSize: '14px' }}
                        labelStyle={{
                          fontWeight: 'bold',
                          color: '#94a3b8',
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                          fontSize: '10px',
                          letterSpacing: '0.1em',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#10b981"
                        strokeWidth={4}
                        dot={{ r: 6, fill: '#10b981', strokeWidth: 3, stroke: '#fff' }}
                        activeDot={{ r: 8, strokeWidth: 0 }}
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                    Historical tracking starts today
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-6 border border-slate-100">
                  <Icon icon="lucide:line-chart" width="32" />
                </div>
                <h4 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-tight">
                  Your catalog is empty
                </h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-[280px]">
                  Start by adding data assets to your OpenMetadata instance. Once you have tables,
                  pipelines or dashboards, MetaPulse will automatically track their health here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Your Catalog (40%) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/60 rounded-3xl p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">
              Your data
            </h3>
            <span className="bg-slate-900 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest">
              {assets.length} Active
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {assets.slice(0, 6).map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between group p-3 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-2xl transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-emerald-600 transition-all border border-slate-100/50 group-hover:shadow-sm">
                    <Icon icon="lucide:table" width="22" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 group-hover:text-slate-900 transition-colors uppercase tracking-tight">
                      {asset.name}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      Owned by{' '}
                      {(() => {
                        const o = asset.owner || asset.owners?.[0];
                        return o?.name || o?.displayName || 'Unknown';
                      })()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Icon
                    icon="lucide:chevron-right"
                    width="14"
                    className="text-slate-200 group-hover:text-slate-400 transition-colors"
                  />
                </div>
              </div>
            ))}

            {assets.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-20 opacity-20">
                <Icon icon="lucide:search" width="48" className="mb-4" />
                <p className="text-xs font-black uppercase tracking-widest text-center px-8">
                  No assets found in your catalog yet. Add tables or pipelines to OpenMetadata to
                  see them here.
                </p>
              </div>
            )}
          </div>

          <a
            href={localStorage.getItem('metapulse_om_url') || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
          >
            See all data
            <Icon icon="lucide:external-link" width="14" />
          </a>
        </div>
      </div>

      {/* SECTION 4: RECENT ACTIVITY */}
      <div className="bg-white border border-slate-200/60 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-red-50 text-red-500 p-3 rounded-2xl border border-red-100 shadow-sm shadow-red-500/5 transition-transform hover:rotate-12">
              <Icon icon="lucide:flame" width="22" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                What happened lately
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                Latest activity
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard/incidents')}
            className="px-6 py-2.5 rounded-xl bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200 group flex items-center gap-2"
          >
            View all{' '}
            <Icon
              icon="lucide:arrow-right"
              width="14"
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>

        <div className="space-y-3">
          {incidents.slice(0, 3).map((incident) => (
            <div
              key={incident.id}
              className="flex items-center gap-6 p-4 rounded-2xl border border-slate-100 hover:border-emerald-100 hover:shadow-sm transition-all group cursor-pointer"
              onClick={() => router.push('/dashboard/incidents')}
            >
              <div className="flex-shrink-0">
                <div
                  className={`w-3 h-3 rounded-full shadow-sm ${
                    incident.status.toLowerCase() === 'open'
                      ? 'bg-red-500 shadow-red-500/20'
                      : incident.status.toLowerCase() === 'investigating'
                        ? 'bg-amber-400 shadow-amber-400/20'
                        : 'bg-emerald-500 shadow-emerald-500/20'
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm font-bold text-slate-800 uppercase tracking-wide truncate">
                    {incident.assetName}
                  </span>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    #{incident.id.substring(0, 8)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate italic">
                  &quot;{incident.failureReason}&quot;
                </p>
              </div>

              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Status
                </p>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-widest ${
                    incident.status.toLowerCase() === 'open'
                      ? 'bg-red-50 text-red-700 border-red-100'
                      : incident.status.toLowerCase() === 'investigating'
                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}
                >
                  {incident.status}
                </span>
              </div>

              <div className="text-right font-mono text-[10px] font-bold text-slate-400 hidden lg:block">
                {new Date(incident.timestamp || Date.now()).toLocaleTimeString()}
              </div>
            </div>
          ))}

          {incidents.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center opacity-40 grayscale italic">
              <p className="text-sm font-medium text-slate-400 tracking-tight">
                Everything is healthy right now.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
