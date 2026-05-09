/**
 * Try On Me — Embeddable Button Widget
 *
 * Usage on any external site (Shopify, WooCommerce, plain HTML, etc.):
 *
 *   <img src="..." data-tryon data-product-id="SKU-123" data-product-name="Anarkali Kurti" />
 *   <script src="https://apparel-ai-try.lovable.app/embed/tryon-button.js" defer></script>
 *
 * Every <img data-tryon> on the page gets a floating "Try it on" pill overlay.
 * Clicking it opens the Try-On flow in a new tab on the Try On Me platform.
 */
(function () {
  var BASE = "https://apparel-ai-try.lovable.app";

  var css = ''
    + '.tryon-wrap{position:relative;display:inline-block;line-height:0}'
    + '.tryon-btn{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);'
    + 'display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border:0;cursor:pointer;'
    + 'background:#fff;color:#0f172a;font:600 12px/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;'
    + 'border-radius:9999px;box-shadow:0 6px 20px rgba(0,0,0,.18);white-space:nowrap;'
    + 'transition:transform .15s ease}'
    + '.tryon-btn:hover{transform:translateX(-50%) scale(1.05)}'
    + '.tryon-btn svg{width:14px;height:14px;color:#7c3aed}';

  function injectCSS() {
    if (document.getElementById('tryon-embed-css')) return;
    var s = document.createElement('style');
    s.id = 'tryon-embed-css';
    s.textContent = css;
    document.head.appendChild(s);
  }

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15l-1.9-4.1L5.5 9l4.6-1.4z"/></svg>';

  function attach(img) {
    if (img.dataset.tryonReady) return;
    img.dataset.tryonReady = '1';

    var wrap = document.createElement('span');
    wrap.className = 'tryon-wrap';
    img.parentNode.insertBefore(wrap, img);
    wrap.appendChild(img);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tryon-btn';
    btn.innerHTML = ICON + '<span>Try it on</span>';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var params = new URLSearchParams({
        image: img.src,
        id: img.dataset.productId || '',
        name: img.dataset.productName || img.alt || '',
      });
      window.open(BASE + '/try-on?' + params.toString(), '_blank', 'noopener');
    });
    wrap.appendChild(btn);
  }

  function scan() {
    document.querySelectorAll('img[data-tryon]').forEach(attach);
  }

  function init() {
    injectCSS();
    scan();
    new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();