import PathwayInput from './PathwayInput'
import ScoringGuide from './ScoringGuide'

export default function LandingPage({ onAssess, loading }) {
  return (
    <div>
      <h1 className="govuk-heading-xl" style={{ marginBottom: '10px' }}>
        Condition Readiness Framework (CRF)
      </h1>
      <p className="govuk-body-l" style={{ color: '#505A5F', marginBottom: '30px' }}>
        Assess NHS pathway readiness across six stages of maturity — from service establishment
        and national evidence through to supplier market health, programme advocacy,
        commissioning standards, and strategic priority alignment.
      </p>

      <hr className="rfw-divider" />

      <PathwayInput onAssess={onAssess} loading={loading} />

      <hr className="rfw-divider" />

      <ScoringGuide />
    </div>
  )
}
