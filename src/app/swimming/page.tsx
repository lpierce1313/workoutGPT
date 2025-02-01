"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, FormControl, InputLabel, ListItemIcon, ListItemText, MenuItem, Select, Slider, Typography, SelectChangeEvent, Card, CardContent, Checkbox, FormControlLabel, FormGroup, TextField, Alert, Snackbar, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { VscDash } from "react-icons/vsc";
import { FaCheck, FaClock, FaDumbbell, FaHeartbeat } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';
import isEqual from 'lodash/isEqual';
import { SwimResponse, SwimSegment } from '@/app/api/generateSwim/route';
import { Divider } from '@mui/material';

const swimStrokes = ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly'];
const swimStyles = ['Sprint', 'Distance', 'Interval'];

const DEFAULT_SWIM = {
  swimStrokes: [] as string[],
  swimStyles: [] as string[],
  intensity: 7,
  duration: 5,
  additionalInfo: '',
  injuries: '',
};

const DEFAULT_SWIM_NAME = 'My Swim';

const SwimSegmentList = ({ swim, index }: { swim: SwimSegment; index: number}) => {
  return (
    <>
      <Grid size={{ xs: 12 }} key={index}>
        <Box display="flex" flexDirection="column" alignItems="flex-start">
          <Box display="flex" alignItems="center">
            <VscDash style={{ marginRight: 8, fontSize: 24, flexShrink: 0 }} />
            <Typography>
              {swim.sets} x {swim.length} {swim.swimOption} - {swim.description} {swim.restDuration > 0 && (<>Take {swim.restDuration} seconds per set</>)}
            </Typography>
          </Box>
        </Box>
      </Grid>
    </>
  );
};

