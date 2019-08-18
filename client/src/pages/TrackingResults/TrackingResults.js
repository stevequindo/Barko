import React from 'react';
import { GridLoader } from 'react-spinners';
import './TrackingResults.css';

class TrackingResults extends React.Component {

  state = {
    trackingResults: [],
    error: ""
  };

  async componentDidMount() {

    const trackingNumber = this.props.location.trackingRequest.trackingNumber;
    const surname = this.props.location.trackingRequest.surname;

    fetch(`/api/tracking`, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        body : JSON.stringify({
            trackingNumber: trackingNumber,
            surname: surname
        }),
        redirect: 'follow',
        referrer: 'no-referrer'
        })
    .then(res => res.json())
    .then(res => this.setState({ trackingResults: res}))
    .catch(err => this.setState({error:err.message}));
  }   

  render() {
    let results;

    if(this.state.error) return (
        <h4>Error: { this.state.error }</h4>
    );

    if (this.state.trackingResults) {
        results =
            this.state.trackingResults &&
            this.state.trackingResults.map(entry => (
                <tr key={entry.results.trackingNumber}>
                    <td>{entry.results.trackingNumber}</td>
                    <td>{entry.results.sender}</td>
                    <td>{entry.results.receiver}</td>
                    <td>{entry.results.stage}</td>
                    <td>{entry.results.eta}</td>
                    <td>{
                            entry.results.files.map(file => {
                                const fileLink = `api/containers/${file.containerId}/files/${file.fileId}`;
                                // TODO: link doesnt proxy properly
                                return (
                                    <a className="document-links" key={file.fileId} href={fileLink}>{file.fileName}</a>
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
