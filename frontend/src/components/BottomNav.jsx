import { NavLink } from "react-router-dom";
import { Compass, ListChecks, Plus, MessageSquare, User } from "lucide-react";

const linkClass = ({ isActive }) => `bottom-nav__item${isActive ? " active" : ""}`;

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main">
      <NavLink to="/" end className={linkClass}>
        <Compass size={20} />
        Explore
      </NavLink>
      <NavLink to="/trips" className={linkClass}>
        <ListChecks size={20} />
        My trips
      </NavLink>
      <NavLink to="/post" className={linkClass}>
        <span className="bottom-nav__post-circle">
          <Plus size={22} />
        </span>
        Post ride
      </NavLink>
      <NavLink to="/messages" className={linkClass}>
        <MessageSquare size={20} />
        Messages
      </NavLink>
      <NavLink to="/profile" className={linkClass}>
        <User size={20} />
        Profile
      </NavLink>
    </nav>
  );
}
