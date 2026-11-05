import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {articles} from '../content/learn/articles.mjs';
export const editorialPaths=[...articles.map(a=>'learn/'+a.slug+'/index.html'),'learn/taylor-bright/index.html'];
export const routes=[
 ['index.html','Home','Your charts. Your rules.','home'],
 ['learn/index.html','Learn','Practical guides to charts, signals and trading research','learn'],
 ['perfect-view.html','Perfect View','Free charts and standard indicators','tools'],
 ['screener.html','Session Screener','Explore research-based session windows','tools'],
 ['freepropcalc/index.html','Payout Calculator','Check the maths against your firm’s rules','tools'],
 ['currencyai-explained.html','How CurrencyAI works','See how the tool filters trade candidates','currency'],
 ['signals.html','Live Signals','Follow CurrencyAI-approved signals','currency'],
 ['currencyai.html','CurrencyAI results','Explore the system’s realised results','currency'],
 ['counterfactual.html','Filter Comparison','Compare approved and rejected candidates','currency'],
 ['wheel.html','Currency Pressure','Explore recent currency-side outcomes','currency'],
 ['network.html','Currency Network','See the relationships across currencies','currency'],
 ['data.html','Reversal Sniper study','Explore this method’s historical dataset','research'],
 ['ledger.html','Signal Ledger','Check published signal commitments','research']
];
const membership='https://whop.com/perfect-entry/perfect-entry/';
const brand=prefix=>`<img class="pe-brand-logo" src="${prefix}assets/logo.png" alt="Perfect Entry" width="220" height="76">`;
export function shell(path){
 const prefix='../'.repeat(path.split('/').length-1)||'./',href=p=>p==='index.html'?prefix:prefix+p.replace(/index\.html$/,'');
 const item=([p,label,desc])=>`<a href="${href(p)}"${p===path?' aria-current="page"':''}>${label}<small>${desc}</small></a>`;
 const group=(name,type)=>`<details class="pe-dropdown"><summary>${name}</summary><div class="pe-dropdown-menu">${routes.filter(r=>r[3]===type).map(item).join('')}</div></details>`;
 const mobile=type=>routes.filter(r=>r[3]===type).map(([p,label])=>`<a href="${href(p)}"${p===path?' aria-current="page"':''}>${label}${p==='perfect-view.html'?'<span>Free charts</span>':''}</a>`).join('');
 const header=`<!-- pe:header:start --><a class="pe-skip" href="#pe-main">Skip to content</a><header class="pe-header"><nav class="pe-nav" aria-label="Main navigation"><a class="pe-brand" href="${prefix}" aria-label="Perfect Entry home">${brand(prefix)}</a><div class="pe-links"><a href="${href('perfect-view.html')}"${path==='perfect-view.html'?' aria-current="page"':''}>Charts</a>${group('Tools','tools')}${group('CurrencyAI','currency')}${group('Research','research')}<a href="${href('learn/index.html')}"${path.startsWith('learn/')?' aria-current="page"':''}>Learn</a><a href="${prefix}#membership">Membership</a></div><a class="pe-join" href="${membership}">Join Perfect Entry ↗</a><details class="pe-mobile"><summary>Menu <span aria-hidden="true">☰</span></summary><div class="pe-mobile-menu"><a href="${prefix}"${path==='index.html'?' aria-current="page"':''}>Home</a><b>Charts &amp; tools</b>${mobile('tools')}<b>CurrencyAI</b>${mobile('currency')}<b>Research</b>${mobile('research')}<b>Learning</b>${mobile('learn')}<a href="${prefix}learn/taylor-bright/">About the author</a><a href="${prefix}#membership" class="pe-menu-join">Membership →</a><a href="${prefix}#contact">Contact &amp; support</a></div></details></nav></header><!-- pe:header:end -->`;
 const footer=`<!-- pe:footer:start --><footer class="pe-footer"><div class="pe-footer-grid"><div><a class="pe-brand" href="${prefix}">${brand(prefix)}</a><p>Tools, research and a community for a clearer trading process.</p><a href="${href('perfect-view.html')}">Open free charts ↗</a></div><div><h2>Charts &amp; tools</h2>${routes.filter(r=>r[3]==='tools').map(([p,l])=>`<a href="${href(p)}">${l}</a>`).join('')}<a href="${href('signals.html')}">Live Signals</a></div><div><h2>Explore the research</h2>${routes.filter(r=>r[3]==='research'||r[0]==='currencyai.html'||r[0]==='currencyai-explained.html'||r[0]==='counterfactual.html').map(([p,l])=>`<a href="${href(p)}">${l}</a>`).join('')}<a href="${href('wheel.html')}">Currency Pressure</a><a href="${href('network.html')}">Currency Network</a></div><div><h2>Get involved</h2><a href="${prefix}learn/">Trading guides</a><a href="${prefix}learn/taylor-bright/">About Taylor Bright</a><a href="${membership}">Membership on Whop ↗</a><a href="https://discord.gg/JStn5fBRgK">Discord community ↗</a><a href="${prefix}#faq">Questions &amp; answers</a><a href="${prefix}#contact">Contact &amp; support</a><a href="${prefix}privacy.html">Privacy</a><a href="${prefix}terms.html">Terms &amp; risk</a></div></div><div class="pe-footer-bottom"><span>© ${new Date().getUTCFullYear()} Perfect Entry</span><p>Educational software and research. Trading involves risk, including loss of capital. Historical, backtested and illustrative results do not guarantee future performance. You choose your own trades and risk.</p></div></footer><!-- pe:footer:end -->`;
 return {header,footer,prefix};
}
// Regenerate shared navigation after editing routes. Page content is left intact.
if(process.argv[1]===fileURLToPath(import.meta.url)){
 for(const [path] of [...routes,['privacy.html'],['terms.html'],['0-1m.html'],...editorialPaths.map(p=>[p])]){
  const file=resolve(import.meta.dirname,'..',path),{header,footer}=shell(path);
  let html=await readFile(file,'utf8');
  html=html.replace(/<!-- pe:header:start -->[\s\S]*?<!-- pe:header:end -->/,header).replace(/<!-- pe:footer:start -->[\s\S]*?<!-- pe:footer:end -->/,footer);
  await writeFile(file,html);
 }
 console.log('Shared navigation updated; the university page stays unlisted.');
}
