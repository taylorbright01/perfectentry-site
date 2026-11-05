// Public configuration only. Never put Whop secrets or Supabase service keys here.
export const config = Object.freeze({
  indicatorApiUrl: 'https://perfect-view-private.perfectentry.workers.dev/api/studies/calculate',
  feedUrl: 'https://perfectview.th3flow.world/',
  // Preserve existing drawing/workspace keys when switching data delivery.
  workspaceFeedId: 'https://nmfsqgqwjihpudiqnuwh.supabase.co/functions/v1/perfect-view-feed',
  // Public broker candles remain free when member access is enabled.
  feedBaseTimeframe: 30,
  refreshSeconds: 30,
  availableSymbols: ['AUDCAD','AUDCHF','AUDNZD','AUDUSD','BTCUSD','CADJPY','CHFJPY','ETHUSD','EURAUD','EURCAD','EURGBP','EURJPY','EURNZD','EURUSD','GBPAUD','GBPCAD','GBPCHF','GBPJPY','GBPUSD','NAS100','NZDCAD','NZDCHF','NZDJPY','NZDUSD','USDCAD','USDCHF','USDJPY','XAGUSD','XAUUSD'],
  accountApiUrl: null, // Set to the deployed perfect-view-accounts Worker URL.
  requireMembership: false, // Gates signals and proprietary studies, never public charts. Enable after the account Worker and product IDs are verified.
  historyUrl: 'https://perfectview.th3flow.world/',
  loginUrl: null, // Set when the shared server-side Whop OAuth flow is deployed.
  workspaceUrl: null // Reserved for authenticated, per-account server persistence.
});
