import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null | undefined;
            email?: string | null | undefined;
            image?: string | null | undefined;
        } & DefaultSession["user"];
    }
}