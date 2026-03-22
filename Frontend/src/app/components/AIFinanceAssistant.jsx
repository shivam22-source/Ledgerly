import { useState, useEffect, useRef } from "react";


// AI calls go through your backend proxy → keeps API key safe

// ── helpers ──────────────────────────────────────────────────────────────────
const CATEGORIES = ["Food", "Transport", "Bills", "Shopping", "Entertainment", "Health", "Salary", "Freelance", "Other"];

function buildSystemPrompt(context) {
  return `You are Ledger AI, a sharp and friendly personal finance assistant embedded inside Ledgerly — a personal finance dashboard.

You have access to the user's real financial data:
${JSON.stringify(context, null, 2)}

Your capabilities:
1. CHAT: Answer questions about spending, balance, trends in a conversational way. Be concise, use numbers from the data.
2. CATEGORIZE: When asked to categorize, return JSON like: {"action":"categorize","results":[{"id":"...","category":"Food"},...]}
3. INSIGHTS: When asked for insights/tips, give 3 bullet points max, data-backed.

Rules:
- Always reference actual numbers from the data
- Be direct, no fluff
- For categorize action, ONLY return valid JSON, nothing else
- Currency is INR (₹) unless stated otherwise
- If data is missing, say so honestly`;
}

async function callGemini(messages, context) {
  // Calls YOUR backend → backend calls Gemini → key never exposed to browser
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${process.env.REACT_APP_API_URL}/api/ai-chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      messages,
      systemPrompt: buildSystemPrompt(context),
    }),
  });
  if (!res.ok) throw new Error("AI request failed");
  const data = await res.json();
  return data.reply || "Sorry, I couldn't process that.";
}

function categorizeTxn(txn) {
  // Use whatever the user typed as-is
  if (txn.category && txn.category.trim()) return txn.category.trim();
  // fallback: guess from partyName or description
  const d = (txn.description || txn.partyName || '').toLowerCase();
  if (/zomato|swiggy|food|restaurant|cafe|eat/.test(d)) return "Food";
  if (/uber|ola|cab|bus|train|fuel|petrol/.test(d)) return "Transport";
  if (/electricity|rent|internet|phone|bill/.test(d)) return "Bills";
  if (/amazon|flipkart|shop|mall/.test(d)) return "Shopping";
  if (/netflix|spotify|movie|game|cinema/.test(d)) return "Entertainment";
  if (/doctor|medicine|pharmacy|gym/.test(d)) return "Health";
  if (/salary|payroll|stipend/.test(d)) return "Salary";
  if (/freelance|client|invoice/.test(d)) return "Freelance";
  return txn.partyName || "Other";
}

const CATEGORY_COLORS = {
  Food: "#f97316", Transport: "#3b82f6", Bills: "#8b5cf6",
  Shopping: "#ec4899", Entertainment: "#06b6d4", Health: "#10b981",
  Salary: "#22c55e", Freelance: "#84cc16", Other: "#94a3b8",
};

const CATEGORY_ICONS = {
  Food: "🍜", Transport: "🚗", Bills: "⚡", Shopping: "🛍️",
  Entertainment: "🎬", Health: "💊", Salary: "💼", Freelance: "💻", Other: "📦",
};



// ── sub-components ────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "10px 0" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%", background: "#6ee7b7",
          animation: "bounce 1.2s infinite", animationDelay: `${i * 0.2}s`,
        }} />
      ))}
    </div>
  );
}

function InsightCard({ icon, text }) {
  return (
    <div style={{
      background: "rgba(110,231,183,0.07)", border: "1px solid rgba(110,231,183,0.15)",
      borderRadius: 10, padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-start",
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6 }}>{text}</span>
    </div>
  );
}

