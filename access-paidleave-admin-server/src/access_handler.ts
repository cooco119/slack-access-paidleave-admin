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
    try{
      await Papa.parse(fs.readFileSync(targetfile).toString(), {
        worker: true,
        // @ts-ignore
        step: (results) => {
          csvdata.push(results.data[0]);
        }
      //@ts-ignore
      }).catch( e => {
        let result = {
          "msg": "Error while parsing csv file",
          "error": e
        };
        console.log(result);
        throw result;
      })
    }
    catch(e) {
      let result = {
        "msg": "Error while parsing csv file",
        "error": e
      };
      console.log(result);
      throw result;
    }

    let resultData: Array<string> = [];
    let attend = 0, goHome = 0, getIn_normal = 0, getIn_return = 0, goOut = 0;
    try{
      csvdata.forEach(element => {
        // @ts-ignore
        if ((element[1] === year || element[1] === '0'+year) && ((element[2] === month) || (element[2] === '0'+month)) && ((element[3] === day) || (element[3] === '0'+day))){
          // @ts-ignore
          resultData.push(element);
        }
      });
    }
    catch(e) {
      let result = {
        "msg": "Error while parsing csv file",
        "error": e
      };
      console.log(result);
      throw result;
    }
    let resultListString = '';
    let attendTime: Date = null, goHomeTime: Date = null, goOutTime: Date = null, getIn_returnTime: Date = null;
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
      let result = {
        "msg": "Error while searching daily",
        "error": e
      };
      console.log(result);
      throw result;
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

  private async searchIntervalName(start: Date, end: Date, name: string){
    let total = 0, avg;
    let result;

    const aDayInMs = 1000 * 3600 * 24;
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / aDayInMs);
    let curDate: Date = start;
    let daySearchResult;
    try{
      console.log('curDate: ', curDate);
      console.log('start  : ', start);
      console.log('end    :', end);
      while (curDate >= start && curDate <= end){
        console.log("Inside while loop");
        try{
          daySearchResult = await this.searchDaily(name + '.csv', curDate.getFullYear().toString(), (curDate.getMonth() + 1).toString(), curDate.getDate().toString())
          //@ts-ignore
          .catch( e => {
            let result = {
              "msg": "Error while calling searchDaily",
              "error": e
            };
            console.log(result);
            throw result;
          });
        }
        //@ts-ignore
        catch( e ) {
          let result = {
            "msg": "Error while calling searchDaily",
            "error": e
          };
          console.log(result);
          throw result;
        };
        console.log(daySearchResult);
        total += parseFloat(daySearchResult.duration);
        curDate = new Date(curDate.getTime() + aDayInMs);
      }
      avg = total / daysDiff;
      console.log('total: ', total);
      console.log('avg  : ', avg);
    }
    catch(e) {
      result = {
        "msg": "Error occured in searching interval + name",
        "error": e
      };
      console.log(result);
      throw result;
    }

    result = {
      "total": total,
      "avg": avg
    };
    return result;
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

      case 'intervalName':
        console.log("Searching interval + name");
        const start = new Date(parseInt(data.start));
        const end = new Date(parseInt(data.end));
        const name = data.name;
        let res = null;

        try{
          res = await this.searchIntervalName(start, end, name);
        }
        catch( e ) {
          let response = {
            "msg": "Error serching IntervalName",
            "error": e
          };
          console.log(response);
          throw response;
        };
        const response = {
          "msg": "Success searching interval + name",
          "data": res
        };
        return response;
        
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
  public async insert(data){
    let response;
    console.log(new Date(data.date));
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
      minute = date.getMinutes().toString();
      second = date.getSeconds().toString() || '0';
      console.log([name, year, month, day, hour, minute, second, type]);

      const csvfile = this.csvfilePrefix + name + '.csv';
      fs.appendFileSync(csvfile, `${name},${year},${month},${day},${hour},${minute},${second},${type}\n`);
      // let line = [name, year, month, day, hour, minute, second, type];
      // const writer = csvWriter({headers: ['name', 'year', 'month', 'day', 'hour', 'minute', 'second', 'type'], sendHeaders: false});
      // writer.pipe(fs.createWriteStream(csvfile, { flags: 'a' }));
      // writer.write(line);
      // writer.end();
      setTimeout( (csvfile) => this.sortAndRewrite(csvfile), 1000, csvfile);
      response = {
        "msg": "Insert success"
      };
      return response;
    }
    catch(e) {
      response = {
        "msg": "Error occured inserting",
        "error": e
      }
      throw response;
    }
  }

  //@ts-ignore
  public async history(data){
    const start = parseInt(data.start);
    const end = parseInt(data.end);
    const name = data.name;
    let curDate: Date;

    let response;
    const csvfile = this.csvfilePrefix + name + '.csv';
    let resultData: Array<Object> = [];
    try{
      await Papa.parse(fs.readFileSync(csvfile).toString(), {
        worker: true,
        // @ts-ignore
        step: (results) => {
          let line = results.data[0];
          curDate = new Date(parseInt(line[1]),parseInt(line[2]) - 1, parseInt(line[3]), parseInt(line[4]), parseInt(line[5]), parseInt(line[6]));
          if ((curDate.getTime() >= start) && (curDate.getTime() <= end)){
            let dateStr = curDate.toLocaleDateString().split('/');
            let tmpData = {
              "name": name,
              "date": `${dateStr[2]}년 ${dateStr[0]}월 ${dateStr[1]}일 ${curDate.getHours()}-${curDate.getMinutes()}-${curDate.getSeconds()}`,
              "type": line[7]
            }
            resultData.push(tmpData);
          }
        }
      })
    }
    catch(e) {
      response = {
        "msg": "Error occured in history searching",
        "error": e
      };
      throw response;
    }
    console.log(resultData);
    response = {
      "msg": "Success",
      "data": resultData
    };
    return response;
  }

  // @ts-ignore
  public async remove(data){
    const name = data.ref.name;
    const date = new Date(data.ref.date);
    const type = data.ref.type;

    const csvfile = this.csvfilePrefix + name + '.csv';
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString();
    const day = date.getDate().toString();
    const hour = date.getHours().toString();
    const minute = date.getMinutes().toString();
    const second = date.getSeconds().toString();
    let resultData: Array<Array<string>> = [], response;
    try{
      await Papa.parse(fs.readFileSync(csvfile).toString(), {
        worker: true,
        // @ts-ignore
        step: (results) => {
          let line = results.data[0];
          // console.log("line: ", line);
          // console.log("rmv : ", [name, year, month, day, hour, minute, second, type]);
          if ((line[0] === name) && (line[1] === year) &&
              ((line[2] === month) || (line[2] === '0' + month)) &&
              ((line[3] === day) || (line[3] === '0' + day)) &&
              ((line[4] === hour) || (line[4] === '0' + hour)) &&
              ((line[5] === minute) || (line[5] === '0' + minute)) &&
              ((line[6] === second) || (line[6] === '0' + second)) &&
              (line[7] === type)){
            console.log("Passing line: ", line);
          }
          else if (line[0] === 'name'){
            console.log("Passing header");
          }
          else{
            resultData.push(line);
          }
        }
      })
    }
    catch(e) {
      response = {
        "msg": "Error occured removing",
        "error": e
      };
      throw response;
    }
    const writer = csvWriter({headers: ['name', 'year', 'month', 'day', 'hour', 'minute', 'second', 'type'], sendHeaders: true});
    writer.pipe(fs.createWriteStream(csvfile, { flags: 'w' }));
    for (let i = 0; i < resultData.length; i++){
      if (resultData[i][0] === ''){
        continue;
      }
      writer.write(resultData[i]);
    }
    writer.end();

    response = {
      "msg": "Removing successed",
      "data": resultData
    };
    return response;
  }

  // @ts-ignore
  public async modify(data){
    const name = data.ref.name;
    const date = new Date(data.ref.date);
    const type = data.ref.type;

    const n_name = data.new.name;
    const n_date = new Date(data.new.date);
    const n_type = data.new.type;

    const csvfile = this.csvfilePrefix + name + '.csv';
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString();
    const day = date.getDate().toString();
    const hour = date.getHours().toString();
    const minute = date.getMinutes().toString();
    const second = date.getSeconds().toString();

    const n_year = n_date.getFullYear().toString();
    const n_month = (n_date.getMonth() + 1).toString();
    const n_day = n_date.getDate().toString();
    const n_hour = n_date.getHours().toString();
    const n_minute = n_date.getMinutes().toString();
    const n_second = n_date.getSeconds().toString();

    let resultData: Array<Array<string>> = [], response;
    try{
      await Papa.parse(fs.readFileSync(csvfile).toString(), {
        worker: true,
        // @ts-ignore
        step: (results) => {
          let line = results.data[0];
          // console.log("line: ", line);
          // console.log("rmv : ", [name, year, month, day, hour, minute, second, type]);
          if ((line[0] === name) && (line[1] === year) &&
              ((line[2] === month) || (line[2] === '0' + month)) &&
              ((line[3] === day) || (line[3] === '0' + day)) &&
              ((line[4] === hour) || (line[4] === '0' + hour)) &&
              ((line[5] === minute) || (line[5] === '0' + minute)) &&
              ((line[6] === second) || (line[6] === '0' + second)) &&
              (line[7] === type)){
            console.log("Modifying line: ", line);
            line = [n_name, n_year, n_month, n_day, n_hour, n_minute, n_second, n_type];
            resultData.push(line);
          }
          else if (line[0] === 'name'){
            console.log("Passing header");
          }
          else{
            resultData.push(line);
          }
        }
      })
    }
    catch(e) {
      response = {
        "msg": "Error occured modifying",
        "error": e
      };
      throw response;
    }
    const writer = csvWriter({headers: ['name', 'year', 'month', 'day', 'hour', 'minute', 'second', 'type'], sendHeaders: true});
    writer.pipe(fs.createWriteStream(csvfile, { flags: 'w' }));
    for (let i = 0; i < resultData.length; i++){
      if (resultData[i][0] === ''){
        continue;
      }
      writer.write(resultData[i]);
    }
    writer.end();

    response = {
      "msg": "Modifying successed",
      "data": resultData
    };
    return response;
  }
}