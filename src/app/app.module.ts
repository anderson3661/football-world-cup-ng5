import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { DataService } from './zzz-other/services/data.service';
import { AdministrationComponent } from './administration/administration.component';
import { FixturesLatestComponent } from './fixtures-latest/fixtures-latest.component';
import { TablesComponent } from './tables/tables.component';
import { GroupStageComponent } from './group-stage/group-stage.component';
import { KnockoutStageComponent } from './knockout-stage/knockout-stage.component';
import { DialogComponent } from './dialog/dialog.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material';

import { AppComponent } from './app.component';
import { FixtureComponent } from './fixture/fixture.component';
import { FixtureInPlayComponent } from './fixture-in-play/fixture-in-play.component';


@NgModule({
  declarations: [
    AppComponent,
    AdministrationComponent,
    FixturesLatestComponent,
    TablesComponent,
    GroupStageComponent,
    KnockoutStageComponent,
    DialogComponent,
    PageNotFoundComponent,
    FixtureComponent,
    FixtureInPlayComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    MatCardModule,
    MatDialogModule,
    MatButtonModule,
    RouterModule.forRoot([
      { pathMatch: 'full', path: '', component: GroupStageComponent },
      { path: 'group-stage', component: GroupStageComponent },
      { path: 'knockout-stage', component: KnockoutStageComponent },
      { path: 'fixtures-latest', component: FixturesLatestComponent },
      { path: 'tables', component: TablesComponent },
      { path: 'administration', component: AdministrationComponent },
      { path: '**', component: PageNotFoundComponent }
    ])    
  ],
  entryComponents: [
    DialogComponent
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
