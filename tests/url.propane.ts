/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/url.propane
import { Message, MessagePropDescriptor, ImmutableArray, ImmutableUrl } from "@propanejs/runtime";
export class UrlMessage extends Message<UrlMessage.Data> {
  static TYPE_TAG = Symbol("UrlMessage");
  static EMPTY: UrlMessage;
  #id: number;
  #primary: ImmutableUrl;
  #secondary: ImmutableUrl;
  #links: ImmutableArray<ImmutableUrl>;
  constructor(props?: UrlMessage.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && UrlMessage.EMPTY) return UrlMessage.EMPTY;
    super(UrlMessage.TYPE_TAG, "UrlMessage", listeners);
    this.#id = props ? props.id : 0;
    this.#primary = props ? props.primary instanceof ImmutableUrl ? props.primary : new ImmutableUrl(props.primary) : new ImmutableUrl("about:blank");
    this.#secondary = props ? props.secondary === undefined ? undefined : props.secondary instanceof ImmutableUrl ? props.secondary : new ImmutableUrl(props.secondary) : undefined;
    this.#links = props ? props.links === undefined || props.links === null ? props.links : props.links instanceof ImmutableArray ? props.links : new ImmutableArray(props.links) : Object.freeze([]);
    if (!props && !listeners) UrlMessage.EMPTY = this;
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
    if (!(primaryValue instanceof URL || primaryValue instanceof ImmutableUrl || Object.prototype.toString.call(primaryValue) === "[object URL]" || Object.prototype.toString.call(primaryValue) === "[object ImmutableUrl]")) throw new Error("Invalid value for property \"primary\".");
    props.primary = primaryValue;
    const secondaryValue = entries["3"] === undefined ? entries["secondary"] : entries["3"];
    const secondaryNormalized = secondaryValue === null ? undefined : secondaryValue;
    if (secondaryNormalized !== undefined && !(secondaryNormalized instanceof URL || secondaryNormalized instanceof ImmutableUrl || Object.prototype.toString.call(secondaryNormalized) === "[object URL]" || Object.prototype.toString.call(secondaryNormalized) === "[object ImmutableUrl]")) throw new Error("Invalid value for property \"secondary\".");
    props.secondary = secondaryNormalized;
    const linksValue = entries["4"] === undefined ? entries["links"] : entries["4"];
    if (linksValue === undefined) throw new Error("Missing required property \"links\".");
    const linksArrayValue = linksValue === undefined || linksValue === null ? linksValue : linksValue instanceof ImmutableArray ? linksValue : new ImmutableArray(linksValue);
    if (!((linksArrayValue instanceof ImmutableArray || Object.prototype.toString.call(linksArrayValue) === "[object ImmutableArray]" || Array.isArray(linksArrayValue)) && [...linksArrayValue].every(element => element instanceof URL || element instanceof ImmutableUrl || Object.prototype.toString.call(element) === "[object URL]" || Object.prototype.toString.call(element) === "[object ImmutableUrl]"))) throw new Error("Invalid value for property \"links\".");
    props.links = linksArrayValue;
    return props as UrlMessage.Data;
  }
  get id(): number {
    return this.#id;
  }
  get primary(): ImmutableUrl {
    return this.#primary;
  }
  get secondary(): ImmutableUrl {
    return this.#secondary;
  }
  get links(): ImmutableArray<ImmutableUrl> {
    return this.#links;
  }
  copyWithinLinks(target: number, start: number, end?: number): UrlMessage {
    const linksArray = this.#links;
    const linksNext = [...linksArray];
    linksNext.copyWithin(target, start, end);
    return this.$update(new UrlMessage({
      id: this.#id,
      primary: this.#primary,
      secondary: this.#secondary,
      links: linksNext
    }, this.$listeners));
  }
  deleteSecondary(): UrlMessage {
    return this.$update(new UrlMessage({
      id: this.#id,
      primary: this.#primary,
      links: this.#links
    }, this.$listeners));
  }
  fillLinks(value: URL, start?: number, end?: number): UrlMessage {
    const linksArray = this.#links;
    const linksNext = [...linksArray];
    linksNext.fill(value, start, end);
    return this.$update(new UrlMessage({
      id: this.#id,
      primary: this.#primary,
      secondary: this.#secondary,
      links: linksNext
    }, this.$listeners));
  }
  popLinks(): UrlMessage {
    if ((this.links ?? []).length === 0) return this;
    const linksArray = this.#links;
    const linksNext = [...linksArray];
    linksNext.pop();
    return this.$update(new UrlMessage({
      id: this.#id,
      primary: this.#primary,
      secondary: this.#secondary,
      links: linksNext
    }, this.$listeners));
  }
  pushLinks(...values): UrlMessage {
    if (values.length === 0) return this;
    const linksArray = this.#links;
    const linksNext = [...linksArray, ...values];
    return this.$update(new UrlMessage({
      id: this.#id,
      primary: this.#primary,
      secondary: this.#secondary,
      links: linksNext
    }, this.$listeners));
  }
  reverseLinks(): UrlMessage {
    const linksArray = this.#links;
    const linksNext = [...linksArray];
    linksNext.reverse();
    return this.$update(new UrlMessage({
      id: this.#id,
      primary: this.#primary,
      secondary: this.#secondary,
      links: linksNext
    }, this.$listeners));
  }
  setId(value: number): UrlMessage {
    return this.$update(new UrlMessage({
      id: value,
      primary: this.#primary,
      secondary: this.#secondary,
      links: this.#links
    }, this.$listeners));
  }
  setLinks(value: URL[] | Iterable<URL>): UrlMessage {
    return this.$update(new UrlMessage({
      id: this.#id,
      primary: this.#primary,
      secondary: this.#secondary,
      links: value
    }, this.$listeners));
  }
  setPrimary(value: ImmutableUrl | URL): UrlMessage {
    return this.$update(new UrlMessage({
      id: this.#id,
      primary: value,
      secondary: this.#secondary,
      links: this.#links
    }, this.$listeners));
  }
  setSecondary(value: ImmutableUrl | URL): UrlMessage {
    return this.$update(new UrlMessage({
      id: this.#id,
      primary: this.#primary,
      secondary: value,
      links: this.#links
    }, this.$listeners));
  }
  shiftLinks(): UrlMessage {
    if ((this.links ?? []).length === 0) return this;
    const linksArray = this.#links;
    const linksNext = [...linksArray];
    linksNext.shift();
    return this.$update(new UrlMessage({
      id: this.#id,
      primary: this.#primary,
      secondary: this.#secondary,
      links: linksNext
    }, this.$listeners));
  }
  sortLinks(compareFn?: (a: URL, b: URL) => number): UrlMessage {
    const linksArray = this.#links;
    const linksNext = [...linksArray];
    linksNext.sort(compareFn);
    return this.$update(new UrlMessage({
      id: this.#id,
      primary: this.#primary,
      secondary: this.#secondary,
      links: linksNext
    }, this.$listeners));
  }
  spliceLinks(start: number, deleteCount?: number, ...items): UrlMessage {
    const linksArray = this.#links;
    const linksNext = [...linksArray];
    linksNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new UrlMessage({
      id: this.#id,
      primary: this.#primary,
      secondary: this.#secondary,
      links: linksNext
    }, this.$listeners));
  }
  unshiftLinks(...values): UrlMessage {
    if (values.length === 0) return this;
    const linksArray = this.#links;
    const linksNext = [...values, ...linksArray];
    return this.$update(new UrlMessage({
      id: this.#id,
      primary: this.#primary,
      secondary: this.#secondary,
      links: linksNext
    }, this.$listeners));
  }
}
export namespace UrlMessage {
  export interface Data {
    id: number;
    primary: ImmutableUrl | URL;
    secondary?: ImmutableUrl | URL | undefined;
    links: URL[] | Iterable<URL>;
  }
  export type Value = UrlMessage | UrlMessage.Data;
}