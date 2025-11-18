import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { AppContext } from "../context/AppContext";
const Navbar = () => {
  const { openSignIn, signOut } = useClerk();
  const { user } = useUser();
  const navigate = useNavigate();
  const { setShowRecruiterLogin } = useContext(AppContext);
  return (
    <div className="shadow py-4">
      <div className="container px-4 2xl:px-20 mx-auto flex justify-between items-center">
        <img
          onClick={() => navigate("/")}
          className="cursor-pointer"
          src={assets.logo}
        />
        {user ? (
          <div className="flex items-center gap-3 text-sm sm:text-base">
            <Link className="hidden sm:block" to={"/applications"}>
              Applied Jobs
            </Link>
            <p className="hidden sm:block">|</p>
            <p className="hidden sm:block">
              Hi, {user.firstName + " " + user.lastName}
            </p>
            <UserButton afterSignOutUrl="/" />
            <button
              className="sm:hidden bg-blue-600 text-white px-4 py-2 rounded-full cursor-pointer"
              onClick={() => signOut({ redirectUrl: "/" })}
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-4 max-sm:text-xs">
            <button
              onClick={(e) => setShowRecruiterLogin(true)}
              className="text-gray-600 cursor-pointer"
            >
              Recruiter Login
            </button>
            <button
              onClick={(e) => openSignIn()}
              className="bg-blue-600 text-white px-6 sm:px-9 py-2 rounded-full cursor-pointer"
            >
              Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
