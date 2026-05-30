import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function MainLayout({ children }) {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box
        sx={{
          marginLeft: "240px",
          marginTop: "64px",
          padding: 3,
          flex: 1,
          minHeight: "100vh",
          backgroundColor: "#f0f2f5",
        }}
      >
        {children}
      </Box>
      <Topbar />
    </Box>
  );
}

export default MainLayout;