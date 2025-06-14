import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CartService } from 'app/shared/services/cart.service';
import { Capacitor } from '@capacitor/core';

import { LoadingService } from 'app/shared/services/loading.service';

import { Browser } from '@capacitor/browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';

@Component({
  selector: 'app-invoices',
  standalone: true,
  providers: [FileOpener],
  imports: [FormsModule, CommonModule, MatPaginator],
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']  // <-- FIXED here (was styleUrl)
})
export class InvoicesComponent implements OnInit {
  invoices: any[] = [];
  _route = inject(ActivatedRoute);
  _cartService = inject(CartService);
  _loadingService = inject(LoadingService);
  _snackBar = inject(MatSnackBar);

  currentSize = 5;
  currentPage = 1;
  total = 0;
  filterSearch: string;
  displayedList: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private fileOpener: FileOpener) {}

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
    this.loadInvoices();
  }

  openInvoicePDF(invoiceId: string): void {
    const isMobile = Capacitor.isNativePlatform();

    this._snackBar.open(
      isMobile ? 'Downloading your invoice PDF...' : 'Opening your invoice PDF...',
      '',
      {
        duration: 2000,
        verticalPosition: 'top',
      }
    );

    this._cartService.getInvoicePdf(invoiceId).subscribe(
      async (pdfBlob) => {
        if (isMobile) {
          try {
            // Convert blob to base64
            const base64 = await this.blobToBase64(pdfBlob);

            // Write file to device
            const fileName = `invoice_${invoiceId}.pdf`;
            const result = await Filesystem.writeFile({
              path: fileName,
              data: base64,
              directory: Directory.Documents,
            });

            // Open the file using FileOpener plugin
            await this.fileOpener.open(result.uri, 'application/pdf');
            console.log('File opened');
          } catch (err) {
            console.error('Error opening file', err);
            this._snackBar.open('Failed to open PDF.', 'Close', {
              duration: 3000,
              verticalPosition: 'top',
            });
          }
        } else {
          // Web browser fallback
          const pdfUrl = URL.createObjectURL(pdfBlob);
          await Browser.open({ url: pdfUrl });
        }
      },
      (error) => {
        console.error('Error fetching invoice PDF:', error);
        this._snackBar.open('Failed to fetch PDF.', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
        });
      }
    );
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
}
