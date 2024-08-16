import ApproachTable from "./ApproachTable";
import ApproachMap, { METERS_PER_KNOT } from "./ApproachMap";
import {
  AppAirportData,
  AppApproachData,
  Approach,
  ApproachTypes,
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
import { useEffect, useMemo, useState } from "preact/hooks";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import GitHubIcon from '@mui/icons-material/GitHub';
import L from "leaflet";
import Chip from "@mui/material/Chip";
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import { PaletteMode } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';


// Detect system dark-mode once.
let defaultTheme: PaletteMode = 'light';
if (window && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  defaultTheme = 'dark';
}

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
          setData(data);
          setIsLoaded(true);
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        },
      );
  }, []);

  const [airportInputState, setAirportInputState] = useState(AirportInputState.Untouched);
  const [airport, setAirport] = useState("");
  const onAirportChange = (airport: string) => {
    setAirport(airport);
  };

  const [filterDistance, setFilterDistance] = useState(50);
  const onDistanceChange = (distance: number) => {
    setFilterDistance(distance);
  };

  const [filteredToAirport, setFilteredToAirport] = useState<AppAirportData | null>(null);

  const [approachTypes, setApproachTypes] = useState<string[]>([...ApproachTypes]);
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

      if (airportUpper.length == 0) {
        setAirportInputState(AirportInputState.Untouched);
      } else {
        setAirportInputState(AirportInputState.AirportNotFound);
      }
      setFilteredToAirport(null);
      return;
    }

    // Ok we have a valid airport name!
    setFilteredToAirport(airportObject);
    //console.log("filter airport", airportObject);

    // Compute distances to each airport.
    const distanceToAirports: { [key: string]: number } = {};
    for (const airportId of Object.keys(data.airports)) {
      const distance = L.CRS.Earth.distance(
        data.airports[airportId].location,
        airportObject.location,
      );

      distanceToAirports[airportId] = distance / METERS_PER_KNOT;
    }

    // Create a set of all approach types from the filtered set. This is used
    // to populate the type filter.
    const newApproachTypes = new Set<string>();

    // Filter to those in range.
    const filtered = data.approaches.filter(
      (a) => distanceToAirports[a.airport] < filterDistance,
    );
    // Add the distance in.
    filtered.forEach(approach => {
      approach.types.forEach(t => newApproachTypes.add(t));
      approach.distance = distanceToAirports[approach.airport]
    });

    const newApproachTypesArray = Array.from(newApproachTypes);
    newApproachTypesArray.sort();

    setApproachTypes(newApproachTypesArray);
    setFilteredApproaches(filtered);
    setAirportInputState(AirportInputState.Valid);
  }, [airport, data, filterDistance]);

  // Used to store approaches filtered within the table.
  const [tableFilteredApproaches, setTableFilteredApproaches] = useState<Approach[]>([]);

  const [mode, setMode] = useState<PaletteMode>(defaultTheme);
  const onDarkModeChange = () => setMode(mode == 'light' ? 'dark' : 'light');
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: mode,
        }
      }),
    [mode]
  );

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
    // Working around a typescript bug with mui ThemeProvider.
    // https://github.com/mui/material-ui/issues/32660
    // @ts-ignore
    <ThemeProvider theme={theme}>
      {/* @ts-ignore */}
      <>
      <CssBaseline />

      {/* Hero and table in one grid */}
      <Grid
        container
        sx={{
          mt: { xs: 3, sm: 6 },
          mb: { xs: 4, sm: 6 },
        }}
      >
        <Grid item xs={12} xl={4}>
          <HeroAndForm
            onAirportChange={onAirportChange}
            onDistanceChange={onDistanceChange}
            onDarkModeChange={onDarkModeChange}
            airportInputState={airportInputState}
          />
        </Grid>

        <Grid item xs={12} xl={8} sx={{ pr: 2 }}>
          <ApproachTable 
            onTableFilteredDataUpdate={(approaches) => setTableFilteredApproaches(approaches)}
            data={filteredApproaches}
            approachTypes={approachTypes}
            dttpCycleNumber={data.dtpp_cycle_number}
            airports={data.airports} />
        </Grid>
      </Grid>

      <ApproachMap
        filterAirport={filteredToAirport}
        filterDistance={filterDistance}
        
        data={tableFilteredApproaches}
        airports={data.airports}
        dttpCycleNumber={data.dtpp_cycle_number} />
      <Footer />
      </>
    </ThemeProvider>
  );
}

const RELEASE_URL = import.meta.env.PROD ? 
  "https://find-an-approach.github.io/data/approaches.json" :
  "./approaches.json";


enum AirportInputState {
  Untouched,
  Valid,
  AirportNotFound,
}

const HeroAndForm = (props: {
  onAirportChange: (airport: string) => void;
  onDistanceChange: (distance: number) => void;
  onDarkModeChange: () => void;
  airportInputState: AirportInputState
}) => {
  const theme = useTheme();
  
  // Set color of airport input text field.
  let airportFieldColor = "primary";
  if (props.airportInputState == AirportInputState.Valid) {
    airportFieldColor = "success";
  } else if (props.airportInputState == AirportInputState.AirportNotFound) {
    airportFieldColor = "warning"
  }

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
          <Typography variant="subtitle2">
            Find and filter FAA instrument approach procedures.
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
              focused={props.airportInputState == AirportInputState.Valid ? true : undefined}
              color={airportFieldColor as any}
              onChange={(e: any) => props.onAirportChange(e.target.value)}
            />
          </FormControl>
          <FormControl sx={{ ml: 1 }} style={{ minWidth: 100 }}>
            <InputLabel id="radius-select-label">Radius</InputLabel>
            <Select
              labelId="radius-select-label"
              label="Radius"
              autoWidth
              defaultValue={50}
              onChange={(e: any) => props.onDistanceChange(e.target.value)}
            >
              <MenuItem value={25}>25NM</MenuItem>
              <MenuItem default value={50}>
                50NM
              </MenuItem>
              <MenuItem value={100}>100NM</MenuItem>
              <MenuItem value={150}>150NM</MenuItem>
              <MenuItem value={250}>250NM</MenuItem>
            </Select>
          </FormControl>

          {/* Dark mode switch */}
          <IconButton sx={{ ml: 1 }} onClick={() => props.onDarkModeChange()} color="inherit" title="Dark/Light mode">
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

        </Container>
      </Grid>
    </Box>
  );
};

const Footer = () => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "auto",
        backgroundColor: "palette.secondary.light",
        paddingTop: "0.5rem",
        paddingBottom: "0.5rem",
      }}
    >
      <Container maxWidth="lg">
        <Grid container direction="column" alignItems="center">
          <a href="https://github.com/find-an-approach/find-an-approach.github.io">
            <Chip color="success" icon={<GitHubIcon />} label="Find an Approach" />
          </a>

          <Typography color="primary" variant="subtitle2">
            Strictly for informational purposes. Do not use this for navigation and always verify data from official sources.
          </Typography>

          <Typography variant="caption">
            Thanks to <Link href="https://vfrmap.com/about.html">VFRMap</Link> for the high quality tilesets.
            Also see <Link href="https://inthesoup.xyz/">inthesoup.xyz</Link> for finding approaches near minimums, another cool instrument approach site.
          </Typography>
        </Grid>
      </Container>
    </Box>
  );
};
