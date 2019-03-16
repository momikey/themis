import { GroupFilter, FilterProperty } from './group-filter';
import { Group } from '../group/group.entity';
import { Server } from '../server/server.entity';

describe('GroupFilter', () => {
  let provider: GroupFilter;
  
  beforeAll(async () => {
    provider = new GroupFilter([]);
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
        const g = new Group();
        g.id = i;
        g.name = (i % 2) ? 'foo' : 'bar';
        return g;
      });

      const result = testData.filter(filterFunction);

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result[0].id).toEqual(1);
    });

    // it('should apply successive filters on a collection of Group entities', () => {
    //   const names = ['foo', 'bar', 'test', 'whatever', 'something'];
    //   const servers = ['example.com', 'example.com', 'example.com', 'host.local', 'example.invalid'];

    //   const testData = names.map((v, i) => {
    //     const g = new Group();
    //     g.id = i;
    //     g.name = v;
    //     g.server = { host: servers[i]} as Server;
    //     return g;
    //   });

    //   const filterFunctions = [
    //     { property: 'name' as FilterProperty, relation: 'contains', target: 'a' },
    //     { property: 'server' as FilterProperty, relation: 'endsWith', target: 'com' }
    //   ];

    //   const groupFilter = new GroupFilter(filterFunctions);

    //   const result = groupFilter.execute(testData);

    //   expect(result).toBeDefined();
    //   expect(result).toHaveLength(1);
    //   expect(result[0].id).toEqual(4);
    //   expect(result[0].server).toEqual('example.invalid');
    // });
  });
});
