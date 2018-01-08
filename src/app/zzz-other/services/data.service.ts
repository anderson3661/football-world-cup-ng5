import { DialogComponent } from './../../dialog/dialog.component';
import { TeamsModel, AllFixturesModel, SetOfFixturesModel, KnockoutModel, TablesModel, GroupTablesModel, AppDataModel } from '../interfaces/interfaces';
import * as helpers from '../helper-functions/helpers';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';


const APP_DATA_LOCAL_STORAGE = "worldCup_AppInfo";

const TEAMS_DEFAULT = [
    { country: "Russia", abbreviation: "RUS", group: "A", odds: 1 },
    { country: "Saudi Arabia", abbreviation: "KSA", group: "A", odds: 1 },
    { country: "Egypt", abbreviation: "EGY", group: "A", odds: 1 },
    { country: "Uruguay", abbreviation: "URU", group: "A", odds: 1 },
    { country: "Portugal", abbreviation: "POR", group: "B", odds: 1 },
    { country: "Spain", abbreviation: "SPA", group: "B", odds: 1 },
    { country: "Morocco", abbreviation: "MOR", group: "B", odds: 1 },
    { country: "Iran", abbreviation: "IRN", group: "B", odds: 1 },
    { country: "France", abbreviation: "FRA", group: "C", odds: 1 },
    { country: "Australia", abbreviation: "AUS", group: "C", odds: 1 },
    { country: "Peru", abbreviation: "PER", group: "C", odds: 1 },
    { country: "Denmark", abbreviation: "DEN", group: "C", odds: 1 },
    { country: "Argentina", abbreviation: "ARG", group: "D", odds: 1 },
    { country: "Iceland", abbreviation: "ICE", group: "D", odds: 1 },
    { country: "Croatia", abbreviation: "CRO", group: "D", odds: 1 },
    { country: "Nigeria", abbreviation: "NGA", group: "D", odds: 1 },
    { country: "Brazil", abbreviation: "BRZ", group: "E", odds: 1 },
    { country: "Switzerland", abbreviation: "SWI", group: "E", odds: 1 },
    { country: "Costa Rica", abbreviation: "CRC", group: "E", odds: 1 },
    { country: "Serbia", abbreviation: "SER", group: "E", odds: 1 },
    { country: "Germany", abbreviation: "GER", group: "F", odds: 1 },
    { country: "Mexico", abbreviation: "MEX", group: "F", odds: 1 },
    { country: "Sweden", abbreviation: "SWE", group: "F", odds: 1 },
    { country: "South Korea", abbreviation: "KOR", group: "F", odds: 1 },
    { country: "Belgium", abbreviation: "BEL", group: "G", odds: 1 },
    { country: "Panama", abbreviation: "PAN", group: "G", odds: 1 },
    { country: "Tunisia", abbreviation: "TUN", group: "G", odds: 1 },
    { country: "England", abbreviation: "ENG", group: "G", odds: 1 },
    { country: "Poland", abbreviation: "POL", group: "H", odds: 1 },
    { country: "Senegal", abbreviation: "SEN", group: "H", odds: 1 },
    { country: "Columbia", abbreviation: "COL", group: "H", odds: 1 },
    { country: "Japan", abbreviation: "JPN", group: "H", odds: 1 }
]

const GROUPS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBER_OF_TEAMS = 32;
const NUMBER_OF_GROUPS = 8;
// const MATCH_UPDATE_INTERVAL = 1;
const MATCH_UPDATE_INTERVAL = 0.25;
const FACTOR_BASE_FOR_RANDOM_MULTIPLIER = 90;
const FACTOR_GOALS_PER_MINUTE = "[{'minutes': 30, 'factor': 1.8}, {'minutes': 80, 'factor': 1.2}, {'minutes': 120, 'factor': 1}]";
const FACTOR_IS_IT_A_GOAL = 2;


@Injectable()
export class DataService {

    public appData: AppDataModel;

    constructor(public dialog: MatDialog) {
        this.appData = <AppDataModel>{};
        debugger;
        this.getAppData();
    }

    public saveAppData(confirmSaveMessage?: boolean): void {
        localStorage.setItem(APP_DATA_LOCAL_STORAGE, JSON.stringify(this.appData));
        if (confirmSaveMessage) this.confirmationMessage("Changes saved");        
    }

    // resetSeason(): boolean {
    //     if (confirm("Are you sure you want to reset the season ?")) {
    //         this.setAppData(false);
    //         return true;
    //     }
    //     return false;
    // }

