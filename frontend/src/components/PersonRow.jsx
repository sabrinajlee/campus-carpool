import Avatar from "./Avatar.jsx";
import Card from "./Card.jsx";

// A driver or rider: avatar, name, "Verified Western student".
//
// <PersonRow name="Alex Morgan" note="Contact info shared on acceptance" />
// <PersonRow name="Alex Morgan" contact="(647) 765-9872 or amorgan@uwo.ca" />
// <PersonRow name="Iris Lucky" action={<>...accept and decline buttons...</>} note="Contact info shared on acceptance" />
//
// action: anything shown on the right (the page builds its own buttons)
// note: grey footer line; contact: green footer line (only pass it once the request is accepted)
export default function PersonRow({ name, action, note, contact }) {
  const footer = contact || note;

  return (
    <Card className="person-row">
      <div className="person-row__main">
        <Avatar name={name} />
        <div className="person-row__text">
          <span className="person-row__name">{name}</span>
          <span className="person-row__verified">Verified Western student</span>
        </div>
        {action && <div className="person-row__action">{action}</div>}
      </div>
      {footer && (
        <p className={`person-row__footer${contact ? " person-row__footer--contact" : ""}`}>{footer}</p>
      )}
    </Card>
  );
}
