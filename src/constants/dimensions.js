export const DIMENSIONS = [
  {
    id: 'd1',
    check: 'Is the intervention already delivered in the NHS?',
    evidenceSources: [
      'NHS England service specifications',
      'Trust/ICB service directories',
      'GIRFT specialty level report and standardised pathway',
      'National audits confirming routine delivery (e.g. NACR for CR)'
    ],
    criteria: {
      low: 'No current NHS delivery; exists only in research or pilot settings',
      medium: 'Delivered in some NHS settings but not systematically commissioned',
      high: 'Routinely commissioned and delivered; national service specification exists'
    }
  },
  {
    id: 'd2',
    check: 'Is the service widely available nationally?',
    evidenceSources: [
      'National Audit coverage reports (participating providers, referral rates)',
      'NHS Atlas of Variation',
      'ICB commissioning coverage statements'
    ],
    criteria: {
      low: 'Available in fewer than a third of ICBs or highly geographically concentrated',
      medium: 'Available in many but not all ICBs; notable gaps in access exist regionally',
      high: 'Available across all or nearly all ICBs; national access targets in place'
    }
  },
  {
    id: 'd3',
    check: 'Is it recognised in clinical guidelines?',
    evidenceSources: [
      'NICE clinical guidelines (CG / NG)',
      'SIGN / NICE shared guideline endorsements',
      'Royal College / specialty society position statements'
    ],
    criteria: {
      low: 'No NICE or equivalent national guideline; evidence base limited or contested',
      medium: 'Referenced in guidelines as emerging or conditional recommendation',
      high: 'Explicitly recommended in NICE guidelines (CG/NG); Royal College endorsed'
    }
  },
  {
    id: 'd4',
    check: 'Are outcome metrics well defined?',
    evidenceSources: [
      'National audit datasets (e.g. NACR, NCAPOP)',
      'Quality indicators used in commissioning',
      'Inclusion in Model Hospital metrics'
    ],
    criteria: {
      low: 'No standardised outcome metrics in routine use; ad hoc or research-only',
      medium: 'Some metrics defined but not collected consistently or nationally',
      high: 'Nationally standardised metrics in routine use; published via national audit'
    }
  },
  {
    id: 'd5',
    check: 'Is there evidence around channel shift?',
    evidenceSources: [
      'Evaluations of remote vs in-person models (programme evaluations, not just trials)',
      'NHS England digital transformation case studies',
      'Cost-effectiveness analyses showing productivity / access gains'
    ],
    criteria: {
      low: 'No evaluations of alternative delivery; face-to-face only, no digital equivalent',
      medium: 'Some remote/digital evaluations exist; cost-effectiveness at scale not established',
      high: 'Robust evidence digital delivery achieves equivalent outcomes at scale; formal spec exists'
    }
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
  high: {
    bg: '#EAF3DE',
    text: '#3B6D11',
    border: '#97C459',
    label: 'High'
  },
  medium: {
    bg: '#FAEEDA',
    text: '#854F0B',
    border: '#EF9F27',
    label: 'Medium'
  },
  low: {
    bg: '#FCEBEB',
    text: '#A32D2D',
    border: '#E24B4A',
    label: 'Low'
  }
}
