// <Avatar name="Alex Morgan" />            (small: rows and ride cards)
// <Avatar name="Jane Doe" size="lg" />     (large: My profile)
// Shows the first letter of the name. The name itself is always shown next to it, so it's hidden from screen readers.
export default function Avatar({ name = "", size = "sm" }) {
  const letter = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span className={`avatar avatar--${size}`} aria-hidden="true">
      {letter}
    </span>
  );
}
