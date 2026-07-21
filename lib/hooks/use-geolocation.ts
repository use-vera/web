import { useState } from "react";

type GeolocationState =
  | { status: "pending" }
  | { status: "granted"; latitude: number; longitude: number }
  | { status: "denied" };

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({ status: "pending" });

  const request = () => {
    setState({ status: "pending" });

    if (!navigator.geolocation) {
      setState({ status: "denied" });
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
  };

  return { ...state, request };
};
