import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-user-features',
  templateUrl: './user-features.component.html',
  styleUrls: ['./user-features.component.scss'],
  standalone: true,
  imports: [RouterOutlet],
})
export class UserFeaturesComponent {
  constructor() {}
}
