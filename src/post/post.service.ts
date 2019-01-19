import { Injectable, BadRequestException } from '@nestjs/common';
import { Repository, getRepository, Like } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './create-post.dto';
import { ConfigService } from '../config/config.service';
import * as uuidv5 from 'uuid/v5';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { GroupService } from '../group/group.service';

@Injectable()
export class PostService {
    constructor(
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
        private readonly configService: ConfigService,
        private readonly userService: UserService,
        private readonly groupService: GroupService
    ) {}

    async create(post: CreatePostDto) {
        const postEntity = this.postRepository.create({
            uuid: this.createNewUuid(post.subject + post.content + post.sender),
            sender: await this.userService.findByName(post.sender),
            server: post.server,
            subject: post.subject,
            parentUri: post.parent,
            groups: [post.primaryGroup].concat(post.ccGroups),
            content: post.content,
            source: post.source
        });

        return await this.postRepository.save(postEntity);
    }

    // Create a new top-level (parent-less) post.
    // TODO: Work out the type object
    async createTopLevel(post: any): Promise<Post> {
        const postEntity = await this.createPostEntity(post);

        return this.postRepository.save(postEntity);
    }

    // Create a reply to the post with the given UUID.
    // TODO: Work out the type object
    async createReply(post: any, parent: string): Promise<Post> {
        const user = await this.userService.findByName(post.sender);
        const parentPost = await this.postRepository.findOneOrFail({ uuid: parent });

        if (!parentPost) {
            // The given UUID isn't a valid post, which usually means something's wrong
            // TODO: Handle the error
            throw new BadRequestException();
        }

        // TODO: Handle crossposting
        const postedGroups = await this.groupService.findByIds([post.group]);

        const postEntity = await this.createPostEntity(post);
        postEntity.parent = parentPost;

        return this.postRepository.save(postEntity);
    }

    async delete(uuid: string): Promise<Post> {
        const post = await this.postRepository.findOne({ uuid: uuid });

        return await this.postRepository.remove(post);
    }

    async findAll(): Promise<Post[]> {
        return await this.postRepository.find();
    }

    async find(id: number): Promise<Post> {
        return await this.postRepository.findOne(id);
    }

    async findByUuid(uuid: string): Promise<Post> {
        const postEntity = await this.postRepository.findOne({
            where: { uuid },
            relations: ['children']
        });

        const treeRepository = this.postRepository.manager.getTreeRepository(Post)

        if (postEntity.children.length) {
            const response = await this.loadRelations(await treeRepository.findDescendantsTree(postEntity));

            return response;
        } else {
            return postEntity;
        }
    }

    async findByUserId(id: number): Promise<Post[]> {
        const response = await this.postRepository
            .createQueryBuilder("post")
            .leftJoinAndSelect("post.groups", "groups")
            .leftJoinAndSelect("post.sender", "sender")
            .where("sender.id = :id", { id })
            .getMany();

        return response;
    }

    async findByGroup(group: string): Promise<Post[]> {
        const groupEntity = await this.groupService.findByName(group);

        const response = await this.postRepository
            .createQueryBuilder("post")
            // .leftJoinAndSelect("post.groups", "groups")
            // .leftJoinAndSelect("post.sender", "sender")
            .where("groups.id = :id", { id: groupEntity.id })
            .getMany();

        return response;
    }

    async findByGroupId(id: number): Promise<Post[]> {
        const response = await this.postRepository
            .createQueryBuilder("post")
            .leftJoinAndSelect("post.groups", "groups")
            .leftJoinAndSelect("post.sender", "sender")
            .where("groups.id = :id", { id })
            .getMany();

        return response;
    }

    async findTopLevelByGroup(group: string): Promise<Post[]> {
        const groupEntity = await this.groupService.findByName(group);

        const response = await this.postRepository
            .createQueryBuilder("post")
            // .leftJoinAndSelect("post.groups", "groups")
            // .leftJoinAndSelect("post.sender", "sender")
            // .leftJoinAndSelect("post.parent", "parent")
            .where("groups.id = :id", { id: groupEntity.id })
            .andWhere("post.parentId is null")
            .getMany();

        return response;
    }

    async countChildren(parent: Post): Promise<number> {
        const treeRepository = this.postRepository.manager.getTreeRepository(Post);

        return treeRepository.countDescendants(parent);
    }

    async findChildren(parent: Post): Promise<Post> {
        const treeRepository = this.postRepository.manager.getTreeRepository(Post);

        const response = await treeRepository.findDescendantsTree(parent);

        return response;
    }

    uriFromLocalPost(post: Post): string {
        const server = this.configService.serverAddress;

        if (post.uri) {
            // We already have a URI, so just return that
            return post.uri;
        } else if (post.server === server) {
            // It's a local post, so we can make a URI
            return this.uriFromUuid(post.uuid);
        } else {
            // We don't really know what to do
            throw new Error(`No URI found for post ${post.uuid}`);
        }
    }

    uriFromUuid(uuid: string): string {
        const server = this.configService.serverAddress;

        return `https://${server}/posts/${uuid}`;
    }

    createNewUuid(data: any): string {
        const server = this.configService.serverAddress;
        const namespace = uuidv5(server, uuidv5.DNS);

        return uuidv5(Date.now().toString() + data.toString(), namespace);
    }

    private async createPostEntity(post: any) {
        const user = await this.userService.findByName(post.sender);

        // TODO: Handle crossposting
        const postedGroups = await this.groupService.findByIds([post.group]);

        const postEntity = new Post();

        postEntity.sender = user;
        postEntity.groups = postedGroups;
        postEntity.subject = post.subject;
        postEntity.content = post.body;

        postEntity.parentUri = '';
        postEntity.timestamp = (new Date()).toJSON();
        // TODO: Handle federation
        postEntity.server = this.configService.serverAddress;

        postEntity.uuid = this.createNewUuid(post.subject + post.body + post.sender);
        postEntity.uri = this.uriFromLocalPost(postEntity);

        // TODO: Handle post deletion, tombstones, etc.
        postEntity.deleted = false;

        return postEntity;
    }

    // We need this helper method because TypeORM doesn't seem to support
    // loading relations for child nodes in a tree structure.
    private async loadRelations(root: Post): Promise<Post> {
        const result = await this.postRepository.findOne(root.id, {relations : ['children'] });

        if (result.children) {
            result.children = await Promise.all(result.children.map(c => this.loadRelations(c)))
        }

        return result;
    }
}
