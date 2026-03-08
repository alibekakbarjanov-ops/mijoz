/* ==========================================================
   SOF SHOP — app.js
   ✅ Auth         — Firebase Email/Password (o'zgarishsiz)
   ✅ Ma'lumotlar  — PostgreSQL backend  http://localhost:4000/api
                     (Firebase Realtime DB o'rniga)
   ✅ Profile, Regions, Catalog
   ✅ Products, Favorites, Cart
   ✅ Receipt + Orders
   ✅ Ads slider
   ✅ Admin / Driver (secret code orqali)
========================================================== */

/* ── Firebase Auth (faqat login uchun) ── */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBscHNUMxO99kiqJFcDT-aIA9m3r_o2Pyg",
  authDomain: "sofmebel-e44bb.firebaseapp.com",
  projectId: "sofmebel-e44bb",
  storageBucket: "sofmebel-e44bb.firebasestorage.app",
  messagingSenderId: "876873009974",
  appId: "1:876873009974:web:1246fcc90f5297259f8197",
  measurementId: "G-PWWPTS1256"
};

const fbApp = initializeApp(firebaseConfig);
const auth  = getAuth(fbApp);

/* ─────────────────────────────────────────────────────────
   ⚙  URL — dev da localhost, prod da o'zi topadi
───────────────────────────────────────────────────────── */
const BASE = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "http://94.230.232.245:8080"
  : location.origin;
const API        = BASE + "/api";
const SOCKET_URL = BASE;


/* ═══════════════════════════════════════
   API HELPER
═══════════════════════════════════════ */
async function apiFetch(method, path, body) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res  = await fetch(API + path, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Server xatosi");
    return data;
  } catch (err) {
    if (err.message === "Failed to fetch")
      throw new Error("Server bilan ulanib bo'lmadi. node server.js ishga tushirilganmi?");
    throw err;
  }
}
const apiGet  = p      => apiFetch("GET",    p);
const apiPost = (p, b) => apiFetch("POST",   p, b);
const apiPut  = (p, b) => apiFetch("PUT",    p, b);
const apiDel  = (p, b) => apiFetch("DELETE", p, b);

/* ═══════════════════════════════════════
   DATA
═══════════════════════════════════════ */
const REGIONS = {
  "Toshkent shahri": ["Uchtepa","Chilonzor","Yunusobod","Mirzo Ulug'bek","Sergeli","Yakkasaroy","Shayxontohur","Olmazor","Mirobod","Yashnobod","Bektemir"],
  "Toshkent viloyati": ["Bekobod tumani","Bo'ka tumani","Bo'stonliq tumani","Chinoz tumani","Ohangaron tumani","Oqqo'rg'on tumani","O'rta Chirchiq tumani","Parkent tumani","Piskent tumani","Qibray tumani","Quyi Chirchiq tumani","Toshkent tumani","Yangiyo'l tumani","Yuqori Chirchiq tumani","Zangiota tumani"],
  "Samarqand viloyati": ["Samarqand tumani","Urgut tumani","Toyloq tumani","Jomboy tumani","Paxtachi tumani","Ishtixon tumani","Kattaqo'rg'on tumani"],
  "Andijon viloyati": ["Andijon tumani","Asaka tumani","Baliqchi tumani","Marhamat tumani","Shahrixon tumani","Xo'jaobod tumani","Qo'rg'ontepa tumani"],
  "Farg'ona viloyati": ["Farg'ona tumani","Quva tumani","Rishton tumani","Qo'shtepa tumani","Oltiariq tumani","Toshloq tumani","Beshariq tumani"],
  "Namangan viloyati": ["Namangan tumani","Chortoq tumani","Chust tumani","Pop tumani","To'raqo'rg'on tumani","Uchqo'rg'on tumani"],
  "Buxoro viloyati": ["Buxoro tumani","G'ijduvon tumani","Jondor tumani","Kogon tumani","Olot tumani","Romitan tumani"],
  "Xorazm viloyati": ["Urganch tumani","Hazorasp tumani","Qo'shko'pir tumani","Shovot tumani","Gurlan tumani"],
  "Qashqadaryo viloyati": ["Qarshi tumani","Shahrisabz tumani","Yakkabog' tumani","G'uzor tumani","Koson tumani"],
  "Surxondaryo viloyati": ["Termiz tumani","Denov tumani","Sherobod tumani","Sho'rchi tumani","Boysun tumani"],
  "Sirdaryo viloyati": ["Guliston tumani","Boyovut tumani","Sardoba tumani","Sayxunobod tumani","Xovos tumani"],
  "Jizzax viloyati": ["Jizzax tumani","Zomin tumani","Forish tumani","Paxtakor tumani","Do'stlik tumani"],
  "Navoiy viloyati": ["Karmana tumani","Qiziltepa tumani","Xatirchi tumani","Nurota tumani","Uchquduq tumani"],
  "Qoraqalpog'iston": ["Nukus","Qo'ng'irot tumani","Beruniy tumani","To'rtko'l tumani","Xo'jayli tumani"]
};

const CATALOGS = {
  "🛏️ Mebellar": {
    "🛏️ Yotoqxona mebellari": [], "🛋️ Mexmonxona mebellari": [], "🛋️ Yumshoq mebellari": [],
    "🍽️ Stol-stul": [], "🍴 Oshxona mebellari": [], "👶 Bolalar mebellari": [],
    "💼 Ofis mebellari": [], "🚪 Shkaflar": []
  },
  "🎨 Aksesuarlar": { "🪞 Oynalar": [], "🖼️ Kartinalar": [] },
  "📺 Maishiy texnikalar": {
    "❄️ Muzlatkich": [], "🧼 Kir yuvish mashinalari": [], "🔥 Gaz plitalari": [],
    "🌀 Konditsionerlar": [], "🧹 Chok mashinalar": [], "🔌 Boshqa maishiy texnikalar": []
  },
  "🏃 Sport texnikalari": {
    "🏃‍♂️ Yugurish yo'lakchalari": [], "🚴 Velo trenajor": [], "💆‍♂️ Massajnoy kreslo": []
  },
  "📱 Telefonlar": { "📱 Samsung": [], "📱 Redmi": [], "📱 Honor": [] }
};

/* ═══════════════════════════════════════
   HELPERS
═══════════════════════════════════════ */
const $       = id => document.getElementById(id);
const show    = el => el && el.classList.remove("hidden");
const hide    = el => el && el.classList.add("hidden");
const nowMs   = () => Date.now();
const safeNum = x  => Number(x || 0) || 0;
const fmt     = n  => (Number(n) || 0).toLocaleString("uz-UZ") + " so'm";

function esc(s) {
  return String(s ?? "")
    .replaceAll("&","&amp;").replaceAll("<","&lt;")
    .replaceAll(">","&gt;").replaceAll('"',"&quot;");
}
function toast(msg, ms = 2800) {
  const t = $("toast");
  if (!t) return;
  t.style.whiteSpace = "pre-line";
  t.textContent = msg; show(t);
  clearTimeout(toast._t);
  toast._t = setTimeout(() => hide(t), ms);
}
function setMsg(el, msg) {
  if (!el) return;
  el.textContent = msg; show(el);
  clearTimeout(setMsg._t);
  setMsg._t = setTimeout(() => hide(el), 4200);
}

/* ═══════════════════════════════════════
   STATE
═══════════════════════════════════════ */
const state = {
  user: null, profile: null,
  products: [], productsMap: {},
  favorites: {}, cart: {},
  adsProducts: [], adIndex: 0, adTimer: null,
  view: "home", homeFilter: "all", search: "",
  catalogLevel: "root", cat: null, sub: null,
  adminTab: "add", orderMode: "active", openProductId: null,
  userOrders: [], allOrders: [],
  socket: null,  // Socket.io ulanish
};

/* ═══════════════════════════════════════
   POLLING — 8-15 soniyada yangilash
═══════════════════════════════════════ */
const polls = {};
function startPoll(key, fn, ms = 10000) {
  stopPoll(key);
  const safe = () => Promise.resolve().then(fn).catch(e => console.warn("poll[" + key + "]:", e?.message));
  safe();
  polls[key] = setInterval(safe, ms);
}
function stopPoll(key)  { if (polls[key]) { clearInterval(polls[key]); delete polls[key]; } }
function stopAllPolls() { Object.keys(polls).forEach(stopPoll); }

