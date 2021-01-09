import { Component, OnInit } from '@angular/core';
import { Covid19Service } from '../covid19.service';
import { User } from '../user.model';
import {ActivatedRoute} from '@angular/router';
import { Countriesdata } from '../wwdata.model';
import {Chart} from 'chart.js';
import {Location} from '@angular/common';
import { News } from '../news.model';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.css']
})
export class CountryComponent implements OnInit {
  user: User;
  countryName: string ='';
  countryCode: string = '';
  country: Countriesdata;
  pieChart: Chart;
  lineChart :Chart;
  barChart :Chart;
  totalNews: News[] = [];
  news: News[] = [];

  conf: number[] = [];
  death: number[] = [];
  recov: number[] = [];
  dates: string[] = [];

  L_conf: number[] = [];
  L_death: number[] = [];
  L_recov: number[] = [];
  L_dates: string[] = [];
  doc: any;

  constructor(private route: ActivatedRoute,
              public countryService: Covid19Service,
              private _location: Location) { 
    this.route.params.subscribe();
    this.user = countryService.getUser();
    this.totalNews= null;
    this.country = {
      Country: '',
      CountryCode: '',
      Slug: '',
      NewConfirmed: 0,
      TotalConfirmed: 0,
      NewDeaths: 0,
      TotalDeaths: 0,
      NewRecovered: 0,
      TotalRecovered: 0,
      Date: new Date(),
      Premium: '',
    }
  }

