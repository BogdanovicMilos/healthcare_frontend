import React, { Component } from "react";
import axios from "axios";
import Dashboard from "../../components/Doctor/Dashboard";
import Header from "../../components/Main/Header";
import Nav from "../../components/Main/Navbar";
import curentDoc from "../../actions/docAction";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

class DoctorDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      exams: [],
      record: [],
      token: sessionStorage.getItem("accessToken"),
      pending: "",
      openPending: false,
      value: "",
      doc: []
    };
  }

  exams = () => {
    const access_token = "Bearer ".concat(this.state.token);
    axios
      .get("https://health-care-backend.herokuapp.com/api/doctor/exams/", {
        headers: { Authorization: access_token }
      })
      .then(response => {
        const res = response.data.message.map(val => {
          return {
            id: val.id,
            client: val.client,
            created: val.created,
            subject: val.subject,
            status: val.status
          };
        });
        let resort = res.sort(
          (a, b) => Date.parse(b.created) - Date.parse(a.created)
        );
        this.setState({ exams: resort });
        this.setState({
          pending: [...this.state.exams.filter(res => res.status === "Pending")]
        });
      });
  };

  handleChange = e => {
    if (e.target.value === "earliest") {
      let earl = this.state.exams;
      let sort = earl.sort(
        (a, b) => Date.parse(a.created) - Date.parse(b.created)
      );
      this.setState({ exams: sort });
    } else {
      let lates = this.state.exams;
      let resort = lates.sort(
        (a, b) => Date.parse(b.created) - Date.parse(a.created)
      );
      this.setState({ exams: resort });
    }
  };

  handleClick = id => {
    this.props.history.push(`/doctor/exam/detail/${id}`);
  };

  hnlClick = () => {
    this.setState({ openPending: !this.state.openPending });
  };

  escBtn = e => {
    if (e.keyCode === 27) {
      this.setState({ openPending: false });
    }
  };

  handleDoctorProfile = async () => {
    const access_token = "Bearer ".concat(this.state.token);
    axios
      .get("https://health-care-backend.herokuapp.com/api/doctor/profile/", {
        headers: { Authorization: access_token }
      })
      .then(response => {
        console.log(response, "radi");

        let curentDocc = response.data.message.doctor
          .split(" ")
          .map(n => n[0])
          .join(".");
        this.props.curentDoc(curentDocc);
        return this.setState({
          doc: curentDocc
        });
      });
  };

  componentDidMount() {
    this.exams();
    window.addEventListener("keydown", this.escBtn);
    this.handleDoctorProfile();
  }

  render() {
    console.log(this.state.doc);
    console.log(this.props);

    return (
      <div className="container">
        <Header />
        <Nav doc={this.state.doc} />
        <Dashboard
          exams={this.state.exams}
          handleClick={this.handleClick}
          handleClient={this.handleClient}
          pending={this.state.pending}
          hnlClick={this.hnlClick}
          props={this.state}
          handleKeyPress={this.handleKeyPress}
          handleChange={this.handleChange}
        />
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ curentDoc: curentDoc }, dispatch);
};

export default connect(null, mapDispatchToProps)(DoctorDashboard);
