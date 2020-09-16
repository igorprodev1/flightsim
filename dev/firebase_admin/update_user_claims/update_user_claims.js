//Script used to update Firebase user claims, which control user 
//access to private content within SimNet
//To run, first set the GOOGLE_APPLICATION_CREDENTIALS environment
//variable to the path of the Firebase service account key
//(Reference: https://firebase.google.com/docs/admin/setup).
//Then run the script (node update_user_claims.js) to update
//the Firebase claims based on the user_claims.json

var admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://simnet-10043.firebaseio.com"
});

const fs = require('fs');
let rawdata = fs.readFileSync('user_claims.json');
let user_claims = JSON.parse(rawdata);
let n_users = Object.keys(user_claims).length;

console.log('=====SETTING USER CLAIMS=====')
Object.keys(user_claims).forEach(user_email => {
  claim = user_claims[user_email];

  admin.auth().getUserByEmail(user_email).then((user) => {
    admin.auth().setCustomUserClaims(user.uid, claim).then(() => {
      track_progress(user_email);
    });
  }).catch((error) => {
    track_progress(user_email, error);
    });
});

let failed_cases = [];
function track_progress (user_email, error=null) {
  n_users = n_users - 1;
  console.log('REMAINING: ' + n_users);

  if (error) {
    failed_cases.push(user_email + ": " + error);
  }

  if (n_users == 0) {
    console.log('');
    console.log('=====FINALIZED=====');
    let n_fail = Object.keys(failed_cases).length;
    if (n_fail == 0 ) {
      console.log("No failed cases");
    }
    else {
      console.log("Failed Cases: " + n_fail);
      console.log(failed_cases);
    }
  }
}