/* ═══════════════════════════════════════
   SOCKET.IO — REALTIME
═══════════════════════════════════════ */
function initSocket(user) {
  // Eski socket bo'lsa yop
  if (state.socket) { state.socket.disconnect(); state.socket = null; }

  // Socket.io CDN dan dinamik import
  const script = document.createElement("script");
  script.src = "https://cdn.socket.io/4.7.5/socket.io.min.js";
  script.onload = () => {
    // eslint-disable-next-line no-undef
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    });
    state.socket = socket;

    socket.on("connect", () => {
      console.log("🔌 Socket ulandi:", socket.id);
      // Foydalanuvchi xonasiga qo'shilish
      socket.emit("join", { role: "customer", uid: user.uid });
      updateSocketIndicator(true);
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket uzildi");
      updateSocketIndicator(false);
    });

    socket.on("connect_error", () => {
      updateSocketIndicator(false);
    });

    /* ── Buyurtma hodisalari ── */

    // Mening buyurtmam yo'lga chiqdi
    socket.on("my_order_updated", data => {
      const idx = state.userOrders.findIndex(o => o.orderId === data.orderId);
      if (idx !== -1) {
        if (data.status === "on_way")    state.userOrders[idx].status.onWay      = true;
        if (data.status === "delivered") state.userOrders[idx].status.delivered  = true;
      }
      renderOrders();
      // Bildirishnoma chiqarish
      if (data.status === "on_way")    { toast("🚗 Buyurtmangiz yo'lga chiqdi!"); vibrate(); }
      if (data.status === "delivered") { toast("✅ Buyurtmangiz yetib keldi!"); vibrate(); }
    });

    // Yangi buyurtma tasdiqlandi (o'zimizniki)
    socket.on("order_created", data => {
      state.userOrders.unshift(data);
      renderOrders();
    });

    // Mahsulot tugadi — real vaqtda kartani kulrang qilish
    socket.on("product_out_of_stock", ({ productId }) => {
      const p = state.productsMap[productId];
      if (p) {
        p.stock = 0;
        renderHome(); renderCatalog();
        if (state.view === "product" && state.openProductId === productId) renderProduct(productId);
      }
    });

    // Mahsulot restok qilindi
    socket.on("product_restocked", ({ productId, stock }) => {
      const p = state.productsMap[productId];
      if (p) {
        p.stock = stock;
        renderHome(); renderCatalog();
        if (state.view === "product" && state.openProductId === productId) renderProduct(productId);
      }
    });
  };
  document.head.appendChild(script);
}

function disconnectSocket() {
  if (state.socket) { state.socket.disconnect(); state.socket = null; }
  updateSocketIndicator(false);
}

function updateSocketIndicator(connected) {
  const dot = $("socketDot");
  if (dot) {
    dot.classList.toggle("connected", connected);
    dot.title = connected ? "Realtime: Ulangan ✅" : "Realtime: Uzilgan";
  }
}

function vibrate() {
  if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
}

/* ═══════════════════════════════════════
   ROUTER
═══════════════════════════════════════ */
function go(view) {
  state.view = view;
  ["home","catalog","cart","fav","profile","product","admin","driver"].forEach(v => hide($(`view-${v}`)));
  show($(`view-${view}`));
  document.querySelectorAll(".navBtn").forEach(b => b.classList.toggle("active", b.dataset.go === view));
  if (view === "home")    { renderAds(); renderHome(); }
  if (view === "catalog") { state.catalogLevel = "root"; state.cat = null; state.sub = null; renderCatalog(); }
  if (view === "cart")    { renderCart(); }
  if (view === "fav")     { renderFav(); }
  if (view === "profile") { renderProfile(); renderOrders(); }
  if (view === "product" && state.openProductId) renderProduct(state.openProductId);
  if (view === "admin")   { setAdminTab(state.adminTab); }
  if (view === "driver")  { renderDriverOrders(); }
}

/* ═══════════════════════════════════════
   REGIONS UI
═══════════════════════════════════════ */
function initRegionsUI() {
  const reg = $("regRegion"), dis = $("regDistrict");
  if (!reg || !dis) return;
  reg.innerHTML = Object.keys(REGIONS).map(r => `<option value="${esc(r)}">${esc(r)}</option>`).join("");
  const fill = () => {
    dis.innerHTML = (REGIONS[reg.value] || []).map(d => `<option value="${esc(d)}">${esc(d)}</option>`).join("");
  };
  reg.addEventListener("change", fill); fill();
}

/* ═══════════════════════════════════════
   AUTH UI
═══════════════════════════════════════ */

// Registratsiya jarayonida onAuthStateChanged ni bir marta o'tkazib yuborish uchun flag
let _justRegistered = false;

function initAuthUI() {
  $("tabLogin")?.addEventListener("click", () => {
    $("tabLogin").classList.add("active"); $("tabReg").classList.remove("active");
    show($("loginForm")); hide($("regForm")); hide($("authMsg"));
  });
  $("tabReg")?.addEventListener("click", () => {
    $("tabReg").classList.add("active"); $("tabLogin").classList.remove("active");
    hide($("loginForm")); show($("regForm")); hide($("authMsg"));
  });

  /* ── LOGIN ── */
  $("loginForm")?.addEventListener("submit", async e => {
    e.preventDefault(); hide($("authMsg"));
    const btn = $("loginForm").querySelector("button[type=submit]");
    if (btn) { btn.disabled = true; btn.textContent = "⏳ Kirilmoqda..."; }
    try {
      await signInWithEmailAndPassword(auth, $("loginEmail").value.trim(), $("loginPass").value);
    } catch (err) {
      setMsg($("authMsg"), err?.message || "Login xato");
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "Kirish"; }
    }
  });

  /* ── REGISTER ── */
  $("regForm")?.addEventListener("submit", async e => {
    e.preventDefault(); hide($("authMsg"));

    const firstName = $("regFirst")?.value.trim()  || "";
    const lastName  = $("regLast")?.value.trim()   || "";
    const phone     = $("regPhone")?.value.trim()  || "";
    const email     = $("regEmail")?.value.trim()  || "";
    const pass      = $("regPass")?.value          || "";
    const lang      = $("regLang")?.value          || "uz";
    const region    = $("regRegion")?.value        || "";
    const district  = $("regDistrict")?.value      || "";

    if (!firstName || !lastName) { setMsg($("authMsg"), "Ism va familiya kiritilmagan"); return; }
    if (!email)                  { setMsg($("authMsg"), "Email kiritilmagan"); return; }
    if (pass.length < 6)         { setMsg($("authMsg"), "Parol kamida 6 ta belgi bo'lsin"); return; }

    const btn = $("regForm").querySelector("button[type=submit]");
    const resetBtn = () => { if (btn) { btn.disabled = false; btn.textContent = "Ro'yxatdan o'tish"; } };
    if (btn) { btn.disabled = true; btn.textContent = "⏳ Saqlanmoqda..."; }

    _justRegistered = true;
    try {
      const regData = { email, firstName, lastName, phone, lang, region, district };

      // Firebase da yaratish
      const cred = await createUserWithEmailAndPassword(auth, email, pass);

      // Backendga saqlash
      await syncUser(cred.user, regData);

      // Muvaffaqiyat — onAuthStateChanged endi ishga tushadi
      _justRegistered = false;
      toast("Ro'yxatdan o'tildi ✅");

      // Qo'lda ilovaga o'tkazamiz (onAuthStateChanged kutmasdan)
      hide($("auth")); show($("app"));
      state.user = cred.user;
      await Promise.all([fetchProducts(), fetchFavorites(), fetchCart(), fetchAds()]);
      await fetchUserOrders();
      startPoll("products",   fetchProducts,   20000);
      startPoll("favorites",  fetchFavorites,  20000);
      startPoll("cart",       fetchCart,       20000);
      startPoll("ads",        fetchAds,        20000);
      startPoll("userOrders", fetchUserOrders, 20000);
      // ✅ Socket + GPS + Notif
      connectSocket();
      startAutoGPS();
      requestNotifPermission();
      go("home");

    } catch (err) {
      _justRegistered = false;
      resetBtn();
      setMsg($("authMsg"), err?.message || "Register xato");
    }
  });

  $("logout")?.addEventListener("click", () => signOut(auth));
}

/* ═══════════════════════════════════════
   PROFILE
═══════════════════════════════════════ */
function genCustomerId() {
  return String(Math.floor(1000000 + Math.random() * 9000000));
}

async function syncUser(user, regData = null) {
  // 1. Avval backenddan mavjud profilni olishga harakat qilamiz
  try {
    const existing = await apiGet("/users/" + user.uid);
    if (existing && existing.uid) {
      state.profile = existing;
      return existing;
    }
  } catch { /* topilmadi — yangi foydalanuvchi */ }

  // 2. Profil topilmadi — bu yangi foydalanuvchi
  //    Agar regData berilmagan bo'lsa — xato
  if (!regData) {
    throw new Error("Profil topilmadi. Iltimos qaytadan ro'yxatdan o'ting.");
  }

  // 3. Yangi profil yaratish
  const profile = {
    uid:        user.uid,
    customerId: genCustomerId(),
    email:      regData.email      || user.email || "",
    firstName:  regData.firstName  || "",
    lastName:   regData.lastName   || "",
    phone:      regData.phone      || "",
    lang:       regData.lang       || "uz",
    region:     regData.region     || "",
    district:   regData.district   || "",
  };

  await apiPost("/users/sync", profile);
  state.profile = profile;
  return profile;
}

