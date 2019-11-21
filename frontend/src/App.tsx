import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import SwitchboardTable from "./components/switchboardTable";
import "./App.css";
import CustomNav from "./components/nav";

const App: React.FC = () => {
  return (
    <div className="App">
      <CustomNav />
      <SwitchboardTable />
    </div>
  );
};

export default App;
