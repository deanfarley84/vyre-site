/**
 * Optional Cloudflare Worker for www.vyrehq.com.
 * Deploy only after DNS is proxied by Cloudflare and all subdomains support HTTPS.
 * Applies to the whole hostname, not only Adelante.
 * GitHub Pages DOES NOT apply _headers, .htaccess, or nginx directives.
 */
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https:",
  "connect-src 'self' https://formsubmit.co https://cdn.jsdelivr.net https://*.heycatch.ai https://*.heycatch.com",
  "form-action 'self' https://formsubmit.co",
  "report-uri /__csp-report",
  "report-to csp-endpoint"
].join("; ");

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const canonicalPath = url.pathname.replace(/\/index\.html$/, "/");

    // Canonicalise both English and Spanish Adelante home routes.
    if (canonicalPath !== url.pathname &&
        (canonicalPath === "/adelante/" || canonicalPath === "/adelante/es/")) {
      url.pathname = canonicalPath;
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }

    // Upgrade the first HTTP request; ensure this Worker route covers HTTP.
    if (url.protocol === "http:") {
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === "/__csp-report" && request.method === "POST") {
      // Logs only directive names, never full browsing URLs or submitted data.
      try {
        const body = await request.json();
        const reports = Array.isArray(body) ? body : [body];
        for (const report of reports.slice(0, 10)) {
          const data = report?.body || report?.["csp-report"] || report || {};
          const directive = data.effectiveDirective || data["effective-directive"] || "unknown";
          const cleaned = String(directive).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
          console.log("csp-violation", cleaned);
        }
      } catch (_) {
        // Never echo a malformed report back to a visitor.
      }
      return new Response(null, { status: 204 });
    }

    const response = await fetch(request);
    const headers = new Headers(response.headers);
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("Content-Security-Policy-Report-Only", CSP_REPORT_ONLY);
    headers.set("Reporting-Endpoints", 'csp-endpoint="' + url.origin + '/__csp-report"');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};