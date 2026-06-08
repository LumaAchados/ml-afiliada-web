import { useState, useEffect, useCallback, useRef } from "react";

const CATEGORIES = [
  { id: "", label: "Todas" },
  { id: "MLB1051", label: "📱 Celulares" },
  { id: "MLB1648", label: "💻 Computadores" },
  { id: "MLB1000", label: "🔌 Eletrônicos" },
  { id: "MLB1276", label: "🏠 Eletrodomésticos" },
  { id: "MLB1430", label: "🎮 Games" },
  { id: "MLB1574", label: "📺 TV e Vídeo" },
  { id: "MLB1132", label: "👟 Calçados" },
  { id: "MLB1246", label: "🛋️ Móveis" },
  { id: "MLB1196", label: "🧴 Beleza" },
  { id: "MLB1144", label: "👗 Moda" },
];

const BRAND = {
  navy: "#2C3256", pink: "#C4345A", coral: "#F26050",
  yellow: "#FBBC52", sage: "#7DB99A", white: "#FFFFFF",
};

// ─── Score ────────────────────────────────────────────────────────────────────
function calcScore(p) {
  let s = 0;
  const disc = p.original_price ? Math.round(((p.original_price - p.price) / p.original_price) * 100) : p.discount || 0;
  s += Math.min(disc * 1.5, 50);
  if (p.shipping?.free_shipping || p.free_shipping) s += 20;
  const r = p.rating_average || p.reviews || 0;
  if (r >= 4.5) s += 15; else if (r >= 4) s += 8;
  if (p.price <= 100) s += 10; else if (p.price <= 500) s += 5;
  return Math.min(Math.round(s), 100);
}

function ScoreBadge({ score }) {
  const color = score >= 75 ? "#00c853" : score >= 50 ? "#ffd600" : "#ff6d00";
  const label = score >= 75 ? "🔥 Viral" : score >= 50 ? "⚡ Bom" : "👀 Ok";
  return <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: color + "22", border: `1.5px solid ${color}`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{label} {score}</div>;
}

function PriceSparkline({ history }) {
  if (!history || history.length < 2) return null;
  const prices = history.map(h => h.price);
  const min = Math.min(...prices), max = Math.max(...prices), range = max - min || 1;
  const w = 80, h = 28;
  const points = prices.map((p, i) => `${(i / (prices.length - 1)) * w},${h - ((p - min) / range) * h}`).join(" ");
  const color = prices[prices.length-1] < prices[0] ? "#00c853" : prices[prices.length-1] > prices[0] ? "#ff4444" : "#ffffff50";
  return <div style={{ display: "flex", alignItems: "center", gap: 6 }}><svg width={w} height={h}><polyline points={points} fill="none" stroke={color} strokeWidth={1.5} /></svg><span style={{ fontSize: 10, color, fontWeight: 700 }}>{prices[prices.length-1] < prices[0] ? "▼" : prices[prices.length-1] > prices[0] ? "▲" : "─"}</span></div>;
}

