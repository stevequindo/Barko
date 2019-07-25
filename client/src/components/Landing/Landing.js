import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./Landing.css";
import PropTypes from "prop-types";
import {logoutUser} from "../../actions/authActions";
import TrackingForm from "../TrackingForm/TrackingForm";
import {connect} from "react-redux";

class Landing extends Component {

    componentDidMount() {
        if (this.props.auth.isAuthenticated) {
            this.props.history.push("/dashboard");
        }
    };

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

Landing.propTypes = {
    logoutUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
   auth: state.auth
});

export default connect(
    mapStateToProps,
    {logoutUser}
)(Landing);