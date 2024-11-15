import React from "react";
import ContextContainer from "./store/Store";
import Navbar from "./components/navbar/Navbar";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <div>
      <ContextContainer>
        <ToastContainer />
        <Navbar />
        <Outlet />
      </ContextContainer>
    </div>
  );
};

export default App;
