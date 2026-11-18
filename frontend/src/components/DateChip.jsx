import { formatShortDate } from "../format.js";

// <DateChip date={ride.depart_at} />   ("Fri, Nov 13")
export default function DateChip({ date }) {
  return <span className="date-chip">{formatShortDate(date)}</span>;
}
