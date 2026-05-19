import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/' },
  { label: 'Condition guidance list', to: '/condition-guidance' },
  { label: 'Completed assessments', to: '/completed-assessments' },
]

export default function ServiceNav() {
  return (
    <section className="rfw-service-nav" aria-label="Service navigation">
      <div className="rfw-service-nav__inner">
        <nav aria-label="Menu">
          <ul className="rfw-service-nav__list">
            {NAV_ITEMS.map(({ label, to }) => (
              <li key={to} className="rfw-service-nav__item">
                <NavLink
                  to={to}
                  end
                  className={({ isActive }) =>
                    'rfw-service-nav__link' + (isActive ? ' rfw-service-nav__link--active' : '')
                  }
                >
                  {({ isActive }) => isActive ? <strong>{label}</strong> : label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  )
}
