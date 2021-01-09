import { Component, OnInit } from '@angular/core';
import { from } from 'rxjs';
import { Covid19Service } from '../covid19.service';
import { User } from '../user.model';
import {  Countriesdata, CountryDailyData, DailyData, Wdata, WorldWidedata } from "../wwdata.model";
import { ChartType, ChartOptions } from 'chart.js';
import { Label } from 'ng2-charts';
import {Chart} from 'chart.js';
import { ThisReceiver } from '@angular/compiler';
import { News } from '../news.model';

@Component({
  selector: 'app-worldwide',
  templateUrl: './worldwide.component.html',
  styleUrls: ['./worldwide.component.css']
})
export class WorldwideComponent implements OnInit {

  user: User;
  summary:WorldWidedata;           
  pieChart: Chart;
  barChart: Chart;
  lineChart: Chart;
  countries: Countriesdata[] = [];
  p:number =1;
  country : string;
  conf: number[] = [];
  death: number[] = [];
  recov: number[] = [];
  news: News[] = [];

  dailyData: DailyData[] = [];
  // not used yet
  dailyDataCountries: CountryDailyData[] = [];
  dates: string[] = [];
  dailyStatsCountry: DailyData[] = [];

  L_conf: number[] = [];
  L_death: number[] = [];
  L_recov: number[] = [];
  L_dates: string[] = [];


  public Global!: Wdata;
  constructor(public worldwideService: Covid19Service) { 
    this.summary = null;
    this.Global = {
      TotalConfirmed: 0,
      NewConfirmed: 0,
      TotalDeaths: 0,
      NewDeaths: 0,
      TotalRecovered: 0,
      NewRecovered: 0,
    };
    this.user = null;
    this.countries = null;
    this.news = null;
  }

  ngOnInit(): void {
    this.conf = [];
    this.death = [];
    this.recov = [];
    this.dates = [];
    this.user = this.worldwideService.getUser(); 
    this.worldwideService.getRemoteWeeklyData().subscribe(res =>{
      let i =-7;
      let today = new Date();
      console.log(res);
      for(let tmp of res){
        this.conf.push(tmp.NewConfirmed);
        this.recov.push(tmp.NewRecovered);
        this.death.push(tmp.NewDeaths);
        let tmpDate = new Date().setDate(today.getDate()+i);
        let month = new Date(tmpDate).toLocaleString('default', { month: 'short' }) //(new Date(new Date().setDate(new Date().getDate() + i)).getMonth()+1).toString();
        let day = new Date(new Date().setDate(new Date().getDate() + i)).getDate().toString();
        this.dates.push(day+'-'+month);
        i++;
      } 
      while(i<=0){
        let month = new Date().toLocaleString('default', { month: 'short' });
        let day = new Date(new Date().setDate(new Date().getDate() + i)).getDate().toString();
        this.dates.push(day+'-'+month);
        i++;
      }
    })
    this.worldwideService.getRemoteData().subscribe(data =>{
      this.summary = data ;
      this.Global = this.summary.Global;
      this.countries = this.summary.Countries;
      // console.log("*** ok =>  ")
      // console.log(this.countries)
      //bar chart
      this.barChart = new Chart('barChart', {
        type: 'bar', 
        data:{
          labels: this.dates,
          datasets: [{
            data: this.death,
            backgroundColor: 'rgba(255,0,0,0.3)',
            label: 'Daily Deaths'
          },
            {data: this.recov,
             backgroundColor:  '#b8daff',
             label: 'Daily Recovered'
          },
           {data: this.conf,
            backgroundColor: '#ffdf7e',
            label: 'Daily New Cases'
          }]
        },
        options: {
          legend:{
            display: true
          },
          scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
        }
      });
      // piechart
      this.pieChart = new Chart('pieChart', {
        type: 'pie',
        data:{
          labels: ["Dead Cases", "Recovered Cases", "Active Cases"],
          datasets: [{
            data : [this.Global.TotalDeaths, this.Global.TotalRecovered, this.Global.TotalConfirmed - this.Global.TotalRecovered],
            backgroundColor: ['rgba(255,0,0,0.3)', '#b8daff', '#ffdf7e'],
          },]
        },
        options: {
          legend:{
            display: true
          },
          scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
        }
      });
    })

    this.worldwideService.L_getRemoteData().subscribe(res =>{
      let d = new Date('2020-04-13');
      let tmpConf: number = 0;
      let tmpRecov: number = 0;
      let tmpDeath: number = 0;
      let flag = true;
      for (let elt of res){
        if(flag == true){
          flag = false;
          tmpDeath = elt.TotalDeaths;
          tmpRecov = elt.TotalRecovered;
          tmpConf = elt.TotalConfirmed;
        }else{
          tmpDeath += elt.NewDeaths;
          tmpRecov += elt.NewRecovered;
          tmpConf += elt.NewConfirmed;
        }
        this.L_conf.push(tmpConf);
        this.L_recov.push(tmpRecov);
        this.L_death.push(tmpDeath);
        let month = new Date(d).toLocaleString('default', { month: 'short' });
        let day = new Date(new Date().setDate(new Date(d).getDate())).getDate().toString();
        this.L_dates.push(day+"-"+month);
        d.setDate(d.getDate()+1);

      }
      this.lineChart = new Chart('lineChart', {
        type: 'line', 
        data:{
          labels: this.L_dates,
          datasets: [{
            data: this.L_death,
            backgroundColor: 'rgba(255,0,0,0.3)',
            label: 'Daily Deaths'
          },
            {data: this.L_recov,
             backgroundColor:  '#b8daff',
             label: 'Daily Recovered'
          },
           {data: this.L_conf,
            backgroundColor: '#ffdf7e',
            label: 'Daily New Cases'
          }]
        },
        options: {
          legend:{
            display: true
          },
          scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
        }
      });
      
      this.L_conf = [];
      this.L_death = [];
      this.L_recov = [];
      this.L_dates = [];
    })


    this.worldwideService.getNews().subscribe( (novita: News[]) => {
      //console.log(novita);
      this.news = novita;
    })
  }

  Search(){
    //console.log(this.country);
    if(this.country == ""){
      this.ngOnInit();
    }else{
      let tmp:Countriesdata[] = [];
      for (let res of this.countries){
        //console.log(res.Country+"  ==> "+ this.country)
        if(res.Country.toLocaleLowerCase().startsWith(this.country.toLocaleLowerCase())){
          //console.log("good")
          tmp.push(res)
        }
      }
      this.countries = tmp;
    }
  }

  key: string = 'Country';
  reverse: boolean = false;
  sort(key){
    this.key = key;
    this.reverse = !this.reverse;
  }
}
