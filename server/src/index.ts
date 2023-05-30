import express from "express";
import { Dummy, createDraft, pickItem, getDraft } from './routes';
import bodyParser from 'body-parser';


// Configure and start the HTTP server.
const port = 8088;
const app = express();
app.use(bodyParser.json());
app.get("/api/dummy", Dummy);
app.post("/api/createDraft", createDraft);
app.post("/api/pickItem", pickItem);
app.get("/api/getDraft", getDraft);
app.listen(port, () => console.log(`Server listening on ${port}`));
