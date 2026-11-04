(() => {
  // One list drives the industry switcher, the industry grid and the calculator defaults.
  const INDUSTRIES = [
    { slug: 'hospitality', file: 'hospitality.html', name: 'Hospitality groups', short: '3 to 8 venues', d: { enq: 10, val: 60, ns: 4, nsv: 45, adm: 10, rate: 25 } },
    { slug: 'restaurants', file: 'restaurants.html', name: 'Bars, restaurants and chiringuitos', short: 'Bars, restaurants, chiringuitos', d: { enq: 12, val: 40, ns: 5, nsv: 40, adm: 8, rate: 25 } },
    { slug: 'real-estate', file: 'real-estate.html', name: 'Real estate', short: 'Agencies and agents', d: { enq: 8, val: 800, ns: 0, nsv: 0, adm: 6, rate: 30 } },
    { slug: 'hotels', file: 'hotels.html', name: 'Hotels and holiday rentals', short: 'Hotels and rental units', d: { enq: 10, val: 600, ns: 2, nsv: 150, adm: 12, rate: 22 } },
    { slug: 'salons', file: 'salons.html', name: 'Salons, barbers and clinics', short: 'Appointment-based', d: { enq: 6, val: 50, ns: 4, nsv: 45, adm: 6, rate: 22 } },
    { slug: 'local-services', file: 'local-services.html', name: 'Local services', short: 'Trades, cleaning, maintenance', d: { enq: 5, val: 350, ns: 0, nsv: 0, adm: 8, rate: 25 } },
    { slug: 'b2b-sales', file: 'b2b-sales.html', name: 'B2B sales and office teams', short: 'Outbound calling teams', d: { enq: 0, val: 0, ns: 0, nsv: 0, adm: 5, rate: 30 } },
    { slug: 'social-media', file: 'social-media.html', name: 'Social media and content agencies', short: 'Agencies, creators, community managers', d: { enq: 6, val: 900, ns: 0, nsv: 0, adm: 10, rate: 30 } }
  ];
  const current = document.body.dataset.industry || '';
  const find = slug => INDUSTRIES.find(i => i.slug === slug);
  const $ = (id) => document.getElementById(id);
  const eur = n => '€' + Math.round(n).toLocaleString('en-GB');

  // Industry switcher: every page has one, so a visitor can jump to their own industry from anywhere.
  const sel = $('industry-select');
  if (sel) {
    const opts = INDUSTRIES.map(i => `<option value="${i.file}" ${i.slug === current ? 'selected' : ''}>${i.name}</option>`).join('');
    sel.innerHTML = `<option value="" ${current ? '' : 'selected'} disabled>Choose your industry</option>` + opts;
    sel.addEventListener('change', () => { if (sel.value) window.location.href = sel.value; });
  }

  // Industry grid on the home page.
  const grid = $('industry-grid');
  if (grid) {
    grid.innerHTML = INDUSTRIES.map(i => `<a href="${i.file}"><b>${i.name}</b><span>${i.short}</span></a>`).join('');
  }

  // Calculator: defaults come from the industry; every number can be changed.
  const calcBox = $('calc');
  if (calcBox) {
    const base = find(current) || INDUSTRIES[0];
    const d = base.d;
    calcBox.innerHTML = `
      <form id="calc-form">
        <label>Enquiries you miss in a typical week <span class="hint">Calls, DMs and emails with no reply within an hour</span>
          <input id="c-enq" type="number" min="0" value="${d.enq}"></label>
        <label>Average value of one booking, €
          <input id="c-val" type="number" min="0" value="${d.val}"></label>
        <label>No-shows or late cancellations in a typical week
          <input id="c-ns" type="number" min="0" value="${d.ns}"></label>
        <label>Value of one empty slot, €
          <input id="c-nsv" type="number" min="0" value="${d.nsv}"></label>
        <label>Hours a week your team or owner spends on admin
          <input id="c-adm" type="number" min="0" value="${d.adm}"></label>
        <label>Hourly cost of that time, €
          <input id="c-rate" type="number" min="0" value="${d.rate}"></label>
        <label>Share of missed enquiries you would win back: <output id="c-rec-out">30</output>%
          <input id="c-rec" type="range" min="0" max="80" value="30"><span class="hint">Our assumption. Lower it to test a cautious case.</span></label>
      </form>
      <aside class="result" aria-live="polite">
        <h3 style="font-family:var(--body);font-size:1rem;font-weight:600;color:#F6D2BF">Estimated leak you could recover, per year</h3>
        <div class="big" id="c-total">€0</div>
        <div class="rows">
          <div><span>Bookings won back from missed enquiries</span><b id="c-r-enq">€0</b></div>
          <div><span>No-shows prevented, half of empty slots</span><b id="c-r-ns">€0</b></div>
          <div><span>Admin time handed back, half of hours</span><b id="c-r-adm">0 h</b></div>
        </div>
        <p class="how">Working: missed enquiries × 52 × win-back share × booking value. No-shows × 52 × 50% × slot value. Admin hours × 52 × 50% × hourly cost. An estimate from your inputs, not a guarantee. We discuss these assumptions in your free review; detailed validation can follow in a paid deep dive.</p>
        <a class="btn" href="#get-report">Request my free review</a>
      </aside>`;
    const calc = () => {
      const v = id => Math.max(0, parseFloat($(id).value) || 0);
      const share = v('c-rec') / 100;
      const enq = v('c-enq') * 52 * share * v('c-val');
      const ns = v('c-ns') * 52 * 0.5 * v('c-nsv');
      const hours = v('c-adm') * 52 * 0.5;
      const adm = hours * v('c-rate');
      $('c-rec-out').textContent = Math.round(share * 100);
      $('c-total').textContent = eur(enq + ns + adm);
      $('c-r-enq').textContent = eur(enq);
      $('c-r-ns').textContent = eur(ns);
      $('c-r-adm').textContent = Math.round(hours).toLocaleString('en-GB') + ' h (' + eur(adm) + ')';
    };
    $('calc-form').addEventListener('input', calc);
    calc();
  }

  // Free business review request form. Industry, business name, email and phone are required.
  const leadBox = $('lead');
  if (leadBox) {
    leadBox.innerHTML = `
      <form class="lead-form" id="lead-form" novalidate>
        <label>Industry <span class="req">*</span>
          <select id="l-industry" required>
            <option value="" disabled ${current ? '' : 'selected'}>Choose your industry</option>
            ${INDUSTRIES.map(i => `<option value="${i.slug}" ${i.slug === current ? 'selected' : ''}>${i.name}</option>`).join('')}
          </select></label>
        <label>Business name <span class="req">*</span>
          <input id="l-business" type="text" required autocomplete="organization"></label>
        <label>Work email <span class="req">*</span>
          <input id="l-email" type="email" required autocomplete="email"></label>
        <label>Phone <span class="req">*</span>
          <input id="l-phone" type="tel" required autocomplete="tel"></label>
        <label>Preferred days and times <span class="hint">Optional, please include your time zone</span>
          <input id="l-time" type="text" placeholder="For example: Tuesday afternoon, Spain time"></label>
        <label>Your name <span class="hint">Optional</span>
          <input id="l-name" type="text" autocomplete="name"></label>
        <label>What would you most like to fix? <span class="hint">Optional, a sentence or two</span>
          <textarea id="l-overview" rows="3" placeholder="For example: we miss enquiries at weekends and invoices take my evenings."></textarea></label>
        <label class="check"><input id="l-consent" type="checkbox" required> <span>I agree that Adelante may contact me to arrange my free AI &amp; Business Efficiency Review. <span class="req">*</span></span></label>
        <div class="error" id="l-error" role="alert"></div>
        <button class="btn" type="submit">Request my free review</button>
        <p class="hint">Free 30-minute session. No obligation. We will contact you to agree a time.</p>
      </form>
      <div class="confirm" id="l-confirm" role="status"></div>`;
    const form = $('lead-form');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const required = ['l-industry', 'l-business', 'l-email', 'l-phone'];
      const missing = required.filter(id => !$(id).value.trim());
      const consent = $('l-consent').checked;
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('l-email').value.trim());
      const phoneOk = /^\+?[0-9 ()-]{7,}$/.test($('l-phone').value.trim());
      let msg = '';
      if (missing.length) msg = 'Please complete industry, business name, email and phone.';
      else if (!emailOk) msg = 'Please enter a valid email address.';
      else if (!phoneOk) msg = 'Please enter a valid phone number.';
      else if (!consent) msg = 'Please tick the consent box so we can arrange your review.';
      $('l-error').textContent = msg;
      if (msg) {
        const first = missing[0] ? $(missing[0]) : (!emailOk ? $('l-email') : (!phoneOk ? $('l-phone') : $('l-consent')));
        first.focus();
        return;
      }
      const name = $('l-name').value.trim();
      const business = $('l-business').value.trim();
      const email = $('l-email').value.trim();
      const phone = $('l-phone').value.trim();
      const industry = $('l-industry').options[$('l-industry').selectedIndex].text;
      const conf = $('l-confirm');
      const btn = form.querySelector('button[type="submit"]');
      const done = () => {
        conf.textContent = `Thanks${name ? ', ' + name : ''}. We have received your free review request for ${business}. We will contact you at ${email} or ${phone} to agree a time. Your session is not booked until we confirm it.`;
        conf.classList.add('show');
        form.reset();
        btn.disabled = false;
      };
      const overview = $('l-overview').value.trim();
      const payload = {
        _subject: 'ADELANTE FREE AI & BUSINESS EFFICIENCY REVIEW: ' + business + ' (' + industry + ')',
        industry, business, name, email, phone, preferred_time: $('l-time').value.trim() || '-', offer: 'Free 30-minute AI & Business Efficiency Review', overview: overview || '-', page: location.pathname,
        _template: 'table', _captcha: 'false',
        _autoresponse: `Hi${name ? ' ' + name : ''},\n\nThanks for requesting your free 30-minute AI & Business Efficiency Review with Adelante by VYRE. We will contact you to agree a time. Your session is not booked until we confirm it. We have your details:\n\nBusiness: ${business}\nIndustry: ${industry}\nEmail: ${email}\nPhone: ${phone}\n\nIf you have a moment, reply to this email with a high-level overview of what you would most like to fix, and someone will get back to you shortly.\n\nIf it is urgent, message or call Dean on WhatsApp: +34 711 018 011.\n\nAdelante by VYRE, Marbella\ndean@vyrehq.com`
      };
      btn.disabled = true;
      fetch('https://formsubmit.co/ajax/dean@vyrehq.com', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload)
      }).then(async r => { if (!r.ok) throw new Error(r.status); const result = await r.json(); if (result.success !== true && result.success !== 'true') throw new Error('Submission was not accepted'); done(); }).catch(() => {
        // Fallback: send the same details by WhatsApp so no lead is lost.
        const text = encodeURIComponent(`Hi Adelante, I'd like to arrange my free 30-minute AI & Business Efficiency Review.\nIndustry: ${industry}\nBusiness: ${business}\nName: ${name || '-'}\nEmail: ${email}\nPhone: ${phone}\nWhat I'd like to fix: ${overview || '-'}`);
        btn.disabled = false;
        conf.textContent = 'Your request could not be sent through the form. Please send it through WhatsApp below, or email dean@vyrehq.com. Your session is not booked yet.';
        const fallback = document.createElement('a');
        fallback.href = 'https://wa.me/34711018011?text=' + text;
        fallback.target = '_blank';
        fallback.rel = 'noopener';
        fallback.className = 'btn';
        fallback.textContent = 'Send my review request on WhatsApp';
        conf.appendChild(document.createElement('br'));
        conf.appendChild(fallback);
        conf.classList.add('show');
      });
    });
  }
})();
