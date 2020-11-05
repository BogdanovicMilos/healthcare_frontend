import React, { Component } from "react";
import Header from "../../components/Main/Header";
import Nav from "../../components/Main/Navbar";
import axios from "axios";
import moment from "moment";
import {
  Inject,
  ScheduleComponent,
  Day,
  Week,
  WorkWeek,
  Month,
  Agenda,
} from "@syncfusion/ej2-react-schedule";
import { HamburgerDiv } from "../../components/Main/HamburgerDiv";

export class DoctorsCalendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: sessionStorage.getItem("accessToken"),
      exams: [],
    };
    // this.data = [
    //   {
    //     Id: 2,
    //     Subject: "Meeting",
    //     StartTime: new Date(2018, 1, 15, 10, 0),
    //     EndTime: new Date(2018, 1, 15, 12, 30),
    //     IsAllDay: false,
    //     Status: "Completed",
    //     Priority: "High",
    //   },
    // ];
  }

  componentDidMount() {
    this.peopleVideoPending();
  }

  peopleVideoPending = async () => {
    const access_token = "Bearer ".concat(this.state.token);
    await axios
      .get(`http://healthcarebackend.xyz/doctor/`, {
        headers: { Authorization: access_token },
      })
      .then((response) => {
        console.log(response.data.data);
        let accepted = response.data.data.video.filter((res) => {
          return res.status === "Appointed";
        });
        const newObject = accepted.map((obj) => {
          return {
            client: obj.client,
            startTime: obj.appointed_date,
            endTime: moment(obj.appointed_date)
              .add(30, "minutes")
              .format("YYYY-MM-DD HH:mm"),
            id: obj.id,
          };
        });

        this.setState({
          exams: [...this.state.exams.concat(newObject)],
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };
  render() {
    console.log(this.state.exams);

    return (
      <>
        <div className="header">
          <div>
            <Header />
            <Nav />
          </div>
        </div>
        <HamburgerDiv/>
        <div
          style={{
            width: "65%",
            margin: "100px auto 58px auto",
          }}
        >
          <ScheduleComponent
            currentView="Day"
            workHours={{
              highlight: true,
              start: "09:00",
              end: "17:00",
            }}
            selectedDate={new Date()}
            eventSettings={{
              dataSource: this.state.exams,
              fields: {
                id: "id",
                subject: { name: "client" },
                startTime: { name: "startTime" },
                endTime: { name: "endTime" },
              },
            }}
          >
            <Inject services={[Day, Week, WorkWeek, Month, Agenda]} />
          </ScheduleComponent>
        </div>
      </>
    );
  }
}

export default DoctorsCalendar;
