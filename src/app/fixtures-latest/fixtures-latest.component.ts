import { DataService } from '../zzz-other/services/data.service';
import { TeamsModel, FixtureModel, FixturesModel, AllFixturesModel, SetOfFixturesModel, GroupTablesModel, TableModel, SetOfFixturesControllerModel, KnockoutModel } from './../zzz-other/interfaces/interfaces';
import { FixtureComponent } from '../fixture/fixture.component'
// import { Fixture } from '../zzz-other/classes/fixture';
import * as helpers from '../zzz-other/helper-functions/helpers';
import { Component, OnInit } from '@angular/core';

const EXTRA_MINUTES_FIRST_HALF = 5;
const EXTRA_MINUTES_SECOND_HALF = 9;

@Component({
    selector: 'app-fixtures-latest',
    templateUrl: './fixtures-latest.component.html',
    styleUrls: [
        '../zzz-other/css/fixtures.css',
        '../zzz-other/css/tables.css',
        './fixtures-latest.component.css']
})
export class FixturesLatestComponent implements OnInit {

    private teams: TeamsModel;
    public allTournamentFixtures: AllFixturesModel;
    public latestFixtures: SetOfFixturesModel;
    public tablesBeforeFixtures: GroupTablesModel;
    public tablesInPlay: GroupTablesModel;
    public haveFixturesBeenCreated: boolean;
    public hasGroupStageFinished: boolean;
    private dateOfLastSetOfFixtures: string;
    public groups: string[];

    public setOfFixturesController: SetOfFixturesControllerModel;

    private progressMatches;

    private tableTypeInPlay: boolean;                         // Required by the HTML - also used by fixtures-latest.component (i.e. in the html call)
    public hasTournamentFinished: boolean;

    public fixture: FixtureComponent;



    constructor(public dataService: DataService) { }

