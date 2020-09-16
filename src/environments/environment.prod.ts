// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  simulationServer: 'http://localhost:1513/api/v1', //LOCAL SERVER
  socketIoUrl: 'http://35.232.177.229:1513/api/v1',
  //simulationServer: 'http://35.184.252.50:1513/api/v1',
  cesiumToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0ZTY0MjIxMS0yYjlkLTQxZTctODliOS1hNDc5NDI1YWY5MmYiLCJpZCI6MTQ' +
    '3NjIsInNjb3BlcyI6WyJhc2wiLCJhc3IiLCJnYyJdLCJpYXQiOjE1NjYzMDU4MTF9.dgf3OBJhsAzFi1u_wzHaBIIY2q3gCWjf9p1xJ0BbPJ0',
  bingMapsGeocoderServiceKey: 'AgICfsOntlHhIIBu8hQY1cWTEwaOnBUxxF4XF-zoE0WrlRyLVHBAYsl5l-5iN3D0',
  firebase: {
    apiKey: "AIzaSyAvPJ_9IzRFvJAOjnI97dD_x2AMhkC8pSw",
    authDomain: "simnet-10043.firebaseapp.com",
    databaseURL: "https://simnet-10043.firebaseio.com",
    projectId: "simnet-10043",
    storageBucket: "simnet-10043.appspot.com",
    messagingSenderId: "919001772722",
    appId: "1:919001772722:web:8d628eebb8088c0e14cfab",
    measurementId: "G-0BG2YYEK0B"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
