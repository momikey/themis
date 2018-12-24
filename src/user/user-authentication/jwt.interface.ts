// Interface for the JWT we'll be using
// It's nothing special for now, just the username and stored email.

export interface JwtPayload {
    username: string;
    email: string;
}