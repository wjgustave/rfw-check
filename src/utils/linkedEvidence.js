/**
 * Maps pathway/condition names to related interventions and evidence terms
 * that should be considered during assessment even if not in the name itself.
 * Keys are lowercase for case-insensitive matching.
 */
const LINKED_EVIDENCE_MAP = {
  'insomnia': [
    'CBT-I (Cognitive Behavioural Therapy for Insomnia)',
    'Sleepio digital CBT-I programme',
    'sleep restriction therapy',
    'stimulus control therapy',
    'NICE guideline NG238 (insomnia)',
  ],
  'cardiac rehabilitation': [
    'BACPR standards and core components',
    'NACR (National Audit of Cardiac Rehabilitation)',
    'exercise-based cardiac rehabilitation RCTs',
    'CR digital and hybrid delivery models',
  ],
  'pulmonary rehabilitation': [
    'BTS quality standards for pulmonary rehabilitation',
    'NACAP (National Asthma and COPD Audit Programme) PR data',
    'remote and home-based PR delivery evidence',
  ],
  'copd': [
    'pulmonary rehabilitation',
    'GOLD guidelines',
    'NICE NG115 (COPD in over 16s)',
    'inhaler therapy and technique',
    'NACAP COPD audit',
  ],
  'atrial fibrillation': [
    'anticoagulation (NOACs / DOACs)',
    'cardioversion and rate/rhythm control',
    'NICE NG196 (atrial fibrillation)',
    'AF digital detection tools',
  ],
  'hypertension': [
    'NICE NG136 (hypertension in adults)',
    'antihypertensive drug therapy',
    'ambulatory blood pressure monitoring (ABPM)',
    'remote blood pressure monitoring',
    'pharmacy-based hypertension case finding',
  ],
  'hypertension case finding': [
    'NICE NG136',
    'NHS BP@Pharmacy programme',
    'ABPM pathway',
    'cardiovascular risk reduction',
  ],
  'type 2 diabetes': [
    'structured education (DESMOND, X-PERT)',
    'NICE NG28 (type 2 diabetes in adults)',
    'NHS DPP remission pathway',
    'HbA1c monitoring',
    'GLP-1 agonists / SGLT-2 inhibitors',
  ],
  'diabetes prevention programme': [
    'NHS Diabetes Prevention Programme (NHS DPP)',
    'lifestyle coaching evidence',
    'weight loss and pre-diabetes reversal',
    'NICE PH38 (type 2 diabetes prevention)',
  ],
  'structured education for diabetes': [
    'DESMOND programme',
    'DAFNE programme',
    'X-PERT programme',
    'NICE NG28 structured education recommendation',
  ],
  'heart failure': [
    'NICE NG106 (chronic heart failure)',
    'cardiac rehabilitation for HF',
    'remote monitoring / telemonitoring for HF',
    'HF specialist nurses',
    'NICOR national heart failure audit',
  ],
  'talking therapies': [
    'IAPT programme evaluation',
    'NICE CG90 (depression) and CG113 (generalised anxiety)',
    'stepped care model',
    'computerised CBT (cCBT)',
    'digital mental health tools',
  ],
  'depression': [
    'CBT and psychological therapies',
    'NICE CG90 / NG222 (depression)',
    'antidepressant prescribing guidance',
    'IAPT / Talking Therapies pathway',
  ],
  'anxiety': [
    'CBT for anxiety disorders',
    'NICE CG113 (generalised anxiety disorder)',
    'NICE CG31 (OCD), CG26 (PTSD)',
    'IAPT / Talking Therapies pathway',
  ],
  'musculoskeletal first contact practitioner': [
    'MSK FCP programme evidence',
    'NICE MSK guidelines',
    'physiotherapy first contact model',
    'Getting It Right First Time (GIRFT) MSK',
  ],
  'musculoskeletal': [
    'NICE MSK guidelines',
    'GIRFT MSK report',
    'MSK FCP (First Contact Practitioner) model',
    'physiotherapy and exercise therapy evidence',
  ],
  'smoking cessation service': [
    'NCSCT (National Centre for Smoking Cessation and Training)',
    'NICE PH10 (smoking cessation services)',
    'varenicline and NRT evidence',
    'Very Brief Advice (VBA)',
    'tobacco dependency treatment in hospitals',
  ],
  'smoking cessation': [
    'NCSCT standards',
    'NICE PH10',
    'pharmacotherapy (varenicline, NRT, bupropion)',
    'Very Brief Advice model',
  ],
  'obesity': [
    'NICE NG246 (obesity in adults)',
    'Tier 2 / Tier 3 / Tier 4 weight management pathways',
    'GLP-1 agonists (semaglutide, liraglutide)',
    'NHS Digital Weight Management Programme',
    'Total diet replacement programmes',
  ],
  'digital weight management': [
    'NHS Digital Weight Management Programme evaluation',
    'NICE NG246',
    'digital behavioural interventions for weight loss',
    'Tier 2 weight management commissioning guidance',
  ],
  'bariatric surgery pathway': [
    'NICE NG246 bariatric surgery criteria',
    'Tier 4 weight management commissioning',
    'metabolic surgery evidence (T2D remission)',
    'BOMSS (British Obesity and Metabolic Surgery Society)',
  ],
  'virtual wards': [
    'NHS England virtual wards framework',
    'hospital at home evidence',
    'remote monitoring technology for virtual wards',
    'NHSE virtual wards metrics and KPIs',
  ],
  'remote patient monitoring': [
    'NHS Long Term Plan telemonitoring commitments',
    'NICE evidence on remote monitoring',
    'virtual ward remote monitoring evidence',
    'wearable technology clinical validation',
  ],
  'long covid': [
    'NICE NG188 (COVID-19 rapid guideline: managing the long-term effects)',
    'NHS England Long COVID service specifications',
    'Your COVID Recovery digital rehabilitation platform',
    'NIHR long COVID research programme',
  ],
  'long covid rehabilitation': [
    'NICE NG188',
    'NHS Long COVID service specification',
    'Your COVID Recovery platform',
    'post-COVID assessment clinic evidence',
  ],
  'stroke rehabilitation': [
    'NICE NG236 (stroke rehabilitation)',
    'SSNAP (Sentinel Stroke National Audit Programme)',
    'Early Supported Discharge (ESD)',
    'thrombectomy pathway evidence',
    'technology-assisted stroke rehabilitation',
  ],
  'falls prevention': [
    'NICE NG161 (falls in older people)',
    'FallSafe programme',
    'multifactorial falls risk assessment',
    'exercise-based falls prevention (e.g. Otago programme)',
  ],
  'frailty': [
    'NHS England frailty toolkit',
    'Clinical Frailty Scale (CFS)',
    'comprehensive geriatric assessment (CGA)',
    'NICE NG56 (multimorbidity)',
    'frailty identification in primary care',
  ],
  'perinatal mental health': [
    'NICE CG192 (antenatal and postnatal mental health)',
    'NHS England perinatal mental health service specification',
    'Mother and Baby Units (MBUs)',
    'MBRRACE-UK reports',
  ],
  "parkinson's disease": [
    'NICE NG71 (Parkinson\'s disease in adults)',
    'Parkinson\'s nurse specialists',
    'deep brain stimulation pathway',
    'levodopa therapy optimisation',
  ],
  'multiple sclerosis': [
    'NICE NG220 (multiple sclerosis)',
    'disease-modifying therapies (DMTs)',
    'MS nurse specialist pathway',
    'BSRM MS rehabilitation evidence',
  ],
  'epilepsy': [
    'NICE CG137 (epilepsies: diagnosis and management)',
    'NICE NG217 (epilepsies in children)',
    'anti-seizure medication (ASM) pathways',
    'SUDEP Action programme',
    'epilepsy specialist nurses',
  ],
  'chronic pain': [
    'NICE NG193 (chronic primary pain)',
    'pain management programmes (PMP)',
    'psychological approaches to pain (ACT, CBT)',
    'evidence on opioid deprescribing',
  ],
  'alcohol use disorder': [
    'NICE CG115 (alcohol-use disorders)',
    'NICE NG49 (alcohol-use disorders: harmful drinking)',
    'community alcohol detoxification',
    'Alcohol Care Teams hospital pathway',
  ],
  'chronic kidney disease': [
    'NICE NG203 (chronic kidney disease)',
    'UK Renal Registry data',
    'pre-dialysis education pathway',
    'home dialysis and peritoneal dialysis evidence',
  ],
  'cardiovascular disease prevention': [
    'NICE PH25 (cardiovascular disease prevention)',
    'NHS CVD Prevention Programme',
    'lipid management guidelines',
    'NHS Health Check programme',
    'QRISK cardiovascular risk scoring',
  ],
}

/**
 * Returns an array of related evidence terms for a given pathway/condition name.
 * Case-insensitive match. Returns empty array if no mapping found.
 */
export function getLinkedEvidence(pathway) {
  if (!pathway) return []
  const key = pathway.trim().toLowerCase()
  return LINKED_EVIDENCE_MAP[key] ?? []
}
