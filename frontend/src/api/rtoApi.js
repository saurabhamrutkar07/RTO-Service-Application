import baseUrl from "../config";

// fetch state
export const fetchState = async () => {
  const response = await fetch(`${baseUrl}/states`);
  const data = await response.json();
  return data;
};

// fetch district by state

export const fetchDistrict = async (state) => {
  const response = await fetch(`${baseUrl}/state-districts/${state}`);
  const data = await response.json();
  return data;
};

// Fetch Alphabates

export const fetchAlphabates = async () => {
  const response = await fetch(`${baseUrl}/alphabate-options`);
  const data = await response.json();
  return data;
};

// Generate RTO Code

export const generateRtoCode = async (state, district, alphabate) => {
  const response = await fetch(
    `${baseUrl}/generate_rto_code/${state}/${district}/${alphabate}`
  );
  console.log(
    "This is generate rto",
    `${baseUrl}/generate_rto_code/${state}/${district}/${alphabate}`
  );
  const data = await response.json();
  return data;
};

// Fetch RTO details

export const fecthRTODetails = async (rtoCode) => {
  const response = await fetch(`${baseUrl}/rto/?rto_code=${rtoCode}`);
  const data = await response.json(); // response.text() as per chatgept suggestion
  return data;
};
