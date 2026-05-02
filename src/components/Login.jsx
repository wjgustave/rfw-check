import { useState } from 'react'

const CORRECT_PASSWORD = 'get.ready'

export default function Login({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const [shaking, setShaking] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (password === CORRECT_PASSWORD) {
      sessionStorage.setItem('rfw_auth', '1')
      onSuccess()
    } else {
      setError(true)
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #003087 0%, #0072CE 100%)' }}>

      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-md px-10 py-10 ${shaking ? 'animate-shake' : ''}`}
        style={shaking ? { animation: 'shake 0.4s ease' } : {}}
      >
        {/* Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-black italic tracking-tight" style={{ color: '#003087' }}>
              NHS
            </span>
            <span className="text-xl font-semibold" style={{ color: '#003087' }}>
              Readiness Framework
            </span>
          </div>
          <span className="text-xs font-medium px-3 py-1 rounded-full border"
            style={{ background: '#F0F4F8', color: '#5C7A99', borderColor: '#D1DDE8' }}>
            Stage 1 · Service Maturity
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-semibold text-center text-gray-900 mb-1">Sign in</h1>
        <p className="text-sm text-center text-gray-400 mb-7">
          Enter your password to access the tool.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Password field */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(false) }}
                placeholder="Enter your password"
                autoFocus
                className={`w-full border rounded-lg px-4 py-2.5 pr-10 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  error ? 'border-red-400 bg-red-50' : 'border-gray-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7c1.04 0 2.04.17 2.97.48M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3l18 18" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {error && (
              <p className="mt-1.5 text-xs text-red-600">Incorrect password. Please try again.</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-colors"
            style={{ background: '#003087' }}
            onMouseEnter={e => e.currentTarget.style.background = '#002060'}
            onMouseLeave={e => e.currentTarget.style.background = '#003087'}
          >
            Sign in
          </button>
        </form>
      </div>

      <p className="mt-6 text-xs text-center" style={{ color: 'rgba(255,255,255,0.55)' }}>
        Prototype based on publicly available information as of May 2026.
      </p>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  )
}
