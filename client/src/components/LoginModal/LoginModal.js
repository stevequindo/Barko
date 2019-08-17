import React from 'react';
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { loginUser } from "../../auth/actions/authActions";
import classnames from "classnames";
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import "./LoginModal.css";

class LoginModal extends React.Component {
    constructor() {
        super();
        this.state = {
            openModal: false,
            email: "",
            password: "",
            errors: {}
        };
    }

    componentDidMount() {
        // If logged in and user navigates to Login page, should redirect them to dashboard
        if (this.props.auth.isAuthenticated) {
          this.props.history.push("/dashboard");
        }
      }
    
    componentWillReceiveProps(nextProps) {
        if (nextProps.auth.isAuthenticated) {
          this.props.history.push("/dashboard");
        }
    
        if (nextProps.errors) {
          this.setState({
            errors: nextProps.errors
          });
        }
    }
    
    onChange = e => {
        this.setState({ [e.target.id]: e.target.value });
    };
    
    onSubmit = e => {
        e.preventDefault();
    
        const userData = {
          email: this.state.email,
          password: this.state.password
        };
    
        this.props.loginUser(userData);
    };
    
    toggle() {
        this.setState({ openModal: !this.state.openModal });
    }

    okButton = () => {
        this.toggle();
    }

    goBackButton = () => {
        this.toggle(); 
    }

    render() {
        
        const { errors, openModal } = this.state;
        return (
          <div>
                <button className="btn btn-large btn-flat waves-effect black-text Login-Btn" onClick={() => this.toggle()}>
                    Login
                </button>
                <Modal isOpen={openModal}>
                    <ModalHeader toggle={this.toggle}>
                        Login
                    </ModalHeader>
                    <ModalBody className="Confirmation-Modal-Wrapper">
                        <form noValidate onSubmit={this.onSubmit}>
                            <div className="input-field col s12">
                                <input
                                onChange={this.onChange}
                                value={this.state.email}
                                error={errors.email}
                                id="email"
                                type="email"
                                className={classnames("", {
                                    invalid: errors.email || errors.emailnotfound
                                })}
                                />
                                <label htmlFor="email">Email</label>
                                <span className="red-text">
                                {errors.email}
                                {errors.emailnotfound}
                                </span>
                            </div>
                            <div className="input-field col s12">
                                <input
                                onChange={this.onChange}
                                value={this.state.password}
                                error={errors.password}
                                id="password"
                                type="password"
                                className={classnames("", {
                                    invalid: errors.password || errors.passwordincorrect
                                })}
                                />
                                <label htmlFor="password">Password</label>
                                <span className="red-text">
                                {errors.password}
                                {errors.passwordincorrect}
                                </span>
                            </div>
                            <div className="col s12" style={{ paddingLeft: "11.250px" }}>
                                <button
                                style={{
                                    width: "150px",
                                    borderRadius: "3px",
                                    letterSpacing: "1.5px",
                                    marginTop: "1rem"
                                }}
                                type="submit"
                                className="btn btn-large waves-effect waves-light hoverable blue accent-3"
                                >
                                Login
                                </button>
                            </div>
                        </form>
                        <div className="mt-4">
                            <Button className="OK-Btn" color="primary" onClick={() => this.okButton()}>OK, I understand</Button>
                            <Button className="OK-Btn" color="link" onClick={() => this.goBackButton()}>Go Back</Button>
                        </div>
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}
LoginModal.propTypes = {
    loginUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth,
    errors: state.errors
});

export default connect(
    mapStateToProps,
    { loginUser }
)(LoginModal);
  