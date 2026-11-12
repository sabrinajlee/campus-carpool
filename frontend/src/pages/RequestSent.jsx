import { PageHeader } from "../components";

// Owner: TBD — see docs/frontend.md
export default function RequestSent() {
  return (
    <div className="app-shell">
      <main className="page">
        <PageHeader title="Request sent!" />
        <p className="todo">TODO: confirmation, trip summary with pending badge, My trips / Back to explore buttons (Figma: ride request)</p>
      </main>
    </div>
  );
}
