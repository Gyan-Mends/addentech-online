import React from "react";
import { Link } from "react-router-dom";

const NavItem = ({ to, label, icon }: { to: string, label: string, icon: React.ReactNode }) => {
  return (
    <Link to={to}>
      <li className="hover:bg-pink-100 py-3 hover:border-r-4 hover:border-r-pink-500 hover:bg-opacity-50 font-nunito p-1 rounded-lg hover:rounded-r-lg flex items-center gap-4 transition-all duration-300 ease-in-out">
      <span className="h-5 w-5 hover:text-white text-pink-500 !text-sm">{icon}</span>
      {label}
      </li>
    </Link>
  );
};

export default NavItem;
