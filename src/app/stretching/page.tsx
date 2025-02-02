"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, FormControl, InputLabel, ListItemIcon, ListItemText, MenuItem, Select, Slider, Typography, SelectChangeEvent, Card, CardContent, Checkbox, FormControlLabel, FormGroup, TextField, Alert, Snackbar, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { VscDash } from "react-icons/vsc";
import { FaCheck, FaDumbbell, FaHeartbeat } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';
import isEqual from 'lodash/isEqual';
// import { stretchResponse, SwimSegment } from '@/app/api/generateSwim/route';
import { Divider } from '@mui/material';
import { StretchResponse } from '../api/generateStretch/route';

const stretchTypes = ['Static', 'Dynamic', 'Active', 'Passive'];
const stretchAreas = ['Neck/Shoulders', 'Arms/Wrists', 'Chest/Upperback', 'Core/Lowerback', 'Hips/Glutes', 'Quads/Hams', 'Calves/Ankles'];

const DEFAULT_STRETCHING = {
  stretchType: '',
  stretchAreas: [] as string[],
  duration: 10, // Duration in minutes
  additionalInfo: '',
  injuries: '',
};

const DEFAULT_STRETCH_NAME = 'My Stretch Routine';

const WorkoutForm: React.FC = () => {

  // Consistent interface for generating workout plans
  const { theme } = useTheme();
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [showAnyInjuries, setShowAnyInjuries] = useState(false);
  const [routineName, setRoutineName] = useState(DEFAULT_STRETCH_NAME);
  const [hasChanged, setHasChanged] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form for specific workout type
  const [stretchWorkout, setStretchWorkout] = useState<typeof DEFAULT_STRETCHING>(DEFAULT_STRETCHING);
  const [stretchResponse, setStretchResponse] = useState<StretchResponse | null>(null);

  const handleReset = useCallback(() => {
    setShowAdditionalInfo(false);
    setShowAnyInjuries(false);
    setRoutineName(DEFAULT_STRETCH_NAME);
    setStretchResponse(null);
    setStretchWorkout(DEFAULT_STRETCHING);
  }, []);
  
  const handleArrayFieldChange = useCallback((field: keyof typeof stretchWorkout) => (event: SelectChangeEvent<string[] | string>) => {
    setStretchWorkout((prevState) => ({
      ...prevState,
      [field]: event.target.value,
    }));
  }, []);

  const handleChange = useCallback((field: keyof typeof DEFAULT_STRETCHING, value: string | number | number[] | boolean) => {
    setStretchWorkout((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      console.log('stretchWorkout', stretchWorkout);
      const response = await fetch('/api/generateStretch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stretchWorkout),
      });
      console.log('response', response);
      const data = await response.json();
      setStretchResponse(data);
      console.log('DATA', data);
    } catch (error) {
      console.error('Error generating stretch routine:', error);
      setError((error as unknown as { message: string }).message);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  }, [stretchWorkout]);

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
    } else if(stretchResponse) {
      return 'stretchRoutine';
    } else if (hasChanged) {
      return 'summary';
    } else {
      return;
    }
  }, [hasChanged, hasError, loading, stretchResponse]);

  console.log('Get Current Status', getCurrentStatus());

  useEffect(() => {
    if(!isEqual(stretchWorkout, DEFAULT_STRETCHING)) {
      setHasChanged(true);
    } else {
      setHasChanged(false);
    }
  }, [stretchWorkout]);

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
        <InputLabel>Stretch Style</InputLabel>
        <Select
          value={stretchWorkout.stretchType}
          onChange={handleArrayFieldChange('stretchType')}
          renderValue={(selected) => selected}>
          {stretchTypes.map((stretch) => (
            <MenuItem key={stretch} value={stretch}>
              <ListItemText primary={stretch} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="dense" size="small">
        <InputLabel>Stretch Areas</InputLabel>
        <Select
          multiple
          value={stretchWorkout.stretchAreas}
          onChange={handleArrayFieldChange('stretchAreas')}
          renderValue={(selected) => (selected as string[]).join(', ')}
        >
          {stretchAreas.map((stretch) => (
            <MenuItem key={stretch} value={stretch}>
              <ListItemText primary={stretch} />
              {stretchWorkout.stretchAreas.indexOf(stretch) > -1 && (
                <ListItemIcon>
                  <FaCheck style={{ color: theme === 'dark' ? 'lightgreen' : 'green' }} />
                </ListItemIcon>
              )}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <Typography gutterBottom>Duration</Typography>
        <Slider
          value={stretchWorkout.duration}
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
            value={stretchWorkout.injuries}
            onChange={(e) => handleChange('injuries', e.target.value)}
            inputProps={{ maxLength: 50 }}
            helperText={`${stretchWorkout.injuries.length}/250`}
          />
        </FormControl>
      )}
      {showAdditionalInfo && (
        <FormControl fullWidth margin="normal">
          <TextField
            label="Additional Info"
            multiline
            rows={2}
            value={stretchWorkout.additionalInfo}
            onChange={(e) => handleChange('additionalInfo', e.target.value)}
            inputProps={{ maxLength: 50 }}
            helperText={`${stretchWorkout.additionalInfo.length}/250`}
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
      {getCurrentStatus() === 'stretchRoutine' && stretchResponse && (
        <Box sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Box sx={{ mb: 2}}>
              <Typography variant="h6" gutterBottom>
                {routineName} - Total Estimated {stretchResponse.totalEstimatedDurationMinutes} Minutes
              </Typography>
              <Typography variant= "subtitle1" gutterBottom>
                {stretchResponse.description}
              </Typography>
            </Box>
            <Divider />
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {stretchResponse.stretches.map((stretch, index) => (
                <Grid size={{ xs: 12 }} key={index}>
                  <Box display="flex" alignItems="center">
                    <VscDash style={{ marginRight: 8, fontSize: 24, flexShrink: 0 }} />
                    <Typography>{stretch.stretchName} {stretch.numReps ?? 0 > 1 ? `- ${stretch.numReps} reps` : ''} for {stretch.durationInSeconds} seconds - {stretch.description}</Typography>
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
                    <Typography>Stretch Type: {stretchWorkout.stretchType}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" alignItems="center">
                    <FaDumbbell style={{ marginRight: 8, fontSize: 24, flexShrink: 0 }} />
                    <Typography>Stretch Areas: {stretchWorkout.stretchAreas.join(', ') || 'None selected'}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" alignItems="center">
                    <FaHeartbeat style={{ marginRight: 8, fontSize: 24, flexShrink: 0 }} />
                    <Typography>Duration: {stretchWorkout.duration}</Typography>
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