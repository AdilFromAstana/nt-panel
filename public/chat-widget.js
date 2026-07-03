(function () {
  if (window.__ntChat) return;
  window.__ntChat = true;

  var CART_KEY = "ntcart2";
  var WA_PHONE = "77081237069";
  var history = [];
  var lastUserText = "";
  var lastProducts = [];

  function track(ev, data) {
    try {
      var b = JSON.stringify({ event: ev, data: data || {} });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/sell/track", new Blob([b], { type: "application/json" }));
      } else {
        fetch("/api/sell/track", { method: "POST", headers: { "Content-Type": "application/json" },
          body: b, keepalive: true });
      }
    } catch (e) {}
  }

  var css = `
  .ntc-fab{position:fixed;right:20px;bottom:20px;width:60px;height:60px;border-radius:50%;
    background:linear-gradient(135deg,#1f6feb,#0a3d8f);color:#fff;border:none;cursor:pointer;
    box-shadow:0 8px 24px rgba(10,61,143,.35);display:flex;align-items:center;justify-content:center;
    z-index:9998;transition:transform .15s}
  .ntc-fab:hover{transform:scale(1.06)}
  .ntc-fab svg{width:28px;height:28px}
  .ntc-hint{display:none;position:fixed;right:90px;bottom:34px;max-width:240px;background:#fff;color:#0f172a;
    padding:11px 30px 11px 14px;border-radius:14px;box-shadow:0 10px 28px rgba(0,0,0,.16);
    font:500 13px/1.4 system-ui,sans-serif;z-index:9998;cursor:pointer}
  .ntc-hint.show{display:block;animation:ntc-pop .25s ease}
  .ntc-hint .ntc-hx{position:absolute;top:5px;right:9px;color:#9aa3af;font-size:16px;line-height:1;
    border:none;background:none;cursor:pointer;padding:0}
  @keyframes ntc-pop{from{transform:translateY(8px);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes ntc-pulse{0%{box-shadow:0 8px 24px rgba(10,61,143,.35)}
    50%{box-shadow:0 0 0 12px rgba(31,111,235,.16),0 8px 24px rgba(10,61,143,.35)}
    100%{box-shadow:0 8px 24px rgba(10,61,143,.35)}}
  .ntc-fab.pulse{animation:ntc-pulse 1.6s ease-in-out 3}
  .ntc-panel{position:fixed;right:20px;bottom:90px;width:380px;max-width:calc(100vw - 32px);
    height:560px;max-height:calc(100vh - 120px);background:#fff;border-radius:18px;display:none;
    flex-direction:column;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.25);z-index:9999;
    font-family:system-ui,-apple-system,sans-serif}
  .ntc-panel.open{display:flex}
  .ntc-head{background:linear-gradient(135deg,#1f6feb,#0a3d8f);color:#fff;padding:14px 16px;
    display:flex;align-items:center;gap:10px}
  .ntc-head b{font-size:15px}
  .ntc-head span{font-size:12px;opacity:.85;display:block}
  .ntc-wa{margin-left:auto;background:#25d366;color:#fff;border:none;border-radius:18px;
    padding:6px 11px;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:5px}
  .ntc-wa svg{width:14px;height:14px}
  .ntc-x{background:none;border:none;color:#fff;font-size:22px;cursor:pointer;line-height:1;margin-left:8px}
  .ntc-body{flex:1;overflow-y:auto;padding:14px;background:#f6f8fb;display:flex;flex-direction:column;gap:10px}
  .ntc-msg{max-width:85%;padding:9px 12px;border-radius:14px;font-size:14px;line-height:1.4;white-space:pre-wrap}
  .ntc-msg.u{align-self:flex-end;background:#1f6feb;color:#fff;border-bottom-right-radius:4px}
  .ntc-msg.b{align-self:flex-start;background:#fff;color:#0f172a;border:1px solid #e6ebf2;border-bottom-left-radius:4px}
  .ntc-chips{display:flex;flex-wrap:wrap;gap:6px}
  .ntc-chip{background:#fff;border:1px solid #cdd7e5;color:#1f6feb;border-radius:20px;padding:6px 11px;
    font-size:12.5px;cursor:pointer}
  .ntc-chip:hover{background:#eef4ff}
  .ntc-cards{display:flex;flex-direction:column;gap:8px;align-self:stretch}
  .ntc-card{display:flex;gap:10px;background:#fff;border:1px solid #e6ebf2;border-radius:12px;padding:8px;text-decoration:none}
  .ntc-card img{width:62px;height:62px;object-fit:cover;border-radius:8px;flex:none;background:#eef1f5}
  .ntc-card .nm{font-size:13px;font-weight:600;color:#0f172a;line-height:1.25}
  .ntc-card .pr{font-size:14px;font-weight:700;color:#0a3d8f;margin-top:2px}
  .ntc-card .st{font-size:11.5px;margin-top:2px}
  .ntc-st-in{color:#119d5b}.ntc-st-low{color:#d98700}.ntc-st-no{color:#9aa3af}
  .ntc-add{margin-top:4px;font-size:12px;background:#eef4ff;color:#1f6feb;border:none;border-radius:8px;
    padding:4px 9px;cursor:pointer}
  .ntc-foot{display:flex;gap:8px;padding:10px;border-top:1px solid #eef1f5;background:#fff}
  .ntc-foot input{flex:1;border:1px solid #d6deea;border-radius:22px;padding:10px 14px;font-size:14px;outline:none}
  .ntc-foot input:focus{border-color:#1f6feb}
  .ntc-send{background:#1f6feb;border:none;color:#fff;width:42px;height:42px;border-radius:50%;cursor:pointer;flex:none}
  .ntc-typing{align-self:flex-start;color:#7a8699;font-size:13px;padding:4px 6px}
  @media(max-width:480px){.ntc-panel{right:0;bottom:0;width:100vw;height:100vh;max-height:100vh;border-radius:0}
    .ntc-hint{display:none}}
  `;
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  var fab = document.createElement("button");
  fab.className = "ntc-fab";
  fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';

  var hint = document.createElement("div");
  hint.className = "ntc-hint";

  var panel = document.createElement("div");
  panel.className = "ntc-panel";
  panel.innerHTML =
    '<div class="ntc-head"><div><b>Подбор товаров</b><span>ИИ-консультант NT Panel</span></div>' +
    '<button class="ntc-wa" type="button" title="Менеджер в WhatsApp">' +
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.2-.7-2.7-1.1-4.4-3.9-4.5-4.1-.1-.2-1.1-1.4-1.1-2.7s.7-1.9 1-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.5c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.2.1.4.1.6-.1l.8-1c.2-.2.4-.2.6-.1l1.8.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"/></svg>' +
    'WhatsApp</button>' +
    '<button class="ntc-x" aria-label="Закрыть">&times;</button></div>' +
    '<div class="ntc-body"></div>' +
    '<div class="ntc-foot"><input type="text" placeholder="Например: белые панели в наличии до 20000">' +
    '<button class="ntc-send" aria-label="Отправить"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg></button></div>';

  document.body.appendChild(fab);
  document.body.appendChild(hint);
  document.body.appendChild(panel);

  var body = panel.querySelector(".ntc-body");
  var input = panel.querySelector("input");
  var EXAMPLES = [
    "Панели в наличии 20–30к",
    "Гибкий камень дешевле 15000",
    "Белые стеновые панели",
    "Что есть из стеклоблоков",
  ];

  function fmtPrice(n) { return (n || 0).toLocaleString("ru-RU") + " ₸"; }

  function stockBadge(s) {
    if (!s || s <= 0) return '<div class="ntc-st ntc-st-no">Под заказ</div>';
    if (s <= 5) return '<div class="ntc-st ntc-st-low">Осталось мало</div>';
    return '<div class="ntc-st ntc-st-in">В наличии</div>';
  }

  function addToCart(p) {
    var cart = [];
    try { cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch (e) {}
    var row = cart.find(function (x) { return String(x.id) === String(p.id); });
    if (row) { row.qty = (row.qty || 1) + 1; }
    else { cart.push({ id: p.id, name: p.name, price: p.price, preview_image: p.preview_image, qty: 1 }); }
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event("ntcart-change"));
  }

  function bubble(role, text) {
    var d = document.createElement("div");
    d.className = "ntc-msg " + (role === "u" ? "u" : "b");
    d.textContent = text;
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
    return d;
  }

  function buildWA() {
    var lines = ["Здравствуйте! Пишу с сайта NT Panel."];
    if (lastProducts && lastProducts.length) {
      lines.push("", "Подобрал на сайте:");
      lastProducts.slice(0, 6).forEach(function (p) {
        lines.push("• " + p.name.trim() + " — " + fmtPrice(p.price));
      });
      var ids = lastProducts.slice(0, 12).map(function (p) { return p.id; }).join(",");
      lines.push("", "Фото и подробнее: " + location.origin + "/podborka?ids=" + ids);
    } else if (lastUserText) {
      lines.push("", "Интересует: " + lastUserText);
    }
    lines.push("", "Подскажите, пожалуйста, наличие и доставку.");
    return "https://wa.me/" + WA_PHONE + "?text=" + encodeURIComponent(lines.join("\n"));
  }

  function openWA() { track("whatsapp", { q: lastUserText }); window.open(buildWA(), "_blank"); }

  function actionRow(items) {
    var c = document.createElement("div");
    c.className = "ntc-chips";
    items.forEach(function (it) {
      var b = document.createElement("button");
      b.className = "ntc-chip";
      b.textContent = it.label;
      b.addEventListener("click", it.onClick);
      c.appendChild(b);
    });
    body.appendChild(c);
    body.scrollTop = body.scrollHeight;
  }

  function renderCards(products) {
    if (!products || !products.length) return;
    lastProducts = products;
    var wrap = document.createElement("div");
    wrap.className = "ntc-cards";
    products.forEach(function (p) {
      var a = document.createElement("a");
      a.className = "ntc-card";
      a.href = "/product/" + p.id;
      a.innerHTML =
        '<img src="' + (p.preview_image || "") + '" alt="" loading="lazy">' +
        '<div><div class="nm">' + p.name + "</div>" +
        '<div class="pr">' + fmtPrice(p.price) + "</div>" +
        stockBadge(p.stock) +
        '<button class="ntc-add" type="button">+ в корзину</button></div>';
      a.addEventListener("click", function () { track("card_click", { id: p.id, name: p.name }); });
      a.querySelector(".ntc-add").addEventListener("click", function (e) {
        e.preventDefault(); e.stopPropagation();
        addToCart(p); track("add_cart", { id: p.id, name: p.name }); this.textContent = "Добавлено";
      });
      wrap.appendChild(a);
    });
    body.appendChild(wrap);

    var hasPanel = products.some(function (p) {
      return p.category === "Стеновые панели" || p.category === "Луверы";
    });
    if (hasPanel) {
      actionRow([
        { label: "Подобрать профиль", onClick: function () { track("upsell", { kind: "профиль" }); send("подбери алюминиевый профиль к этим панелям"); } },
        { label: "Чем крепить", onClick: function () { track("upsell", { kind: "крепёж" }); send("что нужно для крепления панелей"); } },
        { label: "Скидка на объём", onClick: function () { track("upsell", { kind: "скидка" }); send("какая у вас скидка на объём?"); } },
      ]);
    }
    body.scrollTop = body.scrollHeight;
  }

  function showChips() {
    var c = document.createElement("div");
    c.className = "ntc-chips";
    EXAMPLES.forEach(function (t) {
      var b = document.createElement("button");
      b.className = "ntc-chip";
      b.textContent = t;
      b.addEventListener("click", function () { send(t); });
      c.appendChild(b);
    });
    body.appendChild(c);
  }

  var greeted = false;
  function greet() {
    if (greeted) return;
    greeted = true;
    bubble("b", "Здравствуйте! Опишите, что ищете — подберу из нашего каталога. Например:");
    showChips();
  }

  function send(text) {
    text = (text || input.value).trim();
    if (!text) return;
    input.value = "";
    lastUserText = text;
    bubble("u", text);
    history.push({ role: "user", text: text });

    var typing = document.createElement("div");
    typing.className = "ntc-typing";
    typing.textContent = "Подбираю…";
    body.appendChild(typing);
    body.scrollTop = body.scrollHeight;

    fetch("/api/sell/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        typing.remove();
        var reply = data.reply || "Готово.";
        bubble("b", reply);
        history.push({ role: "model", text: reply });
        renderCards(data.products);
      })
      .catch(function () {
        typing.remove();
        bubble("b", "Не удалось связаться с сервером. Попробуйте ещё раз.");
      });
  }

  function dismissNudge() {
    hint.classList.remove("show");
    fab.classList.remove("pulse");
  }

  function nudgeText() {
    var p = location.pathname;
    if (p.indexOf("/product/") === 0)
      return "Этот товар в наличии. Подобрать похожие или узнать про скидку на объём?";
    if (p.indexOf("/catalog") === 0)
      return "Помогу подобрать под вашу площадь и бюджет. Спросите меня!";
    return "Не знаете, с чего начать? Подберу панели за минуту.";
  }

  function showNudge() {
    if (panel.classList.contains("open") || window.innerWidth <= 480) return;
    try { if (sessionStorage.getItem("ntc-nudged")) return; } catch (e) {}
    hint.innerHTML = '<button class="ntc-hx" aria-label="Закрыть">&times;</button>' + nudgeText();
    hint.classList.add("show");
    fab.classList.add("pulse");
    hint.querySelector(".ntc-hx").addEventListener("click", function (e) {
      e.stopPropagation(); dismissNudge();
    });
    hint.addEventListener("click", function () { track("nudge_click"); dismissNudge(); toggle(true); });
    track("nudge_shown", { page: location.pathname });
    try { sessionStorage.setItem("ntc-nudged", "1"); } catch (e) {}
  }

  function toggle(open) {
    panel.classList.toggle("open", open);
    if (open) { track("open"); dismissNudge(); greet(); setTimeout(function () { input.focus(); }, 50); }
  }

  function exitOffer() {
    toggle(true);
    bubble("b", "Уходите? Не теряйте подборку — задайте вопрос здесь или напишите менеджеру в WhatsApp.");
    actionRow([
      { label: "Менеджер в WhatsApp", onClick: openWA },
      { label: "Подобрать панели", onClick: function () { send("подбери популярные панели в наличии"); } },
    ]);
  }

  function bindExitIntent() {
    if (window.innerWidth <= 480) return;
    document.addEventListener("mouseout", function (e) {
      if (e.clientY > 0 || e.relatedTarget) return;
      if (panel.classList.contains("open")) return;
      try { if (sessionStorage.getItem("ntc-exit")) return; sessionStorage.setItem("ntc-exit", "1"); } catch (x) {}
      track("exit_intent");
      dismissNudge();
      exitOffer();
    });
  }

  fab.addEventListener("click", function () { toggle(!panel.classList.contains("open")); });
  panel.querySelector(".ntc-x").addEventListener("click", function () { toggle(false); });
  panel.querySelector(".ntc-wa").addEventListener("click", openWA);
  panel.querySelector(".ntc-send").addEventListener("click", function () { send(); });
  input.addEventListener("keydown", function (e) { if (e.key === "Enter") send(); });

  setTimeout(showNudge, 25000);
  bindExitIntent();
})();
