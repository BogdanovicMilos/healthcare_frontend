import React from "react";
import "../../assets/client/dashboard.scss";
import { FaVideo } from "react-icons/fa";
import { GoFileDirectory } from "react-icons/go";
import { GoPerson } from "react-icons/go";
import { IoIosMail } from "react-icons/io";
import { GoClock } from "react-icons/go";
import { FaCheck } from "react-icons/fa";
import { FaRegClock } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { MdChatBubble } from "react-icons/md";
import { GiCancel } from "react-icons/gi";
import { FaChevronLeft } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import Loading from "../../img/loading-gif-png-5-original.gif";
import moment from "moment";

const Dashboard = ({
  initiate,
  waitingRoom,
  VideoReq,
  handleClick,
  handleChange,
  handleClickLeft,
  handleClickRight,
  handleHam,
  props
}) => (
  <div className="mainClientDashboard">
    <div className="hamburger">
      <div className="hamNprofil">
        <div className="ham" onClick={handleHam}>
          <GiHamburgerMenu />
        </div>
        <div className="profile">
          <FaUser style={{ marginRight: "5px" }} />
          Profile
        </div>
      </div>
    </div>
    <div className="main">
      <div className="videoApp" onClick={() => VideoReq()}>
        <span className="video">
          <FaVideo className="icon" />
        </span>
        <h2>
          Make a
          <br />
          <span> VIDEO APPOINTMENT</span>
        </h2>
      </div>
      <div className="emailReq" onClick={() => initiate()}>
        <span className="email">
          <IoIosMail className="icon" />
        </span>
        <h2>
          Request
          <br />
          <span> EMAIL CONSULTATION </span>
        </h2>
      </div>
      <div className="waitRoom" onClick={() => waitingRoom()}>
        <span className="clock">
          <GoClock className="icon" />
        </span>
        <h2>
          Enter
          <br /> <span> WAITING ROOM </span>
        </h2>
      </div>
    </div>
    {props.loading ? (
      <img src={Loading} alt="loading..." style={{ width: "150px" }} />
    ) : (
      <div className="mainTabel">
        <div className="mainConsultation">
          <div className="icon_left">
            <span>
              <GoFileDirectory className="icon1" />
            </span>
            <p>My Consultations</p>
          </div>
          <div className="sort">
            <label>Sort by: </label>
            <select name="" id="" onChange={handleChange}>
              <option value="latest">Latest</option>
              <option value="earliest">Earliest</option>
            </select>
          </div>
        </div>

        <table className="table2">
          <thead className="client-head">
            <tr className="client-row">
              <th className="client-doctor">Doctor</th>
              <th className="client-subject">Subject</th>
              <th className="client-subject">Type</th>
              <th className="client-subject">Date</th>
              <th className="client-status">Status</th>
            </tr>
          </thead>

          {props.paginatedExams.map((exam, index) => {
            if (exam.status === "Canceled") return null;
            return (
              <tbody key={index} className="client-body">
                <tr
                  data-id={exam.id}
                  className="list-group"
                  onClick={() => handleClick(exam.id, exam.exam_type)}
                >
                  <td className="client-doctor">{exam.doctor}</td>
                  <td className="client-subject">{exam.subject}</td>
                  <td className="client-subject">{exam.exam_type}</td>

                  <td className="created">
                    {exam.created && !exam.appointed_date ? (
                      <p>
                        {" "}
                        Created: {moment(exam.created).format("MM/DD/YYYY")}
                      </p>
                    ) : (
                      <p>
                        {" "}
                        Appointed:{" "}
                        {moment(exam.appointed_date).format("MM/DD/YYYY")}
                      </p>
                    )}
                  </td>
                  <td className="client-status">
                    {exam.status === "Accepted" ||
                    exam.status === "Appointed" ? (
                      <FaCheck className="check" />
                    ) : exam.status === "Declined" ? (
                      <GiCancel className="declined" />
                    ) : (
                      <FaRegClock className="pendi" />
                    )}
                  </td>
                </tr>
              </tbody>
            );
          })}
        </table>
      </div>
    )}

    <div className="pagi">
      <div className="left" onClick={handleClickLeft}>
        <FaChevronLeft className="iconLeft" />
      </div>
      <div className="right" onClick={handleClickRight}>
        <FaChevronRight className="iconRight" />
      </div>
    </div>
    <div className="connectWithdoctor">
      <div className="connected">
        <p>
          Connect with a doctor over live video in minutes. Available 24/7,
          nights and weekends.
        </p>
        <h4>
          See a Doctor <FaChevronRight className="see" />
        </h4>
      </div>
    </div>
    <div
      className="sideNav"
      style={{ left: props.hamburger ? "0px" : "-300px" }}
    >
      <div className="sideProfile">
        <div className="mainProfile">
          <div className="profile">
            <GoPerson className="icon" />
          </div>
          <div className="onlineDot"></div>
        </div>
        <p>name</p>
      </div>
      <div className="sideVideo" onClick={() => VideoReq()}>
        <span className="video">
          <FaVideo className="icon" />
        </span>
        <h2>Video Appointment</h2>
      </div>
      <div className="sideEmail" onClick={() => initiate()}>
        <span className="email">
          <IoIosMail className="icon" />
        </span>
        <h2>Email Consultation</h2>
      </div>
      <div className="sideWaitingRoom" onClick={() => waitingRoom()}>
        <span className="clock">
          <GoClock className="icon" />
        </span>
        <h2>Waiting Room</h2>
      </div>
      <div className="sideMyCounsultation">
        <span>
          <GoFileDirectory className="icon" />
        </span>
        <h2>My Consultations</h2>
      </div>
      <div className="sideMyAccount">
        <span>
          <FaUser />
        </span>
        <h2>Profile</h2>
      </div>
      <div className="sideHelp">
        <span className="help">
          <IoIosSettings className="icon" />
        </span>
        <h2>Help</h2>
      </div>
      <div className="sideFaq">
        <span className="faq">
          <MdChatBubble className="icon" />
        </span>
        <h2>FAQ</h2>
      </div>
      <div className="sideSignOut">
        <span className="signOut">
          <IoMdClose className="icon" />
        </span>
        <h2>Sign Out</h2>
      </div>
    </div>
  </div>
);

export default Dashboard;
