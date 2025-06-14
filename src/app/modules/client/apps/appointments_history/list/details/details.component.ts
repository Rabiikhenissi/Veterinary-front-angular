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
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { Browser } from '@capacitor/browser'; // For web fallback
@Component({
  selector: 'app-details',
  imports: [DatePipe,CommonModule,FormsModule],
  providers: [FileOpener],
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
constructor(private fileOpener: FileOpener) {}


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
    this._appointmentService.getPrescriptionPdf(prescriptionId).subscribe({
      next: async (blob) => {
        this._snackbar.dismiss();
        const isMobile = Capacitor.isNativePlatform();

        if (isMobile) {
          try {
            const base64 = await this.blobToBase64(blob);
            const fileName = `prescription_${new Date().getTime()}.pdf`;

            const result = await Filesystem.writeFile({
              path: fileName,
              data: base64,
              directory: Directory.Documents,
            });

            await this.fileOpener.open(result.uri, 'application/pdf');
            console.log('Prescription PDF opened on device');
          } catch (err) {
            console.error('Failed to open prescription PDF on device:', err);
            this._snackbar.open('Failed to open prescription.', 'Close', {
              duration: 3000,
              verticalPosition: 'top',
            });
          }
        } else {
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
        }
      },
      error: (err) => {
        this._snackbar.dismiss();
        console.error('Failed to fetch prescription PDF:', err);
        this._snackbar.open('Failed to open prescription.', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
        });
      }
    });
  }

  // Open the invoice PDF using the invoiceId
  async openInvoicePDF(invoiceType: string): Promise<void> {
  if (!this.invoices || !this.invoices[invoiceType]) {
    console.error(`${invoiceType} not found`);
    return;
  }

  this._snackbar.open(
    Capacitor.isNativePlatform()
      ? 'Downloading your invoice PDF...'
      : 'Opening your invoice PDF...',
    '',
    {
      duration: 2000,
      verticalPosition: 'top',
    }
  );

  const invoiceBuffer = this.invoices[invoiceType];
  const blob = new Blob([new Uint8Array(invoiceBuffer.data)], {
    type: 'application/pdf',
  });

  const isMobile = Capacitor.isNativePlatform();

  if (isMobile) {
    try {
      const base64 = await this.blobToBase64(blob);
      const fileName = `invoice_${invoiceType}_${new Date().getTime()}.pdf`;

      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Documents,
      });

      await this.fileOpener.open(result.uri, 'application/pdf');
      console.log('PDF opened on device');
    } catch (error) {
      console.error('Failed to open PDF:', error);
      this._snackbar.open('Failed to open PDF.', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
      });
    }
  } else {
    // Web fallback
    const url = window.URL.createObjectURL(blob);
    await Browser.open({ url });
  }
}
private blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
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
