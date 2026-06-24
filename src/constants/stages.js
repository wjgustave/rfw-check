export const STAGES = [
  {
    id: 'stage1',
    number: 1,
    name: 'Service Maturity',
    question: 'Is the conventional (non-digital) NHS care pathway established and nationally standardised? Score only the maturity of the traditional clinical service — do not consider digital tools, apps, digital adoption or technology readiness.',
    interpretation: {
      high: 'Mature traditional pathway — nationally commissioned and consistently delivered across the NHS',
      medium: 'Partially established pathway — recognised service but inconsistently commissioned or variable across regions',
      low: 'Immature pathway — fragmented, locally provided or inconsistently delivered, with limited national infrastructure'
    },
    dimensions: [
      {
        id: 's1_d1',
        check: 'Is the conventional NHS service established and commissioned?',
        description: 'Established NHS clinical service',
        evidenceSources: [
          'NHS England national service specifications',
          'NHS commissioning / standard contract data',
          'GIRFT specialty reports and standardised pathways',
          'National audits confirming routine delivery (e.g. NACR, NACAP)'
        ],
        criteria: {
          low: 'No established conventional NHS service for this condition; care is fragmented, locally improvised or reliant on individual clinicians, with no recognised national service or care model.',
          medium: 'A recognised NHS service exists but is inconsistently commissioned — delivered as a defined service in some areas and ad hoc or absent in others; no single national commissioning basis.',
          high: 'The conventional clinical service is a nationally commissioned NHS service or recognised national care model, routinely delivered as standard practice across England (e.g. NHS Talking Therapies, structured diabetes services). Local-only or pilot provision does not qualify.'
        },
        bands: {
          low: 'More than the fragmented floor: the service is delivered in a handful of areas or by individual providers, but it is not yet a recognised NHS service even regionally and has no commissioning basis — provision depends on local initiative rather than any established model.',
          high: 'The service is recognised and routinely commissioned across most of the country, functioning as a near-national model, but commissioning is not yet fully consistent or nationally mandated and some areas still lack a defined service.'
        }
      },
      {
        id: 's1_d2',
        check: 'Is the conventional service consistently available across the country?',
        description: 'National availability & consistency',
        evidenceSources: [
          'NHS Atlas of Variation',
          'National audit coverage reports (participating providers, referral rates)',
          'Model Health System metrics',
          'ICB service availability / commissioning statements'
        ],
        criteria: {
          low: 'Highly variable or geographically concentrated provision; available in only a minority of ICBs, with large unwarranted variation and major access gaps.',
          medium: 'Available in many but not all ICBs; meaningful regional variation in access, capacity or delivery remains.',
          high: 'The conventional service is available across all or nearly all ICBs with low unwarranted variation, evidenced by a named national audit, the NHS Atlas of Variation or Model Health System. Equitable national access is the norm, not the exception.'
        },
        bands: {
          low: 'Available in a growing but still limited set of areas — more than isolated provision, yet well short of broad coverage; access remains patchy with substantial geographic gaps and high variation.',
          high: 'Available in most ICBs with variation narrowing and coverage approaching national, but access is not yet near-universal or low variation is not yet confirmed by a named national source.'
        }
      },
      {
        id: 's1_d3',
        check: 'Is there a defined national pathway or service specification?',
        description: 'National specification & defined pathway',
        evidenceSources: [
          'NHS England national service specifications',
          'Nationally defined care pathways',
          'NICE guidelines (NG / CG)',
          'Royal College / specialty society pathway standards'
        ],
        criteria: {
          low: 'No national service specification or nationally defined pathway; care is shaped by local protocols, with no agreed national standard.',
          medium: 'A pathway or specification exists but is partial, in development, or applied inconsistently — e.g. national guidance exists but no binding service specification, or regional pathways without national consistency.',
          high: 'A published national service specification or nationally defined clinical pathway sets the standard for delivery across all ICBs, typically underpinned by a NICE guideline or specialty-society standard. Local or draft specifications alone do not qualify.'
        },
        bands: {
          low: 'Beyond purely local protocols: an emerging or draft pathway exists, or national guidance is in early development, but there is no recognised national specification or defined pathway yet — only isolated or provisional standards.',
          high: 'A national pathway or specification largely exists and is widely followed, but is not yet fully binding or comprehensive across all ICBs — for example a strong NICE guideline without a complete national service specification, or a specification adopted by most but not all systems.'
        }
      },
      {
        id: 's1_d4',
        check: 'Are there nationally reported outcome and activity measures?',
        description: 'National outcome & activity reporting',
        evidenceSources: [
          'National audit datasets (e.g. NACR, NACAP, NCAPOP)',
          'Model Health System / Model Hospital metrics',
          'Nationally reported activity & performance indicators',
          'Commissioning quality indicators'
        ],
        criteria: {
          low: 'No standardised national measurement; activity or outcomes for the conventional service are not collected nationally — measurement is ad hoc, local or absent.',
          medium: 'Some activity or outcome measures exist and are used in parts of the system, but are not collected consistently or reported nationally for all providers.',
          high: 'Nationally standardised activity and outcome measures are defined in a named national framework, collected through a national audit or dataset, and published regularly in national reports. Local-only measurement does not qualify.'
        },
        bands: {
          low: 'Beyond the absence of measurement: outcome or activity measures are being developed or collected in isolated pockets or single audits, but are not yet in routine use across any meaningful part of the system.',
          high: 'A national audit or dataset exists and most providers contribute, giving largely standardised national measurement, but coverage, standardisation or regular national publication is not yet complete across all providers.'
        }
      },
      {
        id: 's1_d5',
        check: 'Is there a defined workforce and established referral routes?',
        description: 'Workforce & referral infrastructure',
        evidenceSources: [
          'NHS workforce plans & specialty workforce data',
          'Professional body training & accreditation standards',
          'Primary care referral pathways / NHS e-Referral Service data',
          'National service models describing workforce & referral'
        ],
        criteria: {
          low: 'No defined or trained workforce and no established referral routes; access depends on local arrangements or individual clinicians, with unclear or absent referral pathways.',
          medium: 'A workforce and referral routes exist but are inconsistent — capacity is variable or under-resourced in places, and referral routes are established in some areas but not standardised nationally.',
          high: 'A defined, trained workforce with recognised training or accreditation standards delivers the service, and clear referral routes from primary care and other settings are established nationally. Provision does not depend on local goodwill or improvisation.'
        },
        bands: {
          low: 'Beyond the absence of infrastructure: a small or nascent workforce operates in a few areas and some referral routes are emerging, but there are no recognised training or accreditation standards and referral remains largely ad hoc or absent elsewhere.',
          high: 'A workforce and referral routes are broadly established and largely consistent, with training or accreditation standards emerging, but provision is not yet fully standardised or accredited nationally and some areas still depend on local arrangements.'
        }
      },
      {
        id: 's1_d6',
        check: 'How mature, actively used, and fit for purpose are the existing reimbursement mechanisms, and do they provide a viable and sustainable funding route?',
        description: 'Reimbursement & funding mechanisms',
        evidenceSources: [
          'National Tariff Payment System (HRG-based activity payment)',
          'Best Practice Tariff (BPT)',
          'Specialised commissioning',
          'High-cost drug pathways',
          'Zero-price procedures (Evidence-Based Interventions programme)',
          'Block contracts',
          'Quality and Outcomes Framework (QOF)',
          'Enhanced Services (national or local)',
          'Primary Care Network directed enhanced services (PCN DES)',
          'Prescribing and medicines optimisation budgets',
          'Social prescribing pathways',
          'Innovation funding routes (AHSN, integrated care fund, prevention fund)'
        ],
        criteria: {
          low: 'Few or no relevant reimbursement mechanisms exist across primary and secondary care. Where mechanisms do exist they are dormant or require significant local negotiation to activate. The pathway has no HRG covering the relevant activity, no BPT (or a BPT with negligible uptake), no QOF indicators creating a clinical touchpoint, and no recurrent funding. Commissioners have no established route to fund the service sustainably and would need to create one from scratch through a locally agreed contract. Funding is precarious and dependent on local discretion. Example: a condition with no national tariff activity, no BPT, not in QOF, and not within any Enhanced Service specification.',
          medium: 'Relevant mechanisms exist in either primary or secondary care but not both, or exist in both settings but function poorly or inconsistently. There may be an HRG covering the acute episode but no mechanism funding community or primary care follow-on. A BPT may exist but have low uptake. QOF indicators may create a clinical touchpoint but with no associated recurrent funding for the wider pathway. Funding the service is possible but requires effort, local creativity and advocacy — it is not a default, automatic or fully sustainable pathway. Example: cardiac rehabilitation — a BPT exists but has negligible uptake, and no mechanism reliably funds the community rehabilitation pathway.',
          high: 'Established, actively used mechanisms exist across both primary and secondary care that create a clear, sustainable and accessible funding route for the service. An HRG or equivalent covers the relevant activity. A BPT exists and is actively claimed, or an equivalent payment mechanism incentivises quality delivery. QOF or Enhanced Services create a funded primary care touchpoint. The mechanisms are not dependent on local negotiation — they are nationally mandated or sufficiently standardised that commissioners can fund the pathway without creating one from scratch, and funding is recurrent rather than time-limited. Example: NHS Talking Therapies — a nationally commissioned service with a defined, recurrent payment model and QOF primary care touchpoints, funded sustainably without local negotiation.'
        },
        bands: {
          low: 'Above the Very Low floor but short of the Medium position. A relevant reimbursement mechanism exists in name but is effectively dormant — present in a tariff, specification or contract yet rarely claimed — or the only accessible route is a one-off, time-limited fund with no recurrent mechanism beneath it. There is still no functioning HRG, no actively claimed BPT, and no QOF or Enhanced Service touchpoint that reliably funds the service. Funding remains piecemeal, short-term and dependent on local effort.',
          high: 'Clearly beyond the Medium position and meeting most — but not all — of the Very High conditions. Functioning, actively used mechanisms exist across both primary and secondary care, giving commissioners a largely viable and sustainable route to fund the service without inventing a pathway. However, at least one Very High condition is not yet met — for example the BPT or payment mechanism is not fully embedded or actively claimed, some residual local negotiation is still required, or a primary care touchpoint exists but its associated funding is not fully standardised or nationally mandated.'
        }
      }
    ]
  },
  {
    id: 'stage2',
    number: 2,
    name: 'National Evidence & NICE Position',
    question: 'Has NICE reviewed the intervention?',
    interpretation: {
      high: 'NICE recommended — strong signal for adoption',
      medium: 'NICE EVA or evidence in progress — promising but generating evidence',
      low: 'No NICE review — higher uncertainty'
    },
    dimensions: [
      {
        id: 's2_d1',
        check: 'NICE EVA status',
        description: 'Early value assessment',
        evidenceSources: [
          'NICE EVA programme publications',
          'NICE guidance consultation documents',
          'NICE technology appraisal register'
        ],
        criteria: {
          low: 'No NICE EVA or formal review initiated; intervention not currently on NICE evaluation radar',
          medium: 'NICE EVA scoping or early value assessment in progress; intervention under review but outcome not yet published',
          high: 'NICE EVA published with an explicit recommendation for conditional or full use; the published assessment must be publicly available. Scoping documents, consultations, or "in progress" designations do not qualify.'
        }
      },
      {
        id: 's2_d2',
        check: 'NICE guidance published',
        description: 'HTA / guidance',
        evidenceSources: [
          'NICE guidance (MTG, HTA, NG, TA)',
          'NICE quality standards',
          'NICE evidence reviews'
        ],
        criteria: {
          low: 'No NICE guidance of any type published for this intervention or pathway',
          medium: 'NICE guidance in development, or intervention referenced tangentially in existing broader guidance without a specific recommendation',
          high: 'Full NICE guidance published — specifically a technology appraisal (TA), medical technology guidance (MTG), or clinical guideline (NG/CG) — with an explicit recommendation for use in the NHS. Draft guidance, quality standards alone, or indirect references in broader guidelines do not qualify.'
        }
      },
      {
        id: 's2_d3',
        check: 'NICE evidence framework alignment',
        description: 'DHT evidence tiers',
        evidenceSources: [
          'NICE Evidence Standards Framework for Digital Health Technologies',
          'ORCHA quality assessments',
          'Supplier evidence dossiers'
        ],
        criteria: {
          low: 'No alignment to NICE Evidence Standards Framework for Digital Health Technologies; evidence tier not established',
          medium: 'Partial alignment to NICE DHT evidence framework; lower evidence tier or framework applied informally without formal assessment',
          high: 'Both conditions met: (1) formally assessed against the NICE Evidence Standards Framework for Digital Health Technologies with evidence tier explicitly stated AND (2) that tier is met by published peer-reviewed evidence. Informal alignment or self-reported claims without formal assessment do not qualify.'
        }
      },
      {
        id: 's2_d4',
        check: 'Evidence generation plan defined',
        description: 'Ongoing trials',
        evidenceSources: [
          'NICE conditional approval documentation',
          'ClinicalTrials.gov registrations',
          'ISRCTN registry',
          'NIHR portfolio studies'
        ],
        criteria: {
          low: 'No registered studies, trials, or evidence generation plan in place; no NIHR portfolio presence',
          medium: 'Studies registered (ClinicalTrials.gov, ISRCTN, NIHR portfolio) or ongoing but results not yet published',
          high: 'Both conditions met: (1) completed RCTs or large-scale programme evaluations with published positive results in peer-reviewed journals AND (2) findings formally disseminated through NIHR or an equivalent national body. Ongoing or registered-only studies, and unpublished results, do not qualify.'
        }
      },
      {
        id: 's2_d5',
        check: 'Peer-reviewed evidence base',
        description: 'Published research',
        evidenceSources: [
          'Peer-reviewed journal publications',
          'Conference presentations (e.g. NHS ConfED, Digital Health Rewired)',
          'Systematic reviews or meta-analyses'
        ],
        criteria: {
          low: 'No peer-reviewed publications; evidence limited to grey literature, marketing materials, or conference abstracts only',
          medium: 'Some peer-reviewed papers published or presentations at major NHS conferences; evidence base growing but limited in scope or scale',
          high: 'Both conditions met: (1) multiple peer-reviewed publications in named journals demonstrating clinical effectiveness AND (2) at least one published systematic review or meta-analysis available. Conference abstracts, grey literature, and single studies alone do not qualify.'
        }
      }
    ]
  },
  {
    id: 'stage3',
    number: 3,
    name: 'Supplier Market Maturity',
    question: 'Is there a competitive supplier ecosystem?',
    interpretation: {
      high: 'Diverse supplier market — low vendor lock-in risk',
      medium: 'Few suppliers — moderate lock-in risk',
      low: 'Single supplier or no market — high risk'
    },
    dimensions: [
      {
        id: 's3_d1',
        check: 'Multiple suppliers exist',
        description: '≥3 viable vendors',
        evidenceSources: [
          'ORCHA / DTAC-aligned app libraries',
          'G-Cloud / Digital Outcomes & Specialists frameworks',
          'Market landscape reports'
        ],
        criteria: {
          low: 'Fewer than 2 viable suppliers exist; market is effectively a monopoly or has no established vendors',
          medium: '2 suppliers exist but the market is nascent; limited competition and product differentiation',
          high: 'Both conditions met: (1) 3 or more viable vendors with differentiated product offerings AND (2) products listed on ORCHA/DTAC-aligned libraries or an NHS procurement framework (G-Cloud, Digital Outcomes). Vendors without listed NHS-accessible products do not count toward the threshold.'
        }
      },
      {
        id: 's3_d2',
        check: 'Products have regulatory approval',
        description: 'CE / UKCA marking',
        evidenceSources: [
          'MHRA device register',
          'Supplier technical documentation',
          'DTAC assessments'
        ],
        criteria: {
          low: 'No CE/UKCA marking or MHRA registration on any product in this market',
          medium: 'Some products have regulatory approval; compliance inconsistent across the market',
          high: 'All three conditions met across the major market products: (1) CE/UKCA marking AND (2) MHRA device register registration AND (3) current DTAC compliance. A market where only some products meet all three does not qualify as high.'
        }
      },
      {
        id: 's3_d3',
        check: 'Suppliers already working with NHS',
        description: 'Deployed pilots',
        evidenceSources: [
          'NHS case studies',
          'ICS procurement records',
          'G-Cloud / Digital Outcomes & Specialists frameworks'
        ],
        criteria: {
          low: 'No documented NHS deployments or formal partnerships with NHS organisations',
          medium: 'Limited NHS pilots documented; some ICS procurement records or informal NHS engagements exist',
          high: 'All conditions met: (1) multiple suppliers (3+) deployed across multiple NHS organisations AND (2) published case studies publicly available AND (3) products listed on an NHS procurement framework (G-Cloud or equivalent). Single-site pilots or informal NHS engagements do not qualify.'
        }
      },
      {
        id: 's3_d4',
        check: 'Market innovation trajectory',
        description: 'Active investment / growth',
        evidenceSources: [
          'Industry reports (e.g. IQVIA, Deloitte Digital Health)',
          'Venture funding databases (e.g. Dealroom, PitchBook)',
          'NHS Innovation Accelerator cohort listings'
        ],
        criteria: {
          low: 'No active investment; stagnant or declining market with no notable new entrants or innovation',
          medium: 'Some venture funding or industry interest evident; limited but growing market activity',
          high: 'All conditions met: (1) active documented investment evidenced by named industry reports AND (2) significant venture funding on record AND (3) presence in NHS Innovation Accelerator cohort or formal AHSN engagement. General market interest without documented funding does not qualify.'
        }
      }
    ]
  },
  {
    id: 'stage4',
    number: 4,
    name: 'National Programme Advocacy',
    question: 'Is there a national programme championing this pathway?',
    interpretation: {
      high: 'Strong national advocacy — funding, policy alignment and referral pathways accelerated',
      medium: 'Emerging advocacy — some national interest but no dedicated programme',
      low: 'Limited advocacy — no national programme or clinical champion identified'
    },
    dimensions: [
      {
        id: 's4_d1',
        check: 'NHS / DHSC programme lead exists',
        description: 'National initiative',
        evidenceSources: [
          'NHS England programme portfolios',
          'DHSC policy documents',
          'NHS England transformation programmes'
        ],
        criteria: {
          low: 'No national NHS England or DHSC initiative championing this pathway; no dedicated programme or national lead identified',
          medium: 'Informal national interest or working groups exist; mentioned in NHS strategy but no dedicated programme lead appointed',
          high: 'All conditions met: (1) a dedicated named NHS England or DHSC national programme exists AND (2) a named programme lead is publicly identified AND (3) confirmed budget allocation and formal governance structure are in place. Informal working groups, strategy mentions, and programmes without confirmed funding do not qualify.'
        }
      },
      {
        id: 's4_d2',
        check: 'Academic research leadership',
        description: 'Major trial programmes',
        evidenceSources: [
          'NIHR programmes',
          'ARC network publications',
          'Academic Health Science Network reports'
        ],
        criteria: {
          low: 'No major NIHR or ARC-funded research programmes in this area; no significant academic research leadership',
          medium: 'Some NIHR involvement or ARC network interest; research portfolio developing but no major funded programme',
          high: 'Both conditions met: (1) a major named NIHR programme or ARC network with confirmed funding is actively leading research in this area AND (2) published research outputs from that programme are available. General NIHR interest, scoping work, or portfolio listings without published outputs do not qualify.'
        }
      },
      {
        id: 's4_d3',
        check: 'Clinical community support',
        description: 'Specialty societies',
        evidenceSources: [
          'Royal College position statements',
          'Specialty society publications (e.g. BCS, BACPR, BTS)',
          'Clinical network endorsements'
        ],
        criteria: {
          low: 'No specialty society endorsement or formal clinical champion identified at national level',
          medium: 'Individual clinical champions identified; informal society interest but no formal position statement published',
          high: 'Both conditions met: (1) a formal published position statement from a named major specialty society (e.g. a Royal College, BCS, BTS, BACPR) endorsing adoption AND (2) active clinical leadership through a named NHS clinical network. Informal support, conference presentations, or society interest without a formal statement do not qualify.'
        }
      },
      {
        id: 's4_d4',
        check: 'Patient advocacy organisations',
        description: 'Charities or campaigns',
        evidenceSources: [
          'Patient charity campaigns (e.g. British Heart Foundation, Asthma + Lung UK)',
          'Patient organisation policy positions',
          'Lived experience advisory groups'
        ],
        criteria: {
          low: 'No patient organisation or charity engagement with this pathway or intervention',
          medium: 'Some patient charity awareness or engagement; general support expressed but no formal campaign or dedicated advocacy',
          high: 'Both conditions met: (1) an active named patient advocacy campaign or formal charity partnership with a published policy position supporting adoption AND (2) lived experience formally embedded in programme governance (e.g. patient representatives on steering groups). General charity awareness or passive support does not qualify.'
        }
      }
    ]
  },
  {
    id: 'stage5',
    number: 5,
    name: 'Standards & Commissioning Framework',
    question: 'Are there clear operational standards?',
    interpretation: {
      high: 'Strong standards — low commissioning friction and clinical governance risk',
      medium: 'Partial standards — some guidance available but gaps remain',
      low: 'Weak standards — significant commissioning and governance barriers'
    },
    dimensions: [
      {
        id: 's5_d1',
        check: 'National service specification',
        description: 'NHS guidance',
        evidenceSources: [
          'NHS England service specifications',
          'NHSE/I clinical policy documents',
          'National pathway documents'
        ],
        criteria: {
          low: 'No national service specification published; operational standards only local, ad hoc, or absent',
          medium: 'Draft national specification in development, or only local/regional specifications exist without national consistency',
          high: 'A published NHS England national service specification is in place AND sets minimum standards applicable across all ICBs. Local, regional, or draft specifications do not qualify.'
        }
      },
      {
        id: 's5_d2',
        check: 'Commissioning guidance available',
        description: 'ICS / national frameworks',
        evidenceSources: [
          'NHS England commissioning frameworks',
          'ICS commissioning policies',
          'NHS standard contract schedules'
        ],
        criteria: {
          low: 'No commissioning guidance at any level; commissioners lack a framework for funding or contracting this pathway',
          medium: 'Local or ICS-level commissioning guidance exists; no national framework to ensure consistent access across England',
          high: 'Both conditions met: (1) a national commissioning framework published and available to all ICB commissioners AND (2) included in the NHS standard contract or an equivalent nationally binding instrument. ICS-level or local commissioning guidance alone does not qualify.'
        }
      },
      {
        id: 's5_d3',
        check: 'Outcome metrics defined',
        description: 'Standardised KPIs',
        evidenceSources: [
          'National audit KPI frameworks',
          'Commissioning for Quality and Innovation (CQUIN) indicators',
          'Model Hospital metrics'
        ],
        criteria: {
          low: 'No standardised KPIs or outcome metrics defined at any level; measurement is ad hoc or absent',
          medium: 'Some outcome metrics defined in local or pilot settings; not nationally standardised or consistently reported',
          high: 'All conditions met: (1) nationally standardised KPIs defined in a named national framework AND (2) collected via a named national audit programme or dataset AND (3) formally used in commissioning AND (4) results published in regular national reports. Local measurement or uncommissioned data collection does not qualify.'
        }
      }
    ]
  },
  {
    id: 'stage6',
    number: 6,
    name: 'Strategic Priority Alignment',
    question: 'Does the intervention feature within national healthcare priorities?',
    interpretation: {
      high: 'Strong alignment — likely to receive funding, policy support and scaling opportunities',
      medium: 'Partial alignment — referenced in strategy but not a named priority',
      low: 'Weak alignment — limited connection to national priorities'
    },
    dimensions: [
      {
        id: 's6_d1',
        check: 'NHS Long Term Plan alignment',
        description: 'National strategy',
        evidenceSources: [
          'NHS Long Term Plan (2019)',
          'NHS England operational planning guidance',
          'DHSC health mission documents'
        ],
        criteria: {
          low: 'Not referenced in NHS Long Term Plan or any current national strategy documents',
          medium: 'Referenced indirectly or as part of a broader category in national strategy; not a named priority area',
          high: 'Explicitly named — not merely referenced as part of a broader category — as a priority area in the NHS Long Term Plan, NHS 10-Year Plan, or a published DHSC health mission document, AND committed investment is stated. Broad strategy references and general disease area mentions do not qualify.'
        }
      },
      {
        id: 's6_d2',
        check: 'Major disease burden',
        description: 'Prevalence / mortality',
        evidenceSources: [
          'NHS England prevalence data',
          'UKHSA / Public Health England disease burden reports',
          'ONS mortality statistics'
        ],
        criteria: {
          low: 'Minor condition with low national prevalence or mortality impact; not a significant driver of NHS demand',
          medium: 'Significant disease burden with moderate prevalence and measurable impact on population health and NHS capacity',
          high: 'All conditions met: (1) high national prevalence confirmed by named NHS England or ONS data AND (2) significant mortality/morbidity documented in published reports AND (3) explicitly recognised as a national health challenge in a published government or NHS strategy document. Conditions that are common but not explicitly prioritised nationally do not qualify.'
        }
      },
      {
        id: 's6_d3',
        check: 'Preventative care opportunity',
        description: 'Risk reduction potential',
        evidenceSources: [
          'NHS prevention programmes',
          'NICE public health guidance',
          'OHID / PHE prevention evidence reviews'
        ],
        criteria: {
          low: 'Limited evidence of risk reduction or meaningful prevention potential for this pathway',
          medium: 'Some evidence of prevention or risk reduction potential; prevention pathway exists but not yet at scale in the NHS',
          high: 'Both conditions met: (1) strong published evidence of significant measurable risk reduction for this pathway AND (2) prevention pathway actively supported and funded by a named national NHS prevention programme. Evidence of prevention potential without an active national programme does not qualify.'
        }
      },
      {
        id: 's6_d4',
        check: 'Health inequalities impact',
        description: 'Population health benefit',
        evidenceSources: [
          'Core20PLUS5 NHS England framework',
          'NHS Health Inequalities Improvement Programme',
          'Marmot Review / health inequalities evidence'
        ],
        criteria: {
          low: 'No evidence of differential impact on deprived or underserved populations; inequalities not a relevant consideration',
          medium: 'Some inequalities data exists; condition affects underserved groups but intervention impact on inequalities not yet demonstrated',
          high: 'Both conditions met: (1) published evidence that the condition disproportionately affects deprived or underserved populations AND (2) the intervention demonstrably reduces health inequalities and is explicitly aligned to Core20PLUS5 AND the NHS Health Inequalities Improvement Programme. General population health benefit without demonstrated inequalities reduction does not qualify.'
        }
      }
    ]
  }
]

