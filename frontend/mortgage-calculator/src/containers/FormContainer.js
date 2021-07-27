import React, { Component } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "muicss/dist/css/mui.css";
import Form from "muicss/lib/react/form";
import Input from "muicss/lib/react/input";
import Button from "muicss/lib/react/button";
import Container from "muicss/lib/react/container";
import Row from "muicss/lib/react/row";
import Col from "muicss/lib/react/col";
import numeral from "numeral";
import "./FormContainer.scss";
import Option from "muicss/lib/react/option";
import Select from "muicss/lib/react/select";
import axios from "axios";

const paymentStyles = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: "40px",
};

const containerStyles = {
  marginTop: "60px",
};

class FormContainer extends Component {
  onChange(ev) {
    this.setState({ value: ev.target.value });
  }
  constructor(props) {
    super(props);

    this.state = {
      newCalculation: {
        counties: [],
        count_id: "",
        states: [],
        state_id: "",
        purchasePrice: "",
        downPayment: "",
        loanTerm: "",
        interestRate: "",
        propertyTaxes: "",
        pmi: "",
        total: "",
      },
    };

    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleClearForm = this.handleClearForm.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handlePropertyTaxesInput = this.handlePropertyTaxesInput.bind(this);
    this.handleCounties = this.handleCounties.bind(this);
  }

  componentDidMount = () => {
    axios
      .get("http://localhost:5000/states")
      .then((res) => res.data)
      .then((data) => {
        console.log(data);
        this.setState((prevState) => {
          return {
            newCalculation: {
              ...prevState.newCalculation,
              states: data,
            },
          };
        });
      })
      .catch(console.log);
  };

  handlePropertyTaxesInput = (e) => {
    let value = parseInt(e.target.value);
    let propertyTaxes = this.state.newCalculation.counties
      .filter(function (county) {
        return county.count_id === value;
      })[0]
      .property_taxes.toString();
    console.log(this.state.newCalculation);
    console.log(propertyTaxes);
    this.setState((prevState) => {
      return {
        newCalculation: {
          ...prevState.newCalculation,
          propertyTaxes: propertyTaxes,
          count_id: value,
        },
      };
    });
  };

  handleCounties = (e) => {
    let value = parseInt(e.target.value);
    let propertyTaxes = this.state.newCalculation.states
      .filter(function (state) {
        return state.state_id === value;
      })[0]
      .property_taxes.toString();
    console.log(value);
    let url = `http://localhost:5000/states/${value}/counties`;
    axios
      .get(url)
      .then((res) => res.data.counties)
      .then((data) => {
        console.log(data);
        this.setState((prevState) => {
          return {
            newCalculation: {
              ...prevState.newCalculation,
              counties: data,
              state_id: value,
              propertyTaxes: propertyTaxes,
            },
          };
        });
      })
      .catch(console.log);
  };

  handleInput = (e) => {
    let value = e.target.value;
    let name = e.target.name;
    let int = parseFloat(value);
    if (!isNaN(int)) {
      this.setState((prevState) => {
        return {
          newCalculation: {
            ...prevState.newCalculation,
            [name]: value,
          },
        };
      });
    } else {
      this.setState((prevState) => {
        return {
          newCalculation: {
            ...prevState.newCalculation,
            [name]: "",
          },
        };
      });
      this.notify("Please Enter A Number!");
    }
  };

  handleFormSubmit = (e) => {
    e.preventDefault();
    let calcData = this.state.newCalculation;
    let errors = [];
    if (calcData.purchasePrice === "") {
      this.notify("Purchase Price Is Empty!");
    }
    if (calcData.downPayment === "") {
      this.notify("Down Payment Is Empty!");
    }
    if (calcData.loanTerm === "") {
      this.notify("Loan Term Is Empty!");
    }
    if (calcData.interestRate === "") {
      this.notify("Interest Rate Is Empty!");
    }
    if (calcData.propertyTaxes === "") {
    }
    if (calcData.pmi === "") {
      this.notify("PMI Is Empty!");
    } else {
      let purchasePrice = parseFloat(calcData.purchasePrice);
      let downPayment = parseFloat(calcData.downPayment);
      let interestRate = parseFloat(calcData.interestRate);
      let propertyTaxes = parseFloat(calcData.propertyTaxes);
      let pmi = parseFloat(calcData.pmi);
      let loanTerm = parseInt(calcData.loanTerm);
      let numberOfPayments = loanTerm * 12;
      let principal = purchasePrice - downPayment;
      let monthlyInterest = interestRate / 100 / 12;
      propertyTaxes = propertyTaxes / 100 / 12;
      let cal_pmi = 0;

      if (pmi != 0) {
        pmi = pmi / 100 / 12;
        cal_pmi = (principal * (pmi * (1 + pmi))) / (1 + pmi);
      }

      let calc_apr =
        (principal *
          [monthlyInterest * (1 + monthlyInterest) ** numberOfPayments]) /
        [(1 + monthlyInterest) ** numberOfPayments - 1];

      let calc_property_Taxes =
        (principal * (propertyTaxes * (1 + propertyTaxes))) /
        (1 + propertyTaxes);

      let monthlyPrice = calc_apr + calc_property_Taxes + cal_pmi;

      console.log(monthlyPrice);

      this.setState(
        (prevState) => {
          return {
            newCalculation: {
              ...prevState.newCalculation,
              total: monthlyPrice,
            },
          };
        },
        () => console.log(this.state.newCalculation)
      );
    }
  };

