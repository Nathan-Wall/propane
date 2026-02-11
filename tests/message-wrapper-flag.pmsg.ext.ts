import { Flag$Base } from './message-wrapper-flag.pmsg.base.js';

export class Flag extends Flag$Base {
  static override $serialize(value: boolean): string {
    if (typeof value !== 'boolean') {
      throw new TypeError('Flag.$serialize expects a boolean.');
    }
    return value ? '1' : '0';
  }

  static override $deserialize(value: string): boolean {
    if (value === '1') return true;
    if (value === '0') return false;
    throw new Error('Flag.$deserialize expects "1" or "0".');
  }
}
