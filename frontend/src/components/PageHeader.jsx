import { useNavigate } from "react-router-dom";

// <PageHeader title="My trips" subtitle="Keep track of rides you request or offer." />
// <PageHeader title="Ride details" showBack />
export default function PageHeader({ title, subtitle, showBack = false }) {
  const navigate = useNavigate();

  return (
    <header className="page-header">
      {showBack && (
        <button className="page-header__back" onClick={() => navigate(-1)} aria-label="Go back">
          ←
        </button>
      )}
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
    </header>
  );
}
