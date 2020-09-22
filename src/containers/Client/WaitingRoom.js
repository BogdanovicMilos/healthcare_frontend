import React, { Component } from "react";
import axios from "axios";
import Header from "../../components/Main/Header";
import Nav from "../../components/Main/Navbar";
import Footer from "../../components/Main/Footer";
import WaitingRoom from "../../components/Client/WaitingRoom";
import { connect } from "react-redux";
import { doctor } from "../../actions/examActions";
import { NotificationManager } from "react-notifications";
import moment from "moment";

const doctorStatusSocket = new WebSocket(
  "wss://healthcarebackend.xyz/ws/doctor/status/"
);

const connection = new WebSocket("wss://healthcarebackend.xyz/ws/video/");

class ClientWaitingRoom extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      specialities: [],
      doctors: [],
      subject: "",
      submitted: false,
      price: null,
      doctor_id: null,
      client_id: "",
      doctorsStatus: "",
      token: sessionStorage.getItem("accessToken"),
      specDoctor: [],
      specialSP: [],
      resetDoctorSelect: null,
      isClicked: false,
      credits: false,
      attachment: null,
      currentClient: "",
      peopleInQueue: [],
      YourNumber: null,
      doctorsVideoId: null,
      startVideo: false,
      value: "",
      width: 700,
      height: 500,
      x: 0,
      y: 0,
      hover: false,
      showChat: false,
      video: true,
      audio: true,
      notes: "",
      connection: "",
    };
  }

  handleVideoStart = (e) => {
    e.preventDefault();
    this.setState({ startVideo: true });
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        var myVideo = document.createElement("video");
        myVideo.id = "myVid";
        var videoChat = document.getElementById("videoChat");
        videoChat.appendChild(myVideo);
        myVideo.srcObject = stream;
        myVideo.play();
      });
  };

  handleSpeciality = (e) => {
    let filteredDoctors = this.state.doctors.filter(
      (doctor) => doctor.spec === e.label
    );

    this.setState({
      specialSP: e.value,
      specDoctor: filteredDoctors,
      resetDoctorSelect: null,
    });
  };

  handleDoctor = (e) => {
    console.log(e);
    if (e.status === "Away") {
      NotificationManager.warning(
        `Doctor is Away at the moment and not available for consultation.`,
        "Warning!",
        4000
      );
    } else if (e.status === "Offline") {
      NotificationManager.error(
        `Doctor is Offline at the moment and not available for consultation.`,
        "Warning!",
        4000
      );
    } else {
      this.props.dispatch(doctor(e));
      this.setState({
        // price: e.price,
        doctor_id: e.iD,
        doctorsStatus: e.status,
        resetDoctorSelect: e,
      });
      this.QueueList(e.iD);
    }
  };

  handleSubject = (e) => {
    this.setState({ subject: e.target.value });
  };

  handleExitQueue = async () => {
    const access_token = "Bearer ".concat(this.state.token);
    let clientCancel = await fetch(
      `https://healthcarebackend.xyz/api/queue/client/delete/${this.state.currentClient.id}/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: access_token,
        },
        body: JSON.stringify({
          status: "Cancel",
        }),
      }
    );
    let jsonData = await clientCancel.json();
    console.log(jsonData);

    if (jsonData.success === true) {
      connection.close();
      this.setState({
        credits: false,
        peopleInQueue: [],
        doctorsVideoId: null,
      });
    }

    return jsonData;
  };

  hanldeClientQueue = async (id) => {
    const access_token = "Bearer ".concat(this.state.token);
    axios
      .get(`https://healthcarebackend.xyz/api/queue/client/${id}/`, {
        headers: { Authorization: access_token },
      })

      .then((response) => {
        console.log(response, "Client, IDDDDDDDD");

        if (response.data.data) {
          // if (
          //   response.data.data.created !==
          //     moment(new Date()).format("YYYY-MM-DD") ||
          //   response.data.data.status === "Declined"
          // ) {
          //   this.setState({ currentClient: response.data.data });
          //   this.handleExitQueue();
          // } else
          if (
            (response.data.data.created ===
              moment(new Date()).format("YYYY-MM-DD") &&
              response.data.data.status === "In the queue") ||
            (response.data.data.created ===
              moment(new Date()).format("YYYY-MM-DD") &&
              response.data.data.status === "Accepted")
          ) {
            this.setState({
              credits: true,
              currentClient: response.data.data,
            });

            if (this.props.location.state !== undefined) {
              if (this.props.location.state.detail === "exitQueue") {
                this.handleExitQueue();
              }
            }
          }
          this.QueueList(response.data.data.doctor);
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.log(error.response);
      });
  };

  handleSubmit = async (e) => {
    const access_token = "Bearer ".concat(this.state.token);
    if (
      this.state.specialSP &&
      this.state.doctor_id &&
      this.state.notes &&
      this.state.subject &&
      this.state.doctorsStatus === "Available"
    ) {
      this.setState({ isClicked: true });
      const response = await fetch(
        "https://healthcarebackend.xyz/api/queue/enter/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: access_token,
          },
          body: JSON.stringify({
            client: this.state.client_id,
            speciality: this.state.specialSP,
            doctor: this.state.doctor_id,
            subject: this.state.subject,
            attachments: this.state.attachment,
            notes: this.state.notes,
          }),
        }
      );
      const data = await response.json();

      this.setState({ price: data.data.price });
      this.hanldeClientQueue(this.state.client_id);
      this.toCheckout();

      return data;
    } else if (
      this.state.doctorsStatus &&
      this.state.doctorsStatus !== "Available"
    ) {
      NotificationManager.error(
        `Doctor is not Available at the moment`,
        "Failed!",
        4000
      );
    } else {
      NotificationManager.error("Empty Fields", "Failed!", 2000);
    }
  };

  toCheckout = async () => {
    return this.props.history.push({
      pathname: "/checkout",
      // search: "?query=abc",
      state: {
        price: this.state.price,
        location: this.props.location.pathname,
      },
    });
  };

  handleClientProfile = () => {
    const access_token = "Bearer ".concat(this.state.token);
    axios
      .get(`https://healthcarebackend.xyz/api/client/profile/`, {
        headers: { Authorization: access_token },
      })
      .then((response) => {
        this.setState({ client_id: response.data.data.id });
        let id = response.data.data.id;
        this.hanldeClientQueue(id);
      });
  };

  QueueList = async (id) => {
    const access_token = "Bearer ".concat(this.state.token);
    axios
      .get(`https://healthcarebackend.xyz/api/queue/doctor/${id}/`, {
        headers: { Authorization: access_token },
      })
      .then((response) => {
        console.log(response, "people in queue");
        let filterCanceled = response.data.data.queue.filter((ex) => {
          return (
            ex.status !== "Canceled" &&
            ex.status !== "Declined" &&
            ex.status !== "Finished"
          );
        });
        this.setState({
          peopleInQueue: [...this.state.peopleInQueue.concat(filterCanceled)],
        });
        this.socketTestStart();
        this.PeopleBeforeYou();
        this.handleDoctorsStatus();
      })
      .catch((err) => {
        console.log(err.response);
      });
  };

  PeopleBeforeYou = () => {
    if (this.state.peopleInQueue.length !== 0) {
      let people = this.state.peopleInQueue.map((ppl) => {
        return ppl.id;
      });
      let yourIndex = people.indexOf(this.state.currentClient.id);
      this.setState({ YourNumber: yourIndex });
    }
  };

  socketTestStart = () => {
    if (this.state.currentClient) {
      connection.onopen = () => {
        console.log("connected");
        this.setState({ connection });
        connection.send(
          JSON.stringify({
            id: this.state.currentClient.id,
            connectedClient: true,
          })
        );
      };
    }

    connection.onmessage = (event) => {
      let test = JSON.parse(event.data);
      console.log("received client", event.data);

      if (
        !this.state.doctorsVideoId &&
        !parseInt(JSON.parse(test.text).id) &&
        test.text !== "undefined"
      ) {
        this.setState({ doctorsVideoId: test.text });
        this.socketStart();
      } else if (JSON.parse(test.text)) {
        if (
          parseInt(JSON.parse(test.text).id) === this.state.currentClient.id &&
          JSON.parse(test.text).connectedDoctor
        ) {
          connection.send(
            JSON.stringify({
              id: this.state.currentClient.id,
              connectedClient: true,
            })
          );
        } else if (JSON.parse(test.text) === "Cancel Video From Doctor") {
          this.handleDivClose();
          window.location.reload();
        }
      }
    };
  };

  componentWillUnmount() {
    this._isMounted = false;
    connection.close();
  }

  componentDidMount() {
    this._isMounted = true;
    let isItconnected = setInterval(() => {
      if (!this.state.connection && this.state.currentClient) {
        window.location.reload();
      }
      clearInterval(isItconnected);
    }, 15000);
    doctorStatusSocket.onopen = () => {
      console.log("connected to the doctor status socket");
    };

    doctorStatusSocket.onmessage = (event) => {
      console.log(event.data, "event from the doctor status socket");
      console.log(this.state.doctors, "svi doktori");
      let changedStatus = this.state.doctors.filter((ev) => {
        return ev.iD === JSON.parse(event.data).id;
      });
      Object.assign(changedStatus[0], {
        status: JSON.parse(event.data).status,
      });
    };

    this.handleClientProfile();
    this.specialitiesOfDoctors();
    this.allDoctors();
  }

  specialitiesOfDoctors = () => {
    axios
      .get("https://healthcarebackend.xyz/api/specialities/")
      .then((response) => {
        const res = response.data.data.map((val) => {
          return {
            value: val.id,
            iD: val.speciality_id,
            label: val.name,
            status: val.status,
          };
        });
        this.setState({ specialities: res });
      });
  };

  allDoctors = () => {
    axios
      .get("https://healthcarebackend.xyz/api/doctor/list/")
      .then((response) => {
        const res = response.data.data.map((val) => {
          return {
            value: val.id,
            iD: val.id,
            label: val.doctor,
            spec: val.speciality,
            price: val.price,
            status: val.status,
          };
        });
        this.setState({ doctors: res });
      });
  };

  handleDoctorsStatus = () => {
    this.state.peopleInQueue.forEach((queDoc) => {
      if (queDoc.client_id === this.state.client_id) {
        let doctorFilter = this.state.doctors.filter((yrDoc) => {
          return yrDoc.iD === queDoc.doctor;
        });
        doctorFilter.map((doctorFilter) => {
          if (doctorFilter.status !== "Available") {
            this.setState({ credits: false });
            this.handleExitQueue();
            NotificationManager.warning(
              `Doctor is not Available at the moment`,
              "Warning!",
              4000
            );
          }
          return null;
        });
      }
    });
  };

  socketStart = () =>
    navigator.webkitGetUserMedia(
      {
        video: this.state.video,
        audio: this.state.audio,
      },
      (stream) => {
        var Peer = require("simple-peer");
        // let id = Math.floor(Math.random() * 0xffffff).toString(16);
        // this.setState({ idToPush: id });
        var peer = new Peer({
          // initiator: window.location.hash === `#init`,
          trickle: false,
          stream: stream,
        });

        peer.on("signal", (data) => {
          let docId = JSON.stringify(data);
          connection.send(docId);
          var myVid = document.getElementById("myVid");
          myVid.style.cssText =
            "position: absolute; right: 0; bottom: -100px; width: 150px;";
        });

        document.getElementById("StartVideo").addEventListener("click", () => {
          peer.signal(this.state.doctorsVideoId);
          connection.send(
            JSON.stringify({
              id: this.state.currentClient.id,
              startingVideo: true,
            })
          );
        });

        document.getElementById("send").addEventListener("click", function () {
          var yourMessage = document.getElementById("yourMessage").value;
          peer.send(yourMessage);
        });

        connection.onclose = () => {
          console.error("disconnected");
          window.location.reload();
        };

        connection.onerror = (error) => {
          console.error("failed to connect", error);
        };

        document.querySelector("form").addEventListener("submit", (event) => {
          event.preventDefault();
          let message = document.querySelector("#yourMessage").value;
          connection.send(message);
          document.getElementById(
            "messages"
          ).innerHTML += `<p style='color:white ; text-align: left ;margin: 5px;display: table; white-space: initial ; background: blue; padding: 10px; border-radius: 10px'>${message}</p>`;
          this.setState({ value: "" });
        });

        peer.on("data", function (data) {
          document.getElementById(
            "messages"
          ).innerHTML += `<p style='color:black ; margin: 5px 0 5px auto; background: gainsboro ;display: table; white-space: initial; padding: 10px; border-radius: 10px'>${data}</p>`;
        });

        let track = stream.getAudioTracks()[0];
        let cutVideo = stream.getVideoTracks()[0];
        document.querySelector(".iconMic").addEventListener("click", () => {
          track.enabled = !track.enabled;
        });

        document.querySelector(".iconVideo").addEventListener("click", () => {
          cutVideo.enabled = !cutVideo.enabled;
        });

        document
          .querySelector(".iconMicUnmute")
          .addEventListener("click", () => {
            track.enabled = !track.enabled;
          });

        document
          .querySelector(".iconVideoShow")
          .addEventListener("click", () => {
            cutVideo.enabled = !cutVideo.enabled;
          });

        peer.on("stream", (stream) => {
          const mediaStream = new MediaStream(stream);
          var video = document.createElement("video");
          video.classList.add("vid");
          var videoChat = document.getElementById("videoChat");
          videoChat.appendChild(video);
          video.srcObject = mediaStream;
          video.play();
        });

        peer.on("close", () => {
          // this.handleExitQueue();
          // peer.destroy();
          this.handleDivClose();
          window.location.reload();
          // connection.close();
        });

        document.querySelector(".icon2").addEventListener("click", () => {
          // this.handleExitQueue();
          // peer.destroy();
          connection.send(JSON.stringify("Cancel Video From Client"));
          this.handleDivClose();
          window.location.reload();
          // connection.close();
        });
        document.querySelector(".iconPhone").addEventListener("click", () => {
          // this.handleExitQueue();
          // peer.destroy();
          connection.send(JSON.stringify("Cancel Video From Client"));
          this.handleDivClose();
          window.location.reload();
          // connection.close();
        });
      },
      function (err) {
        console.error(err);
      }
    );

  handleChange = (e) => {
    this.setState({ value: e.target.value });
  };
  handleMessage = (e) => {
    this.setState({ notes: e.target.value });
  };
  enableTipeing = (e) => {
    e.stopPropagation();
  };

  iconsMouseOver = () => {
    this.setState({ hover: true });
  };

  iconsMouseOut = () => {
    this.setState({ hover: false });
  };

  handleDragDrop = (d) => {
    this.setState({ x: d.x, y: d.y });
  };

  handleResize = (position, ref) => {
    let vide = document.getElementById("videoo");
    this.setState({
      width: vide.style.width,
      height: vide.style.height,
      ...position,
    });
  };

  showAndHideChat = () => {
    this.setState({ showChat: !this.state.showChat });
  };

  handleDivSize = () => {
    this.setState({
      width: window.screen.width,
      height: window.screen.height,
      x: -320,
      y: -100,
      // width: document.body.offsetWidth,
      // height: document.body.offsetHeight,
    });
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        this.setState({ width: 700, height: 500 });
      }
    }
  };

  handleDivClose = () => {
    this.setState({ startVideo: false });
  };

  cutMic = () => {
    this.setState({ audio: !this.state.audio });
  };

  cutVideo = () => {
    this.setState({ video: !this.state.video });
  };

  render() {
    return (
      <>
        <div className="header">
          <div>
            <Header exitQueue={this.exitQueue} />
            <Nav />
          </div>
        </div>
        <WaitingRoom
          handleSpeciality={this.handleSpeciality}
          handleDoctor={this.handleDoctor}
          handleSubject={this.handleSubject}
          handleSubmit={this.handleSubmit}
          handleExitQueue={this.handleExitQueue}
          handleVideoStart={this.handleVideoStart}
          props={this.state}
          handleChange={this.handleChange}
          enableTipeing={this.enableTipeing}
          iconsMouseOut={this.iconsMouseOut}
          iconsMouseOver={this.iconsMouseOver}
          handleDragDrop={this.handleDragDrop}
          handleResize={this.handleResize}
          showAndHideChat={this.showAndHideChat}
          handleDivSize={this.handleDivSize}
          cutMic={this.cutMic}
          cutVideo={this.cutVideo}
          handleMessage={this.handleMessage}
        />
        <div className="footerr">
          <Footer />
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  const doctor = state.getIn(["doctorReducer", "doctor"]);

  return {
    doctor,
    price: state.price,
  };
};

export default connect(mapStateToProps)(ClientWaitingRoom);
