import { DataService } from './../zzz-other/services/data.service';
import { TeamsModel, TablesModel, GroupTablesModel } from './../zzz-other/interfaces/interfaces';
import * as helpers from '../zzz-other/helper-functions/helpers';
import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'tables',
    templateUrl: './tables.component.html',
    styleUrls: [
        '../../../node_modules/font-awesome/css/font-awesome.min.css',        
        '../zzz-other/css/tables.css'
        // './tables.component.css'
    ]
})
export class TablesComponent implements OnInit {

    // The following @Input(s) are required by the HTML - imported from fixtures-latest.component (i.e. in the html call)
    @Input() tableTypeGroupStage: boolean;
    @Input() tableTypeSummary: boolean;
    @Input() tableTypeInPlay: boolean;
    @Input() tablesInPlay: GroupTablesModel;
    @Input() tablesBeforeFixtures: GroupTablesModel;
    @Input() group: string;

    public tableTypeFull: boolean;
    public teams: TeamsModel;
    public hasTournamentStarted: boolean;
    public hasTournamentFinished: boolean;
    public groups: string[];
    public groupTables: GroupTablesModel;

    constructor(public dataService: DataService) { }

    ngOnInit() {

        debugger;
        this.teams = this.dataService.appData.teams;
        this.groups = (this.group === null || this.group === undefined) ? this.dataService.appData.miscInfo.groups : [ this.group ];
        this.tableTypeFull = true;
        this.tableTypeGroupStage = (this.tableTypeGroupStage === null || this.tableTypeGroupStage === undefined) ? false : this.tableTypeGroupStage;
        this.tableTypeSummary = (this.tableTypeSummary === null || this.tableTypeSummary === undefined) ? false : this.tableTypeSummary;
        this.tableTypeInPlay = (this.tableTypeInPlay === null || this.tableTypeInPlay === undefined) ? false : this.tableTypeInPlay;
        this.groupTables = (this.tablesInPlay === null || this.tablesInPlay === undefined) ? this.dataService.appData.groupTables : this.tablesInPlay;
        this.tablesBeforeFixtures = (this.tablesBeforeFixtures === null || this.tablesBeforeFixtures === undefined) ? [] : this.tablesBeforeFixtures;        
        this.hasTournamentStarted = this.dataService.appData.miscInfo.hasTournamentStarted;
        this.hasTournamentFinished = this.dataService.appData.miscInfo.hasTournamentFinished;
    }

    private getPositionInArrayOfObjectsThis(array, objectProperty, objectValue): number {

        //Call the function in the helpers file.  Needs to be done like this so that the function can be referenced in the html file
        return helpers.getPositionInArrayOfObjects(array, objectProperty, objectValue);
    }

    private getCountryAbbeviation(country): string {
        return this.teams[this.getPositionInArrayOfObjectsThis(this.teams, "country", country)].abbreviation;
    }

    private getGroupTable(group): TablesModel {
        debugger;
        return this.groupTables[helpers.getTableIndex(this.dataService, group)].tables;        
    }


}
