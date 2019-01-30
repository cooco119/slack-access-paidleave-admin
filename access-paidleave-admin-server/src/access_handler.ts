import * as fs from 'fs';
const Papa = require('papaparse');

export default class AccessHandler {
  csvfilePrefix: string = process.cwd().toString() + '/../../data/access/';

  private getNameList(){
    return fs.readdirSync(this.csvfilePrefix);
  }

  // @ts-ignore
  private async searchDaily(name, year, month, day){
    const targetfile = this.csvfilePrefix + name;
    let csvdata: Array<Object> = [];
    await Papa.parse(fs.readFileSync(targetfile).toString(), {
      worker: true,
      // @ts-ignore
      step: (results) => {
        csvdata.push(results.data[0]);
      }
    })
    let resultData: Array<string> = [];
    let attend = 0, goHome = 0, getIn_normal = 0, getIn_return = 0, goOut = 0;
    csvdata.forEach(element => {
      // @ts-ignore
      if ((element[1] === year || element[1] === '0'+year) && ((element[2] === month) || (element[2] === '0'+month)) && ((element[3] === day) || (element[3] === '0'+day))){
        // @ts-ignore
        resultData.push(element);
      }
    });
    let resultListString = '';
    let attendTime: Date = null, goHomeTime: Date = null;
    try {resultData.forEach(element => {
      switch (element[7]){
        case '출근':
          attend += 1;
          attendTime = new Date(parseInt(element[1]),
                                parseInt(element[2]) - 1,
                                parseInt(element[3]),
                                parseInt(element[4]),
                                parseInt(element[5]),
                                parseInt(element[6]));
          break;
        case '출입':
          getIn_normal += 1;
          break;
        case '퇴근':
          goHome += 1;
          goHomeTime = new Date(parseInt(element[1]),
                                parseInt(element[2]) - 1,
                                parseInt(element[3]),
                                parseInt(element[4]),
                                parseInt(element[5]),
                                parseInt(element[6]));
          break;
        case '외출':
          goOut += 1;
          break;
        case '복귀':
          getIn_return += 1;
          break;
        default:
          console.log("No such type");
      }
        resultListString += `${element[1]}년 ${element[2]}월 ${element[3]}일 ${element[4]}시 ${element[5]}분 ${element[6]}초 : ${element[7]}\n`
      });
      let workDuration: number;
      let workDurationStr: string = '';
      let expectedGoHome: Date;
      let remaining: string = '';
      if (goHome !== 0){
        // @ts-ignore
        workDuration = ((goHomeTime.getTime() - attendTime.getTime())/1000);
      }
      else if (attendTime.getDate() === new Date().getDate()){
        if (attendTime.getHours() < 12){
          expectedGoHome = (new Date(attendTime.getTime() + 9*60000));
        }
        else {
          expectedGoHome = (new Date(attendTime.getTime() + 9*60000));
          remaining = '퇴근까지 얼마나?: ' + (new Date(expectedGoHome.getTime() - attendTime.getTime())).toLocaleTimeString();
        }
      }
      if (workDuration !== 0){
        const underHour = (Math.floor((workDuration % 3600) / 360) / 10);
        workDurationStr = (Math.floor(workDuration / 3600)).toString() + (underHour === 0 ? '' : '.' + underHour.toString().split('.')[1]) + '시간';
      }

      const respondText = `총 근무: ${workDurationStr}, 출근: ${attendTime.toLocaleTimeString()}, ${goHome === 0 ? remaining : '퇴근: ' + goHomeTime.toLocaleTimeString()}\n\n` + resultListString;

      const result = {
        "duration": workDurationStr,
        "attend": attendTime.toLocaleTimeString(),
        "goHome": goHomeTime.toLocaleTimeString()
      }
      return result;
    }
    catch(e) {
      console.log(e);
      return null;
    }
  }

  // @ts-ignore
  private async searchWeekly(name, year, month, targetweek){
    const targetfile = this.csvfilePrefix + name;
    let csvdata: Array<Object> = [];
    await Papa.parse(fs.readFileSync(targetfile).toString(), {
      worker: true,
      // @ts-ignore
      step: (results) => {
        csvdata.push(results.data[0]);
      }
    })

    let resultData: Array<string> = [];
    let attend = 0, goHome = 0, getIn_normal = 0, getIn_return = 0, goOut = 0;
    csvdata.forEach(element => {
      // @ts-ignore
      if ((element[1] === year || element[1] === '0'+year) &&((element[2] === month) || (element[2] === '0'+month))){

        // calculate if the date is in target week
        // @ts-ignore 
        const firstDay = new Date(element[1], parseInt(element[2]) - 1 , 1).getDay();
        // @ts-ignore 
        const date = new Date(element[1], parseInt(element[2]) - 1, element[3]);
        const week = Math.ceil((date.getDate() + firstDay) / 7);
        
        if (week.toString() === targetweek){
          // @ts-ignore
          resultData.push(element);
        }
      }
    });
    let resultListString = '';
    let attendTime: Date = null, goHomeTime: Date = null;
    let workDuration: number = 0;
    try {
      resultData.forEach(element => {
        switch (element[7]){
          case '출근':
            attend += 1;
            attendTime = new Date(parseInt(element[1]),
                                  parseInt(element[2]) - 1,
                                  parseInt(element[3]),
                                  parseInt(element[4]),
                                  parseInt(element[5]),
                                  parseInt(element[6]));
            break;
          case '출입':
            getIn_normal += 1;
            break;
          case '퇴근':
            goHome += 1;
            goHomeTime = new Date(parseInt(element[1]),
                                  parseInt(element[2]) - 1,
                                  parseInt(element[3]),
                                  parseInt(element[4]),
                                  parseInt(element[5]),
                                  parseInt(element[6]));
            break;
          case '외출':
            goOut += 1;
            break;
          case '복귀':
            getIn_return += 1;
            break;
          default:
            console.log("No such type");
        }
        if (goHomeTime && attendTime){
          if (goHomeTime.getDate() === attendTime.getDate()){
            // @ts-ignore
            workDuration += ((goHomeTime.getTime() - attendTime.getTime())/1000);
          }
        }
          resultListString += `${element[1]}년 ${element[2]}월 ${element[3]}일 ${element[4]}시 ${element[5]}분 ${element[6]}초 : ${element[7]}\n`;
      });
      let workDurationStr: string = '';
      if (workDuration !== 0){
        const underHour = (Math.floor((workDuration % 3600) / 360) / 10);
        workDurationStr = (Math.floor(workDuration / 3600)).toString() + (underHour === 0 ? '' : '.' + underHour.toString().split('.')[1]) + '시간';
      }
      const respondText = `총 근무: ${workDurationStr}\n\n` + resultListString;

      const data = {
        "duration": workDurationStr
      };
      return data;
    }
    catch(e) {
      console.log(e);
      return null;
    }
  }

