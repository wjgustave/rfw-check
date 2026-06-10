import { useState } from 'react'

const USERS = [
  { username: 'wayne.gustave01@nhs.net', password: 'crf2026' },
  { username: 'danielle.edwards10@nhs.net', password: 'crf2026' },
  { username: 'alicja.sherwin-nicholls1@nhs.net', password: 'crf2026' },
  { username: 'adele.mowat@nhs.net', password: 'crf2026' }
]

export default function Login({ onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const [shaking, setShaking] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const match = USERS.find(u => u.username === username.trim().toLowerCase() && u.password === password)
    if (match) {
      sessionStorage.setItem('rfw_auth', '1')
      sessionStorage.setItem('rfw_username', match.username)
      onSuccess()
    } else {
      setError(true)
      setShaking(true)
      setTimeout(() => setShaking(false), 400)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#003087', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#FFFFFF', width: '100%', maxWidth: '500px', padding: '40px', animation: shaking ? 'govuk-shake 0.4s ease' : undefined }}>
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div style={{ background: '#005EB8', color: '#FFFFFF', fontWeight: 700, fontSize: '1.5rem', fontStyle: 'italic', padding: '2px 10px', letterSpacing: '-0.02em' }}>
              NHS
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#003087' }}>
              Condition Readiness Framework
            </span>
          </div>
          <span className="govuk-tag govuk-tag--blue">Prototype</span>
        </div>

        <h1 className="govuk-heading-l" style={{ marginBottom: '5px' }}>Sign in</h1>
        <p className="govuk-hint" style={{ marginBottom: '25px', fontSize: '1rem' }}>
          Enter your NHS email and password to access this tool.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="govuk-error-summary" role="alert" aria-labelledby="login-error-title">
              <h2 className="govuk-error-summary__title" id="login-error-title">There is a problem</h2>
              <div className="govuk-error-summary__body">
                <ul className="govuk-error-summary__list">
                  <li><a href="#username">Enter a valid email address and password</a></li>
                </ul>
              </div>
            </div>
          )}

          <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`} style={{ marginBottom: '20px' }}>
            <label className="govuk-label" htmlFor="username">Email address</label>
            {error && (
              <p id="username-error" className="govuk-error-message">
                <span className="govuk-visually-hidden">Error:</span> Incorrect email address or password
              </p>
            )}
            <input
              id="username"
              className={`govuk-input${error ? ' govuk-input--error' : ''}`}
              aria-describedby={error ? 'username-error' : undefined}
              type="email"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(false) }}
              autoFocus
              autoComplete="username"
              spellCheck={false}
            />
          </div>

          <div className="govuk-form-group" style={{ marginBottom: '25px' }}>
            <label className="govuk-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                className={`govuk-input${error ? ' govuk-input--error' : ''}`}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(false) }}
                autoComplete="current-password"
                style={{ paddingRight: '50px' }}
              />
              <button type="button" onClick={() => setShowPassword(s => !s)} tabIndex={-1}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#505A5F', fontSize: '0.875rem', fontFamily: 'inherit', fontWeight: 700 }}>
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
