import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#006b3f" },
    secondary: { main: "#fcd116", contrastText: "#1a1a1a" },
    error: { main: "#ce1126" },
    background: { default: "#f6f7f4", paper: "#ffffff" },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Inter", "Roboto", system-ui, sans-serif',
    h2: { fontWeight: 800, letterSpacing: -1 },
    h4: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCard: { defaultProps: { variant: "outlined" } },
    MuiButton: { defaultProps: { disableElevation: true } },
  },
});
