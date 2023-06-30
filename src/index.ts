import {IncomingMessage, ServerResponse, createServer} from "http";
import {config} from "dotenv";
import { UserInterface } from "./app/db";
import { requestHandle } from "./app/requestHandle";



config();

const PORT=process.env.PORT ?? 4000;
const server = createServer(async(req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
	requestHandle(req, res);
	
});
server.listen(PORT, () => {
	console.log(` Server is running on port ${PORT}. PID: ${process.pid}`);
});
