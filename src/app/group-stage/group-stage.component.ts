import { DataService } from './../zzz-other/services/data.service';
import { AllFixturesModel, SetOfFixturesModel } from './../zzz-other/interfaces/interfaces';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'group-stage',
    templateUrl: './group-stage.component.html',
    styleUrls: [
        '../zzz-other/css/fixtures.css',
        './group-stage.component.css'
    ]
})
export class GroupStageComponent implements OnInit {

    public tableSummary: boolean;
    public haveFixturesBeenCreated: boolean;
    public fixtures: AllFixturesModel;
    public groups: string[];

    constructor(private dataService: DataService) { }

    ngOnInit() {
        debugger;
        
        this.tableSummary = true;

        this.fixtures = this.dataService.appData.fixtures;
        this.haveFixturesBeenCreated = (this.fixtures.length > 0);

        this.groups = this.dataService.appData.miscInfo.groups;
    }

    // private hasFixtureBeenPlayed(dateOfSetOfFixtures: string): boolean {
    //     let lastSetOfFixturesDate: Date;
    //     let setOfFixturesDate: Date;

    //     lastSetOfFixturesDate = new Date(this.dataService.appData.miscInfo.dateOfLastSetOfFixtures);
    //     setOfFixturesDate = new Date(dateOfSetOfFixtures);

    //     return !(setOfFixturesDate > lastSetOfFixturesDate);
    // }
}

