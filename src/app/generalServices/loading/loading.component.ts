import { Component } from '@angular/core';
import { fadeInAnimation } from '../../animations/animate';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css',
  animations: [fadeInAnimation]
})
export class LoadingComponent {

}
