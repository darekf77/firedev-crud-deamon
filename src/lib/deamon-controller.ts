// // @ts-nocheck
// //#region imports
// //#region isomorphic
// import { Morphi as Firedev } from 'morphi';
// import {
//   _, moment,
//   //#region @backend
//   crossPlatformPath,
//   path,
//   //#endregion
// } from 'tnp-core';
// import { Helpers } from 'tnp-helpers';
// //#endregion
// //#region @backend
// import { DbUpdateProjectEntity } from './daemon-entity';
// import { IDBCrud } from 'firedev-crud';
// import { BootstrapWorker } from 'background-worker-process';
// import { WorkerProcessClass } from 'background-worker-process';
// //#endregion
// //#endregion

// const TEXT_AREA_CSS = 'style="width: 772px; min-height: 50px;"';

// @Firedev.Controller({
//   className: 'DbDaemonController'
// })
// export class DbDaemonController
//   //#region @backend
//   extends WorkerProcessClass implements Firedev.BASE_CONTROLLER_INIT, IDBCrud
// //#endregion
// {
//   //#region fields / getters
//   logArr = [];
//   pathToDb: string;
//   private _data: any = {
//     projects: [
//       'test1'
//     ]
//   };
//   get data() {
//     return this._data;
//   }
//   //#region @backend
//   get filename() {
//     return crossPlatformPath(__filename);
//   }
//   //#endregion

//   //#endregion

//   //#region methods

//   //#region methods / log
//   log(msg: string) {
//     //#region @backend
//     msg = `<strong>[${moment().format()}]</strong> ${msg}`;
//     Helpers.log(msg);
//     this.logArr.push(msg);
//     //#endregion
//   }
//   //#endregion

//   //#region methods / debounce
//   //#region @backend
//   private debounce(fn: any) {
//     return _.debounce(fn, 1000);
//   }
//   //#endregion
//   //#endregion

//   //#region methods / save to file action

//   private saveToFileAction() {
//     //#region @backend
//     const pathToDb = (_.isString(this.pathToDb) && this.pathToDb.endsWith('.json')) ? this.pathToDb :
//       path.join(process.cwd(), 'tmp-worker-db.json');
//     Helpers.writeFile(pathToDb, this.data);
//     this.log(`[debounce] Data update in db in <a href="file://${pathToDb}">${pathToDb}</a>`);
//     //#endregion
//   }
//   //#endregion

//   //#region methods / save to file dobounce action
//   //#region @backend
//   private saveToFileDebounceAction = this.debounce(() => {
//     this.saveToFileAction();
//   });
//   //#endregion
//   //#endregion

//   //#region methods / read
//   read = async () => {
//     // no needed here
//   };
//   //#endregion

//   //#region methods / default write to db
//   @Firedev.Http.POST('/defaults')
//   defaultsWriteToDB(@Firedev.Http.Param.Body('data') data: any): Firedev.Response<any> {
//     //#region @backendFunc
//     return async (req, res) => {
//       this.log(`defaultsWriteToDB: <br>${JSON.stringify(data)} `);
//       _.keys(data).forEach(key => {
//         this.data[key] = data[key];
//       });
//       this.saveToFileDebounceAction();
//       return data;
//     }
//     //#endregion
//   }
//   //#endregion

//   //#region methods / defaults
//   defaults = (data: any) => {
//     return {
//       write: async () => {
//         const result = await this.defaultsWriteToDB(data).received;
//         return result.body.json;
//       }
//     }
//   };
//   //#endregion

//   //#region methods / trigger save
//   @Firedev.Http.PUT('/save')
//   triggerSave(): Firedev.Response<any> {
//     //#region @backendFunc
//     return async () => {
//       this.log(`[triggerSave]`)
//       this.saveToFileAction();
//     }
//     //#endregion
//   }
//   //#endregion

//   //#region methods / trigger change of projects
//   @Firedev.Http.GET()
//   triggerChangeOfProject(
//     @Firedev.Http.Param.Query('location') location: string,
//     @Firedev.Http.Param.Query('channel') channel: string,
//   ): Firedev.Response<any> {
//     //#region @backendFunc
//     return async () => {
//       this.logArr = [];
//       if (channel) {
//         this.log(`[TrigggerEntityPropertyChanges] for locatino: "${location}", channel: "${channel}"`);
//         const a = DbUpdateProjectEntity.for({ location } as any);
//         Firedev.Realtime.Server.TrigggerEntityPropertyChanges(a, channel);
//       } else {
//         this.log(`[triggerChangeOfProject] for locatino: "${location}"`)
//         Firedev.Realtime.Server.TrigggerEntityChanges(DbUpdateProjectEntity, location);
//       }

//     }
//     //#endregion
//   }
//   //#endregion

