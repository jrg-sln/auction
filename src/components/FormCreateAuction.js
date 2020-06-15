import React from 'react';
import {Row, Col, Button, Form } from 'react-bootstrap';
import ipfs from './ipfs';

class FormCreateAuction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {precioInicial: {value: '',
                                  error: false}};

    this.handleChange = this.handleChange.bind(this);
    this.validatePrecioInicial = this.validatePrecioInicial.bind(this);
    this.captureFile = this.captureFile.bind(this);
    this.createAuction = this.createAuction.bind(this);
  }

  handleChange(event) {
    this.setState({precioInicial: {value: event.target.value,
                                   error: this.state.precioInicial.error,
                                   message: this.state.precioInicial.message }});
  }

  validatePrecioInicial(event){
    if(this.state.precioInicial.value === ''){
      this.setState({precioInicial: {value: this.state.precioInicial.value,
                                     error: true,
                                     message: "Precio inicial no puede sere vacío"}});
    }
  }

  // TODO Borrar  campos de la subusta
  createAuction(event) {
    event.preventDefault();
    ipfs.files.add(this.state.buffer, (error, result) =>{
      if(error){
        console.log(error);
        return;
      }
      this.props.AuctionFactoryContract.methods.createAuction(
        30,
        35,
        result[0].hash,
        this.state.precioInicial.value
      ).send({ from: this.props.currentAccount,
               gas: 4000000,
               gasPrice: 20000000000
             });
    });
  }

  captureFile(event) {
    event.preventDefault();
    if(event.target){
      const file = event.target.files[0];
      const reader = new window.FileReader();
      reader.readAsArrayBuffer(file);
      reader.onloadend = () =>{
        this.setState({ buffer: Buffer(reader.result)});
      };
    }
  }

  render() {
    return (
      <Form onSubmit={this.createAuction}>
        <Form.Group as={Row} controlId="formPrecioInicial">
          <Form.Label column sm={4}>Precio Inicial *</Form.Label>
          <Col sm={8}>
            <Form.Control
              className={this.state.precioInicial.error ? "is-invalid": ""}
              type="number"
              value={this.state.value}
              onChange={this.handleChange}
              onBlur={this.validatePrecioInicial}/>
            <Form.Control.Feedback type="invalid">
              {this.state.precioInicial.message}
            </Form.Control.Feedback>
        </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="formPrecioInicial">
         <Form.Label column sm={4}>Imagen *</Form.Label>
          <Col sm={8}>
            <Form.File id="loteImagen" onChange={this.captureFile}/>
          </Col>
        </Form.Group>
        <Button variant="primary" type="submit" active="false"
                disabled={!Boolean(typeof this.state.buffer !== 'undefined' &
                                   this.state.precioInicial.value !== '' &
                                   !this.state.precioInicial.error)}>
          Crear Subasta
        </Button>
      </Form>
    );
  }
}

export default FormCreateAuction;
