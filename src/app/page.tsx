import React from 'react';
import { Container, Grid2, Paper, Typography } from '@mui/material';

const DashboardPage: React.FC = () => {
    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom>
                Saved Workouts
            </Typography>
            <Grid2 container spacing={3}>
                {/* Chart */}
                <Grid2 size={{ sm: 4, xs: 6  }}>
                    <Paper elevation={3} style={{ padding: '16px', height: '240px' }}>
                        <Typography variant="h6">My Dash</Typography>
                        {/* Chart component goes here */}
                    </Paper>
                </Grid2>
            </Grid2>
        </Container>
    );
};

export default DashboardPage;