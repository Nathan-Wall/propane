import { assert } from './assert.ts';
import { UrlMessage } from './url.pmsg.ts';
import { ImmutableUrl } from '../runtime/index.ts';

function serializeUrl(url: URL | ImmutableUrl): string {
  return `U${JSON.stringify(url.toString())}`;
}

export default function runUrlPropaneTests() {
  const primary = new URL('https://example.com/path?a=1');
  const secondary = new URL('https://example.com/secondary');
  const links = [
    new URL('https://alpha.test/'),
    new URL('https://beta.test/resource'),
  ];

  const message = new UrlMessage({
    id: 5,
    primary,
    secondary,
    links,
  });

  const serialized = message.serialize();
  const expectedLinks = links.map(serializeUrl).join(',');
  const expected = `:{5,${serializeUrl(primary)},${serializeUrl(secondary)},[${expectedLinks}]}`;

  assert(serialized === expected, 'URL fields should serialize using U"<href>" tokens.');

  const roundTrip = UrlMessage.deserialize(serialized);

  assert(roundTrip.primary instanceof ImmutableUrl, 'Deserialization should restore ImmutableUrl instances.');
  assert(roundTrip.primary.toString() === primary.toString(), 'Primary URL should round-trip.');
  assert(roundTrip.secondary?.toString() === secondary.toString(), 'Optional URL should round-trip.');

  const roundTripLinks = [...roundTrip.links];
  assert(roundTripLinks.length === links.length, 'URL array should preserve length.');
  assert(roundTripLinks.every((u, i) => u.toString() === links[i].toString()), 'URL array elements should round-trip as URLs.');

  const withoutSecondary = new UrlMessage({ id: 9, primary, links: [] });
  const serializedWithout = withoutSecondary.serialize();
  assert(!serializedWithout.includes('undefined'), 'Optional URL should be omitted when undefined.');

  const roundTripWithout = UrlMessage.deserialize(serializedWithout);
  assert(roundTripWithout.secondary === undefined, 'Missing optional URL should remain undefined.');

  const json = JSON.parse(JSON.stringify(message));
  assert(json.primary === primary.toString(), 'URL should normalize to string in JSON.');
  assert(json.secondary === secondary.toString(), 'Optional URL should normalize to string in JSON.');
  assert(JSON.stringify(json.links) === JSON.stringify(links.map((u) => u.toString())), 'URL arrays should normalize to strings in JSON.');
}
