// P9 Explore (find a ride). Home page.
// Spec: Campus Carpool Page Flows, P9 and F4. P10 (filters sheet) is not designed yet.
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Alert,
    Avatar,
    Button,
    Card,
    DateChip,
    PageHeader,
    RouteTimeline,
} from "../components";
import { searchRides } from "../api";
import { formatPrice, formatShortDate, formatTime } from "../format";
import "./Explore.css";

// Open question in the spec: is From fixed or editable? Fixed for now.
const HOME_CITY = "London, ON";
const DATE_DAYS_AHEAD = 14;

const TIME_OPTIONS = [
    { value: "any", label: "Any time" },
    { value: "morning", label: "Morning", fromHour: 5, toHour: 12 },
    { value: "afternoon", label: "Afternoon", fromHour: 12, toHour: 17 },
    { value: "evening", label: "Evening", fromHour: 17, toHour: 24 },
];

// "YYYY-MM-DD" for a local date (not UTC).
function toDateValue(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

// Next N days, for the "All dates" chip.
function upcomingDates(count) {
    const today = new Date();
    return Array.from({ length: count }, (_, i) => {
        const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
        return { value: toDateValue(day), label: formatShortDate(day) };
    });
}

// Local midnight to next local midnight, sent to the API as UTC.
function dayRange(dateValue) {
    if (!dateValue) return {};
    const [y, m, d] = dateValue.split("-").map(Number);
    return {
        departsAfter: new Date(y, m - 1, d).toISOString(),
        departsBefore: new Date(y, m - 1, d + 1).toISOString(),
    };
}

function seatsLeftText(n) {
    return `${n} ${n === 1 ? "seat" : "seats"} left`;
}

export default function Explore() {
    const navigate = useNavigate();
    const [destination, setDestination] = useState("");
    const [query, setQuery] = useState("");
    const [date, setDate] = useState("");
    const [timeOfDay, setTimeOfDay] = useState("any");
    const [rides, setRides] = useState([]);
    const [status, setStatus] = useState("loading"); // loading | ready | error
    const [reloadKey, setReloadKey] = useState(0);

    const dateOptions = useMemo(() => upcomingDates(DATE_DAYS_AHEAD), []);

    // Wait until the user stops typing before searching.
    useEffect(() => {
        const timer = setTimeout(() => setQuery(destination.trim()), 300);
        return () => clearTimeout(timer);
    }, [destination]);

    useEffect(() => {
        let ignore = false;
        setStatus("loading");
        searchRides({ destination: query, ...dayRange(date) })
            .then((data) => {
                if (ignore) return;
                setRides(data);
                setStatus("ready");
            })
            .catch(() => {
                if (!ignore) setStatus("error");
            });
        return () => {
            ignore = true;
        };
    }, [query, date, reloadKey]);

    // Full rides are hidden (spec P9). Time of day is filtered in the browser
    // because it depends on the user's local time.
    const visibleRides = useMemo(() => {
        const option = TIME_OPTIONS.find((o) => o.value === timeOfDay);
        return rides
            .filter((ride) => ride.status === "open" && ride.seats_left > 0)
            .filter((ride) => {
                if (option.fromHour === undefined) return true;
                const hour = new Date(ride.depart_at).getHours();
                return hour >= option.fromHour && hour < option.toHour;
            });
    }, [rides, timeOfDay]);

    return (
        <main className="page explore">
            <PageHeader
                title="Find your next ride"
                subtitle="Going somewhere? Ride with a fellow student."
            />

            <Card className="explore-search">
                <RouteTimeline
                    from={
                        <div className="explore-search__field">
                            <span className="explore-search__label">From</span>
                            <span className="explore-search__value">{HOME_CITY}</span>
                        </div>
                    }
                    to={
                        <label className="explore-search__field">
                            <span className="explore-search__label">To</span>
                            <input
                                className="explore-search__input"
                                type="search"
                                placeholder="Where are you going?"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                            />
                        </label>
                    }
                />
            </Card>

            <div className="explore-chips">
                <select
                    aria-label="Date"
                    className={`explore-chip ${date ? "explore-chip--active" : ""}`}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                >
                    <option value="">All dates</option>
                    {dateOptions.map((d) => (
                        <option key={d.value} value={d.value}>
                            {d.label}
                        </option>
                    ))}
                </select>

                <select
                    aria-label="Time of day"
                    className={`explore-chip ${timeOfDay !== "any" ? "explore-chip--active" : ""}`}
                    value={timeOfDay}
                    onChange={(e) => setTimeOfDay(e.target.value)}
                >
                    {TIME_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
            </div>

            <section aria-labelledby="explore-rides-title">
                <h2 id="explore-rides-title" className="explore-list__title">
                    Available rides
                </h2>

                {status === "loading" && <p className="explore-status">Loading rides…</p>}

                {status === "error" && (
                    <Alert type="error">
                        Couldn't load rides.{" "}
                        <button
                            type="button"
                            className="explore-retry"
                            onClick={() => setReloadKey((k) => k + 1)}
                        >
                            Retry
                        </button>
                    </Alert>
                )}

                {status === "ready" && visibleRides.length === 0 && (
                    <div className="explore-empty">
                        <p className="explore-empty__title">No rides match</p>
                        <p className="explore-status">
                            Try another date, or post the ride yourself.
                        </p>
                        <Button variant="secondary" onClick={() => navigate("/post")}>
                            Post a ride
                        </Button>
                    </div>
                )}

                {status === "ready" && visibleRides.length > 0 && (
                    <ul className="explore-list">
                        {visibleRides.map((ride) => (
                            <li key={ride.id}>
                                <RideCard ride={ride} />
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
}

// Page-only for now. The spec lists RideCard as shared (8.4); move it to
// components/ in a separate small PR if another page needs it.
function RideCard({ ride }) {
    return (
        <Link to={`/rides/${ride.id}`} className="explore-card-link">
            <Card className="explore-card">
                <div className="explore-card__top">
                    <RouteTimeline
                        from={<span className="explore-card__origin">{ride.pickup_point}</span>}
                        to={<span className="explore-card__destination">{ride.destination}</span>}
                    />
                    <DateChip date={ride.depart_at} />
                </div>
                <div className="explore-card__bottom">
                    <Avatar name={ride.driver.name} />
                    <div className="explore-card__driver">
                        <span className="explore-card__name">{ride.driver.name}</span>
                        <span className="explore-card__meta">
              {formatTime(ride.depart_at)} · {seatsLeftText(ride.seats_left)}
            </span>
                    </div>
                    <span className="explore-card__price">{formatPrice(ride.price_per_seat)}</span>
                </div>
            </Card>
        </Link>
    );
}