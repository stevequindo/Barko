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

    try {
      const res = await axios.post("./api/tracking", {

          trackingNumber: this.props.location.trackingRequest.trackingNumber,
          surname: this.props.location.trackingRequest.surname
        }
      );

      console.log(res.data);

      this.setState({ trackingResults: res.data.trackingResults });
      console.log(this.state.trackingResults);

      console.log(res.data.trackingInfo);

    } catch (err) {
      this.setState({ error: err.message });
    }
  }   

  render() {
    let results;

    if(this.state.error) return (<h4>Error: { this.state.error }</h4>);
    
    if(this.state.trackingResults)
      results =
        this.state.trackingResults &&
        this.state.trackingResults.map(result => (
          <tr>
            <td>{result.trackingNumber}</td> 
            <td>{result.sender}</td>
            <td>{result.receiver}</td>
            <td>{result.status}</td>
            <td>{result.eta}</td>
            <td>{result.files.additionalFiles.map(file => (
                  <p>{file.name}</p>
                  // <img className="Image-file" src={"overview/id/" + result.containerId + "/file/" + file._id}/>
              ))}
            </td>
            
          </tr>
        ));
    else return <div className="Spinner-Wrapper"> <GridLoader color={'#333'} /> </div>;

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
