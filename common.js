/*
  Loadmaster Pro — common.js (refactored, pure JS)
  Shared helpers across modules. Include with:
    <script src="../common.js" defer></script>
*/
(function () {
  function resolveHomeHref() {
    // If page is inside /modules/ or any subfolder, go up to index
    const parts = location.pathname.split("/").filter(Boolean);
    return parts.length > 1 ? "../index.html" : "index.html";
  }

  const LP = (window.LP = window.LP || {});

  // Navigation
  LP.goHome = function () {
    location.href = resolveHomeHref();
  };
  LP.goBack = function () {
    history.back();
  };
  LP.linkHomeButton = function (selector = ".home-button") {
    const btn = document.querySelector(selector);
    if (btn) btn.addEventListener("click", LP.goHome);
  };
  // Backwards compatibility for pages using onclick="goHome()"
  window.goHome = LP.goHome;

  // DOM Helpers
  LP.$  = (sel, root = document) => root.querySelector(sel);
  LP.$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  LP.setText = (idOrEl, text) => {
    const el = typeof idOrEl === "string" ? document.getElementById(idOrEl) : idOrEl;
    if (el) el.textContent = text;
  };
  LP.setHTML = (idOrEl, html) => {
    const el = typeof idOrEl === "string" ? document.getElementById(idOrEl) : idOrEl;
    if (el) el.innerHTML = html;
  };
  LP.setValue = (idOrEl, value) => {
    const el = typeof idOrEl === "string" ? document.getElementById(idOrEl) : idOrEl;
    if (el) el.value = value;
  };
  LP.show = (idOrEl) => {
    const el = typeof idOrEl === "string" ? document.getElementById(idOrEl) : idOrEl;
    if (el) el.style.display = "";
  };
  LP.hide = (idOrEl) => {
    const el = typeof idOrEl === "string" ? document.getElementById(idOrEl) : idOrEl;
    if (el) el.style.display = "none";
  };
  LP.enable = (idOrEl) => {
    const el = typeof idOrEl === "string" ? document.getElementById(idOrEl) : idOrEl;
    if (el) el.disabled = false;
  };
  LP.disable = (idOrEl) => {
    const el = typeof idOrEl === "string" ? document.getElementById(idOrEl) : idOrEl;
    if (el) el.disabled = true;
  };

  // Number / Validation
  LP.toNum = (idOrEl, fallback = 0) => {
    const el = typeof idOrEl === "string" ? document.getElementById(idOrEl) : idOrEl;
    if (!el) return fallback;
    const v = parseFloat(el.value != null ? String(el.value).replace(/,/g, "") : "");
    return Number.isFinite(v) ? v : fallback;
  };
  LP.round = (value, decimals = 2) => {
    if (!Number.isFinite(value)) return 0;
    const p = Math.pow(10, decimals);
    return Math.round((value + Number.EPSILON) * p) / p;
  };
  LP.ceilTo = (value, step = 1) => Math.ceil(value / step) * step;
  LP.floorTo = (value, step = 1) => Math.floor(value / step) * step;
  LP.clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  LP.safeDiv = (num, den, fallback = 0) => (den === 0 ? fallback : num / den);

  // Formats
  LP.fmtNum = (v, d = 2) => LP.round(v, d).toLocaleString();
  LP.fmtLbs = (v, d = 0) => `${LP.fmtNum(v, d)} lbs`;
  LP.fmtIn  = (v, d = 2) => `${LP.fmtNum(v, d)} in`;
  LP.ftInStr = (inches) => {
    const sign = inches < 0 ? -1 : 1;
    inches = Math.abs(inches);
    const ft = Math.floor(inches / 12);
    const inRem = LP.round(inches % 12, 2);
    return (sign < 0 ? "-" : "") + `${ft}' ${inRem}"`;
  };

  // Units
  LP.lbsToKg = (lbs) => lbs * 0.45359237;
  LP.kgToLbs = (kg) => kg / 0.45359237;
  LP.inToCm  = (inch) => inch * 2.54;
  LP.cmToIn  = (cm) => cm / 2.54;
  LP.ftToIn  = (ft) => ft * 12;
  LP.inToFt  = (inch) => inch / 12;
  LP.degToRad = (deg) => (deg * Math.PI) / 180;
  LP.radToDeg = (rad) => (rad * 180) / Math.PI;

  // Weight & Balance / CG
  LP.moment = (weight, armInches) => weight * armInches;
  LP.totalMoment = (items) => items.reduce((m, it) => m + LP.moment(it.weight, it.arm), 0);
  LP.totalWeight = (items) => items.reduce((w, it) => w + it.weight, 0);
  LP.cgInches = (totalMoment, totalWeight) => LP.safeDiv(totalMoment, totalWeight, 0);
  LP.deltaCG = (shiftWeight, distanceMovedIn, grossWeight) =>
    LP.safeDiv(shiftWeight * distanceMovedIn, grossWeight, 0);

  // Restraint
  LP.vectorComponents = (force, angleDeg) => {
    const r = LP.degToRad(angleDeg);
    return { longitudinal: force * Math.cos(r), vertical: force * Math.sin(r) };
  };
  LP.effectiveLength = (actualLength, angleDeg) => actualLength * Math.cos(LP.degToRad(angleDeg));
  LP.deviceCapacity = (type) => {
    const map = { "5k": 5000, "10k": 10000, "25k": 25000 };
    return map[String(type).toLowerCase()] ?? 0;
  };
  LP.requiredDevices = (requiredLbf, deviceType, factor = 1) => {
    const cap = LP.deviceCapacity(deviceType) * factor;
    if (!cap) return 0;
    return Math.ceil(requiredLbf / cap);
  };

  // Tires / Shoring
  LP.tireArea = (widthIn, contactLengthIn) => widthIn * contactLengthIn;
  LP.perTireLoad = (axleWeight, tires) => LP.safeDiv(axleWeight, tires, 0);
  LP.psiFromTire = (axleWeight, tires, widthIn, contactLenIn) => {
    const area = LP.tireArea(widthIn, contactLenIn);
    const pt = LP.perTireLoad(axleWeight, tires);
    return LP.safeDiv(pt, area, 0);
  };

  // Winching
  LP.linePull = (ratedPull, partsOfLine = 1, efficiency = 0.9) =>
    ratedPull * partsOfLine * efficiency;

  // Persistence
  LP.saveJSON = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.warn("saveJSON failed", e); }
  };
  LP.loadJSON = (key, fallback = null) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn("loadJSON failed", e);
      return fallback;
    }
  };

  // Events
  LP.debounce = (fn, ms = 200) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn.apply(null, args), ms); };
  };
  LP.throttle = (fn, ms = 200) => {
    let last = 0;
    return (...args) => { const now = Date.now(); if (now - last >= ms) { last = now; fn.apply(null, args); } };
  };
  LP.wireCalc = (containerSel, calcFn, { instant = true } = {}) => {
    const c = typeof containerSel === "string" ? document.querySelector(containerSel) || document : (containerSel || document);
    const handler = instant ? calcFn : LP.debounce(calcFn, 200);
    LP.$$("input, select, textarea", c).forEach((el) => {
      el.addEventListener("input", handler);
      el.addEventListener("change", handler);
    });
  };

  // Parsing helpers
  LP.readIndexed = (baseId, count, fallback = 0) => {
    const out = [];
    for (let i = 1; i <= count; i++) out.push(LP.toNum(`${baseId}${i}`, fallback));
    return out;
  };

  // Simple assert & error banner
  LP.assert = (cond, msg) => { if (!cond) throw new Error(msg || "Assertion failed"); };
  LP.showError = (msg, id = "lp-error") => {
    let box = document.getElementById(id);
    if (!box) {
      box = document.createElement("div");
      box.id = id;
      box.style.cssText = "position:sticky;top:0;z-index:1000;padding:8px 12px;background:#B00020;color:#fff;font-weight:600;border-bottom:2px solid #700013";
      document.body.prepend(box);
    }
    box.textContent = msg;
    setTimeout(() => box.remove(), 4000);
  };

  // Page bootstrap
  LP.initPage = (calcFn) => {
    LP.linkHomeButton();
    if (typeof calcFn === "function") LP.wireCalc(document, calcFn);
  };
})();