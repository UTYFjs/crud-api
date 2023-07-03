import http from "http";
import { getBodyRequest } from "./app/requestHandle";
export const  createLoadBalancer = (numCPUs: number) => {

	return http.createServer(async (req, res) => {
		let workerID = 1;
		const currWorkerPort = 4000 + (workerID++ % numCPUs);
		console.log(`\nSending request to [${req.method}] ${currWorkerPort}\n`);
		const reqData = await getBodyRequest(req);
		//console.log("получили getBodyRequest");
		const connector = http.request(
			{
				hostname: "localhost",
				port: currWorkerPort,
				path: req.url,
				method: req.method,
				headers: req.headers,
			},
			(/*connectorRes*/) => {/*
				const body = [];
				connectorRes.on("data", (chunk) => {
					body.push(chunk);
				});
				res.setHeader("Content-Type", "application/json");
				connectorRes.on("end", () => {
					if (connectorRes.statusCode) res.statusCode = connectorRes.statusCode;
					const msg = Buffer.concat(body).toString();
					//console.log("msg из бэлансера в воркер", msg);
					res.write(msg);
					res.end();
				});
				connectorRes.on("error", () => {
					console.log("An error occured");

					res.writeHead(500, { "Content-Type": "application/json" });
					res.end("The error occured on the side of the server, please try again later");
				});*/
			},
		);

		connector.on("error", () => {
			console.log("An error occured");

			res.writeHead(500, { "Content-Type": "application/json" });
			res.end("The error occured on the side of the server, please try again later");
		});

		if (req.method !== "GET") { 
			//console.log("reqDatakjhkjhkjhkj", reqData);
			connector.write(JSON.stringify(reqData));}
		connector.end();
	});

	/*return createServer(async (req, res) => {
		let workerID=1;
		const currentWorkerPORT = 4000 +  (workerID++ % numCPUs);
		console.log(`send request ${req.method} to workerPort ${currentWorkerPORT}`);
		const bodyRequest = await getBodyRequest(req);
		console.log(bodyRequest);

		const proxy = request({
			hostname: "localhost",
			port: currentWorkerPORT,
			path: req.url,
			method: req.method,
			headers: req.headers,
		}, async (incomeRes) =>{
			console.log("incomeRes", incomeRes);
			const bodyRequestNest = await getBodyRequest(incomeRes);
			//let bodyRes = "";
			//incomeRes.on("data", (chunk) => {
			//	bodyRes += JSON.stringify(chunk).toString();
			//});/
			res.setHeader("Content-Type", "application/json");
			incomeRes.on("end", () => {
				if (incomeRes.statusCode) res.statusCode = incomeRes.statusCode;
				res.write(bodyRequestNest);
				res.end();
			});

			incomeRes.on("error", () => {
				console.log("An error occured");

				res.writeHead(500, { "Content-Type": "application/json" });
				res.end("The error occured on the side of the server, please try again later");
			});


		}

		);


		if (req.method !== "GET") proxy.write(bodyRequest);
		proxy.end();
	});*/


};