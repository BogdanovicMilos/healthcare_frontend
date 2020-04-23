import React, { Component } from "react";
import axios from "axios";
import DetailVideo from "../../components/Client/ClientVideoExamDetail";

class ClientVideoExamDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      exam: [],
      statusValue: "",
      selectedStatus: "",
      token: sessionStorage.getItem("accessToken"),
      id: this.props.match.params.id,
    };
  }

  handleCancel = async () => {
    this.props.history.push("/dashboard-client");
    const access_token = "Bearer ".concat(this.state.token);
    const doctor = await fetch(
      `https://healthcarebackend.xyz/api/web/client/${this.state.id}/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: access_token,
        },
        body: JSON.stringify({
          message: "Cancel",
        }),
      }
    );
    const jsonData = await doctor.json();
    // this.toRefund();
    console.log(jsonData);

    return jsonData;
  };

  detail = () => {
    const access_token = "Bearer ".concat(this.state.token);
    axios
      .get(`https://healthcarebackend.xyz/api/web/client/${this.state.id}/`, {
        headers: { Authorization: access_token },
      })
      .then((response) => {
        console.log(response, "detailex");

        this.setState({ exam: this.state.exam.concat(response.data.data) });
      });
  };

  handleLink = () => {
    this.props.history.push(`/client/exam/correspondence/${this.state.id}`);
  };

  handleLinkMessage = () => {
    this.props.history.push(`/client/exam/message/${this.state.id}`);
  };

  componentDidMount() {
    this.detail();
  }

  render() {
    return (
      <>
        <DetailVideo
          exam={this.state.exam}
          handleLink={this.handleLink}
          handleLinkMessage={this.handleLinkMessage}
          handleCancel={this.handleCancel}
        />
      </>
    );
  }
}

export default ClientVideoExamDetail;
