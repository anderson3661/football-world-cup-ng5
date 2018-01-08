import { DataService } from '../zzz-other/services/data.service';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'knockout-stage',
    templateUrl: './knockout-stage.component.html',
    styleUrls: [
        '../zzz-other/css/fixtures.css',
        './knockout-stage.component.css'
    ]
})
export class KnockoutStageComponent implements OnInit {

    canDisplayRoundOf16: boolean;
    canDisplayQuarterFinals: boolean;
    canDisplaySemiFinals: boolean;
    canDisplayFinals: boolean;

    constructor(public dataService: DataService) { }

    ngOnInit() {
        this.canDisplayRoundOf16 = this.dataService.appData.miscInfo.canDisplayRoundOf16;
        this.canDisplayQuarterFinals = this.dataService.appData.miscInfo.canDisplayQuarterFinals;
        this.canDisplaySemiFinals = this.dataService.appData.miscInfo.canDisplaySemiFinals;
        this.canDisplayFinals = this.dataService.appData.miscInfo.canDisplayFinals;

        this.canDisplayRoundOf16 = true;
        this.canDisplayQuarterFinals = true;
        this.canDisplaySemiFinals = false;
        this.canDisplayFinals = false;
    }

}
