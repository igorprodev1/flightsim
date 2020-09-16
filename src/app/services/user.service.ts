import { Injectable } from '@angular/core';
import { User } from './../models/user';
import { FirebaseAircraft } from './../models/aircraft';
import { Environment } from './../models/environment';
import { Controller } from './../models/controller';
import { BehaviorSubject } from 'rxjs';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  userSubj: BehaviorSubject<User>;
  public defaultAircraftSubj: BehaviorSubject<FirebaseAircraft>;
  public defaultEnvironmentSubj: BehaviorSubject<Environment>;
  public defaultControllerSubj: BehaviorSubject<Controller>;
  defaultContentSubj: {};
  private userDocRef: AngularFirestoreDocument;
  private notificationsList = [];

  constructor(
    private db: AngularFirestore,
    private afAuth: AngularFireAuth,
    private snackBar: MatSnackBar,
  ) {
    if (!this.afAuth.auth.currentUser) {
      return;
    }
    this.createUserProfile();
    this.userSubj = new BehaviorSubject(null);
    const uid = this.afAuth.auth.currentUser.uid;
    this.userDocRef = this.db.collection('users').doc<User>(uid);
    this.userDocRef.valueChanges().subscribe((user: User) => {
      this.userSubj.next(user);
    });
    this.defaultAircraftSubj = new BehaviorSubject(null);
    this.defaultEnvironmentSubj = new BehaviorSubject(null);
    this.defaultControllerSubj = new BehaviorSubject(null);
    this.refreshDefaultSubjects('*all*');
  }

  private refreshDefaultSubjects(contentType: 'aircraft' | 'environment' | 'controller' | '*all*') {
    if (contentType == 'aircraft' || contentType == '*all*') {
      this.getUserContent('aircraft', '*default*').then( (ac: FirebaseAircraft) => {
        if (ac) {
          this.defaultAircraftSubj.next(ac);
        }
      });
    }
    if (contentType == 'environment' || contentType == '*all*') {
      this.getUserContent('environment', '*default*').then( (env: Environment) => {
        if (env) {
          this.defaultEnvironmentSubj.next(env);
        }
      });
    }
    if (contentType == 'controller' || contentType == '*all*') {
      this.getUserContent('controller', '*default*').then( (cont: Controller) => {
        if (cont) {
          this.defaultControllerSubj.next(cont);
        }
      });
    }
  }

  async setDefaultSetting(contentType: 'aircraft' | 'environment' | 'controller', value: string) {
    localStorage.setItem(contentType, value);
    this.refreshDefaultSubjects(contentType);
  }

  async createUserProfile() {
    if (!this.afAuth.auth.currentUser) {
      return;
    }
    const uid1 = this.afAuth.auth.currentUser.uid;
    const user = await this.db.collection('users').doc<User>(uid1).get().toPromise();
    if (user.exists) {
      return;
    }
    this.db.collection('users').doc(uid1).set({uid: uid1});
  }

  async getUserContent(contentType: 'aircraft' | 'environment' | 'controller' | 'tiles', contentName = '*all*', sources = ['*all*']) {
    const uid = this.afAuth.auth.currentUser.uid;
    if (uid == null) {
      return [];
    }
    const contentList = [];
    let path;
    if (sources.includes('*all*') || sources.includes('public')) {
      path = 'content/public/' + contentType + '/';
      const publicDocumentsSnapshot = await this.db.collection(path).get().toPromise();
      publicDocumentsSnapshot.docs.forEach(doc => {
        contentList.push(doc.data());
      });
    }
    if (sources.includes('*all*') || sources.includes('private')) {
      path = 'content/private/' + contentType + '/users/' + uid + '/';
      const privateDocumentSnapshot = await this.db.collection(path).get().toPromise();
      privateDocumentSnapshot.docs.forEach(doc => {
        contentList.push(doc.data());
      });
    }
    if (sources.includes('*all*') || sources.includes('protected')) {
      let idToken = await this.afAuth.auth.currentUser.getIdTokenResult();
      if (contentType in idToken.claims) {
        let i = 0;
        for (i = 0; i <idToken.claims[contentType].length; i++) {
          path = 'content/protected/' + contentType + '/' + idToken.claims[contentType][i];
          let doc = await this.db.doc(path).get().toPromise();
          contentList.push(doc.data());
        }
      }
    }
    if (contentName === '*all*') { // Use '*all*' for list of all user content
      return contentList;
    } else if (contentList.length === 0) {
      return null;
    } else if (contentName === '*default*') { // Use '*default*' to get default content
      let contentName = localStorage.getItem(contentType);
      if (contentName === null || contentList.filter( content => content.name === contentName).length == 0) {
        localStorage.setItem(contentType, contentList[0].name);
        return contentList[0];
      } else {
        return contentList.filter( content => content.name === contentName)[0];
      }
    } else { // Use specific uid to get that item
      return contentList.filter( content => content.name === contentName)[0];
    }
  }

  async contentIsReadOnly(contentType: 'aircraft' | 'environment' | 'controller' | 'tiles', contentName: string): Promise<boolean> {
    return this.getUserContent(contentType, contentName, ['public', 'protected']).then( content => {
      return content != null;
    });
  }

  async saveUserContent(contentType: 'aircraft' | 'environment' | 'controller' | 'tiles', content: {}, setDefault = false) {
    const uid = this.afAuth.auth.currentUser.uid;
    let path = 'content/private/' + contentType + '/users/' + uid + '/';
    //let path = 'content/public/' + contentType + '/'; //TEST
    this.db.collection(path).doc(content["name"]).set(content)
    .then(function() {
      if (setDefault) {
        this.setDefaultSetting(contentType, content['name']);
      }
      return true;
    })
    .catch(function(error) {
        return false;
    });
  }

  async deleteUserContent(contentType: 'aircraft' | 'environment' | 'controller', contentName: String) {
    const uid = this.afAuth.auth.currentUser.uid;
    if (uid == null) {
      return [];
    }
    if (await this.contentIsReadOnly(contentType, uid)) {
      return false;
    }
    let path = 'content/private/' + contentType + '/users/' + uid + '/' + contentName;
    this.db.doc(path).delete().then(function() {
      return true;
    }).catch(function(error) {
      return false;
    });
  }

  public notifyUser(msg) {
    if (this.notificationsList.length > 0 && this.notificationsList[0] === msg) {
      return;
    }
    this.notificationsList.push(msg);
    if (this.notificationsList.length === 1) {
      this.snackBarMsgLoop();
    }
  }

  private snackBarMsgLoop() {
    if (this.notificationsList.length > 0) {
      const ref = this.snackBar.open(this.notificationsList[0], 'Ok', {
        duration: 5000
      });
      ref.afterDismissed().subscribe(() => {
        this.notificationsList.shift();
        this.snackBarMsgLoop();
      });
    }
  }

  currentUserObservable() {
    return this.userSubj.asObservable()
  }

  currentUser() {
    return this.userSubj.value;
  }
}
