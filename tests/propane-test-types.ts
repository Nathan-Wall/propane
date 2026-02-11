export interface PropaneMessageInstance<unused_Props> {
  serialize(): string;
}

export interface PropaneMessageConstructor<
  InputProps,
  Instance extends PropaneMessageInstance<OutputProps>,
  OutputProps = InputProps
> {
  new (props: InputProps): Instance;
  deserialize(message: string): Instance;
}