export const EXAMPLE_PATHWAYS = [
  'Cardiac Rehabilitation',
  'COPD',
  'Musculoskeletal MSK',
  'Pulmonary Rehabilitation',
  'IAPT',
  'Diabetes Prevention Programme'
]

// Five-band scoring. Each dimension scores one band; points are summed across
// every dimension for the overall readiness score.
export const SCORE_POINTS = { very_low: 20, low: 40, medium: 60, high: 80, very_high: 100 }

// Ordered low → high, for rendering ladders and iterating over bands.
export const SCORE_LEVELS = ['very_low', 'low', 'medium', 'high', 'very_high']

export const SCORE_STYLES = {
  very_low:  { bg: '#f4b7b2', text: '#942514', border: '#942514', label: 'Very Low',  tag: 'govuk-tag--red',    inset: 'govuk-inset-text--red'    },
  low:       { bg: '#f6d7d2', text: '#942514', border: '#DA291C', label: 'Low',       tag: 'govuk-tag--red',    inset: 'govuk-inset-text--red'    },
  medium:    { bg: '#fcd9b8', text: '#6e3619', border: '#f47738', label: 'Medium',    tag: 'govuk-tag--orange', inset: 'govuk-inset-text--orange' },
  high:      { bg: '#cce2d8', text: '#005a30', border: '#009639', label: 'High',      tag: 'govuk-tag--green',  inset: 'govuk-inset-text--green'  },
  very_high: { bg: '#b5d8c5', text: '#004d28', border: '#005a30', label: 'Very High', tag: 'govuk-tag--green',  inset: 'govuk-inset-text--green'  },
}

