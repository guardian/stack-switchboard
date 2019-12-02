import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  useLocation
} from "react-router-dom";
import "./App.css";

import { CustomNav } from "./components/customNav";
import { Index } from "./views";
import { CentralProduction } from "./views/centralProduction";
import { Switchboard } from "./views/switchboard";
import { CLIENT_ENDPOINTS } from "./utils/values";
import { Stacks } from "./views/stacks";

const NoMatch = () => {
  let location = useLocation();

  return (
    <div style={{ textAlign: "center" }}>
      <h3>
        404: No match for <code>{location.pathname}</code>
      </h3>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router basename={"/prod"}>
      <div className="App">
        <CustomNav />
        <Switch>
          <Route path={CLIENT_ENDPOINTS.AUTOSCALING_GROUPS}>
            <Switchboard />
          </Route>
          <Route path={CLIENT_ENDPOINTS.CENTRAL_PROD}>
            <CentralProduction />
          </Route>
          <Route path={CLIENT_ENDPOINTS.STACKS}>
            <Stacks />
          </Route>
          <Route exact path="/">
            <Index />
          </Route>
          <Route path="/*">
            <NoMatch />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default App;