function renderProfile() {
  if (state.view !== "profile") return;
  const p = state.profile;
  if (!p) { if($("profileBox")) $("profileBox").textContent = "Profil topilmadi"; return; }
  if (!$("profileBox")) return;
  $("profileBox").innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
      <div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#e11d2e,#f97316);color:#fff;font-size:22px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">${(p.firstName?.[0]||"U").toUpperCase()}</div>
      <div>
        <div style="font-weight:700;font-size:17px">${esc(p.firstName||"")} ${esc(p.lastName||"")}</div>
        <div class="muted" style="font-size:12px">ID: <b>${esc(p.customerId||"—")}</b></div>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(0,0,0,.06)"><span class="muted">📞 Telefon</span><span>${esc(p.phone||"—")}</span></div>
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(0,0,0,.06)"><span class="muted">✉️ Email</span><span style="word-break:break-all">${esc(p.email||"—")}</span></div>
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(0,0,0,.06)"><span class="muted">📍 Viloyat</span><span>${esc(p.region||"—")}</span></div>
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(0,0,0,.06)"><span class="muted">🏘 Tuman</span><span>${esc(p.district||"—")}</span></div>
    <div style="display:flex;justify-content:space-between;padding:8px 0"><span class="muted">🌐 Til</span><span>${esc(p.lang||"uz")}</span></div>`;
}

/* ═══════════════════════════════════════
   SEARCH
═══════════════════════════════════════ */
function initSearch() {
  $("search")?.addEventListener("input", e => {
    const v = (e.target.value || "").trim();
    if (v === ADMIN_CODE)  { e.target.value = ""; state.search = ""; toast("ADMIN ✅");  go("admin");  return; }
    if (v === DRIVER_CODE) { e.target.value = ""; state.search = ""; toast("SHOFER ✅"); go("driver"); return; }
    state.search = v; renderAds(); renderHome();
  });
}

/* ═══════════════════════════════════════
   PRODUCTS
═══════════════════════════════════════ */
function isNew(p)      { return safeNum(p.newUntil) > nowMs(); }
function finalPrice(p) {
  const d = safeNum(p.discountPercent);
  return d > 0 ? Math.round(safeNum(p.price) * (100 - d) / 100) : safeNum(p.price);
}

async function fetchProducts() {
  try {
    const arr = await apiGet("/products");
    arr.sort((a, b) => safeNum(b.createdAt) - safeNum(a.createdAt));
    state.products    = arr;
    state.productsMap = Object.fromEntries(arr.map(p => [p.id, p]));
    renderHome(); renderCatalog(); renderAds(); renderFav();
    if (state.view === "cart")    renderCart();
    if (state.view === "product" && state.openProductId) renderProduct(state.openProductId);
    if (state.view === "admin"   && state.adminTab === "list") renderAdminList();
    if (state.view === "admin"   && state.adminTab === "ads")  renderAdsPicker();
  } catch (err) { console.error("Products:", err.message); }
}

function matchesHome(p) {
  const q = (state.search || "").toLowerCase();
  if (q && !(p.name||"").toLowerCase().includes(q) && !(p.code||"").toLowerCase().includes(q)) return false;
  if (state.homeFilter === "discount") return safeNum(p.discountPercent) > 0;
  if (state.homeFilter === "new")      return isNew(p);
  return true;
}

function productCard(p) {
  const img  = p.images?.[0] || "";
  const fav  = !!state.favorites?.[p.id];
  const disc = safeNum(p.discountPercent);
  const badge = disc > 0 ? `${disc}%` : (isNew(p) ? "NEW" : (p.code || ""));
  const oos  = safeNum(p.stock) <= 0;
  return `
    <div class="cardP${oos?" soldout":""}" data-open="${esc(p.id)}">
      ${oos
        ? `<div class="outOfStockBanner">Tugagan</div>`
        : `<button class="cartBtn" data-cart="${esc(p.id)}" type="button">🛒</button>`}
      <button class="favBtn ${fav?"active":""}" data-fav="${esc(p.id)}" type="button">${fav?"❤️":"🤍"}</button>
      <div class="pImg">${img ? `<img src="${img}">` : ""}</div>
      <div class="pBody">
        <div class="pName">${esc(p.name||"—")}</div>
        ${safeNum(p.soldCount) > 0 ? `<div style="font-size:11px;color:#aaa">${safeNum(p.soldCount)} ta sotildi</div>` : ""}
        <div class="pMeta">
          <div class="price">${fmt(finalPrice(p))}</div>
          <div class="${(disc>0||isNew(p))?"badge red":"badge"}">${esc(badge)}</div>
        </div>
      </div>
    </div>`;
}

function bindProductGrid(c) {
  if (!c) return;
  c.querySelectorAll("[data-open]").forEach(el => { el.onclick = () => openProduct(el.dataset.open); });
  c.querySelectorAll("[data-fav]").forEach(el  => { el.onclick = e => { e.stopPropagation(); toggleFav(el.dataset.fav); }; });
  c.querySelectorAll("[data-cart]").forEach(el => { el.onclick = e => { e.stopPropagation(); addToCart(el.dataset.cart, 1); }; });
}

function renderHome() {
  if (state.view !== "home") return;
  const list = state.products.filter(matchesHome);
  $("homeGrid").innerHTML = list.map(productCard).join("");
  bindProductGrid($("homeGrid"));
  if (!list.length) show($("homeEmpty")); else hide($("homeEmpty"));
}

/* ═══════════════════════════════════════
   PRODUCT DETAIL
═══════════════════════════════════════ */
function openProduct(id) { state.openProductId = id; window.scrollTo(0,0); go("product"); }

function renderProduct(id) {
  const p = state.productsMap[id];
  if (!p || !$("productBox")) return;
  const imgs   = (p.images || []).slice(0, 10);
  const colors = (p.colors || "").split(",").map(s => s.trim()).filter(Boolean);
  const fav    = !!state.favorites?.[id];
  const oos    = safeNum(p.stock) <= 0;

  // Gallery
  const galleryHtml = imgs.length ? `
    <div style="position:relative;width:100%;aspect-ratio:16/9;background:#f5f5f5;border-radius:10px;overflow:hidden;margin-bottom:8px">
      <img id="mainProdImg" src="${imgs[0]}" style="width:100%;height:100%;object-fit:contain"/>
      ${oos ? `<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(0deg,rgba(0,0,0,.7),transparent);color:#fff;text-align:center;padding:16px 8px 6px;font-size:12px;font-weight:700">⚠ Tugagan</div>` : ""}
    </div>
    ${imgs.length > 1 ? `<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;margin-bottom:6px">
      ${imgs.map((u,i)=>`<img data-ti="${i}" src="${u}" style="width:64px;height:48px;object-fit:cover;border-radius:6px;border:2px solid ${i===0?"#e11d2e":"#ddd"};cursor:pointer;flex:0 0 auto">`).join("")}
    </div>` : ""}` : `<div class="muted" style="text-align:center;padding:20px">Rasm yo'q</div>`;

  // Installment
  const instHtml = (p.price3m || p.price6m || p.price12m) ? `
    <div style="margin-top:12px">
      <div style="font-weight:600;margin-bottom:6px">📅 Muddatli to'lov:</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${p.price3m  ? `<button class="instBtn" data-mo="3"  data-mn="${safeNum(p.price3m)}"  type="button">3 oy</button>`  : ""}
        ${p.price6m  ? `<button class="instBtn" data-mo="6"  data-mn="${safeNum(p.price6m)}"  type="button">6 oy</button>`  : ""}
        ${p.price12m ? `<button class="instBtn" data-mo="12" data-mn="${safeNum(p.price12m)}" type="button">12 oy</button>` : ""}
      </div>
      <div id="instInfoBox" style="display:none;margin-top:8px;padding:10px 12px;background:rgba(225,29,46,.08);border-radius:8px;font-size:14px"></div>
    </div>` : "";

  $("productBox").innerHTML = `
    ${galleryHtml}
    <div class="row between" style="margin-top:6px">
      <div>
        <div class="h2">${esc(p.name||"—")}</div>
        <div class="muted">Kod: <b>${esc(p.code||"—")}</b></div>
        ${safeNum(p.soldCount)>0?`<div style="font-size:12px;color:#aaa">🛒 ${safeNum(p.soldCount)} ta sotildi</div>`:""}
      </div>
      <button class="pill ${fav?"danger":""}" id="pfav" type="button">${fav?"❤️":"🤍"}</button>
    </div>
    <div class="row between" style="margin-top:8px">
      <div class="price" style="font-size:18px">${fmt(finalPrice(p))}</div>
      <div class="badge ${safeNum(p.discountPercent)>0||isNew(p)?"red":""}">
        ${safeNum(p.discountPercent)>0?`${safeNum(p.discountPercent)}% CHEGIRMA`:(isNew(p)?"NEW":"ODDIY")}
      </div>
    </div>
    ${instHtml}
    ${colors.length?`<div style="margin-top:10px"><b>Ranglar:</b> ${colors.map(c=>`<span class="badge">${esc(c)}</span>`).join(" ")}</div>`:""}
    <div style="margin-top:10px"><b>Tavsif</b></div>
    <div class="muted" style="margin-top:6px">${esc(p.desc||"—")}</div>
    ${oos
      ? `<div style="margin-top:12px;padding:10px 12px;background:#fee2e2;border-radius:8px;color:#b91c1c;font-weight:600">⚠ Hozircha mavjud emas — tez orada keladi</div>`
      : `<div class="row" style="margin-top:12px">
          <button class="btn primary" id="buyNow" type="button">Buyurtma</button>
          <button class="pill" id="addCartBtn" type="button">🛒 Savatga</button>
        </div>`}`;

  $("pfav").onclick = () => toggleFav(id);
  if (!oos) {
    $("addCartBtn").onclick = () => addToCart(id, 1);
    $("buyNow").onclick     = () => { addToCart(id, 1); go("cart"); };
  }

  // Thumb gallery click
  $("productBox").querySelectorAll("[data-ti]").forEach(img => {
    img.onclick = () => {
      $("mainProdImg").src = img.src;
      $("productBox").querySelectorAll("[data-ti]").forEach(t => t.style.borderColor = "#ddd");
      img.style.borderColor = "#e11d2e";
    };
  });

  // Installment click
  $("productBox").querySelectorAll(".instBtn").forEach(btn => {
    btn.onclick = () => {
      $("productBox").querySelectorAll(".instBtn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const mo = safeNum(btn.dataset.mo), mn = safeNum(btn.dataset.mn);
      const box = $("instInfoBox");
      if (box) { box.style.display = "block"; box.innerHTML = `<b>${mo} oy × ${fmt(mn)} = ${fmt(mo*mn)}</b>`; }
    };
  });

  // Reviews
  renderProductReviews(id);

  const same = state.products.filter(x => x.id!==id && x.category===p.category && x.subcategory===p.subcategory).slice(0,14);
  $("sameGrid").innerHTML = same.map(productCard).join("");
  bindProductGrid($("sameGrid"));
}

async function renderProductReviews(productId) {
  const box = $("productReviews");
  if (!box) return;
  try {
    const reviews = await apiGet("/reviews/" + productId);
    if (!reviews.length) {
      box.innerHTML = `
        <div style="margin-top:14px;padding:16px;background:#fafafa;border-radius:14px;border:1px dashed #e5e5e5;text-align:center">
          <div style="font-size:22px;margin-bottom:4px">💬</div>
          <div style="font-size:13px;color:#aaa">Hali sharh yo'q</div>
        </div>`;
      return;
    }

    // Avatar initials helper
    const initials = r => ((r.firstName||"?")[0] + (r.lastName||"")[0]).toUpperCase();
    const avatarColors = ["#f97316","#e11d2e","#8b5cf6","#06b6d4","#10b981","#f59e0b"];
    const avatarColor  = r => avatarColors[(r.firstName||"A").charCodeAt(0) % avatarColors.length];

    box.innerHTML = `
      <div style="margin-top:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <span style="font-weight:700;font-size:15px">💬 Sharhlar</span>
          <span style="font-size:12px;color:#aaa;background:#f5f5f5;padding:2px 10px;border-radius:20px">${reviews.length} ta</span>
        </div>
        <div style="display:flex;gap:10px;overflow-x:auto;padding-bottom:10px;-webkit-overflow-scrolling:touch;scrollbar-width:none">
          ${reviews.map(r => `
            <div style="flex:0 0 240px;background:#fff;border:1px solid #f0f0f0;border-radius:16px;padding:14px;box-shadow:0 2px 8px rgba(0,0,0,.06)">
              <!-- Header -->
              <div style="display:flex;align-items:center;gap:9px;margin-bottom:10px">
                <div style="width:36px;height:36px;border-radius:50%;background:${avatarColor(r)};color:#fff;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0">${initials(r)}</div>
                <div>
                  <div style="font-weight:600;font-size:13px;line-height:1.2">${esc(r.firstName||"")} ${esc(r.lastName||"")}</div>
                  <div style="font-size:11px;color:#bbb">${new Date(r.createdAt).toLocaleDateString("uz-UZ")}</div>
                </div>
              </div>
              <!-- Pros -->
              ${r.pros ? `
              <div style="margin-bottom:7px">
                <div style="font-size:10px;font-weight:700;color:#15803d;letter-spacing:.5px;margin-bottom:3px;text-transform:uppercase">Afzalliklari</div>
                <div style="font-size:12px;color:#166534;background:#f0fdf4;border-left:3px solid #22c55e;padding:6px 8px;border-radius:0 8px 8px 0;line-height:1.4">${esc(r.pros)}</div>
              </div>` : ""}
              <!-- Cons -->
              ${r.cons ? `
              <div style="margin-bottom:7px">
                <div style="font-size:10px;font-weight:700;color:#b91c1c;letter-spacing:.5px;margin-bottom:3px;text-transform:uppercase">Kamchiliklari</div>
                <div style="font-size:12px;color:#991b1b;background:#fff5f5;border-left:3px solid #ef4444;padding:6px 8px;border-radius:0 8px 8px 0;line-height:1.4">${esc(r.cons)}</div>
              </div>` : ""}
              <!-- Comment -->
              ${r.comment ? `
              <div style="font-size:12px;color:#555;line-height:1.5;margin-top:4px;padding-top:8px;border-top:1px solid #f0f0f0">${esc(r.comment)}</div>` : ""}
            </div>`).join("")}
        </div>
      </div>`;
  } catch { box.innerHTML = ""; }
}

/* ═══════════════════════════════════════
   CATALOG
═══════════════════════════════════════ */
function initCatalogBack() {
  $("catBack")?.addEventListener("click", () => {
    if (state.catalogLevel==="products") state.catalogLevel="sub";
    else if (state.catalogLevel==="sub") { state.catalogLevel="root"; state.cat=null; state.sub=null; }
    renderCatalog();
  });
}

function renderCatalog() {
  if (state.view!=="catalog" || !$("catalogList")) return;
  const list = $("catalogList"), back = $("catBack");
  if (state.catalogLevel==="root") {
    hide(back);
    list.innerHTML = Object.keys(CATALOGS).map(cat=>`
      <div class="item" data-cat="${esc(cat)}">
        <div class="left"><div class="thumb"></div>
          <div><div class="t1">${esc(cat)}</div><div class="t2">Sub-kataloglar</div></div>
        </div><div class="pill">→</div>
      </div>`).join("");
    list.querySelectorAll("[data-cat]").forEach(el=>{
      el.onclick=()=>{ state.cat=el.dataset.cat; state.catalogLevel="sub"; renderCatalog(); };
    }); return;
  }
  if (state.catalogLevel==="sub") {
    show(back);
    list.innerHTML = Object.keys(CATALOGS[state.cat]||{}).map(sub=>`
      <div class="item" data-sub="${esc(sub)}">
        <div class="left"><div class="thumb"></div>
          <div><div class="t1">${esc(sub)}</div><div class="t2">${esc(state.cat)}</div></div>
        </div><div class="pill">→</div>
      </div>`).join("");
    list.querySelectorAll("[data-sub]").forEach(el=>{
      el.onclick=()=>{ state.sub=el.dataset.sub; state.catalogLevel="products"; renderCatalog(); };
    }); return;
  }
  show(back);
  const prods = state.products.filter(p=>p.category===state.cat && p.subcategory===state.sub);
  list.innerHTML = `
    <div class="h2" style="margin-top:4px">${esc(state.cat)} → ${esc(state.sub)}</div>
    <div class="grid" id="catGrid">${prods.map(productCard).join("")}</div>
    ${prods.length?"":` <div class="empty">Mahsulot yo'q</div>`}`;
  bindProductGrid(list);
}

/* ═══════════════════════════════════════
   FAVORITES
═══════════════════════════════════════ */
async function fetchFavorites() {
  if (!state.user) return;
  try {
    const arr = await apiGet("/favorites/" + state.user.uid);
    state.favorites = Object.fromEntries(arr.map(p=>[p.id, true]));
    renderHome(); renderFav();
  } catch (err) { console.error("Favorites:", err.message); }
}

async function toggleFav(pid) {
  if (!state.user) return;
  if (state.favorites?.[pid]) {
    await apiDel("/favorites", { uid: state.user.uid, productId: pid });
    delete state.favorites[pid]; toast("Sevimlidan o'chirildi");
  } else {
    await apiPost("/favorites", { uid: state.user.uid, productId: pid });
    state.favorites[pid] = true; toast("Sevimlilarga qo'shildi");
  }
  renderHome(); renderFav();
  if (state.view==="product") renderProduct(state.openProductId);
}

function renderFav() {
  if (state.view!=="fav" || !$("favGrid")) return;
  const list = Object.keys(state.favorites).map(id=>state.productsMap[id]).filter(Boolean);
  $("favGrid").innerHTML = list.map(p=>`
    <div class="cardP" data-open="${esc(p.id)}">
      <button class="favBtn active" data-fav="${esc(p.id)}" type="button">❤️</button>
      <div class="pImg">${p.images?.[0]?`<img src="${p.images[0]}">`:""}</div>
      <div class="pBody">
        <div class="pName">${esc(p.name||"—")}</div>
        <div class="pMeta"><div class="price">${fmt(finalPrice(p))}</div><div class="badge">${esc(p.code||"")}</div></div>
      </div>
    </div>`).join("");
  if (!list.length) show($("favEmpty")); else hide($("favEmpty"));
  bindProductGrid($("favGrid"));
}

/* ═══════════════════════════════════════
   CART
═══════════════════════════════════════ */
async function fetchCart() {
  if (!state.user) return;
  try {
    const arr = await apiGet("/cart/" + state.user.uid);
    state.cart = {};
    arr.forEach(item => { state.cart[item.id] = { qty: item.qty, color: item.color }; });
    renderCart(); renderHome();
  } catch (err) { console.error("Cart:", err.message); }
}

function cartItems() {
  return Object.entries(state.cart||{}).map(([pid, it])=>{
    const p = state.productsMap[pid];
    if (!p) return null;
    const qty=safeNum(it.qty)||1, unit=finalPrice(p);
    return { pid, p, qty, unit, sum: unit*qty };
  }).filter(Boolean);
}
function cartTotal() { return cartItems().reduce((a,b)=>a+b.sum,0); }

async function addToCart(pid, addQty) {
  if (!state.user) return;
  const newQty = Math.max(1, (state.cart[pid]?.qty || 0) + addQty);
  await apiPost("/cart", { uid: state.user.uid, productId: pid, qty: newQty });
  state.cart[pid] = { qty: newQty };
  renderCart(); toast("Savatga qo'shildi");
}

async function setQty(pid, qty) {
  if (!state.user) return;
  if (qty <= 0) {
    await apiDel("/cart", { uid: state.user.uid, productId: pid });
    delete state.cart[pid];
  } else {
    await apiPost("/cart", { uid: state.user.uid, productId: pid, qty });
    state.cart[pid] = { qty };
  }
  renderCart();
}

function initCartButtons() {
  $("cartClear")?.addEventListener("click", async ()=>{
    if (!state.user) return;
    await apiDel("/cart", { uid: state.user.uid });
    state.cart = {}; renderCart(); toast("Savat tozalandi");
  });
}

function renderCart() {
  if (state.view!=="cart" || !$("cartList")) return;
  const list = cartItems();
  $("cartList").innerHTML = list.map(x=>{
    const img = x.p.images?.[0]||"";
    return `
      <div class="item">
        <div class="left">
          <div class="thumb">${img?`<img src="${img}">`:""}</div>
          <div>
            <div class="t1">${esc(x.p.name||"—")}</div>
            <div class="t2">Kod: ${esc(x.p.code||"—")} • ${fmt(x.unit)}</div>
          </div>
        </div>
        <div class="row">
          <div class="qty">
            <button class="qb" data-dec="${esc(x.pid)}" type="button">−</button>
            <b>${x.qty}</b>
            <button class="qb" data-inc="${esc(x.pid)}" type="button">+</button>
          </div>
          <button class="del" data-del="${esc(x.pid)}" type="button">🗑</button>
        </div>
      </div>`;
  }).join("");
  $("cartTotal").textContent = fmt(cartTotal());
  $("cartPreview").innerHTML = list.length
    ? list.map(x=>`• ${esc(x.p.name)} (${x.qty}x) = ${fmt(x.sum)}`).join("<br>")
    : "Savat bo'sh";
  $("cartList").querySelectorAll("[data-inc]").forEach(b=>{ b.onclick=()=>setQty(b.dataset.inc,(state.cart[b.dataset.inc]?.qty||1)+1); });
  $("cartList").querySelectorAll("[data-dec]").forEach(b=>{ b.onclick=()=>setQty(b.dataset.dec,(state.cart[b.dataset.dec]?.qty||1)-1); });
  $("cartList").querySelectorAll("[data-del]").forEach(b=>{ b.onclick=()=>setQty(b.dataset.del,0); });
}

/* ═══════════════════════════════════════
   RECEIPT + ORDERS
═══════════════════════════════════════ */
function receiptHtml(order) {
  const u=order.user||{}, items=order.items||[];
  return `
    <div style="display:flex;justify-content:space-between;gap:10px">
      <div><div><b>SOF SHOP CHEK</b></div>
        ${order.orderId?`<div class="muted">OrderID: <b>${esc(order.orderId)}</b></div>`:""}
        <div class="muted">${new Date().toLocaleString()}</div>
      </div>
      <div><b>ID:</b> ${esc(order.customerId||"—")}</div>
    </div>
    <hr style="border:none;height:1px;background:rgba(11,11,15,.10);margin:10px 0">
    <div class="muted"><b>Mijoz</b></div>
    <div style="display:flex;justify-content:space-between"><span>F.I.Sh</span><b>${esc((u.firstName||"")+" "+(u.lastName||""))}</b></div>
    <div style="display:flex;justify-content:space-between"><span>Tel</span><span>${esc(u.phone||"—")}</span></div>
    <div style="display:flex;justify-content:space-between"><span>Lokatsiya</span><span>${esc((u.region||"")+", "+(u.district||""))}</span></div>
    <hr style="border:none;height:1px;background:rgba(11,11,15,.10);margin:10px 0">
    <div class="muted"><b>Mahsulotlar</b></div>
    ${items.map(it=>`
      <div style="margin-top:8px">
        <div style="display:flex;justify-content:space-between"><b>${esc(it.name||"")}</b><b>${fmt(safeNum(it.price)*safeNum(it.qty))}</b></div>
        <div class="muted" style="font-size:12px">Kod: ${esc(it.code||"—")} • ${safeNum(it.qty)||1} dona • ${fmt(it.price||0)}</div>
      </div>`).join("")}
    <hr style="border:none;height:1px;background:rgba(11,11,15,.10);margin:10px 0">
    <div style="display:flex;justify-content:space-between"><b>Jami</b><b>${fmt(order.total||0)}</b></div>`;
}

function initReceiptModal() {
  $("receiptClose")?.addEventListener("click", ()=>hide($("receiptModal")));
  $("receiptModal")?.addEventListener("click", e=>{ if(e.target===$("receiptModal")) hide($("receiptModal")); });
  $("agree")?.addEventListener("change", ()=>{
    const ok = $("agree").checked && cartItems().length>0;
    $("sendOrder").disabled=!ok; $("sendOrder").classList.toggle("disabled",!ok);
  });
  $("openReceipt")?.addEventListener("click", ()=>{
    if (!state.profile) { toast("Profil topilmadi"); return; }
    const items = cartItems();
    if (!items.length) { toast("Savat bo'sh"); return; }
    // Stock tekshiruv
    const errors = [];
    for (const it of items) {
      const p = state.productsMap[it.pid];
      if (!p) continue;
      const avail = safeNum(p.stock);
      if (avail <= 0) {
        errors.push(`❌ "${p.name}" — tugagan`);
      } else if (it.qty > avail) {
        errors.push(`⚠ "${p.name}"\nHozirda ${avail} ta bor, siz ${it.qty} ta so'radingiz.\nBuyurtmani kamaytiring yoki mahsulot kelguncha kuting.`);
      }
    }
    if (errors.length) { toast(errors.join("\n\n"), 6000); return; }
    $("receiptBox").innerHTML = receiptHtml({
      orderId: null, customerId: state.profile.customerId,
      user: { firstName:state.profile.firstName, lastName:state.profile.lastName,
              phone:state.profile.phone, region:state.profile.region,
              district:state.profile.district, email:state.profile.email },
      items: items.map(x=>({ productId:x.pid, name:x.p.name||"", code:x.p.code||"", price:x.unit, qty:x.qty })),
      total: cartTotal()
    });
    $("agree").checked=false; $("sendOrder").disabled=true; $("sendOrder").classList.add("disabled");
    show($("receiptModal"));
  });
  $("sendOrder")?.addEventListener("click", async ()=>{
    if (!$("agree").checked) return;
    const items = cartItems();
    if (!items.length) { toast("Savat bo'sh"); return; }
    $("sendOrder").disabled=true; $("sendOrder").classList.add("disabled");
    await createOrder(items);
    hide($("receiptModal")); $("agree").checked=false;
    toast("Buyurtma yuborildi ✅");
  });
}

async function createOrder(items) {
  if (!state.user || !state.profile) return;
  try {
    await apiPost("/orders", {
      userUid: state.user.uid, customerId: state.profile.customerId, total: cartTotal(),
      items: items.map(x=>({ productId:x.pid, name:x.p.name||"", code:x.p.code||"", price:x.unit, qty:x.qty })),
      userData: { firstName:state.profile.firstName, lastName:state.profile.lastName,
                  phone:state.profile.phone, region:state.profile.region,
                  district:state.profile.district, email:state.profile.email,
                  lat: state.profile.lat  || null,
                  lng: state.profile.lng  || null }
    });
    await apiDel("/cart", { uid: state.user.uid });
    state.cart = {}; renderCart(); fetchUserOrders();
  } catch (err) {
    toast("❌ " + err.message);
    $("sendOrder").disabled=false; $("sendOrder").classList.remove("disabled");
  }
}

/* ═══════════════════════════════════════
   ORDERS — foydalanuvchi
═══════════════════════════════════════ */
async function fetchUserOrders() {
  if (!state.user) return;
  try { state.userOrders = await apiGet("/my-orders/" + state.user.uid); renderOrders(); }
  catch (err) { console.error("UserOrders:", err.message); }
}

function initOrdersButtons() {
  $("btnActiveOrders")?.addEventListener("click", ()=>{
    state.orderMode="active"; $("btnActiveOrders").classList.add("active"); $("btnHistoryOrders").classList.remove("active"); renderOrders();
  });
  $("btnHistoryOrders")?.addEventListener("click", ()=>{
    state.orderMode="history"; $("btnHistoryOrders").classList.add("active"); $("btnActiveOrders").classList.remove("active"); renderOrders();
  });
}

function renderOrders() {
  if (state.view!=="profile" || !$("ordersList")) return;
  const arr  = [...state.userOrders].sort((a,b)=>safeNum(b.createdAt)-safeNum(a.createdAt));
  const list = state.orderMode==="history" ? arr.filter(o=>o.status?.delivered) : arr.filter(o=>!o.status?.delivered);
  $("ordersList").innerHTML = list.map(o=>{
    const s=o.status||{};
    const st = s.delivered?"✅ Yetib keldi":(s.onWay?"🚚 Yo'lda":"⏳ Buyurtma berildi");
    const rvBtns = s.delivered ? (o.items||[]).map(it=>`
      <button class="pill" data-rv="${esc(it.productId)}" data-ro="${esc(o.orderId)}" data-rn="${esc(it.name||"")}" type="button" style="font-size:11px;margin-top:4px">⭐ ${esc(it.name||"")}</button>`).join("") : "";
    return `
      <div class="item">
        <div style="flex:1">
          <div class="t1">Buyurtma • <b>${esc(o.orderId)}</b></div>
          <div class="t2">${st} • Jami: <b>${fmt(o.total||0)}</b></div>
          ${rvBtns ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">${rvBtns}</div>` : ""}
        </div>
        <button class="pill" data-oview="${esc(o.orderId)}" type="button">👁</button>
      </div>`;
  }).join("");
  $("ordersList").querySelectorAll("[data-oview]").forEach(b=>{
    b.onclick=()=>{ const o=state.userOrders.find(x=>x.orderId===b.dataset.oview); if(o) openOrderView(o); };
  });
  $("ordersList").querySelectorAll("[data-rv]").forEach(b=>{
    b.onclick=()=>openReviewModal(b.dataset.rv, b.dataset.ro, b.dataset.rn);
  });
  if (!list.length) show($("ordersEmpty")); else hide($("ordersEmpty"));
}

/* ═══════════════════════════════════════
   ORDER VIEW MODAL
═══════════════════════════════════════ */
function initOrderViewModal() {
  $("orderViewClose")?.addEventListener("click", ()=>hide($("orderViewModal")));
  $("orderViewModal")?.addEventListener("click", e=>{ if(e.target===$("orderViewModal")) hide($("orderViewModal")); });
}
function openOrderView(order) { $("orderViewBox").innerHTML=receiptHtml(order); show($("orderViewModal")); }

/* ═══════════════════════════════════════
   ADS
═══════════════════════════════════════ */
async function fetchAds() {
  try { state.adsProducts = await apiGet("/ads"); renderAds(); }
  catch (err) { console.error("Ads:", err.message); }
}

function renderAds() {
  if (state.view!=="home" || !$("ads")) return;
  if (state.search || !state.adsProducts.length) {
    hide($("ads")); clearInterval(state.adTimer); state.adTimer=null; return;
  }
  show($("ads"));
  const ads = state.adsProducts;
  $("ads").innerHTML = `
    ${ads.map((p,i)=>`
      <div class="adSlide ${i===0?"active":""}" data-adopen="${esc(p.id)}">
        <div class="adInner">
          <div class="adPic">${p.images?.[0]?`<img src="${p.images[0]}">`:""}</div>
          <div class="adInfo">
            <div class="adTitle">${esc(p.name||"—")}</div>
            <div class="adSub">Kod: ${esc(p.code||"—")} • ${fmt(finalPrice(p))}</div>
          </div>
        </div>
      </div>`).join("")}
    <div class="adDots">${ads.map((_,i)=>`<div class="dot ${i===0?"active":""}" data-idx="${i}"></div>`).join("")}</div>`;

  const slides = Array.from($("ads").querySelectorAll(".adSlide"));
  const dots   = Array.from($("ads").querySelectorAll(".dot"));
  const setIdx = i => {
    slides.forEach((s,idx)=>s.classList.toggle("active",idx===i));
    dots.forEach((d,idx)=>d.classList.toggle("active",idx===i));
    state.adIndex=i;
  };
  slides.forEach(s=>s.onclick=()=>openProduct(s.dataset.adopen));
  dots.forEach(d=>d.onclick=()=>setIdx(Number(d.dataset.idx)));
  clearInterval(state.adTimer);
  state.adTimer=setInterval(()=>setIdx((state.adIndex+1)%slides.length),5000);
}

/* ═══════════════════════════════════════
   ADMIN
═══════════════════════════════════════ */
function setAdminTab(tab) {
  state.adminTab=tab;
  document.querySelectorAll(".tab2").forEach(b=>b.classList.toggle("active",b.dataset.atab===tab));
  ["add","list","orders","ads","archive"].forEach(x=>hide($(`admin-${x}`)));
  show($(`admin-${tab}`));
  if(tab==="list")    renderAdminList();
  if(tab==="orders")  renderAdminOrders();
  if(tab==="ads")     renderAdsPicker();
  if(tab==="archive") renderAdminArchive();
}
function initAdminTabs() {
  document.querySelectorAll(".tab2").forEach(b=>{ b.onclick=()=>setAdminTab(b.dataset.atab); });
  $("adminBack")?.addEventListener("click",()=>go("home"));
}

function initAdminProductForm() {
  if(!$("productForm")) return;
  $("pCat").innerHTML = Object.keys(CATALOGS).map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("");
  const fillSub=()=>{ $("pSub").innerHTML=Object.keys(CATALOGS[$("pCat").value]||{}).map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join(""); };
  $("pCat").onchange=fillSub; fillSub();
  $("pType").onchange=()=>{ if($("pType").value==="new") show($("newBox")); else hide($("newBox")); };
  $("imgInputs").innerHTML=""; addImgInput("");
  $("addImg")?.addEventListener("click",()=>addImgInput(""));
  $("cancelEdit")?.addEventListener("click",resetAdminForm);
  $("adminSearch")?.addEventListener("input",renderAdminList);
  $("productForm").addEventListener("submit", async e=>{
    e.preventDefault(); hide($("adminMsg"));
    try {
      const editId=($("editId").value||"").trim(), payload=buildProductPayload();
      const dup=state.products.find(x=>(x.code||"").toLowerCase()===payload.code.toLowerCase()&&x.id!==editId);
      if(dup) throw new Error("Kod unikal bo'lsin!");
      if(editId) { await apiPut("/products/"+editId,payload); toast("Yangilandi ✅"); }
      else       { await apiPost("/products",payload);        toast("Saqlandi ✅");   }
      await fetchProducts(); resetAdminForm(); setAdminTab("list");
    } catch(err) { setMsg($("adminMsg"),err?.message||"Xatolik"); }
  });
}

function addImgInput(val) {
  const box=$("imgInputs");
  if(!box) return;
  if(box.querySelectorAll("input[data-img]").length>=10){toast("Max 10 rasm");return;}
  const w=document.createElement("div");
  w.innerHTML=`<input data-img="1" placeholder="https://..." value="${esc(val||"")}">`;
  box.appendChild(w);
  w.querySelector("input").oninput=renderImgPreview; renderImgPreview();
}
function readImages() {
  return Array.from($("imgInputs")?.querySelectorAll("input[data-img]")||[]).map(i=>i.value.trim()).filter(Boolean).slice(0,10);
}
function renderImgPreview() {
  const pv=$("imgPreview"); if(!pv) return;
  pv.innerHTML=readImages().map((u,idx)=>`
    <div class="imgTile"><img src="${u}"><button class="imgX" data-x="${idx}" type="button">✕</button></div>`).join("");
  pv.querySelectorAll("[data-x]").forEach(btn=>{
    btn.onclick=()=>{
      const inputs=Array.from($("imgInputs").querySelectorAll("input[data-img]")).filter(i=>i.value.trim());
      if(inputs[Number(btn.dataset.x)]) inputs[Number(btn.dataset.x)].value="";
      cleanupImgInputs(); renderImgPreview();
    };
  });
}
function cleanupImgInputs() {
  const box=$("imgInputs"); if(!box) return;
  const filled=Array.from(box.querySelectorAll("input[data-img]")).map(i=>i.value.trim()).filter(Boolean);
  box.innerHTML="";
  if(!filled.length) addImgInput(""); else filled.forEach(v=>addImgInput(v));
}
function buildProductPayload() {
  const type=$("pType").value, disc=safeNum($("pDiscount").value), newDays=safeNum($("pNewDays").value)||1;
  if(type==="discount"&&disc<=0) throw new Error("Chegirma % kiriting (1..90).");
  if(type==="new"&&newDays<1)    throw new Error("Yangi kun kamida 1.");
  return {
    name:$("pName").value.trim(), code:$("pCode").value.trim(),
    price:safeNum($("pPrice").value), discountPercent:type==="discount"?disc:0,
    newUntil:type==="new"?(nowMs()+newDays*86400000):0,
    category:$("pCat").value, subcategory:$("pSub").value,
    colors:$("pColors").value.trim(), desc:$("pDesc").value.trim(), images:readImages(),
  };
}
function resetAdminForm() {
  $("editId").value=""; $("adminHint").textContent="Yangi mahsulot"; hide($("cancelEdit"));
  $("productForm").reset(); $("pType").value="normal"; hide($("newBox"));
  $("imgInputs").innerHTML=""; addImgInput(""); renderImgPreview();
}
function renderAdminList() {
  if(state.view!=="admin"||state.adminTab!=="list"||!$("adminProducts")) return;
  const q=($("adminSearch").value||"").trim().toLowerCase();
  const list=state.products.filter(p=>!q||(p.name||"").toLowerCase().includes(q)||(p.code||"").toLowerCase().includes(q));
  $("adminProducts").innerHTML=list.map(p=>{
    const img=p.images?.[0]||"", disc=safeNum(p.discountPercent);
    return `
      <div class="item">
        <div class="left">
          <div class="thumb">${img?`<img src="${img}">`:""}</div>
          <div>
            <div class="t1">${esc(p.name||"—")}</div>
            <div class="t2">Kod: <b>${esc(p.code||"—")}</b> • ${fmt(finalPrice(p))}</div>
            <div class="t2">${esc(p.category||"")} → ${esc(p.subcategory||"")} ${isNew(p)?"• NEW":""} ${disc>0?`• ${disc}%`:""}</div>
          </div>
        </div>
        <div class="row">
          <button class="pill" data-edit="${esc(p.id)}" type="button">✏️</button>
          <button class="pill danger" data-del="${esc(p.id)}" type="button">🗑</button>
        </div>
      </div>`;
  }).join("")||`<div class="empty">Mahsulot yo'q</div>`;
  $("adminProducts").querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>startEdit(b.dataset.edit));
  $("adminProducts").querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>deleteProduct(b.dataset.del));
}
function startEdit(id) {
  const p=state.productsMap[id]; if(!p) return;
  $("editId").value=id; $("adminHint").textContent="Tahrirlash: "+(p.name||""); show($("cancelEdit"));
  $("pName").value=p.name||""; $("pCode").value=p.code||""; $("pPrice").value=safeNum(p.price);
  const type=safeNum(p.discountPercent)>0?"discount":(isNew(p)?"new":"normal");
  $("pType").value=type; $("pDiscount").value=safeNum(p.discountPercent);
  if(type==="new"){ show($("newBox")); $("pNewDays").value=Math.max(1,Math.ceil(Math.max(0,safeNum(p.newUntil)-nowMs())/86400000)); }
  else { hide($("newBox")); $("pNewDays").value=1; }
  $("pCat").value=p.category||$("pCat").value; $("pCat").dispatchEvent(new Event("change"));
  $("pSub").value=p.subcategory||""; $("pColors").value=p.colors||""; $("pDesc").value=p.desc||"";
  $("imgInputs").innerHTML=""; (p.images?.length?p.images:[""]).slice(0,10).forEach(u=>addImgInput(u));
  cleanupImgInputs(); renderImgPreview(); setAdminTab("add");
}
async function deleteProduct(id) {
  if(!confirm("O'chirasizmi?")) return;
  try { await apiDel("/products/"+id); await fetchProducts(); toast("O'chirildi ✅"); }
  catch(err) { toast("❌ "+err.message); }
}
function renderAdsPicker() {
  if(state.view!=="admin"||state.adminTab!=="ads"||!$("adsPick")) return;
  const sel=new Set(state.adsProducts.map(p=>p.id));
  $("adsPick").innerHTML=state.products.map(p=>{
    const img=p.images?.[0]||"";
    return `
      <div class="item">
        <div class="left">
          <div class="thumb">${img?`<img src="${img}">`:""}</div>
          <div><div class="t1">${esc(p.name||"—")}</div><div class="t2">${fmt(finalPrice(p))} • Kod: ${esc(p.code||"")}</div></div>
        </div>
        <input type="checkbox" data-ad="${esc(p.id)}" ${sel.has(p.id)?"checked":""}/>
      </div>`;
  }).join("")||`<div class="empty">Mahsulot yo'q</div>`;
}
function initAdsSave() {
  $("saveAds")?.addEventListener("click", async ()=>{
    try {
      const ids=Array.from($("adsPick").querySelectorAll("input[data-ad]:checked")).map(ch=>ch.dataset.ad);
      await apiPost("/ads",{productIds:ids}); await fetchAds();
      setMsg($("adsMsg"),"Reklama saqlandi ✅");
    } catch(err) { setMsg($("adsMsg"),err?.message||"Xatolik"); }
  });
}

/* ═══════════════════════════════════════
   ORDERS — Admin / Driver
═══════════════════════════════════════ */
async function fetchAllOrders() {
  try {
    state.allOrders = await apiGet("/orders");
    if(state.view==="admin")  { renderAdminOrders(); renderAdminArchive(); }
    if(state.view==="driver") { renderDriverOrders(); }
  } catch(err) { console.error("AllOrders:",err.message); }
}
async function adminTickOnWay(orderId) {
  const o=state.allOrders.find(x=>x.orderId===orderId); if(!o) return;
  await apiPut("/orders/"+orderId+"/assign",{ driverId:o.assignedDriver||"manual", driverName:o.driverName||"—" });
  await fetchAllOrders(); toast("Mijoz: Yo'lda ✅");
}
async function driverTickDelivered(orderId) {
  await apiPut("/orders/"+orderId+"/delivered",{});
  await fetchAllOrders(); toast("Mijoz: Yetib keldi ✅");
}
function renderAdminOrders() {
  if(state.view!=="admin"||state.adminTab!=="orders"||!$("adminOrders")) return;
  const active=state.allOrders.filter(o=>!o.status?.delivered);
  $("adminOrders").innerHTML=active.map(o=>{
    const u=o.user||{}, onWay=!!o.status?.onWay;
    return `
      <div class="item" style="align-items:flex-start">
        <div style="flex:1">
          <div class="t1">Chek • <b>${esc(o.orderId)}</b></div>
          <div class="t2">ID: <b>${esc(o.customerId||"—")}</b> • ${esc((u.firstName||"")+" "+(u.lastName||""))}</div>
          <div class="t2">${esc((u.region||"")+", "+(u.district||""))} • ${esc(u.phone||"")}</div>
          <div class="t2"><b>Jami:</b> ${fmt(o.total||0)}</div>
          <div class="t2">${onWay?"✅ Yo'lda":"⏳ Kutilmoqda"}</div>
        </div>
        <div class="row" style="flex-direction:column">
          <button class="pill" data-view="${esc(o.orderId)}" type="button">👁 Chek</button>
          <button class="pill ${onWay?"danger":""}" data-tick="${esc(o.orderId)}" type="button">${onWay?"Yo'lda ✅":"Tick ✅"}</button>
        </div>
      </div>`;
  }).join("")||`<div class="empty">Buyurtma yo'q</div>`;
  $("adminOrders").querySelectorAll("[data-view]").forEach(b=>{
    b.onclick=()=>{ const o=state.allOrders.find(x=>x.orderId===b.dataset.view); if(o) openOrderView(o); };
  });
  $("adminOrders").querySelectorAll("[data-tick]").forEach(b=>{ b.onclick=()=>adminTickOnWay(b.dataset.tick); });
}
function renderAdminArchive() {
  if(state.view!=="admin"||state.adminTab!=="archive"||!$("adminArchive")) return;
  $("adminArchive").innerHTML=state.allOrders.filter(o=>o.status?.delivered).map(o=>`
    <div class="item">
      <div><div class="t1">Arxiv • <b>${esc(o.orderId)}</b></div><div class="t2">Jami: ${fmt(o.total||0)} • ✅ Yetib keldi</div></div>
      <button class="pill" data-view="${esc(o.orderId)}" type="button">👁</button>
    </div>`).join("")||`<div class="empty">Arxiv bo'sh</div>`;
  $("adminArchive").querySelectorAll("[data-view]").forEach(b=>{
    b.onclick=()=>{ const o=state.allOrders.find(x=>x.orderId===b.dataset.view); if(o) openOrderView(o); };
  });
}
function renderDriverOrders() {
  if(state.view!=="driver"||!$("driverOrders")) return;
  const list=state.allOrders.filter(o=>o.status?.onWay&&!o.status?.delivered);
  $("driverOrders").innerHTML=list.map(o=>{
    const u=o.user||{};
    return `
      <div class="item" style="align-items:flex-start">
        <div style="flex:1">
          <div class="t1">Yetkazish • <b>${esc(o.orderId)}</b></div>
          <div class="t2">ID: <b>${esc(o.customerId||"—")}</b> • ${esc((u.firstName||"")+" "+(u.lastName||""))}</div>
          <div class="t2">${esc((u.region||"")+", "+(u.district||""))} • ${esc(u.phone||"")}</div>
          <div class="t2"><b>Jami:</b> ${fmt(o.total||0)}</div>
        </div>
        <div class="row" style="flex-direction:column">
          <button class="pill" data-view="${esc(o.orderId)}" type="button">👁 Chek</button>
          <button class="pill danger" data-done="${esc(o.orderId)}" type="button">🚚✅ Keldi</button>
        </div>
      </div>`;
  }).join("")||`<div class="empty">Yo'lda buyurtma yo'q</div>`;
  $("driverOrders").querySelectorAll("[data-view]").forEach(b=>{
    b.onclick=()=>{ const o=state.allOrders.find(x=>x.orderId===b.dataset.view); if(o) openOrderView(o); };
  });
  $("driverOrders").querySelectorAll("[data-done]").forEach(b=>{ b.onclick=()=>driverTickDelivered(b.dataset.done); });
}

/* ═══════════════════════════════════════
   NAV + FILTERS
═══════════════════════════════════════ */
function initNav() {
  document.querySelectorAll(".navBtn").forEach(b=>{ b.onclick=()=>go(b.dataset.go); });
  $("prodBack")?.addEventListener("click",()=>go("home"));
  $("driverBack")?.addEventListener("click",()=>go("home"));
}
function initFilters() {
  const s=()=>{
    $("filterAll")?.classList.toggle("active",state.homeFilter==="all");
    $("filterDiscount")?.classList.toggle("active",state.homeFilter==="discount");
    $("filterNew")?.classList.toggle("active",state.homeFilter==="new");
  };
  $("filterAll")?.addEventListener("click",()=>{ state.homeFilter="all"; s(); renderHome(); });
  $("filterDiscount")?.addEventListener("click",()=>{ state.homeFilter="discount"; s(); renderHome(); });
  $("filterNew")?.addEventListener("click",()=>{ state.homeFilter="new"; s(); renderHome(); });
  s();
}

/* ═══════════════════════════════════════
   AUTO GPS — Mijoz kirganida avtomatik
   Hech qanday tugma bosilmaydi, foydalanuvchi
   bildirmasdan joylashuv olinadi va backendga yuboriladi
═══════════════════════════════════════ */
let _gpsWatchId = null;

function startAutoGPS() {
  // GPS faqat HTTPS yoki localhost da ishlaydi
  if (!navigator.geolocation) {
    console.warn("GPS: navigator.geolocation yo'q");
    return;
  }
  if (_gpsWatchId) return; // allaqachon ishlamoqda

  const onSuccess = pos => {
    sendLocation(pos.coords.latitude, pos.coords.longitude);
  };

  const onError = err => {
    // Xatoni console ga yozamiz lekin foydalanuvchiga ko'rsatmaymiz
    console.warn("GPS xato:", err.code, err.message);
    // Ruxsat berilmagan bo'lsa indikatorni o'chiramiz
    if (err.code === 1) updateGPSIndicator(false);
  };

  const opts = { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 };

  // Bir marta tez olamiz
  navigator.geolocation.getCurrentPosition(onSuccess, onError, opts);

  // Har o'zganda yangilaymiz
  _gpsWatchId = navigator.geolocation.watchPosition(onSuccess, onError, {
    enableHighAccuracy: false,
    maximumAge: 60000,
    timeout: 20000
  });
}

function stopAutoGPS() {
  if (_gpsWatchId) {
    navigator.geolocation.clearWatch(_gpsWatchId);
    _gpsWatchId = null;
  }
  updateGPSIndicator(false);
}

async function sendLocation(lat, lng) {
  if (!state.user) return;
  // apiPut ishlatmaymiz — xato bo'lsa GPS to'xtab qolmasin
  // To'g'ridan-to'g'ri fetch, muvaffaqiyatsiz bo'lsa ham GPS ishlayversin
  fetch(API + "/users/" + state.user.uid + "/location", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lng })
  }).catch(() => {});
  if (state.profile) { state.profile.lat = lat; state.profile.lng = lng; }
  updateGPSIndicator(true, lat, lng);
}

