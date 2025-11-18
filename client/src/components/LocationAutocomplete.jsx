import React, { useState, useEffect, useRef } from "react";
import { assets } from "../assets/assets";

const LocationAutocomplete = ({
  value,
  onChange,
  placeholder = "Select location",
  className = "",
  inputClassName = "",
}) => {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const skipNextFetchRef = useRef(false);
  const wrapperRef = useRef(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      if (skipNextFetchRef.current) {
        skipNextFetchRef.current = false;
        return;
      }

      if (query.length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      setIsOpen(true);
      try {
        const response = await fetch(
          `${backendUrl}/api/users/locations?query=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        if (data.success) {
          setSuggestions(data.cities);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchLocations, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);
    if (newValue.length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
    onChange(newValue);
  };

  const handleSelect = (location) => {
    // If this value is already selected, just close and do nothing else
    if (location.display === query) {
      setIsOpen(false);
      setSuggestions([]);
      return;
    }

    // Prevent immediate refetch on this selection
    skipNextFetchRef.current = true;
    setQuery(location.display);
    onChange(location.display);
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className={`relative flex items-center ${className}`}>
      <img className="h-4 sm:h-5" src={assets.location_icon} />
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        className={`max-sm:text-xs p-2 rounded outline-none w-full ${inputClassName}`}
      />

      {isOpen && (suggestions.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 z-50 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto text-gray-600">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-500">Loading...</div>
          ) : (
            suggestions.map((location, index) => (
              <div
                key={index}
                onClick={() => handleSelect(location)}
                className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-800">{location.name}</div>
                {location.state && (
                  <div className="text-xs text-gray-500">
                    {location.state}, {location.country}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
