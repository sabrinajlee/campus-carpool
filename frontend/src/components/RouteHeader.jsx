import { MoveRight } from "lucide-react";
import { formatTime } from "../format.js";
import Card from "./Card.jsx";
import DateChip from "./DateChip.jsx";

// Top card on Ride details (rider's and driver's view).
//
// <RouteHeader
//   departAt={ride.depart_at}
//   origin={ride.origin} pickupPoint={ride.pickup_point}
//   destination={ride.destination} dropoffPoint={ride.dropoff_point}
//   seats={ride.seats_left}
//   badge={<StatusBadge status="pending" count={ride.seats_left} />}
// />
// seats: seats still available on the ride. badge is optional.
export default function RouteHeader({ departAt, origin, pickupPoint, destination, dropoffPoint, seats, badge }) {
  return (
    <Card className="route-header">
      <div className="route-header__top">
        <DateChip date={departAt} />
        {badge}
      </div>

      <div className="route-header__route">
        <div className="route-header__place">
          <span className="route-header__city">{origin}</span>
          {pickupPoint && <span className="route-header__point">{pickupPoint}</span>}
        </div>
        <MoveRight className="route-header__arrow" size={36} strokeWidth={1.25} aria-label="to" />
        <div className="route-header__place">
          <span className="route-header__city">{destination}</span>
          {dropoffPoint && <span className="route-header__point">{dropoffPoint}</span>}
        </div>
      </div>

      <div className="route-header__stats">
        <div className="route-header__stat">
          <span className="route-header__label">Departs</span>
          <span className="route-header__value">{formatTime(departAt)}</span>
        </div>
        <div className="route-header__stat">
          <span className="route-header__label">Seats available</span>
          <span className="route-header__value">
            {seats} {seats === 1 ? "seat" : "seats"}
          </span>
        </div>
      </div>
    </Card>
  );
}
