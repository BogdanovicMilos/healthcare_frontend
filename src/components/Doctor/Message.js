import React from "react";
import "../../assets/message.scss";

const ExamMessage = ({
  client,
  messageValue,
  handleMessage,
  submitValue,
  handleSubmit,
  onChangeHandler
}) => {
  return (
    <div className="mainMessageDiv">
      <ul className="nav-doctor">
        <h6 href="#list">New Message</h6>
      </ul>
      <div className="mainMessage">
        {client && <h5 className="client-form">To: {client}</h5>}
        <div className="input">
          <textarea
            type="text"
            className="form-control"
            placeholder="message"
            value={messageValue}
            onChange={handleMessage}
          />
          <input
            className="file"
            type="file"
            name="file"
            onChange={onChangeHandler}
          />
          <button
            type="submit"
            className="btn btn-md"
            value={submitValue}
            onClick={handleSubmit}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamMessage;
