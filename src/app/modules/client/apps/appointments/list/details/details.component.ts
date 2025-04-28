import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { PrescriptionService } from 'app/shared/services/prescription.service';

@Component({
  selector: 'app-details',
  imports: [DatePipe,CommonModule,FormsModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnInit {
  appointment: any;
  isLoading = true;
  invoice: any | null = null;  // Variable to store invoiceId
  invoices: any = null; 
  selectedInvoiceType: string = '';
  constructor(
    private route: ActivatedRoute,
    private appointmentService: AppointmentService,
    private prescriptionService: PrescriptionService,  // Inject PrescriptionService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.appointmentService.getAppointment(id).subscribe({
        next: (data) => {
          this.appointment = data;
          console.log('Appointment details:', this.appointment);
          
          // Fetch the prescription to get the invoiceId
          this.getPrescriptionInvoiceId(this.appointment.prescriptionId);
          
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }

  // Function to fetch the prescription and get its invoiceId
  getPrescriptionInvoiceId(prescriptionId: string): void {
    this.prescriptionService.getPrescription(prescriptionId).subscribe({
      next: (prescriptionData) => {
        this.invoices = prescriptionData;
                console.log('prescriptionData:', prescriptionData);
      },
      error: (err) => {
        console.error('Error fetching prescription data:', err);
      }
    });
  }

  // Open the prescription PDF
  viewPrescriptionPDF(prescriptionId: string): void {
    this.appointmentService.getPrescriptionPdf(prescriptionId).subscribe(
      (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      (error) => {
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

}
