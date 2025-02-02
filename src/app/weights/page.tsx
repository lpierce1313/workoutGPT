"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, FormControl, InputLabel, ListItemText, MenuItem, Select, Slider, Typography, SelectChangeEvent, Card, CardContent, Checkbox, FormControlLabel, FormGroup, TextField, Alert, Snackbar, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { VscDash } from "react-icons/vsc";
import { FaDumbbell, FaHeartbeat } from 'react-icons/fa';
import isEqual from 'lodash/isEqual';
// import { workoutResponse, SwimSegment } from '@/app/api/generateSwim/route';
import { Divider } from '@mui/material';
import { StrengthResponse } from '../api/generateWeightLifting/route';

const trainingStyles = ['Powerlifting', 'Olympic Weight Lifting', 'Bodybuilding', 'Functional', 'Strongman', 'Calisthenics'];

const DEFAULT_STRENGTH = {
  trainingStyle: '',
  daysPerWeek: 5,
  duration: 60,
  additionalInfo: '',
  injuries: '',
};

const DEFAULT_STRENGTH_NAME = 'My Strength Routine';

const WorkoutForm: React.FC = () => {

  // Consistent interface for generating workout plans
  // const { theme } = useTheme();
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [showAnyInjuries, setShowAnyInjuries] = useState(false);
  const [routineName, setRoutineName] = useState(DEFAULT_STRENGTH_NAME);
  const [hasChanged, setHasChanged] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form for specific workout type
  const [workout, setWorkout] = useState<typeof DEFAULT_STRENGTH>(DEFAULT_STRENGTH);
  const [workoutResponse, setWorkoutResponse] = useState<StrengthResponse | null>(null);

  const handleReset = useCallback(() => {
    setShowAdditionalInfo(false);
    setShowAnyInjuries(false);
    setRoutineName(DEFAULT_STRENGTH_NAME);
    setWorkoutResponse(null);
    setWorkout(DEFAULT_STRENGTH);
  }, []);

  const handleArraySingleFieldChange = useCallback((field: keyof typeof workout) => (event: SelectChangeEvent<string | number>) => {
    setWorkout((prevState) => ({
      ...prevState,
      [field]: event.target.value,
    }));
  }, []);

  const handleChange = useCallback((field: keyof typeof DEFAULT_STRENGTH, value: string | number | number[] | boolean) => {
    setWorkout((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      console.log('workout', workout);
      const response = await fetch('/api/generateWeightLifting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workout),
      });
      console.log('response', response);
      const data = await response.json();
      setWorkoutResponse(data);
      console.log('DATA', data);
    } catch (error) {
      console.error('Error generating stretch routine:', error);
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

  console.log('Get Current Status', getCurrentStatus());

  useEffect(() => {
    if(!isEqual(workout, DEFAULT_STRENGTH)) {
      setHasChanged(true);
    } else {
      setHasChanged(false);
    }
  }, [workout]);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
      <Typography variant="h6">
        Create Stretch Routine
      </Typography>
      <FormControl fullWidth margin="dense">
        <TextField
          value={routineName}
          size='small'
          onChange={(e) => setRoutineName(e.target.value)}
        />
      </FormControl>
      <FormControl fullWidth margin="dense" size="small">
        <InputLabel>Training Style</InputLabel>
        <Select
          value={workout.trainingStyle}
          onChange={handleArraySingleFieldChange('trainingStyle')}
          renderValue={(selected) => selected}>
          {trainingStyles.map((style) => (
            <MenuItem key={style} value={style}>
              <ListItemText primary={style} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="dense" size="small">
        <InputLabel>Days Per Week</InputLabel>
        <Select
          value={workout.daysPerWeek}
          onChange={handleArraySingleFieldChange('daysPerWeek')}
          renderValue={(selected) => selected}>
          {[1,2,3,4,5,6,7].map((dayNum) => (
            <MenuItem key={dayNum} value={dayNum}>
              <ListItemText primary={dayNum} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <Typography gutterBottom>Duration</Typography>
        <Slider
          value={workout.duration}
          onChange={(_event, newValue) => handleChange('duration', newValue)}
          aria-labelledby="duration-slider"
          valueLabelDisplay="auto"
          step={1}
          marks
          min={1}
          max={60}
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

      {/* Workout Plan */}
      {getCurrentStatus() === 'workout' && workoutResponse && (
        <Box sx={{ mt: 4, mb: 8 }}>
        <Card>
          <CardContent>
            <Box sx={{ mb: 2}}>
              <Typography variant="h6" gutterBottom>
                {routineName} - Total Estimated {workoutResponse.totalEstimatedDurationMinutes} Minutes
              </Typography>
              <Typography variant= "subtitle1" gutterBottom>
                {workoutResponse.description}
              </Typography>
            </Box>
            <Divider />
            <Grid container spacing={2}>
              {workoutResponse.liftDays.map((liftDay, index) => (
                <Grid key={index} size={{ xs: 12 }} sx={{mb: 2}}>
                  <Typography variant="h6" gutterBottom>
                    {liftDay.dayName}:
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    {liftDay.description}
                  </Typography>
                  {liftDay.lifts.map((lift, index) => (
                    <Box key={index} display="flex" alignItems="center">
                      <VscDash style={{ marginRight: 8, fontSize: 24, flexShrink: 0 }} />
                      <Typography>{lift.liftName} for {lift.numSets} x {lift.numReps} and rest {lift.restDuration} - {lift.liftDescription}</Typography>
                    </Box>
                  ))}
                  {index !== workoutResponse.liftDays.length - 1 && <Divider sx={{ mt:4}} /> }
                </Grid>
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
                    <Typography>Training Style: {workout.trainingStyle}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" alignItems="center">
                    <FaDumbbell style={{ marginRight: 8, fontSize: 24, flexShrink: 0 }} />
                    <Typography>Days Per week: {workout.daysPerWeek}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" alignItems="center">
                    <FaHeartbeat style={{ marginRight: 8, fontSize: 24, flexShrink: 0 }} />
                    <Typography>Duration: {workout.duration}</Typography>
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