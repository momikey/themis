import { Test, TestingModule } from '@nestjs/testing';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { NotFoundException } from '@nestjs/common';
import { Group } from '../entities/group.entity';
import { CreateGroupDto } from '../dtos/create-group.dto';
import { UpdateGroupDto } from '../dtos/update-group.dto';

jest.mock('./group.service');

describe('Group Controller', () => {
  let module: TestingModule;
  let controller: GroupController;
  let service: jest.Mocked<GroupService>;
  
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [GroupController],
      providers: [GroupService]
    }).compile();

    service = module.get<GroupService>(GroupService) as jest.Mocked<GroupService>;
    controller = module.get<GroupController>(GroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('successfully connects to service', async () => {
    expect(controller.findAll).toBeDefined();
    expect(await controller.findAll()).toBeUndefined();
  });

  describe('Method testing', () => {
    beforeAll(async () => {
      const data = [
        { id: 1, name: 'first', server: 'example.com', displayName: 'First test', summary: '' } as any as Group,
        { id: 2, name: 'second', server: 'example.invalid', displayName: 'Foreign', summary: '' } as any as Group,
      ];

      service.findAll.mockImplementation(() => Promise.resolve(data));
      service.findByName.mockImplementation((name: string) => 
        Promise.resolve(data.find((e) => e.name === name)));
      service.create.mockImplementation((group: CreateGroupDto) => {
        const result = Object.assign({id: data.length + 1} as Group, group);
        return Promise.resolve(result);
      });
      service.update.mockImplementation(async (group: UpdateGroupDto) => {
        if (data.find((e) => e.id === group.id)) {
          return group as any as Group;
        } else {
          throw new Error('Invalid group to update');
        }
      });
      service.delete.mockImplementation(async (id: number) => {
        return data.find((e) => e.id === id);
      });
    });

    it('findAll (plain GET) should return all groups', async () => {
      const result = await controller.findAll();

      expect(result.length).toBe(2);
      expect(result[0].id).toBe(1);
      expect(result[1].name).toMatch('second');
    });

    it('find (single-group GET) should return only the given group', async () => {
      const result = await controller.find('first');

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.server).toMatch('example.com');
    });

    it('create (POST to create-group) should return the new group', async () => {
      const result = await controller.create({
        name: 'third',
        displayName: 'Third testing group',
        server: '',
        summary: '',
      });

      expect(result).toBeDefined();
      expect(result.id).toBe(3);
    });

    it('update (PUT to update-group) should return the updated group', async () => {
      const result = await controller.update({
        id: 1,
        name: 'first',
        displayName: 'First test group',
        server: 'example.com',
        summary: 'This is a test',
        date: JSON.stringify(Date.now())
      });

      expect(result).toBeDefined();
      expect(result.summary).toMatch(/test/);
    });

    it('delete (DELETE to delete-group) should return the deleted group', async () => {
      const result = await controller.delete(2);

      expect(result).toBeDefined();
      expect(result.id).toBe(2);
    });
  });

  describe('Error handling', () => {
    it("finding a group that doesn't exist should return 404", async () => {
      service.findByName.mockImplementation(async (name: string) => {
        if (name === 'good') {
          return new Group();
        } else {
          return undefined;
        }
      });

      const goodResult = await controller.find('good');
      expect(goodResult).toBeDefined();
      expect(goodResult).toBeInstanceOf(Group);

      try {
        await controller.find('bad');
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
    
    it('asking for top-level posts of a nonexistent group should return 404', async () => {
      service.getTopLevelPosts.mockImplementation(async (name: string) => {
        if (name === 'good') {
          return [];
        } else {
          return undefined;
        }
      });

      const goodResult = await controller.getTopLevelByName('good');
      expect(goodResult).toBeDefined();
      expect(goodResult).toBeInstanceOf(Array);

      try {
        await controller.find('bad');
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });

    // TODO: More tests
  });
});
