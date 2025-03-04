import React, { useState } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, useTheme } from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import InventoryIcon from '@mui/icons-material/Inventory';
import BallotIcon from '@mui/icons-material/Ballot';
import CategoryIcon from '@mui/icons-material/Category';
import { Link } from 'react-router-dom';



const MySidebar: React.FC = () => {
  const theme = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");

  

  return (
    <Box 
      sx={{
        position: "sticky",
        display: "flex",
        minHeight: "100vh",
        top: 0,
        bottom: 0,
        zIndex: 10000,
        "& .pro-sidebar-inner": {
          backgroundColor: "#2e3b55 !important",
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <Sidebar className="h-100 col-md-3" collapsed={isCollapsed}>
        <Menu>
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                alignItems="center"
                ml="15px"
              >
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
                
              </Box>
            )}
          </MenuItem>

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
                <>
                    <MenuItem
                    component={<Link to="/" />}
                    icon={<HomeOutlinedIcon />}
                    active={selected === "Dashboard"}
                    onClick={() => setSelected("Dashboard")}
                    >
                    Dashboard
                    </MenuItem>

                    <MenuItem
                    component={<Link to="/product" />}
                    icon={<BallotIcon />}
                    active={selected === "Products"}
                    onClick={() => setSelected("Products")}
                    >
                    Products
                    </MenuItem>

                    <MenuItem
                    component={<Link to="/provider" />}
                    icon={<BallotIcon />}
                    active={selected === "Providers"}
                    onClick={() => setSelected("Providers")}
                    >
                    Providers
                    </MenuItem>

                    <MenuItem
                    component={<Link to="/branch_offices" />}
                    icon={<BallotIcon />}
                    active={selected === "Branches"}
                    onClick={() => setSelected("Branches")}
                    >
                    Branches
                    </MenuItem>

                    <MenuItem
                    component={<Link to="/invoice" />}
                    icon={<InventoryIcon />}
                    active={selected === "Invoices"}
                    onClick={() => setSelected("Invoices")}
                    >
                    Invoices
                    </MenuItem>

                    <MenuItem
                    component={<Link to="/routes" />}
                    icon={<CategoryIcon />}
                    active={selected === "Routes"}
                    onClick={() => setSelected("Routes")}
                    >
                    Routes
                    </MenuItem>

                   
                </>
          </Box>
        </Menu>
      </Sidebar>
    </Box>
  );
};

export default MySidebar;