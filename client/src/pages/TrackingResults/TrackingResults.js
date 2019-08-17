import React from 'react';
import { Redirect } from 'react-router-dom';
import { GridLoader } from 'react-spinners';
import './TrackingResults.css';
import axios from 'axios';
import { isUndefined } from 'util';

class TrackingResults extends  React.Component {
    constructor(props) {
        super(props);
        this.state = {
            trackingResults: [],
            error: ""
        };
    }
    
    async componentDidMount() {
        console.log(this.props.location.trackingRequest.trackingNumber + ": "+ this.props.location.trackingRequest.surname)
        try {
            const res = await axios.post("./api/tracking", {
                    trackingNumber: this.props.location.trackingRequest.trackingNumber,
                    surname: this.props.location.trackingRequest.surname
            });

            console.log(res.data);
            this.setState({ trackingResults: res.data });
            this.state.trackingResults.map(item => (console.log(item.results.containerId)))
        } catch (err) {
            this.setState({ error: err.message });
        }
    }   

    render() {
        if(typeof(this.props.location.trackingRequest.trackingNumber) !== "undefined") {
            console.log("works") 
        } else {

            console.log("doesnt works") 
        }
        
        let results;

        if(this.state.error) return (<h4>Error: { this.state.error }</h4>);
        
        if(this.state.trackingResults)
            results = this.state.trackingResults &&
                this.state.trackingResults.map(item => (
                <tr>
                    <td>{item.results.trackingNumber}</td> 
                    <td>{item.results.sender}</td>
                    <td>{item.results.receiver}</td>
                    <td>{item.results.status}</td>
                    <td>{item.results.eta}</td>
                    <td>{item.results.files.map(file => (
                        <p>{file.fileName}</p>
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
