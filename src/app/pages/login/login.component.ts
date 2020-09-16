import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email;
  password;

  showSpinner;
  constructor(
    private afAuth: AngularFireAuth,
    private snackBar: MatSnackBar,
    private router: Router
    ) { }

  ngOnInit() {
  }

  login() {
    this.showSpinner = true;
    this.afAuth.auth.signInWithEmailAndPassword(this.email, this.password).then(
      res => {
        this.showSpinner = false;
        this.router.navigateByUrl('');
      }
    ).catch(err => {
      this.showSpinner = false;
      this.snackBar.open(err.message, 'close', {
        duration: 10000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    });
  }
}
