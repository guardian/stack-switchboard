import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";

import { CustomNav } from "./components/customNav";
import { Index } from "./views";
import { CentralProduction } from "./views/centralProduction";
import { Switchboard } from "./views/switchboard";
import { CLIENT_ENDPOINTS } from "./utils/values";

const App: React.FC = () => {
  return (
    <Router basename={"/prod"}>
      <div className="App">
        <CustomNav />
        <Switch>
          <Route path={CLIENT_ENDPOINTS.SWITCHBOARD}>
            <Switchboard />
          </Route>
          <Route path={CLIENT_ENDPOINTS.CENTRAL_PROD}>
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
