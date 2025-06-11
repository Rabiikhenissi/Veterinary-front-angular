import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnDestroy,
  OnInit,
} from '@angular/core';

import { UserService } from '../services/user.service';
import { FeatureAuth } from '../models/feature-auth';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appFeatures]',
  standalone: true,
})
export class FeaturesDirective implements OnInit, OnDestroy {
  private permissions: FeatureAuth[] = [];
  private sub: Subscription;


  constructor(
    private viewContainer: ViewContainerRef,
    private templateRef: TemplateRef<any>,
    private userService: UserService
  ) {}

  @Input()
  set appFeatures(val: FeatureAuth[]) {
    this.permissions = val;
    this.updateView();
  }

  ngOnInit() {
    // React to permissions being updated dynamically
    this.sub = this.userService.features$.subscribe(() => {
      this.updateView();
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  private updateView() {
    const canView = this.userService.checkPermission(this.permissions);
    this.viewContainer.clear();

    if (canView) {
      this.viewContainer.createEmbeddedView(this.templateRef);

    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
