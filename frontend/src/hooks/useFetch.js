import { useState, useEffect, useCallback } from "react";

const useFetch = (fetchDataFunction) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const result = await fetchDataFunction();
      setData(result);
    } catch (err) {
      //alert(err);
      setError(`Failed to fetch ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [fetchDataFunction]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  return { data, error, loading };
};

export default useFetch;
