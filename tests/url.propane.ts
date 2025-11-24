/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/url.propane
import { Message, MessagePropDescriptor, ImmutableArray } from "@propanejs/runtime";
export class UrlMessage extends Message<UrlMessage.Data> {
  static TYPE_TAG = Symbol("UrlMessage");
  static EMPTY: UrlMessage;
  #id: number;
  #primary: URL;
  #secondary: URL;
  #links: ImmutableArray<URL>;
  constructor(props?: UrlMessage.Value) {
    if (!props && UrlMessage.EMPTY) return UrlMessage.EMPTY;
    super(UrlMessage.TYPE_TAG);
    this.#id = props ? props.id : 0;
    this.#primary = props ? props.primary : new URL("about:blank");
    this.#secondary = props ? props.secondary : undefined;
    this.#links = props ? props.links === undefined || props.links === null ? props.links : props.links instanceof ImmutableArray ? props.links : new ImmutableArray(props.links) : Object.freeze([]);
    if (!props) UrlMessage.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<UrlMessage.Data>[] {
    return [{
      name: "id",
      fieldNumber: 1,
      getValue: () => this.#id
    }, {
      name: "primary",
      fieldNumber: 2,
      getValue: () => this.#primary
    }, {
      name: "secondary",
      fieldNumber: 3,
      getValue: () => this.#secondary
    }, {
      name: "links",
      fieldNumber: 4,
      getValue: () => this.#links
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): UrlMessage.Data {
    const props = {} as Partial<UrlMessage.Data>;
    const idValue = entries["1"] === undefined ? entries["id"] : entries["1"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "number")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue;
    const primaryValue = entries["2"] === undefined ? entries["primary"] : entries["2"];
    if (primaryValue === undefined) throw new Error("Missing required property \"primary\".");
    if (!(primaryValue instanceof URL || Object.prototype.toString.call(primaryValue) === "[object URL]")) throw new Error("Invalid value for property \"primary\".");
    props.primary = primaryValue;
    const secondaryValue = entries["3"] === undefined ? entries["secondary"] : entries["3"];
    const secondaryNormalized = secondaryValue === null ? undefined : secondaryValue;
    if (secondaryNormalized !== undefined && !(secondaryNormalized instanceof URL || Object.prototype.toString.call(secondaryNormalized) === "[object URL]")) throw new Error("Invalid value for property \"secondary\".");
    props.secondary = secondaryNormalized;
    const linksValue = entries["4"] === undefined ? entries["links"] : entries["4"];
    if (linksValue === undefined) throw new Error("Missing required property \"links\".");
    const linksArrayValue = linksValue === undefined || linksValue === null ? linksValue : linksValue instanceof ImmutableArray ? linksValue : new ImmutableArray(linksValue);
    if (!((linksArrayValue instanceof ImmutableArray || Object.prototype.toString.call(linksArrayValue) === "[object ImmutableArray]" || Array.isArray(linksArrayValue)) && [...linksArrayValue].every(element => element instanceof URL || Object.prototype.toString.call(element) === "[object URL]"))) throw new Error("Invalid value for property \"links\".");
    props.links = linksArrayValue;
    return props as UrlMessage.Data;
  }
  get id(): number {
    return this.#id;
  }
  get primary(): URL {
    return this.#primary;
  }
  get secondary(): URL {
    return this.#secondary;
  }
  get links(): ImmutableArray<URL> {
    return this.#links;
  }
  copyWithinLinks(target: number, start: number, end?: number): UrlMessage {
    const linksArray = this.#links;
    const linksNext = [...linksArray];
    linksNext.copyWithin(target, start, end);
    return new UrlMessage({
      id: this.#id,
      primary: this.#primary,
      secondary: this.#secondary,
      links: linksNext
    });
  }
  deleteSecondary(): UrlMessage {
    return new UrlMessage({
      id: this.#id,
      primary: this.#primary,
      links: this.#links
    });
  }
  fillLinks(value: URL, start?: number, end?: number): UrlMessage {
    const linksArray = this.#links;
    const linksNext = [...linksArray];
    linksNext.fill(value, start, end);
    return new UrlMessage({
      id: this.#id,
      primary: this.#primary,
      secondary: this.#secondary,
      links: linksNext
    });
  }
  popLinks(): UrlMessage {
    if ((this.links ?? []).length === 0) return this;
    const linksArray = this.#links;
    const linksNext = [...linksArray];
    linksNext.pop();
    return new UrlMessage({
      id: this.#id,
      primary: this.#primary,
      secondary: this.#secondary,
      links: linksNext
    });
  }
  pushLinks(...values): UrlMessage {
    if (values.length === 0) return this;
    const linksArray = this.#links;
    const linksNext = [...linksArray, ...values];
    return new UrlMessage({
      id: this.#id,
      primary: this.#primary,
      secondary: this.#secondary,
      links: linksNext
    });
  }
  reverseLinks(): UrlMessage {
    const linksArray = this.#links;
    const linksNext = [...linksArray];
    linksNext.reverse();
    return new UrlMessage({
      id: this.#id,
      primary: this.#primary,
      secondary: this.#secondary,
      links: linksNext
    });
  }
  setId(value: number): UrlMessage {
    return new UrlMessage({
      id: value,
      primary: this.#primary,
      secondary: this.#secondary,
      links: this.#links
    });
  }
  setLinks(value: URL[] | Iterable<URL>): UrlMessage {
    return new UrlMessage({
      id: this.#id,
      primary: this.#primary,
      secondary: this.#secondary,
      links: value
    });
  }
  setPrimary(value: URL): UrlMessage {
    return new UrlMessage({
      id: this.#id,
      primary: value,
      secondary: this.#secondary,
      links: this.#links
    });
  }
  setSecondary(value: URL): UrlMessage {
    return new UrlMessage({
      id: this.#id,
      primary: this.#primary,
      secondary: value,
      links: this.#links
    });
  }
  shiftLinks(): UrlMessage {
    if ((this.links ?? []).length === 0) return this;
    const linksArray = this.#links;
    const linksNext = [...linksArray];
    linksNext.shift();
    return new UrlMessage({
      id: this.#id,
      primary: this.#primary,
      secondary: this.#secondary,
      links: linksNext
    });
  }
  sortLinks(compareFn?: (a: URL, b: URL) => number): UrlMessage {
    const linksArray = this.#links;
    const linksNext = [...linksArray];
    linksNext.sort(compareFn);
    return new UrlMessage({
      id: this.#id,
      primary: this.#primary,
      secondary: this.#secondary,
      links: linksNext
    });
  }
  spliceLinks(start: number, deleteCount?: number, ...items): UrlMessage {
    const linksArray = this.#links;
    const linksNext = [...linksArray];
    const args = [start];
    if (deleteCount !== undefined) args.push(deleteCount);
    args.push(...items);
    linksNext.splice(...args);
    return new UrlMessage({
      id: this.#id,
      primary: this.#primary,
      secondary: this.#secondary,
      links: linksNext
    });
  }
  unshiftLinks(...values): UrlMessage {
    if (values.length === 0) return this;
    const linksArray = this.#links;
    const linksNext = [...values, ...linksArray];
    return new UrlMessage({
      id: this.#id,
      primary: this.#primary,
      secondary: this.#secondary,
      links: linksNext
    });
  }
}
export namespace UrlMessage {
  export interface Data {
    id: number;
    primary: URL;
    secondary?: URL | undefined;
    links: URL[] | Iterable<URL>;
  }
  export type Value = UrlMessage | UrlMessage.Data;
}