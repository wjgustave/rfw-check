import { useState, useRef, useEffect } from 'react'

// Pathways = NHS service/intervention pathways (what gets commissioned and delivered)
// Conditions = underlying health conditions/diagnoses
const NHS_ENTRIES = [
  // ── PATHWAYS ──────────────────────────────────────────────────────────────
  { label: 'Cardiac Rehabilitation', type: 'pathway', aliases: ['CR', 'cardiac rehab', 'BACPR', 'NACR'] },
  { label: 'Pulmonary Rehabilitation', type: 'pathway', aliases: ['PR', 'pulmonary rehab', 'BTS PR'] },
  { label: 'Diabetes Prevention Programme', type: 'pathway', aliases: ['DPP', 'NHS DPP', 'NDPP', 'diabetes prevention'] },
  { label: 'Talking Therapies', type: 'pathway', aliases: ['IAPT', 'Improving Access to Psychological Therapies', 'NHS Talking Therapies'] },
  { label: 'Digital Weight Management', type: 'pathway', aliases: ['DWM', 'Tier 2 Weight Management', 'NHS DWM'] },
  { label: 'Structured Education for Diabetes', type: 'pathway', aliases: ['DESMOND', 'DAFNE', 'Dose Adjustment for Normal Eating', 'X-PERT'] },
  { label: 'NHS Health Check', type: 'pathway', aliases: ['cardiovascular risk check', 'health check programme'] },
  { label: 'Falls Prevention', type: 'pathway', aliases: ['falls pathway', 'fall prevention service', 'FallSafe'] },
  { label: 'Smoking Cessation Service', type: 'pathway', aliases: ['stop smoking service', 'NHS Stop Smoking', 'NCSCT', 'tobacco dependency treatment'] },
  { label: 'Alcohol Care Teams', type: 'pathway', aliases: ['ACT', 'alcohol care pathway', 'alcohol liaison'] },
  { label: 'Cancer Rehabilitation', type: 'pathway', aliases: ['NCSI', 'cancer rehab', 'oncology rehabilitation', 'Macmillan rehabilitation'] },
  { label: 'Musculoskeletal First Contact Practitioner', type: 'pathway', aliases: ['MSK FCP', 'FCP', 'first contact physiotherapy', 'MSK pathway'] },
  { label: 'Virtual Wards', type: 'pathway', aliases: ['hospital at home', 'HAHW', 'virtual ward programme'] },
  { label: 'Remote Patient Monitoring', type: 'pathway', aliases: ['RPM', 'telemonitoring', 'home monitoring pathway', 'remote monitoring'] },
  { label: 'Hypertension Case Finding', type: 'pathway', aliases: ['BP@pharmacy', 'blood pressure check programme', 'CVD prevention pathway', 'hypertension pathway'] },
  { label: 'Atrial Fibrillation Detection', type: 'pathway', aliases: ['AF detection pathway', 'AF screening', 'pulse rhythm check'] },
  { label: 'Lipid Management', type: 'pathway', aliases: ['cholesterol pathway', 'statin pathway', 'familial hypercholesterolaemia', 'FH pathway'] },
  { label: 'Weight Management — Tier 3', type: 'pathway', aliases: ['Tier 3 weight management', 'specialist weight management', 'obesity service'] },
  { label: 'Bariatric Surgery Pathway', type: 'pathway', aliases: ['Tier 4 weight management', 'bariatric', 'metabolic surgery', 'gastric bypass pathway'] },
  { label: 'Long Covid Rehabilitation', type: 'pathway', aliases: ['post-COVID rehabilitation', 'PCNS pathway', 'long COVID service', 'Your COVID Recovery'] },
  { label: 'Stroke Rehabilitation', type: 'pathway', aliases: ['stroke pathway', 'SSNAP', 'Early Supported Discharge', 'ESD stroke', 'thrombectomy pathway'] },
  { label: 'Perinatal Mental Health', type: 'pathway', aliases: ['PMH', 'maternal mental health', 'perinatal pathway', 'PMHS'] },
  { label: 'Community Mental Health', type: 'pathway', aliases: ['CMHT', 'community mental health transformation', 'CMHF', 'mental health pathway'] },
  { label: 'Children and Young People Mental Health', type: 'pathway', aliases: ['CYPMH', 'CAMHS', 'child and adolescent mental health services'] },
  { label: 'Eating Disorders Pathway', type: 'pathway', aliases: ['FREED', 'First Episode Rapid Early intervention', 'anorexia pathway', 'ED pathway'] },
  { label: 'Crisis Care Pathway', type: 'pathway', aliases: ['mental health crisis', 'crisis resolution', 'CRHTT', 'psychiatric liaison'] },
  { label: 'Enhanced Health in Care Homes', type: 'pathway', aliases: ['EHCH', 'care home pathway', 'care homes enhanced health'] },
  { label: 'Personalised Care', type: 'pathway', aliases: ['shared decision making', 'social prescribing', 'personalised care framework', 'PCF'] },
  { label: 'Social Prescribing', type: 'pathway', aliases: ['link worker', 'community referral', 'social prescribing link worker', 'SPLW'] },
  { label: 'Palliative and End of Life Care', type: 'pathway', aliases: ['EoLC', 'end of life pathway', 'dying well', 'palliative care pathway', 'Gold Standards Framework'] },
  { label: 'Urgent Community Response', type: 'pathway', aliases: ['UCR', '2-hour response', '2 hour urgent community response'] },
  { label: 'Elective Care Recovery', type: 'pathway', aliases: ['elective pathway', 'waiting list pathway', 'RTT pathway', 'elective recovery'] },
  { label: 'Osteoporosis Fracture Prevention', type: 'pathway', aliases: ['FLS', 'Fracture Liaison Service', 'fragility fracture pathway', 'NOGG pathway'] },
  { label: 'Continence Pathway', type: 'pathway', aliases: ['bladder and bowel service', 'urinary incontinence pathway', 'pelvic floor pathway'] },
  { label: 'Drug and Alcohol Treatment', type: 'pathway', aliases: ['DAT', 'substance misuse pathway', 'recovery pathway', 'DAMS'] },
  { label: 'Wound Care and Tissue Viability', type: 'pathway', aliases: ['VLU pathway', 'venous leg ulcer pathway', 'tissue viability pathway', 'wound management'] },
  { label: 'Learning Disabilities Health', type: 'pathway', aliases: ['LD pathway', 'LeDeR', 'annual health check LD', 'reasonable adjustments pathway'] },
  { label: 'Autism Diagnosis Pathway', type: 'pathway', aliases: ['autism assessment pathway', 'ASD diagnosis', 'NICE autism pathway', 'neurodevelopmental pathway'] },
  { label: 'ADHD Pathway', type: 'pathway', aliases: ['ADHD assessment', 'Attention Deficit pathway', 'neurodevelopmental ADHD'] },
  { label: 'Cardiovascular Disease Prevention', type: 'pathway', aliases: ['CVD prevention', 'cardiovascular prevention programme', 'primary prevention CVD'] },

  // ── CONDITIONS ────────────────────────────────────────────────────────────
  { label: 'COPD', type: 'condition', aliases: ['Chronic Obstructive Pulmonary Disease', 'chronic obstructive', 'GOLD', 'emphysema', 'chronic bronchitis'] },
  { label: 'Asthma', type: 'condition', aliases: ['asthma management', 'BTS asthma', 'SIGN asthma', 'severe asthma'] },
  { label: 'Heart Failure', type: 'condition', aliases: ['HF', 'CHF', 'cardiac failure', 'LVF', 'left ventricular failure'] },
  { label: 'Atrial Fibrillation', type: 'condition', aliases: ['AF', 'AFib', 'a-fib', 'atrial flutter'] },
  { label: 'Hypertension', type: 'condition', aliases: ['high blood pressure', 'HBP', 'hypertensive disease'] },
  { label: 'Coronary Heart Disease', type: 'condition', aliases: ['CHD', 'IHD', 'ischaemic heart disease', 'angina', 'CAD', 'NSTEMI', 'STEMI', 'ACS'] },
  { label: 'Type 2 Diabetes', type: 'condition', aliases: ['T2D', 'T2DM', 'type 2 diabetes mellitus'] },
  { label: 'Type 1 Diabetes', type: 'condition', aliases: ['T1D', 'T1DM', 'type 1 diabetes mellitus'] },
  { label: 'Obesity', type: 'condition', aliases: ['overweight', 'BMI', 'weight management', 'morbid obesity'] },
  { label: 'Chronic Kidney Disease', type: 'condition', aliases: ['CKD', 'kidney disease', 'renal disease', 'nephropathy'] },
  { label: 'Dementia', type: 'condition', aliases: ["Alzheimer's", 'cognitive decline', 'vascular dementia', 'BPSD', 'MCI'] },
  { label: 'Depression', type: 'condition', aliases: ['low mood', 'MDD', 'major depressive disorder', 'PHQ-9'] },
  { label: 'Anxiety', type: 'condition', aliases: ['GAD', 'generalised anxiety disorder', 'anxiety disorder', 'GAD-7'] },
  { label: 'Long Covid', type: 'condition', aliases: ['post-COVID', 'post-COVID syndrome', 'PCNS', 'long COVID'] },
  { label: 'Osteoporosis', type: 'condition', aliases: ['bone density', 'fragility fracture', 'DEXA', 'FRAX', 'NOGG'] },
  { label: 'Osteoarthritis', type: 'condition', aliases: ['OA', 'joint pain', 'hip OA', 'knee OA'] },
  { label: 'Rheumatoid Arthritis', type: 'condition', aliases: ['RA', 'inflammatory arthritis', 'DMARD', 'biologic therapy RA'] },
  { label: 'Chronic Pain', type: 'condition', aliases: ['pain management', 'persistent pain', 'chronic pain syndrome'] },
  { label: 'Fibromyalgia', type: 'condition', aliases: ['FMS', 'fibromyalgia syndrome', 'widespread pain'] },
  { label: "Parkinson's Disease", type: 'condition', aliases: ["Parkinson's", 'PD', 'Parkinsonism', 'PDNS'] },
  { label: 'Multiple Sclerosis', type: 'condition', aliases: ['MS', 'DMT', 'relapsing MS', 'progressive MS'] },
  { label: 'Epilepsy', type: 'condition', aliases: ['seizure disorder', 'SUDEP', 'AED', 'focal epilepsy'] },
  { label: 'Motor Neurone Disease', type: 'condition', aliases: ['MND', 'ALS', 'amyotrophic lateral sclerosis'] },
  { label: 'Autism Spectrum Disorder', type: 'condition', aliases: ['ASD', 'autism', 'autistic spectrum', 'Asperger'] },
  { label: 'ADHD', type: 'condition', aliases: ['Attention Deficit Hyperactivity Disorder', 'attention deficit', 'ADD'] },
  { label: 'Frailty', type: 'condition', aliases: ['frailty syndrome', 'CFS frailty', 'sarcopenia', 'frail older adult'] },
  { label: 'Liver Disease', type: 'condition', aliases: ['NAFLD', 'MASLD', 'ARLD', 'hepatitis', 'cirrhosis'] },
  { label: 'Inflammatory Bowel Disease', type: 'condition', aliases: ['IBD', "Crohn's Disease", 'ulcerative colitis', 'UC'] },
  { label: 'Sleep Apnoea', type: 'condition', aliases: ['OSA', 'obstructive sleep apnoea', 'CPAP', 'sleep disordered breathing'] },
  { label: 'Heart Valve Disease', type: 'condition', aliases: ['valvular heart disease', 'TAVI', 'aortic stenosis', 'mitral regurgitation'] },
  { label: 'Peripheral Arterial Disease', type: 'condition', aliases: ['PAD', 'PVD', 'peripheral vascular disease', 'claudication'] },
  { label: 'Psoriasis', type: 'condition', aliases: ['plaque psoriasis', 'psoriatic arthritis', 'biologic psoriasis'] },
  { label: 'Eczema', type: 'condition', aliases: ['atopic dermatitis', 'atopic eczema', 'dupilumab'] },
  { label: 'Alcohol Use Disorder', type: 'condition', aliases: ['AUD', 'alcohol misuse', 'harmful drinking', 'AUDIT-C'] },
]

