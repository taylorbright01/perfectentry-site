# Perfect Entry Learn

Public editorial content lives in `content/learn/articles.mjs`. The six launch guides are educational explanations with hypothetical worked examples, not original performance studies or promises of trading returns.

Build after changing article content:

```sh
node scripts/build-learn.mjs
node scripts/site-shell.mjs
node --test tests/learn.test.mjs
```

Commit the source and generated HTML, `learn/feed.xml`, and `sitemap.xml`. Publishing to `main` in **taylorbright01/perfectentry-site** triggers GitHub Pages for perfectentry.store. The private **perfectentry** repository is not the production website.

Each article has a unique title and description, a self-canonical URL, direct answer, worked example, table of contents, source links, related reading, author profile and relevant product CTA. BlogPosting and BreadcrumbList markup describe visible content. The hub has CollectionPage/ItemList markup. FAQ answers remain normal visible content; there is no promise of FAQ rich results or AI citations.

For a substantive revision, set a per-article `modified` date and make the displayed byline and structured data use it together before publishing. Do not refresh dates without changing content. The launch date is 5 November 2026.

Keep claims current. Verify provider rules from primary documentation; examples using a hypothetical 20% limit must never become a claim about a named provider. Keep sample data, backtests, tracked signals and actual executions distinct. Do not add unsupported subscriber counts, earnings claims, credentials or independently reviewed badges.

After launch, inspect the sitemap and article URLs in the site's verified Search Console property. A successful deployment does not guarantee indexing, rankings or AI citations. Track organic visits, useful tool interactions and membership clicks, rather than article count alone.

For later Substack promotion, publish a useful original commentary or example that links to the relevant full guide. No external outreach or Substack posts are part of this launch.
