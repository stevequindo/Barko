import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import jwt_decode from "jwt-decode";

import store from "./store";
import { Provider } from "react-redux";
import setAuthToken from "./auth/utils/setAuthToken";
import PrivateRoute from "./auth/private-route/PrivateRoute";
import { setCurrentUser, logoutUser } from "./auth/actions/authActions";

// Pages
import Landing from "./pages/Landing/Landing";
import Login from "./pages/Authentication/Login";
import Register from "./pages/Authentication/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import TrackingResults from "./pages/TrackingResults/TrackingResults";

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
            <Route exact path="/" component={Landing} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/track" component={TrackingResults} />
            <Switch>
              <PrivateRoute exact path="/dashboard" component={Dashboard} />
            </Switch>
          </div>
        </Router>
      </Provider>
    );
  }
}
export default App;
