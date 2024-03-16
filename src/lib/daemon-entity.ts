import * as _ from 'lodash';
import { Morphi as Firedev } from 'morphi';
import { BaseProject as Project } from 'tnp-helpers';

@Firedev.Entity({
  className: 'DbUpdateProjectEntity',
  //#region @backend
  createTable: false
  //#endregion
})
export class DbUpdateProjectEntity extends Firedev.Base.Entity {
  static for(projectOrLocaiton: Project | string) {
    const res = new DbUpdateProjectEntity();
    res.id = _.isString(projectOrLocaiton) ? projectOrLocaiton : projectOrLocaiton.location;
    return res;
  }

  /**
   * location of project
   */
  id: string;

}

