/* ===========================================================================
 *  Poomjai Garden — visitor & booking measurement
 * ---------------------------------------------------------------------------
 *  TO SWITCH ON: paste your GA4 Measurement ID below (it looks like
 *  "G-XXXXXXXXXX"), save, and deploy. Until then this file loads nothing and
 *  sends nothing — the click tracking still runs, it simply has nowhere to
 *  report to yet.
 *
 *  Why this file exists: the sale happens on Ticketmelon, not here. Page views
 *  alone cannot tell you whether anyone reached the checkout, so every
 *  outbound booking link is tracked as an event with the tour and language
 *  attached. That is the number worth watching.
 * ======================================================================== */

var GA_MEASUREMENT_ID = 'G-1Q1J4QB9E8'; // live

(function () {
  'use strict';

  var enabled = /^G-[A-Z0-9]+$/i.test(GA_MEASUREMENT_ID);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  if (enabled) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);
  }

  /* ---- what page is this, in business terms ---- */
  function pageContext() {
    var p = location.pathname.replace(/\/index\.html$/, '/');
    var lang = /^\/th(\/|$)/.test(p) ? 'th' : 'en';
    var m = p.match(/experiences\/([a-z-]+)\.html$/);
    var page = m ? m[1] : (p === '/' || p === '/th/' ? 'homepage' : p);
    return { language: lang, page_group: page };
  }

  /* ---- classify an outbound link ---- */
  function destinationOf(href) {
    if (/ticketmelon\.com/i.test(href)) return 'ticketmelon';
    if (/linktr\.ee/i.test(href))       return 'linktree';
    if (/^tel:/i.test(href))            return 'phone';
    if (/^mailto:/i.test(href))         return 'email';
    if (/m\.me|messenger/i.test(href))  return 'messenger';
    if (/instagram\.com/i.test(href))   return 'instagram';
    if (/facebook\.com/i.test(href))    return 'facebook';
    if (/maps\.(app\.)?goo/i.test(href) || /google\.[a-z.]+\/maps/i.test(href)) return 'directions';
    return null;
  }

  /* ---- where on the page was it clicked ---- */
  function placementOf(el) {
    if (el.closest('.flagship'))          return 'flagship';
    if (el.closest('.pricing__card'))     return 'price_card';
    if (el.closest('.detail-actions'))    return 'page_cta';
    if (el.closest('.site-header'))       return 'header';
    if (el.closest('.site-footer'))       return 'footer';
    if (el.closest('.chat-fab'))          return 'chat_button';
    if (el.closest('.activity'))          return 'experience_card';
    return 'body';
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var dest = destinationOf(href);
    if (!dest) return;

    var ctx = pageContext();
    var payload = {
      destination: dest,
      placement: placementOf(a),
      page_group: ctx.page_group,
      language: ctx.language,
      link_text: (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
      link_url: href
    };

    // A booking click is the closest thing this site has to revenue.
    var isBooking = dest === 'ticketmelon' || dest === 'linktree';
    if (enabled) gtag('event', isBooking ? 'booking_click' : 'contact_click', payload);

    // Always leave a trace so the tracking can be checked before GA is live.
    window.dataLayer.push({ event: isBooking ? 'booking_click' : 'contact_click', payload: payload });
  }, true);

  /* Lets you confirm tracking works from the browser console:
     __poomjaiTracking()  ->  { configured, events } */
  window.__poomjaiTracking = function () {
    return {
      configured: enabled,
      measurement_id: enabled ? GA_MEASUREMENT_ID : '(not set)',
      events: window.dataLayer.filter(function (d) { return d && d.event && d.payload; })
    };
  };
})();
