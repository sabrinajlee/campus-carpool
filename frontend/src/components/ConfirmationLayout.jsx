import { Car, Check, X } from "lucide-react";

const ICONS = { check: Check, cancel: X, car: Car, error: X };

// Full-screen confirmation: icon circle, title, subtitle, optional card, buttons pinned to the bottom.
// Use it on pages without the bottom nav, inside <div className="app-shell">.
//
// <ConfirmationLayout
//   icon="check"
//   title="Request sent!"
//   subtitle="Alex will review your request to join the ride to Toronto."
//   actions={<>
//     <Button fullWidth onClick={...}>My trips</Button>
//     <Button variant="secondary" fullWidth onClick={...}>Back to explore</Button>
//   </>}
// >
//   <TripSummaryCard ... />
// </ConfirmationLayout>
//
// icon: "check" | "cancel" | "car" (indigo circle) | "error" (red circle)
export default function ConfirmationLayout({ icon = "check", title, subtitle, children, actions }) {
  const Icon = ICONS[icon] ?? Check;

  return (
    <main className="confirmation">
      <div className="confirmation__body">
        <span className={`confirmation__icon${icon === "error" ? " confirmation__icon--error" : ""}`} aria-hidden="true">
          <Icon size={36} strokeWidth={2.5} />
        </span>
        <h1 className="confirmation__title">{title}</h1>
        {subtitle && <p className="confirmation__subtitle">{subtitle}</p>}
        {children && <div className="confirmation__card">{children}</div>}
      </div>
      {actions && <div className="confirmation__actions">{actions}</div>}
    </main>
  );
}
