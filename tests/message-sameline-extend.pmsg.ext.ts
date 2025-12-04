import { SameLineExtend$Base } from './message-sameline-extend.pmsg.js';

export class SameLineExtend extends SameLineExtend$Base {
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
