import * as fs from 'fs';
const Papa = require('papaparse');
const csvWriter = require('csv-write-stream');

export default class MemberHandler {
  csvfile: string = process.cwd().toString() + '/../../data/members.csv';

  public async handle(){
    let response;
    let resultData: Array<Object> = [];
    try{
      await Papa.parse(fs.readFileSync(this.csvfile).toString(), {
        worker: true,
        // @ts-ignore
        step: (results) => {
          let line = results.data[0];
          if (line[0] === 'name' || line[0] === ''){
            console.log("Passing line: ", line);
          }
          else{
            console.log("line: ", line);
            let year, month, day;
            [year, month, day] = line[1].split('.');
            let years = (new Date()).getFullYear() - parseInt(year);
            let lineData = {
              "name": line[0],
              "date": line[1],
              "contact": line[2],
              "years": years
            };
            resultData.push(lineData);
          }
        }
      })
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
    };
    return response;
  }
}