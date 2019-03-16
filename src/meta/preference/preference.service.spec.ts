import { Test, TestingModule } from '@nestjs/testing';
import { PreferenceService } from './preference.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Preference } from './preference.entity';
import { Repository } from 'typeorm/repository/Repository';

jest.mock('typeorm/repository/Repository');

describe('PreferenceService', () => {
  let service: PreferenceService;
  let repository: jest.Mocked<Repository<Preference>>;
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreferenceService,
        { provide: getRepositoryToken(Preference), useClass: Repository }
      ],
    }).compile();

    service = module.get<PreferenceService>(PreferenceService);
    repository = module.get<Repository<Preference>>(getRepositoryToken(Preference)) as jest.Mocked<Repository<Preference>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Method testing', () => {
    beforeAll(() => {
      repository.findOne.mockImplementation(async (o: {name: string}) => {
        return { name: o.name, value: 'Test value' }
      });

      repository.save.mockImplementation(async (p: Preference) => p);
    });

    it('get should return a valid preference', async () => {
      const result = await service.getPreference('test');

      expect(result).toBeDefined();
      expect(result).toBe('Test value');
    });

    it('set should return the saved preference', async () => {
      const result = await service.setPrefercne('test', 'value');

      expect(result).toBeDefined();
      expect(result).toMatchObject(new Preference);
      expect(result.name).toBe('test');
      expect(result.value).toBe('value');
    });
  });

  describe('Error handling', () => {
    beforeAll(() => {
      repository.findOne.mockImplementation(async (o: {name: string}) => 
        (o.name === 'good'
          ? { name: o.name, value: 'good value' }
          : undefined)
      );
    });

    it('getting a nonexistent preference should throw', async () => {
      const goodResult = await service.getPreference('good');

      expect(goodResult).toBeDefined();
      expect(goodResult).toBe('good value');

      try {
        const badResult = await service.getPreference('bad');
      } catch (e) {
        expect(e).toBeDefined();
        expect(e).toMatch('does not exist');
      }
    });
  });
});
