import React, { Component } from "react";
import axios from "axios";
import Record from "../../components/Doctor/Record";
import Header from "../../components/Main/Header";
import Nav from "../../components/Main/Navbar";
import { HamburgerDiv } from "../../components/Main/HamburgerDiv";

class ClientRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      exams: [],
      record: null,
      token: sessionStorage.getItem("accessToken"),
      id: this.props.match.params.id,
      currentFilterClicked: "",
      searchName: "",
      searchType: "",
      messageIfEmpty: "",
      paginatedExams: [],
      searchedUpcomingOrPast: []
    };
  }

  record = () => {
    const access_token = "Bearer ".concat(this.state.token);
    axios
      .get(
        `http://healthcarebackend.xyz/record/${this.state.id}/`
        ,
        {
          headers: { Authorization: access_token },
        }
      )
      .then((response) => {
        console.log(response, "nzm ni ja sta");
        this.handleAll();

        return this.setState({
          record:[ response.data.data],
        });
      });
  };

  clientsExams = () => {
    const access_token = "Bearer ".concat(this.state.token);
    axios
      .get(
        `http://healthcarebackend.xyz/client/${this.state.id}/list/`
        ,
        {
          headers: { Authorization: access_token },
        }
      )
      .then((response) => {
        console.log(response, "podaciiii");
        let AllArrays = response.data.data.mail.concat(response.data.data.queue, response.data.data.video)

        return this.setState({
          exams: AllArrays,
        });
      }).then(() =>{
        this.handleAll();
      })
  };

  componentDidMount() {
    this.record();
    this.clientsExams()
  }

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
    let searchedClient =
      this.state.filterFiltered.length === 0
        ? this.state.upcomingOrPast.filter((ex) => {
            const client = ex.client;
            const splited = client.split(" ");
            if (!searchName[1]) {
              if (
                splited[0].toLowerCase().indexOf(searchName[0]) ===
                  searchName[0].indexOf(searchName[0]) ||
                splited[1].toLowerCase().indexOf(searchName[0]) ===
                  searchName[0].indexOf(searchName[0])
              ) {
                return ex;
              }
            } else {
              if (
                (splited[0].toLowerCase().indexOf(searchName[0]) ===
                  searchName[0].indexOf(searchName[0]) &&
                  splited[1].toLowerCase().indexOf(searchName[1]) ===
                    searchName[1].indexOf(searchName[1])) ||
                (splited[0].toLowerCase().indexOf(searchName[1]) ===
                  searchName[1].indexOf(searchName[1]) &&
                  splited[1].toLowerCase().indexOf(searchName[0]) ===
                    searchName[0].indexOf(searchName[0]))
              ) {
                return ex;
              }
            }
            return null;
          })
        : this.state.filterFiltered.filter((ex) => {
            const client = ex.client;
            const splited = client.split(" ");
            if (!searchName[1]) {
              if (
                splited[0].toLowerCase().indexOf(searchName[0]) ===
                  searchName[0].indexOf(searchName[0]) ||
                splited[1].toLowerCase().indexOf(searchName[0]) ===
                  searchName[0].indexOf(searchName[0])
              ) {
                return ex;
              }
            } else {
              if (
                (splited[0].toLowerCase().indexOf(searchName[0]) ===
                  searchName[0].indexOf(searchName[0]) &&
                  splited[1].toLowerCase().indexOf(searchName[1]) ===
                    searchName[1].indexOf(searchName[1])) ||
                (splited[0].toLowerCase().indexOf(searchName[1]) ===
                  searchName[1].indexOf(searchName[1]) &&
                  splited[1].toLowerCase().indexOf(searchName[0]) ===
                    searchName[0].indexOf(searchName[0]))
              ) {
                return ex;
              }
            }
            return null;
          });
    let messageIfEmpty =
      searchedClient.length === 0
        ? "No Such Client"
        : searchedClient.length !== 0 &&
          this.state.messageIfEmpty !== "No Such Client"
        ? this.state.messageIfEmpty
        : "";
    this.state.filterFiltered.length === 0 &&
      this.setState({ filterFiltered: searchedClient });
    this.setState({
      searchedUpcomingOrPast: searchedClient,
      page: 1,
      messageIfEmpty,
    });
    this.paginate(1);
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

  searchByType = (e) => {
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
    let searchedClient =
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
    let messageIfEmpty =
      searchedClient.length === 0
        ? "No Such Type"
        : searchedClient.length !== 0 &&
          this.state.messageIfEmpty !== "No Such Type"
        ? this.state.messageIfEmpty
        : "";
    this.state.filterFiltered.length === 0 &&
      this.setState({ filterFiltered: searchedClient });
    this.setState({
      searchedUpcomingOrPast: searchedClient,
      page: 1,
      messageIfEmpty,
    });
    this.paginate(1);
  };

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

  handleClick = (id, type) => {
    if (type === "mail") {
      this.props.history.push(`/doctor/exam/detail/${id}`);
    } else if (type === "video") {
      this.props.history.push(`/doctor/video/exam/detail/${id}/#init`);
    } else if (type === "queue") {
      this.props.history.push(`/doctor/processing/video/exam/${id}/#init`);
    }
  };

  ResetonSelectChange = () => {
    this.setState({ filterFiltered: [] });
    let callBFunction = setInterval(() => {
      this.handlingSearchByName();
      clearInterval(callBFunction);
    }, 10);
  };

  handlePageChange = (pageNumber) => {
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
        <HamburgerDiv/>
        <Record
          record={this.state.record}
          props={this.state}

          handleClick={this.handleClick}
          handleClickMail={this.handleClickMail}
          handleClient={this.handleClient}
          hnlClick={this.hnlClick}
          hnlClick2={this.hnlClick2}
          hnlClick3={this.hnlClick3}
          hnlWaitingClick={this.hnlWaitingClick}
          handleKeyPress={this.handleKeyPress}
          handleChange={this.handleChange}
          handleClickLeft={this.handleClickLeft}
          handleClickRight={this.handleClickRight}
          loading={this.state.loading}
          hnlVideoClick={this.hnlVideoClick}
          handleWaitingRoom={this.handleWaitingRoom}
          handleVideoPendingClick={this.handleVideoPendingClick}
          handlePast={this.handlePast}
          handleAll={this.handleAll}
          hnlMyConsultations={this.hnlMyConsultations}
          handleClientSearch={this.handleClientSearch}
          handleTypeSearch={this.handleTypeSearch}
          searchByType={this.searchByType}
          searchByName={this.searchByName}
          ResetonSelectChange={this.ResetonSelectChange}
          handlePageChange={this.handlePageChange}
        />

      </>
    );
  }
}

export default ClientRecord;
