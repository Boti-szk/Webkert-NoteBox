import { ShorterTextPipe } from './shorter-text.pipe';

describe('ShorterTextPipe', () => {
  let pipe: ShorterTextPipe;

  beforeEach(() => {
    pipe = new ShorterTextPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return an empty string if value is empty', () => {
    expect(pipe.transform('')).toEqual('');
  });

  it('should not truncate if string length is less than or equal to limit', () => {
    const text = 'Hello';
    expect(pipe.transform(text, 10)).toEqual(text);
  });

  it('should truncate a long string with default trail', () => {
    const text = 'This is a very long text that needs to be truncated.';
    // Az első 10 karakter: "This is a " és hozzáadja az alapértelmezett "..."
    expect(pipe.transform(text, 10)).toEqual('This is a ...');
  });

  it('should truncate with a custom trail', () => {
    const text = 'Angular is awesome!';
    expect(pipe.transform(text, 7, '~~')).toEqual('Angular~~');
  });
});
