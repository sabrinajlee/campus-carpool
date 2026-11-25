import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, X } from "lucide-react";
import {
    Alert,
    Button,
    Card,
    PageHeader,
    PersonRow,
    PriceBanner,
    RouteHeader,
    RouteTimeline,
    StatusBadge,
    VehicleCard,
} from "../components";
import {
    acceptRequest,
    cancelRequest,
    cancelRide,
    declineRequest,
    getRide,
    getRideRequests,
    removeRider,
    requestSeat,
} from "../api";
import "./RideDetails.css";

// Ride details (/rides/:id). One page for every situation in docs/frontend.md
// "Ride details by situation":
//   from Explore, not requested -> Request a seat (greyed "Ride full" when full)
//   from My trips (Riding):
//     pending  -> "Waiting for driver", Cancel ride
//     accepted -> driver contact and vehicle, Cancel ride
//     declined, or the ride was cancelled -> read-only
//   from My trips (Driving), the driver's own ride -> "N Requests" / "Seats Filled" /
//     no badge, requests with accept / decline, confirmed riders with contact and
//     remove, Cancel ride
// Contact info on either side only appears once a request is accepted.
//
// Data comes from GET /api/rides/:id (getRide), which returns the ride:
//
// { "id": 9, "origin": "London", "destination": "Toronto",
//   "pickup_point": "Western University, London", "dropoff_point": "Union Station area, Toronto",
//   "depart_at": "2026-11-13T21:30:00Z", "seats_left": 3, "price_per_seat": "15.00",
//   "status": "open",                                 // rides.status
//   "is_own": false,                                  // I'm the driver
//   "my_request": { "id": 21, "status": "pending" },  // ride_requests.status, or null
//   "driver": { "id": 10, "name": "Alex Morgan",
//               "phone": "(647) 765-9872", "email": "amorgan@uwo.ca" },  // phone/email: accepted only
//   "vehicle": { "colour": "Silver", "make": "Honda", "model": "Civic",
//                "plate": "CKRT 482", "seats": 3 } }  // accepted riders and the driver only, else null
//
// For the driver's own ride, requests come from GET /api/rides/:id/requests:
// { "requests": [{ "id": 31, "status": "pending",
//                  "rider": { "id": 20, "name": "Iris Lucky", "phone": null, "email": null } }] }
// rider.phone / rider.email are only filled in once the request is accepted.

// ---------- Sample data for testing ----------
// While USE_SAMPLE_DATA is true, the rides below are shown instead of calling the
// backend, and their buttons pretend to succeed. Other ids still use getRide.
// Set it to false once the ride and request endpoints exist.
const USE_SAMPLE_DATA = true;

function daysFromNow(days, hour, minute = 0) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
}

const ALEX = { id: 10, name: "Alex Morgan", phone: null, email: null };