// ─── Card Components ──────────────────────────────────────────────────────────
function WhatsAppCard({ product, handle, cardRef }) {
  const discount = product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;
  const freeShip = product.shipping?.free_shipping || product.free_shipping;
  return (
    <div ref={cardRef} style={{ width: 400, background: BRAND.white, borderRadius: 20, overflow: "hidden", position: "relative", fontFamily: "'DM Sans', sans-serif", flexShrink: 0, boxShadow: "0 4px 32px rgba(44,50,86,0.12)", paddingBottom: 44 }}>
      <div style={{ height: 6, background: `linear-gradient(90deg, ${BRAND.pink}, ${BRAND.coral}, ${BRAND.yellow}, ${BRAND.sage})` }} />
      <div style={{ padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${BRAND.yellow}40` }}>
        <span style={{ color: BRAND.pink, fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}>✦ oferta especial</span>
        <span style={{ color: BRAND.navy, fontSize: 11, fontWeight: 600, opacity: 0.5 }}>{handle}</span>
      </div>
      <div style={{ margin: "10px 18px", height: 155, background: `linear-gradient(135deg, ${BRAND.yellow}18, ${BRAND.coral}12)`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", border: `2px solid ${BRAND.yellow}50`, overflow: "hidden" }}>
        {discount > 0 && (
          <div style={{ position: "absolute", top: 8, right: 8, background: `linear-gradient(135deg, ${BRAND.pink}, ${BRAND.coral})`, color: BRAND.white, borderRadius: 10, padding: "5px 10px", textAlign: "center", boxShadow: "0 4px 12px rgba(196,52,90,0.35)" }}>
            <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>-{discount}%</div>
            <div style={{ fontSize: 9, opacity: 0.9, letterSpacing: 1 }}>OFF</div>
          </div>
        )}
        {product.thumbnail ? (
          <img src={product.thumbnail?.replace("I.jpg","O.jpg") || product.thumbnail} alt="" crossOrigin="anonymous" style={{ maxHeight: 135, maxWidth: "80%", objectFit: "contain", filter: "drop-shadow(0 6px 16px rgba(44,50,86,0.15))" }} onError={e => e.target.style.display="none"} />
        ) : (
          <div style={{ color: `${BRAND.navy}40`, fontSize: 13, textAlign: "center" }}><div style={{ fontSize: 32, marginBottom: 6 }}>🛍️</div>Imagem do produto</div>
        )}
      </div>
      <div style={{ padding: "0 18px 11px" }}>
        <p style={{ color: BRAND.navy, fontSize: 13, lineHeight: 1.4, margin: "0 0 8px", fontWeight: 500, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{product.title}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {product.original_price && <span style={{ color: BRAND.coral, fontSize: 12, textDecoration: "line-through", fontWeight: 500 }}>R$ {product.original_price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>}
            <span style={{ color: BRAND.pink, fontSize: 28, fontWeight: 800, lineHeight: 1 }}>R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
          </div>
          {freeShip && <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: `${BRAND.sage}25`, border: `1.5px solid ${BRAND.sage}`, borderRadius: 20, padding: "3px 10px", color: BRAND.sage, fontSize: 10, fontWeight: 700 }}>🚚 FRETE GRÁTIS</div>}
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: `linear-gradient(135deg, ${BRAND.navy}, #3d4575)`, padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: BRAND.yellow, fontSize: 13, fontWeight: 700 }}>Link abaixo 👇</span>
        <span style={{ color: BRAND.white, fontSize: 11, opacity: 0.6 }}>{handle}</span>
      </div>
    </div>
  );
}

function StoriesCard({ product, handle, cardRef }) {
  const discount = product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;
  const freeShip = product.shipping?.free_shipping || product.free_shipping;
  return (
    <div ref={cardRef} style={{ width: 390, height: 693, background: BRAND.white, borderRadius: 24, overflow: "hidden", position: "relative", fontFamily: "'DM Sans', sans-serif", flexShrink: 0, boxShadow: "0 4px 32px rgba(44,50,86,0.12)" }}>
      <div style={{ position: "absolute", top: -80, right: -80, width: 280, height: 280, borderRadius: "50%", background: `${BRAND.pink}15`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 120, left: -50, width: 180, height: 180, borderRadius: "50%", background: `${BRAND.coral}10`, pointerEvents: "none" }} />
      <div style={{ height: 7, background: `linear-gradient(90deg, ${BRAND.pink}, ${BRAND.coral}, ${BRAND.yellow}, ${BRAND.sage})` }} />
      <div style={{ padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: BRAND.sage, fontSize: 10, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", marginBottom: 2 }}>✦ achado do dia</div>
          <div style={{ color: BRAND.navy, fontSize: 12, fontWeight: 600, opacity: 0.4 }}>{handle}</div>
        </div>
        {discount > 0 && (
          <div style={{ background: `linear-gradient(135deg, ${BRAND.pink}, ${BRAND.coral})`, color: BRAND.white, borderRadius: 14, padding: "10px 14px", textAlign: "center", boxShadow: "0 4px 16px rgba(196,52,90,0.3)" }}>
            <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>-{discount}%</div>
            <div style={{ fontSize: 9, letterSpacing: 2, opacity: 0.9 }}>DESCONTO</div>
          </div>
        )}
      </div>
      <div style={{ margin: "8px 22px", height: 300, background: `linear-gradient(135deg, ${BRAND.yellow}20, ${BRAND.coral}15, ${BRAND.pink}10)`, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${BRAND.yellow}60`, overflow: "hidden" }}>
        {product.thumbnail ? (
          <img src={product.thumbnail?.replace("I.jpg","O.jpg") || product.thumbnail} alt="" crossOrigin="anonymous" style={{ maxHeight: 270, maxWidth: "85%", objectFit: "contain", filter: "drop-shadow(0 12px 30px rgba(44,50,86,0.18))" }} onError={e => e.target.style.display="none"} />
        ) : (
          <div style={{ color: `${BRAND.navy}35`, fontSize: 13, textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 8 }}>🛍️</div>Imagem do produto</div>
        )}
      </div>
      <div style={{ padding: "14px 22px 10px" }}>
        <p style={{ color: BRAND.navy, fontSize: 15, lineHeight: 1.45, margin: 0, fontWeight: 500, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{product.title}</p>
      </div>
      <div style={{ margin: "0 22px 14px", background: `linear-gradient(135deg, ${BRAND.yellow}25, ${BRAND.coral}15)`, border: `1.5px solid ${BRAND.yellow}80`, borderRadius: 16, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          {product.original_price && <p style={{ color: BRAND.coral, opacity: 0.7, fontSize: 12, textDecoration: "line-through", margin: "0 0 3px", fontWeight: 500 }}>de R$ {product.original_price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>}
          <p style={{ color: BRAND.pink, fontSize: 36, fontWeight: 800, margin: 0, lineHeight: 1 }}>R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </div>
        {freeShip && <div style={{ background: `${BRAND.sage}20`, border: `1.5px solid ${BRAND.sage}`, borderRadius: 12, padding: "8px 12px", textAlign: "center", color: BRAND.sage }}><div style={{ fontSize: 18 }}>🚚</div><div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1 }}>GRÁTIS</div></div>}
      </div>
      <div style={{ padding: "0 22px", display: "flex", gap: 6, marginBottom: 12 }}>
        {[BRAND.pink, BRAND.coral, BRAND.yellow, BRAND.sage].map((c, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />)}
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: `linear-gradient(135deg, ${BRAND.navy}, #3d4575)`, padding: "24px 22px 24px 18px", display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
        <span style={{ color: BRAND.yellow, fontSize: 18, fontWeight: 800, letterSpacing: 1 }}>LINK AQUI 👉</span>
      </div>
    </div>
  );
}

// ─── Content Generator ────────────────────────────────────────────────────────
async function generateContent(product, channel, affiliateLink) {
  const discount = product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : product.discount || 0;
  const frete = (product.shipping?.free_shipping || product.free_shipping) ? "com FRETE GRÁTIS" : "";
  const price = product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const originalPrice = product.original_price ? product.original_price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : null;
  const prompts = {
    instagram: `Você é uma criadora de conteúdo de ofertas no Instagram. Tom: amigável, próxima, com emojis, CTA obrigatório, senso de urgência variado, às vezes engraçada. Crie uma legenda de Instagram:\n\nProduto: ${product.title}\nPreço: ${price}${originalPrice ? ` (era ${originalPrice})` : ""}\nDesconto: ${discount}%\n${frete}\nLink: ${affiliateLink || "[LINK AQUI]"}\n\nRegras: máx 150 palavras, emojis estratégicos, CTA claro (link na bio/stories), urgência, 5-8 hashtags no final.`,
    whatsapp: `Você é uma criadora de conteúdo de ofertas no WhatsApp. Crie uma mensagem curta para grupo de ofertas:\n\nProduto: ${product.title}\nPreço: ${price}${originalPrice ? ` (era ${originalPrice})` : ""}\nDesconto: ${discount}%\n${frete}\nLink: ${affiliateLink || "[LINK AQUI]"}\n\nRegras: máx 80 palavras, começa com emoji chamativo, destaca desconto e preço, link no final, urgência.`,
    tiktok: `Você é uma criadora de conteúdo de ofertas no TikTok. Crie um roteiro de vídeo 15-30 segundos:\n\nProduto: ${product.title}\nPreço: ${price}${originalPrice ? ` (era ${originalPrice})` : ""}\nDesconto: ${discount}%\n${frete}\nLink: ${affiliateLink || "[LINK NA BIO]"}\n\nFormato:\n[GANCHO 0-3s]: frase que prende atenção\n[CONTEXTO 3-10s]: cria identificação\n[PRODUTO 10-20s]: apresenta a oferta\n[CTA 20-30s]: chama para ação\nLegenda: (curta, emojis, hashtags)`
  };
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompts[channel] }] })
  });
  const data = await response.json();
  return data.content?.map(b => b.text).join("") || "Erro ao gerar conteúdo.";
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function MLAfiliada() {
  // ALL hooks must be declared before any conditional return
  const [authed, setAuthed] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [serverUrl, setServerUrl] = useState(() => { try { return localStorage.getItem("ml_server_url") || ""; } catch { return ""; } });
  const [serverStatus, setServerStatus] = useState("unchecked");
  const [showSettings, setShowSettings] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState("");
  const [criteria, setCriteria] = useState([]);
  const [products, setProducts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [showAddCriteria, setShowAddCriteria] = useState(false);
  const [newCriteria, setNewCriteria] = useState({ query: "", category: "", maxPrice: "", minDiscount: "" });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [affiliateLink, setAffiliateLink] = useState("");
  const [generatedContent, setGeneratedContent] = useState({});
  const [generatingFor, setGeneratingFor] = useState(null);
  const [copied, setCopied] = useState(null);
  const [localCriteria, setLocalCriteria] = useState(() => { try { return JSON.parse(localStorage.getItem("ml_local_criteria") || "[]"); } catch { return []; } });
  const [cardHandle, setCardHandle] = useState("@lumaachadosbr");
  const [cardImageUrl, setCardImageUrl] = useState("");
  const [cardTab, setCardTab] = useState("ambos");
  const [exportingCard, setExportingCard] = useState(null);
  const fileInputRef = useRef(null);
  const waRef = useRef(null);
  const igRef = useRef(null);

  const CREDENTIALS = { user: "luma", password: "Vidalongaluma10!" };

  const handleLogin = () => {
    if (loginUser.trim() === CREDENTIALS.user && loginPass === CREDENTIALS.password) {
      setAuthed(true);
    } else {
      setLoginError("Usuário ou senha incorretos.");
      setTimeout(() => setLoginError(""), 3000);
    }
  };

  const hasServer = serverUrl && serverStatus === "ok";

  const api = useCallback(async (path, method = "GET", body = null) => {
    const res = await fetch(serverUrl.replace(/\/$/, "") + path, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : null });
    return res.json();
  }, [serverUrl]);

  const checkServer = useCallback(async (url) => {
    try { const res = await fetch(url.replace(/\/$/, "") + "/"); const data = await res.json(); return data.status === "ok"; } catch { return false; }
  }, []);

  const saveServerUrl = async () => {
    const clean = serverUrlInput.trim();
    if (!clean) return;
    const ok = await checkServer(clean);
    if (ok) { setServerUrl(clean); try { localStorage.setItem("ml_server_url", clean); } catch {} setServerStatus("ok"); setShowSettings(false); }
    else setServerStatus("error");
  };

  useEffect(() => {
    if (serverUrl) { checkServer(serverUrl).then(ok => { setServerStatus(ok ? "ok" : "error"); setServerUrlInput(serverUrl); }); }
    else setShowSettings(true);
  }, []);

  const loadData = useCallback(async () => {
    if (!hasServer) return;
    setLoading(true); setLoadingMsg("Buscando critérios...");
    try {
      const [crit, prods, alts] = await Promise.all([api("/criteria"), (setLoadingMsg("Buscando ofertas..."), api("/products")), api("/alerts")]);
      setCriteria(crit);
      setProducts(prods.map(p => ({ ...p, _score: p.score || calcScore(p) })));
      setAlerts(alts);
    } catch {}
    setLoading(false);
  }, [hasServer, api]);

  useEffect(() => { if (hasServer) loadData(); }, [hasServer]);

  const fetchLocalProducts = useCallback(async (criteriaList) => {
    if (!criteriaList.length) return;
    setLoading(true); setLoadingMsg("Buscando ofertas...");
    const all = []; const seen = new Set();
    const PROXY = "https://corsproxy.io/?";
    for (const c of criteriaList) {
      try {
        let mlUrl = `https://api.mercadolibre.com/sites/MLB/search?limit=20&sort=price_asc`;
        if (c.query) mlUrl += `&q=${encodeURIComponent(c.query)}`;
        if (c.category) mlUrl += `&category=${c.category}`;
        const res = await fetch(PROXY + encodeURIComponent(mlUrl));
        const data = await res.json();
        let results = data.results || [];
        if (c.maxPrice) results = results.filter(p => p.price <= parseFloat(c.maxPrice));
        if (c.minDiscount && parseFloat(c.minDiscount) > 0) results = results.filter(p => { const d = p.original_price ? ((p.original_price - p.price) / p.original_price) * 100 : 0; return d >= parseFloat(c.minDiscount); });
        results.forEach(p => { if (!seen.has(p.id)) { seen.add(p.id); p._score = calcScore(p); p._criteriaLabel = c.query || CATEGORIES.find(cat => cat.id === c.category)?.label || "Busca"; all.push(p); } });
      } catch (e) { console.error("Erro ao buscar:", e); }
    }
    all.sort((a, b) => b._score - a._score);
    setProducts(all.slice(0, 20)); setLoading(false);
  }, []);

  useEffect(() => { if (!hasServer && localCriteria.length) fetchLocalProducts(localCriteria); }, [hasServer, localCriteria]);

  const addCriteria = async () => {
    if (!newCriteria.query && !newCriteria.category) return;
    if (hasServer) { await api("/criteria", "POST", newCriteria); await loadData(); }
    else { const u = [...localCriteria, { ...newCriteria, id: Date.now() }]; setLocalCriteria(u); try { localStorage.setItem("ml_local_criteria", JSON.stringify(u)); } catch {} fetchLocalProducts(u); }
    setNewCriteria({ query: "", category: "", maxPrice: "", minDiscount: "" }); setShowAddCriteria(false);
  };

  const removeCriteria = async (id) => {
    if (hasServer) { await api(`/criteria/${id}`, "DELETE"); await loadData(); }
    else { const u = localCriteria.filter(c => c.id !== id); setLocalCriteria(u); try { localStorage.setItem("ml_local_criteria", JSON.stringify(u)); } catch {} }
  };

  const dismissAlert = async (id) => {
    if (hasServer) await api(`/alerts/${id}`, "DELETE");
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const exportLocalCriteria = () => {
    const list = hasServer ? criteria : localCriteria;
    const blob = new Blob([JSON.stringify({ criteria: list, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "ml-afiliada-criterios.json"; a.click();
  };

  const importLocalCriteria = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { try { const p = JSON.parse(ev.target.result); if (p.criteria) { setLocalCriteria(p.criteria); try { localStorage.setItem("ml_local_criteria", JSON.stringify(p.criteria)); } catch {} fetchLocalProducts(p.criteria); } } catch {} };
    reader.readAsText(file); e.target.value = "";
  };

  const handleGenerate = async (channel) => {
    if (!selectedProduct) return;
    setGeneratingFor(channel);
    const content = await generateContent(selectedProduct, channel, affiliateLink);
    setGeneratedContent(prev => ({ ...prev, [channel]: content }));
    setGeneratingFor(null);
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 2000);
  };

  const exportCard = async (ref, filename, key) => {
    if (!ref.current) return;
    setExportingCard(key);
    try {
      if (!window.html2canvas) {
        await new Promise((resolve, reject) => { const s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"; s.onload = resolve; s.onerror = reject; document.head.appendChild(s); });
      }
      const canvas = await window.html2canvas(ref.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false });
      const link = document.createElement("a"); link.download = filename; link.href = canvas.toDataURL("image/png"); link.click();
    } catch { alert("Clique com botão direito no card → Salvar imagem como"); }
    setExportingCard(null);
  };

  // Card product: use selected product or blank
  const cardProduct = selectedProduct ? {
    ...selectedProduct,
    thumbnail: cardImageUrl || selectedProduct.thumbnail,
  } : { title: "Nome do produto aparece aqui", price: 0, original_price: null, thumbnail: cardImageUrl, free_shipping: false };

  const S = {
    app: { minHeight: "100vh", background: "#0f0f13", color: "#f0f0f5", fontFamily: "'Plus Jakarta Sans', sans-serif" },
    header: { background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", borderBottom: "1px solid #ffffff10", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
    logo: { fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#FFE600" },
    nav: { display: "flex", gap: 4, background: "#ffffff08", borderRadius: 12, padding: 4 },
    navBtn: (active) => ({ padding: "7px 14px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.15s", background: active ? "#FFE600" : "transparent", color: active ? "#0f0f13" : "#ffffff60" }),
    body: { maxWidth: 1100, margin: "0 auto", padding: "24px 16px" },
    card: { background: "#1a1a2e", border: "1px solid #ffffff0f", borderRadius: 16, overflow: "hidden" },
    btn: (v = "primary") => ({ padding: v === "sm" ? "6px 14px" : "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: v === "sm" ? 12 : 14, fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.15s", background: v === "primary" ? "#FFE600" : v === "danger" ? "#ff444420" : "#ffffff10", color: v === "primary" ? "#0f0f13" : v === "danger" ? "#ff4444" : "#fff" }),
    input: { padding: "10px 14px", borderRadius: 10, border: "1px solid #ffffff15", background: "#0f0f13", color: "#f0f0f5", fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif", outline: "none", width: "100%" },
    tag: (color = "#FFE600") => ({ display: "inline-block", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: color + "22", color, border: `1px solid ${color}44` }),
    cardTabBtn: (active) => ({ padding: "7px 14px", borderRadius: 9, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, background: active ? `linear-gradient(135deg, ${BRAND.pink}, ${BRAND.coral})` : "#ffffff10", color: active ? "#fff" : "#ffffff60" }),
  };

  const activeCriteria = hasServer ? criteria : localCriteria;

  // ─── Settings Modal ───────────────────────────────────────────────────────
  const SettingsModal = () => (
    <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ ...S.card, padding: 28, maxWidth: 480, width: "100%", border: "1px solid #FFE60033" }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#FFE600", marginBottom: 6 }}>⚙️ Configurações do Servidor</h3>
        <p style={{ color: "#ffffff60", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>Cole a URL do seu servidor Railway. Sem servidor, a ferramenta funciona no modo básico.</p>
        <label style={{ fontSize: 11, color: "#ffffff50", display: "block", marginBottom: 6 }}>URL DO SERVIDOR</label>
        <input style={{ ...S.input, marginBottom: 12 }} placeholder="https://seu-servidor.up.railway.app" value={serverUrlInput} onChange={e => setServerUrlInput(e.target.value)} />
        {serverStatus === "error" && <p style={{ color: "#ff4444", fontSize: 12, marginBottom: 10 }}>❌ Não consegui conectar. Verifique a URL.</p>}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button style={S.btn()} onClick={saveServerUrl}>Conectar servidor</button>
          {serverUrl && <button style={S.btn("ghost")} onClick={() => setShowSettings(false)}>Cancelar</button>}
        </div>
        <div style={{ borderTop: "1px solid #ffffff10", paddingTop: 16 }}>
          <button style={{ ...S.btn("ghost"), fontSize: 12 }} onClick={() => setShowSettings(false)}>Continuar no modo básico</button>
        </div>
      </div>
    </div>
  );

  // ─── Dashboard Tab ────────────────────────────────────────────────────────
  const DashboardTab = () => (
    <div>
      {!hasServer && (
        <div style={{ background: "#ffd60015", border: "1px solid #ffd60040", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#ffd600" }}>⚠️ Modo básico — sem servidor.</span>
          <button style={{ ...S.btn("sm"), background: "#ffd600", color: "#0f0f13" }} onClick={() => setShowSettings(true)}>Conectar servidor</button>
        </div>
      )}
      {alerts.slice(0, 3).map(a => (
        <div key={a.id} style={{ background: "#00c85315", border: "1px solid #00c85340", borderRadius: 12, padding: "12px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#00c853", marginBottom: 2 }}>📉 Queda de preço!</div>
            <div style={{ fontSize: 12, color: "#ffffff80" }}>{a.title?.slice(0, 60)}...</div>
            <div style={{ fontSize: 12, color: "#ffffff50", marginTop: 2 }}>R${a.old_price?.toFixed(2)} → <span style={{ color: "#00c853", fontWeight: 700 }}>R${a.new_price?.toFixed(2)}</span> (-{a.drop_pct}%)</div>
          </div>
          <button onClick={() => dismissAlert(a.id)} style={{ background: "none", border: "none", color: "#ffffff40", cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>
      ))}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[{ label: "Critérios ativos", value: activeCriteria.length, icon: "🎯" }, { label: "Produtos encontrados", value: products.length, icon: "📦" }, { label: "Virais (score ≥75)", value: products.filter(p => (p._score||0) >= 75).length, icon: "🔥" }, { label: "Alertas", value: alerts.length, icon: "🔔" }].map(s => (
          <div key={s.label} style={{ ...S.card, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#FFE600" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#ffffff40", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {loading && <div style={{ textAlign: "center", padding: 60 }}><div style={{ width: 40, height: 40, border: "3px solid #FFE60030", borderTop: "3px solid #FFE600", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><p style={{ color: "#ffffff50" }}>{loadingMsg}</p></div>}
      {!loading && activeCriteria.length === 0 && <div style={{ ...S.card, padding: 48, textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div><h3 style={{ fontFamily: "'Playfair Display', serif", color: "#FFE600", marginBottom: 8 }}>Nenhum critério ainda</h3><p style={{ color: "#ffffff50", marginBottom: 20, fontSize: 14 }}>Configure o que você quer monitorar na aba Critérios</p><button style={S.btn()} onClick={() => setTab("criteria")}>Configurar critérios →</button></div>}
      {!loading && products.length > 0 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#FFE600", margin: 0 }}>🏆 Top ofertas por potencial viral</h3>
            <button style={S.btn("ghost")} onClick={() => hasServer ? loadData() : fetchLocalProducts(localCriteria)}>🔄 Atualizar</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {products.map((p, i) => {
              const score = p._score || calcScore(p);
              const discount = p.original_price ? Math.round(((p.original_price - p.price) / p.original_price) * 100) : p.discount || 0;
              return (
                <div key={p.id} style={{ ...S.card, padding: 0, cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s", position: "relative" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 32px #FFE60015"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                  onClick={() => { setSelectedProduct(p); setAffiliateLink(""); setGeneratedContent({}); setCardImageUrl(""); setTab("content"); }}
                >
                  {i < 3 && <div style={{ position: "absolute", top: 10, left: 10, background: ["#FFE600","#C0C0C0","#CD7F32"][i], color: "#0f0f13", fontWeight: 800, fontSize: 11, borderRadius: 20, padding: "2px 8px", zIndex: 1 }}>#{i+1} TOP</div>}
                  <div style={{ background: "#ffffff08", height: 130, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={p.thumbnail?.replace("I.jpg","O.jpg") || p.thumbnail} alt="" style={{ maxHeight: 110, maxWidth: "85%", objectFit: "contain" }} onError={e => e.target.style.display="none"} />
                  </div>
                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <ScoreBadge score={score} />
                      {discount > 0 && <span style={S.tag("#ff6d00")}>-{discount}%</span>}
                    </div>
                    <p style={{ fontSize: 12, color: "#ffffff70", margin: "0 0 6px", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.title}</p>
                    {p.original_price && <p style={{ fontSize: 11, color: "#ffffff30", textDecoration: "line-through", margin: "0 0 2px" }}>R$ {p.original_price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>}
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#FFE600", margin: "0 0 8px" }}>R$ {p.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    {p.priceHistory?.length > 1 && <div style={{ marginBottom: 8 }}><PriceSparkline history={p.priceHistory} /></div>}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                      {(p.shipping?.free_shipping || p.free_shipping) && <span style={S.tag("#00c853")}>🚚 Frete grátis</span>}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <a href={p.permalink} target="_blank" rel="noopener noreferrer" style={{ ...S.btn("ghost"), fontSize: 11, padding: "6px 12px", textDecoration: "none", display: "inline-block" }} onClick={e => e.stopPropagation()}>Ver no ML ↗</a>
                      <button style={{ ...S.btn("sm"), background: "#FFE600", color: "#0f0f13" }}>✨ Criar post</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  // ─── Criteria Tab ─────────────────────────────────────────────────────────
  const renderCriteriaTab = () => (
    <div>
      <input type="file" accept=".json" ref={fileInputRef} style={{ display: "none" }} onChange={importLocalCriteria} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#FFE600", margin: 0 }}>Critérios de monitoramento</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {!hasServer && activeCriteria.length > 0 && <button style={{ ...S.btn("ghost"), fontSize: 12 }} onClick={exportLocalCriteria}>⬇️ Exportar</button>}
          {!hasServer && <button style={{ ...S.btn("ghost"), fontSize: 12 }} onClick={() => fileInputRef.current?.click()}>⬆️ Importar</button>}
          <button style={S.btn()} onClick={() => setShowAddCriteria(!showAddCriteria)}>+ Novo critério</button>
        </div>
      </div>
      {showAddCriteria && (
        <div style={{ ...S.card, padding: 20, marginBottom: 20, border: "1px solid #FFE60033" }}>
          <h4 style={{ margin: "0 0 16px", color: "#FFE600", fontFamily: "'Playfair Display', serif" }}>Novo critério</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: "#ffffff50", display: "block", marginBottom: 4 }}>PRODUTO / PALAVRA-CHAVE</label>
              <input
                style={S.input}
                placeholder='Ex: "iPhone 15"...'
                value={newCriteria.query}
                onChange={e => setNewCriteria(prev => ({ ...prev, query: e.target.value }))}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#ffffff50", display: "block", marginBottom: 4 }}>CATEGORIA</label>
              <select style={S.input} value={newCriteria.category} onChange={e => setNewCriteria(prev => ({ ...prev, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#ffffff50", display: "block", marginBottom: 4 }}>PREÇO MÁXIMO (R$)</label>
              <input
                style={S.input}
                type="number"
                placeholder="Ex: 500"
                value={newCriteria.maxPrice}
                onChange={e => setNewCriteria(prev => ({ ...prev, maxPrice: e.target.value }))}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#ffffff50", display: "block", marginBottom: 4 }}>DESCONTO MÍNIMO (%)</label>
              <input
                style={S.input}
                type="number"
                placeholder="Ex: 20"
                value={newCriteria.minDiscount}
                onChange={e => setNewCriteria(prev => ({ ...prev, minDiscount: e.target.value }))}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={S.btn()} onClick={addCriteria}>Salvar e monitorar</button>
            <button style={S.btn("ghost")} onClick={() => setShowAddCriteria(false)}>Cancelar</button>
          </div>
        </div>
      )}
      {activeCriteria.length === 0 && !showAddCriteria && (
        <div style={{ ...S.card, padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
          <p style={{ color: "#ffffff50", fontSize: 14 }}>Nenhum critério. Clique em "+ Novo critério" para começar.</p>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {activeCriteria.map(c => (
          <div key={c.id} style={{ ...S.card, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{c.query ? `🔍 "${c.query}"` : ""} {c.category ? CATEGORIES.find(cat => cat.id === c.category)?.label : ""}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {c.maxPrice && <span style={S.tag("#2196f3")}>≤ R${c.maxPrice}</span>}
                {c.minDiscount && <span style={S.tag("#ff6d00")}>≥ {c.minDiscount}% off</span>}
                <span style={S.tag("#00c853")}>✓ Ativo</span>
              </div>
            </div>
            <button style={S.btn("danger")} onClick={() => removeCriteria(c.id)}>Remover</button>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── Content Tab ──────────────────────────────────────────────────────────
  const ContentTab = () => (
    <div>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#FFE600", marginBottom: 20 }}>✨ Gerador de conteúdo</h3>
      {!selectedProduct ? (
        <div style={{ ...S.card, padding: 48, textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 12 }}>👆</div><p style={{ color: "#ffffff50", fontSize: 14 }}>Selecione um produto no Dashboard</p><button style={{ ...S.btn(), marginTop: 16 }} onClick={() => setTab("dashboard")}>← Ir ao Dashboard</button></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
          <div>
            <div style={{ ...S.card, padding: 16, marginBottom: 16 }}>
              <div style={{ background: "#ffffff08", borderRadius: 10, height: 120, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <img src={selectedProduct.thumbnail?.replace("I.jpg","O.jpg") || selectedProduct.thumbnail} alt="" style={{ maxHeight: 100, maxWidth: "85%", objectFit: "contain" }} onError={e => e.target.style.display="none"} />
              </div>
              <p style={{ fontSize: 12, color: "#ffffff70", marginBottom: 8, lineHeight: 1.4 }}>{selectedProduct.title}</p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#FFE600", margin: "0 0 8px" }}>R$ {selectedProduct.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              <ScoreBadge score={selectedProduct._score || calcScore(selectedProduct)} />
              <div style={{ marginTop: 10 }}>
                <a href={selectedProduct.permalink} target="_blank" rel="noopener noreferrer" style={{ ...S.btn("ghost"), textDecoration: "none", display: "block", textAlign: "center", fontSize: 12 }}>Abrir no ML ↗</a>
              </div>
            </div>
            <div style={{ ...S.card, padding: 16 }}>
              <label style={{ fontSize: 11, color: "#ffffff50", display: "block", marginBottom: 6 }}>SEU LINK DE AFILIADO</label>
              <input style={{ ...S.input, marginBottom: 6 }} placeholder="https://meli.la/..." value={affiliateLink} onChange={e => setAffiliateLink(e.target.value)} />
              <p style={{ fontSize: 11, color: "#ffffff30", margin: 0 }}>Gere no painel do ML e cole aqui</p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[{ key: "instagram", label: "📸 Instagram", color: "#e1306c" }, { key: "whatsapp", label: "💬 WhatsApp", color: "#25d366" }, { key: "tiktok", label: "🎵 TikTok", color: "#ff0050" }].map(ch => (
              <div key={ch.key} style={{ ...S.card, padding: 18, border: `1px solid ${ch.color}22` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{ch.label}</span>
                  <button style={{ ...S.btn("sm"), background: ch.color, opacity: generatingFor ? 0.7 : 1 }} onClick={() => handleGenerate(ch.key)} disabled={!!generatingFor}>{generatingFor === ch.key ? "Gerando..." : "✨ Gerar"}</button>
                </div>
                {generatedContent[ch.key] ? (
                  <div>
                    <textarea value={generatedContent[ch.key]} onChange={e => setGeneratedContent(prev => ({ ...prev, [ch.key]: e.target.value }))} style={{ ...S.input, minHeight: 120, resize: "vertical", lineHeight: 1.5 }} />
                    <button style={{ ...S.btn("ghost"), marginTop: 8, fontSize: 12 }} onClick={() => copyToClipboard(generatedContent[ch.key], ch.key)}>{copied === ch.key ? "✅ Copiado!" : "📋 Copiar"}</button>
                  </div>
                ) : (
                  <div style={{ background: "#ffffff05", borderRadius: 10, padding: 16, textAlign: "center", color: "#ffffff30", fontSize: 13 }}>Clique em "Gerar" para criar o conteúdo</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ─── Cards Tab ────────────────────────────────────────────────────────────
  const CardsTab = () => (
    <div>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#FFE600", marginBottom: 20 }}>🎨 Gerador de Cards</h3>
      {!selectedProduct && (
        <div style={{ background: "#ffd60015", border: "1px solid #ffd60030", borderRadius: 12, padding: "10px 16px", marginBottom: 16, fontSize: 13, color: "#ffd600" }}>
          💡 Selecione um produto no Dashboard para preencher o card automaticamente, ou preencha manualmente abaixo.
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>
        {/* Controls */}
        <div>
          <div style={{ ...S.card, padding: 18, marginBottom: 14 }}>
            <h4 style={{ color: "#FFE600", fontSize: 13, fontWeight: 700, marginBottom: 14 }}>📦 Dados do produto</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={{ fontSize: 10, color: "#ffffff45", display: "block", marginBottom: 4, letterSpacing: 1, textTransform: "uppercase" }}>URL da imagem</label>
                <input style={S.input} placeholder="https://..." value={cardImageUrl} onChange={e => setCardImageUrl(e.target.value)} />
                <p style={{ fontSize: 10, color: "#ffffff25", marginTop: 3 }}>No ML: botão direito na foto → "Copiar endereço da imagem"</p>
              </div>
              {selectedProduct && (
                <div style={{ background: "#ffffff08", borderRadius: 10, padding: "10px 12px" }}>
                  <p style={{ fontSize: 11, color: "#ffffff60", margin: "0 0 4px" }}>{selectedProduct.title.slice(0, 50)}...</p>
                  <p style={{ fontSize: 14, color: "#FFE600", fontWeight: 700, margin: 0 }}>R$ {selectedProduct.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </div>
              )}
            </div>
          </div>
          <div style={{ ...S.card, padding: 18, marginBottom: 14 }}>
            <h4 style={{ color: "#FFE600", fontSize: 13, fontWeight: 700, marginBottom: 10 }}>✍️ Seu @</h4>
            <input style={S.input} value={cardHandle} onChange={e => setCardHandle(e.target.value)} placeholder="@seuarroba" />
          </div>
          <div style={{ ...S.card, padding: 18 }}>
            <h4 style={{ color: "#FFE600", fontSize: 13, fontWeight: 700, marginBottom: 10 }}>🎨 Sua paleta</h4>
            <div style={{ display: "flex", gap: 6 }}>
              {[BRAND.pink, BRAND.coral, BRAND.yellow, BRAND.sage, BRAND.navy].map((c, i) => <div key={i} style={{ flex: 1, height: 20, borderRadius: 6, background: c, border: "1px solid #ffffff10" }} />)}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, justifyContent: "space-between", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={S.cardTabBtn(cardTab === "whatsapp")} onClick={() => setCardTab("whatsapp")}>💬 WhatsApp</button>
              <button style={S.cardTabBtn(cardTab === "stories")} onClick={() => setCardTab("stories")}>📸 Stories</button>
              <button style={S.cardTabBtn(cardTab === "ambos")} onClick={() => setCardTab("ambos")}>Ver ambos</button>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {(cardTab === "whatsapp" || cardTab === "ambos") && (
                <button style={{ ...S.btn("sm"), background: `linear-gradient(135deg, ${BRAND.pink}, ${BRAND.coral})`, opacity: exportingCard === "wa" ? 0.7 : 1 }} onClick={() => exportCard(waRef, "card-whatsapp-luma.png", "wa")} disabled={!!exportingCard}>
                  {exportingCard === "wa" ? "Exportando..." : "⬇️ WhatsApp"}
                </button>
              )}
              {(cardTab === "stories" || cardTab === "ambos") && (
                <button style={{ ...S.btn("sm"), background: `linear-gradient(135deg, ${BRAND.coral}, ${BRAND.yellow})`, color: "#0f0f13", opacity: exportingCard === "ig" ? 0.7 : 1 }} onClick={() => exportCard(igRef, "card-stories-luma.png", "ig")} disabled={!!exportingCard}>
                  {exportingCard === "ig" ? "Exportando..." : "⬇️ Stories"}
                </button>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start", overflowX: "auto", paddingBottom: 8 }}>
            {(cardTab === "whatsapp" || cardTab === "ambos") && (
              <div>
                <p style={{ fontSize: 10, color: "#ffffff30", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>WhatsApp — compacto vertical</p>
                <WhatsAppCard product={cardProduct} handle={cardHandle} cardRef={waRef} />
              </div>
            )}
            {(cardTab === "stories" || cardTab === "ambos") && (
              <div>
                <p style={{ fontSize: 10, color: "#ffffff30", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>Instagram Stories — 9:16</p>
                <StoriesCard product={cardProduct} handle={cardHandle} cardRef={igRef} />
              </div>
            )}
          </div>
          <p style={{ fontSize: 11, color: "#ffffff20", marginTop: 12 }}>💡 Cole a URL da imagem do produto no ML e clique em Salvar para baixar o PNG.</p>
        </div>
      </div>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f0f13", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 16 }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap'); *{box-sizing:border-box;margin:0;padding:0;}`}</style>
        <div style={{ background: "#1a1a2e", border: "1px solid #FFE60033", borderRadius: 24, padding: "40px 36px", width: "100%", maxWidth: 400, textAlign: "center" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 14 }}>
              {[BRAND.pink, BRAND.coral, BRAND.yellow, BRAND.sage].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#FFE600", marginBottom: 6 }}>ML Afiliada Pro</h1>
            <p style={{ color: "#ffffff50", fontSize: 13 }}>Acesso restrito — faça login para continuar</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            <input style={{ padding: "12px 16px", borderRadius: 12, border: "1.5px solid #ffffff15", background: "#0f0f13", color: "#f0f0f5", fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif", outline: "none", width: "100%" }} placeholder="Usuário" value={loginUser} onChange={e => setLoginUser(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} autoComplete="username" />
            <input style={{ padding: "12px 16px", borderRadius: 12, border: "1.5px solid #ffffff15", background: "#0f0f13", color: "#f0f0f5", fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif", outline: "none", width: "100%" }} placeholder="Senha" type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} autoComplete="current-password" />
          </div>
          {loginError && <p style={{ color: "#ff6b6b", fontSize: 13, marginBottom: 14 }}>{loginError}</p>}
          <button onClick={handleLogin} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 15, fontFamily: "'Plus Jakarta Sans', sans-serif", background: "linear-gradient(135deg, #FFE600, #FBBC52)", color: "#0f0f13" }}>
            Entrar →
          </button>
          <p style={{ color: "#ffffff20", fontSize: 11, marginTop: 20 }}>@lumaachadosbr • uso exclusivo</p>
        </div>
      </div>
    );
  }

  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        textarea, input, select { color-scheme: dark; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #FFE60050; border-radius: 2px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {showSettings && <SettingsModal />}

      <div style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🛒</span>
          <span style={S.logo}>ML Afiliada Pro</span>
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: hasServer ? "#00c85322" : "#ffd60022", color: hasServer ? "#00c853" : "#ffd600", border: `1px solid ${hasServer ? "#00c85344" : "#ffd60044"}` }}>
            {hasServer ? "● Servidor ativo" : "● Modo básico"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button style={{ ...S.btn("ghost"), fontSize: 12, padding: "6px 12px" }} onClick={() => setShowSettings(true)}>⚙️</button>
          <button style={{ ...S.btn("ghost"), fontSize: 12, padding: "6px 12px" }} onClick={() => setAuthed(false)}>🚪</button>
          <nav style={S.nav}>
            {[
              { key: "dashboard", label: "🏠 Dashboard" },
              { key: "criteria", label: "🎯 Critérios" },
              { key: "content", label: "✨ Conteúdo" },
              { key: "cards", label: "🎨 Cards" },
            ].map(t => (
              <button key={t.key} style={S.navBtn(tab === t.key)} onClick={() => setTab(t.key)}>{t.label}</button>
            ))}
          </nav>
        </div>
      </div>

      <div style={S.body}>
        {tab === "dashboard" && <DashboardTab />}
        {tab === "criteria" && renderCriteriaTab()}
        {tab === "content" && <ContentTab />}
        {tab === "cards" && <CardsTab />}
      </div>
    </div>
  );
}
