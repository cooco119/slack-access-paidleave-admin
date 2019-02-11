import * as fs from 'fs';
const Papa = require('papaparse');
const csvWriter = require('csv-write-stream');

export default class AccessHandler {
  csvfilePrefix: string = process.cwd().toString() + '/../../data/access/';

  private getNameList(){
    return fs.readdirSync(this.csvfilePrefix);
  }

  // @ts-ignore
  private async sortAndRewrite(csv){
    console.log("csv: ", csv);

    let csvdata: Array<Array<string>> = [];
    await Papa.parse(fs.readFileSync(csv).toString(), {
      worker: true,
      // @ts-ignore
      step: (results) => {
        csvdata.push(results.data[0]);
      }
    })
    let dataNoHeader = csvdata.slice(1, csvdata.length-1);
    dataNoHeader.sort((a: Array<string>, b: Array<string>): number => {
      const dateA = new Date(parseInt(a[1]), parseInt(a[2])-1, parseInt(a[3]), parseInt(a[4]), parseInt(a[5]), parseInt(a[6]));
      const dateB = new Date(parseInt(b[1]), parseInt(b[2])-1, parseInt(b[3]), parseInt(b[4]), parseInt(b[5]), parseInt(b[6]));

      if (dateA > dateB) return 1;
      if (dateA < dateB) return -1;

      return 0;
    });
    console.log(dataNoHeader);

    const writer = csvWriter({headers: ['name', 'year', 'month', 'day', 'hour', 'minute', 'second', 'type'], sendHeaders: true});
    writer.pipe(fs.createWriteStream(csv, { flags: 'w' }));
    for (let i = 0; i < dataNoHeader.length; i++){
      if (dataNoHeader[i][0] === ''){
        continue;
      }
      writer.write(dataNoHeader[i]);
    }
    writer.end();

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
    let attendTime: Date = null, goHomeTime: Date = null, goOutTime: Date = null, getIn_returnTime: Date = null;
    let outTime = 0;
    let outTimeStr = '';
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
          goOutTime = new Date(parseInt(element[1]),
                                parseInt(element[2]) - 1,
                                parseInt(element[3]),
                                parseInt(element[4]),
                                parseInt(element[5]),
                                parseInt(element[6]));
          break;
        case '복귀':
          getIn_return += 1;
          getIn_returnTime = new Date(parseInt(element[1]),
                                      parseInt(element[2]) - 1,
                                      parseInt(element[3]),
                                      parseInt(element[4]),
                                      parseInt(element[5]),
                                      parseInt(element[6]));
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
      workDuration -= outTime + 3600;
      if (outTime !== 0){
        const underHourOut = (Math.floor((outTime % 3600) / 360) / 10);
        outTimeStr = (Math.floor(outTime / 3600)).toString() + (underHourOut === 0 ? '' : '.' + underHourOut.toString().split('.')[1]) + '시간';
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
    let attendTime: Date = null, goHomeTime: Date = null, goOutTime: Date = null, getIn_returnTime: Date = null;
    let workDuration: number = 0;
    let outTime = 0;
    let outTimeStr = '';
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
            goOutTime = new Date(parseInt(element[1]),
                                  parseInt(element[2]) - 1,
                                  parseInt(element[3]),
                                  parseInt(element[4]),
                                  parseInt(element[5]),
                                  parseInt(element[6]));
            break;
          case '복귀':
            getIn_return += 1;
            getIn_returnTime = new Date(parseInt(element[1]),
                                        parseInt(element[2]) - 1,
                                        parseInt(element[3]),
                                        parseInt(element[4]),
                                        parseInt(element[5]),
                                        parseInt(element[6]));
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
      workDuration -= outTime + 3600;
      if (outTime !== 0){
        const underHourOut = (Math.floor((outTime % 3600) / 360) / 10);
        outTimeStr = (Math.floor(outTime / 3600)).toString() + (underHourOut === 0 ? '' : '.' + underHourOut.toString().split('.')[1]) + '시간';
      }
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
    let attendTime: Date = null, goHomeTime: Date = null, goOutTime: Date = null, getIn_returnTime: Date = null;
    let workDuration: number = 0;
    let outTime = 0;
    let outTimeStr = '';
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
            goOutTime = new Date(parseInt(element[1]),
                                  parseInt(element[2]) - 1,
                                  parseInt(element[3]),
                                  parseInt(element[4]),
                                  parseInt(element[5]),
                                  parseInt(element[6]));
            break;
          case '복귀':
            getIn_return += 1;
            getIn_returnTime = new Date(parseInt(element[1]),
                                        parseInt(element[2]) - 1,
                                        parseInt(element[3]),
                                        parseInt(element[4]),
                                        parseInt(element[5]),
                                        parseInt(element[6]));
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
      workDuration -= outTime + 3600;
      if (outTime !== 0){
        const underHourOut = (Math.floor((outTime % 3600) / 360) / 10);
        outTimeStr = (Math.floor(outTime / 3600)).toString() + (underHourOut === 0 ? '' : '.' + underHourOut.toString().split('.')[1]) + '시간';
      }
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
        [year, month, day] = date.split('-');
        for (let name of nameList){
          const res = await this.searchDaily(name, year, month, day);
          if (res === null){
            console.log("Error occured searching " + `${name}: ${year}-${month}-${day}`);
            continue;
          }
          const data = {
            "name": name.split('.')[0],
            "date": `${year}년 ${month}월 ${day}일`,
            "duration": res.duration,
            "attend": res.attend,
            "goHome": res.goHome
          };
          resultList.push(data);
        }
        break;

      case 'weekly':
        [year, month, week] = date.split('-');
        for (let name of nameList){
          const res = await this.searchWeekly(name, year, month, week);
          if (res === null){
            console.log("Error occured searching " + `${name}: ${year}-${month}-${week}`);
            continue;
          }
          const data = {
            "name": name.split('.')[0],
            "date": year+'년 '+month+'월',
            "week": week,
            "duration": res.duration
          };
          resultList.push(data);
        }
        break;

      case 'monthly':
        console.log("Entering Monthly");
        [year, month] = date.split('-');
        for (let name of nameList){
          const res = await this.searchMonthly(name, year, month);
          if (res === null){
            console.log("Error occured searching " + `${name}: ${year}-${month}`);
            continue;
          }
          const data = {
            "name": name.split('.')[0],
            "date": `${year}년 ${month}월`,
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

  //@ts-ignore
  public insert(data){
    let response;
    try{
      const typeEnum: Object = Object.freeze({"attend": "출근", "goHome": "퇴근", "goOut": "외출", "getIn": "복귀"});
      // @ts-ignore
      const type: string = typeEnum[data.type];
      let date: Date = new Date(data.date);
      const name: string = data.name;

      let year: string, month: string, day: string, hour: string, minute: string, second: string;
      year = date.getFullYear().toString();
      month = (date.getMonth() + 1).toString();
      day = date.getDate().toString();
      hour = date.getHours().toString();
      minute = date.getSeconds().toString();
      second = '0';
      console.log([name, year, month, day, hour, minute, second, type]);

      const csvfile = this.csvfilePrefix + name + '.csv';
      console.log(csvfile);
      // let sendHeaderOrNot: boolean = false;
      // if (!fs.existsSync(csvfile)) sendHeaderOrNot = true;
      // const writer = csvWriter({headers: ['name', 'year', 'month', 'day', 'hour', 'minute', 'second', 'type'], sendHeaders: sendHeaderOrNot});
      // writer.pipe(fs.createWriteStream(csvfile, { flags: 'a' }));
      // writer.write([name, year, month, day, hour, minute, second, type]);
      // writer.end();
      fs.writeFileSync(csvfile, `${name},${year},${month},${day},${hour},${minute},${second},${type}\n`, {flag: 'a'});

      this.sortAndRewrite(csvfile);
      response = {
        "msg": "Insert success"
      };
      return response;
    }
    catch(e) {
      response = {
        "msg": "Error occured",
        "error": e
      }
      throw response;
    }
  }
}