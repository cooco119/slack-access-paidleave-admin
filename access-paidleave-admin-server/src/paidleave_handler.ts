import * as fs from 'fs';
const Papa = require('papaparse');

export default class PaidleaveHandler {
  csvfilePrefix: string = process.cwd().toString() + '/../../data/paidleave/';

  private getNameList(){
    return fs.readdirSync(this.csvfilePrefix);
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
              'year': element[1],
              'month': element[2],
              'day': element[3],
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
}