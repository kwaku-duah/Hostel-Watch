import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Alert, Box, Button, Card, CardActionArea, CardContent, Chip, Grid, Paper, Skeleton, Stack, TextField, Typography } from "@mui/material";
import { getSummary } from "../api";
import type { Summary } from "../types";
import { UNIS, cedi } from "../utils";

export default function Home() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => { getSummary().then(setSummary).catch((e: Error) => setError(e.message)); }, []);

  const stats = useMemo(() => new Map(summary?.universities.map((u) => [u.university_id, u])), [summary]);
  const list = useMemo(
    () => UNIS.filter((u) => u.name.toLowerCase().includes(q.toLowerCase())),
    [q],
  );

  return (
    <Stack spacing={5}>
      <Paper sx={{ p: { xs: 3, md: 6 }, bgcolor: "primary.main", color: "white", borderRadius: 4 }}>
        <Typography variant="h2" sx={{ fontSize: { xs: 34, md: 56 } }}>
          What are you really paying for your hostel?
        </Typography>
        <Typography sx={{ mt: 2, maxWidth: 720, opacity: 0.92, fontSize: 18 }}>
          Report your room type and yearly price in under a minute. Every report is public, anonymous,
          and counts as your signature on a petition asking the President to investigate student hostel prices.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ mt: 4, alignItems: { sm: "center" } }}>
          <Button component={RouterLink} to="/report" size="large" variant="contained" color="secondary">
            Report my rent and sign
          </Button>
          <Box>
            {summary ? (
              <Typography variant="h4">{summary.total.toLocaleString()} <Typography component="span">students have reported</Typography></Typography>
            ) : <Skeleton width={260} height={44} sx={{ bgcolor: "rgba(255,255,255,.3)" }} />}
          </Box>
        </Stack>
      </Paper>

      <Card sx={{ bgcolor: "#fffbe6" }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>The petition</Typography>
          <Typography color="text.secondary">
            We, students of Ghana's tertiary institutions, ask His Excellency the President to direct the Rent Control
            Department, the Ministry of Education and GTEC to investigate hostel charges, using the
            student-reported prices published on this site, and to act on charges that break the Rent Act.
            Please report only what you actually pay.
          </Typography>
        </CardContent>
      </Card>

      {error && <Alert severity="warning">Could not load live counts: {error}</Alert>}

      <Box>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2, justifyContent: "space-between" }}>
          <Typography variant="h4">Browse by institution</Typography>
          <TextField size="small" label="Search institution" value={q} onChange={(e) => setQ(e.target.value)} />
        </Stack>
        <Grid container spacing={2}>
          {list.map((u) => {
            const s = stats.get(u.id);
            return (
              <Grid key={u.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card sx={{ height: "100%" }}>
                  <CardActionArea component={RouterLink} to={`/u/${u.id}`} sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography sx={{ fontWeight: 700 }}>{u.name}</Typography>
                      <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 1.5, flexWrap: "wrap" }}>
                        <Chip size="small" label={`${s?.reports ?? 0} reports`} color={s ? "primary" : "default"} />
                        {s && <Chip size="small" variant="outlined" label={`avg ${cedi(s.avg_price)}/yr`} />}
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Stack>
  );
}
