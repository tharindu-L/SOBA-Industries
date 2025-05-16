import App from "./App";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom"; // Import Router

ReactDOM.render(
  <Router> {/* Wrap the App in Router */}
    <App />
  </Router>,
  document.getElementById("root")
);