// Ids 7, 8 and 9 match the Riding trips in My trips' sample data, so its cards open these.
const SAMPLE_RIDES = {
    // Rider, pending (wireframe 1)
    9: {
        id: 9, origin: "London", destination: "Toronto",
        pickup_point: "Western University, London", dropoff_point: "Union Station area, Toronto",
        depart_at: daysFromNow(5, 16, 30), seats_left: 3, price_per_seat: "15.00", status: "open",
        is_own: false, my_request: { id: 21, status: "pending" }, driver: ALEX, vehicle: null,
    },
    // Rider, accepted (wireframe 2)
    8: {
        id: 8, origin: "London", destination: "Kitchener",
        pickup_point: "Western University, London", dropoff_point: "Kitchener GO station",
        depart_at: daysFromNow(2, 16, 30), seats_left: 3, price_per_seat: "10.00", status: "open",
        is_own: false, my_request: { id: 20, status: "accepted" },
        driver: { ...ALEX, phone: "(647) 765-9872", email: "amorgan@uwo.ca" },
        vehicle: { colour: "Silver", make: "Honda", model: "Civic", plate: "CKRT 482", seats: 3 },
    },
    // Rider, declined (read-only)
    7: {
        id: 7, origin: "London", destination: "Niagara Falls",
        pickup_point: "Western University, London", dropoff_point: "Clifton Hill, Niagara Falls",
        depart_at: daysFromNow(11, 9), seats_left: 3, price_per_seat: "20.00", status: "open",
        is_own: false, my_request: { id: 19, status: "declined" }, driver: ALEX, vehicle: null,
    },
    // Driver's own ride (wireframe 3)
    5: {
        id: 5, origin: "London", destination: "Toronto",
        pickup_point: "Western University, London", dropoff_point: "Union Station area, Toronto",
        depart_at: daysFromNow(3, 16, 30), seats_left: 1, price_per_seat: "15.00", status: "open",
        is_own: true, my_request: null, driver: { id: 1, name: "Sabrina Lee" },
        vehicle: { colour: "Silver", make: "Honda", model: "Civic", plate: "CKRT 482", seats: 3 },
        requests: [
            { id: 31, status: "pending", rider: { id: 20, name: "Iris Lucky", phone: null, email: null } },
            { id: 32, status: "accepted", rider: { id: 21, name: "Alex Morgan", phone: "(647) 787-9872", email: "amorgan2@uwo.ca" } },
            { id: 33, status: "accepted", rider: { id: 22, name: "Jordan Park", phone: null, email: "jpark7@uwo.ca" } },
        ],
    },
    // Driver's own ride, every seat taken ("Seats Filled")
    10: {
        id: 10, origin: "London", destination: "Kitchener",
        pickup_point: "Western University, London", dropoff_point: "Kitchener GO station",
        depart_at: daysFromNow(4, 9), seats_left: 0, price_per_seat: "10.00", status: "full",
        is_own: true, my_request: null, driver: { id: 1, name: "Sabrina Lee" },
        vehicle: { colour: "Silver", make: "Honda", model: "Civic", plate: "CKRT 482", seats: 2 },
        requests: [
            { id: 41, status: "accepted", rider: { id: 23, name: "Allen Wu", phone: "(519) 555-0188", email: "awu42@uwo.ca" } },
            { id: 42, status: "accepted", rider: { id: 24, name: "Bobby Singh", phone: null, email: "bsingh9@uwo.ca" } },
        ],
    },
};

// What the server would return as the rider's contact once a sample request is accepted.
const SAMPLE_CONTACTS = { 20: { phone: "(519) 555-0142", email: "ilucky@uwo.ca" } };

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function loadRide(id) {
    if (USE_SAMPLE_DATA && SAMPLE_RIDES[id]) {
        await wait(300);
        return structuredClone(SAMPLE_RIDES[id]);
    }
    const ride = await getRide(id);
    if (!ride.is_own) return ride;
    return { ...ride, requests: await getRideRequests(id) };
}

// Error codes the backend should return from POST /api/rides/:id/requests.
const REQUEST_ERRORS = {
    RIDE_FULL: "This ride just filled up.",
    RIDE_CANCELLED: "This ride was cancelled by the driver.",
};

// Rider's request statuses that make the page read-only (no Request a seat or Cancel ride).
const READ_ONLY_MESSAGES = {
    declined: "The driver declined your request.",
    cancelled: "You cancelled your request for this ride.",
    removed: "The driver removed you from this ride.",
    completed: "You completed this ride.",
};

// Driver actions on one request: the API call and the status it leaves the request in.
const REQUEST_ACTIONS = {
    accept: { call: acceptRequest, status: "accepted" },
    decline: { call: declineRequest, status: "declined" },
    remove: { call: removeRider, status: "removed" },
};

// "(647) 765-9872 or amorgan@uwo.ca", or whichever one the person has.
function formatContact(person) {
    return [person?.phone, person?.email].filter(Boolean).join(" or ");
}

const firstName = (name) => name.split(" ")[0];

