import { Window } from 'happy-dom';

const happyDomWindow = new Window();

function defineGlobal(name: string, value: unknown): void {
  Object.defineProperty(globalThis, name, {
    value,
    configurable: true,
    writable: true,
  });
}

defineGlobal('document', happyDomWindow.document);
defineGlobal('window', happyDomWindow);
defineGlobal('navigator', happyDomWindow.navigator);
defineGlobal('HTMLElement', happyDomWindow.HTMLElement);
defineGlobal('Element', happyDomWindow.Element);
defineGlobal('Node', happyDomWindow.Node);
defineGlobal('Text', happyDomWindow.Text);
defineGlobal('DocumentFragment', happyDomWindow.DocumentFragment);
defineGlobal('IS_REACT_ACT_ENVIRONMENT', true);
