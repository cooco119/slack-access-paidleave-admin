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
      let lastValue = parseFloat(dataNoHeader[i-1][5]);
      dataNoHeader[i][5] = dataNoHeader[i][4] === "연차" ? (lastValue + 1).toString() : (lastValue + 0.5).toString(); 
      writer.write(dataNoHeader[i]);
    }
    writer.end();

  }

  // @ts-ignore
  private async handleSearch(name){
  // @ts-ignore
    let message = [];
    let totalUse = '';
    const targetfile = this.csvfilePrefix + name + '.csv';
    let data;

    try{
      await Papa.parse(fs.readFileSync(targetfile).toString(), {
        // @ts-ignore
        complete: (result) => {
          const length = result.data.length;
          console.log(result.data);
          totalUse = result.data[length-2][5];
          // @ts-ignore
          result.data.forEach(element => {
            if (element.length === 1 || element[0] === 'name'){
              return;
            }
            message.push({
              'name': name,
              'date': element[1] + '년 ' + element[2] + '월 ' + element[3] +'일',
              'type': element[4],
              'cummulate': element[5]
            });
          });
        }
      });
      data = {
        "exists": true,
  // @ts-ignore
        "message": message
      };
    }
    catch(e){
      console.log(e);
      if (!fs.existsSync(targetfile)){
        data = {
          "exists": false
        };
      }
    }

  // @ts-ignore
    return data;
  }
  
  // @ts-ignore
  public async handle(data){
    const name = data.name;

    return await this.handleSearch(name)
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
}