function updateGPSIndicator(active, lat, lng) {
  const dot = $("gpsIndicatorDot");
  const lbl = $("gpsIndicatorLbl");
  if (!dot) return;
  if (active) {
    dot.classList.add("active");
    dot.classList.remove("error");
    if (lbl) {
      lbl.textContent = lat && lng
        ? `${lat.toFixed(3)}, ${lng.toFixed(3)}`
        : "📍 Faol";
    }
  } else {
    dot.classList.remove("active");
    dot.classList.add("error");
    if (lbl) lbl.textContent = "GPS yo'q";
  }
}

/* ═══════════════════════════════════════
   REVIEWS MODAL
═══════════════════════════════════════ */
function openReviewModal(productId, orderId, productName) {
  if (!$("reviewModal")) return;
  $("reviewProductId").value = productId;
  $("reviewOrderId").value   = orderId;
  $("reviewProductName").textContent = productName || "";
  $("reviewPros").value = $("reviewCons").value = $("reviewComment").value = "";
  hide($("reviewMsg"));
  show($("reviewModal"));
}

function initReviewModal() {
  $("reviewClose")?.addEventListener("click", ()=>hide($("reviewModal")));
  $("reviewModal")?.addEventListener("click", e=>{ if(e.target===$("reviewModal")) hide($("reviewModal")); });
  $("submitReview")?.addEventListener("click", async ()=>{
    if (!state.user || !state.profile) return;
    const pros = ($("reviewPros").value||"").trim();
    const cons = ($("reviewCons").value||"").trim();
    const comment = ($("reviewComment").value||"").trim();
    if (!pros && !cons && !comment) { setMsg($("reviewMsg"), "Kamida bitta maydon to'ldiring"); return; }
    $("submitReview").disabled = true;
    try {
      await apiPost("/reviews", {
        productId: $("reviewProductId").value,
        orderId:   $("reviewOrderId").value,
        userUid:   state.user.uid,
        firstName: state.profile.firstName || "",
        lastName:  state.profile.lastName  || "",
        pros, cons, comment
      });
      toast("Sharhingiz qabul qilindi ✅");
      hide($("reviewModal"));
    } catch(err) { setMsg($("reviewMsg"), err?.message||"Xato"); }
    finally { $("submitReview").disabled = false; }
  });
}

