import { Directive, ElementRef, HostListener, Input, OnDestroy } from '@angular/core';
import _ from 'lodash';

/**
 * @directive TooltipDirective
 *
 * A directive to display a tooltip with custom text when the user hovers over any element.
 *
 * @example
 * <div appTooltip="Your tooltip text" placement="top" [delay]="2000">
 *     Hover over me!
 * </div>
 */


@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnDestroy {

  @Input('appTooltip') title?: any;
  @Input() placement?: string;
  @Input() delay?: number;
  tooltip?: HTMLElement;
  offset?: number = 10;

  constructor(private el: ElementRef) { }

  @HostListener('mouseenter') onMouseEnter() {
    if (!this.tooltip) {
      this.show();
    }
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.hide();
  }

  show() {
    this.create();
    this.setPosition();
    this.tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    this.tooltip.style.color = 'white';
    this.tooltip.style.padding = '10px';
    this.tooltip.style.borderRadius = '10px';
    this.tooltip.style.position = 'absolute';
    this.tooltip.style.zIndex = '1000';
    this.tooltip.style.visibility = 'visible';
    this.tooltip.style.opacity = '1';
    this.tooltip.style.transition = 'opacity 0.5s';
  }

    hide(immediate: boolean = false) {
      if (this.tooltip) {
        if (immediate) {
          // Remueve inmediatamente sin esperar
          this.tooltip.remove();
          this.tooltip = null;
        } else {
          // Espera un poco antes de eliminar
          this.tooltip.style.opacity = '0';
          setTimeout(() => {
            this.tooltip?.remove();
            this.tooltip = null;
          }, this.delay);
        }
      }
    }

  create() {
    this.tooltip = document.createElement('span');
    this.tooltip.classList.add('tooltip');
    this.tooltip.textContent = this.title;
    document.body.appendChild(this.tooltip);
  }

  setPosition() {
    const elemRect = this.el.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltip?.getBoundingClientRect();
    if (!tooltipRect) return;
    let top, left;

    switch (this.placement) {
      case 'top':
        top = elemRect.top - tooltipRect.height - this.offset;
        left = elemRect.left + (elemRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = elemRect.bottom + this.offset;
        left = elemRect.left + (elemRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = elemRect.top + (elemRect.height - tooltipRect.height) / 2;
        left = elemRect.left = tooltipRect.width - this.offset;
        break;
      case 'right':
        top = elemRect.top + (elemRect.height - tooltipRect.height) / 2;
        left = elemRect.right + this.offset;
        break;
      default:
        throw new Error('Invalid placement');
    }

    if (this.tooltip) {
      this.tooltip.style.top = `${top}px`;
      this.tooltip.style.left = `${left}px`;
    }
  }

  ngOnDestroy() {
    this.hide(true);
  }

}
