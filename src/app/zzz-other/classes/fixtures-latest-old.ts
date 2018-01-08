// export class FixturesLatestOld {
// }

import { DataService } from '../zzz-other/services/data.service';
import { TeamsModel, FixtureModel, FixturesModel, AllFixturesModel, SetOfFixturesModel, GroupTablesModel, TableModel, SetOfFixturesControllerModel, KnockoutModel } from './../zzz-other/interfaces/interfaces';
import * as helpers from '../zzz-other/helper-functions/helpers';
import { Component, OnInit } from '@angular/core';
import { debug } from 'util';

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

    public haveFixturesBeenCreated: boolean;
    public hasGroupStageFinished: boolean;
    private teams: TeamsModel;
    public allTournamentFixtures: AllFixturesModel;
    public latestFixtures: SetOfFixturesModel;
    public tablesBeforeFixtures: GroupTablesModel;
    public tablesInPlay: GroupTablesModel;
    public groups: string[];
    private dateOfLastSetOfFixtures: string;

    public setOfFixturesController: SetOfFixturesControllerModel;

    private progressMatches;

    private tableTypeInPlay: boolean;                         // Required by the HTML - also used by fixtures-latest.component (i.e. in the html call)
    public hasTournamentFinished: boolean;


    constructor(public dataService: DataService) { }

    ngOnInit() {
        let goalFactorsSource: string;
        let fixtureCounter: number;

        this.teams = this.dataService.appData.teams;
        this.allTournamentFixtures = this.dataService.appData.fixtures;
        this.haveFixturesBeenCreated = (this.allTournamentFixtures.length > 0);
        this.dateOfLastSetOfFixtures = this.dataService.appData.miscInfo.dateOfLastSetOfFixtures;
        this.tablesBeforeFixtures = this.dataService.appData.groupTables;

        this.hasTournamentFinished = this.dataService.appData.miscInfo.hasTournamentFinished;
        this.hasGroupStageFinished = this.dataService.appData.miscInfo.hasGroupStageFinished;

        if (this.dataService.haveSeasonsFixturesBeenCreated()) {

            this.setOfFixturesController = <SetOfFixturesControllerModel>{};

            this.setOfFixturesController.fixturesInPlay = false;
            this.setOfFixturesController.isFirstHalf = true;
            this.setOfFixturesController.startFixturesButtonText = "Start Fixtures";
            this.setOfFixturesController.versusBetweenTeams = "v";

            this.setOfFixturesController.maxInjuryTime1stHalf = 0;
            this.setOfFixturesController.maxInjuryTime2ndHalf = 0;
            this.setOfFixturesController.minutesInfo = "";

            this.setOfFixturesController.matchUpdateInterval = this.dataService.appData.miscInfo.matchUpdateInterval;
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
                // this.formattedDateOfFixtures = helpers.formatDate(this.latestFixtures.dateOfSetOfFixtures);
                debugger;
                this.setFixturesDefaults("");

                if (!this.hasGroupStageFinished) {
                    this.setupInPlayTables();
                }
            }

            this.setOfFixturesController.startFixturesButtonEnabled = true;           //Enable the Start Fixtures button
        }
    }

    startSetOfFixtures(): void {
        let i: number;
        let injuryTimeHalf1: number;
        let injuryTimeHalf2: number;

        debugger;

        this.setOfFixturesController.fixturesInPlay = true;
        this.setOfFixturesController.versusBetweenTeams = "";
        this.setOfFixturesController.statutoryMinutes = (this.setOfFixturesController.isFirstHalf) ? 45 : 90;
        this.setOfFixturesController.minutesPlayed = (this.setOfFixturesController.isFirstHalf) ? 0 : 45;

        //Set the number of injury time minutes for each fixture
        for (i = 0; i < this.latestFixtures.fixtures.length; i++) {

            if (this.setOfFixturesController.isFirstHalf) this.setFixturesDefaults(0);

            injuryTimeHalf1 = Math.floor(Math.random() * EXTRA_MINUTES_FIRST_HALF + 1);
            this.latestFixtures.fixtures[i].injuryTime1stHalf = injuryTimeHalf1;
            this.setOfFixturesController.maxInjuryTime1stHalf = Math.max(injuryTimeHalf1, this.setOfFixturesController.maxInjuryTime1stHalf);     //Determine the match with the most injury time, to stop timer

            injuryTimeHalf2 = Math.floor(Math.random() * EXTRA_MINUTES_SECOND_HALF + 1);
            this.latestFixtures.fixtures[i].injuryTime2ndHalf = injuryTimeHalf2;
            this.setOfFixturesController.maxInjuryTime2ndHalf = Math.max(injuryTimeHalf2, this.setOfFixturesController.maxInjuryTime2ndHalf);     //Determine the match with the most injury time, to stop timer

            this.latestFixtures.fixtures[i].maxNumberOfMinutes = this.setOfFixturesController.statutoryMinutes + ((this.setOfFixturesController.isFirstHalf) ? injuryTimeHalf1 : injuryTimeHalf2);
        }

        this.setOfFixturesController.maxNumberOfMinutes = (this.setOfFixturesController.isFirstHalf) ? this.setOfFixturesController.statutoryMinutes + this.setOfFixturesController.maxInjuryTime1stHalf : this.setOfFixturesController.statutoryMinutes + this.setOfFixturesController.maxInjuryTime2ndHalf;

        this.setOfFixturesController.startFixturesButtonEnabled = false;           //Disable the Start Fixtures button

        if (!this.hasGroupStageFinished) {
            this.updateInPlayTables();
        }

        // Name of the function and Update interval are both required
        this.progressMatches = setInterval(this.updateScores, this.setOfFixturesController.matchUpdateInterval * 1000, this)
    }

    private updateScores(self: this): void {
        // Cannot use this as it is an asynchronous function.  Make sure self is set to type this so that intellisense works
        let updateTable: boolean;
        let minutesinMatchFactor: number = 0;
        let fixtureCounter: number = 0;
        let goalFactors: any[];

        goalFactors = self.setOfFixturesController.factorLikelihoodOfAGoalDuringASetPeriod;

        for (let i = 0; i < goalFactors[0].length; i++) {
            if (self.setOfFixturesController.minutesPlayed <= goalFactors[0][i].minutes) {
                minutesinMatchFactor = self.setOfFixturesController.factorBaseForRandomMultiplier * goalFactors[0][i].factor;
                break;
            }
        }

        updateTable = false;

        self.setOfFixturesController.minutesPlayed++;

        debugger;

        for (fixtureCounter = 0; fixtureCounter < self.latestFixtures.fixtures.length; fixtureCounter++) {

            if (self.setOfFixturesController.minutesPlayed <= self.latestFixtures.fixtures[fixtureCounter].maxNumberOfMinutes) {
                if (self.hasTeamScored("1", self, fixtureCounter, minutesinMatchFactor) && !updateTable) updateTable = true;
                if (self.hasTeamScored("2", self, fixtureCounter, minutesinMatchFactor) && !updateTable) updateTable = true;
                debugger;
                self.latestFixtures.fixtures[fixtureCounter].minutesPlayed++;
                self.latestFixtures.fixtures[fixtureCounter].minutesInfo = self.latestFixtures.fixtures[fixtureCounter].minutesPlayed + ((self.latestFixtures.fixtures[fixtureCounter].minutesPlayed === 1) ? " min" : " mins");
                // if (self.setOfFixturesController.isFirstHalf) {
                if (self.latestFixtures.fixtures[fixtureCounter].minutesPlayed > self.latestFixtures.fixtures[fixtureCounter].maxNumberOfMinutes) {
                    if (self.latestFixtures.fixtures[fixtureCounter].isFirstHalf) {
                        self.latestFixtures.fixtures[fixtureCounter].minutesInfo = "Half-Time";
                        self.latestFixtures.fixtures[fixtureCounter].isFirstHalf = false;
                    }
                }
            } else {
                self.latestFixtures.fixtures[fixtureCounter].minutesInfo = self.latestFixtures.fixtures[fixtureCounter].minutesPlayed + ((self.latestFixtures.fixtures[fixtureCounter].minutesPlayed === 1) ? " min" : " mins");
            }
        }

        if (!self.hasGroupStageFinished && updateTable) self.updateInPlayTables();

        //Check for half time or end of fixtures
        if (self.setOfFixturesController.minutesPlayed > self.setOfFixturesController.maxNumberOfMinutes) {
            clearInterval(self.progressMatches);     //Clear the timer
            self.setOfFixturesController.fixturesInPlay = false;
            if (self.setOfFixturesController.isFirstHalf) {
                self.setOfFixturesController.minutesInfo = "Half-Time";
                self.setOfFixturesController.isFirstHalf = false;
                self.setOfFixturesController.startFixturesButtonEnabled = true;           // Enable the Start Fixtures button
                self.setOfFixturesController.startFixturesButtonText = "Start Second Half";
            } else {
                self.setOfFixturesController.minutesInfo = "Full-Time";
                self.setOfFixturesController.startFixturesButtonEnabled = false;           // Disable the Start Fixtures button
                debugger;
                self.dataService.appData.miscInfo.dateOfLastSetOfFixtures = self.setOfFixturesController.dateOfThisSetOfFixtures;
                // self.dataService.appData.groupTables = self.tablesInPlay;
                self.dataService.appData.miscInfo.hasTournamentStarted = true;
                if (self.getNextSetOfFixtures(false).dateOfSetOfFixtures === "") self.dataService.appData.miscInfo.hasTournamentFinished = true;     //This statement needs to be after dateOfLastSetOfFixtures is set just above

                for (fixtureCounter = 0; fixtureCounter < self.latestFixtures.fixtures.length; fixtureCounter++) {
                    self.latestFixtures.fixtures[fixtureCounter].hasFixtureFinished = true;
                }

                self.updateKnockoutStages();
                self.dataService.saveAppData();
            }
        } else {
            self.setOfFixturesController.minutesInfo = self.setOfFixturesController.minutesPlayed + ((self.setOfFixturesController.minutesPlayed === 1) ? " min" : " mins");
        }

    }

    private hasTeamScored(whichTeam: string, self: this, fixtureCounter: number, minutesinMatchFactor: number): boolean {
        let thisTeam: string;
        let awayTeamFactor: number;
        let isNotATopTeamFactor: number;
        let isItAGoalFactor: number;
        let oddsFactor: number;

        thisTeam = self.latestFixtures.fixtures[fixtureCounter]["country" + whichTeam];

        isItAGoalFactor = self.setOfFixturesController.factorIsItAGoal;

        oddsFactor = 1 + (self.dataService.appData.teams[helpers.getPositionInArrayOfObjects(self.dataService.appData.teams, "country", thisTeam)].odds) / 100;
        self.latestFixtures.fixtures[fixtureCounter]["country" + whichTeam + "Odds"] = minutesinMatchFactor * oddsFactor;

        // Has a goal been scored
        if (Math.floor(Math.random() * minutesinMatchFactor * oddsFactor) < isItAGoalFactor) {
            self.latestFixtures.fixtures[fixtureCounter]["country" + whichTeam + "Score"] += 1;

            if (self.setOfFixturesController.minutesPlayed > self.setOfFixturesController.statutoryMinutes) {
                self.latestFixtures.fixtures[fixtureCounter]["country" + whichTeam + "Goals"] += self.setOfFixturesController.statutoryMinutes.toString() + "(+" + (self.setOfFixturesController.minutesPlayed - self.setOfFixturesController.statutoryMinutes).toString() + ")  ";
            } else {
                self.latestFixtures.fixtures[fixtureCounter]["country" + whichTeam + "Goals"] += self.setOfFixturesController.minutesPlayed + "  ";
            }
            return true;        // return true to update table and re-display
        }
        return false;
    }

    private setFixturesDefaults(scoresValue: any): void {
        let i: number;

        for (i = 0; i < this.latestFixtures.fixtures.length; i++) {
            this.latestFixtures.fixtures[i].country1Score = scoresValue;
            this.latestFixtures.fixtures[i].country2Score = scoresValue;
            this.latestFixtures.fixtures[i].country1Goals = "";
            this.latestFixtures.fixtures[i].country2Goals = "";
            this.latestFixtures.fixtures[i].minutesPlayed = 0;
            this.latestFixtures.fixtures[i].minutesInfo = '';
            this.latestFixtures.fixtures[i].isFirstHalf = true;
        }
    }

    private updateInPlayTables(): void {
        let fixtureCounter: number;
        let teamCounter: number;
        let groupCounter: number;
        let thisTeam: string;
        let country1: string;
        let country2: string;
        let country1Score: number;
        let country2Score: number;
        let indexBeforeFixtures: number;
        let indexInPlay: number;
        let fixture: FixtureModel;
        let team: TableModel;
        let teamInPlay: TableModel;
        let groupIndex: number;
        let tableIndex: number;

        for (fixtureCounter = 0; fixtureCounter < this.latestFixtures.fixtures.length; fixtureCounter++) {

            fixture = this.latestFixtures.fixtures[fixtureCounter];
            country1 = fixture.country1;
            country2 = fixture.country2;
            country1Score = fixture.country1Score;
            country2Score = fixture.country2Score;

            for (teamCounter = 0; teamCounter <= 1; teamCounter++) {

                thisTeam = (teamCounter === 0) ? country1 : country2;

                groupIndex = helpers.getPositionInArrayOfObjects(this.dataService.appData.groupTables, "group", fixture.group);
                indexBeforeFixtures = helpers.getPositionInArrayOfObjects(this.dataService.appData.groupTables[groupIndex].tables, "country", thisTeam);
                indexInPlay = helpers.getPositionInArrayOfObjects(this.tablesInPlay[groupIndex].tables, "country", thisTeam);

                team = this.dataService.appData.groupTables[groupIndex].tables[indexBeforeFixtures];
                teamInPlay = this.tablesInPlay[groupIndex].tables[indexInPlay];

                teamInPlay.played = team.played + 1;

                teamInPlay.won = team.won;
                teamInPlay.drawn = team.drawn;
                teamInPlay.lost = team.lost;

                teamInPlay.points = team.points;

                if (teamCounter === 0) {

                    if (country1Score > country2Score) {
                        teamInPlay.won++;
                        teamInPlay.points += 3;
                    }

                    if (country1Score === country2Score) {
                        teamInPlay.drawn++;
                        teamInPlay.points += 1;
                    }

                    if (country1Score < country2Score) {
                        teamInPlay.lost++;
                    }

                    teamInPlay.goalsFor = team.goalsFor + country1Score;
                    teamInPlay.goalsAgainst = team.goalsAgainst + country2Score;
                    teamInPlay.goalDifference = team.goalDifference + country1Score - country2Score;

                } else {

                    if (country2Score > country1Score) {
                        teamInPlay.won++;
                        teamInPlay.points += 3;
                    }

                    if (country2Score === country1Score) {
                        teamInPlay.drawn++;
                        teamInPlay.points += 1;
                    }

                    if (country2Score < country1Score) {
                        teamInPlay.lost++;
                    }

                    teamInPlay.goalsFor = team.goalsFor + country2Score;
                    teamInPlay.goalsAgainst = team.goalsAgainst + country1Score;
                    teamInPlay.goalDifference = team.goalDifference + country2Score - country1Score;
                }

            }
        }

        for (groupCounter = 0; groupCounter < this.groups.length; groupCounter++) {
            tableIndex = helpers.getPositionInArrayOfObjects(this.tablesInPlay, "group", this.groups[groupCounter]);
            helpers.sortTable(this.tablesInPlay[tableIndex].tables);
        }
    }

    private setupInPlayTables(): void {
        //Deep clone the array
        this.tablesInPlay = JSON.parse(JSON.stringify(this.dataService.appData.groupTables));
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

