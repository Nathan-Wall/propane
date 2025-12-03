import { Person$Base } from './extend-basic.propane.ts';

/**
 * Extended Person class with custom getters and methods.
 */
export class Person extends Person$Base {
  /**
   * Get the full name of the person.
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Check if the person is an adult (18 or older).
   */
  get isAdult(): boolean {
    return this.age >= 18;
  }

  /**
   * Get a greeting for the person.
   */
  greet(): string {
    return `Hello, ${this.fullName}!`;
  }
}
