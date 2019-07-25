import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import jwt_decode from "jwt-decode";
import setAuthToken from "../../utils/setAuthToken";

import { setCurrentUser, logoutUser } from "../../actions/authActions";
import { Provider } from "react-redux";
import store from "../../store";

import NavBar from "../NavBar/NavBar";
import Landing from "../Landing/Landing";
import Register from "../auth/Register";
import Login from "../auth/Login";
import PrivateRoute from "../private-route/PrivateRoute";
import Dashboard from "../Dashboard/Dashboard";
import Containers from "../Containers/Containers";
import TrackingResults from "../TrackingResults/TrackingResults";

import "./App.css";

// Check for token to keep user logged in
if (localStorage.jwtToken) {
  // Set auth token header auth
  const token = localStorage.jwtToken;
  setAuthToken(token);
  // Decode token and get user info and exp
  const decoded = jwt_decode(token);
  // Set user and isAuthenticated
  store.dispatch(setCurrentUser(decoded));
  // Check for expired token
  const currentTime = Date.now() / 1000; // to get in milliseconds

  if (decoded.exp < currentTime) {
    // Logout user
    store.dispatch(logoutUser());

    // Redirect to login
    window.location.href = "./login";
  }
}
class App extends Component {
    render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            <NavBar />
            <Route exact path="/" component={Landing} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/tracking" component={TrackingResults} />
            <Switch>
              <PrivateRoute exact path="/dashboard" component={Dashboard} />
              <PrivateRoute exact path="/containers" component={Containers} />
            </Switch>
          </div>
        </Router>
      </Provider>
    );
  }
}
export default App;