    private getAppData(): void {
        let appDataFromLocalStorage: string = "";

        if (typeof (Storage) !== "undefined") {

            appDataFromLocalStorage = localStorage.getItem(APP_DATA_LOCAL_STORAGE);

            if (appDataFromLocalStorage === null) {

                this.confirmNewGame("Do you want to create a new game ?", APP_DATA_LOCAL_STORAGE + " not found in local storage");
                
                // if (confirm(APP_DATA_LOCAL_STORAGE + " not found in local storage ... do you want to create a new game ?")) {
                //     this.setAppData(true);
                // } else {
                //     return null;
                // }

            } else {

                this.appData = JSON.parse(appDataFromLocalStorage);

                if (this.appData.miscInfo.tournamentYear === null) {
                    this.confirmationMessage("Cannot continue ... 'Season' property is blank in local storage item " + APP_DATA_LOCAL_STORAGE);                    
                    // alert("Cannot continue ... 'Season' property is blank in local storage item " + APP_DATA_LOCAL_STORAGE);
                    return null;
                }
            }

        } else {
            this.confirmationMessage("Sorry ... cannot use this application because your browser doesn't support local storage");            
            // alert("Sorry ... cannot use this application because your browser doesn't support local storage");
            return null;
        }
    }

    public setAppData(useDefaults: boolean): void {
        this.appData.teams = TEAMS_DEFAULT;
        for (let index = 1; index <= this.appData.teams.length; index++) {
            this.appData.teams[index - 1].odds = index * 2;
            if (index%4 === 0) this.appData.teams[index - 1].odds = index * 5;
            if (index%3 === 0) this.appData.teams[index - 1].odds = index * 10;
        }

        this.appData.fixtures = [];
        this.createKnockoutStages();
        this.appData.groupTables = <GroupTablesModel>{};

        if (useDefaults) {
            this.appData.miscInfo = {
                // tournamentYear: new Date().getFullYear().toString(),
                tournamentYear: "2018",
                // tournamentStartDate: new Date().toDateString(),
                tournamentStartDate: "Thu Jun 14 2018",
                numberOfTeams: NUMBER_OF_TEAMS,
                numberOfGroups: NUMBER_OF_GROUPS,
                groups: GROUPS.substr(0, NUMBER_OF_GROUPS).split(""),
                dateOfLastSetOfFixtures: '',
                factorBaseForRandomMultiplier: FACTOR_BASE_FOR_RANDOM_MULTIPLIER,
                factorOdds: 0,
                factorLikelihoodOfAGoalDuringASetPeriod: FACTOR_GOALS_PER_MINUTE,
                factorIsItAGoal: FACTOR_IS_IT_A_GOAL,
                matchUpdateInterval: MATCH_UPDATE_INTERVAL,
                hasTournamentStarted: false,
                hasGroupStageFinished: false,
                hasTournamentFinished: false,
                canDisplayRoundOf16: false,
                canDisplayQuarterFinals: false,
                canDisplaySemiFinals: false,
                canDisplayFinals: false
            };
        } else {
            this.appData.miscInfo.dateOfLastSetOfFixtures = '';
            this.appData.miscInfo.hasTournamentStarted = false;
            this.appData.miscInfo.hasGroupStageFinished = false;
            this.appData.miscInfo.hasTournamentFinished = false;
        }

        this.createGroupTables();
        this.saveAppData();
    }

    public createGroupTables(): void {
        //Populate the table array with blank values
        let teamIndex: number;
        let groupIndex: number;
        let teamsPerGroup: number;
        let grouptable: TablesModel;

        this.appData.groupTables = [];

        teamsPerGroup = this.appData.miscInfo.numberOfTeams / this.appData.miscInfo.numberOfGroups;

        for (groupIndex = 0; groupIndex < this.appData.miscInfo.numberOfGroups; groupIndex++) {

            grouptable = [];

            for (teamIndex = 0; teamIndex < teamsPerGroup; teamIndex++) {

                grouptable.push({
                    country: this.appData.teams[teamIndex + (teamsPerGroup * groupIndex)].country,
                    played: 0,
                    won: 0,
                    drawn: 0,
                    lost: 0,
                    goalsFor: 0,
                    goalsAgainst: 0,
                    goalDifference: 0,
                    points: 0
                });
            }

            helpers.sortTable(grouptable);

            this.appData.groupTables.push({
                group: this.appData.miscInfo.groups[groupIndex],
                tables: grouptable
            });

            
        }
    }

