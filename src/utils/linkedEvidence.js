/**
 * Maps pathway/condition names to related interventions, evidence terms, and linked programmes
 * that should be considered during assessment even if not in the pathway name itself.
 *
 * Keys are lowercase for case-insensitive matching.
 * When a dimension is assessed, linked evidence terms are injected into the prompt so the
 * model searches for and considers this broader evidence base, and explicitly calls it out
 * in the rationale where relevant.
 */
const LINKED_EVIDENCE_MAP = {

  // ── PATHWAYS ─────────────────────────────────────────────────────────────────

  'cardiac rehabilitation': [
    'BACPR Standards and Core Components (7th edition, 2023)',
    'National Audit of Cardiac Rehabilitation (NACR) annual report',
    'NICE NG185 — Cardiac rehabilitation for people with heart disease',
    'NICE NG172 — COVID-19 rapid guideline: cardiac services',
    'Exercise-based cardiac rehabilitation Cochrane systematic review (Anderson et al.)',
    'Hybrid and digital cardiac rehabilitation delivery models',
    'Heart failure, ACS, STEMI, NSTEMI and post-PCI as linked referral populations',
    'NICOR myocardial ischaemia national audit project (MINAP)',
  ],

  'pulmonary rehabilitation': [
    'BTS Quality Standards for Pulmonary Rehabilitation (2014, updated)',
    'NACAP (National Asthma and COPD Audit Programme) pulmonary rehabilitation data',
    'NICE NG115 — COPD in over 16s: diagnosis and management',
    'NICE evidence review on remote and home-based PR delivery',
    'British Lung Foundation / Asthma + Lung UK PR access reports',
    'GOLD guidelines (Global Initiative for Chronic Obstructive Lung Disease)',
    'Interstitial lung disease (ILD) and bronchiectasis as linked referral populations',
    'Six-minute walk test and ESWT as validated PR outcome measures',
  ],

  'diabetes prevention programme': [
    'NHS Diabetes Prevention Programme (NHS DPP) — NHS England commissioned programme',
    'NICE PH38 — Type 2 diabetes prevention: population and community-level interventions',
    'NICE NG28 — Type 2 diabetes in adults: management',
    'Diabetes UK State of the Nation reports',
    'National Diabetes Audit (NDA) prevention data',
    'Lifestyle coaching and structured group education evidence',
    'Weight loss and HbA1c reduction as primary outcomes',
    'Pre-diabetes (impaired fasting glucose, impaired glucose tolerance) identification',
    'GLP-1 agonists and SGLT-2 inhibitors as linked pharmacological interventions',
  ],

  'talking therapies': [
    'NHS Talking Therapies (formerly IAPT) programme evaluation — NHS England',
    'NICE CG90 — Depression in adults: recognition and management',
    'NICE CG113 — Generalised anxiety disorder and panic disorder in adults',
    'NICE CG26 — Post-traumatic stress disorder (PTSD)',
    'NICE CG31 — OCD and body dysmorphic disorder',
    'Stepped care model for common mental health disorders',
    'Computerised CBT (cCBT) and digital mental health tools (e.g. SilverCloud)',
    'NHS Talking Therapies annual reports (recovery rates, access, waiting times)',
    'PHQ-9 and GAD-7 as validated outcome measures',
    'Long-term conditions (diabetes, COPD, cardiac) and mental health comorbidity',
  ],

  'digital weight management': [
    'NHS Digital Weight Management Programme evaluation and NHS England commissioning',
    'NICE NG246 — Obesity in adults: prevention and lifestyle weight management programmes',
    'NICE PH27 — Weight management: lifestyle services for overweight or obese adults',
    'Tier 2 weight management commissioning guidance — NHS England',
    'Digital behavioural interventions for weight loss: systematic review evidence',
    'GLP-1 agonists (semaglutide/Wegovy, liraglutide/Saxenda) as linked pharmacotherapy',
    'NHS BMI thresholds for service eligibility',
    'Diabetes prevention, hypertension and CVD risk reduction as linked outcomes',
  ],

  'structured education for diabetes': [
    'DESMOND (Diabetes Education and Self-Management for Ongoing and Newly Diagnosed) programme',
    'DAFNE (Dose Adjustment for Normal Eating) — type 1 diabetes structured education',
    'X-PERT Diabetes structured education programme',
    'NICE NG28 — structured education recommendation for type 2 diabetes',
    'NICE NG17 — type 1 diabetes in adults',
    'National Diabetes Audit (NDA) — structured education uptake data',
    'HbA1c, quality of life and self-management as primary outcomes',
    'Digital and group-based delivery models for structured education',
  ],

  'nhs health check': [
    'NHS Health Check programme — NHS England specification',
    'NICE PH25 — Cardiovascular disease prevention',
    'QRISK cardiovascular risk scoring tool',
    'National Diabetes Audit (NDA) — Health Check identification of pre-diabetes',
    'NHS England NHS Health Check data reporting framework',
    'Hypertension, type 2 diabetes, CKD, atrial fibrillation as conditions identified',
    'Pharmacy-based Health Check delivery evidence',
    'NICE LGB26 — NHS Health Check programme (local government briefing)',
  ],

  'falls prevention': [
    'NICE NG161 — Falls in older people: assessing risk and prevention',
    'NICE CG161 — replaced by NG161: falls and fracture prevention',
    'FallSafe programme — RCP-endorsed quality improvement',
    'Otago exercise programme — RCT evidence for exercise-based falls prevention',
    'NICE NG191 — Older people: independence and mental wellbeing',
    'National Hip Fracture Database (NHFD) audit',
    'Multifactorial falls risk assessment tools (FRAT, TUG, Berg Balance Scale)',
    'Osteoporosis and fracture liaison service as linked pathway',
    'Frailty, polypharmacy review and vision/hearing as linked risk factors',
    'Safe Medication Review (STOPP/START criteria) in falls context',
  ],

  'smoking cessation service': [
    'NICE PH10 — Smoking cessation services',
    'NICE NG209 — Tobacco: preventing uptake, promoting quitting and treating dependence',
    'NCSCT (National Centre for Smoking Cessation and Training) standards and training framework',
    'Very Brief Advice (VBA) — NCSCT evidence base',
    'Varenicline (Champix/Cytisine), NRT combination, bupropion: pharmacotherapy evidence',
    'Tobacco dependency treatment in acute and mental health settings — NHS Long Term Plan',
    'NHS Digital stop smoking data and NCSCT annual statistics',
    'COPD, cardiovascular disease, cancer and pregnancy as high-priority linked populations',
  ],

  'alcohol care teams': [
    'NICE CG115 — Alcohol-use disorders: diagnosis, assessment and management',
    'NICE PH24 — Alcohol-use disorders: prevention',
    'NICE NG49 — Alcohol-use disorders: harmful drinking and alcohol dependence',
    'National Confidential Enquiry into Patient Outcome and Death (NCEPOD) — alcohol reports',
    'Community alcohol detoxification pathways',
    'Alcohol Care Teams in acute hospitals — NHS England framework',
    'AUDIT and AUDIT-C as validated screening tools',
    'Brief intervention evidence (primary care and A&E settings)',
    'Liver disease and ARLD as linked conditions',
  ],

  'cancer rehabilitation': [
    'NCSI (National Cancer Survivorship Initiative) programme',
    'Macmillan Cancer Support rehabilitation frameworks',
    'NICE NG151 — Rehabilitation after critical illness',
    'NICE guidance on cancer-specific prehabilitation',
    'NHS Long Term Plan — personalised cancer care (stratified follow-up)',
    'SACT (Systemic Anti-Cancer Therapy) patient outcomes data',
    'Exercise oncology evidence: NICE evidence reviews',
    'Fatigue, lymphoedema, and psychological morbidity as linked rehabilitation needs',
    'Personalised Care and Support Plan (PCSP) in cancer pathways',
  ],

  'musculoskeletal first contact practitioner': [
    'NICE NG226 — Osteoarthritis in over 16s: diagnosis and management',
    'NICE NG197 — Low back pain and sciatica in over 16s',
    'NICE NG100 — Spondyloarthritis in over 16s',
    'NICE CG153 — Psoriatic arthritis: diagnosis and management',
    'Getting It Right First Time (GIRFT) — MSK report',
    'Versus Arthritis — MSK conditions prevalence and burden evidence',
    'Physiotherapy and exercise therapy for MSK conditions — evidence base',
    'NHS England MSK pathway and self-referral to physiotherapy evidence',
    'Primary care MSK assessment and triage evidence',
    'Osteoarthritis, back pain, shoulder pain and soft tissue disorders as primary MSK presentations',
  ],

  'virtual wards': [
    'NHS England Virtual Wards framework and operational guidance (2022)',
    'Hospital at Home evidence: Shepperd et al. Cochrane review',
    'NHSE virtual wards metrics, KPIs and DSCN datasets',
    'Remote monitoring technology: pulse oximetry, wearables, RPM platforms',
    'NICE NG191 — Technology enabled care services',
    'Heart failure, respiratory and frailty as primary virtual ward populations',
    'Acute Respiratory Infection (ARI) virtual ward pathway evidence',
    'Hospital at Home clinical safety: NHSE framework',
  ],

  'remote patient monitoring': [
    'NHS Long Term Plan telemonitoring and RPM commitments',
    'NICE evidence review: remote monitoring for heart failure (2021)',
    'NICE TA626 — Remote monitoring of implantable cardiac devices',
    'NHS England digital health partnership agreements (RPM platforms)',
    'Virtual ward remote monitoring as linked programme',
    'Wearable technology clinical validation evidence (pulse oximetry, ECG, BP)',
    'NHSX / NHSE digital transformation strategy',
    'Hypertension, COPD, heart failure and diabetes as primary RPM populations',
  ],

  'hypertension case finding': [
    'NICE NG136 — Hypertension in adults: diagnosis and management',
    'NHS BP@Pharmacy programme — NHS England commissioning specification',
    'Ambulatory blood pressure monitoring (ABPM) — NICE NG136 recommendation',
    'Primary care hypertension QOF indicators',
    'CVD prevention programme — NHS England',
    'QRISK cardiovascular risk tool',
    'National Cardiovascular Audit Programme (NCAP)',
    'NHS Long Term Plan hypertension targets (80% controlled by 2029)',
    'Pharmacy-based case finding evidence',
  ],

  'atrial fibrillation detection': [
    'NICE NG196 — Atrial fibrillation: diagnosis and management',
    'NICE DG35 — AliveCor KardiaMobile for detecting AF',
    'NICE DG41 — Zenicor-ECG for AF detection',
    'NHS Long Term Plan: detect 270,000 additional AF cases',
    'Anticoagulation (NOACs/DOACs) — stroke prevention evidence base',
    'CHADS-VASc scoring tool for stroke risk',
    'AF digital detection tools: pulse rhythm check, photoplethysmography',
    'National Cardiovascular Audit Programme (NCAP) AF data',
    'Opportunistic vs systematic AF screening evidence',
  ],

  'lipid management': [
    'NICE NG238 — Cardiovascular disease: risk assessment and reduction (2023)',
    'NICE TA394 — Alirocumab for treating primary hypercholesterolaemia',
    'NICE TA393 — Evolocumab for treating primary hypercholesterolaemia (PCSK9 inhibitors)',
    'Simon Broome criteria for familial hypercholesterolaemia (FH)',
    'HEART UK — FH specialist care standards',
    'National Cardiovascular Audit Programme (NCAP) lipid data',
    'Statin prescribing evidence and adherence rates',
    'CVD risk reduction and secondary prevention as linked outcomes',
    'QRISK cardiovascular risk tool for treatment threshold decisions',
  ],

  'weight management — tier 3': [
    'NICE NG246 — Obesity in adults: prevention and lifestyle weight management',
    'NHS England Tier 3 weight management commissioning guidance',
    'NHS England specialised weight management service specification',
    'GLP-1 agonists (semaglutide, liraglutide, tirzepatide) as linked pharmacotherapy',
    'Bariatric surgery pathway as linked Tier 4 intervention',
    'Tier 2 Digital Weight Management Programme as step-down pathway',
    'BOMSS (British Obesity and Metabolic Surgery Society) standards',
    'Type 2 diabetes remission as linked outcome measure',
  ],

  'bariatric surgery pathway': [
    'NICE NG246 — bariatric surgery criteria for adults',
    'NHS England Tier 4 / specialised bariatric surgery commissioning specification',
    'BOMSS (British Obesity and Metabolic Surgery Society) standards and outcomes data',
    'National Bariatric Surgery Registry (NBSR)',
    'Metabolic surgery evidence for type 2 diabetes remission',
    'GLP-1 agonists as bridge therapy or alternative to surgery',
    'Prehabilitation and post-operative dietetic support evidence',
    'Tier 3 weight management as linked prerequisite pathway',
  ],

  'long covid rehabilitation': [
    'NICE NG188 — COVID-19 rapid guideline: managing the long-term effects of COVID-19',
    'NHS England Long COVID service specification and service model',
    'Your COVID Recovery — NHS digital rehabilitation platform',
    'NIHR Long COVID research programme findings',
    'Post-COVID Assessment Clinic (PAC) evidence and service models',
    'Fatigue management, breathlessness, cognitive rehabilitation as linked interventions',
    'Pacing and energy conservation (graded activity vs pacing debate)',
    'Mental health comorbidity (depression, anxiety, PTSD) in long COVID',
    'Occupational therapy, physiotherapy and clinical psychology as linked professions',
  ],

  'stroke rehabilitation': [
    'NICE NG236 — Stroke rehabilitation in adults',
    'SSNAP (Sentinel Stroke National Audit Programme) annual report',
    'Royal College of Physicians National Clinical Guideline for Stroke (6th edition)',
    'Early Supported Discharge (ESD) for stroke — Cochrane review evidence',
    'NHS England thrombectomy pathway (mechanical thrombectomy)',
    'NICE IPG548 — Thrombectomy for acute ischaemic stroke',
    'Technology-assisted stroke rehabilitation: robotics, FES, digital tools',
    'NICE guideline on secondary stroke prevention (antiplatelet, anticoagulation)',
    'Aphasia, dysphagia and cognitive rehabilitation as linked specialties',
  ],

  'perinatal mental health': [
    'NICE CG192 — Antenatal and postnatal mental health: clinical management and service guidance',
    'NHS England Perinatal Mental Health Service Specification (community and inpatient)',
    'Mother and Baby Units (MBUs) — NHS England commissioning standards',
    'MBRRACE-UK — Mothers and Babies: Reducing Risk through Audits and Confidential Enquiries',
    'Maternal Mental Health Alliance standards',
    'Edinburgh Postnatal Depression Scale (EPDS) as validated screening tool',
    'Specialist Perinatal Mental Health Teams — NHS Long Term Plan expansion',
    'Trauma-informed care and domestic abuse as linked considerations',
    'Infant mental health and parent-infant relationship as linked outcomes',
  ],

  'community mental health': [
    'NHS Long Term Plan community mental health transformation programme',
    'NICE NG222 — Depression in adults: treatment and management',
    'NICE NG113 — Personality disorders (borderline / antisocial)',
    'NHSE Community Mental Health Framework for Adults and Older Adults (2019)',
    'Community Mental Health Teams (CMHTs) and Primary Care Mental Health Workers',
    'Individual Placement and Support (IPS) employment model',
    'Mental Health Investment Standard (MHIS)',
    'NHS Talking Therapies (IAPT) as linked step-up/step-down pathway',
    'Physical health monitoring (metabolic syndrome, smoking) for people with SMI',
  ],

  'children and young people mental health': [
    'NICE NG134 — Attention deficit hyperactivity disorder: diagnosis and management',
    'NICE CG185 — Challenging behaviour and learning disabilities',
    'NHS Long Term Plan — CYP mental health transformation',
    'NHS England CYP Wellbeing Practitioner programme',
    'CAMHS waiting time standards (18-week access target)',
    'Anna Freud National Centre for Children and Families — evidence base',
    'Early intervention in psychosis for young people (EIP pathway)',
    'iThrive — THRIVE Framework for children\'s mental health',
    'Eating disorders (FREED pathway) as linked priority population',
  ],

  'eating disorders pathway': [
    'NICE NG69 — Eating disorders: recognition and treatment',
    'FREED (First Episode Rapid Early intervention in Eating Disorders) — NHS England',
    'MARSIPAN guidelines — management of really sick patients with anorexia nervosa',
    'NHS England eating disorders commissioning guidance (adults and CYP)',
    'Beat Eating Disorders — outcomes and lived experience evidence',
    'NHS Long Term Plan: waiting time standards for eating disorders',
    'Supported self-management (CBT-E, MANTRA, SSCM) evidence base',
    'Inpatient and day programme commissioning standards',
  ],

  'crisis care pathway': [
    'NICE NG10 — Violence and aggression: short-term management in mental health',
    'NHS Long Term Plan: 24/7 crisis care expansion',
    'NHS England crisis care concordat and NHSE mental health crisis standards',
    'Crisis resolution and home treatment teams (CRHTTs) — evidence base',
    'Mental health liaison in emergency departments — evidence',
    'Psychiatric Decision Units (PDUs) / crisis assessment centres',
    'Zero Suicide Alliance and NSUN Safe Care guidance',
    'Street triage and police liaison as linked services',
  ],

  'enhanced health in care homes': [
    'NHS England Enhanced Health in Care Homes (EHCH) framework (2020)',
    'NICE NG48 — Multimorbidity: clinical assessment and management',
    'NHS Long Term Plan — care homes investment and workforce',
    'Primary care network (PCN) — care home enhanced service specification',
    'Dementia and frailty as primary linked conditions',
    'Medicines optimisation in care homes (NHSE guidance)',
    'Advanced care planning and end-of-life care as linked pathway',
    'Comprehensive Geriatric Assessment (CGA) in care home context',
  ],

  'personalised care': [
    'NHS England Personalised Care Framework and Universal Personalised Care: Implementing the Comprehensive Model',
    'NICE NG107 — Shared decision making',
    'NHS England Patient Activation Measure (PAM) commissioning',
    'Social prescribing link worker network — NHS England',
    'Personal Health Budgets (PHBs) — NHS England',
    'NHS PROMS (Patient Reported Outcome Measures)',
    'Personalised Care and Support Planning — NHS England PCSP toolkit',
    'Health coaching and motivational interviewing evidence base',
    'Self-management education as linked intervention across all long-term conditions',
  ],

  'social prescribing': [
    'NHS England Social Prescribing Link Worker (SPLW) programme',
    'NICE guideline on social prescribing (NG229 community engagement)',
    'National Academy for Social Prescribing (NASP) evidence reports',
    'Personalised care framework as overarching policy context',
    'Primary Care Networks (PCNs) as delivery structure',
    'Loneliness, isolation, mental health, and LTC self-management as linked outcomes',
    'VCSE (Voluntary, Community and Social Enterprise) sector as delivery partner',
    'Social Prescribing Network evidence base',
  ],

  'palliative and end of life care': [
    'NICE NG31 — Care of dying adults in the last days of life',
    'NICE NG142 — Palliative care for adults: strong opioids for pain relief',
    'Gold Standards Framework (GSF) — primary care prognostic indicator guidance',
    'NHS England personalised care and support planning for end of life',
    'Electronic Palliative Care Coordination System (EPaCCS)',
    'NHSE Ambitions for Palliative and End of Life Care (2nd edition)',
    'Hospice UK national data and quality benchmarks',
    'Dying Matters coalition — national awareness and standards',
    'Advance care planning, RESPECT form and DNACPR as linked tools',
  ],

  'urgent community response': [
    'NHS England Urgent Community Response (UCR) service specification (2-hour and 2-day response)',
    'NICE NG47 — Emergency and acute medical care',
    'NHS Long Term Plan — urgent community response investment',
    'Frailty and falls as primary UCR referral populations',
    'Virtual wards and hospital at home as linked step-up pathway',
    'Allied Health Professions (AHP) rapid response evidence',
    'NHSE UCR metrics: avoidable hospital admissions',
  ],

  'elective care recovery': [
    'NHS England Elective Care Recovery and Transformation — Delivery Plan (2022)',
    'NHS constitutional waiting time standards (18-week RTT)',
    'NHS Long Term Plan elective recovery commitments',
    'Getting It Right First Time (GIRFT) programme — specialty reports',
    'Surgical hubs and community diagnostic centres (CDCs) as linked infrastructure',
    'NICE guidance on outpatient management and referral optimisation',
    'Patient Initiated Follow-Up (PIFU) — NHSE framework',
    'Clinical Prioritisation — 2-week wait and urgent referral standards',
  ],

  'osteoporosis fracture prevention': [
    'NICE TA160, TA161, TA204 — bisphosphonate and denosumab treatment appraisals',
    'NICE NG187 — Osteoporosis: assessing the risk of fragility fracture',
    'NOGG (National Osteoporosis Guideline Group) clinical guideline (2022)',
    'Fracture Liaison Service (FLS) — Royal Osteoporosis Society standards',
    'National Hip Fracture Database (NHFD) audit',
    'FRAX tool — WHO fracture risk assessment',
    'DXA (DEXA) scanning as diagnostic standard',
    'Falls prevention pathway as bidirectionally linked service',
    'Royal Osteoporosis Society Breaking the Cycle of Harm report',
  ],

  'continence pathway': [
    'NICE NG123 — Urinary incontinence and pelvic organ prolapse in women: management',
    'NICE CG171 — Urinary incontinence in neurological disease',
    'NICE guideline on lower urinary tract symptoms in men (NG101)',
    'Bladder and bowel community pathway — NHS England',
    'Continence Foundation of Australia (CFA) and ERIC (UK) evidence base',
    'Pelvic floor physiotherapy evidence (conservative first-line treatment)',
    'Continence service QOF indicators in primary care',
    'Frailty and dementia as linked comorbidity populations',
  ],

  'drug and alcohol treatment': [
    'NICE CG115 — Alcohol-use disorders: diagnosis, assessment and management',
    'NICE CG51 — Drug misuse: psychosocial interventions',
    'NICE CG52 — Drug misuse: opioid detoxification',
    'OHID (Office for Health Inequalities and Disparities) drug and alcohol treatment statistics',
    'National Drug Treatment Monitoring System (NDTMS)',
    'Dame Carol Black Review of Drugs — NHS treatment recommendations',
    'Recovery-oriented systems of care evidence',
    'Opiate substitution therapy (OST) — methadone, buprenorphine evidence base',
    'Dual diagnosis (mental health and substance misuse) as linked consideration',
  ],

  'wound care and tissue viability': [
    'NICE NG200 — Leg ulcer — venous (community care)',
    'NICE NG149 — Pressure ulcers: prevention and management',
    'Wounds UK Best Practice guidelines',
    'Legs Matter coalition — national venous leg ulcer evidence and advocacy',
    'NHS Supply Chain wound care evidence framework',
    'Compression therapy evidence for VLU (four-layer, Doppler assessment)',
    'Diabetic foot ulcer pathway — NICE NG19',
    'Tissue Viability Society (TVS) standards',
    'NHSE NHS-wide savings programme wound care evidence',
  ],

  'learning disabilities health': [
    'NICE NG54 — Challenging behaviour and learning disabilities',
    'NHS England LeDeR (Learning from Deaths Review) programme',
    'Annual health check for people with learning disabilities — NHS England',
    'Reasonable adjustments framework — NHS England',
    'Transforming Care programme — NHS England / NHS Improvement',
    'STOMP and STAMP — stopping over-medication of people with LD',
    'Royal College of Psychiatrists — LD psychiatry standards',
    'Health inequalities for people with learning disabilities: NHS England evidence',
  ],

  'autism diagnosis pathway': [
    'NICE CG142 — Autism spectrum disorder in adults: diagnosis and management',
    'NICE CG128 — Autism spectrum disorder in under 19s: recognition, referral and diagnosis',
    'NICE NG214 — Autism in adults (updated guideline)',
    'NHS England Autism strategy and Long Term Plan commitments',
    'Waiting time data for autism assessment — NHS England',
    'Autistica and National Autistic Society evidence base',
    'Post-diagnostic support as linked service requirement',
    'Sensory processing and co-occurring ADHD, anxiety as linked conditions',
  ],

  'adhd pathway': [
    'NICE NG87 — Attention deficit hyperactivity disorder: diagnosis and management',
    'NICE TA98 — Methylphenidate, atomoxetine and dexamfetamine for ADHD (children)',
    'NHS England ADHD service specification and shared care framework',
    'UKAAN (UK Adult ADHD Network) — adult ADHD diagnostic and treatment standards',
    'Shared care protocols between secondary care and GP for stimulant prescribing',
    'Co-occurring autism, anxiety, sleep disorder and mood disorder as linked conditions',
    'Right to Choose policy for ADHD assessment — NHS England',
    'Waiting time pressures — NHS England review of adult ADHD services (2024)',
  ],

  'cardiovascular disease prevention': [
    'NICE PH25 — Cardiovascular disease prevention',
    'NICE NG238 — Cardiovascular disease: risk assessment and reduction (including lipid modification)',
    'NHS CVD Prevention Programme — NHS England',
    'NHS Health Check programme as linked population screening pathway',
    'QRISK3 cardiovascular risk assessment tool',
    'NHS Long Term Plan: detection and management of AF, hypertension and cholesterol',
    'National Cardiovascular Audit Programme (NCAP)',
    'Primary and secondary prevention distinction in evidence base',
    'Social determinants and health inequalities in CVD — NHSE framework',
  ],

  // ── CONDITIONS ───────────────────────────────────────────────────────────────

  'copd': [
    'NICE NG115 — COPD in over 16s: diagnosis and management',
    'GOLD guidelines (Global Initiative for Chronic Obstructive Lung Disease) — annual update',
    'NACAP (National Asthma and COPD Audit Programme) — COPD audit data',
    'BTS quality standards for COPD',
    'Pulmonary rehabilitation as primary linked intervention pathway',
    'Inhaler technique assessment and inhaler therapy optimisation evidence',
    'COPD recall and self-management plan evidence',
    'Smoking cessation as highest priority linked intervention',
    'NIV (non-invasive ventilation) and LTOT (long-term oxygen therapy) evidence',
  ],

  'asthma': [
    'BTS/SIGN British guideline on the management of asthma (2019, updated)',
    'NICE NG80 — Asthma: diagnosis, monitoring and chronic asthma management',
    'NACAP (National Asthma and COPD Audit Programme) — asthma audit data',
    'National Review of Asthma Deaths (NRAD) — avoidable deaths evidence',
    'Asthma + Lung UK evidence and patient reports',
    'Inhaler technique and inhaler adherence as key quality measures',
    'Biologic therapies for severe asthma (omalizumab, dupilumab — NICE TAs)',
    'Asthma self-management and personalised action plans evidence',
    'Smoking cessation and air quality as linked risk factors',
  ],

  'heart failure': [
    'NICE NG106 — Chronic heart failure in adults: diagnosis and management',
    'NICE TA267 — Ivabradine for heart failure',
    'NICE TA314 — Sacubitril valsartan for chronic HF',
    'NICOR National Heart Failure Audit (NHFA)',
    'ESC (European Society of Cardiology) heart failure guidelines (2021)',
    'Cardiac rehabilitation for heart failure — NICE NG185',
    'Specialist heart failure nurses — NHFA outcome data',
    'Remote monitoring and telemonitoring for heart failure — NICE evidence review',
    'SGLT-2 inhibitors (dapagliflozin, empagliflozin) for heart failure — NICE TAs',
    'Device therapy: CRT, ICD — NICE guidance',
  ],

  'atrial fibrillation': [
    'NICE NG196 — Atrial fibrillation: diagnosis and management',
    'ESC (European Society of Cardiology) AF guidelines (2020)',
    'Anticoagulation with NOACs/DOACs — stroke prevention evidence',
    'CHADS-VASc and HAS-BLED scoring tools',
    'Cardioversion and rate vs rhythm control evidence',
    'National Cardiovascular Audit Programme (NCAP) AF data',
    'AF detection pathway (KardiaMobile — NICE DG35, Zenicor — NICE DG41)',
    'AF ablation — NICE TA197 and evidence reviews',
    'NHS Long Term Plan: detect 270,000 additional AF cases by 2029',
  ],

  'hypertension': [
    'NICE NG136 — Hypertension in adults: diagnosis and management',
    'NICE DG12 — Renal denervation for hypertension',
    'National Cardiovascular Audit Programme (NCAP) hypertension data',
    'NHS Long Term Plan hypertension targets (80% controlled blood pressure by 2029)',
    'ABPM (ambulatory blood pressure monitoring) as diagnostic standard',
    'Home blood pressure monitoring evidence',
    'NHS BP@Pharmacy programme',
    'CVD risk reduction and QRISK3 as linked decision tools',
    'Antihypertensive drug classes: ACE inhibitors, ARBs, CCBs, thiazide diuretics evidence',
  ],

  'coronary heart disease': [
    'NICE NG185 — Cardiac rehabilitation for people with heart disease',
    'NICE NG199 — Chest pain of recent onset',
    'NICE NG238 — Lipid modification for CVD prevention',
    'NICE NG45 — Stable angina management',
    'ESC guidelines for ACS, STEMI and NSTEMI (2023)',
    'MINAP (Myocardial Ischaemia National Audit Project) — NICOR audit data',
    'Antiplatelet therapy, beta-blockers, ACE inhibitors, statins as secondary prevention',
    'Cardiac rehabilitation — NACR audit and NICE NG185',
    'Percutaneous coronary intervention (PCI) and CABG evidence base',
  ],

  'type 2 diabetes': [
    'NICE NG28 — Type 2 diabetes in adults: management',
    'NICE NG238 — Lipid modification and CVD risk in diabetes',
    'National Diabetes Audit (NDA) — process and outcome measures',
    'Diabetes UK State of the Nation reports',
    'SGLT-2 inhibitors (dapagliflozin, empagliflozin) — cardiorenal evidence',
    'GLP-1 agonists (semaglutide, liraglutide) — weight and glycaemic evidence',
    'HbA1c, blood pressure and cholesterol as 8 care processes (NDA)',
    'Structured education (DESMOND, X-PERT) as linked intervention',
    'Diabetic eye, foot and renal complications as linked screening pathways',
    'NHS Diabetes Prevention Programme as linked prevention pathway',
  ],

  'type 1 diabetes': [
    'NICE NG17 — Type 1 diabetes in adults: diagnosis and management',
    'NICE NG18 — Diabetes (type 1 and type 2) in children and young people',
    'National Diabetes Audit (NDA) type 1 data',
    'DAFNE (Dose Adjustment for Normal Eating) — structured education evidence',
    'Flash glucose monitoring (FreeStyle Libre) — NICE evidence review',
    'Continuous glucose monitoring (CGM) — NICE technology appraisal',
    'Insulin pump therapy (CSII) — NICE TA151',
    'Closed-loop insulin delivery (artificial pancreas) — NICE TA943',
    'Hypoglycaemia management and driving safety as linked considerations',
  ],

  'obesity': [
    'NICE NG246 — Obesity in adults: prevention and lifestyle weight management',
    'NICE PH27 — Weight management services (lifestyle)',
    'GLP-1 agonists (semaglutide/Wegovy, tirzepatide/Mounjaro) — NICE technology appraisals',
    'NHS Digital Weight Management Programme (Tier 2)',
    'Tier 3 specialised weight management and Tier 4 bariatric surgery as linked pathways',
    'BOMSS (British Obesity and Metabolic Surgery Society) standards',
    'Obesity as risk factor: type 2 diabetes, hypertension, CVD, sleep apnoea as linked conditions',
    'Health inequalities and obesity — PHE / OHID evidence',
    'NHS BMI thresholds and ethnicity-adjusted thresholds',
  ],

  'chronic kidney disease': [
    'NICE NG203 — Chronic kidney disease: assessment and management',
    'UK Renal Registry (Kidney Care UK) annual statistical report',
    'NICE DG37 — Chronic kidney disease: early identification and management in primary care',
    'Pre-dialysis education pathway — NHS Kidney Care',
    'Home dialysis (peritoneal dialysis and home haemodialysis) evidence',
    'SGLT-2 inhibitors for CKD — NICE TA NG203 update evidence',
    'eGFR and ACR as primary monitoring biomarkers',
    'Hypertension and diabetes control as linked interventions in CKD',
    'Transplantation pathway — NHS Blood and Transplant (NHSBT) data',
  ],

  'dementia': [
    'NICE NG97 — Dementia: assessment, management and support for people living with dementia',
    'NICE NG205 — Dementia: medicines for cognitive symptoms',
    'National Dementia Audit (HQIP)',
    'Dementia diagnosis rates — NHS England NHSE indicator data',
    'NHS England Dementia Strategy and Prime Minister\'s Challenge on Dementia',
    'Non-pharmacological interventions: cognitive stimulation therapy (CST), reminiscence, music therapy',
    'Carer support and Dementia Support Service (Alzheimer\'s Society) evidence',
    'Frailty, falls and delirium as linked conditions',
    'Post-diagnostic support pathways — NHS England framework',
  ],

  'depression': [
    'NICE NG222 — Depression in adults: treatment and management (2022)',
    'NICE CG90 — Depression in adults: recognition and management (superseded)',
    'NHS Talking Therapies (IAPT) programme as linked treatment pathway',
    'PHQ-9 and PHQ-2 as validated screening and outcome tools',
    'CBT, behavioural activation and interpersonal therapy evidence base',
    'Antidepressant prescribing guidance — NICE NG222',
    'Long-term conditions (diabetes, COPD, cardiac) and depression comorbidity evidence',
    'Stepped care model: wellbeing practitioners, high-intensity workers, specialist services',
    'NICE CG91 — Depression with a chronic physical health problem',
  ],

  'anxiety': [
    'NICE CG113 — Generalised anxiety disorder and panic disorder in adults',
    'NICE CG26 — PTSD in adults (updated by NG116)',
    'NICE CG31 — OCD and body dysmorphic disorder',
    'NICE CG159 — Social anxiety disorder: recognition, assessment and treatment',
    'NHS Talking Therapies (IAPT) programme as linked treatment pathway',
    'GAD-7 as validated screening and outcome measure',
    'CBT, exposure therapy, mindfulness-based interventions evidence',
    'Long-term conditions and health anxiety comorbidity evidence',
    'Stepped care model for anxiety disorders',
  ],

  'long covid': [
    'NICE NG188 — COVID-19 rapid guideline: managing the long-term effects',
    'NHS England Long COVID service specification',
    'Your COVID Recovery — NHS digital rehabilitation platform',
    'NIHR Long COVID research programme — prevalence and treatment evidence',
    'Fatigue management and pacing evidence',
    'Mental health comorbidity (depression, anxiety, PTSD) in long COVID',
    'Breathlessness, cognitive impairment and physical deconditioning as linked presentations',
    'Post-COVID assessment clinic models — NHS England',
    'Long COVID rehab pathway as linked service',
  ],

  'osteoporosis': [
    'NOGG (National Osteoporosis Guideline Group) clinical guideline (2022)',
    'NICE NG187 — Osteoporosis: assessing the risk of fragility fracture',
    'NICE TA160, TA204 — alendronate, risedronate bisphosphonate appraisals',
    'NICE TA204 — strontium ranelate and TA494 — denosumab for osteoporosis',
    'Royal Osteoporosis Society — standards for fracture liaison services',
    'National Hip Fracture Database (NHFD) audit',
    'FRAX tool for fracture risk prediction',
    'Falls prevention pathway as bidirectionally linked intervention',
    'Osteoporosis as linked outcome of glucocorticoid therapy, myeloma, rheumatoid arthritis',
  ],

  'osteoarthritis': [
    'NICE NG226 — Osteoarthritis in over 16s: diagnosis and management (2022)',
    'NICE CG59 — Osteoarthritis: care and management (superseded by NG226)',
    'Getting It Right First Time (GIRFT) MSK report',
    'Musculoskeletal FCP (First Contact Practitioner) pathway as linked service',
    'Exercise and physical activity as first-line treatment evidence (NICE)',
    'Physiotherapy and self-management education evidence',
    'Joint replacement waiting times — NHS England elective recovery data',
    'OARSI (Osteoarthritis Research Society International) guidelines',
    'Obesity and weight management as linked modifiable risk factor',
  ],

  'rheumatoid arthritis': [
    'NICE NG100 — Rheumatoid arthritis in adults: management',
    'BSR (British Society for Rheumatology) RA guideline and DMARD monitoring guidance',
    'National Early Inflammatory Arthritis Audit (NEIAA) — HQIP',
    'Early DMARD therapy — treat-to-target strategy evidence',
    'Biologic therapies (TNF inhibitors, JAK inhibitors, rituximab) — NICE TAs',
    'Cardiovascular risk management in RA as linked consideration',
    'EULAR (European League Against Rheumatism) RA management guidelines',
    'DAS28 and CDAI as validated disease activity measures',
    'Occupational therapy and physiotherapy in RA self-management',
  ],

  'chronic pain': [
    'NICE NG193 — Chronic primary pain: assessment and management (2021)',
    'British Pain Society standards for pain management programmes (PMPs)',
    'Psychological approaches: ACT (acceptance and commitment therapy), CBT evidence',
    'NICE evidence on opioid deprescribing and opioid tapering',
    'Pain management programmes (PMPs) — multidisciplinary evidence base',
    'Chronic pain and depression/anxiety comorbidity as linked consideration',
    'NICE guidance on low back pain (NG197) as related condition',
    'Physiotherapy and exercise therapy for chronic pain evidence',
    'IASP (International Association for the Study of Pain) definitions and frameworks',
  ],

  'fibromyalgia': [
    'NICE guidance on chronic primary pain (NG193) — includes fibromyalgia',
    'British Society for Rheumatology fibromyalgia guidelines',
    'EULAR (European League Against Rheumatism) fibromyalgia management recommendations',
    'Fibromyalgia Impact Questionnaire (FIQ) as validated outcome measure',
    'Exercise, CBT and multimodal pain management as evidence-based interventions',
    'Sleep disorder, depression and anxiety as comorbid conditions',
    'Fibromyalgia UK patient evidence and lived experience',
    'Differential diagnosis from inflammatory arthritis as linked diagnostic consideration',
  ],

  "parkinson's disease": [
    'NICE NG71 — Parkinson\'s disease in adults',
    'Parkinson\'s UK clinical data and patient experience evidence',
    'Parkinson\'s nurse specialist (PNS) — NICE NG71 recommendation',
    'Deep brain stimulation (DBS) — NICE IPG188',
    'Levodopa and dopamine agonist therapy optimisation evidence',
    'Palliative and end-of-life care planning as linked pathway',
    'Falls, dysphagia, dementia and depression as linked complications',
    'Parkinson\'s Disease Nurse Specialist Association (PDNSA) standards',
  ],

  'multiple sclerosis': [
    'NICE NG220 — Multiple sclerosis in adults: management (2022)',
    'Disease-modifying therapies (DMTs): interferon beta, natalizumab, ocrelizumab — NICE TAs',
    'MS Society clinical benchmarking evidence',
    'MSNAP (Multiple Sclerosis National Audit Programme) — HQIP',
    'MS nurse specialist pathway — NICE NG220 recommendation',
    'BSRM (British Society of Rehabilitation Medicine) MS rehabilitation standards',
    'Fatigue, cognition, spasticity and bladder dysfunction as linked symptom management areas',
    'EDSS (Expanded Disability Status Scale) as validated outcome measure',
  ],

  'epilepsy': [
    'NICE CG137 — Epilepsies: diagnosis and management (to be updated)',
    'NICE NG217 — Epilepsies in children, young people and adults (2022)',
    'SUDEP Action programme — sudden unexpected death in epilepsy risk reduction',
    'National Epilepsy Audit — HQIP',
    'Anti-seizure medication (ASM) pathways and drug interactions evidence',
    'Epilepsy specialist nurses (ESN) — NICE NG217 recommendation',
    'Women and epilepsy: valproate pregnancy prevention programme (NHS England)',
    'NICE guideline on first seizure assessment',
    'Ketogenic diet as linked therapy for drug-resistant epilepsy',
  ],

  'motor neurone disease': [
    'NICE NG42 — Motor neurone disease: assessment and management',
    'Motor Neurone Disease Association (MNDA) standards and evidence',
    'Riluzole — NICE TA20 (disease-modifying therapy)',
    'Multidisciplinary team care for MND — NICE NG42 recommendation',
    'Gastrostomy (PEG/RIG) and NIV (non-invasive ventilation) as linked interventions',
    'Palliative and end-of-life care planning as early linked pathway',
    'Cognitive impairment and ALS-FTD (frontotemporal dementia) as linked consideration',
    'MNDA care centres as linked specialist service model',
  ],

  'autism spectrum disorder': [
    'NICE CG142 — Autism spectrum disorder in adults: diagnosis and management',
    'NICE CG128 — Autism spectrum disorder in under 19s: recognition, referral and diagnosis',
    'NICE NG214 — Autism in adults (updated 2021)',
    'NHS England autism strategy and waiting times data',
    'Autistica and National Autistic Society evidence base',
    'Co-occurring ADHD, anxiety, depression and sleep disorder as linked conditions',
    'Reasonable adjustments and sensory needs as linked service requirements',
    'Post-diagnostic support — NHS England linked guidance',
  ],

  'adhd': [
    'NICE NG87 — ADHD: diagnosis and management (updated 2019)',
    'UKAAN (UK Adult ADHD Network) diagnostic and treatment standards',
    'NICE TA98 — Methylphenidate, atomoxetine, dexamfetamine for ADHD in children',
    'Shared care protocols for stimulant prescribing between specialist and GP',
    'NHS England adult ADHD service review (2024)',
    'Right to Choose policy — NHS England',
    'Co-occurring autism, anxiety, sleep disorder and substance misuse as linked conditions',
    'Non-pharmacological interventions: CBT, psychoeducation, coaching evidence',
  ],

  'frailty': [
    'NHS England Frailty toolkit and identification framework',
    'Clinical Frailty Scale (CFS) — Rockwood et al. evidence base',
    'Comprehensive Geriatric Assessment (CGA) — Cochrane systematic review',
    'NICE NG56 — Multimorbidity: clinical assessment and management',
    'Frailty identification in primary care — electronic Frailty Index (eFI)',
    'NICE NG191 — Older people: independence and mental wellbeing',
    'Falls prevention, dementia, continence and polypharmacy as linked considerations',
    'Enhanced Health in Care Homes (EHCH) framework as linked pathway',
    'British Geriatrics Society frailty standards',
  ],

  'liver disease': [
    'NICE NG49 — Cirrhosis in over 16s: assessment and management',
    'NHS England ARLD (Alcohol-Related Liver Disease) care bundle',
    'British Society of Gastroenterology (BSG) liver disease guidelines',
    'Non-alcoholic fatty liver disease (NAFLD/MASLD) — NICE NG49 and BSG',
    'British Liver Trust evidence and patient pathway standards',
    'National Liver Offering Scheme (NLOS) — NHSBT transplant data',
    'FIB-4 and Fibroscan as linked non-invasive fibrosis tools',
    'Alcohol use disorder as primary linked aetiology',
    'Hepatitis B and C treatment — NICE TAs and elimination targets',
  ],

  'inflammatory bowel disease': [
    'NICE NG129 — Crohn\'s disease: management (2019)',
    'NICE NG130 — Ulcerative colitis: management (2019)',
    'IBD UK audit (HQIP) — quality standards for IBD care',
    'British Society of Gastroenterology (BSG) IBD guidelines',
    'Biologic and advanced therapies (adalimumab, infliximab, vedolizumab, ustekinumab) — NICE TAs',
    'IBD nurse specialist role — national standard',
    'Faecal calprotectin and endoscopy as linked monitoring tools',
    'Mental health comorbidity and IBD — linked evidence',
    'Surgery (colectomy, resection) pathway as linked intervention',
  ],

  'sleep apnoea': [
    'NICE TA139 — Continuous positive airway pressure for the treatment of OSA',
    'NICE guideline on sleep apnoea (NG241 or equivalent)',
    'British Thoracic Society (BTS) guidelines for OSA',
    'CPAP therapy adherence and outcomes evidence',
    'Mandibular advancement devices (MADs) — NICE evidence review',
    'Cardiovascular risk, hypertension and type 2 diabetes as linked comorbidities',
    'Overnight oximetry and polysomnography as diagnostic standards',
    'Obesity as primary linked risk factor',
    'Driving and sleep apnoea — DVLA guidance as linked consideration',
  ],

  'insomnia': [
    'NICE CG49 — Insomnia: newer hypnotic drugs (2004)',
    'NICE NG238 / KTT7 — Insomnia knowledge update',
    'CBT-I (Cognitive Behavioural Therapy for Insomnia) — NICE preferred first-line intervention',
    'Sleepio digital CBT-I programme — NICE evidence review and NHS commissioning evidence',
    'Sleep restriction therapy and stimulus control therapy as CBT-I components',
    'ISI (Insomnia Severity Index) and sleep diary as validated outcome measures',
    'NICE evidence review: digital therapeutics for insomnia',
    'Hypnotic medication risks: tolerance, dependence, cognitive effects — NICE CG49',
    'Depression, anxiety, ADHD, chronic pain, COPD and sleep apnoea as bidirectional comorbidities',
  ],

  'heart valve disease': [
    'NICE TA584 — Transcatheter aortic valve implantation (TAVI)',
    'ESC / EACTS guidelines for valvular heart disease (2021)',
    'NICE NG174 — Transcatheter aortic valve implantation for aortic stenosis',
    'National Institute for Cardiovascular Outcomes Research (NICOR) valve surgery audit',
    'British Heart Valve Society (BHVS) standards',
    'Anticoagulation management for mechanical valves as linked intervention',
    'Heart failure and AF as linked comorbidities',
    'Mitral valve repair vs replacement evidence base',
  ],

  'peripheral arterial disease': [
    'NICE NG147 — Peripheral arterial disease: diagnosis and management',
    'NICE IPG307 — Angioplasty and stenting for peripheral arterial disease',
    'Vascular Society of Great Britain and Ireland (VSGBI) quality standards',
    'National Vascular Registry (NVR) audit data',
    'Exercise therapy for claudication — NICE NG147 recommendation',
    'Supervised exercise programme evidence for PAD',
    'Smoking cessation as highest-priority linked intervention for PAD',
    'Diabetic foot pathway and CKD as linked comorbidities',
    'Ankle-brachial pressure index (ABPI) as diagnostic standard',
  ],

  'psoriasis': [
    'NICE NG88 — Psoriasis: assessment and management',
    'NICE technology appraisals for biologic therapies (adalimumab, secukinumab, ixekizumab, risankizumab, etc.)',
    'NICE CG153 — Psoriatic arthritis',
    'British Association of Dermatologists (BAD) biologic interventions guidelines',
    'PASI (Psoriasis Area and Severity Index) and DLQI as validated outcome measures',
    'Psoriatic arthritis comorbidity screening as linked requirement',
    'Metabolic syndrome, cardiovascular disease and mental health as linked comorbidities',
    'Systemic therapy (methotrexate, ciclosporin, acitretin) as step-up pathway',
  ],

  'eczema': [
    'NICE NG190 — Atopic eczema in under 12s: diagnosis and management (2023)',
    'NICE NG3 — Eczema (atopic): for children (older guideline)',
    'NICE TA681 — Dupilumab for moderate to severe atopic dermatitis (adults)',
    'NICE TA1009 — Tralokinumab and lebrikizumab for atopic eczema',
    'British Association of Dermatologists (BAD) eczema guidelines',
    'EASI (Eczema Area and Severity Index) and POEM as validated outcome measures',
    'Topical corticosteroids, tacrolimus, dupilumab as step-care intervention evidence',
    'Emollient prescribing rationalisation — NHS evidence',
    'Sleep disturbance and mental health as linked comorbidities in severe eczema',
  ],

  'alcohol use disorder': [
    'NICE CG115 — Alcohol-use disorders: diagnosis, assessment and management',
    'NICE NG49 — Alcohol-use disorders: harmful drinking and alcohol dependence',
    'NICE PH24 — Alcohol-use disorders: prevention',
    'AUDIT and AUDIT-C as validated screening tools',
    'Community alcohol detoxification: acamprosate, naltrexone, chlordiazepoxide evidence',
    'Alcohol Care Teams in acute hospitals — NHS England framework',
    'Brief interventions in primary care and emergency settings evidence (FRAMES model)',
    'Liver disease and ARLD as primary linked complication',
    'Dual diagnosis (depression, anxiety, PTSD) as linked mental health consideration',
  ],

  // ── NICE HTG-SPECIFIC TECHNOLOGIES & CONDITIONS ───────────────────────────────

  // Aliases for substring matching (ensure shorter form matches full HTG titles)
  'eating disorders': [
    'NICE CG9 — Eating disorders: recognition and treatment',
    'NICE NG69 — Eating disorders: recognition and treatment (2017, updated)',
    'BEAT Eating Disorders — service and outcomes data',
    'NHS England Eating Disorder CQUIN and waiting time standards',
    'MARSIPAN and Junior MARSIPAN guidance (medical management of severe AN)',
    'CBT-E and family-based therapy as NICE-recommended interventions',
    'Early intervention programmes and community eating disorder teams evidence',
    'FREED (First Episode Rapid Early intervention for Eating Disorders) pathway evaluation',
  ],

  'virtual ward': [
    'NHS England Virtual Ward Framework (2022) — operational guidance',
    'NHS England NHSEI virtual wards learning catalogue',
    'NHSE Pulse Oximetry at Home (COVID-19) evaluation — NHS England / NHSEI',
    'BMJ evidence review: remote monitoring and virtual wards for acute illness',
    'Criteria for safe virtual ward admission and discharge thresholds evidence',
    'Digital remote monitoring in acute respiratory illness: systematic review',
    'Hospital at Home evidence base (Leff et al.; Caplan et al. Cochrane review)',
    'ICS Virtual Ward programme data and outcome dashboards — NHS Futures platform',
  ],

  'musculoskeletal': [
    'NHS England MSK Framework — Implementing MSK services (2019)',
    'Getting It Right First Time (GIRFT) MSK programme reports',
    'NICE NG226 — Low back pain and sciatica in over 16s: assessment and management',
    'NICE NG199 — Osteoarthritis in over 16s: diagnosis and management',
    'MSK First Contact Practitioner (FCP) programme evaluation — NHS England',
    'Physiotherapy First and direct access physiotherapy evidence',
    'Waiting time and demand modelling for elective MSK care — NHS Right Care',
    'Patient-reported outcomes (PROMs) for MSK: EQ-5D, Oxford scores',
  ],

  'stroke': [
    'NICE NG128 — Stroke and transient ischaemic attack in over 16s: diagnosis and initial management',
    'Sentinel Stroke National Audit Programme (SSNAP) annual data',
    'NICE QS2 — Stroke quality standards',
    'NHS England national stroke service model — integrated stroke delivery networks (ISDNs)',
    'FAST (Face Arm Speech Time) public awareness and pre-hospital triage evidence',
    'Thrombolysis and thrombectomy as time-critical interventions — NICE TA264, TA425',
    'Early supported discharge (ESD) stroke rehabilitation evidence (Cochrane review)',
    'AF as primary modifiable stroke risk factor — anticoagulation evidence base',
  ],

  "parkinson's disease": [
    'NICE NG71 — Parkinson\'s disease in adults: diagnosis and management',
    'Parkinson\'s UK — national services and care standards',
    'UK Parkinson\'s Excellence Network — audit and improvement data',
    'Remote monitoring wearables for motor fluctuations in Parkinson\'s evidence',
    'Multidisciplinary team (MDT) approach including physio, SALT, OT evidence',
    'DBS (deep brain stimulation) and levodopa optimisation as linked interventions',
    'NICE QS164 — Parkinson\'s disease quality standards',
    'Falls risk and cognitive decline as primary linked comorbidities',
  ],

  'parkinson': [
    'NICE NG71 — Parkinson\'s disease in adults: diagnosis and management',
    'Parkinson\'s UK — national services and care standards',
    'UK Parkinson\'s Excellence Network — audit and improvement data',
    'Remote monitoring wearables for motor fluctuations in Parkinson\'s evidence',
    'Multidisciplinary team (MDT) approach including physio, SALT, OT evidence',
    'DBS (deep brain stimulation) and levodopa optimisation as linked interventions',
    'NICE QS164 — Parkinson\'s disease quality standards',
    'Falls risk and cognitive decline as primary linked comorbidities',
  ],

  // AI-assisted echocardiography (HTG779)
  'echocardiography': [
    'NICE HTG779 — AI-assisted echocardiography analysis for heart failure diagnosis',
    'British Society of Echocardiography (BSE) standards and accreditation framework',
    'NHS England echo workforce and capacity review',
    'ASE/EACVI chamber quantification guidelines (2015, updated)',
    'AI for automated left ventricular ejection fraction (LVEF) assessment — clinical evidence',
    'Diagnosis of HFrEF, HFmrEF, HFpEF and echocardiographic criteria',
    'NICE NG106 — Chronic heart failure in adults: diagnosis and management',
    'Imaging AI validation frameworks — NHS AI Lab and NICE evidence standards',
  ],

  // Spirometry algorithms for asthma/COPD (HTG776)
  'spirometry': [
    'NICE HTG776 — Digital spirometry algorithms for asthma and COPD diagnosis',
    'BTS/SIGN British Guideline on the Management of Asthma (2023)',
    'GOLD Guidelines for COPD (Global Initiative for Chronic Obstructive Lung Disease)',
    'NHS England community diagnostic centres (CDCs) — respiratory pathway integration',
    'Lung function testing: FEV1/FVC ratio, post-bronchodilator reversibility criteria',
    'National Asthma and COPD Audit Programme (NACAP) spirometry data',
    'Lung function in primary care: under-diagnosis evidence (RCP National review)',
    'Quality of spirometry — BTS spirometry quality standards and training frameworks',
  ],

  // AI colorectal polyp detection (HTG773)
  'colorectal polyps': [
    'NICE HTG773 — AI technologies for detecting and characterising colorectal polyps',
    'NHS Bowel Cancer Screening Programme (BCSP) — national audit and standards',
    'NICE NG151 — Colorectal cancer: diagnosis and management',
    'British Society of Gastroenterology (BSG) colonoscopy quality standards',
    'Adenoma detection rate (ADR) as key quality indicator for colonoscopy',
    'Artificial intelligence in endoscopy: systematic reviews and randomised trial evidence',
    'NHS Long Term Plan commitments on cancer early diagnosis',
    'FIT (faecal immunochemical test) and bowel scope as linked screening tools',
  ],

  'colorectal cancer': [
    'NICE HTG773 — AI technologies for detecting and characterising colorectal polyps',
    'NHS Bowel Cancer Screening Programme (BCSP) — national audit and standards',
    'NICE NG151 — Colorectal cancer: diagnosis and management',
    'British Society of Gastroenterology (BSG) colonoscopy quality standards',
    'NHS Long Term Plan — ambition to detect 75% of cancers at stage 1 or 2',
    'FIT (faecal immunochemical test) as primary screening modality evidence',
    'Adenoma detection rate (ADR) as key quality indicator for colonoscopy',
  ],

  // Pulmonary artery pressure monitoring (HTG769)
  'pulmonary artery pressure': [
    'NICE HTG769 — Pulmonary artery pressure technologies for remote heart failure monitoring',
    'CHAMPION trial (CardioMEMS) — pivotal RCT for pulmonary artery pressure monitoring',
    'ESC/ESH Heart Failure Guidelines 2021 — remote monitoring recommendations',
    'NICE NG106 — Chronic heart failure in adults: diagnosis and management',
    'NHS England heart failure optimisation service framework',
    'Implantable haemodynamic monitors: evidence for hospitalisation reduction',
    'LVEF and BNP/NT-proBNP as linked biomarkers for heart failure management',
  ],

  // Vertebral fragility fractures AI (HTG760)
  'vertebral fragility fractures': [
    'NICE HTG760 — AI technologies for opportunistic detection of vertebral fragility fractures',
    'NICE NG188 — Osteoporosis: assessing the risk of fragility fracture',
    'NICE TA464 — Bisphosphonates for treating osteoporosis',
    'Royal Osteoporosis Society (ROS) clinical guidance on vertebral fractures',
    'FRAX® (fracture risk assessment tool) as standard risk stratification model',
    'NHS fracture liaison services (FLS) — clinical effectiveness evidence',
    'Opportunistic osteoporosis detection on routine CT imaging — systematic review',
    'DXA and VFA (vertebral fracture assessment) as primary imaging tools',
  ],

  'fragility fractures': [
    'NICE NG188 — Osteoporosis: assessing the risk of fragility fracture',
    'Royal Osteoporosis Society (ROS) clinical guidance on vertebral fractures',
    'FRAX® (fracture risk assessment tool) as standard risk stratification model',
    'NHS fracture liaison services (FLS) — clinical effectiveness evidence',
    'DXA scanning and vertebral fracture assessment (VFA) evidence',
    'Bisphosphonates, denosumab, romosozumab as linked pharmacological interventions',
  ],

  // Tourette syndrome / chronic tic disorders (HTG748)
  'tourette': [
    'NICE HTG748 — Digital therapy for chronic tic disorders and Tourette syndrome',
    'NICE NG23 — Challenging behaviour and learning disabilities (related tic context)',
    'European clinical guidelines for Tourette syndrome and chronic tic disorders (2011)',
    'Comprehensive Behavioural Intervention for Tics (CBIT) — RCT evidence base',
    'Habit Reversal Training (HRT) and Exposure Response Prevention (ERP) evidence',
    'Tourettes Action — UK charity standards and patient pathway mapping',
    'CAMHS and adult neurodevelopmental service capacity as linked pathway issue',
    'Tiapride, clonidine and aripiprazole as linked pharmacological evidence',
  ],

  'tic disorders': [
    'NICE HTG748 — Digital therapy for chronic tic disorders and Tourette syndrome',
    'European clinical guidelines for Tourette syndrome and chronic tic disorders (2011)',
    'Comprehensive Behavioural Intervention for Tics (CBIT) — RCT evidence base',
    'Habit Reversal Training (HRT) and Exposure Response Prevention (ERP) evidence',
    'Tourettes Action — UK charity standards and patient pathway mapping',
    'CAMHS and adult neurodevelopmental service capacity as linked pathway issue',
  ],

  // Skin cancer AI triage (HTG746)
  'skin cancer': [
    'NICE HTG746 — AI technologies for assessing and triaging skin lesions on urgent cancer pathway',
    'NICE NG12 — Suspected cancer: recognition and referral (2-week-wait criteria)',
    'NICE NG14 — Melanoma: assessment and management',
    'British Association of Dermatologists (BAD) — skin cancer clinical guidance and standards',
    'NHS Faster Diagnosis Standard (FDS) — 28-day pathway for suspected cancer',
    'Teledermatology clinical evidence: sensitivity and specificity vs. in-person triage',
    'Dermoscopy and AI augmented diagnosis systematic reviews (JAMA Dermatology evidence)',
    'NHS Long Term Plan — diagnostic capacity and cancer waiting time recovery',
  ],

  'skin lesions': [
    'NICE HTG746 — AI technologies for assessing and triaging skin lesions on urgent cancer pathway',
    'NICE NG12 — Suspected cancer: recognition and referral',
    'British Association of Dermatologists (BAD) — clinical guidance and teledermatology standards',
    'Dermoscopy and AI diagnosis — systematic review evidence',
    'NHS 2-week wait (2WW) skin cancer referral pathway data',
  ],

  // Fracture detection on X-ray (HTG739)
  'fracture detection': [
    'NICE HTG739 — AI technologies to help detect fractures on X-rays in urgent care',
    'NICE NG38 — Fractures (complex): assessment and management',
    'NICE NG91 — Fractures (non-complex): assessment and management',
    'Royal College of Radiologists (RCR) — AI in radiology: standards and guidance',
    'NHS AI Lab Skunkworks fracture detection validation work',
    'Emergency department (ED) missed fracture rates — patient safety literature',
    'Radiographer-reported plain film X-ray — workforce and skill-mix evidence',
    'NHS England diagnostic imaging dataset (DIDS) as baseline data source',
  ],

  // GaitSmart gait and mobility (HTG716)
  'gait': [
    'NICE HTG716 — GaitSmart rehabilitation exercise programme for gait and mobility issues',
    'NICE NG56 — Multimorbidity: clinical assessment and management (frailty link)',
    'NICE NG56 — Falls in older people: assessing risk and prevention',
    'NHS England falls prevention and frailty framework',
    'Timed Up and Go (TUG) and 4-metre gait speed as validated functional measures',
    'Hip and knee replacement rehabilitation evidence — post-operative recovery programmes',
    'Sensor-based gait analysis technologies: clinical validation systematic review',
    'NICE NG191 — Hip fracture: management (post-surgical mobility evidence)',
  ],

  'gait and mobility': [
    'NICE HTG716 — GaitSmart rehabilitation exercise programme for gait and mobility issues',
    'NICE guidelines on falls prevention (NG56) and frailty assessment',
    'Timed Up and Go (TUG) and 4-metre gait speed as validated functional measures',
    'Hip and knee replacement post-operative rehabilitation evidence',
    'Sensor-based gait analysis technologies: clinical validation systematic review',
    'NHS England falls prevention and frailty framework',
  ],

  // Psychosis digital health (HTG713)
  'psychosis': [
    'NICE HTG713 — Digital health technologies to help manage psychosis symptoms and prevent relapse',
    'NICE NG185 — Schizophrenia (including related psychoses): recognition, diagnosis and management (checking latest ref)',
    'NICE CG178 — Psychosis and schizophrenia in adults: prevention and management',
    'NHS England Mental Health Implementation Plan — early intervention in psychosis (EIP) standards',
    'EIP waiting time standard: 2-week access to NICE-concordant treatment',
    'Cognitive behavioural therapy for psychosis (CBTp) — NICE-recommended intervention evidence',
    'Family intervention therapy (FIT) and clozapine as linked interventions',
    'Early Intervention in Psychosis (EIP) national audit — NHS England benchmarking',
    'Relapse prevention and prodrome monitoring digital tools evidence',
  ],

  // Low back pain (HTG712)
  'low back pain': [
    'NICE HTG712 — Digital technologies for managing non-specific low back pain',
    'NICE NG226 — Low back pain and sciatica in over 16s: assessment and management',
    'NICE quality standard QS155 — Low back pain and sciatica',
    'Getting Better Backs (GBB) pathway and direct access physiotherapy evidence',
    'NHS England MSK FCP (First Contact Practitioner) programme evaluation',
    'CBT and pain management programmes for chronic low back pain — systematic review',
    'The Keele STarT Back Screening Tool as validated risk stratification tool',
    'Exercise therapy and active rehabilitation as primary evidence-based interventions',
    'Opioid deprescribing and non-pharmacological management evidence (NICE guidance)',
  ],

  // AI stroke decision support (HTG708)
  'cryptogenic stroke': [
    'NICE HTG708 — AI-derived software for clinical decision making in stroke',
    'NICE HTG553 — Implantable cardiac monitors to detect AF after cryptogenic stroke',
    'Paroxysmal atrial fibrillation detection after cryptogenic stroke evidence',
    'EMBRACE and CRYSTAL AF trial evidence for long-term cardiac monitoring post-stroke',
    'Insertable cardiac monitors (ICMs) vs. conventional monitoring — Cochrane evidence',
    'NHS England integrated stroke delivery networks (ISDNs)',
  ],

  // VR for agoraphobia (HTG701)
  'agoraphobia': [
    'NICE HTG701 — Virtual reality technologies for treating agoraphobia',
    'NICE CG113 — Generalised anxiety disorder and panic disorder in adults',
    'Exposure therapy for agoraphobia and panic disorder — systematic review evidence',
    'Oxford VR clinical trial evidence (gameChange VR) — LANCET study',
    'NICE Evidence Standards Framework for DHTs — highest evidence threshold (tier 4)',
    'CBT with in vivo exposure as first-line NICE-recommended intervention',
    'Virtual reality graded exposure therapy (VRGET) systematic review',
    'NHS Talking Therapies (IAPT) capacity and waiting time data — linked referral pathway',
  ],

  'virtual reality': [
    'NICE HTG701 — Virtual reality technologies for treating agoraphobia',
    'Oxford VR clinical trial evidence (gameChange VR) — LANCET study',
    'Virtual reality graded exposure therapy (VRGET) systematic review',
    'NICE Evidence Standards Framework for DHTs — highest evidence threshold (tier 4)',
    'CBT with in vivo exposure as first-line NICE-recommended intervention',
  ],

  // Lung cancer chest X-ray AI (HTG696)
  'lung cancer': [
    'NICE HTG696 — AI software to analyse chest X-rays for suspected lung cancer in primary care',
    'NICE NG122 — Lung cancer: diagnosis and management',
    'NHS England targeted lung health checks (TLHCs) programme evaluation',
    'NICE DG11 — Targeted lung health checks for people at high risk',
    'Low-dose CT (LDCT) screening evidence — NELSON, NLST trial data',
    'NHS Long Term Plan cancer diagnostics — 28-day faster diagnosis standard (FDS)',
    'Radiologist AI augmentation for chest X-ray review: systematic review evidence',
    'AI CAD chest X-ray sensitivity and specificity benchmarking studies',
  ],

  // QT interval monitoring during antipsychotic treatment (HTG694)
  'qt interval': [
    'NICE HTG694 — KardiaMobile 6L for measuring cardiac QT interval during antipsychotic medication',
    'Medicines and Healthcare products Regulatory Agency (MHRA) guidance on QT prolongation risk',
    'NHS mental health prescribing and physical health monitoring standards',
    'Antipsychotic-induced QTc prolongation: systematic review and risk stratification',
    'NICE NG10 — Psychosis with coexisting substance misuse: assessment and management',
    'Clozapine mandatory monitoring requirements (CPMS) — physical health link',
    'ECG monitoring for at-risk drug combinations — Maudsley Prescribing Guidelines',
    'Point-of-care ECG reliability: validation studies for KardiaMobile devices',
  ],

  'qt monitoring': [
    'NICE HTG694 — KardiaMobile 6L for measuring cardiac QT interval during antipsychotic medication',
    'MHRA guidance on QT prolongation drug-drug interactions',
    'Antipsychotic-induced QTc prolongation risk stratification evidence',
    'NHS mental health physical health monitoring standards',
    'Point-of-care ECG reliability: KardiaMobile validation studies',
  ],

  // Lung nodule CAD (HTG687)
  'lung nodules': [
    'NICE HTG687 — AI CAD software for detecting and measuring lung nodules in CT scan images',
    'British Thoracic Society (BTS) guidelines for pulmonary nodule management (2015)',
    'Fleischner Society guidelines for incidental pulmonary nodules',
    'NHS England targeted lung health check (TLHC) programme evaluation',
    'NICE NG122 — Lung cancer: diagnosis and management',
    'AI CAD for lung nodule detection: sensitivity/specificity systematic review evidence',
    'CT volumetry as standard nodule measurement method — clinical evidence',
    'Radiologist workflow and AI-assisted reporting: productivity studies',
  ],

  // Radiotherapy data management (HTG664)
  'radiotherapy': [
    'NICE HTG664 — ProKnow cloud-based system for radiotherapy data storage and management',
    'Royal College of Radiologists (RCR) — Radiotherapy clinical oncology guidance',
    'NHS England radiotherapy transformation programme (SACT/RT)',
    'NHSEI Radiotherapy Innovation Fund — digital infrastructure priorities',
    'DICOM RT standards and interoperability requirements in radiotherapy',
    'NHS Long Term Plan radiotherapy access and modernisation commitments',
    'EMBRACE and RADAR RT quality assurance protocols — linked academic evidence',
    'NHS England COSD (cancer outcomes and services dataset) radiotherapy data',
  ],

  // Coronary stenosis FFR (HTG571)
  'coronary stenosis': [
    'NICE HTG571 — QAngio XA 3D QFR and CAAS vFFR for assessing coronary stenosis',
    'NICE TA105 — Coronary artery stents: NICE technology appraisals',
    'NICE NG185 — Chest pain of recent onset: assessment and diagnosis',
    'Fractional flow reserve (FFR) evidence: FAME and FAME 2 trials',
    'QFR (quantitative flow ratio) validation vs. wire-based FFR: WIFI II trial evidence',
    'ESC guidelines on chronic coronary syndromes (2019)',
    'British Cardiovascular Intervention Society (BCIS) PCI audit data',
    'NHS cardiac catheter laboratory capacity and diagnostic angiography data',
  ],

  'coronary artery disease': [
    'NICE NG185 — Chest pain of recent onset: assessment and diagnosis',
    'NICE HTG429 — HeartFlow FFRCT for estimating fractional flow reserve from coronary CT',
    'ESC guidelines on chronic coronary syndromes (2019)',
    'Fractional flow reserve (FFR) evidence: FAME and FAME 2 trials',
    'CT coronary angiography (CTCA) as first-line diagnostic test — NICE evidence',
    'Percutaneous coronary intervention (PCI) vs. optimal medical therapy trial evidence',
  ],

  // Cardiac arrhythmias (HTG562)
  'cardiac arrhythmias': [
    'NICE HTG562 — Zio XT for detecting cardiac arrhythmias',
    'NICE CG180 — Atrial fibrillation: management',
    'British Heart Rhythm Society (BHRS) — arrhythmia monitoring guidance',
    'Extended ambulatory ECG monitoring: systematic review of diagnostic yield',
    'Zio XT MCOT patch vs. conventional Holter monitoring: comparative evidence',
    'AF, SVT, ventricular ectopy, heart block as linked arrhythmia types',
    'NICE TA197 — Implantable cardioverter defibrillators (ICDs) and resynchronisation therapy',
    'NHS cardiac physiology workforce and ambulatory ECG capacity data',
  ],

  // Chest drain management (HTG465)
  'chest drain': [
    'NICE HTG465 — Thopaz+ portable digital system for managing chest drains',
    'BTS pleural disease guideline (2010, updated) — chest drain insertion and management',
    'BTS/SIGN spontaneous pneumothorax management guideline',
    'Pleural effusion aetiology and management — BTS guideline',
    'Digital vs. water-seal chest drain systems: meta-analysis evidence',
    'NHS thoracic surgery volume and outcome benchmarking — SCTS data',
    'Safety incidents related to chest drain management — NPSA alerts',
    'Air leak measurement and pleurodesis as linked clinical decisions',
  ],

  // HeartFlow FFRCT (HTG429)
  'ffrct': [
    'NICE HTG429 — HeartFlow FFRCT for estimating fractional flow reserve from coronary CT angiography',
    'PLATFORM trial — HeartFlow FFRCT vs. standard invasive angiography pathway',
    'NXT trial — diagnostic accuracy of FFRCT vs. wire-based FFR',
    'NICE NG185 — Chest pain of recent onset: assessment and diagnosis',
    'CT coronary angiography (CTCA) as first-line investigation — NICE guidance',
    'ESC guidelines on chronic coronary syndromes (2019)',
    'NHS cardiac pathway redesign — reducing unnecessary invasive angiography evidence',
    'British Cardiovascular Intervention Society (BCIS) and BCIS PCI audit data',
  ],

  'coronary ct angiography': [
    'NICE HTG429 — HeartFlow FFRCT for estimating fractional flow reserve from coronary CT angiography',
    'NICE NG185 — Chest pain of recent onset: assessment and diagnosis',
    'PLATFORM trial — HeartFlow FFRCT vs. standard invasive angiography pathway',
    'CT coronary angiography (CTCA) as first-line investigation — NICE evidence base',
    'ESC chronic coronary syndromes guidelines (2019)',
  ],

  // Fracture AI (HTG739) — 'fractures' is a common substring
  'fractures': [
    'NICE HTG739 — AI technologies to help detect fractures on X-rays in urgent care',
    'NICE NG38 — Fractures (complex): assessment and management',
    'NICE NG91 — Fractures (non-complex): assessment and management',
    'Royal College of Radiologists (RCR) — AI in radiology: standards and guidance',
    'Emergency department missed fracture rates — patient safety literature',
    'Radiographer-reported plain film X-ray — workforce and skill-mix evidence',
    'NHS AI Lab Skunkworks fracture detection validation work',
  ],

  // Cardiac implantable electronic devices / remote HF monitoring (HTG730)
  'cardiac implantable electronic devices': [
    'NICE HTG730 — Heart failure algorithms for remote monitoring in people with CIEDs',
    'NICE NG106 — Chronic heart failure in adults: diagnosis and management',
    'ESC Heart Failure Guidelines (2021) — remote monitoring recommendations',
    'OptiLink HF, IN-TIME and MORE-CARE trials on CRT and ICD remote monitoring',
    'NHS England heart failure optimisation and virtual follow-up pathway evidence',
    'BHRS and BHRS standards for cardiac device clinic and remote follow-up',
    'Pacemaker, CRT, ICD and ILR as linked device types',
  ],

  // Acute respiratory infections virtual ward (HTG697)
  'acute respiratory infections': [
    'NICE HTG697 — Virtual ward platform technologies for acute respiratory infections',
    'NHS England virtual ward operational framework (2022)',
    'NICE COVID-19 rapid guideline: managing COVID-19 (NG191)',
    'NHSEI Pulse Oximetry at Home evaluation (COVID-19 remote monitoring evidence)',
    'BTS guideline on community-acquired pneumonia management',
    'NEWS2 score as linked deterioration risk tool in remote monitoring pathways',
    'Hospital at Home Cochrane systematic review (Caplan et al.)',
    'Acute respiratory infection admissions avoidance — NHS provider data',
  ],
}

/**
 * Returns an array of related evidence terms for a given pathway/condition name.
 * Substring matching: finds all map keys contained within the pathway string,
 * longest-key-first to prioritise more specific matches, then deduplicates.
 * Returns empty array if no mapping found.
 */
export function getLinkedEvidence(pathway) {
  if (!pathway) return []
  const normalized = pathway.trim().toLowerCase()
  const seen = new Set()
  const results = []

  const keys = Object.keys(LINKED_EVIDENCE_MAP).sort((a, b) => b.length - a.length)

  for (const key of keys) {
    if (normalized.includes(key)) {
      for (const item of LINKED_EVIDENCE_MAP[key]) {
        if (!seen.has(item)) {
          seen.add(item)
          results.push(item)
        }
      }
    }
  }

  return results
}