function matchEntries(query) {
  if (!query || query.length < 2) return []
  const q = query.toLowerCase()
  return NHS_ENTRIES.filter(c =>
    c.label.toLowerCase().includes(q) ||
    c.aliases.some(a => a.toLowerCase().includes(q))
  ).slice(0, 10)
}

export default function PathwayTypeahead({ value, onChange, onKeyDown, disabled, id, 'aria-describedby': ariaDescribedBy }) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const suggestions = matchEntries(value)
  const listRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { setActiveIndex(-1) }, [value])

  function handleKeyDown(e) {
    if (!open || suggestions.length === 0) {
      onKeyDown?.(e)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0) {
        e.preventDefault()
        onChange(suggestions[activeIndex].label)
        setOpen(false)
        setActiveIndex(-1)
      } else {
        onKeyDown?.(e)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    } else {
      onKeyDown?.(e)
    }
  }

  function select(label) {
    onChange(label)
    setOpen(false)
    setActiveIndex(-1)
    inputRef.current?.focus()
  }

  return (
    <div style={{ position: 'relative', maxWidth: '600px' }}>
      <input
        ref={inputRef}
        id={id}
        className="govuk-input"
        type="text"
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-describedby={ariaDescribedBy}
        aria-autocomplete="list"
        aria-expanded={open && suggestions.length > 0}
        aria-activedescendant={activeIndex >= 0 ? `typeahead-option-${activeIndex}` : undefined}
        role="combobox"
        autoComplete="off"
        spellCheck={false}
        style={{ width: '100%' }}
      />
      {open && suggestions.length > 0 && (
        <ul
          ref={listRef}
          role="listbox"
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
            background: '#fff', border: '2px solid #0B0C0C', borderTop: '1px solid #B1B4B6',
            margin: 0, padding: 0, listStyle: 'none', boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
          }}
        >
          {suggestions.map((c, i) => (
            <li
              key={c.label}
              id={`typeahead-option-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={() => select(c.label)}
              style={{
                padding: '10px 15px',
                cursor: 'pointer',
                background: i === activeIndex ? '#005EB8' : '#fff',
                color: i === activeIndex ? '#fff' : '#0B0C0C',
                fontSize: '1rem',
                borderBottom: i < suggestions.length - 1 ? '1px solid #f0f4f5' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '1px 6px',
                borderRadius: '2px',
                flexShrink: 0,
                background: i === activeIndex
                  ? 'rgba(255,255,255,0.25)'
                  : c.type === 'pathway' ? '#E8F0FB' : '#E8EDEE',
                color: i === activeIndex
                  ? '#fff'
                  : c.type === 'pathway' ? '#003087' : '#505A5F'
              }}>
                {c.type === 'pathway' ? 'Pathway' : 'Condition'}
              </span>
              <span style={{ fontWeight: 600 }}>{c.label}</span>
              {c.aliases[0] && (
                <span style={{ fontSize: '0.875rem', opacity: 0.65, marginLeft: 'auto' }}>
                  {c.aliases[0]}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
