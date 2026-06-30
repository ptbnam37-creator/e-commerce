import { test, expect } from 'vitest';
test('env test', () => {
  console.log(import.meta.env.DEV);
  const orig = import.meta.env.DEV;
  // @ts-ignore
  import.meta.env.DEV = false;
  console.log(import.meta.env.DEV);
  // @ts-ignore
  import.meta.env.DEV = orig;
});
