import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';


@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],

  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})


export class LoginComponent {

  step: 1 | 2 = 1;

  email = '';
  password = '';
  captchaInput = '';
  showPassword = false;
  errorMsg = '';

  captchaCode = '';
  private captchaChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.generateCaptcha();
  }

  generateCaptcha(): void {
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += this.captchaChars[Math.floor(Math.random() * this.captchaChars.length)];
    }
    this.captchaCode = result;
    this.captchaInput = '';
  }

  continue(): void {
    if (!this.email || !this.email.includes('@')) {
      this.errorMsg = 'Please enter a valid email or username.';
      return;
    }
    this.errorMsg = '';
    this.step = 2;
  }

  login(): void {
    if (!this.password) {
      this.errorMsg = 'Password is required.';
      return;
    }
    if (this.captchaInput.toUpperCase() !== this.captchaCode) {
      this.errorMsg = 'Captcha does not match. Please try again.';
      this.generateCaptcha();
      return;
    }
    this.errorMsg = '';
    this.authService.login({ email: this.email, password: this.password });
  }

  goBack(): void {
    this.step = 1;
    this.password = '';
    this.captchaInput = '';
    this.errorMsg = '';
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  socialLogin(provider: string): void {
    alert(`Redirecting to ${provider} login...`);
  }
}