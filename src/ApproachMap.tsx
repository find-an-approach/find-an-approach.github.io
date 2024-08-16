import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { AirportsMap, AppAirportData, Approach, ApproachTypeString } from "./Approach";
import { useMemo, useState } from "preact/hooks";
import { Map } from "leaflet";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import Stack from "@mui/material/Stack";
import { APPROACH_TYPE_TO_APPEARANCE } from "./ApproachTable";
import Chip from "@mui/material/Chip";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import { createTheme, ThemeProvider } from "@mui/material/styles";

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

  const airportsWithApproaches: {[key: string]: Approach[]} = {};
  for (const approach of props.data) {
    const approaches = airportsWithApproaches[approach.airport] || [];
    approaches.push(approach);
    airportsWithApproaches[approach.airport] = approaches;
  }
  // Markers for first 450 airports. For now we only do 450 for performance of
  // the map.
  const markers = [];
  for (const airport of Object.keys(airportsWithApproaches).slice(0, 450)) {
    const approaches = airportsWithApproaches[airport];
    const airportObj = props.airports[airport];

    // Show badges for the types of approaches to each runway at the airport.
    const approachTypesPerRunway: {[key: string]: Set<ApproachTypeString>} = {}
    for (const approach of approaches) {
      // Use empty string for approaches not a particular runway.
      const runwayName = approach.runway || "";

      const approachTypes = approachTypesPerRunway[runwayName] || new Set();
      approach.types.forEach(type => approachTypes.add(type as ApproachTypeString));
      approachTypesPerRunway[runwayName] = approachTypes;
    }
    const runwayNames = Object.keys(approachTypesPerRunway);
    runwayNames.sort();

    markers.push(<Marker key={airport} position={airportObj.location}>
      <Popup>
        <Typography variant="button">{airport}</Typography>
        <List>
          {runwayNames.map((runway) => {
            const types = Array.from(approachTypesPerRunway[runway]);
            types.sort();

            return <>
              {runway &&
                <Divider sx={{ borderColor: "black" }} variant="middle" component="li">
                  {runway}
                </Divider>
              }
              <ListItem>
                  <Stack direction="row" spacing={0.5}>
                  {types.map((type) => {
                    const appearance = APPROACH_TYPE_TO_APPEARANCE[type] || {};
                    return <Chip size="small" label={type} {...appearance} />;
                  })}
                </Stack>
              </ListItem>
            </>
          })}
        </List>
      </Popup>
    </Marker>)
  }

  // Always use light theme here because the popups are light colored.
  const lightTheme = createTheme({palette: {mode: 'light'}});

  return (
    // Working around a typescript bug with mui ThemeProvider.
    // https://github.com/mui/material-ui/issues/32660
    // @ts-ignore
    <ThemeProvider theme={lightTheme}>
      {/* @ts-ignore */}
      <>
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
        {markers}
      </MapContainer>
      </>
    </ThemeProvider>
  );
}
