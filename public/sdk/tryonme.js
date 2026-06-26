/**
 * TryOnMe SDK — plug-and-play AI Virtual Try-On widget.
 *
 * Usage on any merchant website:
 *   <script src="https://apparel-ai-try.lovable.app/sdk/tryonme.js"></script>
 *   <script>
 *     TryOnMe.init({ apiKey: "tk_live_xxx", merchantId: "merchant001" });
 *   </script>
 *
 * Mark product images you want to support:
 *   <img src="dress.jpg" data-tryon data-product-id="SKU-123" data-product-name="Anarkali Kurti" data-product-category="kurti" />
 *
 * The customer never leaves the merchant's site — everything happens in an overlay popup.
 */
(function () {
  "use strict";

  var API_BASE = "https://vonppkdllfzztpibtewy.supabase.co/functions/v1/tryon-api";
  var config = { apiKey: null, merchantId: null, buttonText: "Try On", autoSave: true };

  /* ----------------------------- styles ----------------------------- */
  var CSS = ''
    + '.tom-wrap{position:relative;display:inline-block;line-height:0}'
    + '.tom-btn{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);z-index:5;'
    + 'display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border:0;cursor:pointer;'
    + 'background:#fff;color:#0f172a;font:600 13px/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;'
    + 'border-radius:9999px;box-shadow:0 8px 24px rgba(0,0,0,.2);white-space:nowrap;transition:transform .15s}'
    + '.tom-btn:hover{transform:translateX(-50%) scale(1.06)}'
    + '.tom-btn svg{width:15px;height:15px;color:#7c3aed}'
    + '.tom-overlay{position:fixed;inset:0;z-index:2147483647;background:rgba(15,23,42,.6);'
    + 'backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;'
    + 'font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;animation:tomFade .2s ease}'
    + '@keyframes tomFade{from{opacity:0}to{opacity:1}}'
    + '.tom-modal{background:#fff;border-radius:20px;width:100%;max-width:880px;max-height:92vh;overflow:auto;'
    + 'box-shadow:0 30px 80px rgba(0,0,0,.4);position:relative}'
    + '.tom-head{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid #eef2f7;position:sticky;top:0;background:#fff;z-index:2}'
    + '.tom-title{font-weight:700;font-size:17px;color:#0f172a;display:flex;align-items:center;gap:8px}'
    + '.tom-title b{background:linear-gradient(90deg,#7c3aed,#db2777);-webkit-background-clip:text;background-clip:text;color:transparent}'
    + '.tom-x{border:0;background:#f1f5f9;width:34px;height:34px;border-radius:10px;cursor:pointer;font-size:18px;color:#475569}'
    + '.tom-body{display:grid;grid-template-columns:1fr 1fr;gap:18px;padding:22px}'
    + '@media(max-width:640px){.tom-body{grid-template-columns:1fr}}'
    + '.tom-pane{border:1px solid #eef2f7;border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:12px}'
    + '.tom-label{font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.04em}'
    + '.tom-prod{width:100%;border-radius:12px;object-fit:cover;max-height:230px;background:#f8fafc}'
    + '.tom-drop{border:2px dashed #cbd5e1;border-radius:14px;padding:22px;text-align:center;color:#64748b;cursor:pointer;font-size:13px;transition:.15s}'
    + '.tom-drop:hover{border-color:#7c3aed;color:#7c3aed;background:#faf5ff}'
    + '.tom-preview{position:relative}'
    + '.tom-preview img{width:100%;border-radius:12px;max-height:230px;object-fit:cover}'
    + '.tom-row{display:flex;gap:8px;flex-wrap:wrap}'
    + '.tom-act{flex:1;min-width:90px;border:1px solid #e2e8f0;background:#fff;border-radius:10px;padding:9px;cursor:pointer;font-size:12px;font-weight:600;color:#334155;display:inline-flex;align-items:center;justify-content:center;gap:6px}'
    + '.tom-act:hover{background:#f8fafc}'
    + '.tom-primary{width:100%;border:0;border-radius:12px;padding:13px;cursor:pointer;font-size:14px;font-weight:700;color:#fff;background:linear-gradient(90deg,#7c3aed,#db2777);box-shadow:0 8px 22px rgba(124,58,237,.35)}'
    + '.tom-primary:disabled{opacity:.5;cursor:not-allowed}'
    + '.tom-result{grid-column:1/-1;text-align:center}'
    + '.tom-result img{max-width:100%;border-radius:14px;max-height:60vh}'
    + '.tom-spin{display:flex;flex-direction:column;align-items:center;gap:14px;padding:30px;color:#475569}'
    + '.tom-ring{width:46px;height:46px;border:4px solid #ede9fe;border-top-color:#7c3aed;border-radius:50%;animation:tomSpin 1s linear infinite}'
    + '@keyframes tomSpin{to{transform:rotate(360deg)}}'
    + '.tom-bar{width:80%;height:6px;background:#ede9fe;border-radius:9999px;overflow:hidden}'
    + '.tom-bar i{display:block;height:100%;width:30%;background:linear-gradient(90deg,#7c3aed,#db2777);border-radius:9999px;animation:tomLoad 1.6s ease-in-out infinite}'
    + '@keyframes tomLoad{0%{margin-left:-30%}100%{margin-left:100%}}'
    + '.tom-err{background:#fef2f2;color:#b91c1c;border:1px solid #fecaca;border-radius:10px;padding:10px 12px;font-size:13px}'
    + '.tom-foot{padding:0 22px 18px;font-size:11px;color:#94a3b8;text-align:center}';

  function injectCSS() {
    if (document.getElementById("tom-css")) return;
    var s = document.createElement("style");
    s.id = "tom-css";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15l-1.9-4.1L5.5 9l4.6-1.4z"/></svg>';

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function toDataUrl(file, cb) {
    var r = new FileReader();
    r.onload = function () { cb(r.result); };
    r.readAsDataURL(file);
  }

  /* --------------------------- the popup --------------------------- */
  function openPopup(product) {
    var userImg = null; // data URL
    var stream = null;

    var overlay = el("div", "tom-overlay");
    var modal = el("div", "tom-modal");
    overlay.appendChild(modal);

    function close() {
      if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
      overlay.remove();
    }
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });

    var head = el("div", "tom-head");
    head.appendChild(el("div", "tom-title", ICON + ' <span>Try On with <b>TryOnMe</b></span>'));
    var x = el("button", "tom-x", "&times;");
    x.onclick = close;
    head.appendChild(x);
    modal.appendChild(head);

    var body = el("div", "tom-body");
    modal.appendChild(body);

    function render(state, data) {
      body.innerHTML = "";
      if (state === "loading") {
        var s = el("div", "tom-spin tom-result");
        s.appendChild(el("div", "tom-ring"));
        s.appendChild(el("div", null, "<b>Generating your try-on…</b>"));
        s.appendChild(el("div", null, "Our AI is fitting the garment to you. This can take 10–25s."));
        var bar = el("div", "tom-bar", "<i></i>");
        s.appendChild(bar);
        body.appendChild(s);
        return;
      }
      if (state === "result") {
        var r = el("div", "tom-result");
        r.appendChild(el("img", null));
        r.querySelector("img").src = data;
        var row = el("div", "tom-row");
        row.style.marginTop = "14px";
        var dl = el("button", "tom-act", "⬇ Download");
        dl.onclick = function () {
          var a = document.createElement("a"); a.href = data; a.download = "tryonme-result.png"; a.click();
        };
        var sh = el("button", "tom-act", "↗ Share");
        sh.onclick = async function () {
          try {
            var blob = await (await fetch(data)).blob();
            var f = new File([blob], "tryonme.png", { type: blob.type });
            if (navigator.canShare && navigator.canShare({ files: [f] })) {
              await navigator.share({ files: [f], title: "My TryOnMe look" });
            } else { alert("Sharing not supported on this device."); }
          } catch (e) {}
        };
        var again = el("button", "tom-act", "↺ Try another photo");
        again.onclick = function () { userImg = null; render("upload"); };
        row.appendChild(dl); row.appendChild(sh); row.appendChild(again);
        r.appendChild(row);
        body.appendChild(r);
        return;
      }

      // upload state (default)
      var left = el("div", "tom-pane");
      left.appendChild(el("div", "tom-label", "Product"));
      var pImg = el("img", "tom-prod");
      pImg.src = product.image;
      left.appendChild(pImg);
      left.appendChild(el("div", null, '<div style="font-weight:600;color:#0f172a;font-size:14px">' + (product.name || "Selected product") + "</div>"));
      body.appendChild(left);

      var right = el("div", "tom-pane");
      right.appendChild(el("div", "tom-label", "Your photo"));
      if (data && data.error) right.appendChild(el("div", "tom-err", data.error));

      if (userImg) {
        var prev = el("div", "tom-preview");
        var pi = el("img"); pi.src = userImg; prev.appendChild(pi);
        right.appendChild(prev);
        var pr = el("div", "tom-row");
        var rm = el("button", "tom-act", "✕ Remove");
        rm.onclick = function () { userImg = null; render("upload"); };
        pr.appendChild(rm);
        right.appendChild(pr);
      } else {
        var drop = el("div", "tom-drop", "📷 Click to upload a full-body photo<br><span style='font-size:11px'>or use your camera below</span>");
        var fileInput = el("input"); fileInput.type = "file"; fileInput.accept = "image/*"; fileInput.style.display = "none";
        fileInput.onchange = function () {
          if (fileInput.files[0]) toDataUrl(fileInput.files[0], function (d) { userImg = d; render("upload"); });
        };
        drop.onclick = function () { fileInput.click(); };
        right.appendChild(drop);
        right.appendChild(fileInput);

        var camBtn = el("button", "tom-act", "📸 Capture from camera");
        camBtn.style.width = "100%";
        camBtn.onclick = function () { startCamera(right, function (d) { userImg = d; render("upload"); }); };
        right.appendChild(camBtn);
      }

      var go = el("button", "tom-primary", "✨ Generate Try-On");
      go.disabled = !userImg;
      go.onclick = function () { submit(); };
      right.appendChild(go);
      body.appendChild(right);
    }

    function startCamera(container, onCapture) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } }).then(function (s) {
        stream = s;
        body.innerHTML = "";
        var pane = el("div", "tom-pane tom-result");
        var video = document.createElement("video");
        video.autoplay = true; video.playsInline = true; video.style.width = "100%"; video.style.borderRadius = "12px"; video.style.maxHeight = "50vh";
        video.srcObject = s;
        pane.appendChild(video);
        var row = el("div", "tom-row");
        var snap = el("button", "tom-primary", "📸 Capture");
        snap.onclick = function () {
          var c = document.createElement("canvas");
          c.width = video.videoWidth; c.height = video.videoHeight;
          c.getContext("2d").drawImage(video, 0, 0);
          s.getTracks().forEach(function (t) { t.stop(); });
          stream = null;
          onCapture(c.toDataURL("image/jpeg", 0.9));
        };
        var cancel = el("button", "tom-act", "Cancel");
        cancel.onclick = function () { s.getTracks().forEach(function (t) { t.stop(); }); stream = null; render("upload"); };
        row.appendChild(snap); row.appendChild(cancel);
        pane.appendChild(row);
        body.appendChild(pane);
      }).catch(function () { render("upload", { error: "Camera access denied or unavailable." }); });
    }

    function submit() {
      render("loading");
      fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": config.apiKey },
        body: JSON.stringify({
          userImage: userImg,
          productImage: product.image,
          productId: product.id,
          productName: product.name,
          productCategory: product.category,
          merchantId: config.merchantId,
          dontSave: !config.autoSave,
        }),
      })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok && res.j.imageUrl) { render("result", res.j.imageUrl); }
          else { render("upload", { error: res.j.error || "Try-on failed. Please try again." }); }
        })
        .catch(function () { render("upload", { error: "Network error. Please try again." }); });
    }

    render("upload");
    modal.appendChild(el("div", "tom-foot", "Powered by TryOnMe · Your photo is processed securely and not shared."));
    document.body.appendChild(overlay);
  }

  /* --------------------- attach buttons to images --------------------- */
  function attach(img) {
    if (img.dataset.tomReady) return;
    img.dataset.tomReady = "1";
    var wrap = el("span", "tom-wrap");
    img.parentNode.insertBefore(wrap, img);
    wrap.appendChild(img);
    var btn = el("button", "tom-btn", ICON + "<span>" + config.buttonText + "</span>");
    btn.type = "button";
    btn.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      openPopup({
        image: img.src,
        id: img.dataset.productId || "",
        name: img.dataset.productName || img.alt || "",
        category: img.dataset.productCategory || "",
      });
    });
    wrap.appendChild(btn);
  }

  function scan() {
    document.querySelectorAll("img[data-tryon]").forEach(attach);
  }

  var TryOnMe = {
    init: function (opts) {
      opts = opts || {};
      if (!opts.apiKey) { console.error("[TryOnMe] apiKey is required"); return; }
      config.apiKey = opts.apiKey;
      config.merchantId = opts.merchantId || null;
      if (opts.buttonText) config.buttonText = opts.buttonText;
      if (opts.autoSave === false) config.autoSave = false;
      injectCSS();
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", scan);
      } else { scan(); }
      // watch for dynamically added products
      try {
        new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
      } catch (e) {}
    },
    // open the popup programmatically for full custom control
    open: function (product) { injectCSS(); openPopup(product); },
    rescan: scan,
  };

  window.TryOnMe = TryOnMe;
})();