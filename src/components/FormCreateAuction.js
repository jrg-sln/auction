import DatePicker from 'react-datepicker';
import React from 'react';
import { Row, Col, Button, Form } from 'react-bootstrap';
import ipfs from './ipfs';

class FormCreateAuction extends React.Component {
  constructor(props) {
    super(props);
    let ahora = new Date();
    this.state = {precioInicial: {value: '',
                                  error: false},
                  startDate:  new Date(ahora.getTime() + 1*60000),
                  endDate: new Date(ahora.getTime() + 6*60000),
                  loading: false
                 };

    this.handleChange = this.handleChange.bind(this);
    this.handleChange1 = this.handleChange1.bind(this);
    this.handleChange2 = this.handleChange2.bind(this);
    this.validatePrecioInicial = this.validatePrecioInicial.bind(this);
    this.captureFile = this.captureFile.bind(this);
    this.createAuction = this.createAuction.bind(this);

  }

  // Time picker
  handleChange1(date) {
    this.setState({
      startDate: date
    });
  }

  handleChange2(date) {
    this.setState({
      endDate: date
    });
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
                                     message: "No puede ser vacío"}});
    }else{
      this.setState({precioInicial: {value: this.state.precioInicial.value,
                                     error: false}});

    }
  }

  createAuction(event) {
    this.setState({loading:true});
    event.preventDefault();
    let now = new Date().getTime()
    let initialTime = this.state.startDate.getTime()
    let endTime = this.state.endDate.getTime()

    let dif = endTime - initialTime
    let endTimeBlock = Math.floor(dif/15000)

    if (endTimeBlock <= 0){
      alert('La fecha y hora inicial debe ser menor a la fecha final')
      return
    }

    let dif2 = initialTime - now
    let initialTimeBlock = Math.floor(dif2/15000)
    if (dif2 < 0){
      alert('La fecha y hora inicial no puede estar en el pasado.')
      return
    }

    if (this.state.buffer === null) {
      alert('Falta seleccionar una imagen.')
      return
    }

    let pay = this.props.web3.utils.toWei("0.1", 'ether');

    if(window.confirm("¿Aceptas un cobro de 0.1 ether por comisión?")) {
      ipfs.files.add(this.state.buffer, (error, result) => {
        if(error){
            console.log(error)
            return
        }

        this.props.AuctionFactoryContract.methods.createAuction(
        console.log("Valores nueva Subasta",
                    {
                        initialTimeBlock: initialTimeBlock,
                        endTimeBlock: endTimeBlock,
                        initialTime: initialTime,
                        endTime: endTime
                    });

            initialTimeBlock,
            endTimeBlock,
            initialTime,
            endTime,
            result[0].hash,
            this.state.precioInicial.value
        ).send({ from: this.props.currentAccount,
                 value: pay,
                 gas: 4000000,
                 gasPrice: 20000000000 })
            .on('receipt', recipient => {
                this.setState({loading: false})
            })
            .on('error', (error, receipt) => {
                alert("Lo sentimos, hubo un error.");
                this.setState({loading: false})
            });

    });
                                                                        }
  }

  captureFile(event) {
    event.preventDefault();
    if(event.target.files[0]){
      const file = event.target.files[0];
      const reader = new window.FileReader();
      reader.readAsArrayBuffer(file);
      reader.onloadend = () =>{
        this.setState({ buffer: Buffer(reader.result)});
      };
    }else{
      this.setState({ buffer: undefined});
    }
  }

  render() {
    return (
      <Form>

        <Form.Group as={Row} controlId="formPrecioInicial">
          <Form.Label column sm={4}>Precio Inicial (ether)*</Form.Label>
          <Col sm={4}>
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
          <Col sm={4}>
            <Form.File id="loteImagen" onChange={this.captureFile}/>
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="fechas">
          <Form.Label column sm={4}>Inicio</Form.Label>
            <DatePicker
              selected={ this.state.startDate }
              onChange={ this.handleChange1 }
              showTimeSelect
              minDate={ this.state.startDate }
              timeFormat="HH:mm"
              timeIntervals={5}
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm aa"
            />
        </Form.Group>

        <Form.Group as={Row} controlId="fechas">
          <Form.Label column sm={4}>Fin</Form.Label>
            <DatePicker
              selected={ this.state.endDate }
              onChange={ this.handleChange2 }
              showTimeSelect
              minDate={ this.state.startDate }
              timeFormat="HH:mm"
              timeIntervals={5}
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm aa"
            />
        </Form.Group>

        <Button
          onClick={this.state.isLoading ? null : this.createAuction}
          variant="primary"
          active="false"
          disabled={!Boolean(typeof this.state.buffer !== 'undefined' &
                             this.state.precioInicial.value !== '' &
                             !this.state.precioInicial.error) || this.state.loading}>
          {this.state.loading ? 'Procesando…' : 'Crear Subasta'}
        </Button>
      </Form>
    );
  }
}

export default FormCreateAuction;
