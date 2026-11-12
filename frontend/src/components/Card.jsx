// <Card>...</Card>  or  <Card soft>...</Card> (light purple, e.g. trip summary / price box)
export default function Card({ soft = false, className = "", children, ...props }) {
  return (
    <div className={`card ${soft ? "card--soft" : ""} ${className}`} {...props}>
      {children}
    </div>
  );
}
