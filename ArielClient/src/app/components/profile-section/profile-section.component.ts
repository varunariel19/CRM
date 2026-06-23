import { Component, EventEmitter, Output, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthState } from '../../state/auth.state';
import { getAvatarColor } from '../../utils';
import { GlobalState } from '../../state/global.state';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';
@Component({
    selector: 'app-profile-section',
    imports: [CommonModule, FormsModule],
    templateUrl: './profile-section.component.html',
    styleUrl: './profile-section.component.css',
})
export class ProfileSectionComponent {
    @Output() close = new EventEmitter<void>();

    private userService = inject(UserService);
    private toast = inject(ToastService);
    private selectedFile = signal<File | null>(null);


    authState = inject(AuthState);
    globalState = inject(GlobalState);
    activeTab = signal<'profile' | 'password'>('profile');



    // Profile
    editName = signal('');
    selectedImage = signal<string | null>(null);
    displayImage = computed(() => this.selectedImage() || this.authState.user()?.profileImage || null);
    isSavingProfile = signal(false);
    isRemovingProfileImage = signal(false);
    profileError = signal('');

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
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        input.value = '';
        if (!file) return;

        this.profileError.set('');

        if (!file.type.startsWith('image/')) {
            this.profileError.set('Only image files are allowed.');
            this.toast.error('Only image files are allowed.');
            return;
        }

        this.selectedFile.set(file);
        const reader = new FileReader();
        reader.onload = () => this.selectedImage.set(reader.result as string);
        reader.readAsDataURL(file);
    }

    clearSelectedImage(): void {
        this.selectedFile.set(null);
        this.selectedImage.set(null);
        this.profileError.set('');
    }

    removeProfileImage(): void {
        if (this.selectedFile() || this.selectedImage()) {
            this.clearSelectedImage();
            return;
        }

        if (!this.authState.user()?.profileImage || this.isRemovingProfileImage()) return;

        this.isRemovingProfileImage.set(true);
        this.profileError.set('');

        this.userService.removeProfileImage().subscribe({
            next: (res) => {
                const user = this.authState.user();
                if (user) this.authState.setUser({ ...user, profileImage: res.profileImage ?? undefined });
                this.isRemovingProfileImage.set(false);
                this.toast.success(res.message || 'Profile image removed successfully.');
            },
            error: (err) => {
                const message = err?.error?.message || 'Failed to remove profile image.';
                this.profileError.set(message);
                this.isRemovingProfileImage.set(false);
                this.toast.error(message);
            }
        });
    }

    saveProfile(): void {
        const name = this.editName().trim();
        if (!name) return;
        this.isSavingProfile.set(true);
        this.profileError.set('');

        this.userService.updateProfile(name, this.selectedFile() ?? undefined).subscribe({
            next: (res) => {
                const user = this.authState.user();
                if (user) {
                    this.authState.setUser({
                        ...user,
                        name: res.name || name,
                        profileImage: res.profileImage ?? undefined,
                    });
                }
                this.clearSelectedImage();
                this.isSavingProfile.set(false);
                this.toast.success(res.message || 'Profile updated successfully.');
            },
            error: (err) => {
                const message = err?.error?.message || 'Failed to update profile.';
                this.profileError.set(message);
                this.isSavingProfile.set(false);
                this.toast.error(message);
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





