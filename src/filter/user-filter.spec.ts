import { UserFilter, UserFilterEntry, FilterProperty } from './user-filter';
import { User } from '../user/user.entity';

describe('UserFilter', () => {
  let provider: UserFilter;
  
  beforeAll(async () => {
    provider = new UserFilter([]);
  });
  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('Parsing filter entries', () => {

    it('should be called on a defined object', () => {
      expect(provider).toBeDefined();
    });

    it('should result in a defined function', () => {
      const theFilter = provider.filterFromEntry({
        property: 'name' as FilterProperty,
        relation: 'equals',
        target: 'foo'
      });

      expect(theFilter).toBeDefined();
      expect(theFilter).toBeInstanceOf(Function);
    });

    it('should throw on an invalid relation', () => {
      expect(() => provider.filterFromEntry({
        property: 'name',
        relation: 'invalid',
        target: ''
      })).toThrow();
    });

    it('should correctly filter entries', () => {
      const filterFunction = provider.filterFromEntry({
        property: 'name',
        relation: 'equals',
        target: 'foo'
      });

      const testData = Array.from({length: 5}, (_, i) => {
        const u = new User();
        u.id = i;
        u.name = (i % 2) ? 'foo' : 'bar';
        return u;
      });

      const result = testData.filter(filterFunction);

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result[0].id).toEqual(1);
    });

    it('should apply successive filters on a collection of User entities', () => {
      const names = ['foo', 'bar', 'test', 'whatever', 'something'];
      const servers = ['example.com', 'example.com', 'example.com', 'host.local', 'example.invalid'];

      const testData = names.map((v, i) => {
        const u = new User();
        u.id = i;
        u.name = v;
        u.server = servers[i];
        return u;
      });

      const filterFunctions = [
        { property: 'name' as FilterProperty, relation: 'contains', target: 'a' },
        { property: 'server' as FilterProperty, relation: 'endsWith', target: 'com' }
      ];

      const userFilter = new UserFilter(filterFunctions);

      const result = userFilter.execute(testData);

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result[0].id).toEqual(4);
      expect(result[0].server).toEqual('example.invalid');
    });
  });
});
