import { Routes, Route, Link as RouterLink } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Container, Box } from "@mui/material";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import Home from "./pages/Home";
import Submit from "./pages/Submit";
import UniversityPage from "./pages/University";

export default function App() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Toolbar>
          <HomeWorkIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, fontWeight: 800, color: "text.primary", textDecoration: "none" }}>
            HostelWatch Ghana
          </Typography>
          <Button component={RouterLink} to="/report" variant="contained">Report your rent</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report" element={<Submit />} />
          <Route path="/u/:id" element={<UniversityPage />} />
        </Routes>
      </Container>
      <Box component="footer" sx={{ py: 3, textAlign: "center", color: "text.secondary", fontSize: 13 }}>
        All figures are anonymous and student-reported. Comments are moderated before they appear.
      </Box>
    </Box>
  );
}
