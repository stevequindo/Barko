import React, { Component } from "react";
import { Link } from "react-router-dom";
import './NavBar.css';

class Navbar extends Component {
  render() {
    return (
      <nav className="blue accent-3">
        <div className="nav-wrapper">
          <Link to="/" className="brand-logo">
            Barko
          </Link>
          <ul id="nav-mobile" className="right hide-on-med-and-down">
            <li><a href="/">...</a></li>
          </ul>
        </div>
      </nav>
    );
  }
}

export default Navbar;
