export default function Header({ onSignOut }) {
  return (
    <header className="mb-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold tracking-widest uppercase text-gray-400">
              NHS · Readiness Framework
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Readiness Framework</h1>
          <p className="mt-1 text-gray-500">
            Assess NHS pathway readiness across all six stages of maturity
          </p>
        </div>
        <button
          onClick={onSignOut}
          className="mt-1 text-xs text-gray-400 hover:text-gray-600 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors shrink-0"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
