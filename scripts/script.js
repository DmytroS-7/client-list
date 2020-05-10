import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/styles.css";

window.jQuery = window.$ = require("jquery");

const firebase = require("firebase/app");
require("firebase/auth");
require("firebase/database");
import { initApp } from "./firebase.js";
import { getData, clients } from "./data";
import { refreshData, showResultListOrNotFound } from "./dom";

initApp();
getData();

//Observe changes
firebase.auth().onAuthStateChanged((user) => {
  if (user.emailVerified) {
    let email = user.email;
    console.log(user);
  } else {
    // User is signed out.
    window.location.href = "./login.html";
  }
});

const newClientForm = document.querySelector("#newClientForm");

newClientForm.addEventListener("submit", (event) => {
  event.preventDefault();
  // console.log(event.target);
  addClient(event.target);
  hideModel("#newClientModal");
});

function hideModel(param) {
  $(param).modal("hide");
}

const editClientForm = document.querySelector("#editClientForm");

editClientForm.addEventListener("submit", (event) => {
  event.preventDefault();
  // console.log(event.target);
  editClient(event.target); //TODO: comment
  hideModel("#editClientForm");
});

const sortsFields = [
  { id: "sortAscending", value: "ascending" },
  { id: "sortDescending", value: "descending" },
];
sortsFields.forEach((field) => {
  const element = document.querySelector(`#${field.id}`);
  element.addEventListener("click", () => {
    sortList(field.value);
  });
});

const filterField = document.querySelector("#filterInput");
filterField.addEventListener("keyup", (event) => {
  filterList(event);
});

function editClient(form) {
  const data = {
    firstName: form.firstName.value,
    lastName: form.lastName.value,
    email: form.email.value,
    gender: form.gender.value,
    amount: form.amount.value,
    date: form.date.value,
    avatar: "https://robohash.org/omnisveniamqui.jpg?size=50x50&set=set1",
    // avatar: form.photo.value
  };

  // console.log(data);
  const id = form.clientID.value;

  let updates = {};

  updates[`clients/${id}`] = data;
  // console.log("id-", id, data);
  if (id) updateDB(updates);
  hideModel("#editClientModal");
}

function sortList(order) {
  const sortedClients = clients.sort((lastClient, nextClient) => {
    if (order == "ascending") {
      return removeCurrencyFromAmount(lastClient.amount) >
        removeCurrencyFromAmount(nextClient.amount)
        ? 1
        : -1;
    } else {
      return removeCurrencyFromAmount(lastClient.amount) <
        removeCurrencyFromAmount(nextClient.amount)
        ? 1
        : -1;
    }
  });
  refreshData(sortedClients);
}
// function sortList(order) {
//   const sortedClients = clients.sort((lastClient, nextClient) => {
//     if (order == "ascending") {
//       return lastClient.lastName > nextClient.lastName ? 1 : -1;
//     } else {
//       return lastClient.lastName < nextClient.lastName ? 1 : -1;
//     }
//   });
//   refreshData(sortedClients);
// }

function filterList(event) {
  const filterString = event.target.value.toLowerCase().trim();
  if (filterString) {
    const filteredClients = clients.filter((client) => {
      return (
        client.firstName.toLowerCase().includes(filterString) ||
        client.lastName.toLowerCase().includes(filterString) ||
        client.email.toLowerCase().includes(filterString) ||
        client.date.toLowerCase().includes(filterString)
      );
    });
    refreshData(filteredClients);
    filteredClients.length === 0
      ? showResultListOrNotFound("showNotFound")
      : showResultListOrNotFound();
  } else {
    refreshData(clients);
    showResultListOrNotFound();
  }
}

const filterGender = [
  { id: "filterFemale", value: "Female" },
  { id: "filterMale", value: "Male" },
];
filterGender.forEach((gender) => {
  const element = document.querySelector(`#${gender.id}`);
  element.addEventListener("click", () => {
    filterListGender(gender.value);
  });
});

//--filterListGender  v1
// function filterListGender(defaultGender) {
//   const genderList = [];
//   clients.forEach(client => {
//     if (client.gender == defaultGender) {
//       // console.log(client);
//       genderList.push(client);
//     }
//   });
//   // console.log(genderList);
//   refreshData(genderList);
// }

//--filterListGender  v2
function filterListGender(defaultGender) {
  const genderList = clients.filter((client) => {
    return client.gender.toLowerCase() == defaultGender.toLowerCase();
  });
  refreshData(genderList);
}

function removeCurrencyFromAmount(amount) {
  return amount ? Number(amount.slice(1)) : 0;
}

function addClient(form) {
  const data = {
    firstName: form.firstName.value,
    lastName: form.lastName.value,
    email: form.email.value,
    gender: form.gender.value,
    amount: "$" + form.amount.value,
    date: form.date.value,
    avatar: "https://robohash.org/omnisveniamqui.jpg?size=50x50&set=set1",
    // avatar: form.photo.value
  };

  const newId = firebase.database().ref().child("clients").push().key;

  let updates = {};
  updates[`clients/${newId}`] = data;

  updateDB(updates);
  clearFieldsForm(form);
}

function updateDB(updates) {
  firebase
    .database()
    .ref()
    .update(updates, function (error) {
      if (error) {
        console.error(
          "New client was not added or was not saved! Error occured!"
        );
      } else {
        // Data saved successfully!
        console.log("Data added/saved to database!");
      }
    });
}

function clearFieldsForm(form) {
  form.firstName.value = "";
  form.lastName.value = "";
  form.email.value = "";
  form.amount.value = "";
}

const logOutBtn = document.querySelector("#logOut");
logOutBtn.addEventListener("click", () => {
  logOut();
});

function logOut() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      // Sign-out successful.
      window.location.href = "./login.html";
    })
    .catch((error) => {
      // An error happened.
      console.error(error);
    });
}

//-----------------export--------------------------

export function sumAmount(clientsList = clients) {
  const total = clientsList.reduce((amount, client) => {
    return amount + removeCurrencyFromAmount(client.amount);
  }, 0);
  document.querySelectorAll(".totalAmountContainer").forEach((element) => {
    element.innerHTML = total.toFixed(2);
  });
}

export function fillClientForm(id) {
  const currentClient = clients.find((client) => client.clientId == id);
  if (editClientForm) {
    editClientForm.firstName.value = currentClient.firstName;
    editClientForm.lastName.value = currentClient.lastName;
    editClientForm.email.value = currentClient.email;
    editClientForm.gender.value = currentClient.gender;
    editClientForm.amount.value = currentClient.amount;
    editClientForm.date.value = currentClient.date;
    editClientForm.clientID.value = id;
    // editClientForm.photo.value = clients[id].avatar;
    // "https://robohash.org/omnisveniamqui.jpg?size=50x50&set=set1";
  }
}

export function deleteClient(id) {
  // console.log("delete id -", id);
  const currentClient = clients.find((client) => client.clientId == id);
  console.log(
    "Delete -" + currentClient.firstName + " " + currentClient.lastName
  );

  const captionClientNameDelete = document.querySelector(
    "#captionClientNameDelete"
  );
  captionClientNameDelete.innerHTML =
    currentClient.firstName + " " + currentClient.lastName;

  $("#questDeleteClientModal").modal("show");
  document
    .querySelector("#questDeleteClientBtn")
    .addEventListener("click", () => {
      const clientRef = firebase.database().ref(`clients/${id}`);
      clientRef.remove();
      hideModel("#questDeleteClientModal");
    });
}
