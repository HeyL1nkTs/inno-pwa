import { ChangeDetectorRef, Component, EventEmitter, Input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TooltipDirective } from '../../../directives/tooltip.directive';
import { scaleAnimation } from '../../../animations/animate';
import { MatTableModule } from '@angular/material/table';

/**
 * @title Pop Component
 *
 * @param data: any[] - The data to be displayed in the pop component
 * @param state: string - The state of the pop component (void, visible)
 *
 * @method setState - Emits the state of the pop component
 *
 * @example
 *
 * <div *ngIf="pop">
 *   <app-pop [data]="itemData" [state]="setVisible" (setState)="closeReceipt($event)"></app-pop>
 * </div>
 *
 * @requires
 *
 * pop true, false - boolean
 *
 * state void, visible -- string
 *
 * needed a time out on parent of 300ms to complete the animation
 */

@Component({
  selector: 'app-pop',
  standalone: true,
  imports: [MatIcon, TooltipDirective, MatTableModule],
  templateUrl: './pop.component.html',
  styleUrl: './pop.component.css',
  animations: [scaleAnimation]
})
export class PopComponent {

  @Input() data: any;
  @Input() state: string = 'void';

  tabColumns = ['name', 'price', 'required'];

  setState = output<string>();

  constructor(private cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.cdRef.detectChanges();
  }

  close() {
    this.setState.emit('void');
  }

}
