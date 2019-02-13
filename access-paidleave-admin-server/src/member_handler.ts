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
        "msg": "Error occured in members searching",
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

  //@ts-ignore
  public async modify(data){

    const name = data.ref.name;
    const date = data.ref.date
    const contact = data.ref.contact;

    const n_name = data.new.name;
    const n_date = data.new.date;
    const n_contact = data.new.contact;

    let resultData: Array<Array<string>> = [], response;
    try{
      await Papa.parse(fs.readFileSync(this.csvfile).toString(), {
        worker: true,
        // @ts-ignore
        step: (results) => {
          let line = results.data[0];
          console.log("line: ", line);
          console.log("rmv : ", [name, date, contact]);
          if ((line[0] === name) && (line[1] === date) &&
              (line[2] === contact)){
            console.log("Modifying line: ", line);
            line = [n_name, n_date, n_contact];
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
    const writer = csvWriter({headers: ['name', 'date', 'contact'], sendHeaders: true});
    writer.pipe(fs.createWriteStream(this.csvfile, { flags: 'w' }));
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

  //@ts-ignore
  public async remove(data){
    const name = data.name;
    const date = data.date;
    const contact = data.contact;

    let resultData: Array<Array<string>> = [], response;
    try{
      await Papa.parse(fs.readFileSync(this.csvfile).toString(), {
        worker: true,
        // @ts-ignore
        step: (results) => {
          let line = results.data[0];
          console.log("line: ", line);
          console.log("rmv : ", [name, date, contact]);
          if ((line[0] === name) && (line[1] === date) &&
              (line[2] === contact)){
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

    try{
      const writer = csvWriter({headers: ['name', 'date', 'contact'], sendHeaders: true});
      writer.pipe(fs.createWriteStream(this.csvfile, { flags: 'w' }));
      for (let i = 0; i < resultData.length; i++){
        if (resultData[i][0] === ''){
          continue;
        }
        writer.write(resultData[i]);
      }
      writer.end();
    }
    catch(e) {
      response = {
        "msg": "Error removing members",
        "error": e
      };
      throw response;
    }
    
    response = {
      "msg": "Removing successed",
      "data": resultData
    };
    return response;
  }

  //@ts-ignore
  public async insert(data){
    let response;
    try{
      // @ts-ignore
      const date: string = data.date;
      const name: string = data.name;
      const contact: string = data.contact;

      console.log("appending ", [name, date, contact]);
      fs.appendFileSync(this.csvfile, `${name},${date},${contact}\n`);
      
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
}