import React from "react";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";

class Containers extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<h3 style={{textAlign: "center"}}>Containers Component</h3>
		)
	}
}

export default Containers;