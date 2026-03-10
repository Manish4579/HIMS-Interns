


import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";

function Layout() {

  return (

    <Box>

      <Sidebar />

      <Box
        ml="260px"
        p={6}
        minH="100vh"
        bg="gray.100"
      >
        <Outlet />
      </Box>

    </Box>

  );
}

export default Layout;