  async ngOnInit(): Promise<void> {
    this.countryName = this.countryService.getCountryName();
    this.countryCode = this.countryService.getCountryCode();

    //console.log(this.countryName);
    //console.log("==>    "+this.countryCode)


    ///here
    let flag = true;
    this.countryService.getDocFromCountriesTotalData(this.countryCode).subscribe((doc) =>{
      this.doc = doc;
      let data = new Date().setHours(0,0,0,0);
      //console.log("today's date "+ data );
      // console.log("data from doc => "+  doc.data()["Country"]);

      if(doc.exists){
        let countryDate = new Date(doc.data()["Date"]).setHours(0,0,0,0);
        //console.log("date from the db => "+doc.data()["Date"]);
        //console.log("date from the db => "+countryDate);
        //console.log("date of today => "+data);
        
        //console.log(countryDate);
        if(data > countryDate){
          //console.log('Document out of date')
          flag = false;
        }else{
          //countries = doc.data();
          console.log("the DB's data are up to date")
        }
      }else{
        //console.log("document doesn't exist")
        flag = false;
      }
      //console.log(flag)
    if(flag == true){
      this.country.Country = this.doc.data()["Country"]
      this.country.CountryCode = this.doc.data()["CountryCode"]
      this.country.Slug = this.doc.data()["Slug"]
      this.country.NewConfirmed = this.doc.data()["NewConfirmed"]
      this.country.TotalConfirmed = this.doc.data()["TotalConfirmed"]
      this.country.NewDeaths = this.doc.data()["NewDeaths"]
      this.country.TotalDeaths = this.doc.data()["TotalDeaths"]
      this.country.NewRecovered = this.doc.data()["NewRecovered"]
      this.country.TotalRecovered = this.doc.data()["TotalRecovered"]
      this.country.Date = this.doc.data()["Date"]
      this.country.Premium = this.doc.data()["Premium"]

      //console.log('here we are');
      //console.log(this.country)
       this.pieChart = new Chart('mypieChart', {
         type: 'pie',
         data:{
         labels: ["Dead Cases", "Recovered Cases", "Active Cases"],
         datasets: [{
           data : [this.country.TotalDeaths, this.country.TotalRecovered, this.country.TotalConfirmed - this.country.TotalRecovered],
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
    }
    else{
      this.countryService.getRemoteData().subscribe( res => {
        // pays = res.Countries.filter( country => country.Country.toLocaleLowerCase().match(countryName.toLocaleLowerCase()))[0] ;;
      for (let elt of res.Countries){
        // console.log(countryName +"  =>  "+ elt.Country )
        if(elt.CountryCode.toLocaleLowerCase().localeCompare(this.countryCode.toLocaleLowerCase()) == 0){
          this.country =  this.countryService.setCountry(elt)
          //console.log("join in the if condition")
          //console.log(this.country)
          break
         }
       }
    // this.country = await this.countryService.getCountryFromInternDB(this.countryName);
     //console.log('here we are');
     //console.log(this.country)
      this.pieChart = new Chart('mypieChart', {
        type: 'pie',
        data:{
        labels: ["Dead Cases", "Recovered Cases", "Active Cases"],
        datasets: [{
          data : [this.country.TotalDeaths, this.country.TotalRecovered, this.country.TotalConfirmed - this.country.TotalRecovered],
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
      });
    }
    });

    this.countryService.getRemoteWeeklyCountryData(this.countryCode).subscribe(res =>{
      //console.log(res);
      let i = -8;
      let today = new Date();
      let oneWeekDate = new Date();
      oneWeekDate.setDate(today.getDate()+i);
      //console.log('ecooooo   '+ oneWeekDate)
      let tmpConf :number = 0;
      let tmpRecov :number = 0;
      let tmpDeath :number = 0;
      let daystring: string;
      let tmpDateString: string;
      let datestring: string;
      let flag = false;
      let prevflag = false;
      let prevConf :number = 0;
      let prevRecov :number =0;
      let prevDeath :number = 0;
      let val :number = 0;
      for(let tmp of res){
        //console.log("flag => "+flag+" and prevflag => "+prevflag);
        //console.log(tmp);
        if(flag == false && prevflag == false && i== -7){
          oneWeekDate.setDate(new Date(oneWeekDate).getDate()+1);
          flag = true;
          // console.log("good flag = "+flag+" and prevflag = "+prevflag);
        }
        if(prevflag == false && i == -8){ // it is the day -8
          prevflag = true;
          oneWeekDate = new Date(tmp.Date);
          // console.log("if condition prevflag = "+ prevflag);          
        }
        tmpDateString = new Date(tmp.Date).toISOString().split('T')[0];
        //monthstring = oneWeekDate.getMonth()+1;
        daystring = new Date(oneWeekDate).toISOString().split(' ')[0].split('T')[0];
        //console.log('+++++++++++  '+new Date(oneWeekDate).toISOString().split(' ')[0].split('T')[0])
        datestring = daystring;
        //console.log('onweekDate=> '+datestring+'**********tmp.Date=> '+tmpDateString);
        if(datestring == tmpDateString){
          tmpConf += tmp.Confirmed;
          tmpRecov += tmp.Recovered;
          tmpDeath += tmp.Deaths;
        }else{
          //console.log("prevflag => "+prevflag+" and flag => "+flag);
          if(prevflag == true && flag == false){
            prevConf = tmpConf;
            prevRecov = tmpRecov;
            prevDeath = tmpDeath;
            prevflag = false;
            i++;
            tmpConf = tmp.Confirmed;
            tmpRecov = tmp.Recovered;
            tmpDeath = tmp.Deaths;
            //console.log("if condition prevflag = "+ prevflag);
            //console.log("i value "+i);
          } else if(flag == true){
            //console.log("oneweekDate = " + oneWeekDate);
            //console.log("i value is "+ i);
            val = tmpConf - prevConf;
            //console.log("prevConf = "+prevConf+" tmpConf = "+tmpConf+" diff ="+val);
            this.conf.push(val );
            prevConf = tmpConf
            val = tmpRecov - prevRecov;
            //console.log("prevRecov = "+prevRecov+" tmpRecov = "+tmpRecov+" diff ="+val);
            this.recov.push(val);
            prevRecov = tmpRecov;
            val = tmpDeath - prevDeath;
            //console.log("prevDeath = "+prevDeath+" tmpRecov = "+tmpDeath+" diff ="+val);
            this.death.push(val);
            prevDeath = tmpDeath;
            let month = new Date(oneWeekDate).toLocaleString('default', { month: 'short' });
            // console.log("day with i = "+ i);
            let day = new Date(new Date().setDate(new Date().getDate() + i)).getDate().toString();
            this.dates.push(day+'-'+month);
            //console.log(day+'-'+month);
            i++;
            tmpConf = tmp.Confirmed;
            tmpRecov = tmp.Recovered;
            tmpDeath = tmp.Deaths;
            oneWeekDate.setDate(new Date(oneWeekDate).getDate()+1);
          }
        }
      }
      //console.log(i) 
      this.conf.push(tmpConf - prevConf);
      this.recov.push(tmpRecov - prevRecov);
      this.death.push(tmpDeath -prevDeath);
      let month = new Date(oneWeekDate).toLocaleString('default', { month: 'short' });
      let day = new Date(new Date().setDate(new Date().getDate() + i)).getDate().toString();
      this.dates.push(day+'-'+month);
      i++;
      while (i<=0){
        month = new Date(oneWeekDate.setDate(new Date(oneWeekDate).getDate()+1)).toLocaleString('default', { month: 'short' });
        day = new Date(new Date().setDate(new Date().getDate() + i)).getDate().toString();
        this.dates.push(day+'-'+month);
        i++;
      }
      
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
    })

    this.countryService.getCountrySummary(this.countryCode).subscribe( res =>{
    let tmpConf: number = 0;
    let tmpRecov: number = 0;
    let tmpDeath: number = 0;
    let tmpdate: Date;
    let flag = true;
    for (let tmp_res of res){
      if(flag == true){
        tmpConf = tmp_res.Confirmed;
        tmpRecov= tmp_res.Recovered;
        tmpDeath = tmp_res.Deaths;
        tmpdate = tmp_res.Date;
        flag = false;
      }else{
        let res_dateString = new Date(tmp_res.Date).toISOString().split('T')[0];
        let tmp_dateString = new Date(tmpdate).toISOString().split('T')[0];
        if(res_dateString == tmp_dateString){
          tmpConf += tmp_res.Confirmed;
          tmpRecov += tmp_res.Recovered;
          tmpDeath += tmp_res.Deaths;
        }else{
          if(!(tmpConf==0 && tmpRecov==0 && tmpDeath==0)){
            this.L_conf.push(tmpConf);
            this.L_recov.push(tmpRecov);
            this.L_death.push(tmpDeath);
            let month = new Date(tmpdate).toLocaleString('default', { month: 'short' });
            let day = new Date(new Date().setDate(new Date(tmpdate).getDate())).getDate().toString();
            this.L_dates.push(day+"-"+month);
          }  
          tmpConf = tmp_res.Confirmed;
          tmpRecov = tmp_res.Recovered;
          tmpDeath = tmp_res.Deaths;
          tmpdate = tmp_res.Date;

        }
      }
    }
      //bar chart
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

    })


    this.countryService.getNews().subscribe( (novita: News[]) => {
      //console.log(this.countryName.toLocaleLowerCase());
      for(let res of novita){
        if(this.countryName.toLocaleLowerCase().localeCompare(res.country.toLocaleLowerCase()) == 0){
          //console.log(res);
          this.news.push(res)
        }
      }
    })
  }

  goBack() {
    this._location.back();
  }
}
