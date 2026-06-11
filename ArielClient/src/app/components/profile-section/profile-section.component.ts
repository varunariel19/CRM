import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthState } from '../../state/auth.state';
import { getAvatarColor } from '../../utils';
import { GlobalState } from '../../state/global.state';
import { UserService } from '../../core/services/user.service';
@Component({
    selector: 'app-profile-section',
    imports: [CommonModule, FormsModule],
    templateUrl: './profile-section.component.html',
    styleUrl: './profile-section.component.css',
})
export class ProfileSectionComponent {
    @Output() close = new EventEmitter<void>();

    private userService = inject(UserService);
    private selectedFile = signal<File | null>(null);


    authState = inject(AuthState);
    globalState = inject(GlobalState);
    activeTab = signal<'profile' | 'password'>('profile');



    // Profile
    editName = signal('');
    selectedImage = signal<string | null>(null);
    isSavingProfile = signal(false);

    // Password
    currentPassword = signal('');
    newPassword = signal('');
    confirmPassword = signal('');
    showCurrent = signal(false);
    showNew = signal(false);
    showConfirm = signal(false);
    isSavingPassword = signal(false);
    passwordError = signal('');
    passwordSuccess = signal('');

    constructor() {
        this.editName.set(this.authState.fullName());
    }

    onOverlayClick(event: MouseEvent): void {
        if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
            this.close.emit();
        }
    }

    onImageSelect(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;
        this.selectedFile.set(file);
        const reader = new FileReader();
        reader.onload = () => this.selectedImage.set(reader.result as string);
        reader.readAsDataURL(file);
    }

    saveProfile(): void {
        const name = this.editName().trim();
        if (!name) return;
        this.isSavingProfile.set(true);

        this.userService.updateProfile(name, this.selectedFile() ?? undefined).subscribe({
            next: (res) => {
                this.authState.setUser({ ...this.authState.user()!, name });
                this.isSavingProfile.set(false);
            },
            error: (err) => {
                this.isSavingProfile.set(false);
            }
        });
    }

    savePassword(): void {
        this.passwordError.set('');
        this.passwordSuccess.set('');

        if (!this.currentPassword() || !this.newPassword() || !this.confirmPassword()) {
            this.passwordError.set('All fields are required.');
            return;
        }
        if (this.newPassword().length < 8) {
            this.passwordError.set('New password must be at least 8 characters.');
            return;
        }
        if (this.newPassword() !== this.confirmPassword()) {
            this.passwordError.set('Passwords do not match.');
            return;
        }

        this.isSavingPassword.set(true);

        this.userService.changePassword(this.currentPassword(), this.newPassword(), this.confirmPassword()).subscribe({
            next: (res) => {
                this.passwordSuccess.set(res.message);
                this.currentPassword.set('');
                this.newPassword.set('');
                this.confirmPassword.set('');
                this.isSavingPassword.set(false);
            },
            error: (err) => {
                this.passwordError.set(err?.error?.message || 'Failed to change password.');
                this.isSavingPassword.set(false);
            }
        });
    }

    getInitials(): string {
        return this.authState.fullName()
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    getProfileColor(name: string) {
        return getAvatarColor(name);
    }
}





