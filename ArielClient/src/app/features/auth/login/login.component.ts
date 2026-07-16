import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { AuthState } from '../../../state/auth.state';
import { Router } from '@angular/router';
import { endpoints, Routes } from '../../../core/constants/endpoints';
import { LoaderService } from '../../../core/services/loader.service';
import { E2eKeyService } from '../../../core/services/E2eKey.service';


@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],

  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})

export class LoginComponent {

  private authState = inject(AuthState);
  private router = inject(Router);
  private loader = inject(LoaderService);
  private cdr = inject(ChangeDetectorRef);
  private e2eKeyService = inject(E2eKeyService);
  private http = inject(HttpClient);

  step: 1 | 2 = 1;

  email = '';
  password = '';
  captchaInput = '';
  showPassword = false;
  errorMsg = '';
  isLoading = false;

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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email || !emailRegex.test(this.email)) {
      this.errorMsg = 'Please enter a valid email address.';
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
    this.isLoading = true;
    this.loader.show?.();

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: async (user: any) => {
        try {
          await this.setupOrUnlockEncryptionKey(user);
        } catch (e) {
          console.error('E2E key setup/unlock failed:', e);
          this.errorMsg = 'Login succeeded, but secure messaging could not be unlocked.';
        }

        this.authState.setUser(user);
        this.isLoading = false;
        this.loader.hide();
        this.router.navigate([Routes.dashboard]);
      },
      error: (err: any) => {
        this.errorMsg =
          err?.error?.message ||
          err?.error?.error ||
          err?.message ||
          'Login failed. Please try again.';
        this.generateCaptcha();
        this.isLoading = false;
        this.loader.hide();
        this.cdr.detectChanges();
      }
    });
  }

  private async setupOrUnlockEncryptionKey(user: any): Promise<void> {
    if (!user?.encryptionKey) {
      const keyMaterial = await this.e2eKeyService.generateAndEncryptKeyPair(this.password, user.id);

      await this.http.post(endpoints.saveEncryptionKey, {
        publicKey: keyMaterial.publicKeyBase64,
        encryptedPrivateKey: keyMaterial.encryptedPrivateKeyBase64,
        salt: keyMaterial.saltBase64,
      }, { withCredentials: true }).toPromise();
    } else {
      await this.e2eKeyService.decryptPrivateKey(
        this.password,
        user.encryptionKey.encryptedPrivateKey,
        user.encryptionKey.salt,
        user.id
      );
    }
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
    alert(`This login method is not available !`);
  }
}