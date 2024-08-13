import ApproachTable from './ApproachTable'
import ApproachMap from './ApproachMap'

import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';


export function App() {
  return (
    <>
      <CssBaseline />

      {/* Hero and table in one grid */}
      <Grid container sx={{
        mt: { xs: 5, sm: 10 },
        mb: { xs: 4, sm: 6 },
      }}>
        <Grid item xs={12} xl={4}>
          <Hero />
        </Grid>

        <Grid item xs={12} xl={8} sx={{pr: 2}}>
          <ApproachTable></ApproachTable>
        </Grid>
      </Grid>

      <ApproachMap></ApproachMap>
      <Footer />
    </>
  )
}

const Footer = () => {
  return <Box
    sx={{
      width: "100%",
      height: "auto",
      backgroundColor: "info.main",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem",
    }}>
    <Container maxWidth="lg">
      <Grid container direction="column" alignItems="center">
        <Typography variant="subtitle1">Find an Approach</Typography>
      </Grid>
    </Container>
  </Box>
}

const Hero = () => {
  return <Box>
    <Grid container>
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant='h3' fontWeight={700}>
          Find an Approach
        </Typography>
      </Container>

      <Container
        sx={{
          textAlign: 'center',
          pt: { xs: 4, sm: 6 },
        }}
      >
        <FormControl>
          <TextField
            label="Airport"
            placeholder="KATL"
            helperText="Airport to search near"
          />
        </FormControl>
        <FormControl sx={{ ml: 1 }} style={{ minWidth: 100 }}>
          <InputLabel id="radius-select-label">Radius</InputLabel>
          <Select
            labelId="radius-select-label"
            label="Radius"
            autoWidth
            defaultValue={50}
          >
            <MenuItem value={25}>25NM</MenuItem>
            <MenuItem default value={50}>50NM</MenuItem>
            <MenuItem value={100}>100NM</MenuItem>
            <MenuItem value={150}>150NM</MenuItem>
          </Select>
        </FormControl>
      </Container>
    </Grid>
  </Box>
}
