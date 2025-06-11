import { Directive, Input, TemplateRef, ViewContainerRef, OnDestroy } from '@angular/core';
import { UserService } from '../services/user.service';
import { FeatureAuth } from '../models/feature-auth';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appFeatures]',
})
export class FeaturesDirective implements OnDestroy {
  private permissions: FeatureAuth[];
  private sub: Subscription;
  private isHidden = true;

  constructor(
    private viewContainer: ViewContainerRef,
    private templateRef: TemplateRef<any>,
    private userService: UserService
  ) {}

  @Input()
  set appFeatures(val: FeatureAuth[]) {
    this.permissions = val;

    // Unsubscribe previous if any
    this.sub?.unsubscribe();

    // Subscribe to permission changes
    this.sub = this.userService.features$.subscribe(() => {
      this.updateView();
    });
  }

  private updateView() {
    if (this.userService.checkPermission(this.permissions)) {
      if (this.isHidden) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.isHidden = false;
      }
    } else {
      if (!this.isHidden) {
        this.viewContainer.clear();
        this.isHidden = true;
      }
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
