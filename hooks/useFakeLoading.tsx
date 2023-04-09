import { useState, useEffect } from "react";

function useFakeLoading(): [boolean, () => void] {
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (loading) {
      timeoutId = setTimeout(() => setLoading(false), 3000);
    }
    return () => clearTimeout(timeoutId);
  }, [loading]);

  function startLoading() {
    setLoading(true);
  }

  return [loading, startLoading];
}

export default useFakeLoading;
