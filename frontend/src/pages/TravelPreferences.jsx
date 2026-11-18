import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Check, Lock, User } from "lucide-react";
import { Button, PageHeader } from "../components";
import "./TravelPreferences.css";

// Travel preferences: the first onboarding screen. App.jsx shows it at "/" (the landing
// page) while user.phone is null, instead of Explore.
// No data is loaded or saved. The backend has no rider or driver roles, so the
// choice only decides where Continue goes: Car details if "I can drive" is
// picked, otherwise straight to Basic information.

const OPTIONS = [
  { id: "ride", icon: User, title: "I need rides", text: "Browse and request seats." },
  { id: "drive", icon: Car, title: "I can drive", text: "Post trips and fill empty seats." },
];

// A checkable card. It's a toggle button, so screen readers announce "pressed".
function SelectableCard({ icon: Icon, title, text, selected, onToggle }) {
  return (
    <button
      type="button"
      className={`travel-prefs-card${selected ? " travel-prefs-card--selected" : ""}`}
      aria-pressed={selected}
      onClick={onToggle}
    >
      <span className="travel-prefs-card-top">
        <span className="travel-prefs-card-icon" aria-hidden="true">
          <Icon size={20} />
        </span>
        <span className="travel-prefs-check" aria-hidden="true">
          {selected && <Check size={14} strokeWidth={3} />}
        </span>
      </span>
      <span className="travel-prefs-card-title">{title}</span>
      <span className="travel-prefs-card-text">{text}</span>
    </button>
  );
}

export default function TravelPreferences() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState({ ride: false, drive: false });

  const canContinue = selected.ride || selected.drive;

  function toggle(id) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleContinue() {
    navigate(selected.drive ? "/profile/vehicle" : "/profile/basic-info");
  }

  return (
    <div className="app-shell">
      <main className="page travel-prefs-page">
        <div className="travel-prefs-body">
          <PageHeader title="How do you want to get around?" subtitle="Choose one or both." />

          <div className="travel-prefs-options">
            {OPTIONS.map((option) => (
              <SelectableCard
                key={option.id}
                icon={option.icon}
                title={option.title}
                text={option.text}
                selected={selected[option.id]}
                onToggle={() => toggle(option.id)}
              />
            ))}
          </div>

          <div className="travel-prefs-note">
            <p className="travel-prefs-note-title">
              <Lock size={12} aria-hidden="true" />
              You can change this later
            </p>
            <p className="travel-prefs-note-text">
              Drivers add their car details - hidden until you accept a rider&apos;s request.
            </p>
          </div>
        </div>

        <div className="travel-prefs-actions">
          <Button fullWidth disabled={!canContinue} onClick={handleContinue}>
            Continue
          </Button>
        </div>
      </main>
    </div>
  );
}
