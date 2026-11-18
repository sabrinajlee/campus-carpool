import { formatPrice } from "../format.js";
import Card from "./Card.jsx";

// <PriceBanner price={ride.price_per_seat} seats={ride.seats_left} />
// price in dollars. seats: seats still available on the ride.
export default function PriceBanner({ price, seats }) {
  return (
    <Card soft className="price-banner">
      <div className="price-banner__text">
        <span className="price-banner__label">Price per seat</span>
        <span className="price-banner__seats">
          {seats} {seats === 1 ? "seat" : "seats"} available
        </span>
      </div>
      <span className="price-banner__price">{formatPrice(price)}</span>
    </Card>
  );
}
