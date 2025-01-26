"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, FormControl, InputLabel, ListItemIcon, ListItemText, MenuItem, Select, Slider, Typography, SelectChangeEvent, Card, CardContent, Checkbox, FormControlLabel, FormGroup, TextField, Alert, Snackbar, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { WorkoutResponse } from '@/app/api/generateWorkout/route';
import { VscDash } from "react-icons/vsc";
import { FaCheck, FaClock, FaDumbbell, FaHeartbeat, FaWeightHanging } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';
import isEqual from 'lodash/isEqual';

const muscleGroupsOptions = ['Back', 'Chest', 'Shoulders', 'Triceps', 'Biceps', 'Abs', 'Legs', 'Lungs i.e. Cardio only'];

const DEFAULT_FORM = {
  muscleGroups: [] as string[],
  intensity: 7,
  bodyweight: false,
  workoutStyle: 'crossfit',
  duration: 5,
  additionalInfo: '',
};

const DEFAULT_WORKOUT_NAME = 'My Routine';

const WorkoutForm: React.FC = () => {
  const { theme } = useTheme();
  const [workoutState, setWorkoutState] = useState<typeof DEFAULT_FORM>(DEFAULT_FORM);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [routineName, setRoutineName] = useState(DEFAULT_WORKOUT_NAME);
  const [hasChanged, setHasChanged] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [workoutResponse, setWorkoutResponse] = useState<WorkoutResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleReset = useCallback(() => {
    setWorkoutState(DEFAULT_FORM);
    setShowAdditionalInfo(false);
    setRoutineName(DEFAULT_WORKOUT_NAME);
    setWorkoutResponse(null);
  }, []);

  const handleMuscleGroupsChange = useCallback((event: SelectChangeEvent<string[]>) => {
    setWorkoutState((prevState) => ({
      ...prevState,
      muscleGroups: event.target.value as string[],
    }));
  }, []);

  const handleChange = useCallback((field: string, value: unknown) => {
    setWorkoutState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generateWorkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workoutState),
      });
      const data = await response.json();
      setWorkoutResponse(data);
    } catch (error) {
      console.error('Error generating workout plan:', error);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  }, [workoutState]);

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
    if(!isEqual(workoutState, DEFAULT_FORM)) {
      setHasChanged(true);
    } else {
      setHasChanged(false);
    }
  }, [workoutState]);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Create Your Workout Plan
      </Typography>
      <FormControl fullWidth margin="normal">
        <TextField
          value={routineName}
          onChange={(e) => setRoutineName(e.target.value)}
        />
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel>Muscle Groups</InputLabel>
        <Select
          multiple
          value={workoutState.muscleGroups}
          onChange={handleMuscleGroupsChange}
          renderValue={(selected) => (selected as string[]).join(', ')}
        >
          {muscleGroupsOptions.map((group) => (
            <MenuItem key={group} value={group}>
              <ListItemText primary={group} />
              {workoutState.muscleGroups.indexOf(group) > -1 && (
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
          value={workoutState.intensity}
          onChange={(_event, newValue) => handleChange('intensity', newValue)}
          aria-labelledby="intensity-slider"
          valueLabelDisplay="auto"
          step={1}
          marks
          min={1}
          max={10}
        />
      </FormControl>
      <FormControl fullWidth margin="normal">
        <Typography gutterBottom>Duration (minutes)</Typography>
        <Slider
          value={workoutState.duration}
          onChange={(_event, newValue) => handleChange('duration', newValue)}
          aria-labelledby="duration-slider"
          valueLabelDisplay="auto"
          step={1}
          min={1}
          max={90}
        />
      </FormControl>
      <FormGroup>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <FormControlLabel
            control={<Checkbox checked={workoutState.bodyweight} onChange={(e) => handleChange('bodyweight', e.target.checked)} />}
            label="Strictly Bodyweight"
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <FormControlLabel
            control={<Checkbox checked={showAdditionalInfo} onChange={(e) => setShowAdditionalInfo(e.target.checked)} />}
            label="Additional Info"
          />
        </Grid>
      </Grid>
      </FormGroup>
      {showAdditionalInfo && (
        <FormControl fullWidth margin="normal">
          <TextField
            label="Additional Info"
            multiline
            rows={4}
            value={workoutState.additionalInfo}
            onChange={(e) => handleChange('additionalInfo', e.target.value)}
            inputProps={{ maxLength: 250 }}
            helperText={`${workoutState.additionalInfo.length}/250`}
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
      {getCurrentStatus() === 'error' && (
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">Error generating workout plan. Please try again.</Alert>
        </Box>
      )}

      {/* Workout Plan */}
      {getCurrentStatus() === 'workout' && workoutResponse && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            {routineName}
          </Typography>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                {workoutResponse.circuit.map((exercise, index) => (
                  <Grid size={{ xs: 12 }} key={index}>
                    <Box display="flex" alignItems="center">
                      <VscDash style={{ marginRight: 8, fontSize: 24, flexShrink: 0 }} />
                      <Typography>{exercise.exercise} - {exercise.reps} reps</Typography>
                    </Box>
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
                    <Typography>Muscle Groups: {workoutState.muscleGroups.join(', ') || 'None selected'}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" alignItems="center">
                    <FaHeartbeat style={{ marginRight: 8, fontSize: 24, flexShrink: 0 }} />
                    <Typography>Intensity: {workoutState.intensity}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" alignItems="center">
                    <FaWeightHanging style={{ marginRight: 8, fontSize: 24, flexShrink: 0 }} />
                    <Typography>Bodyweight: {workoutState.bodyweight ? 'Yes' : 'No'}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" alignItems="center">
                    <FaClock style={{ marginRight: 8, fontSize: 24, flexShrink: 0 }} />
                    <Typography>Duration: {workoutState.duration} minutes</Typography>
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