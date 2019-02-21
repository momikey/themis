import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Activity } from '../definitions/activities/activity.entity';
import { GroupService } from '../../group/group.service';
import { Repository } from 'typeorm';
import { UserService } from '../../user/user.service';
import { PostService } from '../../post/post.service';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class ActivityService {
    constructor(
        @InjectRepository(Activity)
        private readonly activityRepository: Repository<Activity>,
        private readonly groupService: GroupService,
        private readonly userService: UserService,
        private readonly postService: PostService,
        private readonly configService: ConfigService
    ) {}
}