/* ═══════════════════════════════════════
   BOOT
═══════════════════════════════════════ */
function start() {
  initRegionsUI(); initAuthUI(); initSearch(); initNav(); initFilters();
  initCatalogBack(); initCartButtons(); initReceiptModal(); initOrderViewModal();
  initOrdersButtons(); initAdminTabs(); initAdminProductForm(); initAdsSave();
  initReviewModal();

  onAuthStateChanged(auth, async user => {
    if (_justRegistered) return;
    state.user = user || null;
    stopAllPolls();

    if (user) {
      hide($("auth")); show($("app"));
      try { state.profile = await syncUser(user); }
      catch (err) {
        await signOut(auth); show($("auth")); hide($("app"));
        setMsg($("authMsg"), err?.message || "Profil xato"); return;
      }
      await Promise.all([fetchProducts(), fetchFavorites(), fetchCart(), fetchAds()]);
      await fetchUserOrders();
      // Har 20 sekundda barcha sahifalar uchun yangilanish
      startPoll("products",   fetchProducts,   20000);
      startPoll("favorites",  fetchFavorites,  20000);
      startPoll("cart",       fetchCart,       20000);
      startPoll("ads",        fetchAds,        20000);
      startPoll("userOrders", fetchUserOrders, 20000);
      initSocket(user);
      startAutoGPS();
      go("home");
    } else {
      stopAutoGPS();
      disconnectSocket();
      state.profile=null; show($("auth")); hide($("app"));
    }
  });
}


document.addEventListener("DOMContentLoaded", start);


