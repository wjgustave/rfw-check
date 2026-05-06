export const STAGES = [
  {
    id: 'stage1',
    number: 1,
    name: 'Service Maturity',
    question: 'Is this already an established clinical intervention?',
    interpretation: {
      high: 'Established NHS pathway — routinely commissioned and delivered nationally',
      medium: 'Emerging pathway — delivered in some settings but not systematically commissioned',
      low: 'Experimental or research-stage service — limited NHS delivery'
    },
    dimensions: [
      {
        id: 's1_d1',
        check: 'Is the intervention already delivered in the NHS?',
        description: 'Existing clinical intervention (either in person / digital offering)',
        evidenceSources: [
          'NHS England service specifications',
          'Trust/ICB service directories',
          'GIRFT specialty level report and standardised pathway',
          'National audits confirming routine delivery (e.g. NACR for CR)'
        ],
        criteria: {
          low: 'No current NHS delivery identified; intervention exists only in research or pilot settings',
          medium: 'Delivered in some NHS settings but not systematically commissioned; available in specific trusts or regions only',
          high: 'Both conditions met: (1) routinely commissioned and delivered across the NHS as a standard service AND (2) a published NHS England national service specification exists. Pilot delivery or regional commissioning alone does not qualify.'
        }
      },
      {
        id: 's1_d2',
        check: 'Is the service widely available nationally?',
        description: 'NHS service coverage',
        evidenceSources: [
          'National Audit coverage reports (participating providers, referral rates)',
          'NHS Atlas of Variation',
          'ICB commissioning coverage statements'
        ],
        criteria: {
          low: 'Available in fewer than a third of ICBs or highly geographically concentrated',
          medium: 'Available in many but not all ICBs; notable gaps in access exist regionally',
          high: 'Both conditions met: (1) available across all or nearly all (>90%) ICBs with coverage confirmed by a named national audit or NHS Atlas of Variation AND (2) formal national access targets or coverage requirements stated in a published NHS England document. Regional availability without documented national coverage data does not qualify.'
        }
      },
      {
        id: 's1_d3',
        check: 'Is it recognised in clinical guidelines?',
        description: 'Professional society guidance',
        evidenceSources: [
          'NICE clinical guidelines (CG / NG)',
          'SIGN / NICE shared guideline endorsements',
          'Royal College / specialty society position statements'
        ],
        criteria: {
          low: 'No NICE or equivalent national guideline recommendation; evidence base is limited or contested',
          medium: 'Referenced in guidelines but as an emerging or conditional recommendation; may lack a dedicated guideline',
          high: 'Both conditions met: (1) explicitly recommended in a published NICE guideline (CG/NG) — not merely referenced or under development AND (2) endorsed by a named Royal College or specialty society with a published position statement. Conditional or draft NICE recommendations do not qualify.'
        }
      },
      {
        id: 's1_d4',
        check: 'Are outcome metrics well defined?',
        description: 'Clinical audits or datasets',
        evidenceSources: [
          'National audit datasets (e.g. NACR, NCAPOP)',
          'Quality indicators used in commissioning',
          'Inclusion in Model Hospital metrics'
        ],
        criteria: {
          low: 'No standardised outcome metrics in routine use; measurement is ad hoc or research-only',
          medium: 'Some outcome metrics defined and used in parts of the system but not collected consistently or nationally',
          high: 'All conditions met: (1) nationally standardised outcome metrics defined in a named national framework AND (2) collected via a named national audit programme or dataset AND (3) results published regularly in national reports. Local audit activity or ad hoc data collection does not qualify.'
        }
      },
      {
        id: 's1_d5',
        check: 'Is there evidence around channel shift?',
        description: 'Improved ROI with digital shift',
        evidenceSources: [
          'Evaluations of remote vs in-person models (programme evaluations, not just trials)',
          'NHS England digital transformation case studies',
          'Cost-effectiveness analyses showing productivity / access gains'
        ],
        criteria: {
          low: 'No evaluations of alternative delivery models; service delivered face-to-face only with no digital or remote equivalent',
          medium: 'Evaluations or programme-level evidence of remote or digital delivery exist showing comparable outcomes, but cost-effectiveness at NHS scale not established or no formal national specification supporting channel shift published. COVID-era adaptations and telemonitoring pilots fall here.',
          high: 'Both conditions met: (1) robust programme-level evidence that digital/remote delivery achieves equivalent outcomes at scale, AND (2) a formal published NHS England national service specification or commissioning framework that mandates channel shift. Pilots and COVID-era adaptations alone do not qualify.'
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
  'MSK',
  'Pulmonary Rehabilitation',
  'IAPT',
  'Diabetes Prevention Programme'
]

export const SCORE_STYLES = {
  high:   { bg: '#cce2d8', text: '#005a30', border: '#009639', label: 'High',   tag: 'govuk-tag--green',  inset: 'govuk-inset-text--green'  },
  medium: { bg: '#fff7bf', text: '#594d00', border: '#FFB81C', label: 'Medium', tag: 'govuk-tag--yellow', inset: 'govuk-inset-text--yellow' },
  low:    { bg: '#f4c2c1', text: '#942514', border: '#DA291C', label: 'Low',    tag: 'govuk-tag--red',    inset: 'govuk-inset-text--red'    }
}

export const MAX_SCORE = STAGES.length * 3
