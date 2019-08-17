import React from "react";
import { Link } from "react-router-dom";
import Divider from '@material-ui/core/Divider';
import "./Landing.css";

// Components
import TrackingForm from "../../components/TrackingForm/TrackingForm";
// import LoginModal from "../../components/LoginModal/LoginModal";

class Landing extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }


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

export default Landing;
