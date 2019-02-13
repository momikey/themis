// A Themis user (in the general sense of anyone/anything that accesses
// the API) can be one of many different types, or roles. At present, we
// can divide them a few main categories, which are represented here.

export enum UserRole {
    // A Guest is anyone not logged in or not possessing a valid API token.
    // Guests cannot post, and their access is read-only. Also, they can't
    // access protected areas, such as admin panels or profile settings.
    Guest = 0,

    // Callers are consumers of the external, public API. They can't post,
    // but they can read anything accessible to Guests, as well as certain
    // federation-specific operations. This role is intended to represent,
    // e.g., other servers, client-side reading apps, and the like.
    Caller,

    // Bots are just that: bots. They *can* post, but admins can limit them.
    // Also, servers can be configured to limit their posting capabilities
    // by using methods such as rate-limiting. (TODO: implement this)
    Bot,

    // The User role represents basic users who are logged into this server.
    // They have full access to reading, posting, and other operations, and
    // admins can give them additional privileges, such as the ability to
    // create new groups.
    User,

    // Moderators are users with added privileges. They have the power to
    // oversee groups, and they are always allowed to create new ones. In
    // addition, they can recommend users for administrative action.
    Moderator,

    // Admins sit at the highest level of power on a server. Only they have
    // access to the admin panel, which allows for the deletion of posts,
    // the suspension of user accounts, and other sorts of tasks.
    Admin
}