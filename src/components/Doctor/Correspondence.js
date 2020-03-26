import React from "react";
import { connect } from "react-redux";
import Header from "../../components/Main/Header";
import Nav from "../../components/Main/Navbar";
import "../../assets/correspondence.scss";

const CorrespondenceMessage = ({ correspondence, handleClick, props }) => {
  console.log(correspondence);

  return (
    <>
      <div className="header">
        <div>
          <Header />
          <Nav />
        </div>
      </div>

      <table className="correspondence">
        {correspondence.length === 0 ? (
          <tbody style={{ color: "rgb(2, 159, 250)" }}>
            <tr>
              <td>No messages...</td>
            </tr>
          </tbody>
        ) : (
          correspondence.map((message, index) => {
            return (
              <tbody key={message.id} className="tbody">
                <tr className="senderMain">
                  <td className="sender">Sender: {message.sender}</td>
                  <td className="created">
                    {new Intl.DateTimeFormat("en-GB", {
                      year: "numeric",
                      month: "long",
                      day: "2-digit"
                    }).format(new Date(message.created))}
                  </td>
                </tr>
                <tr onClick={() => handleClick(index)} className="row1">
                  <td id={message.id} className="message">
                    Message:{message.message}{" "}
                  </td>
                </tr>
                {props.obj.active && props.obj.id === message.id ? (
                  <tr className="attachments">
                    <td className="att">Attachments:{message.attachments}</td>
                  </tr>
                ) : null}
              </tbody>
            );
          })
        )}
      </table>
    </>
  );
};

const mapStateToProps = state => {
  const doctor = state.getIn(["doctorReducer", "doctor"]);
  const user = state.getIn(["authReducer", "user"]);

  return {
    doctor,
    user
  };
};

export default connect(mapStateToProps)(CorrespondenceMessage);
