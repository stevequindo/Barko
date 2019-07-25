import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./Landing.css";

import TrackingForm from "../TrackingForm/TrackingForm";

class Landing extends Component {
  render() {
    return (
      <div style={{ height: "75vh" }} className="container valign-wrapper">
        <div className="row">
          <div className="col s12 center-align">
            <h4><img className="Icon" src="images/icon.png" alt="Barko Logo" height="25px" />{" "}
              Barko
            </h4>
            <TrackingForm />
            <br />
            <Link
              to="/register" className="btn btn-large btn-flat waves-effect white black-text Register-Btn">
              Register
            </Link>
            <Link to="/login" className="btn btn-large btn-flat waves-effect white black-text Login-Btn">
              Log In
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default Landing;
