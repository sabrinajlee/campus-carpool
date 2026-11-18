// Temporary sample rides so P9 and P11 can be tried before the backend has
// /api/rides. Used only when VITE_USE_MOCKS=true. Delete once the API exists.

function daysFromNow(days, hour, minute = 0) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
}

export const MOCK_RIDES = [
    {
        id: 1,
        origin: "London",
        destination: "Toronto",
        pickup_point: "Western University",
        dropoff_point: "Union Station area, Toronto",
        depart_at: daysFromNow(2, 16, 30),
        seats_left: 3,
        price_per_seat: "15.00",
        status: "open",
        driver: { id: 10, name: "Alex Morgan" },
        is_own: false,
        my_request: null,
    },
    {
        id: 2,
        origin: "London",
        destination: "Kitchener",
        pickup_point: "Western University",
        dropoff_point: "Kitchener GO station",
        depart_at: daysFromNow(3, 9, 0),
        seats_left: 2,
        price_per_seat: "10.00",
        status: "open",
        driver: { id: 11, name: "Sam Taylor" },
        is_own: false,
        my_request: null,
    },
    {
        // Full: hidden on Explore, shows "Ride full" at /rides/3
        id: 3,
        origin: "London",
        destination: "Waterloo",
        pickup_point: "Masonville Place",
        dropoff_point: "University of Waterloo",
        depart_at: daysFromNow(1, 18, 0),
        seats_left: 0,
        price_per_seat: "12.50",
        status: "full",
        driver: { id: 12, name: "Jordan Lee" },
        is_own: false,
        my_request: null,
    },
    {
        // Already requested: /rides/4 shows the requested state
        id: 4,
        origin: "London",
        destination: "Toronto",
        pickup_point: "Western University",
        dropoff_point: "Yorkdale Mall",
        depart_at: daysFromNow(5, 13, 0),
        seats_left: 1,
        price_per_seat: "18.00",
        status: "open",
        driver: { id: 13, name: "Riley Chen" },
        is_own: false,
        my_request: { id: 40, status: "pending" },
    },
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function mockSearchRides({ destination = "", departsAfter, departsBefore }) {
    await wait(300);
    const q = destination.toLowerCase();
    return MOCK_RIDES.filter((r) => r.status === "open" && r.seats_left > 0)
        .filter((r) => !q || r.destination.toLowerCase().includes(q))
        .filter((r) => !departsAfter || r.depart_at >= departsAfter)
        .filter((r) => !departsBefore || r.depart_at < departsBefore)
        .sort((a, b) => a.depart_at.localeCompare(b.depart_at));
}

export async function mockGetRide(id) {
    await wait(300);
    const ride = MOCK_RIDES.find((r) => r.id === Number(id));
    if (!ride) {
        const err = new Error("Ride not found");
        err.status = 404;
        throw err;
    }
    return ride;
}

export async function mockRequestSeat(rideId) {
    await wait(300);
    return { id: Date.now(), ride_id: Number(rideId), status: "pending" };
}