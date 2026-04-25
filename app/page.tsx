'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';

// Shared UI Components

const CapsuleNav = ({ activeSection }: { activeSection: string | null }) => (
  <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between w-[calc(100%-3rem)] max-w-3xl px-6 py-3 bg-white/80 backdrop-blur-md border border-gray-100 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5">
    <a href="/" className="flex items-center gap-1 shrink-0">
      <img src="/logos/metapulse-icon.svg" alt="MetaPulse" className="w-10 h-10" />
      <span className="font-bold text-gray-900 tracking-tight text-xl">MetaPulse</span>
    </a>

    <div className="hidden md:flex items-center gap-6 px-6">
      <a
        href="#features"
        className={`relative text-sm font-medium transition-all duration-300 ${
          activeSection === 'features'
            ? 'text-emerald-600 font-bold'
            : 'text-gray-400 hover:text-emerald-600'
        }`}
      >
        Features
        <span
          className={`absolute -bottom-1 left-0 h-0.5 bg-emerald-500 transition-all duration-500 rounded-full ${
            activeSection === 'features' ? 'w-full' : 'w-0'
          }`}
        />
      </a>
    </div>

    <div className="flex items-center gap-4 shrink-0">
      <a
        href="/dashboard"
        className="px-5 py-2 bg-black text-white text-xs font-bold rounded-full hover:bg-gray-800 transition-all active:scale-95 shadow-sm"
      >
        Open Dashboard
      </a>
    </div>
  </nav>
);

const FeatureCard = ({
  icon,
  label,
  title,
  desc,
  color,
}: {
  icon: string;
  label: string;
  title: string;
  desc: string;
  color: string;
}) => (
  <div className="group relative p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-2">
    <div
      className={`w-14 h-14 mb-6 rounded-2xl ${color} flex items-center justify-center shadow-inner overflow-hidden`}
    >
      <Icon icon={icon} className="w-8 h-8" />
    </div>
    <span className="inline-block px-3 py-1 mb-4 text-[10px] font-bold tracking-widest text-emerald-600 uppercase bg-emerald-50 rounded-full">
      {label}
    </span>
    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
      {title}
    </h3>
    <p className="text-gray-500 leading-relaxed text-sm">{desc}</p>
  </div>
);

