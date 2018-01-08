import { DataService } from '../services/data.service';
import { TeamsModel, FixtureModel, SetOfFixturesControllerModel, TableModel, TablesModel } from '../interfaces/interfaces';
import * as helpers from '../helper-functions/helpers';

const EXTRA_MINUTES_FIRST_HALF = 5;
const EXTRA_MINUTES_SECOND_HALF = 9;
const EXTRA_MINUTES_EXTRA_TIME_FIRST_HALF = 2;
const EXTRA_MINUTES_EXTRA_TIME_SECOND_HALF = 3;

export class Fixture {

    public injuryTimeFirstHalf: number;
    public injuryTimeSecondHalf: number;
    public injuryTimeExtraTimeFirstHalf: number;
    public injuryTimeExtraTimeSecondHalf: number;

    private teams: TeamsModel;
    private tableAtStart: TablesModel;
    private tableInPlay: TablesModel;
    private hasGroupStageFinished: boolean;
    private progressMatches;


    constructor(private dataService: DataService,
        private setOfFixturesController: SetOfFixturesControllerModel,
        private fixture: FixtureModel) {

        this.teams = this.dataService.appData.teams;
        this.hasGroupStageFinished = this.dataService.appData.miscInfo.hasGroupStageFinished;

        this.fixture.minutesPlayed = 0;
        this.fixture.minutesInfo = '';

        this.fixture.isFirstHalf = true;
        this.fixture.isExtraTime = false;
        this.fixture.hasFixtureFinished = false;
    }

    startFixture(): void {

        debugger;

        if (!this.hasGroupStageFinished) {
            this.getTables();
        }

        if (this.fixture.isFirstHalf) {
            this.fixture.country1Score = 0;
            this.fixture.country2Score = 0;
        }

        this.fixture.statutoryMinutes = (this.fixture.isFirstHalf) ? 45 : 90;
        this.fixture.minutesPlayed = (this.fixture.isFirstHalf) ? 0 : 45;

        this.injuryTimeFirstHalf = Math.floor(Math.random() * EXTRA_MINUTES_FIRST_HALF + 1);
        this.fixture.injuryTime1stHalf = this.injuryTimeFirstHalf;

        this.injuryTimeSecondHalf = Math.floor(Math.random() * EXTRA_MINUTES_SECOND_HALF + 1);
        this.fixture.injuryTime2ndHalf = this.injuryTimeSecondHalf;

        this.fixture.maxNumberOfMinutes = this.fixture.statutoryMinutes + ((this.fixture.isFirstHalf) ? this.injuryTimeFirstHalf : this.injuryTimeSecondHalf);

        if (!this.hasGroupStageFinished) {
            this.updateInPlayTable();
        }

        // Name of the function and Update interval are both required
        this.progressMatches = setInterval(this.updateScores, this.setOfFixturesController.fixtureUpdateInterval * 1000, this)
    }

    private updateScores(self: this): void {
        // Cannot use this as it is an asynchronous function.  Make sure self is set to type this so that intellisense works
        let updateTable: boolean;
        let minutesinMatchFactor: number;
        let goalFactors: any[];

        goalFactors = self.setOfFixturesController.factorLikelihoodOfAGoalDuringASetPeriod;

        minutesinMatchFactor = 0;

        for (let i = 0; i < goalFactors[0].length; i++) {
            if (self.fixture.minutesPlayed <= goalFactors[0][i].minutes) {
                minutesinMatchFactor = self.setOfFixturesController.factorBaseForRandomMultiplier * goalFactors[0][i].factor;
                break;
            }
        }

        self.fixture.minutesPlayed++;

        debugger;

        updateTable = false;

        if (self.fixture.minutesPlayed <= self.fixture.maxNumberOfMinutes) {
            if (self.hasTeamScored("1", self, minutesinMatchFactor) && !updateTable) updateTable = true;
            if (self.hasTeamScored("2", self, minutesinMatchFactor) && !updateTable) updateTable = true;
        }

        if (!self.hasGroupStageFinished && updateTable) self.updateInPlayTable();

        //Check for half time or end of fixtures
        if (self.fixture.minutesPlayed > self.fixture.maxNumberOfMinutes) {
            clearInterval(self.progressMatches);     //Clear the timer
            // self.setOfFixturesController.fixturesInPlay = false;
            if (self.fixture.isFirstHalf) {
                self.fixture.minutesInfo = "Half-Time";
                self.fixture.isFirstHalf = false;
            } else {
                self.fixture.minutesInfo = "Full-Time";
                self.fixture.hasFixtureFinished = true;
            }
        } else {
            self.fixture.minutesInfo = self.fixture.minutesPlayed + ((self.fixture.minutesPlayed === 1) ? " min" : " mins");
        }

    }

    private hasTeamScored(whichTeam: string, self: this, minutesinMatchFactor: number): boolean {
        let thisTeam: string;
        let isItAGoalFactor: number;
        let oddsFactor: number;

        thisTeam = self.fixture["country" + whichTeam];

        isItAGoalFactor = self.setOfFixturesController.factorIsItAGoal;

        oddsFactor = 1 + (self.dataService.appData.teams[helpers.getPositionInArrayOfObjects(self.dataService.appData.teams, "country", thisTeam)].odds) / 100;
        self.fixture["country" + whichTeam + "Odds"] = minutesinMatchFactor * oddsFactor;

        // Has a goal been scored
        if (Math.floor(Math.random() * minutesinMatchFactor * oddsFactor) < isItAGoalFactor) {
            self.fixture["country" + whichTeam + "Score"] += 1;

            if (self.fixture.minutesPlayed > self.fixture.statutoryMinutes) {
                self.fixture["country" + whichTeam + "Goals"] += self.fixture.statutoryMinutes.toString() + "(+" + (self.fixture.minutesPlayed - self.fixture.statutoryMinutes).toString() + ")  ";
            } else {
                self.fixture["country" + whichTeam + "Goals"] += self.fixture.minutesPlayed + "  ";
            }
            return true;        // return true to update table and re-display
        }
        return false;
    }

    private updateInPlayTable(): void {
        let teamCounter: number;
        let thisTeam: string;
        let country1: string;
        let country2: string;
        let country1Score: number;
        let country2Score: number;
        let indexAtStart: number;
        let indexInPlay: number;
        let team: TableModel;
        let teamInPlay: TableModel;
        let groupIndex: number;
        let tableIndex: number;

        country1 = this.fixture.country1;
        country2 = this.fixture.country2;
        country1Score = this.fixture.country1Score;
        country2Score = this.fixture.country2Score;

        for (teamCounter = 0; teamCounter <= 1; teamCounter++) {

            thisTeam = (teamCounter === 0) ? country1 : country2;

            indexAtStart = helpers.getPositionInArrayOfObjects(this.tableAtStart, "country", thisTeam);
            indexInPlay = helpers.getPositionInArrayOfObjects(this.tableInPlay, "country", thisTeam);

            team = this.tableAtStart[indexAtStart];
            teamInPlay = this.tableInPlay[indexInPlay];

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

        helpers.sortTable(this.tableInPlay);
    }

    private getTables(): void {
        let groupIndex: number;

        groupIndex = helpers.getPositionInArrayOfObjects(this.dataService.appData.groupTables, "group", this.fixture.group);

        //Get the table before the fixture starts
        this.tableAtStart = this.dataService.appData.groupTables[groupIndex].tables;

        //Deep clone the array ... this will be used to update the table in play
        this.tableInPlay = JSON.parse(JSON.stringify(this.dataService.appData.groupTables[groupIndex].tables));
    }


}
