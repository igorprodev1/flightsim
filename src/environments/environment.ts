// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  //socketIoUrl: 'http://localhost:1513/',
  //simulationServer: 'http://localhost:1513/api/v1',
  socketIoUrl: 'http://35.232.177.229:1513/',
  simulationServer: 'http://35.232.177.229:1513/api/v1',
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
