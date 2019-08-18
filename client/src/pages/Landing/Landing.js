import React from "react";
import { Link } from "react-router-dom";
import Divider from '@material-ui/core/Divider';
import "./Landing.css";
import PropTypes from "prop-types";
import {logoutUser} from "../../auth/actions/authActions";
import {connect} from "react-redux";

// Components
import TrackingForm from "../../components/TrackingForm/TrackingForm";

class Landing extends React.Component {

    componentDidMount() {
        if (this.props.auth.isAuthenticated) {
            this.props.history.push("/dashboard");
        }
    };

    render() {
        return (
            <div className="Landing-Page-Wrapper">
                <div className="Form-Area">
                    <h4>
                        <img className="Icon" src="images/icon.png" alt="Barko Logo" height="25px" />{" "}
                        Barko
                    </h4>
                    <TrackingForm />
                    
                    <br />
                    <Divider style={{width: "40%"}}/>
                    <Divider style={{width: "40%", float: "right"}}/>
                    <p style={{"z-index": "1", "margin": "-4% 0 10px 140px"}}>or</p>
                    <Link to="/login" className="btn btn-large btn-flat waves-effect black-text Login-Btn">
                        Log In
                    </Link>
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