// The two interpolated bands. The written per-dimension criteria provide the
// anchors: existing "low" → Very Low, "medium" → Medium, "high" → Very High.
// Low and High are the universal rungs in between, applied to every dimension.
export const INTERPOLATED_CRITERIA = {
  low:  'Above the "Very Low" floor but short of the Medium criterion — only early or isolated signs exist (e.g. a single pilot, early-stage research, a nascent market, or informal interest), not the systematic position described under Medium.',
  high: 'Clearly beyond the Medium criterion and meeting most — but not all — of the conditions listed under Very High. Strong evidence across several Very High conditions, with one or more not yet fully satisfied.',
}

// Expand a dimension's three written criteria into the full five-band ladder.
// A dimension may override the interpolated Low/High bands via `dimension.bands`
// when the universal wording is a poor fit (e.g. a reimbursement dimension).
export function dimensionBands(dimension) {
  return {
    very_low:  dimension.criteria.low,
    low:       dimension.bands?.low ?? INTERPOLATED_CRITERIA.low,
    medium:    dimension.criteria.medium,
    high:      dimension.bands?.high ?? INTERPOLATED_CRITERIA.high,
    very_high: dimension.criteria.high,
  }
}

export const MAX_SCORE = STAGES.reduce((n, s) => n + s.dimensions.length, 0) * 100
