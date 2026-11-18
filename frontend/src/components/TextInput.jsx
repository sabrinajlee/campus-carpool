import { useId } from "react";

// <TextInput label="Leaving from" value={origin} onChange={(e) => setOrigin(e.target.value)} />
// <TextInput label="Other trip details" multiline />
// <TextInput label="Full name" helper="You cannot change this later!" />
// <TextInput label="UWO email" value={user.email} readOnly />   (greyed text, can't be edited)
// An error replaces the helper text while it's showing.
export default function TextInput({ label, helper, error, multiline = false, className = "", ...props }) {
  const id = useId();
  const Tag = multiline ? "textarea" : "input";
  const message = error || helper;

  return (
    <div className={`field ${className}`}>
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <Tag id={id} className="field__input" aria-describedby={message ? `${id}-message` : undefined} {...props} />
      {message && (
        <span id={`${id}-message`} className={error ? "field__error" : "field__helper"}>
          {message}
        </span>
      )}
    </div>
  );
}
