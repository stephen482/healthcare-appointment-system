import { Link } from 'react-router-dom'
import '../styles/Footer.css'

export default function Footer() {
  return (
    <footer className="ft">
      <div className="ft-inner">
        <div className="ft-brand">
          <Link to="/" className="ft-logo">
            <span>+</span> MediBook
          </Link>
          <p>Book trusted doctors in minutes. Educational project, fictional data only.</p>
        </div>

        <nav className="ft-col" aria-label="Explore">
          <h4>Explore</h4>
          <Link to="/doctors">Find doctors</Link>
          <Link to="/book">Book appointment</Link>
          <Link to="/appointments">My appointments</Link>
        </nav>

        <nav className="ft-col" aria-label="Company">
          <h4>Support</h4>
          <Link to="/contact">Contact support</Link>
          <Link to="/privacy">Privacy policy</Link>
          <Link to="/terms">Terms of service</Link>
        </nav>
      </div>

      <div className="ft-bottom">
        © {new Date().getFullYear()} MediBook Healthcare Systems. All rights reserved.
      </div>
    </footer>
  )
}