    public haveSeasonsFixturesBeenCreated(): boolean {
        // Called from various places to see if the season's fixtures have been created
        return (this.appData.fixtures.length !== undefined && this.appData.fixtures.length > 0)        
        // if (this.appData.fixtures.length === 0) {
        //     alert("Cannot continue ... please create fixtures for the season via Administration");
        //     return false;
        // }
        // return true;
    }

    private createKnockoutStages() {
        
        this.appData.knockoutStage = {
            roundOf16: [],
            quarterFinals: [],
            semiFinals: [],
            thirdPlacePlayOff: [],
            final: []
        };

        this.appData.knockoutStage.roundOf16.push({ group: '', dateOfFixture: '', timeOfFixture: '15:00', country1: 'C1', country2: 'D2' });
        this.appData.knockoutStage.roundOf16.push({ group: '', dateOfFixture: '', timeOfFixture: '19:00', country1: 'A1', country2: 'B2' });
        this.appData.knockoutStage.roundOf16.push({ group: '', dateOfFixture: '', timeOfFixture: '15:00', country1: 'E1', country2: 'F2' });
        this.appData.knockoutStage.roundOf16.push({ group: '', dateOfFixture: '', timeOfFixture: '19:00', country1: 'G1', country2: 'H2' });
        this.appData.knockoutStage.roundOf16.push({ group: '', dateOfFixture: '', timeOfFixture: '15:00', country1: 'B1', country2: 'A2' });
        this.appData.knockoutStage.roundOf16.push({ group: '', dateOfFixture: '', timeOfFixture: '19:00', country1: 'D1', country2: 'C2' });
        this.appData.knockoutStage.roundOf16.push({ group: '', dateOfFixture: '', timeOfFixture: '15:00', country1: 'F1', country2: 'E2' });
        this.appData.knockoutStage.roundOf16.push({ group: '', dateOfFixture: '', timeOfFixture: '19:00', country1: 'H1', country2: 'G2' });

        this.appData.knockoutStage.quarterFinals.push({ group: '', dateOfFixture: '', timeOfFixture: '15:00', country1: 'QF1', country2: 'QF2' });
        this.appData.knockoutStage.quarterFinals.push({ group: '', dateOfFixture: '', timeOfFixture: '19:00', country1: 'QF5', country2: 'QF6' });
        this.appData.knockoutStage.quarterFinals.push({ group: '', dateOfFixture: '', timeOfFixture: '19:00', country1: 'QF3', country2: 'QF4' });
        this.appData.knockoutStage.quarterFinals.push({ group: '', dateOfFixture: '', timeOfFixture: '13:00', country1: 'QF7', country2: 'QF8' });

        this.appData.knockoutStage.semiFinals.push({ group: '', dateOfFixture: '', timeOfFixture: '19:00', country1: 'SF1', country2: 'SF2' });
        this.appData.knockoutStage.semiFinals.push({ group: '', dateOfFixture: '', timeOfFixture: '19:00', country1: 'SF3', country2: 'SF4' });

        this.appData.knockoutStage.thirdPlacePlayOff.push({ group: '', dateOfFixture: '', timeOfFixture: '15:00', country1: 'PO1', country2: 'PO2' });

        this.appData.knockoutStage.final.push({ group: '', dateOfFixture: '', timeOfFixture: '16:00', country1: 'FN1', country2: 'FN2' });
    }

    private confirmNewGame(title: string, info?: string) {
        let dialogRef: MatDialogRef<any>;

        dialogRef = this.dialog.open(DialogComponent, {
            data: {
                title: title,
                info: info
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            debugger;
            if (result) {
                this.setAppData(true);
                window.location.reload();           //Refresh the current window as Angular doesn't
                return true;
            }
            // console.log('Dialog result: ' + result.toString());
        });

        return false;
    }

    public confirmResetSeason(title: string, functionIfYes) {
        let dialogRef: MatDialogRef<any>;

        dialogRef = this.dialog.open(DialogComponent, {
            data: {
                title: title,
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            debugger;
            if (result) {
                functionIfYes();
                return true;
            }
        });

        return false;
    }

    public confirmationMessage(title: string, info?: string) {
        let dialogRef: MatDialogRef<any>;

        dialogRef = this.dialog.open(DialogComponent, {
            data: {
                title: title,
                info: info,
                informationOnly: true
            }
        });
    }


}

