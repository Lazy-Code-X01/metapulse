'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Icon } from '@iconify/react';
import type { IncidentReport, IncidentStatus } from '@/types';

type IncidentPhase = 'idle' | 'processing' | 'done';

interface StepState {
  status: 'waiting' | 'active' | 'done';
}

const STEPS = [
  { title: 'Pipeline failure detected', sub: 'orders table stopped updating at 2:00 AM' },
  { title: 'Tracing lineage graph', sub: 'Mapping downstream dependencies...' },
  { title: 'Identifying affected owners', sub: 'Querying teams and users...' },
  { title: 'Generating AI report', sub: 'MetaPulse Intelligence is writing the incident brief...' },
];

function IncidentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const simulateParam = searchParams.get('simulate');
  const hasTriggeredSimulation = useRef(false);


  const [incidentPhase, setIncidentPhase] = useState<IncidentPhase>('idle');
  const [steps, setSteps] = useState<StepState[]>(STEPS.map(() => ({ status: 'waiting' })));
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [incidentError, setIncidentError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number>(0);


  useEffect(() => {
    try {
      const stored = localStorage.getItem('metapulse_incidents');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setIncidents(parsed);
          setIncidentPhase('done');
        }
      }
    } catch (e) {
      console.error('Failed to parse incidents from localStorage', e);
    }
  }, []);


  useEffect(() => {
    if (incidents.length > 0) {
      localStorage.setItem('metapulse_incidents', JSON.stringify(incidents));
    }
  }, [incidents]);


  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch('/api/incidents');
        const data = await res.json();
        if (data.incidents?.length > 0) {
          setIncidents((prev) => {
            const existing = new Set(prev.map((i) => i.id));
            const newOnes = data.incidents.filter((i: IncidentReport) => !existing.has(i.id));
            if (newOnes.length > 0) {
              const merged = [...newOnes, ...prev];
              localStorage.setItem('metapulse_incidents', JSON.stringify(merged));
              return merged;
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('[Intelligence] Failed to generate incident report:', error);
        throw new Error(`Intelligence Engine error: ${String(error)}`);
      }
    };

    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateIncidentStatus = useCallback((id: string, newStatus: IncidentStatus) => {
    setIncidents((prev) =>
      prev.map((incident) => (incident.id === id ? { ...incident, status: newStatus } : incident))
    );
  }, []);


  const simulateIncident = useCallback(async () => {
    setIncidentPhase('processing');
    setIncidentError(null);
    setSteps(STEPS.map(() => ({ status: 'waiting' })));

    const startTime = Date.now();

    for (let i = 0; i < STEPS.length; i++) {
      await new Promise((r) => setTimeout(r, 900));
      setSteps((prev) =>
        prev.map((s, idx) => {
          if (idx === i) return { status: 'active' };
          if (idx < i) return { status: 'done' };
          return s;
        })
      );
    }

    try {
      const res = await fetch('/api/incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: '169c15c7-c42b-4c6e-8405-e418eba3f54c',
          assetName: 'orders',
          assetType: 'table',
          failureReason:
            'Pipeline failed — orders table stopped updating at 2am. Downstream dashboards showing stale data.',
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error || `HTTP ${res.status}`);
      }

      const report: IncidentReport = await res.json();
      setElapsedMs(Date.now() - startTime);

      setSteps(STEPS.map(() => ({ status: 'done' })));
      await new Promise((r) => setTimeout(r, 600));

      setIncidents((prev) => {
        return [report, ...prev];
      });
      setIncidentPhase('done');
    } catch (err) {
      setIncidentError(err instanceof Error ? err.message : String(err));
      setIncidentPhase('idle');
    }
  }, []);


  useEffect(() => {
    if (simulateParam === 'true' && !hasTriggeredSimulation.current) {
      hasTriggeredSimulation.current = true;
      simulateIncident();
    }
  }, [simulateParam, simulateIncident]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
            Things that broke
          </h1>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Active system check
            </span>
          </div>
        </div>
        <div>
          <button
            disabled={incidentPhase === 'processing'}
            onClick={simulateIncident}
            className="px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center bg-emerald-500"
          >
            {incidentPhase === 'processing' ? 'Thinking...' : 'Break something (Test)'}
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: 'Waiting to be fixed',
            value: incidents.filter((i) => i.status?.toLowerCase() === 'open').length,
            icon: 'solar:shield-warning-bold-duotone',
            color: 'text-slate-100',
            iconColor: 'text-red-600',
            bg: 'bg-red-50',
            border: 'border-red-100',
          },
          {
            label: 'Checking on it',
            value: incidents.filter((i) => i.status?.toLowerCase() === 'investigating').length,
            icon: 'solar:map-arrow-square-bold-duotone',
            color: 'text-slate-100',
            iconColor: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-100',
          },
          {
            label: 'Fixed lately',
            value: incidents.filter((i) => i.status?.toLowerCase() === 'resolved').length,
            icon: 'solar:shield-check-bold-duotone',
            color: 'text-slate-100',
            iconColor: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
          },
        ].map((m) => (
          <div
            key={m.label}
            className="relative overflow-hidden bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col transition-all hover:shadow-md group"
          >
            {/* Background Icon Blur Effect */}
            <div className="absolute -top-4 -right-4 transition-transform group-hover:scale-125 duration-500">
              <Icon
                icon={m.icon}
                className={`w-28 h-28 ${m.iconColor} opacity-[0.03] blur-[1px]`}
              />
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                  {m.label}
                </p>
                <div
                  className={`w-2 h-2 rounded-full ${m.iconColor.replace('text-', 'bg-')} animate-pulse`}
                ></div>
              </div>
              <p className={`text-4xl font-black text-slate-900 tracking-tighter`}>{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Error Banner */}
      {incidentError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm shadow-sm flex items-start gap-3 animate-in slide-in-from-top-2">
          <Icon icon="lucide:alert-circle" width="20" className="text-red-500 mt-0.5" />
          <div>
            <strong className="block font-semibold mb-1">Could not break it</strong>
            {incidentError}
          </div>
        </div>
      )}

      {/* Empty State */}
      {incidentPhase === 'idle' && incidents.length === 0 && (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-16 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-50 flex items-center justify-center mb-8 text-emerald-500 shadow-sm border border-emerald-100/50">
            <Icon icon="solar:database-bold-duotone" width="48" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Everything is working!</h3>
          <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed">
            There are no problems with your data right now. Click &quot;Break something&quot; to see
            how I help you fix it.
          </p>
        </div>
      )}

      {/* Processing Steps */}
      {incidentPhase === 'processing' && (
        <div className="bg-white border border-slate-200/60 rounded-3xl p-10 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 text-center">
            Timeline of what happened
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((stepState, i) => (
              <div
                key={STEPS[i].title}
                className={`flex flex-col items-center text-center gap-4 ${stepState.status !== 'waiting' ? 'opacity-100' : 'opacity-20'} transition-all duration-700`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all ${
                    stepState.status === 'done'
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : stepState.status === 'active'
                        ? 'bg-slate-900 text-white animate-pulse shadow-lg shadow-slate-200'
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {stepState.status === 'done' ? <Icon icon="lucide:check" width="24" /> : i + 1}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1">
                    {STEPS[i].title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Incident Feed */}
      <div className="space-y-12">
        {incidents.map((report) => (
          <div
            key={report.id}
            className="bg-white border border-slate-200/60 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col lg:flex-row transition-all hover:shadow-2xl hover:border-slate-300 group"
          >
            {/* Left Half: Core Info */}
            <div className="p-10 lg:p-12 flex-1 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col relative">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                      report.status.toLowerCase() === 'open'
                        ? 'bg-red-50 text-red-700 border border-red-100'
                        : report.status.toLowerCase() === 'investigating'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}
                  >
                    {report.status.toLowerCase() !== 'resolved' && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                          report.status.toLowerCase() === 'open' ? 'bg-red-500' : 'bg-amber-500'
                        }`}
                      ></span>
                    )}
                    {report.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest whitespace-nowrap">
                    {new Date(report.timestamp || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  #{report.id.substring(0, 8)}
                </span>
              </div>

              <div className="mb-10">
                <h3 className="text-3xl font-black text-slate-900 mb-2 flex items-baseline gap-3 tracking-tighter">
                  {report.assetName}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Icon icon="lucide:database" className="w-3 h-3 text-emerald-500" />
                  {report.assetType} • MAIN DATA
                </p>
              </div>

              <div className="mb-12">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Icon icon="lucide:alert-triangle" className="w-3 h-3 text-red-500" />
                  What happened
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed border-l-4 border-slate-900 pl-6 py-2 italic font-medium bg-slate-50 rounded-r-2xl">
                  &quot;{report.failureReason}&quot;
                </p>
              </div>

              <div className="mb-12 flex-1">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6 whitespace-nowrap overflow-hidden flex items-center gap-2 after:content-[''] after:h-px after:bg-slate-100 after:flex-1">
                  Who else is affected
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {report.affectedAssets && report.affectedAssets.length > 0 ? (
                    report.affectedAssets.map((a) => (
                      <div
                        key={a.id}
                        className="p-4 rounded-2xl text-[10px] font-black bg-white text-slate-600 border border-slate-200 shadow-sm hover:border-emerald-500 hover:text-emerald-700 transition-all uppercase tracking-widest group/asset flex items-center justify-between"
                      >
                        <span>{a.name}</span>
                        <span className="opacity-40 font-bold">@{a.owner || 'Unknown'}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400 italic font-black uppercase tracking-widest">
                      No one else
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-8 border-t border-slate-100">
                <button
                  onClick={() => updateIncidentStatus(report.id, 'investigating')}
                  className="px-6 py-4 flex-1 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-all active:scale-95"
                >
                  Start fixing
                </button>
                <button
                  onClick={() => updateIncidentStatus(report.id, 'resolved')}
                  className="px-6 py-4 flex-1 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                >
                  I&apos;ve fixed it!
                </button>
              </div>
            </div>

            {/* Right Half: AI Report */}
            <div className="p-10 lg:p-12 flex-1 bg-slate-50/50 flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <div>
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                    MetaPulse Intelligence Insight
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-0.5">
                    AI Root Cause Analysis
                  </p>
                </div>
              </div>

              <div className="flex-1 bg-white border border-slate-200/60 rounded-3xl p-8 shadow-sm overflow-y-auto max-h-[400px] lg:max-h-[500px] chat-scroll prose prose-slate prose-sm max-w-none prose-p:leading-loose prose-strong:text-emerald-700 prose-headings:text-slate-900 prose-headings:font-black prose-headings:tracking-tight font-medium">
                <ReactMarkdown>{report.report}</ReactMarkdown>
              </div>

              <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border-4 border-white shadow-xl flex items-center justify-center text-white font-black text-xs">
                    {report.owners && report.owners.length > 0
                      ? report.owners[0].name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                      : 'MP'}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">
                      {report.owners && report.owners.length > 0
                        ? report.owners[0].name
                        : 'The Team'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      {report.owners && report.owners.length > 0
                        ? report.owners[0].team
                        : 'Data Tech'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">
                    Speed
                  </p>
                  <p className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md mt-1 border border-emerald-100">
                    {report.id === incidents[0]?.id ? (elapsedMs / 1000).toFixed(1) : '2.1'}s
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function IncidentsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center text-emerald-800 font-medium">
          Wait a second...
        </div>
      }
    >
      <IncidentsContent />
    </Suspense>
  );
}