function CategoryBadge({ category }) {
  const color = CATEGORY_COLORS[category] || "#94a3b8";
  const icon = CATEGORY_ICONS[category] || "🏷️";
  return (
    <span style={{
      background: color + "22",
      color: color,
      border: `1px solid ${color}44`,
      borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600,
      whiteSpace: "nowrap", textTransform: "capitalize",
    }}>
      {icon} {category}
    </span>
  );
}

function SpendingBar({ categories, total }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", height: 10, gap: 1 }}>
        {Object.entries(categories).map(([cat, amt]) => (
          <div key={cat} title={`${cat}: ₹${amt}`} style={{
            width: `${(amt / total) * 100}%`, background: CATEGORY_COLORS[cat],
            transition: "width 0.6s ease",
          }} />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px", marginTop: 10 }}>
        {Object.entries(categories).map(([cat, amt]) => (
          <div key={cat} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: CATEGORY_COLORS[cat] }} />
            <span style={{ color: "#94a3b8" }}>{cat}</span>
            <span style={{ color: "#e2e8f0", fontWeight: 600 }}>₹{amt.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function AIFinanceAssistant({ balance = 0, summary = {}, transactions = [] }) {
  const [tab, setTab] = useState("chat"); // chat | categorize | insights
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey! I'm **Ledger AI** 👋 I know your finances inside out. Ask me anything — *'How much did I spend this month?'*, *'Am I saving enough?'*, or just say hi." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [categorized, setCategorized] = useState([]);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const d = {
      balance: balance,
      monthDebit: summary?.debit ?? 0,
      monthCredit: summary?.credit ?? 0,
      transactions: (transactions || []).filter(t => !t.isDeleted),
    };
    setData(d);
    const withCat = d.transactions.map(t => ({ ...t, _aiCategory: categorizeTxn(t) }));
    setCategorized(withCat);
  }, [balance, summary, transactions]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const getContext = () => ({
    balance: data?.balance,
    currentMonthDebit: data?.monthDebit,
    currentMonthCredit: data?.monthCredit,
    transactions: (categorized.length ? categorized : data?.transactions)?.map(t => ({
      partyName: t.partyName,
      amount: t.amount,
      type: t.type,
      category: t._aiCategory || t.category,
      paymentMode: t.paymentMode,
      date: t.date,
      description: t.description,
    })),
    month: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
  });

  const sendMessage = async () => {
    if (!input.trim() || loading || !data) return;
    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
    try {
      const reply = await callGemini(apiMessages, getContext());
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Couldn't reach the AI. Check your API key." }]);
    }
    setLoading(false);
  };

  const loadInsights = async () => {
    if (!data || insightsLoading) return;
    setInsightsLoading(true);
    try {
      const reply = await callGemini([
        { role: "user", content: "Give me 3 sharp, data-backed financial insights about my spending this month. Each insight should be 1-2 sentences max. Format as plain text bullet points starting with •" }
      ], getContext());
      setInsights(reply);
    } catch {
      setInsights("⚠️ Couldn't load insights right now.");
    }
    setInsightsLoading(false);
  };

  const aiCategorize = async () => {
    if (!data || catLoading) return;
    setCatLoading(true);
    try {
      const reply = await callGemini([{
        role: "user",
        content: `Categorize these transactions. Return ONLY a JSON array: [{"id":"...","category":"..."},...]. Categories: ${CATEGORIES.join(", ")}. Transactions: ${JSON.stringify(data.transactions.map(t => ({ id: t._id || t.id, label: t.partyName + (t.description ? " - " + t.description : ""), category: t.category, amount: t.amount, type: t.type })))}`
      }], getContext());
      const json = JSON.parse(reply.replace(/```json|```/g, "").trim());
      const map = Object.fromEntries(json.map(r => [r.id, r.category]));
      setCategorized(data.transactions.map(t => ({ ...t, _aiCategory: map[t._id || t.id] || categorizeTxn(t) })));
    } catch {
      // fallback to local categorization
      setCategorized(data.transactions.map(t => ({ ...t, _aiCategory: categorizeTxn(t) })));
    }
    setCatLoading(false);
  };

  // category breakdown for debit txns
  const catBreakdown = categorized.filter(t => t.type === "DEBIT" || t.type === "debit").reduce((acc, t) => {
    const cat = t._aiCategory || t.category || 'Other';
    acc[cat] = (acc[cat] || 0) + Number(t.amount);
    return acc;
  }, {});
  const totalDebit = Object.values(catBreakdown).reduce((a, b) => a + b, 0);

  const renderMarkdown = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background:rgba(110,231,183,0.15);padding:1px 5px;border-radius:4px;font-size:12px">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;600;700;800&display=swap');
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes popIn { from{opacity:0;transform:scale(0.92) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes fabPulse { 0%,100%{box-shadow:0 0 0 0 rgba(110,231,183,0.4)} 70%{box-shadow:0 0 0 10px rgba(110,231,183,0)} }
        .fab-btn:hover { transform: scale(1.1) !important; box-shadow: 0 8px 30px rgba(110,231,183,0.4) !important; }
        .fab-btn:active { transform: scale(0.95) !important; }
        .close-btn:hover { background: rgba(255,255,255,0.1) !important; }
        .ai-msg { animation: fadeIn 0.3s ease; }
        .tab-btn:hover { background: rgba(110,231,183,0.08) !important; }
        .send-btn:hover { background: #059669 !important; transform: scale(1.05); }
        .send-btn:active { transform: scale(0.97); }
        .quick-btn:hover { background: rgba(110,231,183,0.12) !important; border-color: rgba(110,231,183,0.4) !important; }
        .cat-row:hover { background: rgba(255,255,255,0.03) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(110,231,183,0.2); border-radius: 4px; }
      `}</style>

      {/* Blur backdrop */}
      {isOpen && (
        <div onClick={() => setIsOpen(false)} style={{
          position: "fixed", inset: 0, zIndex: 998,
          backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
          background: "rgba(0,0,0,0.45)",
          transition: "all 0.3s ease",
        }} />
      )}

      {/* Floating panel */}
      {isOpen && (
      <div style={{
        position: "fixed", bottom: 90, right: 24, zIndex: 999,
        fontFamily: "'Syne', sans-serif",
        background: "#0a0f1a",
        border: "1px solid rgba(110,231,183,0.15)",
        borderRadius: 20,
        overflow: "hidden",
        width: 480,
        boxShadow: "0 0 60px rgba(110,231,183,0.1), 0 24px 80px rgba(0,0,0,0.7)",
        animation: "popIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
      }}>

        {/* header */}
        <div style={{
          background: "linear-gradient(135deg, #0d1f2d 0%, #0a1628 100%)",
          padding: "18px 22px 0",
          borderBottom: "1px solid rgba(110,231,183,0.1)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "linear-gradient(135deg, #6ee7b7, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, boxShadow: "0 0 20px rgba(110,231,183,0.3)",
            }}>🤖</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#f1f5f9", letterSpacing: "-0.3px" }}>Ledger AI</div>
              <div style={{ fontSize: 11, color: "#6ee7b7", fontFamily: "'DM Mono', monospace", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6ee7b7", display: "inline-block", animation: "pulse 2s infinite" }} />
                connected to your ledger
              </div>
            </div>
            {data && (
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Mono', monospace" }}>balance</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#6ee7b7" }}>₹{data.balance.toLocaleString()}</div>
              </div>
            )}
          </div>

          {/* tabs */}
          <div style={{ display: "flex", gap: 2 }}>
            {[
              { id: "chat", label: "💬 Chat" },
              { id: "categorize", label: "🏷️ Categorize" },
              { id: "insights", label: "📊 Insights" },
            ].map(t => (
              <button key={t.id} className="tab-btn" onClick={() => {
                setTab(t.id);
                if (t.id === "insights" && !insights) loadInsights();
              }} style={{
                background: tab === t.id ? "rgba(110,231,183,0.12)" : "transparent",
                border: "none", borderBottom: tab === t.id ? "2px solid #6ee7b7" : "2px solid transparent",
                color: tab === t.id ? "#6ee7b7" : "#64748b",
                padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600,
                fontFamily: "'Syne', sans-serif", borderRadius: "6px 6px 0 0",
                transition: "all 0.2s",
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* ── CHAT TAB ── */}
        {tab === "chat" && (
          <div style={{ display: "flex", flexDirection: "column", height: 460 }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map((m, i) => (
                <div key={i} className="ai-msg" style={{
                  display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                }}>
                  <div style={{
                    maxWidth: "82%",
                    background: m.role === "user"
                      ? "linear-gradient(135deg, #059669, #047857)"
                      : "rgba(255,255,255,0.04)",
                    border: m.role === "user" ? "none" : "1px solid rgba(255,255,255,0.07)",
                    borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    padding: "10px 14px",
                    fontSize: 13.5,
                    color: m.role === "user" ? "#f0fdf4" : "#cbd5e1",
                    lineHeight: 1.65,
                    fontFamily: m.role === "user" ? "'Syne', sans-serif" : "'DM Mono', monospace",
                  }} dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} />
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex" }}>
                  <div style={{
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "16px 16px 16px 4px", padding: "4px 14px",
                  }}><TypingDots /></div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* quick prompts */}
            <div style={{ padding: "0 18px 10px", display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["How much did I spend this month?", "Am I saving enough?", "Biggest expense?"].map(q => (
                <button key={q} className="quick-btn" onClick={() => setInput(q)} style={{
                  background: "rgba(110,231,183,0.05)", border: "1px solid rgba(110,231,183,0.15)",
                  color: "#6ee7b7", borderRadius: 20, padding: "4px 10px", fontSize: 11,
                  cursor: "pointer", fontFamily: "'Syne', sans-serif", transition: "all 0.2s",
                }}>{q}</button>
              ))}
            </div>

            {/* input */}
            <div style={{
              padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex", gap: 8, background: "rgba(0,0,0,0.2)",
            }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Ask about your finances..."
                style={{
                  flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10, padding: "10px 14px", color: "#f1f5f9", fontSize: 13,
                  outline: "none", fontFamily: "'DM Mono', monospace",
                }}
              />
              <button className="send-btn" onClick={sendMessage} disabled={loading || !input.trim()} style={{
                background: "#059669", border: "none", borderRadius: 10, width: 42, height: 42,
                cursor: "pointer", fontSize: 16, transition: "all 0.2s",
                opacity: loading || !input.trim() ? 0.4 : 1,
              }}>➤</button>
            </div>
          </div>
        )}

        {/* ── CATEGORIZE TAB ── */}
        {tab === "categorize" && (
          <div style={{ height: 460, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>Transaction Categories</div>
                <div style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Mono', monospace" }}>AI-powered classification</div>
              </div>
              <button onClick={aiCategorize} disabled={catLoading} style={{
                background: "rgba(110,231,183,0.1)", border: "1px solid rgba(110,231,183,0.3)",
                color: "#6ee7b7", borderRadius: 8, padding: "6px 12px", fontSize: 11,
                cursor: "pointer", fontFamily: "'Syne', sans-serif", fontWeight: 600,
                opacity: catLoading ? 0.5 : 1,
              }}>{catLoading ? "Analyzing..." : "✨ Re-categorize"}</button>
            </div>

            {totalDebit > 0 && (
              <div style={{ padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>spending breakdown</div>
                <SpendingBar categories={catBreakdown} total={totalDebit} />
              </div>
            )}

            <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
              {(categorized.length ? categorized : data?.transactions || []).map((t, i) => (
                <div key={t.id} className="cat-row ai-msg" style={{
                  display: "flex", alignItems: "center", padding: "10px 18px",
                  borderBottom: "1px solid rgba(255,255,255,0.03)", gap: 12,
                  animationDelay: `${i * 0.04}s`,
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                    background: t.type === "credit" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                  }}>{t.type === "credit" ? "↑" : "↓"}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, color: "#e2e8f0", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.partyName || t.description || 'Unknown'}</div>
                    <div style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Mono', monospace" }}>{new Date(t.date).toLocaleDateString("en-IN")}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.type === "credit" ? "#22c55e" : "#f87171", fontFamily: "'DM Mono', monospace" }}>
                      {t.type === "credit" ? "+" : "-"}₹{t.amount.toLocaleString()}
                    </div>
                    {(t._aiCategory || t.category) && <CategoryBadge category={t._aiCategory || t.category} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── INSIGHTS TAB ── */}
        {tab === "insights" && (
          <div style={{ height: 460, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* stats row */}
            {data && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { label: "Balance", value: `₹${data.balance.toLocaleString()}`, color: "#6ee7b7", icon: "💰" },
                  { label: "Spent", value: `₹${data.monthDebit.toLocaleString()}`, color: "#f87171", icon: "📤" },
                  { label: "Earned", value: `₹${data.monthCredit.toLocaleString()}`, color: "#22c55e", icon: "📥" },
                ].map(s => (
                  <div key={s.label} style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 12, padding: "12px 10px", textAlign: "center",
                  }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: s.color, fontFamily: "'DM Mono', monospace" }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* savings rate */}
            {data && (
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>Savings Rate</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#6ee7b7", fontFamily: "'DM Mono', monospace" }}>
                    {Math.round(((data.monthCredit - data.monthDebit) / data.monthCredit) * 100)}%
                  </span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 6, overflow: "hidden" }}>
                  <div style={{
                    width: `${Math.min(100, Math.max(0, ((data.monthCredit - data.monthDebit) / data.monthCredit) * 100))}%`,
                    height: "100%", background: "linear-gradient(90deg, #059669, #6ee7b7)",
                    borderRadius: 4, transition: "width 1s ease",
                  }} />
                </div>
              </div>
            )}

            {/* AI insights */}
            <div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10, fontFamily: "'DM Mono', monospace" }}>✨ ai insights</div>
              {insightsLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 20 }}><TypingDots /></div>
              ) : insights ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {insights.split("\n").filter(l => l.trim()).map((line, i) => (
                    <InsightCard key={i} icon={["💡", "⚠️", "🎯"][i % 3]} text={line.replace(/^[•\-*]\s*/, "")} />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", color: "#475569", fontSize: 13, padding: 20 }}>Loading insights...</div>
              )}
            </div>

            <button onClick={loadInsights} disabled={insightsLoading} style={{
              background: "rgba(110,231,183,0.08)", border: "1px solid rgba(110,231,183,0.2)",
              color: "#6ee7b7", borderRadius: 10, padding: "10px", fontSize: 12,
              cursor: "pointer", fontFamily: "'Syne', sans-serif", fontWeight: 600,
              opacity: insightsLoading ? 0.5 : 1,
            }}>🔄 Refresh Insights</button>
          </div>
        )}
      </div>
      )}

      {/* Floating Action Button */}
      <button
        className="fab-btn"
        onClick={() => setIsOpen(o => !o)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 1000,
          width: 56, height: 56, borderRadius: "50%",
          background: isOpen ? "#0a0f1a" : "linear-gradient(135deg, #059669, #6ee7b7)",
          border: isOpen ? "2px solid rgba(110,231,183,0.4)" : "none",
          cursor: "pointer", fontSize: 24,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          boxShadow: "0 4px 20px rgba(110,231,183,0.3)",
          animation: isOpen ? "none" : "fabPulse 2s infinite",
        }}
      >
        {isOpen ? "✕" : "🤖"}
      </button>
    </>
  );
}
