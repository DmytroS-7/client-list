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

regForm.addEventListener("submit", event => {
  event.preventDefault();
  validateRegForm(event.target);
});

const loginForm = document.querySelector("[name='loginForm']");

loginForm.addEventListener("submit", event => {
  event.preventDefault();
  validateLoginForm(event.target);
});

togleStatus(state);

//Observe changes
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    // User is signed in.
    // let displayName = user.displayName;
    let email = user.email;
    // alert("Hello " + email);
    window.location.href = "http://127.0.0.1:5500/index.html";
    // let emailVerified = user.emailVerified;
    // let photoURL = user.photoURL;
    // let isAnonymous = user.isAnonymous;
    // let uid = user.uid;
    // let providerData = user.providerData;
    // ...
  } else {
    // User is signed out.
    // ...
  }
});

//Validation

regForm.querySelector("[type='password']").addEventListener("blur", event => {
  // console.log("blur");
  validatePassword(event.target);
});

regForm
  .querySelector("[type='password']")
  .addEventListener("keypress", event => {
    validatePassword(event.target);
  });

function showLogin() {
  loginForm.style.display = "block";
  regForm.style.display = "none";
}

function showRegister() {
  loginForm.style.display = "none";
  regForm.style.display = "block";
}

function togleStatus(newState) {
  state = newState;
  state === "login" ? showLogin() : showRegister();
}

function validateRegForm(target) {
  // console.log(formEventTarget.pass.value);
  validatePassword(target.pass);
  registerNewUser(target.email.value, target.pass.value);
}

function validateLoginForm(target) {
  // console.log(formEventTarget.pass.value);
  // validatePassword(target.pass);
  logIn(target.email.value, target.pass.value);
}

function validatePassword(field) {
  const labelPass = regForm.querySelector("#labelPass");
  if (field.value.length < 5) {
    // console.error("Your password is too weak!");
    field.className += " is-invalid";
    labelPass.style.color = "red";
    labelPass.innerHTML = "The password must be 6 characters long or more!";
  } else {
    field.className = "form-control is-valid";
    labelPass.style.color = "black";
    labelPass.innerHTML = "Password";
  }
}

function registerNewUser(email, password) {
  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then(response => console.log("Register new user ", response))
    .catch(error => {
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
    .then(response => console.log(`Hello ${response.user.email}`, response))
    .catch(error => handleError(error));
}

function handleError(error) {
  alert(`Error! ${error.code} - ${error.message}`);
}
