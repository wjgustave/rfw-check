// Classify an evidence source by type, from its URL (host) with the title as a
// fallback hint. Used to add a "Source type" column to the exported Sources
// sheet so the authoritative-vs-low-quality mix can be audited at a glance.
// Ordered most-specific first; the low-quality / blocked categories are matched
// up front so they are never mislabelled as something more authoritative.

const HOST_RULES = [
  // ── Low-quality / blocked (matched first) ──
  [/(remapconsulting|mtechaccess|costellomedical|validinsight|lumanity|sourcehealtheconomics|avalere|precisionaq|mtrconsult|hardianhealth|galengrowth|rockhealth|7wireventures)/, 'Consultancy / market-intel'],
  [/(nationalelfservice|specialneedsjungle)/, 'Blog / advocacy'],
  [/wikipedia\.org$/, 'Encyclopedia (Wikipedia)'],
  [/studysmarter/, 'Jobs / recruitment'],
  [/(digitalhealth\.net|htn\.co\.uk|nationalhealthexecutive|pharmaphorum|medscape|bhbusiness|healthcare-brew|healthcareleadernews|distilledpost|nursinginpractice|practicenurse|pulsetoday|medcityhq|galen)/, 'Trade / news media'],

  // ── Authoritative NHS / NICE / audit / gov ──
  [/(^|\.)nice\.org\.uk$/, 'NICE'],
  [/(^|\.)ncdr\.nhs\.uk$/, 'National audit'],
  [/(^|\.)(nacap|nrap)\.org\.uk$/, 'National audit'],
  [/(^|\.)cardiacrehabilitation\.org\.uk$/, 'National audit'],
  [/(^|\.)hqip\.org\.uk$/, 'National audit'],
  [/qof\.digital\.nhs\.uk$/, 'National audit'],
  [/(gettingitrightfirsttime\.co\.uk|(^|\.)model\.nhs\.uk)$/, 'GIRFT / benchmarking'],
  [/mhra\.gov\.uk$/, 'Regulator (MHRA)'],
  [/(gov\.uk|parliament\.uk)$/, 'Government'],
  [/fingertips\.phe\.org\.uk$/, 'Government'],

  // ── Professional bodies / research / academia ──
  [/(rcpsych|rcplondon|rcpch)\.ac\.uk$/, 'Royal College / society'],
  [/(^|\.)rcp\.ac\.uk$/, 'Royal College / society'],
  [/(bacpr\.(com|org)|brit-thoracic\.org\.uk|pcrs-uk\.org|sign\.ac\.uk|bomss\.org|icst\.org\.uk|acpicr\.com)$/, 'Royal College / society'],
  [/(^|\.)nihr\.ac\.uk$/, 'Research (NIHR)'],
  [/(clinicaltrials\.gov|isrctn\.com)$/, 'Trial registry'],
  [/(ncbi\.nlm\.nih\.gov|thelancet\.com|bmj\.com|bjgp\.org|jamanetwork\.com|jacc\.org|nejm\.org|sciencedirect\.com|springer\.com|doi\.org|cochranelibrary\.com|tandfonline\.com|wiley\.com|mdpi\.com|sagepub\.com|cambridge\.org|oup\.com|frontiersin\.org|f1000research\.com|biomedcentral\.com|jmir\.org|researchprotocols\.org)$/, 'Academic journal'],
  [/(ahsnnetwork|healthinnovation|nhsaccelerator|nhsinnovationaccelerator)/, 'Health innovation (AHSN)'],
  [/(nuffieldtrust|kingsfund|nhsconfed|instituteofhealthequity|ohe\.org|sciencemediacentre)/, 'Think tank / policy'],
  [/(bhf\.org\.uk|asthma(andlung)?\.org\.uk|blf\.org\.uk|diabetes\.org\.uk|beateatingdisorders\.org\.uk|rethink\.org|tourettes-action\.org\.uk|versusarthritis\.org|arthritis-uk\.org|thesleepcharity\.org\.uk|addiss\.co\.uk|mcpin\.org)$/, 'Charity / patient org'],

  // ── Generic NHS / academic (after the specific buckets above) ──
  [/(^|\.)nhs\.uk$/, 'NHS official'],
  [/nhsinform\.scot$/, 'NHS official'],
  [/(^|\.)ac\.uk$/, 'Academic / university'],

  // ── Supplier / product sites (best-effort) ──
  [/(bighealth|sleepstation|sleepio|cbte\.co|qbtech|moxo-test|adhdaptive|mymhealth|expertselfcare)/, 'Supplier / product'],
]

export function classifySource(url, title = '') {
  let host = ''
  try { host = new URL(url).hostname.replace(/^www\./, '').toLowerCase() } catch { /* missing/invalid URL */ }
  if (!host) return (url || title) ? 'Other' : 'Unknown'
  for (const [re, type] of HOST_RULES) {
    if (re.test(host)) return type
  }
  return 'Other'
}
