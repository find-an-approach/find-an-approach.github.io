import ApproachTable from "./ApproachTable";
import ApproachMap from "./ApproachMap";
import {
  AppApproachData,
  Approach,
  convertAnalysisToInitialData,
} from "./Approach";

import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useEffect, useState } from "preact/hooks";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import L from "leaflet";

/** Factor to divide by to convert meters to nautical miles. */
const METERS_PER_KNOT = 1852;

export function App() {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [data, setData] = useState<AppApproachData | null>(null);

  useEffect(() => {
    fetch(RELEASE_URL)
      .then((r) => r.json())
      .then(
        (r) => {
          const data = convertAnalysisToInitialData(r);
          console.log(data);
          setData(data);
          setIsLoaded(true);
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        },
      );
  }, []);

  const [airport, setAirport] = useState("");
  const onAirportChange = (airport: string) => {
    setAirport(airport);
  };

  const [filterDistance, setFilterDistance] = useState(50);
  const onDistanceChange = (distance: number) => {
    setFilterDistance(distance);
  };

  const [filteredApproaches, setFilteredApproaches] = useState<Approach[]>([]);
  // If airport or filter distance changes, update the data we're using.
  useEffect(() => {
    if (!data) {
      return;
    }

    // Check if we the airport name we have is valid.
    const airportUpper = airport.toUpperCase();
    const airportObject = data.airports[airportUpper];
    if (!airportObject) {
      // Nope, just use all the data then.
      setFilteredApproaches(data.approaches);
      return;
    }

    // Ok we have a valid airport name!
    console.log("filter airport", airportObject);

    // Compute distances to each airport.
    const distanceToAirports: { [key: string]: number } = {};
    for (const airportId of Object.keys(data.airports)) {
      const distance = L.CRS.Earth.distance(
        data.airports[airportId].location,
        airportObject.location,
      );
      distanceToAirports[airportId] = distance / METERS_PER_KNOT;
    }

    // Filter to those in range.
    const filtered = data.approaches.filter(
      (a) => distanceToAirports[a.airport] < filterDistance,
    );
    setFilteredApproaches(filtered);

    console.log("filtered", filtered);
  }, [airport, data, filterDistance]);

  // Handle error and loading spinner.
  if (!isLoaded) {
    return (
      <>
        <CssBaseline />
        <CircularProgress />
      </>
    );
  } else if (error || !data) {
    return (
      <>
        <CssBaseline />
        <Alert severity="error">Loading failed. {error}</Alert>
      </>
    );
  }

  return (
    <>
      <CssBaseline />

      {/* Hero and table in one grid */}
      <Grid
        container
        sx={{
          mt: { xs: 5, sm: 10 },
          mb: { xs: 4, sm: 6 },
        }}
      >
        <Grid item xs={12} xl={4}>
          <HeroAndForm
            onAirportChange={onAirportChange}
            onDistanceChange={onDistanceChange}
          />
        </Grid>

        <Grid item xs={12} xl={8} sx={{ pr: 2 }}>
          <ApproachTable data={filteredApproaches} dttpCycleNumber={data.dtpp_cycle_number} />
        </Grid>
      </Grid>

      <ApproachMap dttpCycleNumber={data.dtpp_cycle_number} />
      <Footer />
    </>
  );
}

const RELEASE_URL = import.meta.env.PROD ? 
  "https://find-an-approach.github.io/data/approaches.json" :
  "./approaches.json";

const Footer = () => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "auto",
        backgroundColor: "info.main",
        paddingTop: "0.5rem",
        paddingBottom: "0.5rem",
      }}
    >
      <Container maxWidth="lg">
        <Grid container direction="column" alignItems="center">
          <Typography variant="subtitle1">Find an Approach</Typography>
        </Grid>
      </Container>
    </Box>
  );
};

const HeroAndForm = ({
  onAirportChange,
  onDistanceChange,
}: {
  onAirportChange: (airport: string) => void;
  onDistanceChange: (distance: number) => void;
}) => {
  return (
    <Box>
      <Grid container>
        <Container
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h3" fontWeight={700}>
            Find an Approach
          </Typography>
        </Container>

        <Container
          sx={{
            textAlign: "center",
            pt: { xs: 4, sm: 6 },
          }}
        >
          <FormControl>
            <TextField
              label="Airport"
              placeholder="KATL"
              helperText="Airport to search near"
              onChange={(e: any) => onAirportChange(e.target.value)}
            />
          </FormControl>
          <FormControl sx={{ ml: 1 }} style={{ minWidth: 100 }}>
            <InputLabel id="radius-select-label">Radius</InputLabel>
            <Select
              labelId="radius-select-label"
              label="Radius"
              autoWidth
              defaultValue={50}
              onChange={(e: any) => onDistanceChange(e.target.value)}
            >
              <MenuItem value={25}>25NM</MenuItem>
              <MenuItem default value={50}>
                50NM
              </MenuItem>
              <MenuItem value={100}>100NM</MenuItem>
              <MenuItem value={150}>150NM</MenuItem>
            </Select>
          </FormControl>
        </Container>
      </Grid>
    </Box>
  );
};
