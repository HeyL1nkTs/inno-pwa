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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonToggleModule, MatCheckboxModule, TooltipDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  animations: [fadeComponent]
})
export class DashboardComponent implements OnInit {

  chart: any;
  ctx: any;
  chartType: string = 'month';
  informationChart: Dashboard[] = [];
  informationSelling: Selling;

  @HostListener('window:resize', ['$event'])
  onBeforePrint(event: Event) {
    this.chart.resize();
  }

  //TODO eliminar arrays
  // Array de ventas por mes
  mes = [
    { x: 'January', y: Math.floor(Math.random() * 1000) },
    { x: 'February', y: Math.floor(Math.random() * 1000) },
    { x: 'March', y: Math.floor(Math.random() * 1000) },
    { x: 'April', y: Math.floor(Math.random() * 1000) },
    { x: 'May', y: Math.floor(Math.random() * 1000) },
    { x: 'June', y: Math.floor(Math.random() * 1000) },
    { x: 'July', y: Math.floor(Math.random() * 1000) },
    { x: 'August', y: Math.floor(Math.random() * 1000) },
    { x: 'September', y: Math.floor(Math.random() * 1000) },
    { x: 'October', y: Math.floor(Math.random() * 1000) },
    { x: 'November', y: Math.floor(Math.random() * 1000) },
    { x: 'December', y: Math.floor(Math.random() * 1000) }
  ];

  // Array de ventas por día
  dia = [
    { x: 'Monday', y: Math.floor(Math.random() * 500) },
    { x: 'Tuesday', y: Math.floor(Math.random() * 500) },
    { x: 'Wednesday', y: Math.floor(Math.random() * 500) },
    { x: 'Thursday', y: Math.floor(Math.random() * 500) },
    { x: 'Friday', y: Math.floor(Math.random() * 500) },
    { x: 'Saturday', y: Math.floor(Math.random() * 500) },
    { x: 'Sunday', y: Math.floor(Math.random() * 500) }
  ];

  // Array de ventas por semana
  semana = [
    { x: 'Week 1', y: Math.floor(Math.random() * 2000) },
    { x: 'Week 2', y: Math.floor(Math.random() * 2000) },
    { x: 'Week 3', y: Math.floor(Math.random() * 2000) },
    { x: 'Week 4', y: Math.floor(Math.random() * 2000) }
  ];

  salesDataForPeriods = {
    day: new Selling(
      'Product A', // _mostSelling
      'Product B', // _lessSelling
      500,         // _mostSellingAmount
      50,          // _lessSellingAmount
      'img_a_day.png', // _image_mostSelling
      'img_b_day.png'  // _image_lessSelling
    ),
    month: new Selling(
      'Product C', // _mostSelling
      'Product D', // _lessSelling
      1000,        // _mostSellingAmount
      100,         // _lessSellingAmount
      'img_c_month.png', // _image_mostSelling
      'img_d_month.png'  // _image_lessSelling
    ),
    year: new Selling(
      'Product E', // _mostSelling
      'Product F', // _lessSelling
      5000,        // _mostSellingAmount
      500,         // _lessSellingAmount
      'img_e_year.png', // _image_mostSelling
      'img_f_year.png'  // _image_lessSelling
    )
  };


  constructor() { }

  async ngOnInit() {
    this.loadInformation(this.chartType);
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
            label: 'Sales: ' + this.chartType,
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
    } else {
      console.log("Chart didn't load");
    }
  }

  /**
   * @description load information for the chart and the selling information, from the database by type
   * @param type string
   * @returns void
   */
  loadInformation(type: string) {
    this.informationChart = [];
    this.informationSelling = null;
    //TODO obtener datos de la bd por tipo de venta
    switch (type) {
      case 'month':
        //TODO aqui solo es igualar la consulta a la variable
        this.informationChart = this.mes.map((v) => new Dashboard(v.x, v.y));
        this.informationSelling = this.salesDataForPeriods.month;
        break;
      case 'day':
        this.informationChart = this.dia.map((v) => new Dashboard(v.x, v.y));
        this.informationSelling = this.salesDataForPeriods.day;
        break;
      case 'week':
        this.informationChart = this.semana.map((v) => new Dashboard(v.x, v.y));
        this.informationSelling = this.salesDataForPeriods.year;
        break;
      default:
        console.error('Type not found');
    }

    this.chartType = type;
    this.createChart();
  }
}
