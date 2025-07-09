import React from "react";
import { Link, useLocation } from "react-router";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

const links = [
  { to: "/globalusers", label: "Users" },
  { to: "/globaluser/add", label: "Add User" },
  { to: "/globalorgs", label: "Organizations" },
  { to: "/globalorg/add", label: "Add Organization" },
];

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="bg-white border-b shadow-sm p-4 flex gap-4 justify-between items-center">
      <div className="text-xl font-semibold text-gray-800">Central Auth Admin</div>
      <div className="flex gap-2 flex-wrap">
        {links.map(({ to, label }) => (
          <Button
            key={to}
            asChild
            variant={location.pathname === to ? "default" : "outline"}
          >
            <Link to={to}>{label}</Link>
          </Button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
