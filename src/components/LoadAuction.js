import React, { Component } from 'react';
import ipfs from './ipfs';

class LoadAuction extends Component {
  constructor (props){
    super(props);
    this.state = {
      buffer: null,
      ipfsHash:'',
      price: 0,
      increment: 0
    }
    this.captureFile = this.captureFile.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChange(event){
    /*const re = /^[0-9\b]+$/;
    // if value is not blank, then test the regex
    if (event.target.value === '' || re.test(event.target.value)) {
       this.setState({value: event.target.value})
    }*/
}

  captureFile(event) {
    event.preventDefault();
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () =>{
      this.setState({ buffer: Buffer(reader.result)})
      //console.log('buffer', this.state.buffer)
    }
  }

  onSubmit(event) {
    event.preventDefault();
    this.refs.btn.setAttribute("disabled", "disabled");
    ipfs.files.add(this.state.buffer, (error, result) =>{
      if(error){
        console.log(error)
        return
      }
      this.setState({ipfsHash: result[0].hash})
      console.log('ipfsHash', this.state.ipfsHash)
      console.log('price', this.state.price)
      console.log('increment', this.state.increment)
    })
  }

  render() {
    return (
      <div id="content">
        <h3>Set up your auction </h3>
        <h4>{this.props.account}</h4>
        <div id="content">
          <form onSubmit={this.onSubmit}>
            <table className="table">
              <tbody>
                <tr>
                  <td>Initial price</td>
                  <td><input type='text' value={this.state.price} onChange={this.onChange} required/></td>
                </tr>
                <tr>
                  <td>Min bid increment</td>
                  <td><input type='text' value={this.state.increment} onChange={this.onChange} required/></td>
                </tr>
                <tr>
                  <td>Image</td>
                  <td><input type='file' onChange={this.captureFile} required/></td>
                </tr>
              </tbody>
            </table>
            <input type='submit' ref="btn" />
          </form>
          
        </div>
      </div>
    );
  }
}

export default LoadAuction;

/*
<img src={'https://ipfs.io/ipfs/${this.state.ipfsHash}'} alt='' />
*/