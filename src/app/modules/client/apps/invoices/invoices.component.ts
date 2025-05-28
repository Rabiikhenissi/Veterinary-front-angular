import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CartService } from 'app/shared/services/cart.service';
import { LoadingService } from 'app/shared/services/loading.service';

@Component({
  selector: 'app-invoices',
  imports: [FormsModule,CommonModule],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.scss'
})
export class InvoicesComponent implements OnInit {
  invoices: any[] = [];
  _route = inject(ActivatedRoute);
  _cartService = inject(CartService);
  _loadingService=inject(LoadingService)
  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
this._loadingService.show()
    this._cartService.getInvoices().subscribe(
      (data) => {
        console.log('Invoices:', data);
        this.invoices = data; 
        console.log('Invoices:', this.invoices);
        this._loadingService.hide()
        
      },
      (error) => {
        console.error('Error fetching invoices:', error);
        this._loadingService.hide()
      }
    );
  }

  openInvoicePDF(invoiceId: string): void {
    this._cartService.getInvoicePdf(invoiceId).subscribe(
      (pdfBlob) => {
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
      },
      (error) => {
        console.error('Error fetching invoice PDF:', error);
      }
    );
  }
}