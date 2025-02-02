"use client";

import React from 'react';
import { AppBar, Box, Toolbar, Typography, IconButton, Button, Menu, MenuItem, Divider } from '@mui/material';
import { FaBars, FaMoon, FaSun } from 'react-icons/fa';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';
import { useTheme as useCustomTheme } from '@/context/ThemeContext';
import { usePathname } from 'next/navigation';

const Navbar: React.FC = () => {
  const { theme: customTheme, toggleTheme } = useCustomTheme();
  const pathname = usePathname();
  const theme = useTheme();

  const isActive = (path: string) => pathname === path;

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const activeStyle = {
    backgroundColor: theme.palette.action.selected,
  };

  const pages = [
    { name: 'Swimming', path: '/swimming' },
    { name: 'Circuits', path: '/circuits' },
    { name: 'Stretching', path: '/stretching' },
    { name: 'Weights', path: '/weights' },
  ]

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
      <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ textDecoration: 'none', color: 'inherit' }}>
              <Link href="/" passHref prefetch={false}>
                WorkoutGPT
              </Link>
            </Typography>
          </Box>
          <Box sx={{ display: { sm: 'flex-center', xs: 'none' } }}>
            {pages.map((page) => (
              <Link key={page.path} href={page.path} passHref prefetch={false}>
                <Button color="inherit" sx={isActive(page.path) ? activeStyle : {}}>
                  {page.name}
                </Button>
              </Link>
            ))}
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="toggle theme"
              onClick={toggleTheme}
            >
              {customTheme === 'dark' ? <FaSun /> : <FaMoon />}
            </IconButton>
          </Box>
          <Box sx={{ display: { sm: 'none', xs: 'flex' } }}>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="open menu"
              onClick={handleOpenNavMenu}>
                <FaBars />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              <MenuItem onClick={toggleTheme} sx={{ justifyContent: 'center' }}>
                {customTheme === 'dark' ? <FaSun /> : <FaMoon />}
                <Typography sx={{ marginLeft: 1 }}>Toggle Theme</Typography>
              </MenuItem>
              <Divider />
              {pages.map((page) => (
                <Link key={page.path} href={page.path} passHref prefetch={false}>
                  <MenuItem onClick={handleCloseNavMenu} sx={isActive(page.path) ? activeStyle : {}}>
                    <Typography sx={{ textAlign: 'center' }}>{page.name}</Typography>
                  </MenuItem>
                </Link>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;