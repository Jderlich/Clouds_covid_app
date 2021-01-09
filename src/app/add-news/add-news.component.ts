import { Component, OnInit } from '@angular/core';
import { Covid19Service } from '../covid19.service';
import { News } from '../news.model';
import { User } from '../user.model';

@Component({
  selector: 'app-add-news',
  templateUrl: './add-news.component.html',
  styleUrls: ['./add-news.component.css']
})
export class AddNewsComponent implements OnInit {
  date: any;
  description: string;
  country: string;
  uid: string;
  userName: string;
  user_abilitate: User;
  abilitate: boolean = true;

  constructor(private newsService: Covid19Service) { 
    console.log("it is here");
    this.user_abilitate = null;
  }

  ngOnInit(): void {
  }

  async addNews(){
    if(this.newsService.getAbilitatedUserAndAddnews(this.country, this.description, this.date)){
      this.date = undefined;
      this.description = undefined;
      this.country = undefined;
    }else{

    }
  }

}
