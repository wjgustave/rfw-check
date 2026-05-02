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
          high: 'Routinely commissioned and delivered across NHS as a standard service; national service specification exists'
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
          high: 'Available across all or nearly all ICBs; national access targets or coverage requirements in place'
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
          high: 'Explicitly recommended in NICE guidelines (CG/NG) or equivalent; supported by Royal College and specialty society endorsement'
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
          high: 'Nationally standardised outcome metrics in routine use; collected via national audit or dataset and published regularly'
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
          high: 'NICE EVA published with positive signal; formal early value assessment complete with recommendation for conditional or full use'
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
          high: 'Full NICE guidance published (MTG, TA, NG, or equivalent) with a clear recommendation for use in the NHS'
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
          high: 'Formally aligned to NICE Evidence Standards Framework; evidence tier explicitly stated, assessed, and met by published evidence'
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
          high: 'Completed RCTs or programme evaluations published with positive results; evidence generation plan fulfilled and findings disseminated'
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
          high: 'Multiple peer-reviewed publications demonstrating effectiveness and/or cost-effectiveness; systematic reviews or meta-analyses available'
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
          high: '3 or more viable vendors with differentiated offerings; products available on ORCHA/DTAC-aligned libraries or NHS procurement frameworks'
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
          high: 'All major products have CE/UKCA marking and are registered on the MHRA device register with current DTAC compliance'
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
          high: 'Multiple suppliers deployed across several NHS organisations; published case studies available; products listed on NHS procurement frameworks'
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
          high: 'Active investment and clear growth trajectory evidenced by industry reports, significant venture funding, and NHS Innovation Accelerator or AHSN engagement'
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
          high: 'Dedicated NHS England programme or DHSC national initiative with named programme lead; formal governance and funding in place'
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
          high: 'Major NIHR programme or ARC network actively leading research in this area; significant funded trial portfolio with published outputs'
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
          high: 'Formal endorsement from one or more major specialty societies with published position statements; active clinical leadership through NHS clinical networks'
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
          high: 'Active patient advocacy campaign or formal charity partnership supporting adoption and patient access; lived experience embedded in programme governance'
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
          high: 'Published NHS England national service specification in place; sets minimum standards applicable across all ICBs'
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
          high: 'National commissioning framework published and available to all ICB commissioners; included in NHS standard contract or equivalent national instrument'
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
          high: 'Nationally standardised KPIs defined, collected via audit or dataset, used in commissioning, and published regularly at system level'
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
          high: 'Explicitly named as a priority area in the NHS Long Term Plan, NHS 10-Year Plan, or equivalent national strategy with committed investment'
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
          high: 'Major disease burden with high prevalence, significant mortality/morbidity, and a top driver of avoidable NHS demand; recognised as a national health challenge'
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
          high: 'Strong evidence of significant risk reduction potential; prevention pathway well established and supported by national NHS prevention programmes'
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
          high: 'Strong evidence the condition disproportionately affects underserved populations; intervention demonstrably reduces health inequalities and aligns with Core20PLUS5 or NHS Health Inequalities Improvement Programme'
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
  high: { bg: '#EAF3DE', text: '#3B6D11', border: '#97C459', label: 'High' },
  medium: { bg: '#FAEEDA', text: '#854F0B', border: '#EF9F27', label: 'Medium' },
  low: { bg: '#FCEBEB', text: '#A32D2D', border: '#E24B4A', label: 'Low' }
}

export const MAX_SCORE = STAGES.length * 3
