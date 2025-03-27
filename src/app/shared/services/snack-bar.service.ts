import { Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { SnackBarComponent } from '../components/snack-bar/snack-bar.component';

@Injectable({
  providedIn: 'root',
})
export class SnackBarService {
  constructor(private snackBar: MatSnackBar) {}

  openSnackBar(
    message: string,
    type: 'error' | 'success' | 'warning' | 'info' = 'error',
    horizontalPosition: MatSnackBarHorizontalPosition = 'center',
    verticalPosition: MatSnackBarVerticalPosition = window.innerWidth >= 600 ? 'top' : 'bottom',
    durationInSeconds: number = 3,
  ): void {
    this.snackBar.openFromComponent(SnackBarComponent, {
      data: { message, type },
      horizontalPosition,
      verticalPosition,
      duration: durationInSeconds * 1000,
      panelClass: ['mat-snack-bar-panel-custom', `mat-snack-bar-custom-alert-${type}`],
    });
  }
}
