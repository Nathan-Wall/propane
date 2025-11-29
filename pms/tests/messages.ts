/**
 * Test message classes for PMS integration tests.
 * In a real application, these would be generated from .propane files.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Message, type MessagePropDescriptor } from '@propanejs/runtime';
import type { RpcRequest } from '../src/types.js';

// --- EchoRequest / EchoResponse ---

export interface EchoRequestData {
  message: string;
  [key: string]: any;
}

export class EchoRequest
  extends Message<EchoRequestData>
  implements RpcRequest<EchoResponse>
{
  static readonly TYPE_TAG = Symbol('EchoRequest');
  readonly __responseType?: EchoResponse;

  #message: string;

  constructor(props?: EchoRequestData) {
    super(EchoRequest.TYPE_TAG, 'EchoRequest');
    this.#message = props?.message ?? '';
  }

  get message(): string {
    return this.#message;
  }

  protected $getPropDescriptors(): MessagePropDescriptor<EchoRequestData>[] {
    return [
      { name: 'message', fieldNumber: 1, getValue: () => this.#message },
    ];
  }

  protected $fromEntries(entries: Record<string, unknown>): EchoRequestData {
    return {
      message: (entries['1'] ?? entries['message']) as string,
    };
  }
}

export interface EchoResponseData {
  echo: string;
  timestamp: number;
  [key: string]: any;
}

export class EchoResponse extends Message<EchoResponseData> {
  static readonly TYPE_TAG = Symbol('EchoResponse');

  #echo: string;
  #timestamp: number;

  constructor(props?: EchoResponseData) {
    super(EchoResponse.TYPE_TAG, 'EchoResponse');
    this.#echo = props?.echo ?? '';
    this.#timestamp = props?.timestamp ?? Date.now();
  }

  get echo(): string {
    return this.#echo;
  }

  get timestamp(): number {
    return this.#timestamp;
  }

  protected $getPropDescriptors(): MessagePropDescriptor<EchoResponseData>[] {
    return [
      { name: 'echo', fieldNumber: 1, getValue: () => this.#echo },
      { name: 'timestamp', fieldNumber: 2, getValue: () => this.#timestamp },
    ];
  }

  protected $fromEntries(entries: Record<string, unknown>): EchoResponseData {
    return {
      echo: (entries['1'] ?? entries['echo']) as string,
      timestamp: (entries['2'] ?? entries['timestamp']) as number,
    };
  }
}

// --- AddRequest / AddResponse ---

export interface AddRequestData {
  a: number;
  b: number;
  [key: string]: any;
}

export class AddRequest
  extends Message<AddRequestData>
  implements RpcRequest<AddResponse>
{
  static readonly TYPE_TAG = Symbol('AddRequest');
  readonly __responseType?: AddResponse;

  #a: number;
  #b: number;

  constructor(props?: AddRequestData) {
    super(AddRequest.TYPE_TAG, 'AddRequest');
    this.#a = props?.a ?? 0;
    this.#b = props?.b ?? 0;
  }

  get a(): number {
    return this.#a;
  }

  get b(): number {
    return this.#b;
  }

  protected $getPropDescriptors(): MessagePropDescriptor<AddRequestData>[] {
    return [
      { name: 'a', fieldNumber: 1, getValue: () => this.#a },
      { name: 'b', fieldNumber: 2, getValue: () => this.#b },
    ];
  }

  protected $fromEntries(entries: Record<string, unknown>): AddRequestData {
    return {
      a: (entries['1'] ?? entries['a']) as number,
      b: (entries['2'] ?? entries['b']) as number,
    };
  }
}

export interface AddResponseData {
  sum: number;
  [key: string]: any;
}

export class AddResponse extends Message<AddResponseData> {
  static readonly TYPE_TAG = Symbol('AddResponse');

  #sum: number;

  constructor(props?: AddResponseData) {
    super(AddResponse.TYPE_TAG, 'AddResponse');
    this.#sum = props?.sum ?? 0;
  }

  get sum(): number {
    return this.#sum;
  }

  protected $getPropDescriptors(): MessagePropDescriptor<AddResponseData>[] {
    return [
      { name: 'sum', fieldNumber: 1, getValue: () => this.#sum },
    ];
  }

  protected $fromEntries(entries: Record<string, unknown>): AddResponseData {
    return {
      sum: (entries['1'] ?? entries['sum']) as number,
    };
  }
}
