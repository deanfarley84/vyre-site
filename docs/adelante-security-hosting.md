# VYRE / Adelante: HTTPS and response-header deployment

Audit: `54621759-a171-4662-9cbe-2950bb93b12f` (`geo-audit@v5`).

Status: **NOT DEPLOYED**. Repo is a static site with a `CNAME` of `www.vyrehq.com`, consistent with GitHub Pages, but its live hosting/DNS control plane must still be confirmed. GitHub Pages does not support custom origin response headers. Do not add a fake `_headers` file or a `<meta>` HSTS tag.

## t_https

1. In the repository's **Settings → Pages**, confirm that `www.vyrehq.com` has a valid TLS certificate and **Enforce HTTPS** is enabled.
2. Confirm `http://www.vyrehq.com/adelante/` redirects to `https://www.vyrehq.com/adelante/`; verify the first redirect response and HTTPS availability.
3. For the required `Strict-Transport-Security: max-age=31536000; includeSubDomains`, configure a controllable edge (for example Cloudflare-proxied DNS with a Worker) in front of the site. **Do not enable includeSubDomains until every subdomain has working HTTPS.** HSTS persists in visitors' browsers for a year.

## t_security_headers and c_duplicate_titles

The optional [Cloudflare Worker](../infra/cloudflare-security-worker.js) is staged, but has not been attached to a domain or deployed. If using Cloudflare, confirm that DNS is proxied and route the Worker to `www.vyrehq.com/*`, including HTTP requests, while keeping GitHub Pages as the origin.

The Worker is designed to:
- return `Strict-Transport-Security: max-age=31536000; includeSubDomains`;
- set `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Referrer-Policy: strict-origin-when-cross-origin`;
- start with `Content-Security-Policy-Report-Only` on all routes, logging only blocked directive names at `/__csp-report`;
- redirect `/adelante/index.html` to `/adelante/` and `/adelante/es/index.html` to `/adelante/es/` with 301 status, retaining query parameters.

The report-only CSP needs a **real one-week monitoring period** and a browser-based review of third-party script/style dependencies before an enforced CSP is selected. The Worker does not claim that this has already been done.

Verify after deploying:

```sh
curl -sSI https://www.vyrehq.com/adelante/
curl -sSI https://www.vyrehq.com/adelante/es/
curl -sSI http://www.vyrehq.com/adelante/
curl -sSI https://www.vyrehq.com/adelante/index.html
curl -sSI https://www.vyrehq.com/adelante/es/index.html
```

Expected: HTTPS on all pages; HTTP upgraded; 301 on both explicit `index.html` paths; HSTS and security headers on final 200 responses.

**Important:** The Worker is an optional deployment artifact. The repo modifications alone cannot enable HSTS or any of these response headers on GitHub Pages.

Sources:
- https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
- https://developers.cloudflare.com/pages/how-to/add-custom-http-headers/
