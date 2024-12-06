import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IndexDbService } from './pwa/index.db.service';
import { environment } from './environment/environment';
import { ToastService } from './generalServices/toast.service';
import { InternetService } from './admin/services/internet.service';
import { ToastActions } from './generalServices/toast-actions.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Inno Pwa';

  catalogString = environment.modules;
  catalogs = this.catalogString.split(',');

  constructor(private indexDbService: IndexDbService,
    private toast:ToastService,
    private internet: InternetService){
      this.indexDbService.initializeDataBases(this.catalogs);
  }
}
