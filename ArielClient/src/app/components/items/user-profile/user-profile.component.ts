import { Component, Input, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getAvatarColor } from '../../../utils';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnChanges {
  @Input() name?: string | null;
  @Input() profileImage?: string | null;

  @Input() size: AvatarSize | number = 'md';
  @Input() square = false;
  @Input() showBorder = false;

  private imgFailed = signal(false);

  private sizeMap: Record<AvatarSize, number> = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['profileImage']) {
      this.imgFailed.set(false); // new image source -> give it a fresh chance to load
    }
  }

  get resolvedName(): string | null {
    return this.name?.trim() || null;
  }

  get resolvedSizePx(): number {
    return typeof this.size === 'number' ? this.size : this.sizeMap[this.size];
  }

  get fontSizePx(): number {
    return Math.round(this.resolvedSizePx * 0.42);
  }

  get initial(): string {
    return this.resolvedName ? this.resolvedName.charAt(0).toUpperCase() : 'U';
  }

  get showImage(): boolean {
    return !!this.profileImage && !this.imgFailed();
  }

  onImgError(): void {
    this.imgFailed.set(true);
  }

  get avatarColor(): string {
    return this.resolvedName ? getAvatarColor(this.resolvedName) : '#9ca3af';
  }
}