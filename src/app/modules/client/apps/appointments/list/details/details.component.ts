import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { PrescriptionService } from 'app/shared/services/prescription.service';

@Component({
  selector: 'app-details',
  imports: [DatePipe,CommonModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnInit {
  appointment: any;
  isLoading = true;
  invoice: any | null = null;  // Variable to store invoiceId

  constructor(
    private route: ActivatedRoute,
    private appointmentService: AppointmentService,
    private prescriptionService: PrescriptionService  // Inject PrescriptionService
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
        this.invoice = prescriptionData.invoice;
        console.log('prescriptionData:', this.invoice);
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
  openInvoicePDF(prescriptionId): void {
    if (this.invoice) {
      this.appointmentService.getInvoicePdf(prescriptionId).subscribe(
        (blob) => {
          const url = window.URL.createObjectURL(blob);
          window.open(url);
        },
        (error) => {
          console.error('Error fetching invoice PDF', error);
        }
      );
    } else {
      console.error('No invoice ID found');
    }
  }
}
