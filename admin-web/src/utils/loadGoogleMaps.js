const GOOGLE_MAPS_SCRIPT_ID = "google-maps-sdk";
const GOOGLE_MAPS_BASE_URL = "https://maps.googleapis.com/maps/api/js";

let loadingPromise = null;

const buildGoogleMapsUrl = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8";
  const params = new URLSearchParams({
    key: apiKey,
    libraries: "places",
    loading: "async",
    v: "weekly",
  });
  return `${GOOGLE_MAPS_BASE_URL}?${params.toString()}`;
};

export function loadGoogleMaps() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only be loaded in the browser"));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);

    if (existingScript) {
      if (existingScript.getAttribute("data-google-maps-loaded") === "true") {
        resolve(window.google);
        return;
      }

      existingScript.addEventListener("load", () => resolve(window.google));
      existingScript.addEventListener("error", () => reject(new Error("Google Maps failed to load")));
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = buildGoogleMapsUrl();
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.maps) {
        script.setAttribute("data-google-maps-loaded", "true");
        resolve(window.google);
      } else {
        reject(new Error("Google Maps failed to initialise"));
      }
    };
    script.onerror = () => reject(new Error("Google Maps failed to load"));

    document.head.appendChild(script);
  });

  return loadingPromise;
}