// Hero Section
export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
            setActiveSection(entry.target.id);
          } else if (entry.target.id === activeSection) {
            setActiveSection(null);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '-20% 0px -20% 0px',
      }
    );

    const featuresSection = document.getElementById('features');
    if (featuresSection) observer.observe(featuresSection);

    return () => observer.disconnect();
  }, [activeSection]);

  const handleSimulate = async () => {
    setIsSimulating(true);
    setTimeout(() => {
      window.location.href = '/dashboard/incidents?simulate=true';
    }, 800);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      <CapsuleNav activeSection={activeSection} />


      <section className="relative pt-32 pb-16 px-6">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-50/50 rounded-full blur-[120px] -z-10" />

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white rounded-full shadow-sm ring-1 ring-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="text-xs font-bold tracking-tight text-gray-600 uppercase">
              Built for OpenMetadata
            </span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black text-gray-900 tracking-tighter leading-[0.9] mb-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-both">
            The Pulse of Your <br className="hidden md:block" />
            <span className="text-emerald-500 italic">Data System.</span>
          </h1>

          <p className="max-w-xl text-lg md:text-xl text-gray-500 font-medium leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-both">
            AI-driven automated incident detection and guided onboarding. Know when your pipeline
            breaks before your stakeholders do.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300 fill-mode-both">
            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="group relative px-8 py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-[0_20px_40px_rgba(16,185,129,0.2)] hover:shadow-[0_25px_50px_rgba(16,185,129,0.35)] hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-70 text-sm"
            >
              {isSimulating ? 'Redirecting...' : 'Simulate Incident ->'}
            </button>
            <a
              href="https://metapulsedemo.slack.com/archives/C0ARC6C46V9"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-[#4A154B] text-white font-bold rounded-2xl shadow-sm hover:opacity-90 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-2 text-sm"
            >
              <Icon icon="logos:slack-icon" className="w-4 h-4" />
              Join Demo Slack
            </a>
          </div>

          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-10 animate-in fade-in duration-1000 delay-500">
            Hackathon Judge’s Portal & Demo
          </p>


          <div className="relative w-full max-w-2xl h-[420px] mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 fill-mode-both">
            {/* Card 1: Onboarding (Left Stack) */}
            <div className="absolute top-4 left-1/2 -translate-x-[105%] -rotate-12 w-72 p-6 bg-white rounded-3xl shadow-2xl border border-gray-50 hover:-rotate-3 hover:-translate-y-4 transition-all duration-500 cursor-default group z-10 hover:z-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Icon
                    icon="solar:user-hand-up-bold-duotone"
                    className="w-6 h-6 text-orange-500"
                  />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">
                    New User
                  </p>
                  <p className="font-bold text-gray-900">Zen Master</p>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl mb-3 text-left">
                <p className="text-[11px] text-gray-500 leading-tight">
                  "Where is the revenue data? Who owns the orders table?"
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Icon icon="solar:check-read-bold" className="w-2.5 h-2.5 text-white" />
                </div>
                AI Onboarded
              </div>
            </div>

            {/* Card 2: Incident (Center Stack) */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 rotate-0 w-80 p-8 bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.1)] border border-gray-100 scale-110 z-20 hover:z-50 hover:scale-[1.15] transition-all duration-500 cursor-default">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
                    <Icon icon="solar:danger-bold-duotone" className="w-7 h-7 text-red-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest">
                      Incident Rooted
                    </p>
                    <p className="font-bold text-gray-900 text-lg">Orders Pipeline</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Duration</span>
                  <span className="font-bold">4.2 Minutes</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Owner</span>
                  <span className="font-bold text-emerald-600">@admin</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="w-[85%] h-full bg-red-500 rounded-full" />
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[11px] font-bold text-emerald-800 text-left">
                  Claude: "Downstream revenue tracking affected."
                </p>
              </div>
            </div>

            {/* Card 3: Lineage (Right Stack) */}
            <div className="absolute top-16 left-1/2 translate-x-[5%] rotate-12 w-72 p-6 bg-white rounded-3xl shadow-2xl border border-gray-50 hover:rotate-6 hover:-translate-y-4 transition-all duration-500 cursor-default z-10 hover:z-50">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Icon icon="solar:graph-bold-duotone" className="w-6 h-6 text-blue-500" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                    Lineage Scan
                  </p>
                  <p className="font-bold text-gray-900">Blast Radius</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full ${i < 3 ? 'bg-blue-400' : 'bg-gray-100'}`}
                  />
                ))}
              </div>
              <p className="text-[11px] text-gray-500 text-left leading-tight">
                3 downstream tables identified. Alerting Finance Team now.
              </p>
            </div>
          </div>
        </div>
      </section>


      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 text-left">
            {/* Card 1: Catalog */}
            <div className="md:col-span-3 group relative p-8 bg-[#fafafa] border border-gray-100 rounded-[2rem] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all duration-500">
              <div className="w-12 h-12 mb-6 bg-white rounded-xl shadow-sm flex items-center justify-center p-1.5 overflow-hidden">
                <img
                  src="/logos/openmetadata.png"
                  alt="OpenMetadata"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-3">
                Webhook Native
              </p>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Live Catalog</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                MetaPulse wakes up the second a failure is detected in your OpenMetadata catalog.
              </p>
            </div>

            {/* Card 2: AI (The Star) */}
            <div className="md:col-span-3 group relative p-8 bg-black text-white rounded-[2.5rem] overflow-hidden hover:shadow-[0_30px_60px_rgba(16,185,129,0.15)] transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="w-12 h-12 mb-6 bg-white/10 rounded-xl flex items-center justify-center p-2 backdrop-blur-sm overflow-hidden">
                <img
                  src="/logos/claude.png"
                  alt="Claude AI"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3">
                Intelligence
              </p>
              <h3 className="text-lg font-bold mb-2">Claude AI Analysis</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Deep analysis of the blast radius, root cause identification, and downstream impact
                reports.
              </p>
            </div>

            {/* Card 3: Slack (Horizontal Highlight) */}
            <div className="md:col-span-4 group relative p-8 bg-white border border-gray-100 rounded-[2rem] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all duration-500 flex flex-col md:flex-row md:items-center gap-8">
              <div className="sm:shrink-0 w-16 h-16 bg-[#f8f8f8] rounded-2xl flex items-center justify-center p-4">
                <Icon icon="logos:slack-icon" className="w-full h-full" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#E01E5A] uppercase tracking-widest mb-3">
                  Automated Alerts
                </p>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Slack Dispatch</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                  Every incident is instantly broadcasted to your team with a complete summary and
                  action links.
                </p>
              </div>
            </div>

            {/* Card 4: Onboarding (Compact Accessory) */}
            <div className="md:col-span-2 group relative p-8 bg-white border border-gray-100 rounded-[2rem] flex flex-col justify-center items-center text-center hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all duration-500">
              <div className="w-12 h-12 mb-4 bg-sky-50 rounded-full flex items-center justify-center text-sky-600">
                <Icon icon="solar:user-hand-up-bold-duotone" className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">AI Copilot</h3>
              <p className="text-[10px] text-gray-400">Guided asset discovery.</p>
            </div>
          </div>
        </div>
      </section>


      <footer className="relative bg-black text-white pt-24 pb-12 px-6 overflow-hidden rounded-t-[4rem] shadow-[0_-20px_60px_rgba(0,0,0,0.1)]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-8">Ready to pulse?</h2>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-10 py-5 bg-white text-black font-black rounded-2xl hover:bg-gray-100 transition-all active:scale-95 text-lg"
            >
              Get Started
            </Link>
            <a
              href="https://x.com/LazyCode3"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 border border-white/10 rounded-2xl hover:bg-white/5 transition-all text-gray-400 hover:text-white"
            >
              <Icon icon="ri:twitter-x-fill" className="w-7 h-7" />
            </a>
          </div>
        </div>

        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-center pt-12 border-t border-white/5 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">
          <div className="flex items-center gap-4">
            <img src="/logos/metapulse-icon.svg" alt="MetaPulse" className="w-10 h-10" />
            <div className="flex flex-col -space-y-1 text-left">
              <span className="text-white font-bold tracking-tight text-lg">MetaPulse</span>
              <span className="text-[7px] font-black text-gray-600 uppercase tracking-[0.45em]">
                Data Pulse
              </span>
            </div>
            <span className="ml-4 text-gray-700">© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