const WorkoutForm: React.FC = () => {

  // Consistent interface for generating workout plans
  const { theme } = useTheme();
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [showAnyInjuries, setShowAnyInjuries] = useState(false);
  const [routineName, setRoutineName] = useState(DEFAULT_SWIM_NAME);
  const [hasChanged, setHasChanged] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form for specific workout type
  const [swimWorkout, setSwimWorkout] = useState<typeof DEFAULT_SWIM>(DEFAULT_SWIM);
  const [swimResponse, setSwimResponse] = useState<SwimResponse | null>(null);

  const handleReset = useCallback(() => {
    setShowAdditionalInfo(false);
    setShowAnyInjuries(false);
    setRoutineName(DEFAULT_SWIM_NAME);
    setSwimResponse(null);

    setSwimWorkout(DEFAULT_SWIM);
  }, []);
  
  const handleArrayFieldChange = useCallback((field: keyof typeof swimWorkout) => (event: SelectChangeEvent<string[]>) => {
    setSwimWorkout((prevState) => ({
      ...prevState,
      [field]: event.target.value as string[],
    }));
  }, []);

  const handleChange = useCallback((field: keyof typeof DEFAULT_SWIM, value: string | number | number[] | boolean) => {
    setSwimWorkout((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generateSwim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(swimWorkout),
      });
      const data = await response.json();
      setSwimResponse(data);
    } catch (error) {
      console.error('Error generating swim routine:', error);
      setError((error as unknown as { message: string }).message);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  }, [swimWorkout]);

  const handleSubmitClick = useCallback(() => {
    if(loading) {
      return;
    }
    if(!hasChanged) {
      setShowSnackbar(true);
    } else {
      handleSubmit();
    }
  }, [handleSubmit, hasChanged, loading]);

  const getCurrentStatus = useCallback(() => {
    if(loading) {
      return 'loading';
    } else if(hasError) {
      return 'error';
    } else if(swimResponse) {
      return 'swimRoutine';
    } else if (hasChanged) {
      return 'summary';
    } else {
      return;
    }
  }, [hasChanged, hasError, loading, swimResponse]);

  useEffect(() => {
    if(!isEqual(swimWorkout, DEFAULT_SWIM)) {
      setHasChanged(true);
    } else {
      setHasChanged(false);
    }
  }, [swimWorkout]);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
      <Typography variant="h6">
        Create Swim Workout
      </Typography>
      <FormControl fullWidth margin="dense">
        <TextField
          value={routineName}
          size='small'
          onChange={(e) => setRoutineName(e.target.value)}
        />
      </FormControl>
      <FormControl fullWidth margin="dense" size="small">
        <InputLabel>Swimming Strokes</InputLabel>
        <Select
          multiple
          value={swimWorkout.swimStrokes}
          onChange={handleArrayFieldChange('swimStrokes')}
          renderValue={(selected) => (selected as string[]).join(', ')}
        >
          {swimStrokes.map((swim) => (
            <MenuItem key={swim} value={swim}>
              <ListItemText primary={swim} />
              {swimWorkout.swimStrokes.indexOf(swim) > -1 && (
                <ListItemIcon>
                  <FaCheck style={{ color: theme === 'dark' ? 'lightgreen' : 'green' }} />
                </ListItemIcon>
              )}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="dense" size="small">
        <InputLabel>Swimming Styles</InputLabel>
        <Select
          multiple
          value={swimWorkout.swimStyles}
          onChange={handleArrayFieldChange('swimStyles')}
          renderValue={(selected) => (selected as string[]).join(', ')}
        >
          {swimStyles.map((swim) => (
            <MenuItem key={swim} value={swim}>
              <ListItemText primary={swim} />
              {swimWorkout.swimStyles.indexOf(swim) > -1 && (
                <ListItemIcon>
                  <FaCheck style={{ color: theme === 'dark' ? 'lightgreen' : 'green' }} />
                </ListItemIcon>
              )}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <Typography gutterBottom>Intensity</Typography>
        <Slider
          value={swimWorkout.intensity}
          onChange={(_event, newValue) => handleChange('intensity', newValue)}
          aria-labelledby="intensity-slider"
          valueLabelDisplay="auto"
          step={1}
          marks
          min={1}
          max={10}
        />
      </FormControl>
      <FormGroup>
      <Grid container spacing={2} justifyContent="space-between" alignItems="start">
        <Grid size={{ sm: 4, xs: 6  }}>
          <FormControlLabel
            control={<Checkbox checked={showAnyInjuries} onChange={(e) => setShowAnyInjuries(e.target.checked)} />}
            label="Injuries?"
          />
        </Grid>
        <Grid size={{ sm: 4, xs: 6  }}>
          <FormControlLabel
            control={<Checkbox checked={showAdditionalInfo} onChange={(e) => setShowAdditionalInfo(e.target.checked)} />}
            label="More Info?"
          />
        </Grid>
      </Grid>
      </FormGroup>
      {showAnyInjuries && (
        <FormControl fullWidth margin="normal">
          <TextField
            label="Injuries..."
            multiline
            rows={2}
            value={swimWorkout.injuries}
            onChange={(e) => handleChange('injuries', e.target.value)}
            inputProps={{ maxLength: 50 }}
            helperText={`${swimWorkout.injuries.length}/250`}
          />
        </FormControl>
      )}
      {showAdditionalInfo && (
        <FormControl fullWidth margin="normal">
          <TextField
            label="Additional Info"
            multiline
            rows={2}
            value={swimWorkout.additionalInfo}
            onChange={(e) => handleChange('additionalInfo', e.target.value)}
            inputProps={{ maxLength: 50 }}
            helperText={`${swimWorkout.additionalInfo.length}/250`}
          />
        </FormControl>
      )}
      <Box display="flex" justifyContent="space-between" sx={{ mt: 2 }}>
        <Button
          type="button" variant="contained" color="primary" disabled={!hasChanged} onClick={handleSubmitClick}
        >
          {loading ? 'Generating...' : 'Generate Workout'}
        </Button>
        <Button type="button" variant="outlined" color="primary" onClick={handleReset}>
          Reset
        </Button>
      </Box>

      {/* LOADING */}
      {getCurrentStatus() === 'loading' && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={50}/>
        </Box>
      )}

      {/* ERROR */}
      {getCurrentStatus() === 'error' && error && (
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">Error generating workout plan: {error}</Alert>
        </Box>
      )}

      {/* Workout Plan */}
      {getCurrentStatus() === 'swimRoutine' && swimResponse && (
        <Box sx={{ mt: 4, mb: 8 }}>
          <Card>
            <CardContent>
            <Box sx={{ mb: 2}}>
              <Typography variant="h5" gutterBottom>
                {routineName}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Total Distance: {swimResponse.totalDistance} meters | Estimated Time: {swimResponse.estimatedTimeMinutes} minutes
              </Typography>
              <Typography variant= "body2" gutterBottom>
                {swimResponse.workoutDescription}
              </Typography>
            </Box>
              <Grid container spacing={2}>
                {/* Warmup */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" gutterBottom>
                    Warmup
                  </Typography>
                  <Divider />
                </Grid>
                {swimResponse.warmup.map((swim, index) => (
                  SwimSegmentList({ swim, index })
                ))}

                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" gutterBottom>
                    Main
                  </Typography>
                  <Divider />
                </Grid>
                {swimResponse.main.map((swim, index) => (
                  SwimSegmentList({ swim, index })
                ))}

                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" gutterBottom>
                    Cooldown
                  </Typography>
                  <Divider />
                </Grid>
                {swimResponse.cooldown.map((swim, index) => (
                  SwimSegmentList({ swim, index })
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Summary */}
      {getCurrentStatus() === 'summary' &&(
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Summary
          </Typography>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" alignItems="center">
                    <FaDumbbell style={{ marginRight: 8, fontSize: 24, flexShrink: 0 }} />
                    <Typography>Swim Strokes: {swimWorkout.swimStrokes.join(', ') || 'None selected'}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" alignItems="center">
                    <FaDumbbell style={{ marginRight: 8, fontSize: 24, flexShrink: 0 }} />
                    <Typography>Swim Styles: {swimWorkout.swimStyles.join(', ') || 'None selected'}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" alignItems="center">
                    <FaHeartbeat style={{ marginRight: 8, fontSize: 24, flexShrink: 0 }} />
                    <Typography>Intensity: {swimWorkout.intensity}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" alignItems="center">
                    <FaClock style={{ marginRight: 8, fontSize: 24, flexShrink: 0 }} />
                    <Typography>Duration: {swimWorkout.duration} minutes</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
      >
        <Alert onClose={() => setShowSnackbar(false)} severity="warning" sx={{ width: '100%' }}>
          Please add a routine name before submitting.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WorkoutForm;