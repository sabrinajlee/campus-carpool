import { Button, Card, PageHeader, StatusBadge, TextInput } from "../components";

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

const styles = {
  notice: {
    marginBottom: "var(--space-5)",
    padding: "var(--space-4)",
    borderRadius: "var(--radius-md)",
    background: "var(--color-warning-bg)",
    color: "var(--color-warning-text)",
  },
  noticeTitle: { margin: "0 0 var(--space-1)", fontWeight: 700 },
  noticeText: { margin: 0, fontSize: 13 },
  section: { marginBottom: "var(--space-6)" },
  sectionTitle: { marginBottom: "var(--space-1)" },
  sectionNote: { margin: "0 0 var(--space-3)", fontSize: 12, color: "var(--color-text-muted)" },
  stack: { display: "flex", flexDirection: "column", gap: "var(--space-3)" },
  row: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2)" },
  item: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "var(--space-1)" },
  code: { fontFamily: "ui-monospace, Menlo, monospace", fontSize: 11, color: "var(--color-text-muted)" },
  frame: {
    padding: "var(--space-3)",
    border: "1px dashed var(--color-border)",
    borderRadius: "var(--radius-md)",
  },
  list: { margin: 0, paddingLeft: "var(--space-5)", color: "var(--color-text-muted)" },
};

function Section({ title, note, children }) {
  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      {note && <p style={styles.sectionNote}>{note}</p>}
      {children}
    </section>
  );
}

// One example with the code that produces it underneath.
function Example({ code, children }) {
  return (
    <div style={styles.item}>
      {children}
      <code style={styles.code}>{code}</code>
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

      <div style={styles.notice} role="note">
        <p style={styles.noticeTitle}>This is not the Messages page.</p>
        <p style={styles.noticeText}>
          Messages is a later feature, so this tab is a temporary developer preview of every shared
          component in <code>src/components</code>. Use these in pages instead of building your own. It
          will be replaced when Messages is built.
        </p>
      </div>

      <Section title="Button" note="variant: primary (default), secondary, danger, success">
        <div style={styles.stack}>
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
        <div style={styles.stack}>
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
        <div style={styles.stack}>
          <Example code="<Card>">
            <Card>Plain card</Card>
          </Example>
          <Example code="<Card soft>">
            <Card soft>Soft card</Card>
          </Example>
        </div>
      </Section>

      <Section title="PageHeader" note="title, subtitle, showBack">
        <div style={{ ...styles.stack, ...styles.frame }}>
          <PageHeader title="My trips" subtitle="Keep track of rides you request or offer." />
          <PageHeader title="Ride details" showBack />
        </div>
      </Section>

      <Section title="BottomNav" note="Shown at the bottom of this page. Pages inside AppLayout get it automatically." />

      <Section title="Planned (not built yet)" note="Don't build these inside a page. They're coming as shared components.">
        <ul style={styles.list}>
          {PLANNED.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
