/* ============================================================================
   FCV Restoration & Construction — shared form handler
   ----------------------------------------------------------------------------
   Used by contact.html and pricing.html.

   1. Deploy Code.gs as a Google Apps Script Web App (see SETUP-GUIDE.md).
   2. Paste the Web App URL (ends in /exec) into ENDPOINT below.
   That is the only place the URL needs to live.
   ========================================================================== */
(function () {
  'use strict';

  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbxuu9NV3gybB4q-kB6mXU1CfUADwSPmtGKIKVQgeVar1k8B_xAeVM7vme2I693Id34/exec';
  var THANK_YOU_PAGE = 'thank-you.html';
  var TIMEOUT_MS = 30000; // Apps Script writes the row AND sends 2 emails before it answers

  function isConfigured() {
    return /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec/.test(ENDPOINT);
  }

  /**
   * Sends a submission to the Google Sheet / email backend, then redirects the
   * visitor to the thank-you page. Rejects if the request cannot be sent, so
   * callers can show an error and let the visitor try again.
   */
  function send(formType, payload) {
    if (!isConfigured()) {
      console.error('[FCV forms] ENDPOINT is not set. Paste your Apps Script Web App URL into forms.js.');
      return Promise.reject(new Error('Form endpoint not configured'));
    }

    var body = {};
    Object.keys(payload).forEach(function (k) { body[k] = payload[k]; });
    body.formType = formType;
    body.submittedAt = body.submittedAt || new Date().toISOString();
    body.pageUrl = body.pageUrl || window.location.href;

    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS) : null;

    // Apps Script web apps do not send CORS headers, so this is a "no-cors"
    // POST (the response is opaque). text/plain keeps it a "simple" request.
    return fetch(ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function () {
      if (timer) clearTimeout(timer);
      window.location.href = THANK_YOU_PAGE + '?form=' + encodeURIComponent(formType);
    }).catch(function (err) {
      if (timer) clearTimeout(timer);
      throw err;
    });
  }

  /* ---------------------------------------------------------------------------
     Contact form (contact.html)
     Runs in the capture phase so Webflow's own form handler never sees the
     submit (it would otherwise try to post to Webflow and show its fail box).
     ------------------------------------------------------------------------ */
  window.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || form.getAttribute('data-fcv-form') !== 'contact') return;

    e.preventDefault();
    e.stopImmediatePropagation();

    var hp = form.querySelector('[name="companyUrl"]');
    if (hp && hp.value) return; // bot

    var btn = form.querySelector('input[type="submit"]');
    var status = form.parentNode.querySelector('.fcv-form-status');
    if (!status) {
      status = document.createElement('div');
      status.className = 'fcv-form-status';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      status.style.cssText = 'margin-top:1rem;font-size:.9375rem;line-height:1.5;color:#a33;';
      form.parentNode.appendChild(status);
    }
    status.textContent = '';

    function val(name) {
      var el = form.querySelector('[name="' + name + '"]');
      return el ? String(el.value || '').trim() : '';
    }

    var email = val('Email');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      status.textContent = 'Please enter a valid email address.';
      return;
    }

    var originalLabel = btn ? btn.value : '';
    if (btn) { btn.disabled = true; btn.value = btn.getAttribute('data-wait') || 'Please wait...'; }

    send('contact', {
      name: val('name'),
      phone: val('Phone-number'),
      email: email,
      subject: val('Subject') || 'General enquiry',
      message: val('Message')
    }).catch(function () {
      status.textContent = 'Something went wrong sending that. Please call (313) 293-2280 or email quote@fcvrestoration.com and we\u2019ll help right away.';
      if (btn) { btn.disabled = false; btn.value = originalLabel; }
    });
  }, true);

  window.FCVForms = { send: send, isConfigured: isConfigured };
})();
