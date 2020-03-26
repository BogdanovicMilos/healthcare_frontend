import React, { Component } from "react";
import axios from "axios";
import Header from "../../components/Main/Header";
import Nav from "../../components/Main/Navbar";
import Dashboard from "../../components/Client/Dashboard";
import Footer from "../../components/Main/Footer";

class ClientDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      exams: [],
      paginatedExams: [],
      token: sessionStorage.getItem("accessToken"),
      dataFromServer: "",
      loading: true,
      page: 1,
      maxPages: "",
      hamburger: false,
      client: "",
      viewAllExams: false
    };
  }

  initiate = () => {
    this.props.history.push("/initiate");
  };
  waitingRoom = () => {
    this.props.history.push("/client/waiting-room");
  };
  VideoReq = () => {
    this.props.history.push("/client/video-request");
  };

  componentDidMount() {
    this.connect();
    this.paginatedExams();
    const access_token = "Bearer ".concat(this.state.token);
    axios
      .get(`https://health-care-backend.herokuapp.com/api/client/profile/`, {
        headers: { Authorization: access_token }
      })
      .then(response => {
        console.log(response.data.data, "profile");

        return this.setState({ client: response.data.data });
      });
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

  connect = () => {
    var ws = new WebSocket(
      "wss://health-care-backend.herokuapp.com/ws/exam/status/"
    );
    let that = this;
    var connectInterval;
    ws.onopen = () => {
      // on connecting, do nothing but log it to the console
      console.log("connected");
      this.setState({ ws: ws });
    };
    ws.onmessage = e => {
      // listen to data sent from the websocket server
      const message = JSON.parse(e.data);
      console.log(message);

      this.state.exams.map(exam => {
        if (exam.exam === message.id) {
          var state = message.status;
          let new_exam = Object.assign({ ...exam }, exam);
          new_exam.status = state;
          return { new_exam };
        } else {
          return console.log("Does not exist.");
        }
      });
      this.paginatedExams();
    };
    ws.onclose = e => {
      console.log(
        `Socket is closed. Reconnect will be attempted in ${Math.min(
          10000 / 1000,
          (that.timeout + that.timeout) / 1000
        )} second.`,
        e.reason
      );
      that.timeout = that.timeout + that.timeout; //increment retry interval
      connectInterval = setTimeout(this.check, Math.min(1, that.timeout)); //c
      // automatically try to reconnect on connection loss
    };
    ws.onerror = err => {
      console.error(
        "Socket encountered error: ",
        err.message,
        "Closing socket"
      );
      ws.close();
    };
  };

  handleClick = (id, type) => {
    if (type === "mail") {
      this.props.history.push(`/client/exam/detail/${id}`);
    } else if (type === "video") {
      this.props.history.push(`/client/video/exam/detail/${id}`);
    }
  };

  handleUpcoming = () => {
    let lates = this.state.exams;
    let resort = lates.sort(
      (a, b) => Date.parse(b.created) - Date.parse(a.created)
    );
    this.setState({ exams: resort });
    this.paginate(this.state.page);
  };

  handlePast = () => {
    let earl = this.state.exams;
    let sort = earl.sort(
      (a, b) => Date.parse(a.created) - Date.parse(b.created)
    );
    this.setState({ exams: sort });
    this.paginate(this.state.page);
  };

  handleAll = () => {
    this.setState({ viewAllExams: !this.state.viewAllExams });
  };

  videoReqStatus = async () => {
    const access_token = "Bearer ".concat(this.state.token);
    axios
      .get(`https://health-care-backend.herokuapp.com/api/web/client/list/`, {
        headers: { Authorization: access_token }
      })
      .then(response => {
        console.log(response.data.data, "videooo-request-list");

        this.setState({
          exams: [...this.state.exams.concat(response.data.data)]
        });
        this.paginate(this.state.page);
      });
  };

  paginatedExams = async () => {
    const access_token = "Bearer ".concat(this.state.token);
    axios
      .get(`https://health-care-backend.herokuapp.com/api/mail/client/`, {
        headers: { Authorization: access_token }
      })
      .then(response => {
        console.log(response.data.data, "paginatedExams");

        this.setState({
          exams: [...this.state.exams.concat(response.data.data)]
        });
        this.videoReqStatus();
        this.paginate(this.state.page);
      });
  };

  paginate = page => {
    let limit = 5;
    let pages = Math.ceil(this.state.exams.length / 5);
    const offset = (page - 1) * limit;
    const newArray = this.state.exams.slice(offset, offset + limit);

    this.setState({
      paginatedExams: newArray,
      loading: false,
      maxPages: pages
    });
  };

  handleHam = () => {
    this.setState({ hamburger: !this.state.hamburger });
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
          initiate={this.initiate}
          waitingRoom={this.waitingRoom}
          handleClick={this.handleClick}
          handleUpcoming={this.handleUpcoming}
          handlePast={this.handlePast}
          handleAll={this.handleAll}
          handleClickLeft={this.handleClickLeft}
          handleClickRight={this.handleClickRight}
          props={this}
          VideoReq={this.VideoReq}
          handleHam={this.handleHam}
        />
        <Footer />
      </>
    );
  }
}

export default ClientDashboard;
