// P11 Ride details. Built for the not-yet-requested state (the wireframe),
// plus the simple states from Section 4: full, own ride, already requested,
// cancelled. The full P14/P15 pending/accepted layouts come later.
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check } from "lucide-react";
import {
    Alert,
    Button,
    Card,
    PageHeader,
    PersonRow,
    PriceBanner,
    RouteHeader,
    RouteTimeline,
} from "../components";
import { getRide, requestSeat } from "../api";
import "./RideDetails.css";

// Error codes the backend should return from POST /api/rides/:id/requests.
const REQUEST_ERRORS = {
    ride_full: "This ride just filled up.",
    ride_cancelled: "This ride was cancelled by the driver.",
};

export default function RideDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ride, setRide] = useState(null);
    const [status, setStatus] = useState("loading"); // loading | ready | error
    const [reloadKey, setReloadKey] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [requestError, setRequestError] = useState("");

    useEffect(() => {
        let ignore = false;
        setStatus("loading");
        getRide(id)
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
        setRequestError("");
        try {
            await requestSeat(ride.id);
            // Confirmation screens replace history so Back can't resubmit.
            navigate(`/rides/${ride.id}/requested`, { replace: true, state: { ride } });
        } catch (err) {
            if (err.code === "already_requested") {
                setReloadKey((k) => k + 1); // reload shows the requested state
            } else if (err.code in REQUEST_ERRORS) {
                setRequestError(REQUEST_ERRORS[err.code]);
                setRide((r) => ({
                    ...r,
                    status: err.code === "ride_full" ? "full" : "cancelled",
                    seats_left: err.code === "ride_full" ? 0 : r.seats_left,
                }));
            } else {
                setRequestError("Couldn't send your request. Please try again.");
            }
        } finally {
            setSubmitting(false);
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

    function renderAction() {
        if (ride.is_own) {
            return (
                <Button fullWidth onClick={() => navigate(`/trips/${ride.id}/requests`)}>
                    Manage requests
                </Button>
            );
        }
        if (ride.my_request) {
            return (
                <>
                    <Alert type="info">
                        You've requested a seat on this ride ({ride.my_request.status}).
                    </Alert>
                    <Button variant="secondary" fullWidth onClick={() => navigate("/trips")}>
                        View in My trips
                    </Button>
                </>
            );
        }
        if (isCancelled) {
            return (
                <>
                    {!requestError && <Alert type="info">This ride was cancelled by the driver.</Alert>}
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
            />

            <section>
                <h2 className="ride-details__heading">Your driver</h2>
                <PersonRow
                    name={ride.driver.name}
                    action={<Check className="ride-details__verified" aria-label="Verified" />}
                />
            </section>

            <section>
                <h2 className="ride-details__heading">Pickup &amp; drop-off</h2>
                <Card>
                    <RouteTimeline
                        from={
                            <>
                                <span className="ride-details__stop">{ride.pickup_point}</span>
                                <span className="ride-details__muted ride-details__hint">
                  Exact meetup details shared on acceptance
                </span>
                            </>
                        }
                        to={<span className="ride-details__stop">{ride.dropoff_point}</span>}
                    />
                </Card>
            </section>

            <PriceBanner price={ride.price_per_seat} seats={ride.seats_left} />

            {requestError && <Alert type="error">{requestError}</Alert>}

            <div className="ride-details__actions">{renderAction()}</div>
        </main>
    );
}