import {IncomingMessage, Server, ServerResponse, createServer} from "http";
import {config} from "dotenv";
import { requestHandle } from "./app/requestHandle";
import {  cpus } from "os";
import cluster from "cluster";



export let server: Server;

const numCPUs = cpus().length;

config();

const PORT=process.env.PORT ?? 4000;



if(process.env.MULTI){
	
	if (cluster.isPrimary) {
		console.log("multiple instance of application", `available parallelism ${numCPUs}`);
		console.log(`Primary PORT ${PORT} process.pid ${process.pid} is running`);

		// Форк рабочих.
		for (let i = 0; i < numCPUs; i++) {
			const port = +PORT +1+i;
			cluster.fork(port);			
		}

		cluster.on("message", (worker, code) => {
			console.log(`Worker PID ${worker.process.pid} sent message: ${code}`);
		});
		cluster.on("exit", (worker) => {
			console.log(`worker ${worker.process.pid} died`);
			// born new worker
			cluster.fork();
		});
		const balancer = createServer(requestHandle);
		//const balancer = createLoadBalancer(numCPUs);
		balancer.listen(PORT, () => {
			console.log(`Load balancer ${process.pid} started on port ${PORT}`);
			console.log("Please wait few seconds created workers...");
		});
	} else {
		// workers TCP-connection.
		//  HTTP-server
		const worker = createServer((req, res) => {
			requestHandle(req, res);
		});
		if (cluster && cluster.worker){
			const workerId = cluster.worker.id;
	
			worker.listen(+PORT + workerId, () => {
				console.log(` Worker is started on port ${+PORT + workerId}. PID: ${process.pid}`);
			});
			worker.on("connection", () => {
				//console.log(`Worker ${+PORT + workerId} is handling a request`);
			});
		}


		

	}
}else{
	server = createServer(async (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
		requestHandle(req, res);
	});
	server.listen(PORT, () => {
		console.log(` Server is running on port ${PORT}. PID: ${process.pid}`);
	});
	server.on("connection", () => {
		//console.log(`Server ${PORT} is handling a request`);
	});

}
