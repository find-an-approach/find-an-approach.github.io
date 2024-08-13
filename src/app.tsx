import ApproachTable from './ApproachTable'
import ApproachMap from './ApproachMap'

import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';


const Footer = () => {
  return <Box
    sx={{
      width: "100%",
      height: "auto",
      backgroundColor: "info.main",
      paddingTop: "1rem",
      paddingBottom: "1rem",
    }}>
      <Container maxWidth="lg">
        <Grid container direction="column" alignItems="center">
          <Typography variant="subtitle1">Find an Approach</Typography>
        </Grid>
      </Container>
    </Box>
}

export function App() {
  return (
    <>
        <CssBaseline />
        <ApproachTable></ApproachTable>
        <ApproachMap></ApproachMap>
        <Footer/>
    </>
  )
}
