import { FrontendService } from "./frontend.service";
import { User } from "../entities/user.entity";
import { Group } from "../entities/group.entity";
import { PostObject } from "../activitypub/definitions/activities/post-object";
import { AP } from "../activitypub/definitions/constants";
import { Post } from "../entities/post.entity";
import Axios from "axios";
import { LikeActivity } from "../activitypub/definitions/activities/like-activity";

/**
 * This class implements the client end of ActivityPub C2S,
 * as far as Themis actually needs it.
 *
 * @export
 * @class APClient
 */
export class APClient {
    /**
     * Creates an ActivityPub client object. This stores the
     * name of the logged-in user and their API token.
     * 
     * @param username
     * @param accessToken
     * @memberof APClient
     */
    constructor(
        private readonly username: string,
        private readonly accessToken: string
    ) {
        // Can't use async in constructors, so do it the hard way
        FrontendService.getLocalUser(this.username)
            .then(response => {
                this.user = response.data;
                return response;
            })
            .catch(error => { throw new Error(error) });
    }

    /**
     * We store the user's DB entity so we're not always asking for it.
     *
     * @memberof APClient
     */
    user: User;

    /**
     * Submit a post using the ActivityPub C2S system. This function
     * handles all the necessary object construction, as well as posting
     * to the user's outbox.
     *
     * @param subject The subject of the message
     * @param body The message body
     * @param primaryGroup The "primary" group the message will be posted to
     * @param [parent] An optional parent post, if this is a reply
     * @returns The result of sending the message to the outbox endpoint
     * @memberof APClient
     */
    async submitPost(
        subject: string,
        body: string,
        primaryGroup: number,
        parent?: Post
    ) : Promise<any> {

        try {
            const group : Group = (await FrontendService.getGroupFromId(primaryGroup)).data;

            const post: PostObject = {
                '@context': AP.Context,
                type: 'Article',
                attributedTo: this.user.uri,
                summary: subject,
                content: body,

                // TODO: Cross-posting
                to: [group.uri],
            }

            if (parent) {
                post.inReplyTo = parent.uri
            }

            // TODO: Any other metadata?
            return Axios.post(this.user.actor.outbox, post, {
                headers: {
                    'Authorization': `bearer ${this.accessToken}`,
                    'Content-Type': AP.ContentType
                }
            });

        } catch (e) {
            console.log(`Unable to submit post: ${e.toString()}`);
            return e;
        }
    }

    async likePost(post: Post): Promise<any> {
        try {
            const like: LikeActivity = {
                '@context': AP.Context,
                type: 'Like',
                actor: this.user.uri,
                object: post.uri
            };

            return Axios.post(this.user.actor.outbox, like, {
                headers: {
                    'Authorization': `bearer ${this.accessToken}`,
                    'Content-Type': AP.ContentType
                }
            });
        } catch (e) {

        }
    }
}