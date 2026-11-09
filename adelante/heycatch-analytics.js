/*
 * HeyCatch analytics for Adelante public landing pages.
 * Browser-side public project key only. Never pass lead-form field values to analytics.
 * The SDK is not requested or initialised until the visitor has opted in.
 *
 * Static site: pinned @heycatch/sdk@0.8.3 ESM build; review newer versions before upgrading.
 */
(function () {
  'use strict';

  const PROJECT_KEY = 'hck_pk_VAxr_zEBtfnIpFBDcBbQhakhETtXFSzE';
  const SDK_URL = 'https://cdn.jsdelivr.net/npm/@heycatch/sdk@0.8.3/+esm';
  const CONSENT_KEY = 'adelante_heycatch_consent_v1';
  const blockedByBrowser = navigator.globalPrivacyControl === true ||
    navigator.doNotTrack === '1' || window.doNotTrack === '1';
  let client = null;
  let enabled = false;
  let pending = null;

  function readChoice() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (_) { return null; }
  }
  function writeChoice(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (_) { /* transient choice */ }
  }
  function cleanEvent(event) {
    // Never forward fields from an enquiry form or a URL's query/fragment.
    if (event && event.properties && typeof event.properties === 'object') {
      const props = event.properties;
      Object.keys(props).forEach(function (key) {
        if (/(email|phone|password|token|secret|form_value|input_value|message|full_name|business_name)/i.test(key)) {
          delete props[key];
          return;
        }
        if (/(url|referr|href)/i.test(key) && typeof props[key] === 'string') {
          try {
            const parsed = new URL(props[key], window.location.origin);
            if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
              props[key] = parsed.origin + parsed.pathname;
            } else {
              delete props[key];
            }
          } catch (_) {
            delete props[key];
          }
        }
      });
    }
    return event;
  }
  async function start() {
    if (!enabled || blockedByBrowser || client || pending) return;
    pending = import(SDK_URL);
    try {
      const sdk = await pending;
      const analytics = sdk.analytics || (sdk.default && sdk.default.analytics);
      if (!analytics || typeof analytics.init !== 'function') {
        throw new Error('HeyCatch analytics export not found');
      }
      analytics.init({
        projectKey: PROJECT_KEY,
        autocapture: false,
        maskAllText: true,
        maskAllElementAttributes: true,
        optOutCapturingByDefault: true,
        respectDnt: true,
        collectIp: false,
        persistence: 'localStorage',
        requestBatching: false,
        beforeSend: cleanEvent
      });
      client = analytics;
      if (enabled && !blockedByBrowser) analytics.optInCapturing();
    } catch (err) {
      console.error('Adelante: HeyCatch analytics did not start', err);
    } finally {
      pending = null;
    }
  }
  function choose(allow) {
    enabled = !!allow && !blockedByBrowser;
    writeChoice(allow ? 'allow' : 'deny');
    if (!enabled && client && typeof client.optOutCapturing === 'function') {
      client.optOutCapturing();
    }
    const dialog = document.getElementById('adelante-analytics-choice');
    if (dialog) dialog.remove();
    if (enabled) start();
  }
  function showChoices() {
    if (document.getElementById('adelante-analytics-choice')) return;
    const wrap = document.createElement('aside');
    wrap.id = 'adelante-analytics-choice';
    wrap.setAttribute('role', 'region');
    wrap.setAttribute('aria-label', 'Analytics preferences');
    wrap.innerHTML =
      '<strong>Optional website analytics</strong>' +
      '<p>Help us see which Adelante pages bring enquiries. HeyCatch measures visits and selected actions, not your form answers. It stays off unless you agree. ' +
      '<a href="/privacy.html">Read our privacy policy</a>.</p>' +
      (blockedByBrowser
        ? '<p>Your browser is signalling a tracking opt-out, so analytics stays disabled.</p><button type="button" data-consent="deny">Close</button>'
        : '<div class="adelante-analytics-actions"><button type="button" data-consent="deny">Decline</button>' +
          '<button type="button" data-consent="allow">Allow analytics</button></div>');
    document.body.appendChild(wrap);
    wrap.addEventListener('click', function (event) {
      const button = event.target.closest('button[data-consent]');
      if (button) choose(button.getAttribute('data-consent') === 'allow');
    });
  }
  function installControls() {
    const css = document.createElement('style');
    css.textContent =
      '#adelante-analytics-choice{position:fixed;z-index:9999;bottom:18px;left:18px;max-width:420px;box-sizing:border-box;padding:20px;background:#fffdfa;color:#13243a;' +
      'border:1px solid #dcd2bf;border-radius:12px;box-shadow:0 12px 35px rgba(12,24,35,.23);font:14px/1.5 system-ui,sans-serif}' +
      '#adelante-analytics-choice strong{font-size:16px}#adelante-analytics-choice p{margin:8px 0 14px}' +
      '#adelante-analytics-choice a{color:#8a442f;text-decoration:underline}' +
      '.adelante-analytics-actions{display:flex;gap:10px;flex-wrap:wrap}' +
      '#adelante-analytics-choice button{cursor:pointer;padding:10px 14px;border-radius:6px;font:inherit;border:1px solid #b5532f;background:white;color:#13243a}' +
      '#adelante-analytics-choice button[data-consent="allow"]{background:#b5532f;color:white}' +
      '#adelante-analytics-choice button:focus-visible{outline:3px solid #1f4e79;outline-offset:2px}' +
      '@media(max-width:480px){#adelante-analytics-choice{left:10px;right:10px;bottom:10px;max-width:none}}';
    document.head.appendChild(css);
    const footer = document.querySelector('footer');
    if (footer) {
      const link = document.createElement('a');
      link.href = '#analytics-preferences';
      link.textContent = 'Analytics preferences';
      link.style.cssText = 'font-size:13px;display:inline-block;color:inherit;text-decoration:underline;cursor:pointer;';
      link.addEventListener('click', function (event) {
        event.preventDefault();
        showChoices();
      });
      footer.appendChild(link);
    }
  }
  function track(eventName, properties) {
    if (enabled && client && typeof client.track === 'function') {
      client.track(eventName, properties);
    }
  }

  document.addEventListener('click', function (event) {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    let action = null;
    if (href.indexOf('wa.me/') !== -1) action = 'whatsapp';
    else if (href.indexOf('tel:') === 0) action = 'phone';
    else if (href.indexOf('mailto:') === 0) action = 'email';
    else if (href.indexOf('#get-report') !== -1 || href.indexOf('#book-call') !== -1) action = 'review_cta';
    if (action) track('adelante_cta_clicked', { action: action, page: location.pathname });
  });
  document.addEventListener('adelante:lead-success', function () {
    track('adelante_review_enquiry_sent', { page: location.pathname });
  });

  installControls();
  if (!blockedByBrowser && readChoice() === 'allow') {
    enabled = true;
    start();
  } else if (readChoice() === null && !blockedByBrowser) {
    showChoices();
  }
})();
