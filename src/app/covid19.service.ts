import { Injectable } from '@angular/core';
import  firebase  from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import {AngularFirestore} from '@angular/fire/firestore';
import {User} from './user.model';
import {HttpClient} from '@angular/common/http';
import { Data, Router } from '@angular/router';
import {  Countriesdata, CountryDailyData, Wdata, WorldWidedata } from "./wwdata.model";
import { merge, Observable } from 'rxjs';
import { News } from './news.model';
//import { stringify } from 'querystring';

@Injectable({
  providedIn: 'root'
}) 
export class Covid19Service {

  private pays: string = '';
  private code: string = '';
  private user: User;
  private Mycountry: Countriesdata;
  oneWeekAgo: Date = new Date();
  oneWeekAgo2: Date = new Date();
  today: Date = new Date();
  flag: boolean;

  constructor(private afAuth: AngularFireAuth, 
              private router: Router,
              private firestore: AngularFirestore,
              private http: HttpClient) {
                this.user = null;
                this.oneWeekAgo.setDate(this.oneWeekAgo.getDate() - 7);
                this.oneWeekAgo2.setDate(this.oneWeekAgo2.getDate() - 8);
                this.Mycountry = {
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
                };
               }

  async signInWithGoogle(){
    const credentials = await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
    // first check if the user is already registered in firestore, to take the most recent value of the flag used to abilitate the user
    // so that he is able to add a news; the flag can be set to true to abilitate the user from firestore.
    this.firestore.collection("users").doc(credentials.user.uid).get().subscribe( doc => {
      if(doc.exists.valueOf()){
        this.flag = doc.data()["flag"];
      }else
        this.flag = false;
    //console.log(this.flag);
      // we are having the credential of the user know we create a user object 
    this.user = {
      uid: credentials.user.uid,
      displayName: credentials.user.displayName,
      email: credentials.user.email,
      flag: this.flag
    };
    
    //we are saving the user informations in the local storage of our browser in the variable user
    localStorage.setItem('user', JSON.stringify(this.user));
    this.updateUserData();
    // navigate to the router page
    this.router.navigate(["worldwide"]);
  })
  }

  toCountryClick(tmp: string, code: string){
    this.pays = tmp;
    this.code = code;
    localStorage.setItem('pays', JSON.stringify(this.pays));
    localStorage.setItem('code', JSON.stringify(this.code));
    this.Mycountry.Country = tmp;
    this.router.navigate(['country', this.pays]);
  }

  getCountryName(){
    if(this.pays == ""){
      this.pays = JSON.parse(localStorage.getItem('pays'));
    }
    //console.log("we're in the service ==> "+ this.pays);
    return this.pays; 
  }

  getCountryCode(){
    if(this.code == ""){
      this.code = JSON.parse(localStorage.getItem('code'));
    }
    return this.code;
  }

  // add the user in the user collection 
  private updateUserData(){
    this.firestore.collection("users").doc(this.user.uid).set({
        uid: this.user.uid,
        displayName: this.user.displayName,
        email: this.user.email,
        flag: this.user.flag
    }, {merge: true});
  }

   
  getUser(){
    if(this.user == null && this.userSignedIn()){
      this.user = JSON.parse(localStorage.getItem('user'));
    }
    return this.user;
  }


  getAbilitatedUserAndAddnews(country: string, description: string, date: Date){

    let user = this.getUser();
    let novita: News; 
    if(user.flag == true){
      console.log('The user is abilitated')
      novita={
        date: new Date(date),
        country: country,
        description: description,
        uid: user.uid,
        userName: user.displayName,
      }
      //console.log('to be added');
      this.addNews(novita);
      //console.log('done');
    }
    return user.flag == true;
  }

  userSignedIn(): boolean{
    return JSON.parse(localStorage.getItem('user')) != null;
  }

  signOut(){
    this.afAuth.signOut();
    localStorage.removeItem('user');
    this.user = null;
    this.router.navigate(['signIn']);
  }

  getRemoteData(){
    //return an observable
    return this.http.get<WorldWidedata>("https://api.covid19api.com/summary");
  }

  url: string = '';

  getRemoteWeeklyData(){
    const URL = "https://api.covid19api.com/world?from=" + 
                  this.oneWeekAgo.toISOString().split('T')[0] +
                  "T00:00:00Z&to=" +
                  this.today.toISOString().split('T')[0] + 
                  "T00:00:00Z";
    this.url = URL;
    
    return this.http.get<Wdata[]>(this.url);
  }

  getRemoteWeeklyCountryData(countryCode: string){
    //country = country.toLocaleLowerCase().replace(' ', '-');
    this.url = 'https://api.covid19api.com/country/'+countryCode+'?from='+ 
    this.oneWeekAgo2.toISOString().split('T')[0]+"T00:00:00Z&to="+
    this.today.toISOString().split('T')[0]+"T00:00:00Z";
    
    return this.http.get<CountryDailyData[]>(this.url);
  }


  L_getRemoteData(){
    let url = "https://api.covid19api.com/world?from=2020-04-13T00:00:00Z&to=todaydateT00:00:00Z"

    return this.http.get<Wdata[]>(url);
  }

  diffDays(d1: Date, d2: Date){
    let ndays;
    let tv1 = d1.valueOf();  // msec since 1970
    let tv2 = d2.valueOf();

    ndays = (tv2 - tv1) / 1000 / 86400;
    ndays = Math.round(ndays - 0.5);
    return ndays;
  }

  getCountrySummary(countryCode: string){
    //country = country.toLocaleLowerCase().replace(' ', '-');
    this.url ="https://api.covid19api.com/country/"+countryCode;   
    
    return this.http.get<CountryDailyData[]>(this.url);
  }

  setCountry(elt: Countriesdata){
    this.firestore.collection('CountriesTotalData').doc(this.Mycountry.CountryCode).set({
      Country: elt.Country,
      CountryCode: elt.CountryCode,
      Slug: elt.Slug,
      NewConfirmed: elt.NewConfirmed,
      TotalConfirmed: elt.TotalConfirmed,
      NewDeaths: elt.NewDeaths,
      TotalDeaths: elt.TotalDeaths,
      NewRecovered: elt.NewRecovered,
      TotalRecovered: elt.TotalRecovered,
      Date: elt.Date,
      Premium: elt.Premium,}, {merge: true});
  
  return elt;
  }

  getDocFromCountriesTotalData(countryCode: string) {
    this.Mycountry.CountryCode = countryCode;
    return this.firestore.collection("CountriesTotalData").doc(this.Mycountry.CountryCode).get()
    
  }

  getNews(){
    return this.firestore.collection("news", ref=> ref.orderBy('date', 'asc')).valueChanges();
  }

  addNews(novita: News){
     this.firestore.collection("news").add(novita);
  }

}
