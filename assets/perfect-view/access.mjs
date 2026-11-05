// Product scope only. The calculation service must enforce membership itself.
// Public candles, drawings and standard studies never depend on paid access.
export function canUseStudy(definition,config,account){
 if(!definition?.remote)return true;
 if(!config.requireMembership)return true;
 return Boolean(config.accountApiUrl&&account?.token&&account?.access?.perfectView===true);
}
