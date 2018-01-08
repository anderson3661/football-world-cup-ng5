import { DataService } from './../zzz-other/services/data.service';
import { TeamsModel, FixtureModel, MiscInfoModel } from '../zzz-other/interfaces/interfaces';
import * as helpers from '../zzz-other/helper-functions/helpers';

import { Component, OnInit } from '@angular/core';
// import { MatCardModule } from '@angular/material/card';


@Component({
    selector: 'app-administration',
    templateUrl: './administration.component.html',
    styleUrls: ['./administration.component.css']
})
export class AdministrationComponent implements OnInit {

    public appDataTeams: TeamsModel;
    public appDataMiscInfo: MiscInfoModel;
    private teams: any[] = [];                      // This references the class team in classes/team.ts and not the TeamModel in interfaces
    private fixturesDate: Date;

    constructor(public dataService: DataService) { }

    ngOnInit() {
        debugger;
        this.appDataMiscInfo = this.dataService.appData.miscInfo;
        this.appDataTeams = this.dataService.appData.teams;
    }


    private getFixturesDate(date: string): string {
        let fixturesDateNew: Date;

        this.fixturesDate = new Date(date);
        fixturesDateNew = new Date(this.fixturesDate);
        fixturesDateNew.setDate(fixturesDateNew.getDate() + 7);
        return fixturesDateNew.toDateString();
    }

    public createTournamentFixtures(): void {
        if (this.dataService.haveSeasonsFixturesBeenCreated()) {
            this.dataService.confirmResetSeason("Are you sure you want to reset the tournamemt ?", this.createFixtures.bind(this));
        } else {
            this.createFixtures();
        }
    }

    private createFixtures(): void {
        let countryIndexStart: number;
        let setOfMatchesIndex: number;
        let groupIndex: number;
        let timeOfFixture: string;

        this.dataService.setAppData(false);

        this.fixturesDate = new Date(this.appDataMiscInfo.tournamentStartDate);

        for (setOfMatchesIndex = 1; setOfMatchesIndex <= 3; setOfMatchesIndex++) {

            for (groupIndex = 1; groupIndex <= 8; groupIndex++) {

                countryIndexStart = (groupIndex - 1) * 4;

                if (setOfMatchesIndex === 1) {
                    if (groupIndex === 3 || groupIndex === 5 || groupIndex === 8) this.addToFixturesDate(1);
                    timeOfFixture = "16:00";
                    if (groupIndex === 5 || groupIndex === 8) timeOfFixture = "13:00";
                    if (groupIndex === 3) timeOfFixture = "11:00";
                    if (groupIndex === 4) timeOfFixture = "14:00";
                    this.addToFixtures(groupIndex - 1, countryIndexStart, 0, 1, timeOfFixture);
                    if (groupIndex === 1 || groupIndex === 6) this.addToFixturesDate(1);
                    timeOfFixture = "13:00";
                    if (groupIndex === 2 || groupIndex === 5 || groupIndex === 7) timeOfFixture = "19:00";
                    if (groupIndex === 8) timeOfFixture = "16:00";
                    if (groupIndex === 3) timeOfFixture = "17:00";
                    if (groupIndex === 4) timeOfFixture = "20:00";
                    this.addToFixtures(groupIndex - 1, countryIndexStart, 2, 3, timeOfFixture);
                } else if (setOfMatchesIndex === 2) {
                    if (groupIndex === 3 || groupIndex === 6) this.addToFixturesDate(1);
                    timeOfFixture = "13:00";
                    if (groupIndex === 6 || groupIndex === 8) timeOfFixture = "16:00";
                    if (groupIndex === 1 || groupIndex === 4) timeOfFixture = "19:00";
                    this.addToFixtures(groupIndex - 1, countryIndexStart, 0, 2, timeOfFixture);
                    if (groupIndex === 1 || groupIndex === 4 || groupIndex === 7) this.addToFixturesDate(1);
                    timeOfFixture = "19:00";
                    if (groupIndex === 1 || groupIndex === 3 || groupIndex === 4) timeOfFixture = "16:00";
                    if (groupIndex === 7) timeOfFixture = "13:00";
                    this.addToFixtures(groupIndex - 1, countryIndexStart, 1, 3, timeOfFixture);
                } else if (setOfMatchesIndex === 3) {
                    if (groupIndex === 1 || groupIndex === 3 || groupIndex === 5 || groupIndex === 7) this.addToFixturesDate(1);
                    timeOfFixture = (groupIndex === 1 || groupIndex === 3 || groupIndex === 6 || groupIndex === 8) ? "15:00" : "19:00";
                    this.addToFixtures(groupIndex - 1, countryIndexStart, 0, 3, timeOfFixture);
                    timeOfFixture = (groupIndex === 2 || groupIndex === 4 || groupIndex === 5 || groupIndex === 7) ? "19:00" : "15:00";
                    this.addToFixtures(groupIndex - 1, countryIndexStart, 1, 2, timeOfFixture);
                }

            }
        }

        // Update the knockout stages
        this.addToFixturesDate(2);
        this.updateKnockoutStages("roundOf16", 0);
        this.updateKnockoutStages("roundOf16", 1);
        this.addToFixturesDate(1);
        this.updateKnockoutStages("roundOf16", 4);
        this.updateKnockoutStages("roundOf16", 5);
        this.addToFixturesDate(1);
        this.updateKnockoutStages("roundOf16", 2);
        this.updateKnockoutStages("roundOf16", 3);
        this.addToFixturesDate(1);
        this.updateKnockoutStages("roundOf16", 6);
        this.updateKnockoutStages("roundOf16", 7);

        this.addToFixturesDate(3);
        this.updateKnockoutStages("quarterFinals", 0);
        this.updateKnockoutStages("quarterFinals", 1);
        this.addToFixturesDate(1);
        this.updateKnockoutStages("quarterFinals", 2);
        this.updateKnockoutStages("quarterFinals", 3);

        this.addToFixturesDate(3);
        this.updateKnockoutStages("semiFinals", 0);
        this.addToFixturesDate(1);
        this.updateKnockoutStages("semiFinals", 1);

        this.addToFixturesDate(3);
        this.updateKnockoutStages("thirdPlacePlayOff", 0);

        this.addToFixturesDate(1);
        this.updateKnockoutStages("final", 0);

        // debugger;
        // this.populateNearlyAllGroupFixtures();

        this.dataService.saveAppData();

        this.dataService.confirmationMessage("Fixtures created for tournament");

    }

