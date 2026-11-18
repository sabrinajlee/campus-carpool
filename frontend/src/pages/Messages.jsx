import { useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  ConfirmationLayout,
  DateChip,
  NumberStepper,
  PageHeader,
  PersonRow,
  PriceBanner,
  RouteHeader,
  RouteTimeline,
  StatusBadge,
  TextInput,
  TripSummaryCard,
  VehicleCard,
} from "../components";
import "./Messages.css";

// COMPONENT PREVIEW (temporary)
// Messages (P34) is a later feature, so this tab shows every shared component
// and its states instead. Add each new shared component here in the same PR
// that creates it. Replace this file when Messages is actually built.

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

// NumberStepper needs state to be clickable here.
function StepperDemo(props) {
  const [value, setValue] = useState(3);
  return <NumberStepper value={value} onChange={setValue} {...props} />;
}

// Sample ride time for the date examples.
const SAMPLE_DEPART = "2026-11-13T16:30:00";

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

      <Section title="TextInput" note="label, helper, error, multiline, readOnly, plus any normal input prop">
        <TextInput label="Leaving from" placeholder="London, ON" />
        <TextInput label="Going to" defaultValue="London, ON" error="Destination must be different from where you're leaving." />
        <TextInput label="Departure time" type="time" defaultValue="16:30" />
        <TextInput label="UWO email" defaultValue="jappleseed84@uwo.ca" readOnly />
        <TextInput label="Full name" defaultValue="Johnny Appleseed" helper="You cannot change this later!" />
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

      <Section title="NumberStepper" note="label, title, subtitle, value, onChange, min, max">
        <StepperDemo label="Available seats" title="Passengers" min={1} max={7} />
        <StepperDemo title="Seats for riders" subtitle="Your default. Change it on any trip." min={1} max={7} />
      </Section>

      <Section title="Avatar" note="name (first letter shown), size: sm (default) or lg">
        <div className="messages-row">
          <Example code='name="Alex Morgan"'>
            <Avatar name="Alex Morgan" />
          </Example>
          <Example code='size="lg"'>
            <Avatar name="Jane Doe" size="lg" />
          </Example>
        </div>
      </Section>

      <Section title="DateChip" note="date: the ride's depart_at">
        <Example code="date={ride.depart_at}">
          <DateChip date={SAMPLE_DEPART} />
        </Example>
      </Section>

      <Section title="RouteTimeline" note="from, to: whatever the page shows beside each point">
        <div className="messages-stack">
          <Card>
            <RouteTimeline
              from={
                <>
                  <strong>Western University, London</strong>
                  <small>Exact meetup details shared on acceptance</small>
                </>
              }
              to={<strong>Union Station area, Toronto</strong>}
            />
          </Card>
          <Card>
            <RouteTimeline from={<small>Western University</small>} to={<strong>Toronto, ON</strong>} />
          </Card>
        </div>
      </Section>

      <Section title="Alert" note="type: info (default), success, error">
        <div className="messages-stack">
          <Alert>A new link is on its way.</Alert>
          <Alert type="success">Your email is verified. You can log in now.</Alert>
          <Alert type="error">Couldn't post your ride. Try again.</Alert>
        </div>
      </Section>

      <Section title="PersonRow" note="name, action (right side), note (grey footer), contact (green footer, accepted only)">
        <div className="messages-stack">
          <PersonRow name="Alex Morgan" note="Contact info shared on acceptance" />
          <PersonRow name="Alex Morgan" contact="(647) 765-9872 or amorgan@uwo.ca" />
          <PersonRow
            name="Iris Lucky"
            action={<span className="messages-code">action</span>}
            note="Contact info shared on acceptance"
          />
        </div>
      </Section>

      <Section title="RouteHeader" note="departAt, origin, pickupPoint, destination, dropoffPoint, seats, badge">
        <div className="messages-stack">
          <RouteHeader
            departAt={SAMPLE_DEPART}
            origin="London"
            pickupPoint="Western University"
            destination="Toronto"
            dropoffPoint="Union Station area"
            seats={3}
          />
          <RouteHeader
            departAt={SAMPLE_DEPART}
            origin="London"
            pickupPoint="Western University"
            destination="Kitchener"
            dropoffPoint="Downtown"
            seats={1}
            badge={<StatusBadge status="accepted" />}
          />
        </div>
      </Section>

      <Section title="PriceBanner" note="price (dollars), seats">
        <PriceBanner price={15} seats={3} />
      </Section>

      <Section title="VehicleCard" note="colour, make, model, seats, plate">
        <VehicleCard colour="Silver" make="Honda" model="Civic" seats={3} plate="CKRT 482" />
      </Section>

      <Section title="TripSummaryCard" note="origin, destination, departAt, badge, note">
        <div className="messages-stack">
          <TripSummaryCard origin="London" destination="Toronto" departAt={SAMPLE_DEPART} />
          <TripSummaryCard
            origin="London"
            destination="Toronto"
            departAt={SAMPLE_DEPART}
            badge={<StatusBadge status="pending" label="Request pending" />}
            note="You'll see updates under My trips."
          />
        </div>
      </Section>

      <Section
        title="ConfirmationLayout"
        note="icon: check, cancel (indigo X), car, or error (red X); title, subtitle, children (card), actions (buttons, pinned to the bottom). Shown here in a short frame."
      >
        <div className="messages-stack">
          <div className="messages-frame messages-confirmation">
            <ConfirmationLayout
              icon="check"
              title="Request sent!"
              subtitle="Alex will review your request to join the ride to Toronto."
              actions={
                <>
                  <Button fullWidth>My trips</Button>
                  <Button variant="secondary" fullWidth>
                    Back to explore
                  </Button>
                </>
              }
            >
              <TripSummaryCard
                origin="London"
                destination="Toronto"
                departAt={SAMPLE_DEPART}
                badge={<StatusBadge status="pending" label="Request pending" />}
                note="You'll see updates under My trips."
              />
            </ConfirmationLayout>
          </div>
          <div className="messages-frame messages-confirmation">
            <ConfirmationLayout
              icon="error"
              title="ERROR!"
              subtitle="Something went wrong."
              actions={
                <>
                  <Button variant="secondary" fullWidth>
                    Report a problem
                  </Button>
                  <Button variant="secondary" fullWidth>
                    Back to home
                  </Button>
                </>
              }
            />
          </div>
        </div>
      </Section>

      <Section title="BottomNav" note="Shown at the bottom of this page. Pages inside AppLayout get it automatically." />

      <Section
        title="Still to build"
        note="See the Shared components section of docs/frontend.md. Don't build those inside a page."
      />
    </main>
  );
}
