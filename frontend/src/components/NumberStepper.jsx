import { useId } from "react";
import { Minus, Plus } from "lucide-react";

// <NumberStepper label="Available seats" title="Passengers" value={seats} onChange={setSeats} min={1} max={7} />
// <NumberStepper title="Seats for riders" subtitle="Your default. Change it on any trip." ... />
// label: small uppercase field label above the box (optional)
// title / subtitle: text inside the box, left of the buttons
// onChange receives the new number, already kept between min and max
export default function NumberStepper({
  label,
  title,
  subtitle,
  value,
  onChange,
  min = 0,
  max = Infinity,
  decreaseLabel = "Decrease",
  increaseLabel = "Increase",
  className = "",
}) {
  const id = useId();
  const change = (delta) => onChange(Math.min(max, Math.max(min, value + delta)));

  return (
    <div className={`field ${className}`} role="group" aria-labelledby={label ? `${id}-label` : `${id}-title`}>
      {label && (
        <span className="field__label" id={`${id}-label`}>
          {label}
        </span>
      )}
      <div className="stepper">
        <div className="stepper__text">
          {title && (
            <span className="stepper__title" id={`${id}-title`}>
              {title}
            </span>
          )}
          {subtitle && <span className="stepper__subtitle">{subtitle}</span>}
        </div>
        <div className="stepper__controls">
          <button
            type="button"
            className="stepper__btn"
            onClick={() => change(-1)}
            disabled={value <= min}
            aria-label={decreaseLabel}
          >
            <Minus size={16} strokeWidth={2.5} />
          </button>
          <span className="stepper__value" aria-live="polite">
            {value}
          </span>
          <button
            type="button"
            className="stepper__btn"
            onClick={() => change(1)}
            disabled={value >= max}
            aria-label={increaseLabel}
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
