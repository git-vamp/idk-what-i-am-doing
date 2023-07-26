import express, { Request, Response } from "express";
import { query, validationResult, matchedData } from 'express-validator';
import { urlencoded } from "body-parser";
import path from "path";
import session, { Session } from 'express-session';
import { PrismaClient as Client } from "@prisma/client";
import FileStore from 'session-file-store';
import { authChecks, Status } from "./schemas/authSchema";
import { isAuthenticated } from "./middlewares/authenticated";
import { createUser, getPass, getUser } from "./abstractions/Users";

declare module 'express-session' {
    interface SessionData {
        authenticated?: boolean; // Add your custom property here
        user?: string; // Add any other custom properties you want to store in the session
        error?: string
    }

}
// Constants
import { PORT, HOST, SECRET, WEEK } from "./config";

// Initialize Prisma Client
const prisma: Client = new Client();

const app: express.Application = express();

// Set up the view engine
app.set('view engine', 'pug');
app.set('views', './pages');

// Middleware
app.use(express.json());
app.use(urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
const fileStore = FileStore(session);
app.use(session({
    secret: SECRET,
    store: new fileStore,
    cookie: {
        secure: false,
        maxAge: WEEK
    },
    resave: false,
    saveUninitialized: false
}));

// Middleware to check if the user is authenticated
app.use(isAuthenticated);

// Route to render the authentication page
app.get('/auth', (req: Request, res: Response) => {
    const status: string | undefined = req.query.status?.toString();
    res.render('auth', { status: status ? Status(status) : ""});
}); 

// Default route
app.get('/', (req: Request, res: Response) => { 
    res.send('alright');
});

// Route to handle user authentication (login and registration)
app.post('/auth', authChecks, async (req: Request, res: Response) => {
    console.log('triggered')
    const result = validationResult(req);
    if (result.isEmpty()) {
        const data = matchedData(req);
        console.log(data.action)
        switch (data.action) {
            case 'Register': {
                const user = await getUser(prisma, data.user);
                if (user !== null) return res.redirect('/auth?status=3');
                await createUser(prisma, data.user, data.password);
                return res.redirect('/auth?status=6');
            }

            case 'Login': {
                const user = await getUser(prisma, data.user);
                if (user === null) return res.redirect('/auth?status=4');
                const pass = await getPass(prisma, user.name);
                if (pass === null || (pass !== null && pass.password !== data.password)) return res.redirect('/auth?status=5');
                req.session.authenticated = true;
                req.session.user = user.name;
                return res.redirect('/profile');
            }
            case 'Logout': {
                req.session.user = undefined
                req.session.authenticated = false
                return res.redirect('/auth?status=7');

            }
        }
    }
    const arr = result.array();
    console.log(arr)
    return res.redirect(`/auth${arr.length > 0 ? `?status=${arr[0].msg}` : ''}`);
});


app.get('/profile', async (req: Request, res: Response) => {
    res.render('profile', {user: req.session.user, password: (await getPass(prisma, req.session.user as string))?.password})
})

// Start the server
app.listen(PORT, HOST, () => {
    console.log(`Server Started at http://${HOST}:${PORT}`);
});

