import { test, expect } from 'vitest';

test('env test', () => {
  const orig = import.meta.env.DEV;
  console.log('original:', orig);
  // @ts-ignore
  import.meta.env.DEV = false;
  console.log('changed:', import.meta.env.DEV);
  // @ts-ignore
  import.meta.env.DEV = orig;
});