    private addToFixtures(group: number, countryIndexStart: number, countryIndex1Add: number, countryIndex2Add: number, timeOfFixture: string): void {
        let fixture: FixtureModel;
        let fixturesIndex: number;

        fixture = {
            group: this.dataService.appData.miscInfo.groups[group],
            timeOfFixture: timeOfFixture,
            country1: this.dataService.appData.teams[countryIndexStart + countryIndex1Add].country,
            country2: this.dataService.appData.teams[countryIndexStart + countryIndex2Add].country
        };

        fixturesIndex = helpers.getPositionInArrayOfObjects(this.dataService.appData.fixtures, "dateOfSetOfFixtures", this.fixturesDate.toDateString());
        if (fixturesIndex === -1) {
            this.dataService.appData.fixtures.push({
                dateOfSetOfFixtures: this.fixturesDate.toDateString(),
                fixtures: [fixture]
            });
        } else {
            this.dataService.appData.fixtures[fixturesIndex].fixtures.push(fixture);
        }
    }

    private updateKnockoutStages(knockoutRound: string, fixtureIndex: number): void {
        this.dataService.appData.knockoutStage[knockoutRound][fixtureIndex].dateOfFixture = this.fixturesDate.toDateString();
    }

    private addToFixturesDate(daysToAdd: number) {
        this.fixturesDate.setDate(this.fixturesDate.getDate() + daysToAdd);
    }

    private populateNearlyAllGroupFixtures() {
        for (let i = 0; i < this.dataService.appData.fixtures.length; i++) {
            for (let j = 0; j < this.dataService.appData.fixtures[i].fixtures.length; j++) {
                this.dataService.appData.fixtures[i].fixtures[j].country1Score = 1;
                this.dataService.appData.fixtures[i].fixtures[j].country2Score = 0;
                this.dataService.appData.fixtures[i].fixtures[j].hasFixtureFinished = true;
            }
            if (i === 13) break;
        }
        this.dataService.appData.miscInfo.hasTournamentStarted = true;
        this.dataService.appData.miscInfo.canDisplayRoundOf16 = true;
        this.dataService.appData.miscInfo.dateOfLastSetOfFixtures = "Wed Jun 27 2018";
    }

}
