import React, { useContext } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { useEffect } from "react";
const Dashboard = () => {
  const navigate = useNavigate();

  const { companyData, setCompanyData, setCompanyToken } =
    useContext(AppContext);

  // Function to logout for company
  const logout = () => {
    setCompanyToken(null);
    localStorage.removeItem("companyToken");
    setCompanyData(null);
    navigate("/");
  };
  useEffect(() => {
    if (companyData) {
      navigate("/dashboard/manage-jobs");
    }
  }, [companyData]);
  return (
    <div className="min-h-screen">
      {/* Navbar for Recruiter Panel */}
      <div className="shadow py-4">
        <div className="px-5 flex justify-between items-center">
          <img
            onClick={(e) => navigate("/")}
            className="max-sm:w-32 cursor-pointer"
            src={assets.logo}
            alt=""
          />
          {companyData && (
            <div className="flex items-center gap-3">
              <p className="hidden sm:block">Welcome, {companyData.name}</p>
              <div className="relative group hidden sm:block">
                <img
                  className="w-8 border border-gray-200 rounded-full"
                  src={companyData.image}
                  alt=""
                />
                <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-12">
                  <ul className="list-none m-1.5 p-2 bg-blue-200 text-blue-600 rounded-md border border-gray-200 text-sm">
                    <li
                      className="py-1 px-2 cursor-pointer pr-10"
                      onClick={logout}
                    >
                      Logout
                    </li>
                  </ul>
                </div>
              </div>
              <button
                className="sm:hidden bg-blue-600 text-white px-4 py-2 rounded-full cursor-pointer"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start w-full">
        {/* Left Slidebar with options to add job , manage job , view job */}
        <div className="w-full sm:w-64 sm:min-h-screen border-b-2 sm:border-b-0 sm:border-r-2 border-gray-200 bg-white">
          <ul className="flex sm:flex-col items-center sm:items-start justify-between sm:justify-start pt-3 sm:pt-5 text-gray-800 gap-2 sm:gap-0 px-2 sm:px-0">
            <NavLink
              className={({ isActive }) =>
                `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${
                  isActive &&
                  "bg-blue-100 border-l-0 sm:border-r-4 border-blue-500 "
                }`
              }
              to={"/dashboard/add-job"}
            >
              <img className="min-w-4" src={assets.add_icon} alt="" />
              <p className="hidden sm:block">Add Job</p>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${
                  isActive &&
                  "bg-blue-100 border-l-0 sm:border-r-4 border-blue-500 "
                }`
              }
              to={"/dashboard/manage-jobs"}
            >
              <img className="min-w-4" src={assets.home_icon} alt="" />
              <p className="hidden sm:block">Manage Jobs</p>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${
                  isActive &&
                  "bg-blue-100 border-l-0 sm:border-r-4 border-blue-500 "
                }`
              }
              to={"/dashboard/view-applications"}
            >
              <img className="min-w-4" src={assets.person_tick_icon} alt="" />
              <p className="hidden sm:block">View Applications</p>
            </NavLink>
          </ul>
        </div>
        <div className="flex-1 h-full p-2 sm:p-5 w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
