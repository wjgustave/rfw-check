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
      setTimeout(() => setShaking(false), 400)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#003087', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>

      {/* Card */}
      <div
        style={{
          background: '#FFFFFF',
          width: '100%',
          maxWidth: '500px',
          padding: '40px',
          animation: shaking ? 'govuk-shake 0.4s ease' : undefined
        }}
      >
        {/* NHS branding */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div style={{
              background: '#005EB8',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '1.5rem',
              fontStyle: 'italic',
              padding: '2px 10px',
              letterSpacing: '-0.02em'
            }}>
              NHS
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#003087' }}>
              Readiness Framework
            </span>
          </div>
          <span className="govuk-tag govuk-tag--blue">Prototype</span>
        </div>

        <h1 className="govuk-heading-l" style={{ marginBottom: '5px' }}>Sign in</h1>
        <p className="govuk-hint" style={{ marginBottom: '25px', fontSize: '1rem' }}>
          Enter your password to access this tool.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <div style={{
              borderLeft: '5px solid #d4351c',
              padding: '10px 15px',
              marginBottom: '20px',
              background: '#fff'
            }}>
              <p style={{ color: '#d4351c', fontWeight: 700, margin: 0, fontSize: '1rem' }}>
                There is a problem
              </p>
              <p style={{ color: '#d4351c', margin: '5px 0 0', fontSize: '1rem' }}>
                Incorrect password — please try again
              </p>
            </div>
          )}

          <div className="govuk-form-group" style={{ marginBottom: '25px' }}>
            <label className="govuk-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                className={`govuk-input${error ? ' govuk-input--error' : ''}`}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(false) }}
                autoFocus
                style={{ paddingRight: '50px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                tabIndex={-1}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#505A5F',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  fontWeight: 700
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button type="submit" className="govuk-button govuk-button--nhs" style={{ width: '100%', textAlign: 'center' }}>
            Sign in
          </button>
        </form>
      </div>

      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', marginTop: '20px', textAlign: 'center' }}>
        Prototype based on publicly available information as of May 2026.
      </p>

      <style>{`
        @keyframes govuk-shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-5px); }
          80%       { transform: translateX(5px); }
        }
      `}</style>
    </div>
  )
}
