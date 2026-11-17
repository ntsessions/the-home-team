/* ============================================================
   THE HOME TEAM — site behavior
   - product "photos" (built in HTML so they stay on-brand)
   - gallery + lightbox, edition picker, quantity
   - Add to cart → cart → Check out; Buy Now → checkout directly
   - checkout: picking a payment method → out of stock → waitlist (Google Form)
   - cart drawer
   - analytics (GA4 + Microsoft Clarity), off until IDs are in config.js
   ============================================================ */
(function () {
  "use strict";
  var CFG = window.HT_CONFIG || {};
  var VERSION = CFG.version || "V1";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------- analytics ---------------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  if (CFG.ga4Id) {
    var g = document.createElement("script");
    g.async = true;
    g.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(CFG.ga4Id);
    document.head.appendChild(g);
    gtag("js", new Date());
    gtag("config", CFG.ga4Id, { page_version: VERSION });
  }
  if (CFG.clarityId) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", CFG.clarityId);
    window.clarity("set", "page_version", VERSION);
  }
  function track(name, params) {
    params = Object.assign({ page_version: VERSION }, params || {});
    if (CFG.ga4Id) gtag("event", name, params);
    if (CFG.clarityId && window.clarity) window.clarity("event", name);
    if (!CFG.ga4Id && !CFG.clarityId && window.console) console.info("[track]", name, params);
  }

  /* ---------------- card content ---------------- */
  // Activity text = the team's prototype cards. Get to Know You = starter examples (edit freely).
  var CARDS = {
    game:  { cls: "c-yellow", title: "At the Game", icons: ["trophy", "tag"],
             text: "Use the paper and pencils in the kit. Pick something nearby, like the mascot, a shoe, or the scoreboard, and give everyone one minute to draw it. Reveal your pictures together!" },
    one:   { cls: "c-green", title: "One on One", icons: ["gear", "clock", "phone"], flip: true,
             text: "Each of you finds one photo on your phone with a story behind it. Take turns sharing the story!" },
    car:   { cls: "c-coral", title: "In the Car", icons: ["tag", "heart", "star"],
             text: "Each person picks one song for a family playlist. Ask your athlete to choose the song that matches today's mood. Save it for the ride home." },
    hour:  { cls: "c-blue", title: "Under an Hour", icons: ["phone", "star", "megaphone"], flip: true,
             text: "Family dare night! Everyone writes 2 dares, folds them into a bowl, and draws 2. You might get your own, so be careful what you write!" },
    talk1: { cls: "c-peach", title: "Get to Know You", icons: ["chat"], convo: true,
             text: "What's one moment from this season you want to remember forever?" },
    talk2: { cls: "c-peach", title: "Get to Know You", icons: ["question"], convo: true,
             text: "What's something I do at your games that you secretly love, or secretly wish I'd stop?" },
    talk3: { cls: "c-peach", title: "Get to Know You", icons: ["heart"], convo: true,
             text: "If you could trade places with any teammate for a day, who would it be and why?" },
    talk4: { cls: "c-peach", title: "Get to Know You", icons: ["star"], convo: true,
             text: "What's the best advice a coach has ever given you, on or off the field?" },
    talk5: { cls: "c-peach", title: "Get to Know You", icons: ["chat"], convo: true,
             text: "If our family had a team mascot, what would it be?" }
  };

  function icon(name) { return '<svg aria-hidden="true"><use href="#i-' + name + '"/></svg>'; }

  function cardHTML(key, style, extraCls, color) {
    var c = CARDS[key];
    var cls = "ht-card " + (color || c.cls) + (c.flip ? " flip" : "") + (c.convo ? " convo" : "") + (extraCls ? " " + extraCls : "");
    var body = c.convo
      ? '<div class="card-icons">' + c.icons.map(icon).join("") + '</div><div class="card-text">' + c.text + "</div>"
      : '<div class="card-text">' + c.text + '</div><div class="card-icons">' + c.icons.map(icon).join("") +
        '</div><div class="card-scratch">Scratch<br>Here!</div>';
    return '<div class="' + cls + '"' + (style ? ' style="' + style + '"' : "") + ">" +
      '<div class="card-title">' + c.title + '</div><div class="card-body">' + body + "</div></div>";
  }

  function boxHTML(edition, opts) {
    var blue = edition === "get-to-know-you";
    var label = blue ? "Get to Know You" : "Activities";
    return '<div style="position:absolute;left:' + opts.x + 'em;top:' + opts.y + 'em;perspective:' + (opts.persp || 70) + 'em;">' +
      '<div class="box3d' + (blue ? " blue" : "") + '" style="position:relative;--w:' + opts.w + "em;--h:" + opts.h + "em;--d:" + opts.d +
      "em;transform:rotateY(" + opts.ry + "deg) rotateX(" + opts.rx + 'deg);font-size:' + (opts.fs || 1) + 'em">' +
      '<div class="face left"></div><div class="face top"></div>' +
      '<div class="face front"><div class="box-title">THE HOME TEAM</div>' +
      '<div class="box-sub">ACTIVITIES FOR THE WHOLE FAMILY</div>' +
      '<div class="box-ed">' + label + " Edition</div></div>" +
      "</div></div>";
  }

  function at(x, y, r, sc) { return "left:" + x + "em;top:" + y + "em;transform:rotate(" + r + "deg)" + (sc ? " scale(" + sc + ")" : "") + ";"; }

  /* ---------------- scenes (product photos) ---------------- */
  function isQ(ed) { return ed === "get-to-know-you"; }
  /* Real QR code on the card back: scans to this page (or HT_CONFIG.qrUrl). */
  function qrTarget() {
    var cfg = window.HT_CONFIG || {};
    var base = cfg.qrUrl || (location.origin + location.pathname);
    return base + (base.indexOf("?") > -1 ? "&" : "?") + "src=card_qr";
  }
  var qrCache = null;
  function qrSVG() {
    if (qrCache) return qrCache;
    if (typeof window.qrcode !== "function") { // library didn't load: plain placeholder
      return '<svg class="qr" viewBox="0 0 10 10" aria-hidden="true"><rect width="10" height="10" fill="#fff"/></svg>';
    }
    var qr = window.qrcode(0, "H"); // high error correction so the center logo doesn't break scanning
    qr.addData(qrTarget());
    qr.make();
    var n = qr.getModuleCount(), cells = [];
    var lw = Math.max(5, Math.round(n * 0.2)); if ((n - lw) % 2) lw++;
    var lo = (n - lw) / 2;
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) {
      if (r >= lo - 0.5 && r < lo + lw && c >= lo - 0.5 && c < lo + lw) continue; // logo spot
      if (qr.isDark(r, c)) cells.push('<rect x="' + c + '" y="' + r + '" width="1.02" height="1.02"/>');
    }
    qrCache = '<svg class="qr" viewBox="-1 -1 ' + (n + 2) + " " + (n + 2) + '" aria-label="QR code to The Home Team page">' +
      '<rect x="-1" y="-1" width="' + (n + 2) + '" height="' + (n + 2) + '" fill="#fff"/>' +
      '<g fill="#1f1a17">' + cells.join("") + "</g>" +
      '<rect x="' + (lo + .3) + '" y="' + (lo + .3) + '" width="' + (lw - .6) + '" height="' + (lw - .6) + '" rx="1" fill="#f3a861" stroke="#1f1a17" stroke-width=".35"/>' +
      '<text x="' + (n / 2) + '" y="' + (n / 2 + lw * .17) + '" text-anchor="middle" font-size="' + (lw * .45) + '" font-family="Graduate, serif" fill="#1f1a17">HT</text></svg>';
    return qrCache;
  }

  function cardBackHTML(edition, style) {
    var blue = isQ(edition);
    return '<div class="ht-card card-back' + (blue ? " back-blue" : "") + '" style="' + style + '">' +
      '<div class="back-brand">THE HOME TEAM</div>' +
      '<div class="back-row">' + qrSVG() +
      '<div class="back-copy"><div class="back-scan">Scan me!</div>' +
      '<div class="back-text">Open every card in the free Home Team app</div></div></div></div>';
  }

  function appScreenHTML(edition) {
    var q = isQ(edition);
    var pick = q ? cardHTML("talk1", "", "app-card", "c-yellow") : cardHTML("hour", "", "app-card");
    var tile = function (cls, label) { return '<div class="app-tile ' + cls + '"><span>' + label + "</span></div>"; };
    return '<div class="phone"><div class="phone-screen">' +
      '<div class="app-status"><span>9:41</span><span class="app-notch"></span><span class="app-bars"></span></div>' +
      '<div class="app-head"><span class="app-mark">HT</span><span>THE HOME TEAM</span></div>' +
      '<div class="app-hello">Hi, team!</div>' +
      '<div class="app-sub">Tonight\'s pick</div>' + pick +
      '<div class="app-sub">Pick a deck</div>' +
      '<div class="app-grid">' + tile("c-yellow", "At the Game") + tile("c-green", "One on One") +
        tile("c-coral", "In the Car") + tile("c-blue", "Under an Hour") + "</div>" +
      '<div class="app-tile wide c-peach"><span>Get to Know You</span></div>' +
      '<div class="app-btn">Shuffle a card</div>' +
      '<div class="app-tabs"><span class="on">Home</span><span>Decks</span><span>Saved</span></div>' +
      "</div></div>";
  }

  var SCENES = [
    { name: "box-and-cards", build: function (ed) {
      var q = isQ(ed);
      return '<div class="scene">' +
        '<div class="shadow-blob" style="left:3em;top:26.6em;width:17em;height:2.6em"></div>' +
        boxHTML(ed, { x: 4, y: 15.5, w: 15, h: 11, d: 3, ry: 24, rx: -8 }) +
        '<div class="shadow-blob" style="left:21em;top:36em;width:16em;height:1.6em;opacity:.7"></div>' +
        '<div class="deck-edge" style="' + at(22, 26.4, -3) + '"></div>' +
        (q ? cardHTML("talk4", at(22, 25.6, -3), "", "c-blue") +
             cardHTML("talk3", at(21.2, 17.4, 5), "", "c-coral") +
             cardHTML("talk2", at(22.4, 9.4, -4), "", "c-green") +
             cardHTML("talk1", at(21.6, 1.6, 3), "", "c-yellow")
           : cardHTML("hour", at(22, 25.6, -3)) +
             cardHTML("car", at(21.2, 17.4, 5)) +
             cardHTML("one", at(22.4, 9.4, -4)) +
             cardHTML("game", at(21.6, 1.6, 3))) +
        '<div class="light"></div></div>';
    }},
    { name: "card-spread", build: function (ed) {
      var q = isQ(ed);
      return '<div class="scene table">' +
        (q ? cardHTML("talk1", at(3.6, 4.2, -5, 1.15), "", "c-yellow") +
             cardHTML("talk2", at(21.2, 5.4, 4, 1.15), "", "c-green") +
             cardHTML("talk3", at(3.9, 25, 3, 1.15), "", "c-coral") +
             cardHTML("talk4", at(21.4, 24.4, -3, 1.15), "", "c-blue") +
             cardHTML("talk5", at(12.5, 15, -1.5, 1.15))
           : cardHTML("game", at(3.6, 4.2, -5, 1.15)) +
             cardHTML("one", at(21.2, 5.4, 4, 1.15)) +
             cardHTML("car", at(3.9, 25, 3, 1.15)) +
             cardHTML("hour", at(21.4, 24.4, -3, 1.15))) +
        '<div class="light"></div></div>';
    }},
    { name: "box-closeup", build: function (ed) {
      return '<div class="scene">' +
        '<div class="shadow-blob" style="left:6em;top:30.5em;width:26em;height:3em"></div>' +
        boxHTML(ed, { x: 9.5, y: 10.5, w: 22, h: 16, d: 4.5, ry: 26, rx: -9, persp: 60 }) +
        (isQ(ed) ? cardHTML("talk2", at(21, 26.5, 7, 1.1)) : cardHTML("car", at(21, 26.5, 7, 1.1))) +
        '<div class="light"></div></div>';
    }},
    { name: "close-up-cards", build: function (ed) {
      var q = isQ(ed);
      return '<div class="scene table">' +
        (q ? cardHTML("talk3", at(5, 5.5, -6, 1.35)) +
             cardHTML("talk2", at(19, 14, 5, 1.35), "", "c-blue") +
             cardHTML("talk1", at(7.5, 25, -2, 1.35), "", "c-yellow")
           : cardHTML("one", at(5, 5.5, -6, 1.35)) +
             cardHTML("hour", at(19, 14, 5, 1.35)) +
             cardHTML("game", at(7.5, 25, -2, 1.35))) +
        '<div class="light"></div></div>';
    }},
    { name: "card-back-app", build: function (ed) {
      return '<div class="scene table">' +
        '<div class="shadow-blob" style="left:2.5em;top:27.5em;width:19em;height:2.2em;opacity:.6"></div>' +
        cardBackHTML(ed, at(3.2, 13.5, -7, 1.3)) +
        '<div class="shadow-blob" style="left:22em;top:35.5em;width:16em;height:2em;opacity:.7"></div>' +
        '<div style="position:absolute;left:23.4em;top:3.2em;transform:rotate(4deg)">' + appScreenHTML(ed) + "</div>" +
        '<div class="light"></div></div>';
    }}
  ];

  /* ---------------- product page ---------------- */
  var state = { scene: 0, edition: "activities" };
  var EDITION_NAMES = { "activities": "Activities", "get-to-know-you": "Get to Know You Questions" };

  function renderGallery() {
    var main = $("[data-main-scene]");
    if (!main) return;
    main.innerHTML = SCENES[state.scene].build(state.edition);
    var thumbs = $("[data-thumbs]");
    thumbs.innerHTML = SCENES.map(function (s, i) {
      return '<button class="thumb" type="button" role="tab" aria-selected="' + (i === state.scene) +
        '" aria-label="Photo ' + (i + 1) + '" data-thumb="' + i + '"><div class="scene-holder">' + s.build(state.edition) + "</div></button>";
    }).join("");
    var lb = $("[data-lightbox-scene]");
    if (lb && !$("[data-lightbox]").hidden) lb.innerHTML = SCENES[state.scene].build(state.edition);
  }

  function setScene(i, source) {
    state.scene = (i + SCENES.length) % SCENES.length;
    renderGallery();
    track("gallery_view", { photo: SCENES[state.scene].name, source: source || "thumb" });
  }

  function initProduct() {
    if (!$("[data-main-scene]")) return;
    renderGallery();

    $("[data-thumbs]").addEventListener("click", function (e) {
      var t = e.target.closest("[data-thumb]");
      if (t) setScene(+t.dataset.thumb, "thumb");
    });

    $$('input[name="edition"]').forEach(function (r) {
      r.addEventListener("change", function () {
        state.edition = r.value;
        $("[data-edition-label]").textContent = EDITION_NAMES[r.value];
        if (state.scene !== 0 && state.scene !== 2) state.scene = 0;
        renderGallery();
        track("edition_select", { edition: r.value });
      });
    });

    var qtyInput = $("[data-qty-input]");
    $$("[data-qty]").forEach(function (b) {
      b.addEventListener("click", function () {
        var v = Math.min(10, Math.max(1, (+qtyInput.value || 1) + +b.dataset.qty));
        qtyInput.value = v;
      });
    });

    // lightbox
    var lightbox = $("[data-lightbox]");
    $("[data-open-lightbox]").addEventListener("click", function () {
      lightbox.hidden = false;
      $("[data-lightbox-scene]").innerHTML = SCENES[state.scene].build(state.edition);
      track("photo_enlarge", { photo: SCENES[state.scene].name });
    });
    $$("[data-close-lightbox]").forEach(function (b) { b.addEventListener("click", function () { lightbox.hidden = true; }); });
    $$("[data-lb]").forEach(function (b) {
      b.addEventListener("click", function () { setScene(state.scene + +b.dataset.lb, "lightbox"); });
    });

    // sample cards section
    var grid = $("[data-sample-cards]");
    if (grid) {
      grid.innerHTML = ["game", "one", "car", "hour", "talk1", "talk2"].map(function (k) {
        return '<div class="sample">' + cardHTML(k) + "</div>";
      }).join("");
    }

    // CTAs: Buy Now → straight to checkout; Add to cart → cart drawer → checkout
    $$("[data-cta]").forEach(function (b) {
      b.addEventListener("click", function () {
        var qty = +($("[data-qty-input]") || {}).value || 1;
        track(b.dataset.cta + "_click", { edition: state.edition, quantity: qty, value: 20 * qty, currency: "USD" });
        if (b.dataset.cta.indexOf("buy_now") === 0) {
          location.href = "checkout.html?edition=" + encodeURIComponent(state.edition) + "&qty=" + qty;
        } else {
          addToCart(state.edition, qty);
        }
      });
    });
    $$("[data-open-waitlist-link]").forEach(function (a) {
      a.addEventListener("click", function (e) { e.preventDefault(); openWaitlist("footer_link"); });
    });
    if (location.hash === "#waitlist") openWaitlist("about_page_link");
    if (/[?&]src=card_qr/.test(location.search)) track("qr_scan_visit", {});
  }

  /* ---------------- checkout ---------------- */
  function money(n) { return "$" + n.toFixed(2); }
  function initCheckout() {
    if (!$("[data-checkout]")) return;
    var params = new URLSearchParams(location.search);
    var from = params.get("from") === "cart" ? "cart" : "buy_now";
    var items;
    if (from === "cart" && getCart().length) {
      items = getCart();
    } else {
      from = "buy_now";
      var ed = EDITION_NAMES[params.get("edition")] ? params.get("edition") : "activities";
      items = [{ edition: ed, qty: Math.min(10, Math.max(1, parseInt(params.get("qty"), 10) || 1)) }];
    }
    var qty = cartCount(items);
    state.qty = qty;
    state.edition = items.map(function (it) { return it.edition; }).join("+");

    $("[data-sum-items]").innerHTML = items.map(function (it) {
      return '<div class="sum-item"><div class="sum-thumb"><div class="scene-holder">' + SCENES[2].build(it.edition) +
        '</div><span class="sum-qty">' + it.qty + '</span></div><div class="sum-name"><strong>Family Card Deck</strong><small>' +
        EDITION_NAMES[it.edition] + ' edition</small></div><div class="sum-price">' + money(20 * it.qty) + "</div></div>";
    }).join("");
    $("[data-sum-subtotal]").textContent = money(20 * qty);
    $("[data-sum-total]").textContent = money(20 * qty);
    track("checkout_view", { edition: state.edition, quantity: qty, value: 20 * qty, currency: "USD", source: from });

    // discount code: record the attempt, no codes are active yet
    $("[data-discount-form]").addEventListener("submit", function (e) {
      e.preventDefault();
      var code = $("#discount-code").value.trim();
      var msg = $("[data-discount-msg]");
      msg.hidden = false;
      if (!code) { msg.textContent = "Enter a discount code."; return; }
      msg.textContent = "Sorry, \u201c" + code + "\u201d isn't a valid code.";
      state.discount = code;
      track("discount_code_apply", { code: code.toUpperCase().slice(0, 40), edition: state.edition });
    });

    // choosing a payment method = the purchase moment → out of stock + waitlist
    $$('input[name="payment"]').forEach(function (r) {
      r.addEventListener("click", function () {
        state.payment = r.value;
        track("payment_method_select", { method: r.value, edition: state.edition, quantity: qty,
          value: 20 * qty, currency: "USD", discount_tried: !!state.discount });
        openWaitlist("payment_" + r.value);
      });
    });
  }

  /* ---------------- waitlist modal ---------------- */
  var lastSource = "";
  function openWaitlist(source) {
    var modal = $("[data-modal]");
    if (!modal) { location.href = "index.html#waitlist"; return; }
    lastSource = source;
    $("[data-modal-edition]").textContent = EDITION_NAMES[state.edition];
    $("[data-modal-scene]").innerHTML = '<div class="scene-holder" style="position:relative;width:100%;height:100%">' +
      SCENES[2].build(state.edition) + "</div>";
    $('[data-modal-step="form"]').hidden = false;
    $('[data-modal-step="done"]').hidden = true;
    $("[data-form-error]").hidden = true;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(function () { $("#wl-email").focus(); }, 60);
    track("out_of_stock_view", { edition: state.edition, source: source });
  }
  function closeModal() {
    var modal = $("[data-modal]");
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  function initWaitlist() {
    var form = $("[data-waitlist-form]");
    if (!form) return;
    $$("[data-close-modal]").forEach(function (b) { b.addEventListener("click", closeModal); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = $("#wl-email");
      var email = input.value.trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
      input.classList.toggle("invalid", !ok);
      $("[data-form-error]").hidden = ok;
      if (!ok) { track("waitlist_invalid_email"); return; }

      var gf = CFG.googleForm || {};
      if (gf.action && gf.emailField) {
        var fd = new FormData();
        fd.append(gf.emailField, email);
        if (gf.editionField) fd.append(gf.editionField, EDITION_NAMES[state.edition]);
        if (gf.versionField) fd.append(gf.versionField, VERSION);
        if (gf.paymentField && state.payment) fd.append(gf.paymentField, state.payment);
        fetch(gf.action, { method: "POST", mode: "no-cors", body: fd }).catch(function () {});
      } else if (window.console) {
        console.info("[waitlist] Google Form not configured yet — would have saved:", email, state.edition);
      }
      track("waitlist_submit", { edition: state.edition, source: lastSource, method: state.payment || "" });
      input.value = "";
      $('[data-modal-step="form"]').hidden = true;
      $('[data-modal-step="done"]').hidden = false;
    });
  }

  /* ---------------- cart drawer ---------------- */
  // Cart is saved in this browser (localStorage) so it follows the visitor between pages.
  // No purchase ever happens: checkout ends at the out-of-stock pop-up.
  var CART_KEY = "ht_cart";
  var memCart = [];
  function getCart() {
    try {
      var c = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      if (Array.isArray(c)) return c.filter(function (it) { return EDITION_NAMES[it.edition] && it.qty > 0; });
    } catch (e) {}
    return memCart;
  }
  function saveCart(c) {
    memCart = c;
    try { localStorage.setItem(CART_KEY, JSON.stringify(c)); } catch (e) {}
    renderCart();
  }
  function cartCount(c) { return (c || getCart()).reduce(function (n, it) { return n + it.qty; }, 0); }
  function addToCart(edition, qty) {
    var c = getCart(), found = false;
    c.forEach(function (it) { if (it.edition === edition) { it.qty = Math.min(10, it.qty + qty); found = true; } });
    if (!found) c.push({ edition: edition, qty: Math.min(10, qty) });
    saveCart(c);
    track("add_to_cart", { edition: edition, quantity: qty, value: 20 * qty, currency: "USD" });
    openCart("add_to_cart");
  }
  function openCart(source) {
    var d = $("[data-drawer]"); if (!d) return;
    renderCart();
    d.hidden = false;
    track("cart_open", { source: source || "header", quantity: cartCount() });
  }
  function renderCart() {
    var c = getCart(), n = cartCount(c);
    $$("[data-cart-count]").forEach(function (el) { el.textContent = n; el.classList.toggle("has-items", n > 0); });
    var body = $("[data-drawer] .drawer-body"); if (!body) return;
    body.classList.toggle("has-items", n > 0);
    if (!n) {
      body.innerHTML = '<svg class="icon big-icon"><use href="#i-bag"/></svg><p>Your cart is empty.</p>' +
        '<a class="btn btn-primary" href="index.html">Shop the deck</a>';
      return;
    }
    body.innerHTML = '<div class="cart-items">' + c.map(function (it, i) {
      return '<div class="cart-item"><div class="sum-thumb"><div class="scene-holder">' + SCENES[2].build(it.edition) + '</div></div>' +
        '<div class="cart-info"><strong>Family Card Deck</strong><small>' + EDITION_NAMES[it.edition] + ' edition</small>' +
        '<div class="qty qty-sm"><button type="button" data-cart-qty="' + i + '" data-d="-1" aria-label="Decrease quantity">−</button>' +
        '<span>' + it.qty + '</span><button type="button" data-cart-qty="' + i + '" data-d="1" aria-label="Increase quantity">+</button></div>' +
        '<button type="button" class="cart-remove" data-cart-remove="' + i + '">Remove</button></div>' +
        '<div class="sum-price">' + money(20 * it.qty) + "</div></div>";
    }).join("") + "</div>" +
      '<div class="cart-foot"><div class="cart-subtotal"><span>Subtotal</span><strong>' + money(20 * n) + "</strong></div>" +
      '<p class="small muted">Shipping is calculated at checkout.</p>' +
      '<a class="btn btn-primary btn-block" href="checkout.html?from=cart" data-cart-checkout>Check out</a></div>';
  }
  function initCart() {
    var drawer = $("[data-drawer]");
    if (!drawer) return;
    renderCart();
    $$("[data-open-cart]").forEach(function (b) {
      b.addEventListener("click", function () { openCart("header"); });
    });
    $$("[data-close-cart]").forEach(function (b) { b.addEventListener("click", function () { drawer.hidden = true; }); });
    drawer.addEventListener("click", function (e) {
      var q = e.target.closest("[data-cart-qty]"), r = e.target.closest("[data-cart-remove]");
      var co = e.target.closest("[data-cart-checkout]");
      var c = getCart();
      if (q) {
        var it = c[+q.dataset.cartQty]; if (!it) return;
        it.qty = Math.min(10, Math.max(1, it.qty + +q.dataset.d));
        saveCart(c);
        track("cart_quantity_change", { edition: it.edition, quantity: it.qty });
      } else if (r) {
        var gone = c.splice(+r.dataset.cartRemove, 1)[0];
        saveCart(c);
        if (gone) track("remove_from_cart", { edition: gone.edition, quantity: gone.qty });
      } else if (co) {
        track("begin_checkout", { quantity: cartCount(c), value: 20 * cartCount(c), currency: "USD", source: "cart" });
      }
    });
  }

  /* ---------------- every click ----------------
     Logs a "click" event for anything clickable (buttons, links, options,
     photos, menu headings), named by its visible label. Typed text is never sent. */
  document.addEventListener("click", function (e) {
    var el = e.target.closest("a, button, label, summary, [data-thumb], [role=button]");
    if (!el) return;
    if (el.tagName === "LABEL" && e.target.tagName === "INPUT") return; // label clicks fire twice; count once
    var named = el.tagName === "LABEL" && el.querySelector("strong"); // option cards: use the name only
    var label = el.getAttribute("data-track") || el.getAttribute("aria-label") ||
      ((named || el).textContent || "").replace(/\s+/g, " ").trim();
    track("button_click", {
      element: el.tagName.toLowerCase(),
      label: label.slice(0, 60) || "(no label)",
      link: el.tagName === "A" ? el.getAttribute("href") : "",
      page: document.body.dataset.page || "page"
    });
  }, true);

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    closeModal();
    var d = $("[data-drawer]"); if (d) d.hidden = true;
    var l = $("[data-lightbox]"); if (l) l.hidden = true;
  });

  initProduct();
  initCheckout();
  initWaitlist();
  initCart();
  track("page_view_" + (document.body.dataset.page || "page"));
})();
