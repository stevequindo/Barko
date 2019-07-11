import React, { Component } from 'react';
import { GridLoader } from 'react-spinners';
import './TrackingResults.css';
const axios = require('axios');

class TrackingResults extends Component {

  state = {
    trackingResults: [],
    error: ""
  };

  async componentDidMount() {

    const trackingNumber = this.props.location.trackingRequest.trackingNumber;
    const surname = this.props.location.trackingRequest.surname;

    fetch(`/api/tracking?trackingNumber=${trackingNumber}&surname=${surname}`, {
        method: 'GET',
        mode: 'cors', // todo change
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        redirect: 'follow',
        referrer: 'no-referrer'
        })
    .then(res => res.json())
    .then(res => this.setState({ trackingResults: res.trackingResults }))
    .catch(err => this.setState({error:err.message}));
  }   

  render() {
    let results;

    if(this.state.error) return (<h4>Error: { this.state.error }</h4>);
    
    if (this.state.trackingResults) {
        results =
            this.state.trackingResults &&
            this.state.trackingResults.map(result => (
                <tr key={result.trackingNumber}>
                    <td>{result.trackingNumber}</td>
                    <td>{result.sender}</td>
                    <td>{result.receiver}</td>
                    <td>{result.status}</td>
                    <td>{result.eta}</td>
                    <td>{
                            result.files.map(file => {
                                const fileLink = '/api/';
                                return (
                                    <a className="document-links" key={file.fileId}>{file.fileName}</a>
                                )
                            })
                    }

                    </td>
                    </tr>
            ));
    } else {
        return (<div className="Spinner-Wrapper"> <GridLoader color={'#333'} /> </div>)
    }

    return (
      <div className="Tracking-Results-Wrapper">

        <h4>Tracking: { this.props.location.trackingRequest.trackingNumber }</h4>
        <table className="responsive-table highlight">
          <thead>
            <tr>
              <th>Tracking Number</th>
              <th>Sender</th>
              <th>Receiver</th>
              <th>Status</th>
              <th>ETA</th>
              <th>Additional Files</th>
            </tr>
          </thead>
          <tbody>
            {results}
          </tbody>
        </table>
      </div>
    );
  }
}

export default TrackingResults;