//   //#region methods / set value to db
//   @Firedev.Http.PUT('/set')
//   setValueToDb(
//     @Firedev.Http.Param.Query('objPath') objPath: string,
//     @Firedev.Http.Param.Body('json') json: object): Firedev.Response<any> {
//     //#region @backendFunc
//     return async (req, res) => {
//       this.log(`[setValueToDb] key ${objPath} = <br> <textarea ${TEXT_AREA_CSS} >${JSON.stringify(json, null, 4)
//         }</textarea> `);
//       _.set(this.data, objPath, json);
//       this.saveToFileDebounceAction();
//       return this.data[objPath];
//     }
//     //#endregion
//   }
//   //#endregion

//   //#region methods / set
//   set = (objPath: string, json: object) => {
//     return {
//       write: async () => {
//         const result = await this.setValueToDb(objPath, json).received;
//         return result.body.json;
//       }
//     }
//   };
//   //#endregion

//   //#region methods / get value from db
//   @Firedev.Http.GET('/get')
//   getValueFromDb(@Firedev.Http.Param.Query('objPath') objPath: string): Firedev.Response<any> {
//     //#region @backendFunc
//     return async (req, res) => {
//       this.log(`[getValueFromDb] key ${objPath} = <br> <textarea ${TEXT_AREA_CSS} >${this.data[objPath] ? JSON.stringify(this.data[objPath]) : '<nothing>'
//         }</textarea> `)
//       return _.get(this.data, objPath);
//     }
//     //#endregion
//   }
//   //#endregion

//   //#region methods / get
//   get = (objPath: string) => {
//     return {
//       value: async () => {
//         const result = await this.getValueFromDb(objPath).received;
//         return result.body.json;
//       }
//     }
//   };
//   //#endregion

//   //#region methods / copy all to worker
//   //#region @backend

//   @Firedev.Http.POST()
//   copyAllToWorker(
//     @Firedev.Http.Param.Body('data') data: any,
//     @Firedev.Http.Param.Query('pathToDb') pathToDb: string
//   ): Firedev.Response<any> {
//     return async (req, res) => {
//       this.log(`[copyAllToWorker]`)
//       if (Helpers.exists(pathToDb)) {
//         this.pathToDb = pathToDb;
//       }
//       _.keys(data).forEach(key => {
//         this.data[key] = data[key];
//       });
//       this.saveToFileDebounceAction();
//       return this.data;
//     }
//   }
//   //#endregion
//   //#endregion

//   //#region methods / hello
//   @Firedev.Http.GET()
//   hello(): Firedev.Response {
//     //#region @backendFunc
//     this.log(`[hello]`)
//     return async (req, res) => 'hello';
//     //#endregion
//   }
//   //#endregion

//   //#region methods / all projects
//   @Firedev.Http.GET()
//   allprojects(): Firedev.Response<any> {
//     //#region @backendFunc
//     return async (req, res) => {
//       // const db = TnpDB.InstanceSync;
//       // const projects = (await db.getProjects()).map(p => {
//       //   return Project.From(p.locationOfProject);
//       // });
//       // return projects;
//       return [];
//     }
//     //#endregion
//   }
//   //#endregion

//   //#region methods / info
//   @Firedev.Http.GET('/info')
//   info(): Firedev.Response<string> {
//     return async () => {
//       this.log(`[info]`)
//       return `

//      <h1><a href="log" > log </a> </h1>
//      <h1><a href="wholeDb" > whole json db </a> </h1>

//      `
//     }
//   }
//   //#endregion

//   //#region methods / show log
//   @Firedev.Http.GET('/log')
//   showLog(): Firedev.Response<string> {
//     return async () => {
//       this.log(`[showLog]`)
//       return this.logArr.join('<hr>')
//     }
//   }
//   //#endregion

//   //#region methods / whole db
//   @Firedev.Http.GET('/wholeDb')
//   wholeDb() {
//     //#region @backendFunc
//     return async () => {
//       this.log(`[wholeDb]`)
//       return JSON.stringify(this.data);
//     }
//     //#endregion
//   }
//   //#endregion

//   //#region methods / whole db with paths
//   @Firedev.Http.GET('/wholeDb/:pathToData')
//   wholeDbWithPath(@Firedev.Http.Param.Path('pathToData') pathToData: string) {
//     //#region @backendFunc
//     return async () => {
//       this.log(`[wholeDb]`)
//       const data = _.get(this.data, pathToData, {});
//       return JSON.stringify(data);
//     }
//     //#endregion
//   }
//   //#endregion

//   //#region methods/ show entity
//   @Firedev.Http.GET('/entity/:entityname')
//   showEntity(@Firedev.Http.Param.Path('entityname') entityname: string): Firedev.Response<string> {
//     //#region @backendFunc
//     return async () => {
//       const entity = this.data[entityname];
//       if (_.isUndefined(entity)) {
//         return `no entity by name: ${entityname}`;
//       }
//       this.log(`[showEntity] entity: ${entityname}`)
//       return JSON.stringify(entity);
//     }
//     //#endregion
//   }
//   //#endregion

//   //#region methods / init example data
//   async initExampleDbData() {
//     this.log(`[initExampleDbData]`)
//   }
//   //#endregion

//   //#endregion

// }

// //#region @backend
// export default BootstrapWorker.bootstrap(DbDaemonController);
// //#endregion
