import React, { Component } from "react";
import {
  injectStripe,
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement,
} from "react-stripe-elements";
import { connect } from "react-redux";
import { compose } from "redux";
import "../../assets/client/checkout.scss";
import { NotificationManager } from "react-notifications";
import { Redirect } from "react-router-dom";
import { FaCreditCard } from "react-icons/fa";
import { FaPaypal } from "react-icons/fa";
import Header from "../../components/Main/Header";
import Nav from "../../components/Main/Navbar";
import PaypalButton from "./PaypalCheckout";

const webso = new WebSocket("wss://healthcarebackend.xyz/ws/exam/");

class CheckoutForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      complete: false,
      selectedCard: true,
      selectedPal: false,
      token: null,
      cardNumber: false,
      cardCvc: false,
      cardExpiry: false,
    };
  }

  // handleToken = (token, addresses) => {
  //   console.log(token, addresses);
  // };

  // submit = async (ev) => {
  //   ev.preventDefault();
  //   const price = parseInt(this.props.doctor.price, 10);
  //   const cardElement = this.props.elements.getElement("card");
  //   const { paymentMethod } = await this.props.stripe.createPaymentMethod({
  //     type: "card",
  //     card: cardElement,
  //   });
  //   if (paymentMethod === undefined) {
  //     NotificationManager.error("Faild to Checkout", "Faild!", 2000);
  //   } else if (paymentMethod !== undefined) {
  //     const response = await fetch(
  //       "https://healthcarebackend.xyz/api/charge/",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           payment_method_id: paymentMethod.id,
  //           amount: price,
  //         }),
  //       }
  //     );
  //     // await handleServerResponse(await response.json())
  //     const data = await response.json();
  //     console.log(data);

  //     if (data.message === "Payment completed") {
  //       this.setState({ complete: true });
  //       NotificationManager.success("Checkout Completed", "Successful!", 2000);
  //     }
  //   }
  // };

  handleChange = (change) => {
    // console.log("[change]", change);
    this.setState({ [change.elementType]: change.complete });
  };
  handleReady = () => {
    console.log("[ready]");
  };

  handleSubmit = async (ev) => {
    ev.preventDefault();
    const price = parseInt(this.props.location.state.price, 10);
    if (
      this.props.stripe &&
      this.state.cardNumber &&
      this.state.cardExpiry &&
      this.state.cardCvc
    ) {
      if (this.props.location.state.price === "None") {
        NotificationManager.error(
          "Doctor did not set his price",
          "Faild",
          3000
        );
      } else {
        const result = await this.props.stripe.createPaymentMethod("card", {});
        console.log(result.paymentMethod);
        // await this.props.stripe.createToken().then((payload) => {
        //   console.log("[token]", payload.token);
        //   this.setState({ token: payload.token });
        // });
        const response = await fetch(
          "https://healthcarebackend.xyz/api/charge/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              payment_method_id: result.paymentMethod.id,
              amount: price,
              currency: "",
            }),
          }
        );

        // await this.handleServerResponse(await response.json());
        const data = await response.json();
        console.log(data);

        if (data.message === "Payment completed") {
          webso.send("nesto");

          this.setState({ complete: true });
          NotificationManager.success(
            "Checkout Completed",
            "Successful!",
            2000
          );
        } else {
          NotificationManager.error("Faild to Checkout", "Faild!", 2000);
          console.log("Stripe.js hasn't loaded yet.");
        }
      }
    }
  };

  handleServerResponse = async (response) => {
    if (response.error) {
      // Show error from server on payment form
    } else if (response.requires_action) {
      // Use Stripe.js to handle the required card action
      const {
        error: errorAction,
        paymentIntent,
      } = await this.props.stripe.handleCardAction(
        response.payment_intent_client_secret
      );

      if (errorAction) {
        // Show error from Stripe.js in payment form
      } else {
        // The card action has been handled
        // The PaymentIntent can be confirmed again on the server
        const serverResponse = await fetch(
          "https://healthcarebackend.xyz/api/pay",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payment_intent_id: paymentIntent.id }),
          }
        );
        this.handleServerResponse(await serverResponse.json());
      }
    } else {
      // Show success message
      NotificationManager.success("Completed", "Successful!", 2000);
    }
  };

  handleSelect = () => {
    this.setState({ selectedCard: true, selectedPal: false });
  };

  handleSelectPal = () => {
    this.setState({ selectedCard: false, selectedPal: true });
  };

  handleReady = (element) => {
    this.setState({ cardElement: element });
  };

  componentDidMount() {
    this.connectSocket();
  }

  connectSocket = () => {
    webso.onopen = () => {
      // on connecting, do nothing but log it to the console
      console.log("connected to socket");
    };
  };

  render() {
    console.log(this.props.location);

    const createOptions = (fontSize, padding) => {
      return {
        style: {
          base: {
            fontSize,
            color: "#4092c2",
            letterSpacing: "0.025em",
            "::placeholder": {
              color: "#4092c2",
              fontSize: "12px",
              fontWeight: 700,
            },
            padding,
          },
          invalid: {
            color: "#9e2146",
          },
        },
      };
    };
    if (this.state.complete) {
      return <Redirect to="/dashboard-client" />;
    }
    return (
      <>
        <div className="header">
          <div>
            <Header />
            <Nav />
          </div>
        </div>
        <div className="mainCardDiv">
          <h1>Payment</h1>
          <p>Choose payment method below</p>
          <div className="payWay">
            <div
              className="cardIcon"
              style={{
                border: this.state.selectedCard ? "2px solid #4092c2" : "none",
              }}
              onClick={this.handleSelect}
            >
              <FaCreditCard className="icon" />
            </div>
            <div
              className="paypalIcon"
              style={{
                border: this.state.selectedPal ? "2px solid #4092c2" : "none",
              }}
              onClick={this.handleSelectPal}
            >
              <FaPaypal className="icon" />
            </div>
          </div>
          {this.state.selectedCard ? (
            <div className="mainBillDiv">
              <div className="billingInfo">
                <h1>Billing Info</h1>
                <label htmlFor="fullName">
                  FULL NAME
                  <br />
                  <input id="fullName" placeholder="John Doe" type="text" />
                </label>
                <h1 className="totalPrice">
                  Total:{" "}
                  {this.props.location.state === undefined
                    ? 0
                    : this.props.location.state.price
                    ? this.props.location.state.price
                    : 0}{" "}
                  €
                </h1>
              </div>
              <div className="creditCardInfo">
                <h1>Credit Card Info</h1>

                {/* <form>
                <label>
                  CARD NUMBER
                  <CardNumberElement
                    stripeKey="pk_test_EolntZ7skKXUqmWzbnpuo1zy00ZxWVnWf3"
                    token={this.handleToken}
                    className="CardElement"
                    onReady={this.handleReady}
                    {...createOptions(this.props.fontSize)}
                  />
                </label>
                <label>
                  EXPIRE DATE
                  <CardExpiryElement
                    className="CardElement"
                    onReady={this.handleReady}
                    {...createOptions(this.props.fontSize)}
                  />
                </label>
                <label>
                  CVC
                  <CardCvcElement
                    className="CardElement cvc"
                    onReady={this.handleReady}
                    {...createOptions(this.props.fontSize)}
                  />
                </label>
                <button className="btn-checkout" onClick={this.submit}>
                  {" "}
                  Submit{" "}
                </button>
              </form> */}
                <form onSubmit={this.handleSubmit}>
                  <label>
                    CARD NUMBER
                    <CardNumberElement
                      className="CardElement"
                      onChange={this.handleChange}
                      onReady={this.handleReady}
                      {...createOptions(this.props.fontSize)}
                    />
                  </label>
                  <label>
                    EXPIRATION DATE
                    <CardExpiryElement
                      className="CardElement"
                      onChange={this.handleChange}
                      onReady={this.handleReady}
                      {...createOptions(this.props.fontSize)}
                    />
                  </label>
                  <label>
                    CVC
                    <CardCVCElement
                      className="CardElement cvc"
                      onChange={this.handleChange}
                      onReady={this.handleReady}
                      {...createOptions(this.props.fontSize)}
                    />
                  </label>
                  <button className="btn-checkout"> Submit </button>
                </form>
              </div>
            </div>
          ) : this.state.selectedPal ? (
            <div>
              <PaypalButton
                amount={
                  this.props.location.state
                    ? this.props.location.state.price
                    : 0
                }
              />
            </div>
          ) : null}
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  const doctor = state.getIn(["doctorReducer", "doctor"]);
  console.log(doctor);

  return {
    doctor,
  };
};

export default compose(connect(mapStateToProps), injectStripe)(CheckoutForm);
