const firebase = require("firebase/app");
require("firebase/database");
import { displayData } from "./dom";

let clients = [];

export function getData() {
  console.log("getData");
  const db = firebase.database();
  const clientsRef = db.ref("clients");
  clientsRef.on("value", (snapshot) => {
    // console.log(snapshot.val());
    // clients = Array.from(Object.values(snapshot.val()));
    console.log("Display data will be called");
    clients = convertObjToArray(snapshot.val());
    // console.log(Object.keys(clients));
    // console.log(Object.values(clients));

    displayData(clients);
  });
}

function convertObjToArray(object) {
  return Object.keys(object).map((key) => {
    return {
      clientId: key,
      ...object[key],
    };
  });

  // clients = Object.entries(clients).map(client => {
  //   return {
  //     clientId: `${client[0]}`,
  //     firstName: `${client[1].firstName}`,
  //     lastName: `${client[1].lastName}`,
  //     email: `${client[1].email}`,
  //     gender: `${client[1].gender}`,
  //     amount: `${client[1].amount}`,
  //     date: `${client[1].date}`,
  //     avatar: `${client[1].avatar}`
  //   };
  // });
}

export { clients };
