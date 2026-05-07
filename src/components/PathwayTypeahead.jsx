import { useState, useRef, useEffect } from 'react'

const NHS_CONDITIONS = [
  { label: 'Cardiac Rehabilitation', aliases: ['CR', 'cardiac rehab', 'BACPR'] },
  { label: 'COPD', aliases: ['Chronic Obstructive Pulmonary Disease', 'chronic obstructive pulmonary', 'GOLD'] },
  { label: 'Pulmonary Rehabilitation', aliases: ['PR', 'pulmonary rehab'] },
  { label: 'Musculoskeletal', aliases: ['MSK', 'musculoskeletal health', 'MSK FCP'] },
  { label: 'Talking Therapies', aliases: ['IAPT', 'Improving Access to Psychological Therapies', 'IAPT programme'] },
  { label: 'Diabetes Prevention Programme', aliases: ['DPP', 'NHS DPP', 'diabetes prevention', 'T2D prevention'] },
  { label: 'Type 2 Diabetes', aliases: ['T2D', 'T2DM', 'type 2 diabetes'] },
  { label: 'Type 1 Diabetes', aliases: ['T1D', 'T1DM', 'type 1 diabetes'] },
  { label: 'Heart Failure', aliases: ['HF', 'CHF', 'cardiac failure', 'heart failure management'] },
  { label: 'Atrial Fibrillation', aliases: ['AF', 'AFib', 'a-fib', 'atrial flutter'] },
  { label: 'Hypertension', aliases: ['high blood pressure', 'HBP', 'blood pressure management'] },
  { label: 'Coronary Heart Disease', aliases: ['CHD', 'IHD', 'ischaemic heart disease', 'angina', 'CAD'] },
  { label: 'Stroke Rehabilitation', aliases: ['stroke', 'stroke rehab', 'CVA', 'TIA', 'FAST'] },
  { label: 'Digital Weight Management', aliases: ['DWM', 'Tier 2 Weight Management', 'obesity digital'] },
  { label: 'Obesity Management', aliases: ['obesity', 'weight management', 'bariatric', 'Tier 3', 'Tier 4'] },
  { label: 'Smoking Cessation', aliases: ['stop smoking', 'tobacco cessation', 'NCSCT', 'smoking'] },
  { label: 'Alcohol Use Disorder', aliases: ['AUD', 'alcohol misuse', 'harmful drinking', 'AUDIT-C'] },
  { label: 'Chronic Kidney Disease', aliases: ['CKD', 'kidney disease', 'renal disease', 'nephrology'] },
  { label: 'Asthma', aliases: ['asthma management', 'BTS asthma', 'SIGN asthma'] },
  { label: 'Cancer Rehabilitation', aliases: ['cancer rehab', 'NCSI', 'oncology rehab', 'Macmillan'] },
  { label: 'Dementia', aliases: ["Alzheimer's", 'cognitive decline', 'BPSD', 'vascular dementia'] },
  { label: 'Depression', aliases: ['low mood', 'MDD', 'major depressive disorder', 'PHQ-9'] },
  { label: 'Anxiety', aliases: ['GAD', 'generalised anxiety', 'anxiety disorder', 'GAD-7'] },
  { label: 'Long Covid', aliases: ['post-COVID', 'post-COVID syndrome', 'PCNS', 'long COVID'] },
  { label: 'Osteoporosis', aliases: ['bone density', 'fragility fracture', 'DEXA', 'NOGG', 'FRAX'] },
  { label: 'Osteoarthritis', aliases: ['OA', 'joint pain', 'hip replacement pathway', 'knee replacement pathway'] },
  { label: 'Rheumatoid Arthritis', aliases: ['RA', 'inflammatory arthritis', 'DMARD'] },
  { label: 'Chronic Pain', aliases: ['pain management', 'persistent pain', 'chronic pain service'] },
  { label: 'Fibromyalgia', aliases: ['FMS', 'fibromyalgia syndrome', 'widespread pain'] },
  { label: "Parkinson's Disease", aliases: ["Parkinson's", 'PD', 'Parkinsonism', 'PDNS'] },
  { label: 'Multiple Sclerosis', aliases: ['MS', 'MS management', 'DMT', 'MS nurse'] },
  { label: 'Epilepsy', aliases: ['seizure management', 'SUDEP', 'AED', 'epilepsy care'] },
  { label: 'Motor Neurone Disease', aliases: ['MND', 'ALS', 'amyotrophic lateral sclerosis'] },
  { label: 'Autism Spectrum Disorder', aliases: ['ASD', 'autism', 'autistic spectrum', 'ADOS'] },
  { label: 'ADHD', aliases: ['Attention Deficit Hyperactivity Disorder', 'attention deficit', 'neurodevelopmental'] },
  { label: 'Frailty', aliases: ['falls prevention', 'older adults', 'geriatric', 'CFS', 'frailty pathway'] },
  { label: 'Liver Disease', aliases: ['NAFLD', 'MASLD', 'ARLD', 'hepatitis', 'cirrhosis', 'NCEPOD'] },
  { label: 'Inflammatory Bowel Disease', aliases: ['IBD', "Crohn's Disease", 'ulcerative colitis', 'UC'] },
  { label: 'Sleep Apnoea', aliases: ['OSA', 'obstructive sleep apnoea', 'CPAP', 'sleep disordered breathing'] },
  { label: 'Heart Valve Disease', aliases: ['valvular disease', 'TAVI', 'aortic stenosis', 'mitral valve'] },
  { label: 'Peripheral Arterial Disease', aliases: ['PAD', 'peripheral vascular disease', 'PVD', 'claudication'] },
  { label: 'Virtual Wards', aliases: ['hospital at home', 'HAHW', 'remote monitoring', 'virtual ward'] },
  { label: 'Remote Patient Monitoring', aliases: ['RPM', 'telemonitoring', 'wearables', 'home monitoring'] },
  { label: 'Venous Leg Ulcers', aliases: ['VLU', 'wound care', 'leg ulcer', 'tissue viability'] },
  { label: 'Psoriasis', aliases: ['plaque psoriasis', 'biologic therapy', 'dermatology'] },
  { label: 'Eczema', aliases: ['atopic dermatitis', 'atopic eczema', 'dupilumab'] },
  { label: 'Continence', aliases: ['urinary incontinence', 'bladder', 'bowel', 'pelvic floor'] },
]

function matchConditions(query) {
  if (!query || query.length < 2) return []
  const q = query.toLowerCase()
  return NHS_CONDITIONS.filter(c =>
    c.label.toLowerCase().includes(q) ||
    c.aliases.some(a => a.toLowerCase().includes(q))
  ).slice(0, 8)
}

export default function PathwayTypeahead({ value, onChange, onKeyDown, disabled, id, 'aria-describedby': ariaDescribedBy }) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const suggestions = matchConditions(value)
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
                borderBottom: i < suggestions.length - 1 ? '1px solid #f0f4f5' : 'none'
              }}
            >
              <span style={{ fontWeight: 600 }}>{c.label}</span>
              {c.aliases[0] && (
                <span style={{ marginLeft: '8px', fontSize: '0.875rem', opacity: 0.7 }}>
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
