import { Car } from "lucide-react";
import Card from "./Card.jsx";

// <VehicleCard colour="Silver" make="Honda" model="Civic" seats={3} plate="CKRT 482" />
// Only show it to accepted riders (and the driver's own Car details preview).
export default function VehicleCard({ colour, make, model, seats, plate }) {
  return (
    <Card className="vehicle-card">
      <span className="vehicle-card__icon" aria-hidden="true">
        <Car size={18} />
      </span>
      <div className="vehicle-card__text">
        <span className="vehicle-card__name">{[colour, make, model].filter(Boolean).join(" ")}</span>
        <span className="vehicle-card__seats">
          {seats} {seats === 1 ? "seat" : "seats"} for riders
        </span>
      </div>
      {plate && <span className="vehicle-card__plate">{plate}</span>}
    </Card>
  );
}
