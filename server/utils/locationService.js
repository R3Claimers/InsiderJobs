import axios from "axios";
import he from "he";
const GEONAMES_USERNAME = process.env.GEONAMES_USERNAME || "demo";

export const searchCities = async (query) => {
  try {
    if (!query || query.length < 2) {
      return [];
    }

    const response = await axios.get("http://api.geonames.org/searchJSON", {
      params: {
        name_startsWith: query, // better prefix matching
        maxRows: 20,
        featureClass: "P",
        username: GEONAMES_USERNAME,
        orderby: "relevance",
        style: "FULL",
      },
    });

    if (response.data && response.data.geonames) {
      return response.data.geonames.map((city) => ({
        name: city.name ? he.decode(city.name) : "",
        state: city.adminName1 ? he.decode(city.adminName1) : "",
        country: city.countryName ? he.decode(city.countryName) : "",
        display: `${city.name ? he.decode(city.name) : ""}${
          city.adminName1 ? ", " + he.decode(city.adminName1) : ""
        }`,
      }));
    }

    return [];
  } catch (error) {
    console.error("Error fetching cities:", error.message);
    return [];
  }
};
