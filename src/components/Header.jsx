export default function Header({ onSignOut }) {
  return (
    <>
      <div className="rfw-service-header">
        <div className="rfw-service-header__inner">
          <span className="rfw-service-header__name">NHS Condition Readiness Framework (CRF)</span>
          <button className="rfw-service-header__signout" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </div>
      <div className="govuk-phase-banner">
        <div className="govuk-phase-banner__inner">
          <span className="govuk-tag govuk-tag--blue">Prototype</span>
          <span className="govuk-phase-banner__text">
            This is a prototype tool. Do not use for live commissioning decisions.
          </span>
        </div>
      </div>
    </>
  )
}
