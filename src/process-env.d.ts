declare global {
    namespace NodeJS {
        interface ProcessEnv {
            [key: string]: string | undefined;
            DATABASE_URL: string;
            PORT: number;
            ACCESS_TOKEN_SECRET:string;
            REFRESH_TOKEN_SECRET:string;
        }
    }
}

export {}