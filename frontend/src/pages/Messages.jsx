import { Button, Card, PageHeader, StatusBadge, TextInput } from "../components";
import "./Messages.css";

// COMPONENT PREVIEW (temporary)
// Messages (P34) is a later feature, so this tab shows every shared component
// and its states instead. Add each new shared component here in the same PR
// that creates it. Replace this file when Messages is actually built.

// Components we plan to build, so nobody makes their own version in a page.
const PLANNED = [
  "NumberStepper (built on feature/post-ride-page1, shows here once merged)",
  "Avatar",
  "DateChip",
  "RouteTimeline",
  "Alert",
  "PersonRow",
  "RouteHeader",
  "PriceBanner",
  "VehicleCard",
  "TripSummaryCard",
  "ConfirmationLayout",
];

function Section({ title, note, children }) {
  return (
    <section className="messages-section">
      <h2 className="messages-section-title">{title}</h2>
      {note && <p className="messages-section-note">{note}</p>}
      {children}
    </section>
  );
}

// One example with the code that produces it underneath.
function Example({ code, children }) {
  return (
    <div className="messages-item">
      {children}
      <code className="messages-code">{code}</code>
    </div>
  );
}

const BADGES = [
  { props: { status: "pending", count: 2 }, code: 'status="pending" count={2}' },
  { props: { status: "pending", count: 1 }, code: 'status="pending" count={1}' },
  { props: { status: "pending", label: "Request pending" }, code: 'status="pending" label="Request pending"' },
  { props: { status: "accepted" }, code: 'status="accepted"' },
  { props: { status: "declined" }, code: 'status="declined"' },
  { props: { status: "cancelled" }, code: 'status="cancelled"' },
  { props: { status: "completed" }, code: 'status="completed"' },
  { props: { status: "requests", count: 1 }, code: 'status="requests" count={1}' },
  { props: { status: "requests", count: 3 }, code: 'status="requests" count={3}' },
  { props: { status: "full" }, code: 'status="full"' },
  { props: { status: "seats", count: 2 }, code: 'status="seats" count={2}' },
];

export default function Messages() {
  return (
    <main className="page">
      <PageHeader title="Component preview" subtitle="Shared components and their states." />

      <div className="messages-notice" role="note">
        <p className="messages-notice-title">This is not the Messages page.</p>
        <p className="messages-notice-text">
          Messages is a later feature, so this tab is a temporary developer preview of every shared
          component in <code>src/components</code>. Use these in pages instead of building your own. It
          will be replaced when Messages is built.
        </p>
      </div>

      <Section title="Button" note="variant: primary (default), secondary, danger, success">
        <div className="messages-stack">
          <Example code="<Button>">
            <Button>Request a seat</Button>
          </Example>
          <Example code='variant="secondary"'>
            <Button variant="secondary">Back to explore</Button>
          </Example>
          <Example code='variant="danger"'>
            <Button variant="danger">Cancel ride</Button>
          </Example>
          <Example code='variant="success"'>
            <Button variant="success">Completed!</Button>
          </Example>
          <Example code="disabled">
            <Button disabled>Post ride</Button>
          </Example>
          <Example code="fullWidth">
            <Button fullWidth>My trips</Button>
          </Example>
        </div>
      </Section>

      <Section title="StatusBadge" note="Labels and colours come from the status, never from the page.">
        <div className="messages-stack">
          {BADGES.map(({ props, code }) => (
            <Example key={code} code={code}>
              <StatusBadge {...props} />
            </Example>
          ))}
        </div>
      </Section>

      <Section title="TextInput" note="label, placeholder, error, multiline, plus any normal input prop">
        <TextInput label="Leaving from" placeholder="London, ON" />
        <TextInput label="Going to" defaultValue="London, ON" error="Destination must be different from where you're leaving." />
        <TextInput label="Departure time" type="time" defaultValue="16:30" />
        <TextInput label="UWO email" defaultValue="jappleseed84@uwo.ca" readOnly />
        <TextInput label="Other trip details" placeholder="luggage space, flexibility, stops..." multiline />
      </Section>

      <Section title="Card" note="soft: light purple, for summaries and price panels">
        <div className="messages-stack">
          <Example code="<Card>">
            <Card>Plain card</Card>
          </Example>
          <Example code="<Card soft>">
            <Card soft>Soft card</Card>
          </Example>
        </div>
      </Section>

      <Section title="PageHeader" note="title, subtitle, showBack">
        <div className="messages-stack messages-frame">
          <PageHeader title="My trips" subtitle="Keep track of rides you request or offer." />
          <PageHeader title="Ride details" showBack />
        </div>
      </Section>

      <Section title="BottomNav" note="Shown at the bottom of this page. Pages inside AppLayout get it automatically." />

      <Section title="Planned (not built yet)" note="Don't build these inside a page. They're coming as shared components.">
        <ul className="messages-list">
          {PLANNED.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
