import React, { Component } from "react";
import axios from "axios";
import Dashboard from "../../components/Doctor/Dashboard";
import Header from "../../components/Main/Header";
import Nav from "../../components/Main/Navbar";
import curentDoc from "../../actions/docAction";
import { statusChangeWR } from "../../actions/doctorStatusWR";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import moment from "moment";
import Footer from "../../components/Main/Footer";
import { NotificationManager } from "react-notifications";

class DoctorDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      exams: [],
      paginatedExams: [],
      upcomingOrPast: [],
      record: [],
      token: sessionStorage.getItem("accessToken"),
      pending: [],
      videoPending: [],
      waitingRoom: [],
      openPending: false,
      openVideoPending: false,
      openWaitingRoom: false,
      value: "",
      doctorCurent: "",
      page: 1,
      maxPages: "",
      loading: true,
      hamburger: false,
      numOfMessages: 0,
      messageIfEmpty: "",
      currentFilterClicked: "",
      mail: [],
    };
  }

  handleClickLeft = () => {
    if (this.state.page !== 1) {
      this.setState({ page: this.state.page - 1 });
      let test = setInterval(() => {
        this.paginate(this.state.page);
        clearInterval(test);
      }, 10);
    }
  };
  handleClickRight = () => {
    if (this.state.page !== this.state.maxPages) {
      this.setState({ page: this.state.page + 1 });
      let test = setInterval(() => {
        this.paginate(this.state.page);
        clearInterval(test);
      }, 10);
    }
  };

  pnd = () => {
    const access_token = "Bearer ".concat(this.state.token);
    axios
      .get(`https://healthcarebackend.xyz/api/doctor/exams/req/`, {
        headers: { Authorization: access_token },
      })
      .then((response) => {
        const res = response.data.data.map((val) => {
          return {
            id: val.id,
            client: val.client,
            created: val.created,
            subject: val.subject,
            status: val.status,
          };
        });
        let resort = res.sort(
          (a, b) => Date.parse(b.created) - Date.parse(a.created)
        );
        this.setState({
          pending: resort.filter((rest) => rest.status === "Pending"),
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  handleUpcoming = () => {
    let upcomingset = setInterval(() => {
      let upcoming = this.state.exams.filter((upco) => {
        return (
          upco.status === "Appointed" ||
          upco.status === "Accepted" ||
          upco.status === "Pending"
        );
      });

      let resort = upcoming.sort(
        (a, b) => Date.parse(b.created) - Date.parse(a.created)
      );

      let messageIfEmpty =
        upcoming.length === 0 ? "No upcoming consultations" : "";

      this.setState({
        upcomingOrPast: resort,
        page: 1,
        messageIfEmpty,
        currentFilterClicked: "upcoming",
      });

      this.paginate(1);
      clearInterval(upcomingset);
    }, 10);
  };

  handlePast = () => {
    let pastset = setInterval(() => {
      let past = this.state.exams.filter((pas) => {
        return (
          pas.status === "Declined" ||
          pas.status === "Finished" ||
          pas.status === "Canceled"
        );
      });
      let sort = past.sort(
        (a, b) => Date.parse(b.created) - Date.parse(a.created)
      );

      let messageIfEmpty = past.length === 0 ? "No past consultations" : "";

      this.setState({
        upcomingOrPast: sort,
        page: 1,
        messageIfEmpty,
        currentFilterClicked: "past",
      });
      this.paginate(1);
      clearInterval(pastset);
    }, 10);
  };

  handleAll = () => {
    let hndlAll = setInterval(() => {
      let all = this.state.exams;

      let resortall = all.sort(
        (a, b) => Date.parse(b.created) - Date.parse(a.created)
      );

      let messageIfEmpty = all.length === 0 ? "No consultations" : "";

      this.setState({
        upcomingOrPast: resortall,
        page: 1,
        messageIfEmpty,
        currentFilterClicked: "all",
      });

      this.paginate(1);
      clearInterval(hndlAll);
    }, 10);
  };

  handleClick = (id, type) => {
    if (type === "mail") {
      this.props.history.push(`/doctor/exam/detail/${id}`);
    } else if (type === "video") {
      this.props.history.push(`/doctor/video/exam/detail/${id}/#init`);
    }
  };

  handleVideoPendingClick = (id) => {
    this.props.history.push(`/doctor/video/exam/detail/${id}`);
  };
  paginatedExams = async () => {
    const access_token = "Bearer ".concat(this.state.token);
    axios
      .get(`https://healthcarebackend.xyz/api/exams/doctor/`, {
        headers: { Authorization: access_token },
      })
      .then((res) => {
        if (
          res.data.data.mail.length !== 0 ||
          res.data.data.video.length !== 0
        ) {
          let combineExams = res.data.data.mail.concat(res.data.data.video);
          this.setState({
            exams: combineExams,
          });

          let pending = res.data.data.video.filter((res) => {
            return (
              res.status === "Pending" &&
              moment(res.appointed_date).format("MM/DD/YYYY") >=
                moment(new Date()).format("MM/DD/YYYY")
            );
          });
          let accepted = res.data.data.video.filter((res) => {
            return res.status === "Appointed";
          });
          let nowON = accepted.filter((now) => {
            if (
              moment(new Date()).format("MM/DD/YYYYTHH:mm aa") >
                moment(now.appointed_date).format("MM/DD/YYYYTHH:mm aa") &&
              moment(new Date()).format("MM/DD/YYYYTHH:mm aa") <
                moment(now.appointed_date)
                  .add(30, "minutes")
                  .format("MM/DD/YYYYTHH:mm aa")
            ) {
              return now;
            } else {
              return null;
            }
          });
          this.setState({
            videoPending: pending,
            loading: false,
            numOfMessages: nowON.length,
          });
        }
      })
      .then(() => {
        this.handleUpcoming();
        this.paginate(this.state.page);
        this.getUnreadMessages(this.state.doctorCurent.id);
      })
      .catch((error) => {
        console.log(error.response, "error");
        this.setState({ loading: false });
      });
  };

  paginate = (page) => {
    let limit = 5;
    let pages = Math.ceil(this.state.upcomingOrPast.length / 5);
    const offset = (page - 1) * limit;
    const newArray = this.state.upcomingOrPast.slice(offset, offset + limit);

    this.setState({
      paginatedExams: newArray,
      loading: false,
      maxPages: pages,
    });
  };

  handleWaitingRoom = (id) => {
    if (this.state.waitingRoom[0].id === id) {
      this.props.history.push(`/doctor/processing/video/exam/${id}/#init`);
    } else {
      NotificationManager.error(`Client is not next in line`, "Failed!", 3000);
    }
  };

  hnlClick = () => {
    this.setState({ openPending: !this.state.openPending });
  };

  hnlClick2 = () => {
    this.setState({ openVideoPending: !this.state.openVideoPending });
  };

  hnlClick3 = () => {
    this.setState({ openWaitingRoom: !this.state.openWaitingRoom });
  };

  hnlVideoClick = () => {
    this.setState({ openVideoPending: !this.state.openVideoPending });
  };

  hnlWatingClick = () => {
    this.setState({ openWaitingRoom: !this.state.openWaitingRoom });
  };

  escBtn = (e) => {
    if (e.keyCode === 27) {
      this.setState({
        openPending: false,
        openVideoPending: false,
        openWaitingRoom: false,
      });
    }
  };

  handleDoctorProfile = async () => {
    const access_token = "Bearer ".concat(this.state.token);
    axios
      .get(`https://healthcarebackend.xyz/api/doctor/profile/`, {
        headers: { Authorization: access_token },
      })
      .then((response) => {
        let current = response.data.data;
        this.peopleInWaitingRoom(current.id);
        this.connecSocket(current.id);

        this.props.curentDoc(current);
        return this.setState({
          doctorCurent: current,
        });
      });
  };

  peopleInWaitingRoom = async (id) => {
    const access_token = "Bearer ".concat(this.state.token);
    axios
      .get(`https://healthcarebackend.xyz/api/queue/today/${id}/`, {
        headers: { Authorization: access_token },
      })
      .then((response) => {
        let filterCanceled = response.data.data.queue.filter((ex) => {
          return ex.status !== "Canceled" && ex.status !== "Declined";
        });
        this.setState({ waitingRoom: filterCanceled });
      })
      .catch((err) => {
        console.log(err.response);
      });
  };

  handleHam = () => {
    this.setState({ hamburger: !this.state.hamburger });
  };

  handleClickMail = (id) => {
    this.props.history.push(`/doctor/exam/detail/${id}`);
  };

  hnlMyConsultations = () => {
    this.handleAll();
    this.setState({ hamburger: false });
  };

  componentDidMount() {
    this.handleDoctorProfile();
    this.paginatedExams();
    this.pnd();
    window.addEventListener("keydown", this.escBtn);
  }

  connecSocket = (id) => {
    const webs = new WebSocket(
      `wss://healthcarebackend.xyz/ws/dashboard/doctor/${id}/`
    );

    webs.onopen = () => {
      // on connecting, do nothing but log it to the console
      console.log("connected to port");
    };
    webs.onmessage = (event) => {
      if (JSON.parse(event.data).statu !== "In the queue") {
        this.props.statusChangeWR(JSON.parse(event.data).id);
      }
      this.messagesNumber();
    };
    webs.onclose = () => {
      console.error("disconected");
    };
  };

  messagesNumber = () => {
    this.paginatedExams();
    this.peopleInWaitingRoom(this.state.doctorCurent.id);
    this.pnd();
  };

  getUnreadMessages = async (id) => {
    const access_token = "Bearer ".concat(this.state.token);
    axios
      .get(`https://healthcarebackend.xyz/api/exams/doctor/${id}/`, {
        headers: { Authorization: access_token },
      })
      .then((response) => {
        const unreadMessages = response.data.data.filter((ex) => {
          return (
            ex.messages[ex.messages.length - 1].sender !==
              `${this.state.doctorCurent.prefix} ${this.state.doctorCurent.doctor}` ||
            ex.messages.length === 0
          );
        });
        const unreadIds = unreadMessages.map((ex) => ex.exam.id);
        this.setState({ mail: unreadIds });
      })
      .catch((err) => {
        console.log(err.response);
      });
  };
  render() {
    return (
      <>
        <div className="header">
          <div>
            <Header />
            <Nav />
          </div>
        </div>
        <Dashboard
          handleClick={this.handleClick}
          handleClickMail={this.handleClickMail}
          handleClient={this.handleClient}
          hnlClick={this.hnlClick}
          hnlClick2={this.hnlClick2}
          hnlClick3={this.hnlClick3}
          hnlWaitingClick={this.hnlWatingClick}
          props={this}
          handleKeyPress={this.handleKeyPress}
          handleChange={this.handleChange}
          handleClickLeft={this.handleClickLeft}
          handleClickRight={this.handleClickRight}
          loading={this.state.loading}
          hnlVideoClick={this.hnlVideoClick}
          handleWaitingRoom={this.handleWaitingRoom}
          handleVideoPendingClick={this.handleVideoPendingClick}
          handleHam={this.handleHam}
          handleUpcoming={this.handleUpcoming}
          handlePast={this.handlePast}
          handleAll={this.handleAll}
          hnlMyConsultations={this.hnlMyConsultations}
        />
        <Footer />
      </>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    { curentDoc: curentDoc, statusChangeWR: statusChangeWR },
    dispatch
  );
};

export default connect(null, mapDispatchToProps)(DoctorDashboard);
