import React, { Component } from "react";
import axios from "axios";
import "../../assets/main/main.scss";
import Profile from "../../components/Client/Profile";
import { NotificationManager } from "react-notifications";
import Nav from "../../components/Main/Navbar";
import Header from "../../components/Main/Header";
import { HamburgerDiv } from "../../components/Main/HamburgerDiv";

class ClientProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      client: [],
      records: [],
      token: sessionStorage.getItem("accessToken"),
      gender: '',
      FirstName: '',
      LastName: '',
      Address: '',
      PhoneNum: '',
      BirthDate: '',
      ChronicalConditions: '',
      Allergies: '',
      attach: '',
      Email: ''
    };
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    let form_data = new FormData();
form_data.append("user.first_name", this.state.FirstName);
form_data.append("user.last_name", this.state.LastName);
form_data.append("gender", this.state.gender);
form_data.append("address", this.state.Address);
form_data.append("birth_date", this.state.BirthDate);
// form_data.append("conditions", this.state.ChronicalConditions);
// form_data.append("allergies", this.state.Allergies);
form_data.append("image", this.state.attach);
form_data.append("user.phone", this.state.PhoneNum);

const access_token = "Bearer ".concat(this.state.token);
let url = 'http://healthcarebackend.xyz/api/client/profile/';

const data = axios.put(url, form_data, {
  headers: {
    'content-type': 'multipart/form-data',
    Authorization: access_token,
  }
})


    console.log('submiting');
    const jsonData = await data;
    console.log(jsonData, "profile changed");
    if(jsonData.data.success){
      NotificationManager.success("Profile Updated!", "Successful!", 2000);
      this.handleClientProfile();
    }
    // e.preventDefault();
    // const access_token = "Bearer ".concat(this.state.token);
    // const data = await fetch(
    //   "http://healthcarebackend.xyz/api/client/profile/",
    //   {
    //     method: "PUT",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: access_token,
    //     },
    //     body: JSON.stringify({
    //       address: this.state.Address,
    //       first_nam: this.state.FirstName,
    //       last_name: this.state.LastName,
    //       phone: this.state.PhoneNum,
    //       birth_date: this.state.BirthDate,
    //       gender: this.state.gender
    //     }),
    //   }
    // );
    // const jsonData = await data.json();
    // if(jsonData.success){
    //   NotificationManager.success("Profile Updated!", "Successful!", 2000);
    //   this.handleClientProfile();
    // }
    // console.log(jsonData);
  };

  handleClientProfile = async () => {
    const access_token = "Bearer ".concat(this.state.token);
    axios
      .get(`http://healthcarebackend.xyz/api/client/profile/`, {
        headers: { Authorization: access_token },
      })
      .then((response) => {
        console.log(response.data.data, "profile");

        return this.setState({ client: [response.data.data], gender: response.data.data.gender, BirthDate: response.data.data.birth_date });
      });
  };

  // record = async () => {
  //   const access_token = "Bearer ".concat(this.state.token);
  //   axios
  //     .get(`http://healthcarebackend.xyz/api/client/records/`, {
  //       headers: { Authorization: access_token },
  //     })
  //     .then((response) => {
  //       console.log(response, "profile2");

  //       return this.setState({ records: [response.data.data] });
  //     });
  // };

  componentDidMount() {
    this.handleClientProfile();
    // this.record();
  }

  handleGenderRadio =(value) =>{
    this.setState({gender: value})
  }

  handleChange = (e) =>{
    this.setState({[e.target.id]: e.target.value})
  } 

  attachInput= (e) =>{
    this.setState({attach: e.target.files[0]})
    var output = document.querySelector('.cliImage');
    output.src = URL.createObjectURL(e.target.files[0]);
  }

  render() {
    console.log(this.state.records);
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
          client={this.state.client}
          handleSubmit={this.handleSubmit}
          handleGenderRadio={this.handleGenderRadio}
          props={this.state}
          handleChange={this.handleChange}
          attachInput={this.attachInput}
        />
      </>
    );
  }
}

export default ClientProfile;
