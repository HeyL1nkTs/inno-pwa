import { Component, HostListener, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import _ from 'lodash';
import { Dashboard } from '../../../models/dashboard.model';
import { Selling } from '../../../models/selling.model';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TooltipDirective } from '../../../directives/tooltip.directive';
import { fadeComponent } from '../../../animations/animate';
import { SaleService } from '../../services/sale.service';
import { LoadingComponent } from '../../html/loading/loading.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonToggleModule, MatCheckboxModule, TooltipDirective, LoadingComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  animations: [fadeComponent]
})
export class DashboardComponent implements OnInit {

  chart: any;
  ctx: any;
  chartType: string = 'month';
  informationChart: Dashboard[] = [];
  informationSelling: any;
  wip: boolean = false;

  @HostListener('window:resize', ['$event'])
  onBeforePrint(event: Event) {
    this.chart.resize();
  }

  constructor(private saleService: SaleService) { }

  async ngOnInit() {
    this.loadInformation(this.chartType);
  }

  async loadDashboard(type: string) {
    const data = await this.saleService.getDashboard(type);
    return data;
  }

  /**
   * @description Verify if is already a chart created, if it is, destroy it and create a new one
   * @param void
   * @returns void
   */
  createChart() {
    if (this.chart) {
      this.ctx = null;
      this.chart.destroy();
    }
    this.ctx = document.getElementById('canva') as HTMLCanvasElement | null;
    if (!this.ctx) {
      console.error('Canva not found');
      return;
    }
    const labels = this.informationChart.map((v: { X: string; }) => v.X);
    const data = this.informationChart.map((v: { Y: number; }) => v.Y);

    let delayed: boolean;
    if (this.ctx) {
      this.chart = new Chart(this.ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Ventas',
            data: data,
            backgroundColor: 'rgb(27, 73, 101)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          interaction: {
            intersect: false,
            mode: 'index'
          },
          animation: {
            onComplete: () => {
              delayed = true;
            },
            delay: (context) => {
              let delay = 0;
              if (context.type === 'data' && context.mode === 'default' && !delayed) {
                delay = context.dataIndex * 300 + context.datasetIndex * 100;
              }
              return delay;
            }
          }
        }
      });
      this.wip = false;
    } else {
      console.log("Chart didn't load");
    }
  }

  /**
   * @description load information for the chart and the selling information, from the database by type
   * @param type string
   * @returns void
   */
  async loadInformation(type: string) {
    this.wip = true;
    this.informationChart = [];
    this.informationSelling = null;
    const data: any = await this.loadDashboard(type);
    switch (type) {
      case 'month':
        /*this.informationChart = this.mes.map((v) => new Dashboard(v.x, v.y));
        this.informationSelling = this.salesDataForPeriods.month;*/

        this.informationChart = data.chartData.map((v) => new Dashboard(v.x, v.y));
        this.informationSelling = data.mostSoldProduct;
        break;
      case 'day':
        /*this.informationChart = this.dia.map((v) => new Dashboard(v.x, v.y));
        this.informationSelling = this.salesDataForPeriods.day;*/
        this.informationChart = data.chartData.map((v) => new Dashboard(v.x, v.y));
        this.informationSelling = data.mostSoldProduct;
        break;
      case 'week':
        /*this.informationChart = this.semana.map((v) => new Dashboard(v.x, v.y));
        this.informationSelling = this.salesDataForPeriods.year;*/
        this.informationChart = data.chartData.map((v) => new Dashboard(v.x, v.y));
        this.informationSelling = data.mostSoldProduct;
        break;
      default:
        console.error('Type not found');
    }

    this.chartType = type;
    this.createChart();
  }
}
