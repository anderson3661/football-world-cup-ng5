import { DataService } from './../services/data.service';
import { AllFixturesModel, SetOfFixturesModel, TablesModel } from './../interfaces/interfaces';


export function getEmptyAllFixtures(): AllFixturesModel {
    return [{ dateOfSetOfFixtures: "", fixtures: [] }];
}

export function getEmptySetOfFixtures(): SetOfFixturesModel {
    return { dateOfSetOfFixtures: "", fixtures: [] };    
}

export function getRandomNumber(nToRandomise): number {
    return Math.floor(Math.random() * nToRandomise);
}


export function formatDate(dateOfFixtures: string): string {
    let monthNames: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    let date = new Date(dateOfFixtures);
    let day: number = date.getDate();
    let monthIndex: number = date.getMonth();
    let year: number = date.getFullYear();
    let sDaySuffix: string;

    if (day === 1 || day === 21 || day === 31) {
        sDaySuffix = "st";
    } else if (day === 2 || day === 22) {
        sDaySuffix = "nd";
    } else if (day === 3 || day === 23) {
        sDaySuffix = "rd";
    } else {
        sDaySuffix = "th";
    }

    return dateOfFixtures.substr(0, 4) + day + sDaySuffix + ' ' + monthNames[monthIndex];
}


export function getPositionInArrayOfObjects(array, objectProperty, objectValue) : number {
    let i: number = 0;
    let len;

    for (i = 0, len = array.length; i < len; i++) {
        if (array[i][objectProperty] === objectValue) return i;
    }
    return -1;
}


export function deepSortAlpha(args) {
    // empArray.sort(multiSort( 'lastname','firstname')) Reverse with '-lastname'
    let sortOrder: number = 1;
    let prop: string = "";
    let aa: string = "";
    let bb: string = "";

    return function (a, b) {

        for (var i = 0; i < args.length; i++) {

            if (args[i][0] === '-') {
                prop = args[i].substr(1);
                sortOrder = -1;
            } else {
                sortOrder = (args[i] === "country") ? 1 : -1;
                prop = args[i]
            }

            aa = a[prop];
            bb = b[prop];

            if (aa < bb) return -1 * sortOrder;
            if (aa > bb) return 1 * sortOrder;
        }

        return 0
    }
}

export function getTableIndex(dataService: DataService, group: string): number {
    // let dataService: DataService;

    let groups = dataService.appData.miscInfo.groups;

    for (let i = 0; i < groups.length; i++) {
        if (groups[i] === group) return i;
    }
    return -1;
}

export function sortTable(table: TablesModel) {
    table.sort(deepSortAlpha(['points', 'goalDifference', 'goalsFor', 'country']));
}