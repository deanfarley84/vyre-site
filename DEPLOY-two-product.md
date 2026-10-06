# vyrehq.com two-product restructure (draft, 6 Oct 2026)

Files changed or added in deanfarley84/vyre-site:
- index.html   REPLACED: short homepage fork (VYRE OS / VYRE Embedded), shared method summary, About, cross-product FAQ
- os.html      NEW: the previous homepage content, re-homed for merchants, independence claims scoped to merchant reviews
- embedded.html NEW: VYRE Embedded page for gateways, PSPs and acquirers, with a partner briefing form
- logo.png, logo-footer.png NEW: logos extracted from the old inline base64 (smaller pages)
- sitemap.xml  UPDATED with the two new URLs

Not changed: privacy.html, thank-you.html, dean-farley.jpg, favicon.svg, og-image.png, robots.txt, CNAME.
Still to delete by hand: the stray "github drop/" folder.

To go live: copy these files into the vyre-site repo root, commit, push to main.
Old anchors (#how, #method, #cta ...) now live on /os.html, so any LinkedIn links to vyrehq.com/#cta
should become vyrehq.com/os.html#cta.
