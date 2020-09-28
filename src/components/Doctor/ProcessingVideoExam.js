import React, { Fragment } from "react";
import "../../assets/processingWaitingRoom.scss";
// import moment from "moment";
import { FaMicrophoneAltSlash } from "react-icons/fa";
import { FaMicrophoneAlt } from "react-icons/fa";
import { FaVideoSlash } from "react-icons/fa";
import { FaVideo } from "react-icons/fa";
import { FaPhoneSlash } from "react-icons/fa";
import { FaRegSquare } from "react-icons/fa";
import { FaRocketchat } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { Rnd } from "react-rnd";
import Select from "react-select";

const Processing = ({
  handleConnect,
  handleVideoStart,
  props,
  handleChange,
  handleStatus,
  enableTipeing,
  iconsMouseOut,
  iconsMouseOver,
  handleDragDrop,
  handleResize,
  showAndHideChat,
  handleDivSize,
  cutVideo,
  cutMic,
}) => {
  return (
    <>
      {props.exam.map((exam) => {
        let disabled2 =
          props.connected && exam.exam.status === "Accepted" ? false : true;
        let placeholder =
          exam.exam.status === "In the queue" ? "Pending" : props.clientStatus;
        let options =
          exam.exam.status !== "Accepted"
            ? [
                { value: "Accept", label: "Accept" },
                { value: "Decline", label: "Decline" },
              ]
            : [{ value: "Finish", label: "Finish" }];
        return (
          <Fragment key={exam.exam.id}>
            <div className="detail-exam">
              <div className="detail">
                <p>
                  <span>Client:</span> {exam.exam.client}
                </p>
                <p>
                  <span>Created:</span> {exam.exam.created}
                </p>
                <p>
                  <span>Type:</span> {exam.exam.exam_type}
                </p>
                <p>
                  <span>Subject: </span> {exam.exam.subject}
                </p>
                <p>
                  <span>Message: </span> {exam.exam.notes}
                </p>
                {exam.exam.status === "Canceled" ||
                exam.exam.status === "Finished" ||
                exam.exam.status === "Declined" ? (
                  <p>
                    <span>Status:</span> {exam.exam.status}
                  </p>
                ) : (
                  <div className="divSelectButton">
                    <Select
                      type="text"
                      placeholder={placeholder}
                      className="select-option"
                      value={props.statusValue}
                      options={options}
                      onChange={handleStatus}
                      isDisabled={
                        exam.exam.status !== "Accepted" &&
                        exam.exam.status !== "In the queue"
                          ? true
                          : false
                      }
                    />
                  </div>
                )}
              </div>
              {/* {exam.record ? (
                <div key={exam.record.id} className="record-box">
                  <h4>Record</h4>
                  <p>
                    <span>Allergies: </span> {exam.record.allergies}
                  </p>
                  <p>
                    <span>Teraphy history: </span> {exam.record.teraphy_history}
                  </p>
                  <p>
                    <span>Medical conditions: </span>{" "}
                    {exam.record.medical_conditions}
                  </p>
                </div>
              ) : null} */}
            </div>
            <div className="message-btn">
              {exam.exam.status === "Accepted" &&
              !props.connectedall &&
              !props.connected ? (
                <h3 style={{ color: "#4092c2" }}>Connecting...</h3>
              ) : (
                exam.exam.status === "Canceled" && (
                  <h3 style={{ color: "#4092c2" }}>Reject-Connection</h3>
                )
              )}
              <button
                id="DoctorStartVideo"
                type="submit"
                className="btn"
                onClick={handleVideoStart}
                disabled={disabled2}
              >
                Start Video
              </button>
            </div>
            <div className="recordsDetail">
              <h4>Report</h4>

              <div className="report">
                {props.exam !== 0 &&
                  props.exam.map((exam) => {
                    return exam.record && exam.record.report.length !== 0
                      ? exam.record.report.map((filexam) => {
                          return (
                            <div key={filexam.id} className="report-details">
                              <p>
                                <span>Doctor:</span> {filexam.name}
                              </p>
                              <p>
                                <span>Speciality:</span> {filexam.spec_name}
                              </p>
                              <p>
                                <span>Diagnose:</span> {filexam.diagnose}
                              </p>
                              <p>
                                <span>Report:</span> {filexam.report}
                              </p>
                              <p>
                                <span>Tests:</span> {filexam.tests}
                              </p>
                              <p>
                                <span>Medication Name:</span>{" "}
                                {filexam.medication_name}
                              </p>
                              <p>
                                <span>Prescribing Date:</span>{" "}
                                {filexam.medication_prescribing_date}
                              </p>
                              <p>
                                <span>Medication Notes:</span>{" "}
                                {filexam.medication_notes}
                              </p>
                            </div>
                          );
                        })
                      : null;
                  })}
              </div>
            </div>
          </Fragment>
        );
      })}

      {/* <div
      style={{ display: props.startVideo ? "block" : "none" }}
      id="videoo"
    ></div> */}
      <Rnd
        id="videoo"
        size={{
          width: props.width,
          height: props.height,
        }}
        style={{
          display: props.startVideo ? "block" : "none",
        }}
        position={{ x: props.x, y: props.y }}
        onDragStop={(e, d) => {
          handleDragDrop(d);
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          handleResize(ref, position);
        }}
      >
        {" "}
        <div id="topControler">
          <span className="icon1" onClick={handleDivSize}>
            <FaRegSquare />
          </span>
          <span className="icon2">
            <MdClose />
          </span>
        </div>
        <div id="mainChatVideo">
          <form
            autoComplete="off"
            style={{ display: props.showChat ? "block" : "none" }}
            action=""
            id="form"
          >
            <pre id="messages"></pre>
            <div className="inputMessage">
              <input
                type="text"
                placeholder="Type your message..."
                id="yourMessage"
                value={props.value}
                onChange={handleChange}
                onMouseDown={enableTipeing}
              ></input>
              <button id="send">Send</button>
            </div>
          </form>
          <div
            id="videoChat"
            style={{ width: props.showChat ? "50%" : "100%" }}
            onMouseOver={iconsMouseOver}
            onMouseOut={iconsMouseOut}
          >
            <div className="chatRoom" onClick={showAndHideChat}>
              <FaRocketchat />
            </div>
            <div
              id="functionality"
              style={{ display: props.hover ? "flex" : "none" }}
            >
              <FaMicrophoneAltSlash
                className="iconMic"
                style={{ display: !props.audio ? "none" : "block" }}
                onClick={cutMic}
              />

              <FaMicrophoneAlt
                className="iconMicUnmute"
                style={{ display: props.audio ? "none" : "block" }}
                onClick={cutMic}
              />

              <FaPhoneSlash className="iconPhone" />

              <FaVideoSlash
                className="iconVideo"
                style={{ display: !props.video ? "none" : "block" }}
                onClick={cutVideo}
              />

              <FaVideo
                className="iconVideoShow"
                style={{ display: props.video ? "none" : "block" }}
                onClick={cutVideo}
              />
            </div>
          </div>
        </div>
      </Rnd>
    </>
  );
};

export default Processing;
