//#region @notForNpm
import { FiredevCrudDeamon } from './lib/firedev-crud-deamon'

export default async function () {
  //#region @backend
  const app = new FiredevCrudDeamon();
  await app.init();
  //#endregion
}
//#endregion
