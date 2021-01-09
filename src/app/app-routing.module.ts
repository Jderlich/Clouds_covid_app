import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddNewsComponent } from './add-news/add-news.component';
import { AuthGuard } from './auth.guard';
import { CountryComponent } from './country/country.component';
import { SecurePagesGuard } from './secure-pages.guard';
import { SigninComponent } from './signin/signin.component';
import { WorldwideComponent } from './worldwide/worldwide.component';

const routes: Routes = [
  {path: "signin", component: SigninComponent, canActivate: [SecurePagesGuard]},
  {path: "country/:parameter", component: CountryComponent, canActivate: [AuthGuard]},
  {path: "worldwide", component: WorldwideComponent, canActivate: [AuthGuard]},
  {path: "add-news", component: AddNewsComponent, canActivate: [AuthGuard]},
  {path: "", component: SigninComponent},
  {path: "**", component: SigninComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
