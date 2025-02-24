import React, { useState } from "react";
import useFetch from "../hooks/useFetch";
import {
  fetchState,
  fetchDistrict,
  fetchAlphabates,
  generateRtoCode,
} from "../api/rtoApi";

import Result from "./Result";

const RtoForm = () => {
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedAlphabate, setSelectedAlphabat] = useState("");
  const [districts, setDistricts] = useState([]);
  const [result, setResult] = useState("");

  const {
    data: states,
    loading: loadingStates,
    error: errorStates,
  } = useFetch(fetchState);
  const {
    data: alphabates,
    loading: loadingAlphabates,
    error: errorAlphabates,
  } = useFetch(fetchAlphabates);

  const handleStateChange = async (e) => {
    const state = e.target.value;
    setSelectedState(state);
    if (state) {
      console.log(state);
      const fetchDistricts = await fetchDistrict(state);
      setDistricts(fetchDistricts);
      setSelectedDistrict(fetchDistricts[0]?.Place || ""); // Optionally select the first district
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const rtoCode = await generateRtoCode(
        selectedState,
        selectedDistrict,
        selectedAlphabate
      );
      setResult(rtoCode);
    } catch (error) {
      setResult("Error : " + error.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-lg mt-8">
      {/* Heading */}
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
        Generate Your RTO Code
      </h2>

      <form onSubmit={handleSubmit}>
        {/* State Selection */}
        <div className="mb-6">
          <label className="block text-lg font-semibold text-grey-700 mb-2">
            State:
          </label>

          <select
            className="w-full p-3 border border-grey-300 rounded-md"
            value={selectedState}
            onChange={handleStateChange}
          >
            <option value="">Select a state</option>
            {loadingStates ? (
              <option>Loading State...</option>
            ) : errorStates ? (
              <option>{errorStates}</option>
            ) : (
              states?.map((stateObject, index) => {
                const stateKey = Object.keys(stateObject)[0]; // Get the key (state code)
                const stateName = stateObject[stateKey]; // Get the value (state name)
                return (
                  <option key={stateKey} value={stateName}>
                    {stateName}
                  </option>
                );
              })
            )}
          </select>
        </div>

        {/* District Selection */}
        <div className="mb-6">
          <label className="block text-lg font-semibold text-grey-700 mb-2">
            District:
          </label>

          <select
            className="w-full p-3 border border-grey-300 rounded-md"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            disabled={!selectedState}
          >
            <option value="">Select a District</option>
            {districts.length === 0 ? (
              <option value="">Select a District</option>
            ) : (
              districts?.map((district, index) => (
                <option key={index} value={district.Place}>
                  {district.Place}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Alphabate Selection */}
        <div className="mb-6">
          <label className="block text-lg font-semibold text-grey-700 mb-2">
            Alphabate:
          </label>
          <select
            className="w-full p-3 border border-grey-300 rounded-md"
            value={selectedAlphabate}
            onChange={(e) => setSelectedAlphabat(e.target.value)}
            disabled={!selectedState || !selectedDistrict}
          >
            <option value="">Select a Series</option>
            {loadingAlphabates ? (
              <option>Loading Series....</option>
            ) : errorAlphabates ? (
              <option>{errorAlphabates}</option>
            ) : (
              alphabates?.map((alphabate) => (
                <option key={alphabate} value={alphabate}>
                  {alphabate}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full p-3 bg-blue-700 text-white rounded-md font-semibold hover:bg-blue-800"
            disabled={!selectedState || !selectedDistrict || !selectedAlphabate}
          >
            Generate RTO Code
          </button>
        </div>
      </form>
      <Result result={result} />
    </div>
  );
};

export default RtoForm;
