import React, { Component } from "react";
import { Redirect } from 'react-router-dom';
import './TrackingForm.css';

class TrackingForm extends Component {
	state = {
		trackingNumber: "",
		surname: "",
		response: "",
		formValidated: false
	};

	onChangeHandler = e => this.setState({ [e.target.name]: e.target.value });

	trackParcel = async e => {
		e.preventDefault();

		if(this.state.trackingNumber === "" && this.state.surname === "") {
		this.setState({ response: "Please enter tracking number and surname." });
		this.trackingNumberInput.focus();
		} else if(this.state.trackingNumber === "") {
		this.setState({ response: "Please enter tracking number." });
		this.trackingNumberInput.focus();

		} else if(this.state.surname === "") {
		this.setState({ response: "Please enter surname." });
		this.surnameInput.focus();
		}
		
		if(this.state.trackingNumber && this.state.surname)
		this.setState({ formValidated: true });
	};

	render() {

		if (this.state.formValidated === true) {

		return ( 
			<Redirect to={{
				pathname: "/track",
				trackingRequest: {
				trackingNumber: this.state.trackingNumber,
				surname: this.state.surname
				}
			}} />
		);
		}

		return (
			<form className="TrackingForm" onSubmit={this.trackParcel}>
				<input
				type="text"
				id="trackingNumber"
				name="trackingNumber"
				className="form-control"
				value={this.state.trackingNumber}
				onChange={this.onChangeHandler}
				ref={(input) => { this.trackingNumberInput = input; }}
				placeholder="Enter tracking number"
				/>
				<br />

				<input
					type="text"
					id="surname"
					name="surname"
					className="form-control"
					value={this.state.surname}
					onChange={this.onChangeHandler}
					ref={(input) => { this.surnameInput = input; }}
					placeholder="Enter surname"
				/>

				<div className="Validation-Message">{this.state.response && this.state.response}</div> 
				<br /><br />
				<button type="submit" className="btn btn-large waves-effect waves-light hoverable Track-Btn">
					Track parcel
				</button>
			</form>
		);
	}
}

export default TrackingForm;