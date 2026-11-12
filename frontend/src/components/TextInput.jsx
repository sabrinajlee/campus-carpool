import { useId } from "react";

// <TextInput label="Leaving from" value={origin} onChange={(e) => setOrigin(e.target.value)} />
// <TextInput label="Other trip details" multiline />
export default function TextInput({ label, error, multiline = false, className = "", ...props }) {
  const id = useId();
  const Tag = multiline ? "textarea" : "input";

  return (
    <div className={`field ${className}`}>
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <Tag id={id} className="field__input" {...props} />
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}
