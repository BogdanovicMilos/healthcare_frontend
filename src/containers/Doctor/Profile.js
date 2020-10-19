import React, { Component } from "react";
import axios from "axios";
import Profile from "../../components/Doctor/Profile";
import Nav from "../../components/Main/Navbar";
import Header from "../../components/Main/Header";
// import { connect } from "react-redux";
import { NotificationManager } from "react-notifications";
import { HamburgerDiv } from "../../components/Main/HamburgerDiv";

const options = [
  { value: "RSD", label: "RSD" },
  { value: "EUR", label: "EUR" },
  { value: "USD", label: "USD" },
];

class DoctorProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      doctor: [],
      doctors: [],
      prefixValue: "",
      descriptionValue: "",
      priceValue: null,
      priceWebValue: null,
      select: "",
      token: sessionStorage.getItem("accessToken"),
    };
  }

  handlePrefix = (e) => {
    this.setState({ prefixValue: e.target.value });
  };

  handleSelect = (statusValue) => {
    let { value } = statusValue;
    this.setState({ select: value });
  };

  handleDescription = (e) => {
    this.setState({ descriptionValue: e.target.value });
  };

  handlePrice = (e) => {
    this.setState({ priceValue: e.target.value });
  };

  handleWebPrice = (e) => {
    this.setState({ priceWebValue: e.target.value });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const access_token = "Bearer ".concat(this.state.token);
    const data = await fetch(
      `https://healthcarebackend.xyz/api/doctor/profile/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: access_token,
        },
        body: JSON.stringify({
          prefix: this.state.prefixValue,
          description: this.state.descriptionValue,
          email_exam_price: this.state.priceValue,
          web_exam_price: this.state.priceWebValue,
          status: this.state.select,
        }),
      }
    );
    const jsonData = await data.json();
    console.log(jsonData, "profile changed");
    NotificationManager.success("Profile Updated!", "Successful!", 2000);
    this.handleDoctorProfile();
  };

  handleDoctorProfile = async () => {
    const access_token = "Bearer ".concat(this.state.token);
    axios
      .get(`https://healthcarebackend.xyz/api/doctor/profile/`, {
        headers: { Authorization: access_token },
      })
      .then((response) => {
        console.log(response, "doc profileee");

        return this.setState({ doctor: [response.data.data] });
      });
  };

  componentDidMount() {
    this.handleDoctorProfile();
  }

  render() {
    return (
      <>
        <div className="header">
          <div>
            <Header />
            <Nav />
          </div>
        </div>
        <HamburgerDiv/>
        <Profile
          status={options}
          doctor={this.state.doctor}
          prefixValue={this.prefixValue}
          descriptionValue={this.descriptionValue}
          priceValue={this.priceValue}
          priceWebValue={this.priceWebValue}
          submitValue={this.submitValue}
          handlePrefix={this.handlePrefix}
          handleDescription={this.handleDescription}
          handlePrice={this.handlePrice}
          handleWebPrice={this.handleWebPrice}
          handleSubmit={this.handleSubmit}
          handleSelect={this.handleSelect}
          props={this.state}
        />
      </>
    );
  }
}

// const mapStateToProps = state => {
//   const doctor = state.getIn(["doctorReducer", "doctor"]);

//   return {
//     doctor
//   };
// };

export default DoctorProfile;
