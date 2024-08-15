import { Circle, MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { AirportsMap, AppAirportData, Approach } from "./Approach";
import { useMemo, useState } from "preact/hooks";
import { Map } from "leaflet";

/** Factor to divide by to convert meters to nautical miles. */
export const METERS_PER_KNOT = 1852;

// Centered over KATL.
const DEFAULT_MAP_LOCATION: [number, number] = [33.63, -84.42];

export default function ApproachMap(props: {
  dttpCycleNumber: string;
  data: Approach[];
  airports: AirportsMap;
  filterAirport: AppAirportData | null;
  filterDistance: number;
}) {
  // vfrmap uses the full year in the cycle, so 20240711, therefore we
  // prefix a 20. Hopefully no one is using this in the year 3000 :)
  const tileUrl = useMemo(
    () =>
      `https://vfrmap.com/20${props.dttpCycleNumber}/tiles/vfrc/{z}/{y}/{x}.jpg`,
    [props.dttpCycleNumber],
  );

  const [map, setMap] = useState<Map | null>(null);

  useMemo(() => {
    if (!props.filterAirport || !map) {
        return;
    }
    map.setView(props.filterAirport.location, 10);
  }, [props.filterAirport, map])

  // Check if there is an airport we are filtering to.
  let filterCircle = <></>;
  if (props.filterAirport) {
    filterCircle = <Circle
        color="green"
        center={props.filterAirport.location}
        radius={props.filterDistance * METERS_PER_KNOT} 
    />;
  }

  return (
    <MapContainer
      style={{ height: "65vh", minHeight: "300px" }}
      center={DEFAULT_MAP_LOCATION}
      zoom={10}
      ref={setMap}
    >
      <TileLayer
        attribution='&copy; <a href="https://vfrmap.com/about.html">VFRMap</a>'
        url={tileUrl}
        tms={true}
      />
      {filterCircle}
    </MapContainer>
  );
}
