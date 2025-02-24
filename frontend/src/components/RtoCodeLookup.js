import { useState, useEffect } from "react";
// import { fecthRTODetails } from "../api/rtoApi"; // Your existing API function
import baseUrl from "../config";
import { FaMapMarkerAlt, FaRegFlag, FaCode } from "react-icons/fa"; // Importing icons

const RtoCodeLookup = () => {
  const [rtoCode, setRtoCode] = useState(""); // State for RTO code input
  const [rtoDetialsLoading, setRTODetailsLoading] = useState(false); // Loading state
  const [rtoDetialsError, setRTODetailsError] = useState(""); // Error state
  const [rtoDetailsData, setRTODetailsData] = useState([]); // State to store fetched data

  // Flag to trigger the API call when button is clicked
  const [triggerFetch, setTriggerFetch] = useState(false);

  const fetchRTODetailsData = (rtoCode) => {
    if (!rtoCode) return;

    setRTODetailsLoading(true); // Set loading to true when API is called
    setRTODetailsError(""); // Clear any previous errors
    setRTODetailsData([]); // Clear any previous data

    fetch(`${baseUrl}/rto/?rto_code=${rtoCode}`)
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            if (data.detail && data.detail[0] && data.detail[0].msg) {
              setRTODetailsError(data.detail[0].msg);
              //alert(data.detail[0].msg);
            } else {
              setRTODetailsError(
                "Failed to fetch RTO details. Please try again."
              );
            }
            setRTODetailsData([]);
            throw new Error("API call failed");
          });
        }

        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setRTODetailsData(data.data);
        } else {
          setRTODetailsData([]);
        }
      })
      .catch((error) => {
        console.error("Error in API call:", error);
      })
      .finally(() => {
        setRTODetailsLoading(false); // Set loading to false after the request is finished
      });
  };

  useEffect(() => {
    if (triggerFetch) {
      fetchRTODetailsData(rtoCode);
      setTriggerFetch(false);
    }
  }, [triggerFetch, rtoCode]);

  const handleSubmit = () => {
    if (rtoCode) {
      setTriggerFetch(true); // Set triggerFetch to true to initiate API call
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-5">
      <div className="bg-white p-10 rounded-lg shadow-xl w-full max-w-md animate-fadeIn">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center tracking-wide uppercase">
          RTO Code Lookup
        </h1>
        <div className="mb-6">
          <label
            htmlFor="rto-code"
            className="text-lg text-gray-700 mb-2 block"
          >
            Enter RTO Code:
          </label>
          <input
            type="text"
            id="rto-code"
            placeholder="Enter RTO Code"
            value={rtoCode}
            onChange={(e) => setRtoCode(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500 mb-4"
          />
          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-blue-600 text-white text-lg rounded-md transition-all duration-300 hover:bg-blue-700 transform hover:translate-y-1"
          >
            Submit
          </button>
        </div>

        {/* Loading Spinner */}
        {rtoDetialsLoading && (
          <div className="text-lg text-blue-500 font-bold text-center py-4">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-transparent border-blue-500"></div>
            <p>Loading...</p>
          </div>
        )}

        {/* Error Message */}
        {rtoDetialsError && (
          <div className="text-lg text-red-500 mt-5 bg-red-100 border-l-4 border-red-500 p-4 rounded-md">
            <strong>Error:</strong> {rtoDetialsError}
          </div>
        )}

        {/* Results Section */}
        {rtoDetailsData.length > 0 && (
          <div className="mt-6">
            {rtoDetailsData.map((item, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md mb-4 transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105"
              >
                <h3 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-blue-500" />
                  {item.Place}
                </h3>
                <div className="flex items-center text-md text-gray-600 mb-2">
                  <FaRegFlag className="mr-2 text-green-500" />
                  <span>State: {item.State}</span>
                </div>
                <div className="flex items-center text-md text-gray-600">
                  <FaCode className="mr-2 text-orange-500" />
                  <span>RTO Code: {item.RTOCode}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {rtoDetailsData.length === 0 &&
          !rtoDetialsLoading &&
          !rtoDetialsError && (
            <div className="text-lg text-gray-500 text-center mt-5">
              <p>No RTO details found. Please try again with a valid code.</p>
              <b className="text-red-600">only enter RTO code like MH01</b>
            </div>
          )}
      </div>
    </div>
  );
};

export default RtoCodeLookup;
