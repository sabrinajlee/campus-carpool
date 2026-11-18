// Avatar: initials in a soft circle (no photos in the MVP, spec 8.4).
//   <Avatar name="Alex Morgan" />            -> "AM", small, for rows and ride cards
//   <Avatar name="Jane Doe" size="lg" />     -> "JD", large, for My profile
//
// Shows the first letter of the first and last name ("AM"), as in the wireframes.
// One-word names show one letter ("Alex" -> "A"); an empty name shows "?".
// The full name is always shown next to the avatar, so it's hidden from screen readers.

function getInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0].charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}

export default function Avatar({ name = "", size = "sm" }) {
  return (
      <span className={`avatar avatar--${size}`} aria-hidden="true">
      {getInitials(name)}
    </span>
  );
}