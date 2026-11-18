import { formatLongDate, formatTime } from "../format.js";
import Card from "./Card.jsx";

// Summary on the confirmation screens.
//
// <TripSummaryCard origin="London" destination="Toronto" departAt={ride.depart_at} />
// <TripSummaryCard ... badge={<StatusBadge status="pending" label="Request pending" />} note="You'll see updates under My trips." />
// badge and note are optional; either one adds the divider and footer.
export default function TripSummaryCard({ origin, destination, departAt, badge, note }) {
  return (
    <Card className="trip-summary">
      <p className="trip-summary__route">
        {origin} → {destination}
      </p>
      <p className="trip-summary__date">
        {formatLongDate(departAt)} · {formatTime(departAt)}
      </p>
      {(badge || note) && (
        <div className="trip-summary__footer">
          {badge}
          {note && <p className="trip-summary__note">{note}</p>}
        </div>
      )}
    </Card>
  );
}
