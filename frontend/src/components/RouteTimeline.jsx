// Draws the filled dot → line → ring between two places. The page decides what goes beside each point.
//
// <RouteTimeline
//   from={<><strong>Western University, London</strong><small>Exact meetup details shared on acceptance</small></>}
//   to={<strong>Union Station area, Toronto</strong>}
// />
export default function RouteTimeline({ from, to }) {
  return (
    <div className="route-timeline">
      <div className="route-timeline__stop route-timeline__stop--from">
        <div className="route-timeline__marker" aria-hidden="true">
          <span className="route-timeline__dot" />
          <span className="route-timeline__line" />
        </div>
        <div className="route-timeline__content">{from}</div>
      </div>
      <div className="route-timeline__stop">
        <div className="route-timeline__marker" aria-hidden="true">
          <span className="route-timeline__ring" />
        </div>
        <div className="route-timeline__content">{to}</div>
      </div>
    </div>
  );
}
