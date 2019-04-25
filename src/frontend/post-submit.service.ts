import { PostObject } from "../activitypub/definitions/activities/post-object";
import { AP } from "../activitypub/definitions/constants";
import { FrontendService } from "./frontend.service";
import { User } from "../entities/user.entity";
import { Post } from "../entities/post.entity";
import { Group } from "../entities/group.entity";
import Axios from "axios";

/**
 * Encapsulation for front-end posting functionality.
 * This wraps both the ActivityPub and Themis-internal
 * posting methods.
 *
 * @export
 * @class PostSubmit
 */
export class PostSubmit {
    static async submitPostAP(
        username: string,
        accessToken: string,
        subject: string,
        body: string,
        primaryGroup: number,
        parent?: Post
    ) : Promise<any> {

        try {
            const sender : User = (await FrontendService.getLocalUser(username)).data;
            const group : Group = (await FrontendService.getGroupFromId(primaryGroup)).data;

            const post: PostObject = {
                '@context': AP.Context,
                type: 'Article',
                attributedTo: sender.uri,
                summary: subject,
                content: body,

                // TODO: Cross-posting
                to: [group.uri],
            }

            if (parent) {
                post.inReplyTo = parent.uri
            }

            // TODO: Any other metadata?
            return Axios.post(sender.actor.outbox, post, {
                headers: {
                    'Authorization': `bearer ${accessToken}`,
                    'Content-Type': AP.ContentType
                }
            });

        } catch (e) {
            console.log(`Unable to submit post: ${e.toString()}`);
            return e;
        }
    }
}