import { useCallback, useEffect, useState } from "react";

type GeolocationState =
  | { status: "pending" }
  | { status: "granted"; latitude: number; longitude: number }
  | { status: "denied" };

/**
 * The browser's location. With `requestOnMount`, it asks as soon as the page
 * opens (the events page's "near you" is always shown); `request` asks again,
 * e.g. from a "Use my location" button after a refusal.
 */
export const useGeolocation = ({ requestOnMount = false }: { requestOnMount?: boolean } = {}) => {
  const [state, setState] = useState<GeolocationState>({ status: "pending" });

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      /* Answered asynchronously, like the real lookup, so starting it from an effect never sets state mid-render. */
      void Promise.resolve().then(() => setState({ status: "denied" }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: "granted",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setState({ status: "denied" });
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }, []);

  /* Syncing with the browser's location service: an external system, so an effect is the right tool. */
  useEffect(() => {
    if (requestOnMount) locate();
  }, [locate, requestOnMount]);

  const request = () => {
    setState({ status: "pending" });
    locate();
  };

  return { ...state, request };
};
