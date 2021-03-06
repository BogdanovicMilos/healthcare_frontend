import React, { Component } from "react";
import "../../App.css";
import Header from "../../components/Main/Header";
import RegisterUser from "../../components/Auth/Register";
import Nav from "../../components/Main/Navbar";
import axios from "axios";
import { NotificationManager } from "react-notifications";

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userType: "client",
      emailValue: "",
      firstNameValue: "",
      lastNameValue: "",
      passwordValue: "",
      confPasswordValue: "",
      addressValue: "",
      birthDateValue: "",
      EmailPrice: 0,
      WebPrice: 0,
      specOptions: [],
      specValue: "",
      selectedGenderValue: "",
      selectedSpecValue: "",
      phoneNumber: '',
      organization: '',
      seePass1: false,
      seePass2: false,
    };
  }

  handleImage1= () =>{
    this.setState({seePass1: !this.state.seePass1})
  }

  handleImage2= () =>{
    this.setState({seePass2: !this.state.seePass2})
  }

  handleUserType = (userType) => {
    this.setState({ userType, seePass1: false, seePass2: false });
  };

  handleEmail = (e) => {
    this.setState({ emailValue: e.target.value });
  };

  handleFirstName = (e) => {
    this.setState({ firstNameValue: e.target.value });
  };

  handleLastName = (e) => {
    this.setState({ lastNameValue: e.target.value });
  };

  handlePass = (e) => {
    this.setState({ passwordValue: e.target.value });
  };

  handleConfPass = (e) => {
    this.setState({ confPasswordValue: e.target.value });
  };

  handleAddress = (e) => {
    this.setState({ addressValue: e.target.value });
  };

  handleBirthDate = (e) => {
    this.setState({ birthDateValue: e.target.value });
  };

  handleEmailPrice = (e) => {
    this.setState({ EmailPrice: e.target.value });
  };

  handleWebPrice = (e) => {
    this.setState({ WebPrice: e.target.value });
  };

  handlePhoneNumber = (e) => {
    this.setState({phoneNumber: e.target.value})
  }

  handleOrganization = (e) =>{
    this.setState({organization: e.target.value})
  }

  handleSpec = (specValue) => {
    this.setState({ specValue });
    let { value } = specValue;
    this.setState({ selectedSpecValue: value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    if (
      this.state.userType === "client" &&
      this.state.emailValue &&
      this.state.firstNameValue &&
      this.state.lastNameValue &&
      this.state.passwordValue &&
      this.state.selectedGenderValue &&
      this.state.phoneNumber &&
      this.state.addressValue &&
      this.state.birthDateValue &&
      this.state.confPasswordValue 
    ) {
      this.userRegister();
    } else if (
      this.state.userType === "doctor" &&
      this.state.emailValue &&
      this.state.firstNameValue &&
      this.state.lastNameValue &&
      this.state.passwordValue &&
      this.state.confPasswordValue &&
      this.state.organization &&
      this.state.phoneNumber &&
      this.state.selectedGenderValue &&
      this.state.selectedSpecValue
    ) {
      this.userRegister();
    } else {
      NotificationManager.error("All Fields Are Required", "Failed!", 2000);
    }
  };

  componentDidMount() {
    axios
      .get("http://healthcarebackend.xyz/api/specialities/")
      .then((response) => {
        const res = response.data.data.map((val) => {
          return { value: val.id, label: val.name };
        });
        this.setState({ specOptions: res });
      });
  }

  userRegister = async () => {
    if (this.state.userType === "client") {
      if (this.state.confPasswordValue === this.state.passwordValue) {
        const client = await fetch(
          "http://healthcarebackend.xyz/api/auth/register/client/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: this.state.emailValue,
              first_name: this.state.firstNameValue,
              last_name: this.state.lastNameValue,
              phone: this.state.phoneNumber,
              password: this.state.passwordValue,
confirm_password: this.state.confPasswordValue,

              client: {
                gender: this.state.selectedGenderValue,
                address: this.state.addressValue,
                birth_date: this.state.birthDateValue,
              },
            }),
          }
        );
        this.props.history.push("/login");
        
        const jsonData = await client.json();
        jsonData.success &&  NotificationManager.success(
          "An email for confirmation will be sent shortly",
          "Successful!",
          4000
        );
        !jsonData.success && NotificationManager.error(`${jsonData.message}, "Failed`)
        return jsonData;
      } else {
        NotificationManager.error(
          "Confirm password does not match",
          "Failed!",
          4000
        );
      }
    } else if (this.state.userType === "doctor") {
      const doctor = await fetch(
        "http://healthcarebackend.xyz/api/auth/register/doctor/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // email: this.state.emailValue,
            // first_name: this.state.firstNameValue,
            // last_name: this.state.lastNameValue,
            // password: this.state.passwordValue,
            // phone: parseInt(this.state.phoneNumber),
            // doctor: {
            //   gender: this.state.selectedGenderValue,
            //   organization: this.state.organization,
            //   speciality: this.state.selectedSpecValue,

            // },
            email: this.state.emailValue,
            first_name: this.state.firstNameValue,
            last_name: this.state.lastNameValue,
            phone: this.state.phoneNumber,
            password: this.state.passwordValue,
            confirm_password: this.state.confPasswordValue,
            doctor: {
              gender: this.state.selectedGenderValue,
               speciality: this.state.selectedSpecValue,
               organization: this.state.organization,
            },
          }),
        }
      );

      const jsonData = await doctor.json();
      console.log(jsonData);

      if (jsonData.success) {
        this.props.history.push("/login");
        NotificationManager.success(
          "An email for confirmation will be sent shortly",
          "Successful!",
          4000
        );
      } else {
        NotificationManager.error(`${jsonData.error}`, "Faild!", 4000);
      }
      return jsonData;
    }
  };

  handleGenderRadio = (value) => {
    this.setState({ selectedGenderValue: value });
  };

  // changeTextToDate = () => {
  //   document.getElementById("birthdate").type = "date";
  // };

  render() {
    console.log( this.state.emailValue,
      this.state.firstNameValue,
      this.state.lastNameValue,
      this.state.phoneNumber,
      this.state.passwordValue,
      this.state.selectedGenderValue,
      this.state.confPasswordValue,
      
         this.state.selectedSpecValue,
         this.state.organization);
    return (
      <>
        <div className="header">
          <div>
            <Header />
            <Nav />
          </div>
        </div>

        <RegisterUser
          props={this.state}
          userType={this.state.userType}
          handleEmail={this.handleEmail}
          handleFirstName={this.handleFirstName}
          handleLastName={this.handleLastName}
          handlePass={this.handlePass}
          handleAddress={this.handleAddress}
          handleBirthDate={this.handleBirthDate}
          handleEmailPrice={this.handleEmailPrice}
          handleWebPrice={this.handleWebPrice}
          handleSpec={this.handleSpec}
          handleSubmit={this.handleSubmit}
          handleGenderRadio={this.handleGenderRadio}
          handleUserType={this.handleUserType}
          handleConfPass={this.handleConfPass}
          handlePhoneNumber={this.handlePhoneNumber}
          handleOrganization={this.handleOrganization}
          handleImage1={this.handleImage1}
          handleImage2={this.handleImage2}
        />
      </>
    );
  }
}

export default Register;
