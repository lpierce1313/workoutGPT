"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, FormControl, ListItemIcon, ListItemText, MenuItem, Select, Slider, Typography, SelectChangeEvent, Card, CardContent, Checkbox, FormControlLabel, FormGroup, TextField, Alert, Snackbar, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { VscDash } from "react-icons/vsc";
import { FaCheck, FaClock, FaDumbbell, FaHeartbeat } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';
import isEqual from 'lodash/isEqual';
import { SwimSegment, WorkoutResponse } from '@/app/api/generateSwim/route';
import { Divider } from '@mui/material';

const swimStrokes = ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly'];
const swimStyles = ['Distance', 'Sprint', 'Interval'];

const DEFAULT_WORKOUT = {
  swimStrokes: [] as string[],
  swimStyle: swimStyles[0],
  intensity: 7,
  duration: 5,
  additionalInfo: '',
  injuries: '',
};

const DEFAULT_WORKOUT_NAME = 'My Workout';

const SwimSegmentList = ({ swim, index }: { swim: SwimSegment; index: number }) => {
  return (
    <Grid size={{ xs: 12 }} key={index + swim.description}>
      <Box display="flex" flexDirection="column" alignItems="flex-start">
        <Box display="flex" alignItems="flex-start">
          <VscDash style={{ marginRight: 8, fontSize: 24, flexShrink: 0, alignSelf: 'flex-start' }} />
          <Typography variant="body1">
            {swim.sets} x {swim.length} {swim.swimOption} - {swim.description} {swim.restDuration > 0 && (<>Take {swim.restDuration} seconds per set</>)}
          </Typography>
        </Box>
      </Box>
    </Grid>
  );
};

const WorkoutForm: React.FC = () => {

  // Consistent interface for generating workout plans
  const { theme } = useTheme();
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [showAnyInjuries, setShowAnyInjuries] = useState(false);
  const [workoutName, setWorkoutName] = useState(DEFAULT_WORKOUT_NAME);
  const [hasChanged, setHasChanged] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form for specific workout type
  const [workout, setWorkout] = useState<typeof DEFAULT_WORKOUT>(DEFAULT_WORKOUT);
  const [workoutResponse, setWorkoutResponse] = useState<WorkoutResponse | null>(null);

  const handleReset = useCallback(() => {
    setShowAdditionalInfo(false);
    setShowAnyInjuries(false);
    setWorkoutName(DEFAULT_WORKOUT_NAME);
    setWorkoutResponse(null);

    setWorkout(DEFAULT_WORKOUT);
  }, []);

  const handleArraySingleFieldChange = useCallback((field: keyof typeof workout) => (event: SelectChangeEvent<string | string[] | number>) => {
    setWorkout((prevState) => ({
      ...prevState,
      [field]: event.target.value,
    }));
  }, []);

  const handleChange = useCallback((field: keyof typeof DEFAULT_WORKOUT, value: string | number | number[] | boolean) => {
    setWorkout((prevState) => ({
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
        body: JSON.stringify(workout),
      });
      const data = await response.json();
      setWorkoutResponse(data);
    } catch (error) {
      console.error('Error generating swim routine:', error);
      setError((error as unknown as { message: string }).message);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  }, [workout]);

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
    } else if(workoutResponse) {
      return 'workout';
    } else if (hasChanged) {
      return 'summary';
    } else {
      return;
    }
  }, [hasChanged, hasError, loading, workoutResponse]);

  useEffect(() => {
    if(!isEqual(workout, DEFAULT_WORKOUT)) {
      setHasChanged(true);
    } else {
      setHasChanged(false);
    }
  }, [workout]);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
      <Typography variant="h6">
        Create Swim Workout
      </Typography>
      <FormControl fullWidth margin="dense">
        <TextField
          value={workoutName}
          size='small'
          onChange={(e) => setWorkoutName(e.target.value)}
        />
      </FormControl>
      <FormControl fullWidth margin="dense" size="small">
        <Typography>Swimming Strokes</Typography>
        <Select
          multiple
          value={workout.swimStrokes}
          onChange={handleArraySingleFieldChange('swimStrokes')}
          displayEmpty
          renderValue={(selected) => (selected.length === 0 ? 'All' : (selected as string[]).join(', '))}>
          {swimStrokes.map((swim) => (
            <MenuItem key={swim} value={swim}>
              <ListItemText primary={swim} />
              {workout.swimStrokes.indexOf(swim) > -1 && (
                <ListItemIcon>
                  <FaCheck style={{ color: theme === 'dark' ? 'lightgreen' : 'green' }} />
                </ListItemIcon>
              )}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="dense" size="small">
        <Typography>Swimming Strokes</Typography>
        <Select
          value={workout.swimStyle}
          onChange={handleArraySingleFieldChange('swimStyle')}
          renderValue={(selected) => (selected)}
        >
          {swimStyles.map((swim) => (
            <MenuItem key={swim} value={swim}>
              <ListItemText primary={swim} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <Typography>Intensity</Typography>
        <Slider
          value={workout.intensity}
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
            value={workout.injuries}
            onChange={(e) => handleChange('injuries', e.target.value)}
            inputProps={{ maxLength: 50 }}
            helperText={`${workout.injuries.length}/250`}
          />
        </FormControl>
      )}
      {showAdditionalInfo && (
        <FormControl fullWidth margin="normal">
          <TextField
            label="Additional Info"
            multiline
            rows={2}
            value={workout.additionalInfo}
            onChange={(e) => handleChange('additionalInfo', e.target.value)}
            inputProps={{ maxLength: 50 }}
            helperText={`${workout.additionalInfo.length}/250`}
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
                    <Typography>Swim Strokes: {workout.swimStrokes.join(', ') || 'None selected'}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" alignItems="center">
                    <FaDumbbell style={{ marginRight: 8, fontSize: 24, flexShrink: 0 }} />
                    <Typography>Swim Styles: {workout.swimStyle}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" alignItems="center">
                    <FaHeartbeat style={{ marginRight: 8, fontSize: 24, flexShrink: 0 }} />
                    <Typography>Intensity: {workout.intensity}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" alignItems="center">
                    <FaClock style={{ marginRight: 8, fontSize: 24, flexShrink: 0 }} />
                    <Typography>Duration: {workout.duration} minutes</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Workout Plan */}
      {getCurrentStatus() === 'workout' && workoutResponse && (
        <Box sx={{ mt: 4, mb: 8 }}>
          <Card>
            <CardContent>
            <Box sx={{ mb: 2}}>
              <Typography variant="h5" gutterBottom>
                {workoutName}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Total Distance: {workoutResponse.totalDistance} meters | Estimated Time: {workoutResponse.estimatedTimeMinutes} minutes
              </Typography>
              <Typography variant= "body1" gutterBottom>
                {workoutResponse.workoutDescription}
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
                {workoutResponse.warmup.map((swim, index) => (
                  SwimSegmentList({ swim, index })
                ))}

                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" gutterBottom>
                    Main
                  </Typography>
                  <Divider />
                </Grid>
                {workoutResponse.main.map((swim, index) => (
                  SwimSegmentList({ swim, index })
                ))}

                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" gutterBottom>
                    Cooldown
                  </Typography>
                  <Divider />
                </Grid>
                {workoutResponse.cooldown.map((swim, index) => (
                  SwimSegmentList({ swim, index })
                ))}
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