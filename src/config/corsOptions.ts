import { CorsOptions } from 'cors';

const allowedOrigins = [
    "http://localhost:5173",
    "https://myfrontend.com",
];

const corsOptions: CorsOptions = {
    origin: function (origin, callback) {
        if(!origin || allowedOrigins.indexOf(origin) !== -1 ) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials:true,
};

export default corsOptions;