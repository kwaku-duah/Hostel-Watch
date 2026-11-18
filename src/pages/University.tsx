import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { Alert, Button, Card, CardContent, Grid, Skeleton, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { getReports } from "../api";
import type { Report } from "../types";
import { ROOMS, cedi, median, roomLabel, toCsv, uniName } from "../utils";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card><CardContent>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>{value}</Typography>
    </CardContent></Card>
  );
}

export default function UniversityPage() {
  const { id = "" } = useParams();
  const [reports, setReports] = useState<Report[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setReports(null);
    getReports(id).then((r) => setReports(r.reports)).catch((e: Error) => setError(e.message));
  }, [id]);

  const prices = useMemo(() => (reports ?? []).map((r) => r.price_per_year), [reports]);
  const byRoom = useMemo(
    () => ROOMS.map((room) => {
      const p = (reports ?? []).filter((r) => r.room_type === room.id).map((r) => r.price_per_year);
      return { room, n: p.length, med: median(p), min: Math.min(...p), max: Math.max(...p) };
    }).filter((x) => x.n > 0),
    [reports],
  );

  function download() {
    const csv = toCsv((reports ?? []).map((r) => ({
      institution: uniName(id), hostel: r.hostel_name, room_type: roomLabel(r.room_type),
      price_per_year_ghs: r.price_per_year, academic_year: r.academic_year, reported_at: r.created_at,
    })));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `hostelwatch-${id}.csv`;
    a.click();
  }

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between" }}>
        <Typography variant="h4">{uniName(id)}</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={download} disabled={!reports?.length}>Download CSV</Button>
          <Button component={RouterLink} to="/report" variant="contained">Report your rent</Button>
        </Stack>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      {!reports && !error && <Skeleton variant="rounded" height={200} />}
      {reports && reports.length === 0 && (
        <Alert severity="info">No reports yet for this institution. Be the first to report.</Alert>
      )}
      {reports && reports.length > 0 && (
        <>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 3 }}><Stat label="Reports" value={String(prices.length)} /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><Stat label="Median per year" value={cedi(median(prices))} /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><Stat label="Lowest" value={cedi(Math.min(...prices))} /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><Stat label="Highest" value={cedi(Math.max(...prices))} /></Grid>
          </Grid>

          <Card><CardContent sx={{ overflowX: "auto" }}>
            <Typography variant="h6" gutterBottom>By room type</Typography>
            <Table size="small">
              <TableHead><TableRow><TableCell>Room</TableCell><TableCell align="right">Reports</TableCell><TableCell align="right">Median</TableCell><TableCell align="right">Min</TableCell><TableCell align="right">Max</TableCell></TableRow></TableHead>
              <TableBody>
                {byRoom.map((x) => (
                  <TableRow key={x.room.id}>
                    <TableCell>{x.room.label}</TableCell><TableCell align="right">{x.n}</TableCell>
                    <TableCell align="right">{cedi(x.med)}</TableCell><TableCell align="right">{cedi(x.min)}</TableCell><TableCell align="right">{cedi(x.max)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>

          <Card><CardContent sx={{ overflowX: "auto" }}>
            <Typography variant="h6" gutterBottom>All reports</Typography>
            <Table size="small">
              <TableHead><TableRow><TableCell>Hostel</TableCell><TableCell>Room</TableCell><TableCell align="right">Per year</TableCell><TableCell>Year</TableCell><TableCell>Comment</TableCell></TableRow></TableHead>
              <TableBody>
                {reports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.hostel_name}</TableCell><TableCell>{roomLabel(r.room_type)}</TableCell>
                    <TableCell align="right">{cedi(r.price_per_year)}</TableCell><TableCell>{r.academic_year}</TableCell>
                    <TableCell sx={{ maxWidth: 320 }}>{r.comment}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </>
      )}
    </Stack>
  );
}
