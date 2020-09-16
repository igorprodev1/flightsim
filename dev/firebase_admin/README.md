# Simnet Firebase Admin

## Development Environment Setup: Admin
* Follow steps to set up env: https://firebase.google.com/docs/admin/setup
* Save the admin sdk private key as firebase_admin/keys/simnet_admin_PRIVATEKEY.json
* On every session, set the credentials environment variable:
  * export GOOGLE_APPLICATION_CREDENTIALS="/media/veracrypt1/development/simnet/dev/firebase_admin/keys/simnet_admin_PRIVATEKEY.json"

## Development Environment Setup: Firebase Functions
### Setup Firebase CLI
* Reference: https://firebase.google.com/docs/functions/get-started
* Install NVM (Node Version Manager)
  * Reference: https://github.com/nvm-sh/nvm/blob/master/README.md
  * curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.0/install.sh | bash
  * Open an new terminal and test the installation (output should be 'nvm')
    * command -v nvm  
* Install a Firebase-compatible version of NodeJS
  * nvm install 8
* Install npm
* Install firebase CLI
  * npm install -g firebase-tools
* Install firestore emulator
  * firebase setup:emulators:firestore

### Debugging Functions
* Reference: https://firebase.google.com/docs/functions/local-emulator
* Reference: https://firebase.google.com/docs/functions/unit-testing
* Switch to nodejs 8 using NVM
  * nvm use node 8
* Start firebase emulators
  * sudo firebase emulators:start

### Debugging Security Rules
* Reference: https://firebase.google.com/docs/rules/unit-tests


## Compilation and Deployment
### Compiling/Deploying Functions
* Login (only once per session)
  * firebase login
* sudo firebase deploy

### Deploying Security Rules