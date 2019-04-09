import Axios from "axios";

/**
 * This service functions as a layer of indirection betweent
 * client and server, encapsulating Themis backend API requests
 * and other common tasks that we would otherwise need to repeat
 * all throughout the frontend.
 *
 * @export
 * @class FrontendService
 */
export class FrontendService {
    static getNodeinfo(): Promise<any> {
        return Axios.get('/.well-known/nodeinfo');
    }

    static getGroupList(): Promise<any> {
        return Axios.get('/api/v1/group/list');
    }
}