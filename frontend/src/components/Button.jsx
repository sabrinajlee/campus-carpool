// <Button>Post ride</Button>
// <Button variant="secondary" fullWidth onClick={...}>Back to explore</Button>
export default function Button({
  variant = "primary",
  fullWidth = false,
  type = "button",
  className = "",
  children,
  ...props
}) {
  const classes = ["btn", `btn--${variant}`, fullWidth ? "btn--full" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
