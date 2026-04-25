'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';

type Step = 1 | 2 | 3 | 4 | 5;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });
  const [launching, setLaunching] = useState(false);
  const [launchStatus, setLaunchStatus] = useState('Initiating Protocol...');

  // Form State
  const [company, setCompany] = useState('');
  const [omUrl, setOmUrl] = useState('');
  const [omToken, setOmToken] = useState('');
  const [slackWebhook, setSlackWebhook] = useState('');
  const [omConnected, setOmConnected] = useState(false);
  const [slackTested, setSlackTested] = useState(false);

  // Constants
  const WEBHOOK_URL = typeof window !== 'undefined' ? `${window.location.origin}/api/webhook` : '';

  useEffect(() => {
    // Check if already onboarded
    const onboarded = localStorage.getItem('metapulse_onboarded');
    if (onboarded === 'true') {
      router.push('/dashboard');
    }
  }, [router]);

  const nextStep = () => {
    setStep((s) => (s + 1) as Step);
    setStatus({ type: null, message: '' });
  };
  const prevStep = () => {
    setStep((s) => (s - 1) as Step);
    setStatus({ type: null, message: '' });
  };

  const testOMConnection = async () => {
    setLoading(true);
    setStatus({ type: null, message: '' });
    try {
      const res = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          omUrl: omUrl,
          omToken: omToken,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOmConnected(true);
        setStatus({ type: 'success', message: data.message });
      } else {
        setStatus({ type: 'error', message: data.error || 'Connection failed.' });
      }
    } catch (e) {
      setStatus({ type: 'error', message: 'Network error. Is your server running?' });
    } finally {
      setLoading(false);
    }
  };

  const testSlackWebhook = async () => {
    if (!slackWebhook) return;
    setLoading(true);
    setStatus({ type: null, message: '' });
    try {
      const res = await fetch('/api/test-slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: slackWebhook }),
      });
      const data = await res.json();
      if (res.ok) {
        setSlackTested(true);
        setStatus({ type: 'success', message: 'Test message sent successfully!' });
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to send message.' });
      }
    } catch (e) {
      setStatus({ type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    setLaunching(true);

    localStorage.setItem('metapulse_onboarded', 'true');
    localStorage.setItem('metapulse_company', company);
    localStorage.setItem('metapulse_om_url', omUrl);
    localStorage.setItem('metapulse_om_token', omToken);
    localStorage.setItem('metapulse_slack_webhook', slackWebhook);

    // Cinematic Launch Sequence
    const steps = [
      'Establishing Neural Link...',
      'Syncing Knowledge Graph...',
      'MetaPulse Online.',
    ];

    for (const step of steps) {
      setLaunchStatus(step);
      await new Promise((r) => setTimeout(r, 600));
    }

    router.push('/dashboard');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-white">
      {/* Background Decorative Elements */}
      <div
        className="absolute top-0 left-0 w-full h-1 bg-emerald-500 z-50 transition-all duration-500"
        style={{ width: `${(step / 5) * 100}%` }}
      />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />

      {/* STEP 1: WELCOME */}
      {step === 1 && (
        <div className="w-full min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-1000">
          <div className="w-24 h-24 flex items-center justify-center mx-auto mb-10 bg-white rounded-[2.5rem] shadow-2xl shadow-emerald-500/10 border border-emerald-50 p-6 transition-all hover:scale-110 hover:rotate-2">
            <img
              src="/logos/metapulse-icon.svg"
              alt="MetaPulse"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-6xl font-black mb-4 tracking-tighter text-slate-900 leading-none">
            MetaPulse
          </h1>
          <p className="text-sm font-bold text-slate-400 mb-12">
            Always watching your data. Always ready to help.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 w-full max-w-2xl">
            <div className="bg-white border border-slate-200/60 p-8 rounded-[2.5rem] text-left shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/20 group">
              <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 border border-emerald-100 shadow-sm transition-transform group-hover:rotate-6">
                <Icon icon="solar:eye-scan-bold-duotone" width="22" />
              </div>
              <h3 className="font-black text-slate-900 mb-2 uppercase tracking-tight text-lg">
                Data Watcher
              </h3>
              <p className="text-xs font-bold text-slate-400 leading-relaxed">
                Know exactly when something breaks, and see how it affects your whole company
                instantly.
              </p>
            </div>
            <div className="bg-white border border-slate-200/60 p-8 rounded-[2.5rem] text-left shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/20 group">
              <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-blue-600 border border-blue-100 shadow-sm transition-transform group-hover:-rotate-6 p-2">
                <img
                  src="/logos/claude.png"
                  alt="Claude"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="font-black text-slate-900 mb-2 uppercase tracking-tight text-lg">
                AI Expert
              </h3>
              <p className="text-xs font-bold text-slate-400 leading-relaxed">
                Talk to an assistant that understands your data lineage and helps you find answers
                in seconds.
              </p>
            </div>
          </div>

          <button
            onClick={nextStep}
            className="flex items-center justify-center bg-emerald-500 hover:opacity-90 text-white px-12 py-5 rounded-2xl font-bold text-sm transition-all shadow-2xl shadow-emerald-500/20 active:scale-95"
          >
            Let&apos;s Start
          </button>
        </div>
      )}

      {/* STEP 2: OPENMETADATA */}
      {step === 2 && (
        <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-emerald-500/5 border border-slate-100 p-10 animate-in slide-in-from-bottom-8 duration-500">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center p-2 shadow-sm">
                <img
                  src="/logos/openmetadata.png"
                  alt="OpenMetadata"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                  Connect Data
                </h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">
                  Step 2 of 4 • MetaPulse Bridge
                </p>
              </div>
            </div>
            <div
              className={`text-[10px] font-black px-3 py-1.5 rounded-full border transition-all tracking-widest ${
                omConnected
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}
            >
              {omConnected ? 'SYNCED' : 'PENDING'}
            </div>
          </div>

          <div className="space-y-6 mb-10">
            <div className="space-y-3 group">
              <label className="block text-[10px] font-black text-slate-400 tracking-widest pl-1 group-focus-within:text-emerald-500 transition-colors">
                Company Name
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="MetaPulse Labs"
                className="w-full px-6 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all bg-slate-50 focus:bg-white placeholder:text-slate-200 shadow-inner"
              />
            </div>
            <div className="space-y-3 group">
              <label className="block text-[10px] font-black text-slate-400 tracking-widest pl-1 group-focus-within:text-emerald-500 transition-colors">
                OpenMetadata URL
              </label>
              <input
                type="text"
                value={omUrl}
                onChange={(e) => {
                  setOmUrl(e.target.value);
                  setOmConnected(false);
                }}
                placeholder="http://localhost:8585"
                className="w-full px-6 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all bg-slate-50 focus:bg-white font-mono placeholder:text-slate-200 shadow-inner"
              />
            </div>
            <div className="space-y-3 group">
              <label className="block text-[10px] font-black text-slate-400 tracking-widest pl-1 group-focus-within:text-emerald-500 transition-colors">
                OpenMetadata PAT
              </label>
              <input
                type="password"
                value={omToken}
                onChange={(e) => {
                  setOmToken(e.target.value);
                  setOmConnected(false);
                }}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5c..."
                className="w-full px-6 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all bg-slate-50 focus:bg-white font-mono placeholder:text-slate-200 shadow-inner"
              />
            </div>

            {status.message && (
              <div
                className={`p-4 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${status.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white shadow-lg shadow-red-500/10'}`}
                >
                  <Icon
                    icon={
                      status.type === 'success'
                        ? 'solar:check-circle-bold-duotone'
                        : 'solar:danger-triangle-bold-duotone'
                    }
                    width="18"
                  />
                </div>
                <div className="flex flex-col">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-0.5">
                    {status.type === 'success' ? 'Success' : 'Connection Error'}
                  </p>
                  <p className="text-[11px] font-bold leading-tight opacity-90">
                    {status.message === 'Invalid token. Check your Personal Access Token'
                      ? 'Invalid PAT. Double check your OpenMetadata Personal Access Token.'
                      : status.message}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={testOMConnection}
              disabled={loading || !omUrl || !omToken}
              className="w-full py-3 px-6 rounded-2xl text-xs font-bold flex items-center justify-center gap-3 transition-all bg-white text-slate-900 border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 disabled:opacity-50 active:scale-95 shadow-sm"
            >
              {loading && (
                <Icon icon="solar:refresh-bold-duotone" width="16" className="animate-spin" />
              )}
              {omConnected ? 'Re-verify Stream' : 'Verify Connection'}
            </button>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-slate-100">
            <button
              onClick={prevStep}
              className="text-xs font-bold text-slate-300 flex items-center gap-2 hover:text-slate-900 transition-all group"
            >
              Previous
            </button>
            <button
              onClick={nextStep}
              disabled={!omConnected || !company}
              className="bg-emerald-500 text-white px-8 py-4 rounded-2xl text-xs font-bold flex items-center gap-3 hover:opacity-90 transition-all disabled:opacity-20 active:scale-95 shadow-xl shadow-emerald-500/20"
            >
              Secure & Continue
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SLACK */}
      {step === 3 && (
        <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-emerald-500/5 border border-slate-100 p-10 animate-in slide-in-from-bottom-8 duration-500">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center p-2 shadow-sm text-[#E01E5A]">
                <Icon icon="logos:slack-icon" width="24" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                  Connect Slack
                </h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">
                  Step 3 of 4 • MetaPulse Bridge
                </p>
              </div>
            </div>
            <div className="text-[9px] font-black px-2.5 py-1 rounded-full bg-slate-50 text-slate-400 border border-slate-200 tracking-widest">
              OPTIONAL
            </div>
          </div>

          <div className="space-y-6 mb-10">
            <div className="space-y-3 group">
              <label className="block text-[10px] font-black text-slate-400 tracking-widest pl-1 group-focus-within:text-emerald-500 transition-colors">
                Webhook URL
              </label>
              <input
                type="text"
                value={slackWebhook}
                onChange={(e) => setSlackWebhook(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="w-full px-6 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all bg-slate-50 focus:bg-white font-mono placeholder:text-slate-200 shadow-inner"
              />
            </div>

            <button
              onClick={testSlackWebhook}
              disabled={loading || !slackWebhook}
              className="w-full py-3 px-6 rounded-2xl text-xs font-bold flex items-center justify-center gap-3 transition-all bg-white text-slate-900 border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 disabled:opacity-50 active:scale-95 shadow-sm"
            >
              {loading && (
                <Icon icon="solar:refresh-bold-duotone" width="16" className="animate-spin" />
              )}
              {slackTested ? 'Resend Test Message' : 'Send Test Message'}
            </button>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-slate-100">
            <button
              onClick={prevStep}
              className="text-xs font-bold text-slate-300 flex items-center gap-2 hover:text-slate-900 transition-all group"
            >
              Previous
            </button>
            <div className="flex items-center gap-4">
              {!slackWebhook && (
                <button
                  onClick={nextStep}
                  className="text-xs font-bold text-slate-300 underline underline-offset-8 decoration-emerald-500/0 hover:decoration-emerald-500/100 hover:text-slate-900 transition-all"
                >
                  Skip for now
                </button>
              )}
              <button
                onClick={nextStep}
                className="bg-emerald-500 text-white px-8 py-4 rounded-2xl text-xs font-bold flex items-center gap-3 hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-emerald-500/20"
              >
                Secure & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: WEBHOOK CONFIG */}
      {step === 4 && (
        <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-emerald-500/5 border border-slate-100 p-10 animate-in slide-in-from-bottom-8 duration-500">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center p-2 shadow-sm text-amber-500">
                <Icon icon="solar:link-circle-bold-duotone" width="24" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                  The Bridge
                </h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">
                  Step 4 of 4 • Final Handshake
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs font-bold text-slate-400 leading-relaxed mb-8">
            Paste this URL into your OpenMetadata Settings to let MetaPulse detect incidents
            automatically.
          </p>

          <div className="bg-slate-900 rounded-[2rem] p-6 mb-10 flex items-center justify-between group overflow-hidden relative border border-white/5 shadow-2xl shadow-slate-900/40">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <code className="text-emerald-400 text-xs font-mono truncate tracking-tight">
              {WEBHOOK_URL}
            </code>
            <button
              onClick={() => copyToClipboard(WEBHOOK_URL)}
              className="bg-white/10 hover:bg-emerald-500 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 shrink-0 ml-4 group/copy"
            >
              <Icon
                icon="solar:copy-bold-duotone"
                width="18"
                className="group-hover/copy:scale-110 transition-transform"
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-slate-100">
            <button
              onClick={prevStep}
              className="text-xs font-bold text-slate-300 flex items-center gap-2 hover:text-slate-900 transition-all group"
            >
              Previous
            </button>
            <button
              onClick={completeOnboarding}
              disabled={launching}
              className="bg-emerald-500 text-white min-w-[200px] h-[52px] rounded-2xl text-xs font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-emerald-500/20 disabled:scale-95 disabled:opacity-80"
            >
              {launching ? (
                <>
                  <Icon icon="solar:widget-3-bold-duotone" width="18" className="animate-spin" />
                  {launchStatus}
                </>
              ) : (
                'Launch MetaPulse'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
