import { PageHeader } from "../components";

// Owner: TBD — see docs/frontend.md
export default function PickupDropoff() {
  return (
    <main className="page">
      <PageHeader title="Pickup & drop-off" subtitle="Last step before your trip gets posted." showBack />
      <p className="todo">TODO: pickup, drop-off, other details, trip summary → Post ride (Figma: pickup + dropoff)</p>
    </main>
  );
}
