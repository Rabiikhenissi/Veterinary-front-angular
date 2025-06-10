import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ActivatedRoute } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { LoadingService } from 'app/shared/services/loading.service';
import { PrescriptionService } from 'app/shared/services/prescription.service';
import { finalize, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-details',
  imports: [DatePipe,CommonModule,FormsModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnInit {
  _fuseConfirmationService = inject(FuseConfirmationService);
  _route = inject(ActivatedRoute);
  _appointmentService = inject(AppointmentService);
  _snackbar = inject(MatSnackBar);
  _prescriptionService = inject(PrescriptionService); // Inject PrescriptionService
  appointment: any;
  _loadingService = inject(LoadingService); 
  invoice: any | null = null;  // Variable to store invoiceId
  invoices: any = null; 
selectedInvoiceType: 'invoice' | 'invoiceNoMeds' = 'invoice';
   confirmedInvoiceType: string = ''; 
   isConfirmingInvoice = false;



  ngOnInit(): void {
  const id = this._route.snapshot.paramMap.get('id');
  this._loadingService.show();
  if (id) {
    this._appointmentService.getAppointment(id).pipe(
      switchMap((data) => {
        this.appointment = data;
        if (this.appointment.prescriptionId) {
          return this._prescriptionService.getPrescription(this.appointment.prescriptionId);
        } else {
          return of(null);
        }
      }),
      finalize(() => this._loadingService.hide())
    ).subscribe({
      next: (prescriptionData) => {
        if (prescriptionData) {
          this.invoices = prescriptionData;
          // Auto-confirm if only one invoice type exists
          const hasPremium = !!prescriptionData.invoice;
          const hasStandard = !!prescriptionData.invoiceNoMeds;
          if (hasPremium && !hasStandard) {
            this.confirmedInvoiceType = 'invoice';
          } else if (!hasPremium && hasStandard) {
            this.confirmedInvoiceType = 'invoiceNoMeds';
          }
        }
      },
      error: (err) => {
        console.error('Error loading appointment or prescription:', err);
      }
    });
  } else {
    this._loadingService.hide();
  }
}

  // Function to fetch the prescription and get its invoiceId
  getPrescriptionInvoiceId(prescriptionId: string): void {
    this._loadingService.show();
  this._prescriptionService.getPrescription(prescriptionId).subscribe({
    next: (prescriptionData) => {
      this.invoices = prescriptionData;
      console.log('prescriptionData:', prescriptionData);

      // Auto-confirm if only one invoice type exists
      const hasPremium = !!prescriptionData.invoice;
      const hasStandard = !!prescriptionData.invoiceNoMeds;

      if (hasPremium && !hasStandard) {
        this.confirmedInvoiceType = 'invoice';
      } else if (!hasPremium && hasStandard) {
        this.confirmedInvoiceType = 'invoiceNoMeds';
      }
      this._loadingService.hide();
    },
    error: (err) => {
      console.error('Error fetching prescription data:', err);
      this._loadingService.hide();
    }
  });
}

  // Open the prescription PDF
  viewPrescriptionPDF(prescriptionId: string): void {
    this._snackbar.open('Opening your prescription PDF, please wait...', '', { duration: 2000, verticalPosition: 'top' });
    this._appointmentService.getPrescriptionPdf(prescriptionId).subscribe(
      (blob) => {
        this._snackbar.dismiss(); // Dismiss the snackbar
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      (error) => {
        this._snackbar.open('Error fetching prescription PDF', 'Close', { duration: 3000, verticalPosition: 'top' });
        console.error('Error fetching prescription PDF', error);
      }
    );
  }

  // Open the invoice PDF using the invoiceId
  openInvoicePDF(invoiceType: string): void {
    if (this.invoices) {
      const invoiceBuffer = this.invoices[invoiceType]; // Get either invoice or invoiceNoMeds
  
      if (invoiceBuffer) {
        // Convert the buffer into a Blob
        const blob = new Blob([new Uint8Array(invoiceBuffer.data)], { type: 'application/pdf' });
  
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      } else {
        console.error(`${invoiceType} not found`);
      }
    } else {
      console.error('No invoices found');
    }
  }
selectInvoice(type: 'invoice' | 'invoiceNoMeds'): void {
  this.selectedInvoiceType = type;
}

confirmInvoice(): void {
  if (!this.selectedInvoiceType) return; 

  const prescriptionId = this.appointment?.prescriptionId;
  if (!prescriptionId) {
    console.error('No prescription ID available');
    return;
  }
const confirmation = this._fuseConfirmationService.open({
    title: 'Invoice Selection',
    message: 'Would you like to confirm this invoice?',
    actions: {
    confirm: {
      label: 'yes',
    },
    cancel: {
      label: 'no',
    },
    },
  });

  confirmation.afterClosed().subscribe((result) => {
    if (result === 'confirmed') {
    this._prescriptionService.confirmInvoice(prescriptionId, this.selectedInvoiceType)
    .subscribe({
      next: (response) => {
        // Confirmation succeeded, update the UI
        this.confirmedInvoiceType = this.selectedInvoiceType;
        console.log(response.message);
      },
      error: (error) => {
        console.error('Error confirming invoice:', error);
      }
    });
    }
  });

  
}
}
