import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CartService } from 'app/shared/services/cart.service';

import { LoadingService } from 'app/shared/services/loading.service';

import { Browser } from '@capacitor/browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { Pagination } from 'app/shared/models/pagination';
import { Cart } from 'app/shared/models/cart';


@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [FormsModule, CommonModule,MatPaginator],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.scss'
})
export class InvoicesComponent implements OnInit {
  invoices: any[] = [];
  _route = inject(ActivatedRoute);
  _cartService = inject(CartService);
  _loadingService=inject(LoadingService)
  _snackBar = inject(MatSnackBar);
  currentSize = 10;
    currentPage = 1;
    total = 0;
    filterSearch: string;
    displayedList: any;
    @ViewChild(MatPaginator) paginator: MatPaginator;
  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
this._loadingService.show()
    this._cartService.getInvoices(
      this.currentPage,
      this.currentSize
    ).subscribe(
(data) => {
  console.log('Invoices:', data);

  this.displayedList = data.invoices;
  this.total = data.total ;
  console.log('Invoices:', this.invoices);
  this._loadingService.hide()
},
      (error) => {
        console.error('Error fetching invoices:', error);
        this._loadingService.hide()
      }
    );
  }


pageChanged(event: any): void {
  let { pageIndex } = event;
  const { pageSize } = event;
  pageIndex++;
  if (pageSize !== this.currentSize) {
    pageIndex = 1;
    this.paginator.firstPage();
  }
  this.currentSize = pageSize;
  this.currentPage = pageIndex;
  this.loadInvoices(); // Fetch new page from backend
}
  openInvoicePDF(invoiceId: string): void {
    this._snackBar.open('Opening your invoice PDF, please wait...', '', { duration: 2000 ,verticalPosition:'top', });
    this._cartService.getInvoicePdf(invoiceId).subscribe(
      async (pdfBlob) => {
        const pdfUrl = URL.createObjectURL(pdfBlob);
        try {
          await Browser.open({ url: pdfUrl });
        } catch (err) {
          console.error('Error opening PDF in browser:', err);
          this._snackBar.open('Failed to open PDF in browser.', 'Close', { duration: 3000 ,verticalPosition:'top'});
        }
      },
      (error) => {
        this._snackBar.open('Failed to open PDF in browser.', 'Close', { duration: 3000,verticalPosition:'top' });
        console.error('Error fetching invoice PDF:', error);
      }
    );
  }
}
