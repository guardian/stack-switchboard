import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";

import { SwitchboardTable } from "./components/switchboardTable";
import { CustomNav } from "./components/customNav";
import { Index } from "./components";
import { CentralProduction } from "./components/centralProduction";

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <CustomNav />
        <Switch>
          <Route path="/switchboard">
            <SwitchboardTable />
          </Route>
          <Route path="/centralproduction">
            <CentralProduction />
          </Route>
          <Route path="/">
            <Index />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default App;
