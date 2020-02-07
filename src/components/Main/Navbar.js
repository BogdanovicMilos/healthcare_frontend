import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import "../../assets/main/navbar.scss";

const Nav = ({
  register,
  login,
  handleLogout,
  isLoggedIn,
  handleDashboardDoctor,
  handleDashboardClient,
  handleDoctorProfile,
  handleClientProfile,
  handleClients,
  doctor
}) => {
  let dashboardLink = null;
  let profileLink = null;
  let clientsLink = null;
  let curDoc = null;
  const isDoctor = sessionStorage.getItem("is_doctor");
  if (isDoctor === "true") {
    dashboardLink = (
      <Link
        to="/dashboard-doctor"
        className="doc-dash"
        onClick={() => handleDashboardDoctor}
      >
        Dashboard
      </Link>
    );
    curDoc = <div className="initials">{doctor}</div>;
    clientsLink = (
      <Link
        to="/doctors-clients"
        className="doc-dash"
        onClick={() => handleClients}
      >
        Clients
      </Link>
    );
    profileLink = (
      <Link
        to="/doctor/profile"
        className="doc-profile"
        onClick={handleDoctorProfile}
      >
        Profile
      </Link>
    );
  } else {
    dashboardLink = (
      <Link
        to="/dashboard-client"
        className="cli-dash"
        onClick={() => handleDashboardClient}
      >
        Dashboard
      </Link>
    );
    profileLink = (
      <Link
        to="/client/profile"
        className="cli-profile"
        onClick={handleClientProfile}
      >
        Profile
      </Link>
    );
  }
  return (
    <nav className="nav">
      {!isLoggedIn && (
        <ul className="nav navbar-nav navbar-right">
          <li className="li-reg">
            <Link to="/register" onClick={register} className="register">
              Sign Up
            </Link>
          </li>
          <li className="li-log">
            <Link to="/login" onClick={login} className="login">
              Log In
            </Link>
          </li>
        </ul>
      )}
      {isLoggedIn && (
        <ul className="nav navbar-nav navbar-right">
          <li>{dashboardLink}</li>
          <li>{clientsLink}</li>
          <li>{profileLink}</li>

          <li>
            <Link to="/logout" onClick={handleLogout}>
              Logout
            </Link>
          </li>
          <span className="inic">{curDoc}</span>
        </ul>
      )}
    </nav>
  );
};

const mapStateToProps = state => {
  const user = state.getIn(["authReducer", "user"]);
  const isLoggedIn = state.getIn(["authReducer", "isLoggedIn"]);
  const doctor = state.getIn(["docReducer", "doctor"]);

  return {
    user,
    isLoggedIn,
    doctor
  };
};

export default connect(mapStateToProps)(Nav);
