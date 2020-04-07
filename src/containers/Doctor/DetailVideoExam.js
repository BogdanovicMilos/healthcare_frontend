import React, { Component } from "react";
import axios from "axios";
// import { connect } from "react-redux";
import DetailVideo from "../../components/Doctor/DetailVideoExam";
import Footer from "../../components/Main/Footer";

const options = [
  { value: "Accept", label: "Accept" },
  { value: "Decline", label: "Decline" }
];

class DetailVideoExam extends Component {
  constructor(props) {
    super(props);
    this.state = {
      exam: [],
      statusValue: "",
      selectedStatus: "",
      token: sessionStorage.getItem("accessToken"),
      id: ""
    };
  }

  detail = id => {
    const access_token = "Bearer ".concat(this.state.token);
    axios
      .get(`http://167.172.156.87/api/web/doctor/${id}`, {
        headers: { Authorization: access_token }
      })
      .then(response => {
        // console.log(response);

        this.setState({ exam: this.state.exam.concat(response.data.data) });
      });
  };

  handleSubmit = e => {
    e.preventDefault();
    let id = this.props.match.params.id;
    this.props.history.push("/dashboard-doctor");

    this.doctorExam(id);
  };

  handleLink = () => {
    this.props.history.push(`/doctor/exam/correspondence/${this.state.id}`);
  };

  handleLinkMessage = () => {
    // console.log(this.state.id);

    this.props.history.push(`/doctor/exam/message/${this.state.id}`);
  };

  handleStatus = statusValue => {
    this.setState({ statusValue });
    let { value, label } = statusValue;
    this.setState({ selectedStatus: value });

    console.log(value, label, " da vidimooo");
  };

  doctorExam = async id => {
    const access_token = "Bearer ".concat(this.state.token);
    const client = await fetch(`http://167.172.156.87/api/web/doctor/${id}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: access_token
      },
      body: JSON.stringify({
        state: this.state.selectedStatus
      })
    });
    const jsonData = await client.json();
    console.log(jsonData, "sta se ovde vraca?");

    return jsonData;
  };

  componentDidMount() {
    let id = this.props.match.params.id;
    this.setState({ id: id });
    this.detail(id);
  }

  render() {
    return (
      <>
        <DetailVideo
          exam={this.state.exam}
          status={options}
          handleStatus={this.handleStatus}
          submitValue={this.state.submitValue}
          handleSubmit={this.handleSubmit}
          handleLink={this.handleLink}
          handleLinkMessage={this.handleLinkMessage}
        />
        <div className="footerr">
          <Footer />
        </div>
      </>
    );
  }
}

// const mapStateToProps = state => {
//   const examID = state.getIn(["examReducer", "examID"]);
//   return {
//     examID
//   };
// };

export default DetailVideoExam;
