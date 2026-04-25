'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Icon } from '@iconify/react';
import type { ChatMessage } from '@/types';

type OnboardingPhase = 'setup' | 'chat';

interface UserProfile {
  userName: string;
  role: string;
  team: string;
}

export default function CopilotPage() {
  const [onboardingPhase, setOnboardingPhase] = useState<OnboardingPhase>('setup');
  const [profile, setProfile] = useState<UserProfile>({ userName: '', role: '', team: '' });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // Send Chat Message
  const sendMessage = useCallback(async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);
    setChatError(null);

    try {
      const history = [...chatMessages, userMsg].map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: profile.userName,
          role: profile.role,
          team: profile.team,
          message: text,
          conversationHistory: history,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error || `HTTP ${res.status}`);
      }

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setChatError(err instanceof Error ? err.message : String(err));
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading, chatMessages, profile]);

  // Start Onboarding
  const startOnboarding = useCallback(() => {
    if (!profile.userName || !profile.role || !profile.team) return;
    setOnboardingPhase('chat');

    const welcomeMsg: ChatMessage = {
      id: 'welcome',
      role: 'user',
      content: `Hi, I'm ${profile.userName}. I just joined as a ${profile.role} on the ${profile.team} team. Can you help me understand what data assets I should know about?`,
      timestamp: new Date().toISOString(),
    };
    setChatMessages([welcomeMsg]);
    setChatLoading(true);

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName: profile.userName,
        role: profile.role,
        team: profile.team,
        message: welcomeMsg.content,
        conversationHistory: [],
      }),
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const reply: ChatMessage = {
          id: 'welcome-reply',
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
        };
        setChatMessages((prev) => [...prev, reply]);
      })
      .catch((err) => setChatError(err instanceof Error ? err.message : String(err)))
      .finally(() => setChatLoading(false));
  }, [profile]);

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-slate-50 relative h-full">
      {onboardingPhase === 'setup' ? (
          <div className="absolute inset-0 p-6 md:p-10 flex flex-col items-center justify-center overflow-y-auto w-full max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-1000">
             <div className="text-center mb-12 max-w-lg w-full">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 leading-none">MetaPulse Intelligence</h2>
                <p className="text-sm font-bold text-slate-400 leading-relaxed max-w-[340px] mx-auto">The AI that knows your data. Ask me anything or get onboarded.</p>
             </div>
             
             <div className="space-y-6 mb-8 max-w-sm w-full">
               <div className="space-y-2.5 group">
                 <label className="flex items-center gap-2.5 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 group-focus-within:text-emerald-500 transition-colors">
                    <Icon icon="solar:user-id-bold-duotone" width="14" />
                    Who are you?
                 </label>
                 <input type="text" value={profile.userName} onChange={(e) => setProfile(p => ({ ...p, userName: e.target.value }))} placeholder="Alex Chen" className="w-full px-6 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm bg-white placeholder:text-slate-200" />
               </div>
               <div className="space-y-2.5 group">
                 <label className="flex items-center gap-2.5 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 group-focus-within:text-emerald-500 transition-colors">
                    <Icon icon="solar:case-round-bold-duotone" width="14" />
                    Your Role
                 </label>
                 <input type="text" value={profile.role} onChange={(e) => setProfile(p => ({ ...p, role: e.target.value }))} placeholder="Security Engineer" className="w-full px-6 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm bg-white placeholder:text-slate-200" />
               </div>
               <div className="space-y-2.5 group">
                 <label className="flex items-center gap-2.5 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 group-focus-within:text-emerald-500 transition-colors">
                    <Icon icon="solar:users-group-two-rounded-bold-duotone" width="14" />
                    Your team
                 </label>
                 <input type="text" value={profile.team} onChange={(e) => setProfile(p => ({ ...p, team: e.target.value }))} placeholder="Infrastructure" className="w-full px-6 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm bg-white placeholder:text-slate-200" />
               </div>
             </div>
             
             <button onClick={startOnboarding} disabled={!profile.userName || !profile.role || !profile.team} className="max-w-sm w-full py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 active:scale-95 bg-emerald-500 hover:opacity-90 flex items-center justify-center gap-3">
               Enter MetaPulse
             </button>
          </div>
      ) : (
          <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto h-full px-6 md:px-10 py-6 overflow-hidden">
             {/* Sticky Header */}
             <div className="shrink-0 z-20 bg-slate-50/90 backdrop-blur-md pb-6 border-b border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div>
                     <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">MetaPulse Intelligence</p>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1.5 leading-none">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                        Live Knowledge Sync
                     </p>
                   </div>
                </div>
                <button onClick={() => setOnboardingPhase('setup')} className="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-white hover:border-slate-300 transition-all">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-red-500">Reset Session</span>
                </button>
             </div>

             {/* Scrollable Chat Area */}
             <div className="flex-1 overflow-y-auto chat-scroll space-y-10 py-10 relative scroll-smooth">
                {chatMessages.map((msg) => (
                   <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-4xl mx-auto w-full`}>
                      <span className="text-[9px] font-black text-slate-400 mb-2.5 px-2 tracking-widest uppercase flex items-center gap-2 opacity-60">
                         {msg.role === 'user' ? <Icon icon="solar:user-bold-duotone" width="12" /> : <Icon icon="solar:mask-h-bold-duotone" width="12" className="text-emerald-500" />}
                         {msg.role === 'user' ? profile.userName : 'Intelligence'}
                      </span>
                      <div className={`max-w-[85%] md:max-w-[80%] px-6 py-6 text-[13px] font-medium leading-relaxed shadow-sm transition-all ${
                         msg.role === 'user' 
                           ? 'rounded-2xl rounded-tr-none bg-slate-900 text-white shadow-lg shadow-slate-200/50' 
                           : 'rounded-2xl rounded-tl-none bg-white border border-slate-200/50 text-slate-700'
                      }`}>
                         {msg.role === 'assistant' ? (
                           <div className="prose prose-slate prose-sm max-w-none 
                             prose-p:leading-relaxed 
                             prose-p:text-slate-700
                             prose-strong:text-emerald-600 
                             prose-headings:text-slate-900 prose-headings:font-black prose-headings:tracking-tight 
                             prose-ul:list-disc prose-ul:pl-4
                             prose-code:before:content-none prose-code:after:content-none
                             prose-code:bg-slate-100 prose-code:text-emerald-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-lg prose-code:font-black prose-code:text-[11px]
                           ">
                             <ReactMarkdown>{msg.content}</ReactMarkdown>
                           </div>
                         ) : msg.content}
                      </div>
                   </div>
                ))}

                {chatLoading && (
                  <div className="flex flex-col items-start max-w-4xl mx-auto w-full">
                    <span className="text-[9px] font-black text-slate-400 mb-2.5 px-2 tracking-widest uppercase flex items-center gap-2 opacity-60">
                       <Icon icon="solar:globus-bold-duotone" width="12" className="text-emerald-500 animate-spin-slow" />
                       Thinking...
                    </span>
                    <div className="px-10 py-8 rounded-2xl rounded-tl-none bg-white border border-slate-200/50 shadow-sm flex items-center justify-center gap-2.5 min-w-[100px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}

                {chatError && (
                  <div className="max-w-4xl mx-auto w-full p-4 rounded-xl bg-red-50 text-red-700 text-[10px] border border-red-100 font-black uppercase tracking-widest flex items-center gap-3">
                    <Icon icon="solar:danger-bold-duotone" width="16" />
                    Error: {chatError}
                  </div>
                )}

                <div ref={chatEndRef} />
             </div>

             {/* Input Area (Anchored) */}
             <div className="shrink-0 pt-6 border-t border-slate-200/60 pb-4">
                <div className="max-w-4xl mx-auto w-full flex items-center gap-3 bg-white p-2.5 rounded-[1.25rem] border border-slate-200 shadow-sm focus-within:border-emerald-500/50 focus-within:ring-4 focus-within:ring-emerald-500/5 transition-all">
                  <input 
                    type="text" 
                    value={chatInput} 
                    onChange={e => setChatInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask anything about lineage, assets, or data health..." 
                    className="flex-1 px-5 py-3 text-[13px] font-bold text-slate-900 focus:outline-none bg-transparent placeholder:text-slate-300" 
                    disabled={chatLoading}
                  />
                  <button 
                    onClick={sendMessage} 
                    disabled={chatLoading || !chatInput.trim()} 
                    className="w-10 h-10 rounded-xl text-white transition-all flex items-center justify-center disabled:opacity-40 shadow-lg shadow-emerald-500/10 font-black bg-emerald-500 hover:bg-emerald-600 active:scale-95" 
                  >
                    <Icon icon="solar:plain-2-bold-duotone" width="18" />
                  </button>
                </div>
                <p className="text-center mt-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-40">Press Enter to send message</p>
             </div>
          </div>
      )}
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .chat-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .chat-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scroll::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
