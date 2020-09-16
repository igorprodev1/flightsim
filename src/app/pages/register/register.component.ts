import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  showSpinner = false;
  email;
  password;
  confPassword;
  constructor(
    public afAuth: AngularFireAuth,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit() {
  }

  alert(message) {
    this.snackBar.open(message, 'close', {
      duration: 10000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  register() {
    this.showSpinner = true;
    if (this.password !== this.confPassword) {
      this.alert('password confirmation does not equal to the password');
    }
    this.afAuth.auth.createUserWithEmailAndPassword(this.email, this.password)
      .then(res => this.router.navigateByUrl('/'))
      .catch(err => this.alert(err.message))
      .finally(() => this.showSpinner = false);
  }
}
