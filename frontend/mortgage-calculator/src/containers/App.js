import React, { Component } from "react";
import "./App.scss";
import FormContainer from "./FormContainer";

class App extends Component {
  handleSubmit = (event) => {
    console.log(event);
  };

  render() {
    return (
      <div className="App">
        <div className="container">
          <FormContainer />
        </div>
      </div>
    );
  }
}

export default App;
