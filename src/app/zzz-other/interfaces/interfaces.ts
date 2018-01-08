// Team(s) model
interface TeamModel {
    country: string,
    abbreviation: string,
    group: string,
    odds: number
}

export interface TeamsModel extends Array<TeamModel> { }


// Fixture(s) model
interface FixturesDateModel {
    date: string;
    numberOfMatches: string;
}

export interface FixturesDatesModel extends Array<FixturesDateModel> { }

export interface FixtureModel {
    group: string,
    dateOfFixture?: string,
    timeOfFixture: string,
    country1: string,
    country2: string,
    country1Score?: number,
    country2Score?: number,
    country1Goals?: string,
    country2Goals?: string,
    country1Odds?: number,
    country2Odds?: number,
    isFirstHalf?: boolean,
    isExtraTime?: boolean,
    injuryTime1stHalf?: number,
    injuryTime2ndHalf?: number,
    injuryTimeExtraTime1stHalf?: number,
    injuryTimeextraTime2ndHalf?: number,
    statutoryMinutes?: number
    maxNumberOfMinutes?: number,
    minutesPlayed?: number,
    minutesInfo?: string,╬
    hasFixtureFinished?: boolean,
}

export interface FixturesModel extends Array<FixtureModel> { }

export interface SetOfFixturesModel {
    dateOfSetOfFixtures: string,
    fixtures: FixturesModel
}

export interface AllFixturesModel extends Array<SetOfFixturesModel> { }

export interface KnockoutModel {
    roundOf16: FixturesModel,
    quarterFinals: FixturesModel,
    semiFinals: FixturesModel,
    thirdPlacePlayOff: FixturesModel,
    final: FixturesModel
}

// Table(s) model
export interface TableModel {
    country: string,
    played: number,
    won: number,
    drawn: number,
    lost: number,
    goalsFor: number,
    goalsAgainst: number,
    goalDifference: number,
    points: number
}

export interface TablesModel extends Array<TableModel> { }

export interface GroupTableModel {
    group: string,
    tables: TablesModel
}

export interface GroupTablesModel extends Array<GroupTableModel> { }

// Misc Info model
export interface MiscInfoModel {
    tournamentYear: string,
    tournamentStartDate: string,
    numberOfTeams: number,
    numberOfGroups: number,
    groups: string[],
    dateOfLastSetOfFixtures: string,
    factorBaseForRandomMultiplier: number,
    factorOdds: number,
    factorLikelihoodOfAGoalDuringASetPeriod: string,
    factorIsItAGoal: number,
    matchUpdateInterval: number,
    hasTournamentStarted: boolean,
    hasGroupStageFinished: boolean,
    hasTournamentFinished: boolean,
    canDisplayRoundOf16: boolean,
    canDisplayQuarterFinals: boolean,
    canDisplaySemiFinals: boolean,
    canDisplayFinals: boolean
}

// App Data model
export interface AppDataModel {
    miscInfo: MiscInfoModel;
    teams: TeamsModel;
    fixtures: AllFixturesModel;
    knockoutStage: KnockoutModel;
    groupTables: GroupTablesModel;
}


// Set of Fixtures Controller model
export interface SetOfFixturesControllerModel {
    dateOfThisSetOfFixtures: string,
    factorBaseForRandomMultiplier: number,
    factorLikelihoodOfAGoalDuringASetPeriod: any[],
    factorOdds: number,
    factorIsItAGoal: number,
    fixtureUpdateInterval: number,
    maxNumberOfMinutes: number,
    minutesPlayed: number,
    minutesInfo: string,
    maxInjuryTime1stHalf: number,
    maxInjuryTime2ndHalf: number,
    statutoryMinutes: number,
    startFixturesButtonText: string,
    startFixturesButtonEnabled: boolean,
    fixturesInPlay: boolean,
    isFirstHalf: boolean
}