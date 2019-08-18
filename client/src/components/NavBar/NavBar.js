import React, { Component } from "react";
import { Link } from "react-router-dom";
import './NavBar.css';
import {connect} from "react-redux";
import {logoutUser} from "../../actions/authActions";
import PropTypes from "prop-types";

class NavBar extends Component {
    constructor(props) {
        super(props);
        this.onLogoutClick = this.onLogoutClick.bind(this);
    }

    onLogoutClick = e => {
        e.preventDefault();
        this.props.logoutUser();
    };

    render() {
        if (this.props.auth.isAuthenticated) {
            return (
              <nav className="blue accent-3">
                <div className="nav-wrapper">
                  <Link to="/" className="brand-logo">
                    Barko
                  </Link>
                  <ul id="nav-mobile" className="right hide-on-med-and-down">
                    <li><a href="/containers">Manifest Files</a></li>
                    <li><a href="/tracking">Tracking</a></li>
                    <li><a onClick={this.onLogoutClick}>Logout</a></li>
                  </ul>
                </div>
              </nav>
            );
        } else {
            return (
                <nav className="blue accent-3">
                    <div className="nav-wrapper">
                    <Link to="/" className="brand-logo">
                        Barko
                    </Link>
                    <ul id="nav-mobile" className="right hide-on-med-and-down">
                        <li><a href="/tracking">Tracking</a></li>
                        <li><a href="/about">About Us</a></li>
                    </ul>
                    </div>
                </nav>
            )
        }

  }
}

NavBar.propTypes = {
    logoutUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(
    mapStateToProps,
    { logoutUser }
)(NavBar);

