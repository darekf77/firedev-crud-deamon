//#region imports
//#region @backend
import { WorkersFactor } from 'background-worker-process';
//#endregion
//#region isomorphic
import { FiredevCrud, FiredevCrudInitOptions } from 'firedev-crud';
import { Morphi } from 'morphi';
import { Helpers } from 'tnp-helpers';
import { Models } from 'tnp-models';
import { CLASS } from 'typescript-class-helpers';
import { PortsController, PortInstance } from 'firedev-ports';
//#endregion
import { DbUpdateProjectEntity } from './daemon-entity';
import { DbDaemonController } from './deamon-controller';
//#endregion
declare const global: any;

@CLASS.NAME('FiredevCrudDeamon')
export class FiredevCrudDeamon extends FiredevCrud {
  //#region fields & getters
  public worker: DbDaemonController;
  public context: Morphi.FrameworkContext;
  //#endregion

  //#region constructor
  constructor(
    protected controllers: (typeof Models.db.BaseController)[] = [],
    protected entities: (typeof Models.db.DBBaseEntity)[] = [],
  ) {
    super(controllers, entities);
    //#region @backend
    controllers.push(PortsController);
    entities.push(PortInstance);
    this.entities = Helpers.arrays.uniqArray(entities);
    this.controllers = Helpers.arrays.uniqArray(controllers);
    //#endregion
  }
  //#endregion

  //#region api

  //#region  api / ports manager
  async getPortsManager() {
    const portsManager = await (await this.getCtrlInstanceBy<PortsController>(PortsController as any).manager);
    return portsManager;
  }
  //#endregion

  //#region api / init
  async init(options?: FiredevCrudInitOptions) {
    //#region @backend
    await super.init(options);
    if (global.useWorker) {
      await this.initDeamon(options.recreate || global.restartWorker);
    }
    //#endregion
  }
  //#endregion

  //#region api / create instance
  private async createInstance(classFN, entities, registerdOnPort, startNew: boolean) {
    //#region @backendFunc
    const res = await WorkersFactor.create<DbDaemonController>(
      classFN,
      entities,
      registerdOnPort,
      {
        killAlreadRegisteredProcess: startNew,
        startWorkerServiceAsChildProcess: startNew,
        disabledRealtime: false,
        preventSameContexts: true,
      }
    );
    if (process.platform === 'win32' && startNew) {
      Helpers.info('Waiting 10 seconds on windows platofrom...');
      Helpers.sleep(10);
    }
    return res;
    //#endregion
  }
  //#endregion

  //#region api / init deamon
  async initDeamon(recreate = false) {
    //#region @backend
    const entities = [DbUpdateProjectEntity];
    const portsManager = await (await this.getCtrlInstanceBy<PortsController>(PortsController)).manager;
    await portsManager.registerOnFreePort({
      name: CLASS.getName(DbDaemonController)
    }, {
      actionWhenAssignedPort: async (itWasRegisterd, registerdOnPort) => {

        Helpers.log(`[tnp-db][deamon] ${itWasRegisterd ? 'already' : 'inited'} on port: ${registerdOnPort}`);
        let res = await this.createInstance(
          DbDaemonController,
          entities,
          registerdOnPort,
          (!itWasRegisterd || recreate)
        );

        const isHealtyWorker = await res.instance.$$healty;
        const copyDataToWorker = (!itWasRegisterd || recreate || !isHealtyWorker);

        if (!isHealtyWorker) {
          res.context.destroy();
          res = await this.createInstance(
            DbDaemonController,
            entities,
            registerdOnPort,
            true
          );
        }
        if (copyDataToWorker) {
          const allData = Helpers.readJson(this.location);
          await res.instance.copyAllToWorker(allData, this.location).received;
        }

        this.context = res.context;
        this.worker = res.instance;
      }
    });

    // process.exit(0)
    // const copyRes = await this.worker.copyAllToWorker(await this.getAll(ProjectInstance)).received;
    // console.log(copyRes.body.text);
    //#endregion
  }
  //#endregion

  //#region api / get worker port
  async getWokerPort() {
    //#region @backendFunc
    const portsManager = await (await this.getCtrlInstanceBy<PortsController>(PortsController)).manager;
    return await portsManager.getPortOf({ name: CLASS.getName(DbDaemonController) });
    //#endregion
  }
  //#endregion

  //#region api / kill worker
  async killWorker() {
    //#region @backend
    const portsManager = await this.getPortsManager();
    Helpers.log(`[killing worker] starting killing db worker...`);
    try {
      await this.worker.triggerSave().received;
      Helpers.log(`[killing worker] trigerr save OK`);
    } catch (error) {
      Helpers.log(`[killing worker] trigerr save ERROR`);
    }
    const portTokill = await portsManager.getPortOf({ name: CLASS.getName(DbDaemonController) });
    await Helpers.killProcessByPort(portTokill);
    //#endregion
  }
  //#endregion

  //#endregion
}
