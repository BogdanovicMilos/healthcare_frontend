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
      selectEmail: "",
      selectVideo: "",
      selectVideoFollow: "",
      token: sessionStorage.getItem("accessToken"),
      FirstName: '',
      LastName: '',
      PhoneNum: '',
      TimeStart: '',
      TimeEnd: '',
      EmailVisit: '',
      VideoVisit: '',
      VideoFollowUp: '',
      Biography: '',
      attach: '',
      currentStatus: '',
      Email: ''
    };
  }

  

  handleSelect = (statusValue) => {
    let { value } = statusValue;
    this.setState({ selectEmail: value });
  };

  handleSelect2 = (statusValue) => {
    let { value } = statusValue;
    this.setState({ selectVideo: value });
  };

  handleSelect3 = (statusValue) => {
    let { value } = statusValue;
    this.setState({ selectVideoFollow: value });
  };

  

  handleSubmit = async (e) => {
    e.preventDefault();
    if((this.state.EmailVisit && !this.state.selectEmail) || (this.state.VideoVisit && !this.state.selectVideo) || (this.state.VideoFollowUp && !this.state.selectVideoFollow)){
      NotificationManager.error("Please enter currency", "Failed!", 2000);
    }else{
      let form_data = new FormData();
  form_data.append("user.first_name", this.state.FirstName);
  form_data.append("user.last_name", this.state.LastName);
  form_data.append("user.phone", this.state.PhoneNum);
  form_data.append("biography", this.state.Biography);
  form_data.append("email_exam_price", this.state.EmailVisit);
  form_data.append("web_exam_price", this.state.VideoVisit);
  form_data.append("web_exam_follow_price", this.state.VideoFollowUp);
  form_data.append("image", this.state.attach);
  form_data.append("status", '');
  form_data.append("start_hour", this.state.TimeStart);
  form_data.append("end_hour", this.state.TimeEnd);
  form_data.append("email_currency", this.state.selectEmail);
  form_data.append("web_currency", this.state.selectVideo);
  form_data.append("web_follow_up_currency", this.state.selectVideoFollow);
  
  const access_token = "Bearer ".concat(this.state.token);
  let url = 'http://healthcarebackend.xyz/api/doctor/profile/';
  
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
        this.handleDoctorProfile();
        window.location.reload()
      }

    }
  };

  handleDoctorProfile = async () => {
    const access_token = "Bearer ".concat(this.state.token);
    axios
      .get(`http://healthcarebackend.xyz/api/doctor/profile/`, {
        headers: { Authorization: access_token },
      })
      .then((response) => {
        console.log(response, "doc profileee");
        let start = response.data.data.start_hour && response.data.data.start_hour.slice(0, -3)
        let end = response.data.data.end_hour && response.data.data.end_hour.slice(0, -3)

         this.setState({ doctor: [response.data.data], 
          currentStatus: response.data.data.status, 
          TimeStart: start, 
          TimeEnd: end
        });
      });
  };

  componentDidMount() {
    this.handleDoctorProfile();
  }

  handleChange = (e) =>{
    this.setState({[e.target.id]: e.target.value})
  } 

  addAttach= (e) =>{
    this.setState({attach: e.target.files[0]})
    var output = document.querySelector('.docImage');
    output.src = URL.createObjectURL(e.target.files[0]);
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
          handleSubmit={this.handleSubmit}
          handleSelect={this.handleSelect}
          handleSelect2={this.handleSelect2}
          handleSelect3={this.handleSelect3}
          props={this.state}
          handleChange={this.handleChange}
          addAttach={this.addAttach}
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
