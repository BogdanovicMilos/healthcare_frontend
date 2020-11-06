import React, { Component } from "react";
import axios from "axios";
import Header from "../../components/Main/Header";
import Nav from "../../components/Main/Navbar";
import Dashboard from "../../components/Client/Dashboard";
import curentDoc from "../../actions/docAction";
import { popUp } from "../../actions/popUpAction";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import HamburgerDiv from "../../components/Main/HamburgerDiv";

class ClientDashboard extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      exams: [],
      paginatedExams: [],
      upcomingOrPast: [],
      token: sessionStorage.getItem("accessToken"),
      dataFromServer: "",
      loading: true,
      page: 1,
      maxPages: "",
      hamburger: false,
      client: "",
      messageIfEmpty: "",
      currentFilterClicked: "",
      mail: [],
      searchName: "",
      searchDoctor: false,
      searchByTypeClick: false,
      searchType: "",
      filterFiltered: [],
      searchedUpcomingOrPast: [],


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
    this._isMounted = true;
    const access_token = "Bearer ".concat(this.state.token);
    axios
      .get(`http://healthcarebackend.xyz/api/client/profile/`, {
        headers: { Authorization: access_token },
      })
      .then((response) => {
        console.log(response, 'milos');
        this.connect(response.data.data.id);
        this.props.curentDoc([response.data.data.user]);
        this.setState({ client: response.data.data });
      })
      .then(() => {
        this.paginatedExams();
      })
  }

  // handleClickLeft = () => {
  //   if (this.state.page !== 1) {
  //     this.setState({ page: this.state.page - 1 });
  //     let test = setInterval(() => {
  //       this.paginate(this.state.page);
  //       clearInterval(test);
  //     }, 10);
  //   }
  // };
  // handleClickRight = () => {
  //   if (this.state.page !== this.state.maxPages) {
  //     this.setState({ page: this.state.page + 1 });
  //     let test = setInterval(() => {
  //       this.paginate(this.state.page);
  //       clearInterval(test);
  //     }, 10);
  //   }
  // };

  connect = (id) => {
    const ws = new WebSocket(
      `ws://healthcarebackend.xyz/ws/dashboard/client/${id}/`
    );

    ws.onopen = () => {
      // on connecting, do nothing but log it to the console
      console.log("connected to dashboard socket");
    };
    ws.onmessage = (e) => {
      console.log(e);
      // listen to data sent from the websocket server
      const message = JSON.parse(e.data);
      message.status === "Accepted" &&
        message.exam_type === "queue" &&
        this.props.popUp();

      let socketExam = this.state.exams.filter((exam) => {
        return exam.id === message.id;
      });
      if (socketExam.length !== 0) {
        this.paginatedExams();
      }
    };
    ws.onclose = (e) => {
      console.log(`Socket is closed`);
    };
    ws.onerror = (err) => {
      console.error(
        "Socket encountered error: ",
        err.message,
        "Closing socket"
      );
    };
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleClick = (id, type) => {
    if (type === "mail") {
      this.props.history.push(`/client/exam/detail/${id}`);
    } else if (type === "video") {
      this.props.history.push(`/client/video/exam/detail/${id}`);
    } else if (type === "queue") {
      this.props.history.push(`/client/queue/exam/detail/${id}`);
    }
  };

  handleUpcoming = () => {
    let upcomingset = setInterval(() => {
      let upcoming = this.state.exams.filter((upco) => {
        return (
          upco.status === "Appointed" ||
          upco.status === "Accepted" ||
          upco.status === "Pending" ||
          upco.status === "In the queue"
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
        searchedUpcomingOrPast: [],
        filterFiltered: [],
        searchType: "",
        searchName: "",
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

      console.log(past, "past");
      let sort = past.sort(
        (a, b) => Date.parse(b.created) - Date.parse(a.created)
      );

      let messageIfEmpty = past.length === 0 ? "No past consultations" : "";

      this.setState({
        upcomingOrPast: sort,
        page: 1,
        messageIfEmpty,
        currentFilterClicked: "past",
        searchedUpcomingOrPast: [],
        filterFiltered: [],
        searchType: "",
        searchName: "",
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
        searchedUpcomingOrPast: [],
        filterFiltered: [],
        searchType: "",
        searchName: "",
      });

      this.paginate(1);
      clearInterval(hndlAll);
    }, 10);
  };

  paginatedExams = async () => {
    const access_token = "Bearer ".concat(this.state.token);
    console.log('milosaaaaa');
    axios
      .get(`http://healthcarebackend.xyz/api/exams/client/`, {
        headers: { Authorization: access_token },
      })
      .then((res) => {
        console.log(res, 'milossasSASASAD');
        if (
          res.data.data.mail.length !== 0 ||
          res.data.data.video.length !== 0
        ) {
          let combineExams = res.data.data.mail.concat(res.data.data.video);
          this.setState({
            exams: combineExams,
          });
        }
      })
      .then(() => {
        this.WaitingRoomList();
      })
      .catch((error) => {
        console.log(error.response, "error");
        this.setState({ loading: false });
      });
  };

  WaitingRoomList = async () => {
    const access_token = "Bearer ".concat(this.state.token);
    axios
      .get(`http://healthcarebackend.xyz/api/queue/${this.state.client.id}/`, {
        headers: { Authorization: access_token },
      })
      .then((response) => {
        console.log(response, 'alooooo');
        if (response.data.data.queue.length !== 0) {
          this.setState({
            exams: [...this.state.exams.concat(response.data.data.queue)],
          });
        } 
      })
      .then(() => {
        this.handleAll();
        this.paginate(this.state.page);
        this.getUnreadMessages(this.state.client.id);
      })
      .catch((err) => {
        console.log(err.response);
      });
  };

  paginate = (page) => {
    if (this.state.searchedUpcomingOrPast.length === 0) {
      let limit = 5;
      let pages = Math.ceil(this.state.upcomingOrPast.length / 5);
      const offset = (page - 1) * limit;
      const newArray = this.state.upcomingOrPast.slice(offset, offset + limit);

      this.setState({
        paginatedExams: newArray,
        loading: false,
        maxPages: pages,
      });
    } else {
      let limit = 5;
      let pages = Math.ceil(this.state.searchedUpcomingOrPast.length / 5);
      const offset = (page - 1) * limit;
      const newArray = this.state.searchedUpcomingOrPast.slice(
        offset,
        offset + limit
      );

      this.setState({
        paginatedExams: newArray,
        loading: false,
        maxPages: pages,
      });
    }
  };

  handleHam = () => {
    this.setState({ hamburger: !this.state.hamburger });
  };

  hnlMyConsultations = () => {
    this.setState({ hamburger: false });
    this.handleAll();
  };

  getUnreadMessages = async (id) => {
    const access_token = "Bearer ".concat(this.state.token);
    axios
      .get(`http://healthcarebackend.xyz/api/exams/client/${id}/`, {
        headers: { Authorization: access_token },
      })
      .then((response) => {
        const unreadMessages = response.data.data.filter((ex) => {
          if (ex.messages.length !== 0) {
            return (
              ex.messages[ex.messages.length - 1].sender !==
              `${this.state.client.user}`
            );
          } else {
            return null;
          }
        });
        const unreadIds = unreadMessages.map((ex) => ex.exam.id);
        this.setState({ mail: unreadIds });
      })
      .catch((err) => {
        console.log(err.response);
      });
  };

  handleDoctorSearch = () => {
    this.setState({ searchDoctor: !this.state.searchDoctor });
  };

  searchByName = (e) => {
    if (e.target.value === "" && this.state.searchType === "") {
      this.setState({ filterFiltered: [] });
    } else if (e.target.value === "" && this.state.searchName !== "") {
      this.setState({ filterFiltered: [] });
      let callBFunction = setInterval(() => {
        this.handlingSearchByType();
        clearInterval(callBFunction);
      }, 10);
    }
    this.setState({ searchName: e.target.value });
    let callFunction = setInterval(() => {
      this.handlingSearchByName();
      clearInterval(callFunction);
    }, 10);
  };

  handlingSearchByName = () => {
    let searchName = this.state.searchName.toLowerCase().split(" ");
    let searchedDoctor =
      this.state.filterFiltered.length === 0
        ? this.state.upcomingOrPast.filter((ex) => {
            const doctor = ex.doctor_name ? ex.doctor_name : ex.doctor;
            const splited = doctor.split(" ");
            if (!searchName[1]) {
              if (
                splited[1].toLowerCase().indexOf(searchName[0]) ===
                  searchName[0].indexOf(searchName[0]) ||
                splited[2].toLowerCase().indexOf(searchName[0]) ===
                  searchName[0].indexOf(searchName[0])
              ) {
                return ex;
              }
            } else {
              if (
                (splited[1].toLowerCase().indexOf(searchName[0]) ===
                  searchName[0].indexOf(searchName[0]) &&
                  splited[2].toLowerCase().indexOf(searchName[1]) ===
                    searchName[1].indexOf(searchName[1])) ||
                (splited[1].toLowerCase().indexOf(searchName[1]) ===
                  searchName[1].indexOf(searchName[1]) &&
                  splited[2].toLowerCase().indexOf(searchName[0]) ===
                    searchName[0].indexOf(searchName[0]))
              ) {
                return ex;
              }
            }
            return null;
          })
        : this.state.filterFiltered.filter((ex) => {
            const doctor = ex.doctor_name ? ex.doctor_name : ex.doctor;
            const splited = doctor.split(" ");
            if (!searchName[1]) {
              if (
                splited[1].toLowerCase().indexOf(searchName[0]) ===
                  searchName[0].indexOf(searchName[0]) ||
                splited[2].toLowerCase().indexOf(searchName[0]) ===
                  searchName[0].indexOf(searchName[0])
              ) {
                return ex;
              }
            } else {
              if (
                (splited[1].toLowerCase().indexOf(searchName[0]) ===
                  searchName[0].indexOf(searchName[0]) &&
                  splited[2].toLowerCase().indexOf(searchName[1]) ===
                    searchName[1].indexOf(searchName[1])) ||
                (splited[1].toLowerCase().indexOf(searchName[1]) ===
                  searchName[1].indexOf(searchName[1]) &&
                  splited[2].toLowerCase().indexOf(searchName[0]) ===
                    searchName[0].indexOf(searchName[0]))
              ) {
                return ex;
              }
            }
            return null;
          });
    let messageIfEmpty =
      searchedDoctor.length === 0
        ? "No Such Doctor"
        : searchedDoctor.length !== 0 &&
          this.state.messageIfEmpty !== "No Such Doctor"
        ? this.state.messageIfEmpty
        : "";
    this.state.filterFiltered.length === 0 &&
      this.setState({ filterFiltered: searchedDoctor });
    this.setState({
      searchedUpcomingOrPast: searchedDoctor,
      page: 1,
      messageIfEmpty,
    });
    this.paginate(1);
  };

  ResetonSelectChange = () => {
    this.setState({ filterFiltered: [] });
    let callBFunction = setInterval(() => {
      this.handlingSearchByName();
      clearInterval(callBFunction);
    }, 10);
  };

  searchByType = (e) => {
    console.log(e.target.value);
    if (e.target.value === "" && this.state.searchName === "") {
      this.setState({ filterFiltered: [] });
    } else if (e.target.value === "" && this.state.searchName !== "") {
      this.setState({ filterFiltered: [] });
      let callBFunction = setInterval(() => {
        this.handlingSearchByName();
        clearInterval(callBFunction);
      }, 10);
    }
    let letter = e.target.value.toLowerCase();
    this.setState({ searchType: letter });
    let callFunction = setInterval(() => {
      this.handlingSearchByType();
      clearInterval(callFunction);
    }, 10);
  };

  
  handlingSearchByType = () => {
    let searchedDoctor =
      this.state.filterFiltered.length === 0
        ? this.state.upcomingOrPast.filter((ex) => {
            const examType = ex.exam_type;
            if (
              examType.toLowerCase().indexOf(this.state.searchType) ===
              this.state.searchType.indexOf(this.state.searchType)
            ) {
              return ex;
            } else {
              return null;
            }
          })
        : this.state.filterFiltered.filter((ex) => {
            const examType = ex.exam_type;
            if (
              examType.toLowerCase().indexOf(this.state.searchType) ===
              this.state.searchType.indexOf(this.state.searchType)
            ) {
              return ex;
            } else {
              return null;
            }
          });
          console.log(searchedDoctor);
    let messageIfEmpty =
      searchedDoctor.length === 0
        ? "No Such Type"
        : searchedDoctor.length !== 0 &&
          this.state.messageIfEmpty !== "No Such Type"
        ? this.state.messageIfEmpty
        : "";
    this.state.filterFiltered.length === 0 &&
      this.setState({ filterFiltered: searchedDoctor });
    this.setState({
      searchedUpcomingOrPast: searchedDoctor,
      page: 1,
      messageIfEmpty,
    });
    this.paginate(1);
  };

  handlePageChange = (pageNumber) => {
    console.log(pageNumber, this.state.page);
    this.setState({page: pageNumber});
    this.paginate(pageNumber)
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
        <HamburgerDiv />
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
          hnlMyConsultations={this.hnlMyConsultations}
          handleDoctorSearch={this.handleDoctorSearch}
          searchByName={this.searchByName}
          ResetonSelectChange={this.ResetonSelectChange}
          searchByType={this.searchByType}
          handlePageChange={this.handlePageChange}
          

        />
      </>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ curentDoc: curentDoc, popUp: popUp }, dispatch);
};

export default connect(null, mapDispatchToProps)(ClientDashboard);
