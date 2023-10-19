import { RemoveSpecialChars } from './DataHelper';

describe('RemoveSpecialChars', () => {
  it('should remove carriage return characters from the string', () => {
    const input = 'Hello\rWorld';
    const expectedOutput = 'HelloWorld';
    expect(RemoveSpecialChars(input)).toEqual(expectedOutput);
  });

  it('should remove multiple carriage return characters from the string', () => {
    const input = 'Hello\r\rWorld';
    const expectedOutput = 'HelloWorld';
    expect(RemoveSpecialChars(input)).toEqual(expectedOutput);
  });

  it('should return the same string if there are no carriage return characters', () => {
    const input = 'HelloWorld';
    const expectedOutput = 'HelloWorld';
    expect(RemoveSpecialChars(input)).toEqual(expectedOutput);
  });

  it('should handle empty strings', () => {
    const input = '';
    const expectedOutput = '';
    expect(RemoveSpecialChars(input)).toEqual(expectedOutput);
  });
});