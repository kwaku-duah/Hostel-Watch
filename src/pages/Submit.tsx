import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Alert, Autocomplete, Button, Card, CardContent, Checkbox, FormControlLabel, InputAdornment, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { Turnstile } from "@marsidev/react-turnstile";
import { submitReport } from "../api";
import { ROOMS, UNIS, currentAcademicYear } from "../utils";
import type { University } from "../types";

const SITEKEY = import.meta.env.VITE_TURNSTILE_SITEKEY as string;

export default function Submit() {
  const [uni, setUni] = useState<University | null>(null);
  const [hostel, setHostel] = useState("");
  const [room, setRoom] = useState("");
  const [price, setPrice] = useState("");
  const [year, setYear] = useState(currentAcademicYear());
  const [comment, setComment] = useState("");
  const [sign, setSign] = useState(true);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [doneUni, setDoneUni] = useState("");

  const ready = uni && hostel.trim().length > 1 && room && Number(price) > 0 && token && sign;

  async function onSubmit() {
    if (!uni) return;
    setBusy(true); setError("");
    try {
      await submitReport({
        universityId: uni.id, hostelName: hostel, roomType: room, pricePerYear: Number(price),
        academicYear: year, comment: comment.trim() || undefined, turnstileToken: token,
      });
      setDoneUni(uni.id);
    } catch (e) {
      setError((e as Error).message);
      setToken("");
    } finally { setBusy(false); }
  }

  if (doneUni)
    return (
      <Card><CardContent>
        <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
          <Typography variant="h4">Thank you. You have signed. ✅</Typography>
          <Typography color="text.secondary">Your report is now public (anonymously). Share this with your hall mates so the numbers grow.</Typography>
          <Stack direction="row" spacing={2}>
            <Button component={RouterLink} to={`/u/${doneUni}`} variant="contained">See your campus</Button>
            <Button component={RouterLink} to="/report" onClick={() => setDoneUni("")}>Add another room type</Button>
          </Stack>
        </Stack>
      </CardContent></Card>
    );

  return (
    <Card sx={{ maxWidth: 640, mx: "auto" }}>
      <CardContent>
        <Stack spacing={2.5}>
          <Typography variant="h4">Report your hostel rent</Typography>
          <Autocomplete
            options={UNIS} getOptionLabel={(u) => u.name} value={uni} onChange={(_, v) => setUni(v)}
            renderInput={(p) => <TextField {...p} label="Institution" required />}
          />
          <TextField label="Hostel name" value={hostel} onChange={(e) => setHostel(e.target.value)} required slotProps={{ htmlInput: { maxLength: 80 } }} />
          <TextField select label="Room type" value={room} onChange={(e) => setRoom(e.target.value)} required>
            {ROOMS.map((r) => <MenuItem key={r.id} value={r.id}>{r.label}</MenuItem>)}
          </TextField>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Price per year" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required fullWidth
              slotProps={{ input: { startAdornment: <InputAdornment position="start">GH₵</InputAdornment> }, htmlInput: { min: 200, max: 200000 } }}
            />
            <TextField label="Academic year" value={year} onChange={(e) => setYear(e.target.value)} helperText="e.g. 2025/2026" fullWidth />
          </Stack>
          <TextField
            label="What's going on? (optional)" value={comment} onChange={(e) => setComment(e.target.value)} multiline minRows={3}
            helperText="Facts only: what's included, mid-year increases, advance demands. Comments are reviewed before they show."
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />
          <FormControlLabel
            control={<Checkbox checked={sign} onChange={(e) => setSign(e.target.checked)} />}
            label="I sign the petition asking the President to investigate student hostel prices"
          />
          <Turnstile siteKey={SITEKEY} onSuccess={setToken} onExpire={() => setToken("")} />
          {error && <Alert severity="error">{error}</Alert>}
          <Button size="large" variant="contained" disabled={!ready || busy} onClick={onSubmit}>
            {busy ? "Submitting..." : "Submit and sign"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
