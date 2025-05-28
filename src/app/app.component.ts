import { Component, computed, effect, inject } from '@angular/core';


import { RouterOutlet } from '@angular/router';
import { LoadingService } from './shared/services/loading.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [ RouterOutlet]
})
export class AppComponent
{

    loading = false;
    _loadingService=inject(LoadingService);
    /**
     * Constructor
     */
    constructor()
    {
        effect(()=>{
            this.loading = this._loadingService.loading();

        })
    }
}
