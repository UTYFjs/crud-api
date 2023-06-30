import {IncomingMessage, ServerResponse, createServer} from "http";
import {config} from "dotenv";
import { UserInterface } from "./app/db";
import { getBodyRequest, requestHandle } from "./app/requestHandle";
import { availableParallelism } from "os";
import cluster from "cluster";

const numCPUs = availableParallelism();

config();

const PORT=process.env.PORT ?? 4000;

if(process.env.MULTI){
	
	if (cluster.isPrimary) {
		console.log("multiple instance of application", `available parallelism ${numCPUs}`);
		console.log(`Primary ${process.pid} is running`);

		// Форк рабочих.
		for (let i = 0; i < numCPUs-1; i++) {
			const worker = cluster.fork();
			worker.on("message", (msg) => {console.log(msg);});
			worker.send("hello");
			console.log(`worker PID ${worker.process.pid}`);
			
		}

		cluster.on("exit", (worker, code, signal) => {
			console.log(`рабочий ${worker.process.pid} умер`);
		});
		
	} else {
		// Рабочие могут совместно использовать любое TCP-соединение.
		// В данном случае это HTTP-сервер
		const worker = createServer((req, res) => {
			const body = getBodyRequest(req);
			console.log(body);
			res.writeHead(200);
			res.end("hello world\n");
		})
			.listen(PORT, () => {
				console.log(` Worker is started on port ${PORT}. PID: ${process.pid}`);
				process.on("message", (msg) => {
					console.log(msg);
				});
			});
		console.log(` Worker is started on port ${PORT}. PID: ${process.pid}`);
		worker.on("message", (msg) => {
			console.log(msg);
		});
	}
}else{
	const server = createServer(async (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
		requestHandle(req, res);
	});
	server.listen(PORT, () => {
		console.log(` Server is running on port ${PORT}. PID: ${process.pid}`);
	});

}
