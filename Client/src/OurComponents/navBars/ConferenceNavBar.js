import { useState, useEffect, useContext } from "react";
import { Button, Menu, MenuItem } from "@mui/material";

// react-router components
import { useNavigate } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import Container from "@mui/material/Container";
import { Icon, IconButton } from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import ConferencesNavbarMobile from "../navBars/ConferencesNavbarMobile";

// Material Dashboard 2 React base styles
import breakpoints from "assets/theme/base/breakpoints";

// Material Dashboard 2 React context
import ConfRoutes from "../../conferenceRoutes";
import { ConferenceContext } from "../../conference.context";

import NotificationItem from "examples/Items/NotificationItem";

import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";

import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
} from "context";

import * as React from "react";

export default function ConferenceNavBar({ transparent, light, action }) {
  const [mobileNavbar, setMobileNavbar] = useState(false);
  const [mobileView, setMobileView] = useState(false);

  const openMobileNavbar = ({ currentTarget }) =>
    setMobileNavbar(currentTarget.parentNode);
  const closeMobileNavbar = () => setMobileNavbar(false);

  //------------Referente à NavBar da Conferência-----------------//
  const [open, setOpen] = useState(false);
  const anchorRef = React.useRef(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const [subMenus, setSubMenus] = useState([]);
  const navigate = useNavigate();

  const { userRole } = useContext(ConferenceContext);
  const [roles, setRoles] = useState("Author");

  useEffect(() => {
    if (userRole) {
      setRoles(userRole.split(","));
    }
  }, [userRole]);

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);

  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  const handleClick = (event, parentKey) => {
    setAnchorEl(event.currentTarget);
    const menus = ConfRoutes.filter(
      (item) => item.type === "collapse" && item.submenu === parentKey
    );
    setSubMenus(menus);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSubMenuClick = (route) => {
    handleClose();
    navigate(route);
  };
  //------------Referente à NavBar da Conferência-----------------//

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, darkMode } = controller;
  const [openMenu, setOpenMenu] = useState(false);
  const handleCloseMenu = () => setOpenMenu(false);

  const renderMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorReference={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      sx={{ mt: 2 }}
    >
      <NotificationItem icon={<Icon>email</Icon>} title="Check new messages" />
      <NotificationItem
        icon={<Icon>podcasts</Icon>}
        title="Manage Podcast sessions"
      />
      <NotificationItem
        icon={<Icon>shopping_cart</Icon>}
        title="Payment successfully completed"
      />
    </Menu>
  );

  useEffect(() => {
    // A function that sets the display state for the ConferencesNavbarMobile.
    function displayMobileNavbar() {
      if (window.innerWidth < breakpoints.values.lg) {
        setMobileView(true);
        setMobileNavbar(false);
      } else {
        setMobileView(false);
        setMobileNavbar(false);
      }
    }

    /** 
     The event listener that's calling the displayMobileNavbar function when 
     resizing the window.
    */
    window.addEventListener("resize", displayMobileNavbar);

    // Call the displayMobileNavbar function to set the state with the initial value.
    displayMobileNavbar();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", displayMobileNavbar);
  }, []);

  return (
    <Container>
      {/* Esta MDBox define a barra onde estarão as opções do menu */}
      <MDBox
        px={{ xs: 4, sm: transparent ? 2 : 3, lg: transparent ? 0 : 2 }}
        mx={3}
        width="calc(100% - 48px)"
        borderRadius="lg"
        shadow={transparent ? "none" : "md"}
        color={light ? "white" : "dark"}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        position="absolute"
        left={0}
        zIndex={3}
        sx={({
          palette: { transparent: transparentColor, white, background },
          functions: { rgba },
        }) => ({
          backgroundColor: transparent
            ? transparentColor.main
            : rgba(darkMode ? background.sidenav : white.main, 0.8),
          backdropFilter: transparent ? "none" : `saturate(200%) blur(30px)`,
        })}
      >
        {/* Esta MDBox contem os links. É onde estão definidas as primeiras opções do menu (Submissões / Bidding / Reviews / Envio de Mails / Gestão do Comitê / Definições da Conferência) */}
        <MDBox color="inherit" display={{ xs: "none", lg: "flex" }} m={0} p={0}>
          {ConfRoutes.map((item) => {
            if (
              item.type === "title" &&
              (item.permissions.includes(roles[0]) ||
                item.permissions.includes(roles[1]) ||
                item.permissions.includes("All"))
            ) {
              return (
                <div key={item.name}>
                  <Button
                    aria-controls="simple-menu"
                    aria-haspopup="true"
                    style={{ textTransform: "none", color: "black" }}
                    onClick={(e) => handleClick(e, item.parentkey)}
                    startIcon={<Icon>{item.icon}</Icon>}
                  >
                    {item.name}
                  </Button>
                </div>
              );
            }
            return null;
          })}
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            {subMenus.map((subMenu) => {
              // Verifique se o usuário tem permissão para ver este submenu
              if (
                subMenu.permissions.includes(roles[0]) ||
                subMenu.permissions.includes(roles[1]) ||
                subMenu.permissions.includes("All")
              ) {
                return (
                  <MenuItem
                    key={subMenu.name}
                    onClick={() => handleSubMenuClick(subMenu.route)}
                  >
                    <Icon style={{ marginRight: 8 }}>{subMenu.icon}</Icon>
                    {subMenu.name}
                  </MenuItem>
                );
              }
            })}
          </Menu>
        </MDBox>

        {/* Esta MDBox define a navbar quando estamos em modo mobile */}
        <MDBox
          display={{ xs: "inline-block", lg: "none" }}
          lineHeight={0}
          py={1.5}
          pl={1.5}
          color="inherit"
          sx={{ cursor: "pointer" }}
          onClick={openMobileNavbar}
        >
          <Icon fontSize="default">{mobileNavbar ? "close" : "menu"}</Icon>
        </MDBox>
        <MDBox>
          <IconButton
            size="small"
            disableRipple
            color="inherit"
            sx={navbarMobileMenu}
            onClick={handleMiniSidenav}
          >
            <Icon fontSize="medium">{miniSidenav ? "menu_open" : "menu"}</Icon>
            <MDTypography variant="body2" color="text">
              Menu
            </MDTypography>
          </IconButton>
          {renderMenu()}
        </MDBox>
      </MDBox>
      {mobileView && (
        <ConferencesNavbarMobile
          open={mobileNavbar}
          close={closeMobileNavbar}
        />
      )}
    </Container>
  );
}

// Setting default values for the props of DefaultNavbar
ConferenceNavBar.defaultProps = {
  transparent: false,
  light: false,
  action: false,
};

// Typechecking props for the ConferenceNavBar
ConferenceNavBar.propTypes = {
  transparent: PropTypes.bool,
  light: PropTypes.bool,
  action: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.shape({
      type: PropTypes.oneOf(["external", "internal"]).isRequired,
      route: PropTypes.string.isRequired,
      color: PropTypes.oneOf([
        "primary",
        "secondary",
        "info",
        "success",
        "warning",
        "error",
        "dark",
        "light",
      ]),
      label: PropTypes.string.isRequired,
    }),
  ]),
};
