export interface PropaneMessageInstance<Props> {
  serialize(): string;
  cerealize(): Props;
}

export interface PropaneMessageConstructor<
  InputProps,
  Instance extends PropaneMessageInstance<OutputProps>,
  OutputProps = InputProps
> {
  new (props: InputProps): Instance;
  deserialize(message: string): Instance;
}
