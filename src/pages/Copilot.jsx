import React, { useState, useRef, useEffect } from 'react';
import { useESGStore } from '../store/useESGStore';
import { useNavigate, NavLink } from 'react-router-dom';
import { Bot, Send, User, ChevronRight, CheckCircle, AlertTriangle, ShieldAlert, Zap } from 'lucide-react';

const STARTER_QUESTIONS = [
  "Why is my ESG score low?",
  "What is my biggest ESG gap?",
  "What is my renewable energy percentage?",
  "Explain my BRSR readiness.",
  "Which What-If scenario gives me the best ROI?",
  "Summarize my ESG performance."
];

export default function Copilot() {
  const { rawData, metrics, reports } = useESGStore();
  const navigate = useNavigate();
  const hasData = Object.keys(rawData).length > 0;

  const [messages, setMessages] = useState([{
    id: '1',
    role: 'assistant',
    text: "Hi, I'm your ECOBIT Copilot. I analyze your verified company data and can help identify gaps, model scenarios, and explain policies. What would you like to know?"
  }]);
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [interactionId, setInteractionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (question) => {
    if (!question.trim()) return;

    // Add User Message
    const userMsg = { id: Date.now().toString(), role: 'user', text: question };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Build Context Snapshot
      const contextSnapshot = {
        rawData,
        metrics,
        reportsAvailable: reports.length
      };

      // Call Copilot API
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: question,
          context: contextSnapshot,
          previousInteractionId: interactionId
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error + (data.details ? `: ${data.details}` : ''));
      }

      if (data.interactionId) {
        setInteractionId(data.interactionId);
      }

      // Add Assistant Message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        parsedResponse: data.response
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        text: err.message || "Copilot is temporarily unavailable. Your ECOBIT data is safe."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!hasData) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', paddingTop: '10vh' }}>
        <h2 style={{ fontSize: 32, fontWeight: 300, color: 'var(--deep-forest)', marginBottom: 16 }}>Your Copilot is Blind</h2>
        <p style={{ fontSize: 18, color: 'rgba(36, 84, 56, 0.8)', marginBottom: 32 }}>
          Your ECOBIT Copilot needs verified company data to provide company-specific answers. 
        </p>
        <NavLink to="/dashboard/data" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
          GO TO DATA CENTRE
        </NavLink>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 64, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--deep-forest)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Bot size={32} /> ECOBIT Copilot
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(36, 84, 56, 0.7)', marginTop: 4 }}>
            Ask anything about your company's ESG performance.
          </p>
        </div>
      </div>

      {/* CHAT INTERFACE */}
      <div className="glass-panel" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        
        {/* Messages Container */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: 32, background: 'rgba(255,255,255,0.3)' }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', gap: 16, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              
              {/* Avatar */}
              <div style={{ 
                width: 40, height: 40, borderRadius: 20, flexShrink: 0, 
                background: msg.role === 'user' ? 'var(--deep-forest)' : 'rgba(255,255,255,0.9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: msg.role === 'assistant' ? '0 4px 12px rgba(36,84,56,0.1)' : 'none'
              }}>
                {msg.role === 'user' ? <User size={20} color="white" /> : <Bot size={24} color="var(--leaf-green)" />}
              </div>

              {/* Message Bubble */}
              <div style={{ 
                maxWidth: '70%', 
                background: msg.role === 'user' ? 'var(--deep-forest)' : 'rgba(255,255,255,0.85)',
                color: msg.role === 'user' ? 'white' : 'var(--deep-forest)',
                padding: '16px 24px', 
                borderRadius: 16,
                borderTopRightRadius: msg.role === 'user' ? 4 : 16,
                borderTopLeftRadius: msg.role === 'assistant' ? 4 : 16,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                {msg.text && <div style={{ fontSize: 15, lineHeight: 1.6 }}>{msg.text}</div>}
                
                {/* Structured JSON Parsing for Assistant */}
                {msg.parsedResponse && (
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, lineHeight: 1.5 }}>
                      {msg.parsedResponse.summary}
                    </div>
                    
                    {msg.parsedResponse.key_findings && msg.parsedResponse.key_findings.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(36,84,56,0.5)', textTransform: 'uppercase', marginBottom: 8 }}>Key Findings</div>
                        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.6, color: 'rgba(36,84,56,0.9)' }}>
                          {msg.parsedResponse.key_findings.map((finding, idx) => <li key={idx}>{finding}</li>)}
                        </ul>
                      </div>
                    )}
                    
                    {/* Actionable Button */}
                    {msg.parsedResponse.recommended_action?.title && (
                      <div style={{ background: 'rgba(114, 184, 90, 0.05)', border: '1px solid rgba(114, 184, 90, 0.2)', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--leaf-green)', textTransform: 'uppercase', marginBottom: 4 }}>Recommended Action</div>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{msg.parsedResponse.recommended_action.title}</div>
                        <div style={{ fontSize: 13, color: 'rgba(36,84,56,0.8)', marginBottom: 12 }}>{msg.parsedResponse.recommended_action.description}</div>
                        {msg.parsedResponse.recommended_action.button_route && (
                           <button 
                             onClick={() => navigate(msg.parsedResponse.recommended_action.button_route)}
                             className="btn-primary" 
                             style={{ fontSize: 12, padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                           >
                             {msg.parsedResponse.recommended_action.button_label || 'Take Action'} <ChevronRight size={14}/>
                           </button>
                        )}
                      </div>
                    )}

                    {/* Metadata */}
                    <div style={{ display: 'flex', gap: 16, fontSize: 11, fontWeight: 700, color: 'rgba(36,84,56,0.5)', borderTop: '1px solid rgba(36,84,56,0.1)', paddingTop: 12 }}>
                      {msg.parsedResponse.source && <div>SOURCE: {msg.parsedResponse.source}</div>}
                      {msg.parsedResponse.confidence && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: msg.parsedResponse.confidence.includes('INSUFFICIENT') ? 'var(--risk-red)' : 'var(--leaf-green)' }}>
                          {msg.parsedResponse.confidence.includes('INSUFFICIENT') ? <ShieldAlert size={12}/> : <CheckCircle size={12}/>}
                          {msg.parsedResponse.confidence}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
             <div style={{ display: 'flex', gap: 16, flexDirection: 'row' }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={24} color="var(--leaf-green)" style={{ opacity: 0.5 }} />
              </div>
              <div style={{ background: 'rgba(255,255,255,0.6)', padding: '16px 24px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--leaf-green)', animation: 'pulse 1.5s infinite' }} />
                <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--leaf-green)', animation: 'pulse 1.5s infinite 0.2s' }} />
                <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--leaf-green)', animation: 'pulse 1.5s infinite 0.4s' }} />
                <span style={{ fontSize: 13, color: 'rgba(36,84,56,0.6)', marginLeft: 8, fontWeight: 600 }}>Analyzing ECOBIT data...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        <div style={{ padding: '24px 32px', background: 'rgba(255,255,255,0.8)', borderTop: '1px solid rgba(36,84,56,0.1)' }}>
          
          {/* Starter Questions (Only show if chat is basically empty) */}
          {messages.length === 1 && !isTyping && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {STARTER_QUESTIONS.map(q => (
                <button 
                  key={q} 
                  onClick={() => handleSend(q)}
                  style={{ background: 'rgba(36,84,56,0.05)', border: '1px solid rgba(36,84,56,0.1)', padding: '8px 16px', borderRadius: 20, fontSize: 13, color: 'var(--deep-forest)', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(36,84,56,0.1)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(36,84,56,0.05)'}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder="Ask Copilot a question about your ESG data..."
              style={{ flexGrow: 1, padding: '16px 24px', borderRadius: 24, border: '1px solid rgba(36,84,56,0.2)', background: 'white', fontSize: 15, outline: 'none' }}
              disabled={isTyping}
            />
            <button 
              onClick={() => handleSend(input)}
              disabled={isTyping || !input.trim()}
              style={{ width: 52, height: 52, borderRadius: 26, background: input.trim() && !isTyping ? 'var(--leaf-green)' : 'rgba(36,84,56,0.2)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !isTyping ? 'pointer' : 'default', transition: 'background 0.3s' }}
            >
              <Send size={20} style={{ marginLeft: 4 }} />
            </button>
          </div>
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: 'rgba(36,84,56,0.4)' }}>
            ECOBIT Copilot uses generative AI. Information provided is an analysis of your verified dataset.
          </div>
        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
