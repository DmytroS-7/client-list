import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/styles.css";

const firebase = require("firebase/app");
require("firebase/auth");
import * as validator from "validator";
import { initApp } from "./firebase.js";

initApp();

// const link = document.querySelector(".headerLink");

// link.addEventListener("click", event => {
//   const wantToContinue = confirm("Do you want to leave this page?");
//   //   console.log(event.target);
//   //   event.target.style.color = "red";
//   if (!wantToContinue) {
//     event.preventDefault();
//   }
// });

// console.log(firebase);

let state = "login";

const regForm = document.querySelector("[name='registerForm']");

regForm.addEventListener("submit", (event) => {
  event.preventDefault();
  validateRegForm(event.target);
});

const loginForm = document.querySelector("[name='loginForm']");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  validateLoginForm(event.target);
});

toggleStatus(state);

//Observe changes
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in.
    // let displayName = user.displayName;
    let email = user.email;
    // alert("Hello " + email);
    //let emailVerified = user.emailVerified;
    // if (emailVerified) {
    // window.location.href = "./index.html";
    // } else {
    //   window.alert("email not verified");
    // }
    // window.location.href = "./index.html";
    // let photoURL = user.photoURL;
    // let isAnonymous = user.isAnonymous;
    // let uid = user.uid;
    // let providerData = user.providerData;
    // ...
    // console.log(user);
  } else {
    // User is signed out.
    // ...
  }
});

function sendVerification() {
  const user = firebase.auth().currentUser;

  user
    .sendEmailVerification()
    .then(function () {
      // Email sent.
      window.alert("Verification Send Email");
    })
    .catch(function (error) {
      // An error happened.
      window.alert("Error: " + error.message);
    });
}

//Validation

regForm.querySelector("[name='email']").addEventListener("blur", (event) => {
  // console.log("blur");
  validateEmail(event.target);
});

loginForm.querySelector("[name='email']").addEventListener("blur", (event) => {
  // console.log("blur");
  validateEmail(event.target);
});

regForm.querySelector("[type='password']").addEventListener("blur", (event) => {
  // console.log("blur");
  validatePassword(event.target);
});

loginForm
  .querySelector("[type='password']")
  .addEventListener("blur", (event) => {
    // console.log("blur");
    validatePassword(event.target);
  });

// regForm
//   .querySelector("[type='password']")
//   .addEventListener("keypress", event => {
//     validatePassword(event.target);
//   });

const toggleButtons = [
  { id: "toggleRegister", value: "register" },
  { id: "toggleLogin", value: "login" },
];
toggleButtons.forEach((button) => {
  const element = document.querySelector(`#${button.id}`);
  element.addEventListener("click", () => {
    toggleStatus(button.value);
  });
});

function showLogin() {
  loginForm.style.display = "block";
  regForm.style.display = "none";
}

function showRegister() {
  loginForm.style.display = "none";
  regForm.style.display = "block";
}

function toggleStatus(newState) {
  state = newState;
  state === "login" ? showLogin() : showRegister();
  const alert = document.querySelector(".alert");
  alert.className = "alert alert-danger fade show m-4 d-none";
}

function validateRegForm(target) {
  // console.log(formEventTarget.pass.value);
  // validatePassword(target.pass);
  const isFormValid = validateRequiredFields(target);
  isFormValid ? registerNewUser(target.email.value, target.pass.value) : null;
}

function validateLoginForm(target) {
  // console.log(formEventTarget.pass.value);
  // validatePassword(target.pass);
  const isFormValid = validateRequiredFields(target);
  isFormValid ? logIn(target.email.value, target.pass.value) : null;
}

function validateRequiredFields(target) {
  const isPasswordValid = validatePassword(target.pass);
  const isEmailValid = validateEmail(target.email);
  return isPasswordValid && isEmailValid;
}

function validateEmail(field) {
  // validator.isEmail("foo@bar.com");
  if (field.value && validator.isEmail(field.value)) {
    markFieldAsValid(field);
    return true;
  }
  // console.log(field);
  markFieldAsInvalid(field);
  return false;
}

function validatePassword(field) {
  if (field.value) {
    markFieldAsValid(field);
    return true;
  }
  markFieldAsInvalid(field);
  return false;

  // const labelPass = regForm.querySelector("#labelPass");
  // if (field.value.length < 5) {
  //   console.error("Your password is too weak!");
  //   field.className += " is-invalid";
  //   labelPass.style.color = "red";
  //   labelPass.innerHTML = "The password must be 6 characters long or more!";
  //   return false;
  // } else {
  //   field.className = "form-control is-valid";
  //   labelPass.style.color = "white";
  //   labelPass.innerHTML = "Password";
  //   return true;
  // }
}

function markFieldAsInvalid(field) {
  field.className += " is-invalid";
}

function markFieldAsValid(field) {
  field.className = "form-control is-valid";
}

function registerNewUser(email, password) {
  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((response) => {
      console.log("Register new user ", response);
      sendVerification();
    })
    .catch((error) => {
      // Handle Errors here.
      // let errorCode = error.code;
      // let errorMessage = error.message;
      // alert(`Error! ${errorCode} - ${errorMessage}`);
      handleError(error);
    });
}

function logIn(email, password) {
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((response) => {
      console.log(`Hello ${response.user.email}`, response);
      // window.location.href = "./index.html";
      CheckVerificationEmail();
    })
    .catch((error) => handleError(error));
}

function CheckVerificationEmail() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user.emailVerified) {
      window.location.href = "./index.html";
    } else {
      // User is signed out.
      window.alert("Email is not verified");
      window.location.href = "./login.html";
    }
  });
}

function handleError(error) {
  const alert = document.querySelector(".alert");
  const strong = alert.querySelector("strong");
  const message = alert.querySelector(".error-message");
  // strong.innerHTML = error.code;
  message.innerHTML = error.message;
  alert.className = "alert alert-danger fade show m-4";
  // alert(`Error! ${error.code} - ${error.message}`);
}