// Round accept / decline / remove button on a person row.
function RoundButton({ tone, label, disabled, onClick, children }) {
    return (
        <button
            type="button"
            className={`ride-details__round ride-details__round--${tone}`}
            aria-label={label}
            title={label}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

// Page-local confirm dialog until the shared ConfirmDialog is built.
function ConfirmDialog({ title, body, confirmLabel, cancelLabel, busy, onConfirm, onClose }) {
    const keepRef = useRef(null);

    useEffect(() => {
        keepRef.current?.focus();
    }, []);

    useEffect(() => {
        function onKey(e) {
            if (e.key === "Escape" && !busy) onClose();
        }
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [busy, onClose]);

    return (
        <div className="ride-details__overlay" onClick={busy ? undefined : onClose}>
            <div
                className="ride-details__dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="ride-details-dialog-title"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 id="ride-details-dialog-title">{title}</h2>
                <p className="ride-details__muted">{body}</p>
                <div className="ride-details__actions">
                    <Button variant="danger" fullWidth disabled={busy} onClick={onConfirm}>
                        {busy ? "Please wait…" : confirmLabel}
                    </Button>
                    <Button ref={keepRef} variant="secondary" fullWidth disabled={busy} onClick={onClose}>
                        {cancelLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// The pickup and drop-off card shown to riders.
function PickupDropoff({ ride, accepted }) {
    return (
        <section>
            <h2 className="ride-details__heading">Pickup &amp; drop-off</h2>
            <Card>
                <RouteTimeline
                    from={
                        <>
                            <span className="ride-details__stop">{ride.pickup_point}</span>
                            <span className="ride-details__muted ride-details__hint">
                                {accepted
                                    ? "Contact your driver to arrange the exact meetup"
                                    : "Exact meetup details shared on acceptance"}
                            </span>
                        </>
                    }
                    to={<span className="ride-details__stop">{ride.dropoff_point}</span>}
                />
            </Card>
        </section>
    );
}

export default function RideDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ride, setRide] = useState(null);
    const [status, setStatus] = useState("loading"); // loading | ready | error
    const [reloadKey, setReloadKey] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [actionError, setActionError] = useState("");
    const [busyRequestId, setBusyRequestId] = useState(null);
    // null, { kind: "cancel" } or { kind: "remove", request }
    const [confirm, setConfirm] = useState(null);

    const isSample = USE_SAMPLE_DATA && Boolean(SAMPLE_RIDES[id]);

    useEffect(() => {
        let ignore = false;
        setStatus("loading");
        loadRide(id)
            .then((data) => {
                if (ignore) return;
                setRide(data);
                setStatus("ready");
            })
            .catch((err) => {
                if (ignore) return;
                if (err.status === 404) navigate("/error", { replace: true });
                else setStatus("error");
            });
        return () => {
            ignore = true;
        };
    }, [id, reloadKey, navigate]);

    async function handleRequestSeat() {
        setSubmitting(true);
        setActionError("");
        try {
            await requestSeat(ride.id);
            // Confirmation screens replace history so Back can't resubmit.
            navigate(`/rides/${ride.id}/requested`, { replace: true, state: { ride } });
        } catch (err) {
            if (err.code === "ALREADY_REQUESTED") {
                setReloadKey((k) => k + 1); // reload shows the pending state
            } else if (err.code in REQUEST_ERRORS) {
                setActionError(REQUEST_ERRORS[err.code]);
                setRide((r) => ({
                    ...r,
                    status: err.code === "RIDE_FULL" ? "full" : "cancelled",
                    seats_left: err.code === "RIDE_FULL" ? 0 : r.seats_left,
                }));
            } else {
                setActionError("Couldn't send your request. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    }

    // Rider cancels their request, or the driver cancels the whole ride.
    async function handleCancel() {
        setSubmitting(true);
        setActionError("");
        try {
            if (isSample) await wait(300);
            else if (ride.is_own) await cancelRide(ride.id);
            else await cancelRequest(ride.my_request.id);
            navigate(`/rides/${ride.id}/cancelled`, {
                replace: true,
                state: { cancelledBy: ride.is_own ? "driver" : "rider", ride },
            });
        } catch {
            setConfirm(null);
            setActionError("Couldn't cancel. Please try again.");
            setSubmitting(false);
        }
    }

    // Driver accepts, declines or removes one request. action: "accept" | "decline" | "remove".
    async function handleRespond(request, action) {
        const { call, status: newStatus } = REQUEST_ACTIONS[action];
        setBusyRequestId(request.id);
        setActionError("");
        try {
            let updated;
            if (isSample) {
                await wait(300);
                const contact = newStatus === "accepted" ? SAMPLE_CONTACTS[request.rider.id] : {};
                updated = { ...request, status: newStatus, rider: { ...request.rider, ...contact } };
            } else {
                updated = await call(request.id);
            }
            // Accepting takes a seat; removing an accepted rider gives it back.
            const seatChange =
                newStatus === "accepted" ? -1 : request.status === "accepted" ? 1 : 0;
            setRide((r) => {
                const seatsLeft = r.seats_left + seatChange;
                return {
                    ...r,
                    seats_left: seatsLeft,
                    status: seatsLeft <= 0 ? "full" : "open",
                    requests: r.requests.map((q) => (q.id === request.id ? updated : q)),
                };
            });
            setConfirm(null);
        } catch (err) {
            setConfirm(null);
            if (err.code === "NO_SEATS_LEFT") {
                setActionError("No seats left. The request is still pending.");
                setRide((r) => ({ ...r, seats_left: 0, status: "full" }));
            } else {
                setActionError("Couldn't update the request. Please try again.");
            }
        } finally {
            setBusyRequestId(null);
        }
    }

    if (status === "loading") {
        return (
            <main className="page ride-details">
                <PageHeader title="Ride details" showBack />
                <p className="ride-details__muted">Loading ride…</p>
            </main>
        );
    }

    if (status === "error") {
        return (
            <main className="page ride-details">
                <PageHeader title="Ride details" showBack />
                <Alert type="error">
                    Couldn't load this ride.{" "}
                    <button
                        type="button"
                        className="ride-details__retry"
                        onClick={() => setReloadKey((k) => k + 1)}
                    >
                        Retry
                    </button>
                </Alert>
            </main>
        );
    }

    const isCancelled = ride.status === "cancelled";
    const isFull = ride.status === "full" || ride.seats_left <= 0;
    const requestStatus = ride.my_request?.status ?? null;
    // Contact info and the vehicle are only shown on a live, accepted request.
    const isAccepted = requestStatus === "accepted" && !isCancelled;
    const pending = ride.is_own ? ride.requests.filter((q) => q.status === "pending") : [];
    const confirmed = ride.is_own ? ride.requests.filter((q) => q.status === "accepted") : [];

    function renderBadge() {
        if (isCancelled) return <StatusBadge status="cancelled" />;
        // Driver: "N Requests", else "Seats Filled", else no badge (same order as My trips).
        if (ride.is_own) {
            if (pending.length > 0) return <StatusBadge status="requests" count={pending.length} />;
            return isFull ? <StatusBadge status="full" /> : null;
        }
        if (requestStatus === "pending") return <StatusBadge status="pending" label="Waiting for driver" />;
        if (requestStatus) return <StatusBadge status={requestStatus} />;
        return null;
    }

    function renderDriverSections() {
        return (
            <>
                <section>
                    <h2 className="ride-details__heading">Requests</h2>
                    {pending.length === 0 ? (
                        <p className="ride-details__muted">No requests right now.</p>
                    ) : (
                        <div className="ride-details__list">
                            {pending.map((request) => {
                                const name = firstName(request.rider.name);
                                const busy = busyRequestId === request.id;
                                return (
                                    <PersonRow
                                        key={request.id}
                                        name={request.rider.name}
                                        note={isFull ? "No seats left" : "Contact info shared on acceptance"}
                                        action={
                                            !isCancelled && (
                                                <>
                                                    <RoundButton
                                                        tone="danger"
                                                        label={`Decline ${name}`}
                                                        disabled={busy}
                                                        onClick={() => handleRespond(request, "decline")}
                                                    >
                                                        <X size={16} />
                                                    </RoundButton>
                                                    <RoundButton
                                                        tone="success"
                                                        label={isFull ? `No seats left to accept ${name}` : `Accept ${name}`}
                                                        disabled={busy || isFull}
                                                        onClick={() => handleRespond(request, "accept")}
                                                    >
                                                        <Check size={16} />
                                                    </RoundButton>
                                                </>
                                            )
                                        }
                                    />
                                );
                            })}
                        </div>
                    )}
                </section>

                <section>
                    <h2 className="ride-details__heading">Confirmed Riders</h2>
                    {confirmed.length === 0 ? (
                        <p className="ride-details__muted">No confirmed riders yet.</p>
                    ) : (
                        <div className="ride-details__list">
                            {confirmed.map((request) => (
                                <PersonRow
                                    key={request.id}
                                    name={request.rider.name}
                                    contact={formatContact(request.rider)}
                                    action={
                                        !isCancelled && (
                                            <RoundButton
                                                tone="danger"
                                                label={`Remove ${firstName(request.rider.name)}`}
                                                disabled={busyRequestId === request.id}
                                                onClick={() => setConfirm({ kind: "remove", request })}
                                            >
                                                <X size={16} />
                                            </RoundButton>
                                        )
                                    }
                                />
                            ))}
                        </div>
                    )}
                </section>
            </>
        );
    }

    function renderRiderSections() {
        return (
            <>
                <section>
                    <h2 className="ride-details__heading">Your driver</h2>
                    <PersonRow
                        name={ride.driver.name}
                        note={requestStatus === "pending" && !isCancelled ? "Contact info shared on acceptance" : undefined}
                        contact={isAccepted ? formatContact(ride.driver) : undefined}
                    />
                </section>

                <PickupDropoff ride={ride} accepted={isAccepted} />

                {isAccepted && ride.vehicle && (
                    <section>
                        <h2 className="ride-details__heading">Driver&rsquo;s vehicle</h2>
                        <VehicleCard {...ride.vehicle} />
                    </section>
                )}
            </>
        );
    }

    function renderAction() {
        if (isCancelled) {
            return (
                <>
                    {!actionError && (
                        <Alert type="info">
                            {ride.is_own ? "You cancelled this ride." : "This ride was cancelled by the driver."}
                        </Alert>
                    )}
                    <Button variant="secondary" fullWidth onClick={() => navigate("/")}>
                        Back to explore
                    </Button>
                </>
            );
        }
        if (ride.is_own || requestStatus === "pending" || requestStatus === "accepted") {
            return (
                <Button variant="danger" fullWidth disabled={submitting} onClick={() => setConfirm({ kind: "cancel" })}>
                    Cancel ride
                </Button>
            );
        }
        if (requestStatus in READ_ONLY_MESSAGES) {
            return (
                <>
                    <Alert type="info">{READ_ONLY_MESSAGES[requestStatus]}</Alert>
                    <Button variant="secondary" fullWidth onClick={() => navigate("/")}>
                        Back to explore
                    </Button>
                </>
            );
        }
        if (isFull) {
            return (
                <>
                    <Button fullWidth disabled>
                        Ride full
                    </Button>
                    <Button variant="secondary" fullWidth onClick={() => navigate("/")}>
                        Back to explore
                    </Button>
                </>
            );
        }
        return (
            <Button fullWidth onClick={handleRequestSeat} disabled={submitting}>
                {submitting ? "Sending request…" : "Request a seat"}
            </Button>
        );
    }

    function renderConfirm() {
        if (!confirm) return null;
        if (confirm.kind === "remove") {
            const name = firstName(confirm.request.rider.name);
            return (
                <ConfirmDialog
                    title={`Remove ${name}?`}
                    body={`${name} will be notified and their seat goes back on the ride.`}
                    confirmLabel={`Remove ${name}`}
                    cancelLabel="Keep rider"
                    busy={busyRequestId === confirm.request.id}
                    onConfirm={() => handleRespond(confirm.request, "remove")}
                    onClose={() => setConfirm(null)}
                />
            );
        }
        return (
            <ConfirmDialog
                title={ride.is_own ? "Cancel this ride?" : "Cancel your seat?"}
                body={ride.is_own ? "All riders will be notified." : "The driver will be notified."}
                confirmLabel="Cancel ride"
                cancelLabel={ride.is_own ? "Keep ride" : "Keep my seat"}
                busy={submitting}
                onConfirm={handleCancel}
                onClose={() => setConfirm(null)}
            />
        );
    }

    return (
        <main className="page ride-details">
            <PageHeader title="Ride details" showBack />

            <RouteHeader
                departAt={ride.depart_at}
                origin={ride.origin}
                pickupPoint={ride.pickup_point}
                destination={ride.destination}
                dropoffPoint={ride.dropoff_point}
                seats={ride.seats_left}
                badge={renderBadge()}
            />

            {ride.is_own ? renderDriverSections() : renderRiderSections()}

            <div>
                <PriceBanner price={ride.price_per_seat} seats={ride.seats_left} />
                {isAccepted && (
                    <p className="ride-details__muted ride-details__hint">Pay the driver directly.</p>
                )}
            </div>

            {actionError && <Alert type="error">{actionError}</Alert>}

            <div className="ride-details__actions">{renderAction()}</div>

            {renderConfirm()}
        </main>
    );
}