    ngOnInit() {
        let goalFactorsSource: string;
        let i: number;

        if (this.dataService.haveSeasonsFixturesBeenCreated()) {

            this.teams = this.dataService.appData.teams;
            this.allTournamentFixtures = this.dataService.appData.fixtures;
            this.haveFixturesBeenCreated = (this.allTournamentFixtures.length > 0);
            this.dateOfLastSetOfFixtures = this.dataService.appData.miscInfo.dateOfLastSetOfFixtures;
            this.tablesBeforeFixtures = this.dataService.appData.groupTables;

            this.hasGroupStageFinished = this.dataService.appData.miscInfo.hasGroupStageFinished;
            this.hasTournamentFinished = this.dataService.appData.miscInfo.hasTournamentFinished;

            this.setOfFixturesController = <SetOfFixturesControllerModel>{};

            this.setOfFixturesController.fixturesInPlay = false;
            this.setOfFixturesController.startFixturesButtonText = "Start Fixtures";

            this.setOfFixturesController.maxInjuryTime1stHalf = 0;
            this.setOfFixturesController.maxInjuryTime2ndHalf = 0;
            this.setOfFixturesController.minutesInfo = "";

            this.setOfFixturesController.fixtureUpdateInterval = this.dataService.appData.miscInfo.matchUpdateInterval;
            this.setOfFixturesController.factorBaseForRandomMultiplier = this.dataService.appData.miscInfo.factorBaseForRandomMultiplier;
            this.setOfFixturesController.factorIsItAGoal = this.dataService.appData.miscInfo.factorIsItAGoal;

            // Convert likelihood of a goal during a certain period of a match from a string to an array
            goalFactorsSource = this.dataService.appData.miscInfo.factorLikelihoodOfAGoalDuringASetPeriod;
            goalFactorsSource = goalFactorsSource.replace(/'/g, '"');         //Need to do this otherwise reading the value from local storage errors
            this.setOfFixturesController.factorLikelihoodOfAGoalDuringASetPeriod = JSON.parse("[" + goalFactorsSource + "]");

            debugger;
            this.latestFixtures = this.getNextSetOfFixtures(true);

            if (this.latestFixtures != undefined) {
                this.setOfFixturesController.dateOfThisSetOfFixtures = this.latestFixtures.dateOfSetOfFixtures;
            }

            this.setOfFixturesController.startFixturesButtonEnabled = true;           //Enable the Start Fixtures button

            for (i = 0; i < this.latestFixtures.fixtures.length; i++) {
                this.fixture = new FixtureComponent(this.dataService);
            }
        }
    }

    startSetOfFixtures(): void {
        let i: number;
        // let fixture: FixtureComponent;

        this.setOfFixturesController.fixturesInPlay = true;
        // this.setOfFixturesController.statutoryMinutes = (this.setOfFixturesController.isFirstHalf) ? 45 : 90;
        // this.setOfFixturesController.minutesPlayed = (this.setOfFixturesController.isFirstHalf) ? 0 : 45;

        debugger;

        //Set the number of injury time minutes for each fixture
        for (i = 0; i < this.latestFixtures.fixtures.length; i++) {

            // fixture = new FixtureComponent(this.dataService);
            this.fixture.startFixture();

            // this.setOfFixturesController.maxInjuryTime1stHalf = Math.max(injuryTimeHalf1, this.setOfFixturesController.maxInjuryTime1stHalf);     //Determine the match with the most injury time, to stop timer

            // this.setOfFixturesController.maxInjuryTime2ndHalf = Math.max(injuryTimeHalf2, this.setOfFixturesController.maxInjuryTime2ndHalf);     //Determine the match with the most injury time, to stop timer

            // this.latestFixtures.fixtures[i].maxNumberOfMinutes = this.setOfFixturesController.statutoryMinutes + ((this.setOfFixturesController.isFirstHalf) ? injuryTimeHalf1 : injuryTimeHalf2);
        }

        this.setOfFixturesController.maxNumberOfMinutes = (this.setOfFixturesController.isFirstHalf) ? this.setOfFixturesController.statutoryMinutes + this.setOfFixturesController.maxInjuryTime1stHalf : this.setOfFixturesController.statutoryMinutes + this.setOfFixturesController.maxInjuryTime2ndHalf;

        this.setOfFixturesController.startFixturesButtonEnabled = false;           //Disable the Start Fixtures button
    }

    private updateScores(self: this): void {
        // Cannot use this as it is an asynchronous function.  Make sure self is set to type this so that intellisense works

        debugger;

        //Check for half time or end of fixtures
        if (self.setOfFixturesController.minutesPlayed > self.setOfFixturesController.maxNumberOfMinutes) {
            self.setOfFixturesController.fixturesInPlay = false;
            if (self.setOfFixturesController.isFirstHalf) {
                self.setOfFixturesController.startFixturesButtonEnabled = true;           // Enable the Start Fixtures button
                self.setOfFixturesController.startFixturesButtonText = "Start Second Half";
            } else {
                self.setOfFixturesController.startFixturesButtonEnabled = false;           // Disable the Start Fixtures button
                self.dataService.appData.miscInfo.dateOfLastSetOfFixtures = self.setOfFixturesController.dateOfThisSetOfFixtures;
                self.dataService.appData.miscInfo.hasTournamentStarted = true;
                if (self.getNextSetOfFixtures(false).dateOfSetOfFixtures === "") self.dataService.appData.miscInfo.hasTournamentFinished = true;     //This statement needs to be after dateOfLastSetOfFixtures is set just above

                self.updateKnockoutStages();
                self.dataService.saveAppData();
            }
        } else {
            self.setOfFixturesController.minutesInfo = self.setOfFixturesController.minutesPlayed + ((self.setOfFixturesController.minutesPlayed === 1) ? " min" : " mins");
        }

    }

    private getNextSetOfFixtures(getGroups: boolean): SetOfFixturesModel {
        let i: number;
        let fixtureCounter: number;
        let setOfFixtures: SetOfFixturesModel;
        let allTournamentFixtures: AllFixturesModel;
        let setOfBlankFixtures: SetOfFixturesModel;
        let roundOf16: FixturesModel;
        let quarterFinals: FixturesModel;
        let semiFinals: FixturesModel;
        let thirdPlacePlayOff: FixturesModel;
        let final: FixturesModel;

        this.dateOfLastSetOfFixtures = this.dataService.appData.miscInfo.dateOfLastSetOfFixtures;
        allTournamentFixtures = this.dataService.appData.fixtures;

        if (this.dateOfLastSetOfFixtures === "" && !this.dataService.appData.miscInfo.hasTournamentStarted) {
            //Get the appropriate groups for this set of fixtures
            this.getGroups(true, allTournamentFixtures[0]);
            return allTournamentFixtures[0];
        } else {
            for (i = 0; i < allTournamentFixtures.length; i++) {
                if (allTournamentFixtures[i].dateOfSetOfFixtures === this.dateOfLastSetOfFixtures) {
                    if (i !== allTournamentFixtures.length - 1) {
                        if (getGroups) this.getGroups(true, allTournamentFixtures[i + 1]);
                        return allTournamentFixtures[i + 1];
                    } else {
                        this.hasGroupStageFinished = true;
                        roundOf16 = this.dataService.appData.knockoutStage.roundOf16;
                        setOfFixtures = { dateOfSetOfFixtures: '', fixtures: [] };
                        for (fixtureCounter = 0; fixtureCounter < roundOf16.length; fixtureCounter++) {
                            if (!roundOf16[fixtureCounter].hasFixtureFinished) {
                                setOfFixtures.dateOfSetOfFixtures = roundOf16[fixtureCounter].dateOfFixture;
                                setOfFixtures.fixtures.push(roundOf16[fixtureCounter]);
                                setOfFixtures.fixtures.push(roundOf16[fixtureCounter + 1]);

                                //Get the appropriate groups for this set of fixtures
                                this.getGroups(false, setOfFixtures);

                                return setOfFixtures;
                            }
                        }
                    }
                }
            }
        }
        return helpers.getEmptySetOfFixtures();
    }

    private getPositionInArrayOfObjectsThis(array, objectProperty, objectValue): number {
        //Call the function in the helpers file.  Needs to be done like this so that the function can be referenced in the html file with ngClass
        return helpers.getPositionInArrayOfObjects(array, objectProperty, objectValue);
    }

    private getGroups(isGroupStage: boolean, setOfFixtures: SetOfFixturesModel) {
        //Get the appropriate groups for this set of fixtures
        let fixtureCounter: number;

        this.groups = [];

        for (fixtureCounter = 0; fixtureCounter < setOfFixtures.fixtures.length; fixtureCounter++) {
            if (isGroupStage) {
                this.groups.push(setOfFixtures.fixtures[fixtureCounter].group)
            } else {
                this.groups.push(this.teams[helpers.getPositionInArrayOfObjects(this.teams, "country", setOfFixtures.fixtures[fixtureCounter].country1)].group);
                this.groups.push(this.teams[helpers.getPositionInArrayOfObjects(this.teams, "country", setOfFixtures.fixtures[fixtureCounter].country2)].group);
            }
        }

        //Get the unique group values
        this.groups = Array.from(new Set(this.groups));

        //Sort the groups
        this.groups.sort();
    }

    private updateKnockoutStages(): void {
        let fixtureCounter: number;
        let roundOf16: FixturesModel;
        let quarterFinals: FixturesModel;
        let semiFinals: FixturesModel;
        let thirdPlacePlayOff: FixturesModel;
        let final: FixturesModel;
        let groupTables: GroupTablesModel;

        debugger;

        roundOf16 = this.dataService.appData.knockoutStage.roundOf16;

        if (!this.hasGroupStageFinished) {

            groupTables = this.dataService.appData.groupTables;

            for (fixtureCounter = 0; fixtureCounter < roundOf16.length; fixtureCounter++) {
                roundOf16[0].country1 = groupTables[2].tables[0].country;
                roundOf16[0].country2 = groupTables[3].tables[1].country;
                roundOf16[1].country1 = groupTables[0].tables[0].country;
                roundOf16[1].country2 = groupTables[1].tables[1].country;
                roundOf16[2].country1 = groupTables[4].tables[0].country;
                roundOf16[2].country2 = groupTables[5].tables[1].country;
                roundOf16[3].country1 = groupTables[6].tables[0].country;
                roundOf16[3].country2 = groupTables[7].tables[1].country;
                roundOf16[4].country1 = groupTables[1].tables[0].country;
                roundOf16[4].country2 = groupTables[0].tables[1].country;
                roundOf16[5].country1 = groupTables[3].tables[0].country;
                roundOf16[5].country2 = groupTables[2].tables[1].country;
                roundOf16[6].country1 = groupTables[5].tables[0].country;
                roundOf16[6].country2 = groupTables[4].tables[1].country;
                roundOf16[7].country1 = groupTables[7].tables[0].country;
                roundOf16[7].country2 = groupTables[6].tables[1].country;
            }
        }

        quarterFinals = this.dataService.appData.knockoutStage.quarterFinals;
        for (fixtureCounter = 0; fixtureCounter < quarterFinals.length; fixtureCounter++) {
            if (roundOf16[0].hasFixtureFinished) quarterFinals[0].country1 = (roundOf16[0].country1Score > roundOf16[0].country2Score) ? roundOf16[0].country1 : roundOf16[0].country2;
            if (roundOf16[1].hasFixtureFinished) quarterFinals[0].country2 = (roundOf16[1].country1Score > roundOf16[1].country2Score) ? roundOf16[1].country1 : roundOf16[1].country2;
            if (roundOf16[2].hasFixtureFinished) quarterFinals[1].country1 = (roundOf16[2].country1Score > roundOf16[2].country2Score) ? roundOf16[2].country1 : roundOf16[2].country2;
            if (roundOf16[3].hasFixtureFinished) quarterFinals[1].country2 = (roundOf16[3].country1Score > roundOf16[3].country2Score) ? roundOf16[3].country1 : roundOf16[3].country2;
            if (roundOf16[4].hasFixtureFinished) quarterFinals[2].country1 = (roundOf16[4].country1Score > roundOf16[4].country2Score) ? roundOf16[4].country1 : roundOf16[4].country2;
            if (roundOf16[5].hasFixtureFinished) quarterFinals[2].country2 = (roundOf16[5].country1Score > roundOf16[5].country2Score) ? roundOf16[5].country1 : roundOf16[5].country2;
            if (roundOf16[6].hasFixtureFinished) quarterFinals[3].country1 = (roundOf16[6].country1Score > roundOf16[6].country2Score) ? roundOf16[6].country1 : roundOf16[6].country2;
            if (roundOf16[7].hasFixtureFinished) quarterFinals[3].country2 = (roundOf16[7].country1Score > roundOf16[7].country2Score) ? roundOf16[7].country1 : roundOf16[7].country2;
        }

        semiFinals = this.dataService.appData.knockoutStage.semiFinals;
        for (fixtureCounter = 0; fixtureCounter < semiFinals.length; fixtureCounter++) {
            if (quarterFinals[0].hasFixtureFinished) semiFinals[0].country1 = (quarterFinals[0].country1Score > quarterFinals[0].country2Score) ? quarterFinals[0].country1 : quarterFinals[0].country2;
            if (quarterFinals[1].hasFixtureFinished) semiFinals[0].country2 = (quarterFinals[1].country1Score > quarterFinals[1].country2Score) ? quarterFinals[1].country1 : quarterFinals[1].country2;
            if (quarterFinals[2].hasFixtureFinished) semiFinals[1].country1 = (quarterFinals[2].country1Score > quarterFinals[2].country2Score) ? quarterFinals[2].country1 : quarterFinals[2].country2;
            if (quarterFinals[3].hasFixtureFinished) semiFinals[1].country2 = (quarterFinals[3].country1Score > quarterFinals[3].country2Score) ? quarterFinals[3].country1 : quarterFinals[3].country2;
        }

        thirdPlacePlayOff = this.dataService.appData.knockoutStage.thirdPlacePlayOff;
        if (semiFinals[0].hasFixtureFinished) thirdPlacePlayOff[0].country1 = (semiFinals[0].country1Score > semiFinals[0].country2Score) ? semiFinals[0].country2 : semiFinals[0].country1;
        if (semiFinals[1].hasFixtureFinished) thirdPlacePlayOff[0].country2 = (semiFinals[1].country1Score > semiFinals[1].country2Score) ? semiFinals[1].country2 : semiFinals[1].country1;

        final = this.dataService.appData.knockoutStage.final;
        if (semiFinals[0].hasFixtureFinished) final[0].country1 = (semiFinals[0].country1Score > semiFinals[0].country2Score) ? semiFinals[0].country1 : semiFinals[0].country2;
        if (semiFinals[1].hasFixtureFinished) final[0].country2 = (semiFinals[1].country1Score > semiFinals[1].country2Score) ? semiFinals[1].country1 : semiFinals[1].country2;
    }

}
