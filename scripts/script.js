//Observe changes
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in.
    // let displayName = user.displayName;
    let email = user.email;
    // alert("Hello " + email);
    // let emailVerified = user.emailVerified;
    // let photoURL = user.photoURL;
    // let isAnonymous = user.isAnonymous;
    // let uid = user.uid;
    // let providerData = user.providerData;
    // ...
  } else {
    // User is signed out.
    window.location.href = "http://127.0.0.1:5500/login.html";
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
  editClient(event.target); //TODO: add Edit client form
  hideModel("#editClientForm");
});

function displayData(clientsList = clients) {
  clearList();
  const ul = document.querySelector("#clientsData");

  clientsList.forEach((client) => {
    ul.appendChild(getLiElement(client));
  });
  // for (const property in clientsList) {
  //   // console.log(`${property}: ${clientsList[property]}`);
  //   ul.appendChild(getLiElement(clientsList[property], property));
  // }

  // sumAmount(Array.from(Object.values(clientsList)));
  sumAmount(clientsList);
}

function getLiElement(client) {
  const { avatar, clientId } = client;
  const newLi = document.createElement("li");
  const image = document.createElement("img");
  newLi.className = "media";
  newLi.id = clientId;
  image.className = "mr-3 align-self-center";
  image.setAttribute("src", avatar);

  newLi.appendChild(image);
  newLi.appendChild(createClientDescription(client, clientId));
  return newLi;
}

function createClientDescription(client, id) {
  const div = document.createElement("div");
  div.className = "media-body";

  const mailLink = document.createElement("a");
  mailLink.setAttribute("href", `mailto:${client.email}`);
  mailLink.innerHTML = client.email;

  const textPart1 = document.createTextNode(
    `${client.lastName} ${client.firstName} - `
  );

  const textPart2 = document.createTextNode(
    ` ${client.gender} (${client.date} - ${client.amount})`
  );

  const deleteLink = document.createElement("a");
  deleteLink.innerHTML = "Delete";
  deleteLink.setAttribute("href", "#");
  deleteLink.classList.add("mx-1");
  deleteLink.addEventListener("click", (event) => {
    event.preventDefault();
    deleteClient(id);
  });
  const editLink = createEditLink(id);
  div.appendChild(textPart1);
  div.appendChild(mailLink);
  div.appendChild(textPart2);
  div.appendChild(editLink);
  div.appendChild(deleteLink);

  return div;
}

// <!-- trigger modal -->
// <a href="" data-toggle="modal" data-target="#editClientModal"
// 	>Edit client</a
// >
function createEditLink(id) {
  const editLink = document.createElement("a");
  editLink.innerHTML = "Edit";
  editLink.setAttribute("href", "#");
  editLink.setAttribute("data-toggle", "modal");
  editLink.setAttribute("data-target", "#editClientModal");
  editLink.setAttribute("data-client-id", id);
  editLink.classList.add("mx-1");
  editLink.classList.add("edit-client-link");
  editLink.addEventListener("click", () => {
    fillClientForm(id);
  });

  return editLink;
}

function fillClientForm(id) {
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

function deleteClient(id) {
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
      const clientRef = db.ref(`clients/${id}`);
      clientRef.remove();
      hideModel("#questDeleteClientModal");
    });
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

function refreshData(updatedClients) {
  clearList();
  displayData(updatedClients);
}

function clearList() {
  const ul = document.querySelector("#clientsData");
  while (ul.firstChild) {
    ul.removeChild(ul.firstChild);
  }
}

function filterList() {
  const filterString = document
    .querySelector("#filterInput")
    .value.toLowerCase()
    .trim();
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
    //   showNotFoundSection()
    //   : showResultListSection();
  } else {
    refreshData(clients);
    // showResultListSection();
    showResultListOrNotFound();
  }
}
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
  // const genderList = clients.filter(client => {
  //   return client.gender.toLowerCase() == defaultGender.toLowerCase();
  // });
  const genderList = clients.filter((client) => {
    return client.gender.toLowerCase() == defaultGender.toLowerCase();
  });
  refreshData(genderList);
}

function sumAmount(clientsList = clients) {
  const total = clientsList.reduce((amount, client) => {
    return amount + removeCurrencyFromAmount(client.amount);
  }, 0);
  document.querySelectorAll(".totalAmountContainer").forEach((element) => {
    element.innerHTML = total.toFixed(2);
  });
}

function removeCurrencyFromAmount(amount) {
  return amount ? Number(amount.slice(1)) : 0;
}

// function showNotFoundSection() {
//   document.querySelector(".resultList").style.display = "none";
//   document.querySelector(".notFound").style.display = "block";
// }

// function showResultListSection() {
//   document.querySelector(".resultList").style.display = "block";
//   document.querySelector(".notFound").style.display = "none";
// }

function showResultListOrNotFound(param = "showResultList") {
  if (param == "showResultList") {
    document.querySelector(".resultList").style.display = "block";
    document.querySelector(".notFound").style.display = "none";
  } else {
    document.querySelector(".resultList").style.display = "none";
    document.querySelector(".notFound").style.display = "block";
  }
}

function addClient(form) {
  // const data = {
  //   firstName: "Demetris",
  //   lastName: "Nerheny",
  //   email: "dnerheny0@timesonline.co.uk",
  //   gender: "Male",
  //   amount: "$2.08",
  //   date: "7/28/2019",
  //   avatar: "https://robohash.org/omnisveniamqui.jpg?size=50x50&set=set1"
  // };

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

  // console.log(data);

  const newId = db.ref().child("clients").push().key;
  // console.log(newId);

  let updates = {};
  updates[`clients/${newId}`] = data;

  updateDB(updates);

  clearFieldsForm(form);
}

function updateDB(updates) {
  db.ref().update(updates, function (error) {
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

function logOut() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      // Sign-out successful.
      window.location.href = "http://127.0.0.1:5500/login.html";
    })
    .catch((error) => {
      // An error happened.
      console.error(error);
    });
}
