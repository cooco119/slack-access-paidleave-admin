import * as fs from 'fs';
const Papa = require('papaparse');
const csvWriter = require('csv-write-stream');

export default class PaidleaveHandler {
  csvfilePrefix: string = process.cwd().toString() + '/../../data/paidleave/';

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
      const dateA = new Date(parseInt(a[1]), parseInt(a[2])-1, parseInt(a[3]));
      const dateB = new Date(parseInt(b[1]), parseInt(b[2])-1, parseInt(b[3]));

      if (dateA > dateB) return 1;
      if (dateA < dateB) return -1;

      return 0;
    });

    const writer = csvWriter({headers: ['name', 'year', 'month', 'day', 'type', 'used'], sendHeaders: true});
    writer.pipe(fs.createWriteStream(csv, { flags: 'w' }));
    dataNoHeader[0][5] = dataNoHeader[0][4] === "연차" ? '1' : '0.5';
    writer.write(dataNoHeader[0]);
    for (let i = 1; i < dataNoHeader.length; i++){
      if (dataNoHeader[i][0] === ''){
        continue;
      }
      // 연도가 바뀔 때 초기화
      else if (dataNoHeader[i-1][1] !== dataNoHeader[i][1]){
        dataNoHeader[i][5] = dataNoHeader[i][4] === "연차" ? '1' : '0.5'; 
        writer.write(dataNoHeader[i]);
      }
      else {
        let lastValue = parseFloat(dataNoHeader[i-1][5]);
        dataNoHeader[i][5] = dataNoHeader[i][4] === "연차" ? (lastValue + 1).toString() : (lastValue + 0.5).toString(); 
        writer.write(dataNoHeader[i]);
      }
    }
    writer.end();

  }

  // @ts-ignore
  private async handleSearch(name, start, end){
    let curDate: Date;

    let response, totalUse;
    const csvfile = this.csvfilePrefix + name + '.csv';
    let resultData: Array<Object> = [];
    try{
      await Papa.parse(fs.readFileSync(csvfile).toString(), {
        worker: true,
        // @ts-ignore
        step: (results) => {
          let line = results.data[0];
          // console.log("line: ", line);
          curDate = new Date(parseInt(line[1]),parseInt(line[2]) - 1, parseInt(line[3]));
          // console.log("curDate: ", curDate);
          if ((curDate.getTime() >= start) && (curDate.getTime() <= end)){
            let dateStr = curDate.toLocaleDateString().split('/');
            let tmpData = {
              'name': name,
              'date': line[1] + '년 ' + line[2] + '월 ' + line[3] +'일',
              'type': line[4],
              'cummulate': line[5]
            };
            resultData.push(tmpData);
          }
        }
      })
      // @ts-ignore
      totalUse = resultData[resultData.length-1].cummulate;
    }
    catch(e) {
      response = {
        "msg": "Error occured in paidleave searching",
        "error": e
      };
      throw response;
    }
    console.log(resultData);
    response = {
      "msg": "Success",
      "data": resultData,
      "total": totalUse
    };
    return response;
  }
  
  // @ts-ignore
  public async handle(data){
    const start = parseInt(data.start);
    const end = parseInt(data.end);
    const name = data.name;

    return await this.handleSearch(name, start, end)
  }

  //@ts-ignore
  public async insert(data){
    let response;
    try {
      const typeEnum: Object = Object.freeze({"full": "연차", "morning": "반차(오전)", "afternoon": "반차(오후)"});
      // @ts-ignore
      const type: string = typeEnum[data.type];
      let date: Date = new Date(data.date);
      const name: string = data.name;
      let year: string, month: string, day: string;

      let used = 0;
      const targetfile = this.csvfilePrefix + name + '.csv';
      if (fs.existsSync(targetfile)){
        let csvdata: Array<Object> = [];
        await Papa.parse(fs.readFileSync(targetfile).toString(), {
          worker: true,
          // @ts-ignore
          step: (results) => {
            csvdata.push(results.data[0]);
          }
        })
        for (let i = 1; i < csvdata.length - 1; i++ ){
          // @ts-ignore
          if (year === csvdata[i][1] && month === csvdata[i][2] && day === csvdata[i][3]){
            //@ts-ignore
            throw `오류: 이미 해당 날짜에 ${csvdata[i][4]} 신청이 완료되었습니다.`;
          }
        }
        const recent = csvdata[csvdata.length - 2];
        // @ts-ignore
        used = parseFloat(recent[recent.length - 1]);
      }
      
      if (type === "연차"){
        used += 1;
      }
      else if (type === "반차(오전)" || type === "반차(오후)") {
        used += 0.5;
      }
      else {
        throw "Not a defined type";
      }
       
      year = date.getFullYear().toString();
      month = (date.getMonth() + 1).toString();
      day = date.getDate().toString();
      console.log([name, year, month, day, type, used]);

      const csvfile = this.csvfilePrefix + name + '.csv';
      console.log(csvfile);
      fs.writeFileSync(csvfile, `${name},${year},${month},${day},${type},${used}\n`, {flag: 'a'});

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

  //@ts-ignore
  public async remove(data){
    const name = data.ref.name;
    const date = new Date(data.ref.name);
    const type = data.ref.type;

    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString();
    const day = date.getDate().toString();

    const csvfile = this.csvfilePrefix + name + '.csv';
    let resultData: Array<Array<string>> = [], response;
    try{
      await Papa.parse(fs.readFileSync(csvfile).toString(), {
        worker: true,
        // @ts-ignore
        step: (results) => {
          let line = results.data[0];
          if ((line[0] === name) && (line[1] === year) &&
              ((line[2] === month) || (line[2] === '0' + month)) &&
              ((line[3] === day) || (line[3] === '0' + day)) &&
              (line[4] === type)){
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
    console.log(resultData);

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
    let response;
    let resRm = await this.remove(data.ref)
    // @ts-ignore
    .catch( e => {
      response = {
        "msg": "Error in modifying -> removing",
        "error": e
      }
      throw response;
    });
    let resIn = await this.insert(data.new)
    //@ts-ignore
    .catch( e => {
      response = {
        "msg": "Error in modifying -> inserting",
        "error": e
      }
      throw response;
    });

    console.log("resRm: ", resRm);
    console.log("resIn: ", resIn);
    response = {
      "msg": "Modifying successed",
      "removeResult": resRm,
      "insertResult": resIn,
    };
    return response;
  }
}