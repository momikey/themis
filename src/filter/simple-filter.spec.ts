import * as SimpleFilter from './simple-filter';

describe('SimpleFilter', () => {
  it('should be defined', () => {
    expect(SimpleFilter).toBeTruthy();
  });
});

  // Note that, for many test cases, we'll have to use "any",
  // but I think it'll be okay.
  const testData = {
    'string': 'foo',
    'number': 42,
    'object': {
      a: 1,
      b: 2,
      c: 3
    },
    'truthy': true,
    'bad': undefined,
    'worse': null
  }
  
  describe('Unary filter function', () => {
  test('always should always return true', () => {
    const filter = SimpleFilter.always<any>();

    for (const d in testData) {
      expect(filter(testData[d])).toBeTruthy();
    }
  });

  test('never should always return false', () => {
    const filter = SimpleFilter.never<any>();

    for (const d in testData) {      
      expect(filter(testData[d])).toBeFalsy();
    }
  });

  test("defined should pass only values that aren't undefined", () => {
    const filter = SimpleFilter.defined<any>();

    for (const d in testData) {
      const value = testData[d];
      if (value !== undefined) {
        expect(filter(value)).toBeTruthy();
      } else {
        expect(filter(value)).toBeFalsy();
      }
    }
  });

  test('truthy should pass only values that are truthy', () => {
    const filter = SimpleFilter.truthy<any>();

    for (const d in testData) {
      const value = testData[d];
      if (value) {
        expect(filter(value)).toBeTruthy();
      } else {
        expect(filter(value)).toBeFalsy();
      }
    }
  });
});

describe('Binary filter function', () => {
  test('equalTo should pass only values that are exactly equal', () => {
    const numberFilter = SimpleFilter.equalTo(testData.number);

    expect(numberFilter(42)).toBeTruthy();
    expect(numberFilter(0)).toBeFalsy();

    const nullFilter = SimpleFilter.equalTo(testData.worse);

    expect(nullFilter(null)).toBeTruthy();
    expect(nullFilter(undefined)).toBeFalsy();
  });

  test('notEqualTo should pass only values that are *not* exactly equal', () => {
    const numberFilter = SimpleFilter.notEqualTo(testData.number);

    expect(numberFilter(42)).toBeFalsy();
    expect(numberFilter(0)).toBeTruthy();

    const nullFilter = SimpleFilter.notEqualTo(testData.worse);

    expect(nullFilter(null)).toBeFalsy();
    expect(nullFilter(undefined)).toBeTruthy();
  });

  test('hasProperty should pass only objects that have the given property', () => {
    const propertyFilter = SimpleFilter.hasProperty('a');

    expect(propertyFilter(testData)).toBeFalsy();
    expect(propertyFilter(testData.object)).toBeTruthy();
  });
});

describe('Number comparison function', () => {
  test('greaterThan should pass only values greater than the target', () => {
    const filter = SimpleFilter.greaterThan(5);

    expect(filter(testData.number)).toBeTruthy();
  });

  test('lessThan should pass only values less than the target', () => {
    const filter = SimpleFilter.lessThan(0);

    expect(filter(testData.number)).toBeFalsy();
  });
});

describe('String comparison function', () => {
  test('includes should pass only strings that contain the target', () => {
    const filter = SimpleFilter.includes('oo');

    expect(filter(testData.string)).toBeTruthy();
  });

  test('includes and contains should be the same', () => {
    expect(SimpleFilter.includes).toStrictEqual(SimpleFilter.contains);
  });

  test('startsWith should pass only strings that begin with the target', () => {
    const filter = SimpleFilter.startsWith('f');

    expect(filter(testData.string)).toBeTruthy();
  });

  test('endsWith should pass only strings that end with the target', () => {
    const filter = SimpleFilter.endsWith('bar');

    expect(filter(testData.string)).toBeFalsy();
  });

  test('matches should pass only strings that match the given regex', () => {
    const filter = SimpleFilter.matches(/o+/);

    expect(filter(testData.string)).toBeTruthy();
  });
});

describe('Object property adapter', () => {
  test('should allow a filter function to match the given property of an object', () => {
    const originalFilter = SimpleFilter.greaterThan(1);
    const adaptA = SimpleFilter.propertyFilter('a', originalFilter);
    const adaptB = SimpleFilter.propertyFilter('b', originalFilter);
    const adaptC = SimpleFilter.propertyFilter('c', originalFilter);
    const adaptD = SimpleFilter.propertyFilter('d', originalFilter);

    expect(adaptA(testData.object)).toBeFalsy();
    expect(adaptB(testData.object)).toBeTruthy();
    expect(adaptC(testData.object)).toBeTruthy();

    // Have to use a function here, to make sure Jest picks up the exception
    expect(() => adaptD(testData.object)).toThrow();
  });
});