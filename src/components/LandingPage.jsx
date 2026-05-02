import PathwayInput from './PathwayInput'
import ScoringGuide from './ScoringGuide'

export default function LandingPage({ onAssess, loading }) {
  return (
    <div>
      <div className="mb-8">
        <p className="text-gray-600 leading-relaxed max-w-2xl">
          The NHS Readiness Framework evaluates clinical pathways and conditions across six stages of maturity —
          from service establishment and national evidence through to supplier market health, programme advocacy,
          commissioning standards, and strategic priority alignment.
        </p>
      </div>
      <PathwayInput onAssess={onAssess} loading={loading} />
      <ScoringGuide />
    </div>
  )
}