  handleClearForm = (e) => {
    e.preventDefault();
    this.setState({
      newCalculation: {
        purchasePrice: "",
        downPayment: "",
        loanTerm: "",
        interestRate: "",
        propertyTaxes: "",
        pmi: "",
        total: "",
      },
    });
  };

  notify = (message) => toast.error(message);

  render() {
    console.log("counties:");
    console.log(this.state.newCalculation.counties);
    return (
      <Container style={containerStyles}>
        <Form onSubmit={this.handleFormSubmit}>
          <Row>
            <Col xs="12" className="mui--text-center">
              <legend className="legend">Amortization Calculator</legend>
            </Col>
          </Row>
          <Row>
            <Col md="6">
              <Input
                label={"PURCHASE PRICE"}
                required={true}
                name={"purchasePrice"}
                value={this.state.newCalculation.purchasePrice}
                onChange={this.handleInput}
                floatingLabel={true}
              />
            </Col>
            <Col md="6">
              <Input
                label={"DOWN PAYMENT"}
                required={true}
                name={"downPayment"}
                value={this.state.newCalculation.downPayment}
                onChange={this.handleInput}
                floatingLabel={true}
              />
            </Col>
            <Col md="4">
              <Input
                label={"LOAN TERM (YEARS)"}
                required={true}
                name={"loanTerm"}
                value={this.state.newCalculation.loanTerm}
                onChange={this.handleInput}
                floatingLabel={true}
              />
            </Col>
            <Col md="4">
              <Input
                label={"APR (%)"}
                required={true}
                name={"interestRate"}
                value={this.state.newCalculation.interestRate}
                onChange={this.handleInput}
                floatingLabel={true}
              />
            </Col>
            <Col md="4">
              <Input
                label={"Private Mortgage Insurance (PMI %)"}
                required={true}
                name={"pmi"}
                value={this.state.newCalculation.pmi}
                onChange={this.handleInput}
                floatingLabel={true}
              />
            </Col>
            <Col md="4">
              <form>
                <Select
                  label={"State"}
                  name="input"
                  useDefault={true}
                  defaultValue={this.state.newCalculation.state_id}
                  onChange={this.handleCounties}
                  on
                >
                  {this.state.newCalculation.states.map(function (option, i) {
                    return (
                      <Option
                        key={option.state_id}
                        value={option.state_id}
                        label={option.name}
                      />
                    );
                  })}
                </Select>
              </form>
            </Col>
            <Col md="4">
              <form>
                <Select
                  label={"Counties"}
                  name="input"
                  useDefault={true}
                  defaultValue={this.state.newCalculation.count_id}
                  onChange={this.handlePropertyTaxesInput}
                >
                  {this.state.newCalculation.counties.map(function (option, i) {
                    return (
                      <Option
                        key={option.count_id}
                        value={option.count_id}
                        label={option.name}
                      />
                    );
                  })}
                </Select>
              </form>
            </Col>
            <Col md="4">
              <form>
                <Input
                  label={"Property Taxes (%)"}
                  required={true}
                  name={"propertTaxes"}
                  value={this.state.newCalculation.propertyTaxes}
                  onChange={this.handleInput}
                  floatingLabel={true}
                />
              </form>
            </Col>
          </Row>
          <div style={paymentStyles}>
            <Button>Calculate</Button>
          </div>
        </Form>
        <div style={paymentStyles}>
          <h3>
            Monthly Payments:{" "}
            {numeral(this.state.newCalculation.total).format("$0,0.00")}
          </h3>
        </div>
        <ToastContainer />
      </Container>
    );
  }
}

export default FormContainer;