  // @ts-ignore
  private async searchMonthly(name, year, month){
    const targetfile = this.csvfilePrefix + name;
    let csvdata: Array<Object> = [];
    await Papa.parse(fs.readFileSync(targetfile).toString(), {
      worker: true,
      // @ts-ignore
      step: (results) => {
        csvdata.push(results.data[0]);
      }
    })
    // console.log(csvdata);
    let resultData: Array<string> = [];
    let attend = 0, goHome = 0, getIn_normal = 0, getIn_return = 0, goOut = 0;
    csvdata.forEach(element => {
      // @ts-ignore
      if ((element[1] === year || element[1] === '0'+year) &&((element[2] === month) || (element[2] === '0'+month))){
        // @ts-ignore
        resultData.push(element);
      }
    });
    let resultListString = '';
    let attendTime: Date = null, goHomeTime: Date = null;
    let workDuration: number = 0;
    try {
      resultData.forEach(element => {
        switch (element[7]){
          case '출근':
            attend += 1;
            attendTime = new Date(parseInt(element[1]),
                                  parseInt(element[2]) - 1,
                                  parseInt(element[3]),
                                  parseInt(element[4]),
                                  parseInt(element[5]),
                                  parseInt(element[6]));
            break;
          case '출입':
            getIn_normal += 1;
            break;
          case '퇴근':
            goHome += 1;
            goHomeTime = new Date(parseInt(element[1]),
                                  parseInt(element[2]) - 1,
                                  parseInt(element[3]),
                                  parseInt(element[4]),
                                  parseInt(element[5]),
                                  parseInt(element[6]));
            break;
          case '외출':
            goOut += 1;
            break;
          case '복귀':
            getIn_return += 1;
            break;
          default:
            console.log("No such type");
        }
        if (goHomeTime && attendTime){
          if (goHomeTime.getDate() === attendTime.getDate()){
            // @ts-ignore
            workDuration += ((goHomeTime.getTime() - attendTime.getTime())/1000);
          }
        }
        resultListString += `${element[1]}년 ${element[2]}월 ${element[3]}일 ${element[4]}시 ${element[5]}분 ${element[6]}초 : ${element[7]}\n`;
      });
      let workDurationStr: string = '';
      if (workDuration !== 0){
        const underHour = (Math.floor((workDuration % 3600) / 360) / 10);
        workDurationStr = (Math.floor(workDuration / 3600)).toString() + (underHour === 0 ? '' : '.' + underHour.toString().split('.')[1]) + '시간';
      }
      const respondText = `총 근무: ${workDurationStr}\n\n` + resultListString;

      const data = {
        "duration": workDurationStr
      };
      return data;
    }
    catch(e) {
      console.log(e);
      return null;
    }
  }

  // @ts-ignore
  public async handle(data){
    console.log(data);
    const scope = data.scope;
    const date = data.date;
    let year = null, month = null, week = null, day = null;
    const nameList = this.getNameList();
    let resultList = [];

    switch(scope){
      case 'daily':
        [year, month, day] = date.split('.');
        for (let name of nameList){
          const res = await this.searchDaily(name, year, month, day);
          if (res === null){
            console.log("Error occured searching " + `${name}: ${year}-${month}-${day}`);
            continue;
          }
          const data = {
            "name": name.split('.')[0],
            "duration": res.duration,
            "attend": res.attend,
            "goHome": res.goHome
          };
          resultList.push(data);
        }
        break;

      case 'weekly':
        [year, month, week] = date.split('.');
        for (let name of nameList){
          const res = await this.searchWeekly(name, year, month, week);
          if (res === null){
            console.log("Error occured searching " + `${name}: ${year}-${month}-${week}`);
            continue;
          }
          const data = {
            "name": name.split('.')[0],
            "duration": res.duration
          };
          resultList.push(data);
        }
        break;

      case 'monthly':
        console.log("Entering Monthly");
        [year, month] = date.split('.');
        for (let name of nameList){
          const res = await this.searchMonthly(name, year, month);
          if (res === null){
            console.log("Error occured searching " + `${name}: ${year}-${month}`);
            continue;
          }
          const data = {
            "name": name.split('.')[0],
            "duration": res.duration
          };
          resultList.push(data);
        }
        break;

      default:
        break;
    }
    const result = {
      "result": resultList
    }
    return result;
  }
}