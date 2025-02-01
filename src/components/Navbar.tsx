"use client";

import React from 'react';
import { AppBar, Box, Toolbar, Typography, IconButton, Button } from '@mui/material';
import { FaMoon, FaSun } from 'react-icons/fa';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';
import { useTheme as useCustomTheme } from '@/context/ThemeContext';
import { usePathname } from 'next/navigation';



const Navbar: React.FC = () => {
  const { theme: customTheme, toggleTheme } = useCustomTheme();
  const pathname = usePathname();
  const theme = useTheme();

  const isActive = (path: string) => pathname === path;

  const activeStyle = {
    backgroundColor: theme.palette.action.selected,
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
      <Toolbar>
          <Typography variant="h6" component={Link} href="/" passHref prefetch={false} sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
            WorkoutGPT
          </Typography>
          <Link href="/swimming" passHref prefetch={false}>
            <Button color="inherit" sx={isActive('/swimming') ? activeStyle : {}}>
              Swimming
            </Button>
          </Link>
          {/* <Link href="/weights" passHref prefetch={false}>
            <Button color="inherit" sx={isActive('/weights') ? activeStyle : {}}>
              Weight Lifting
            </Button>
          </Link> */}
          {/* <Link href="/stretching" passHref prefetch={false}>
            <Button color="inherit" sx={isActive('/stretching') ? activeStyle : {}}>
              Stretching
            </Button>
          </Link> */}
          <Link href="/circuits" passHref prefetch={false}>
            <Button color="inherit" sx={isActive('/circuits') ? activeStyle : {}}>
              Circuits
            </Button>
          </Link>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            aria-label="toggle theme"
            onClick={toggleTheme}
          >
            {customTheme === 'dark' ? <FaSun /> : <FaMoon />}
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;