import { IncomingMessage, ServerResponse } from "http";
import { UserInterface, usersDb } from "./db";
import { User } from "../user";
import { validate } from "uuid";
import { sendResponse, sendError } from "./Response";
import { StatusCode, ErrorMessage } from "./constants";
import cluster from "cluster";

export const requestHandle = async (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
	try{
		if (!req.url?.startsWith("/api/users")) {
			sendError(res, StatusCode.NOT_FOUND, ErrorMessage.REQUEST_URL_FORMAT_INVALID);
			return;
		}
		//console.log("req from server", req.method);
		const parsedUrl = req.url.slice(1).split("/");
		const id = parsedUrl[2] || "";
		let body: UserInterface;
		if (parsedUrl.length === 2) {
			switch (req.method) {
			case "GET":
				if (cluster.isWorker && process.send) {console.log("get from request handle cluster ");
					process.send(JSON.stringify(usersDb)) /*process.send(JSON.stringify(this.db.db))*/;};
				sendResponse(res, StatusCode.OK, usersDb);
				break;
			case "POST":
				//console.log("before get body request from server POSTcase");
				if (cluster.isWorker && process.send) {/* console.log("сообщение из воркера");
					const body: any[] = [];
					req.on("data", async (chunk) => {
						//console.log("чанки началсиь ");
						const chunk1 = await chunk;
						body.push(chunk1);
						//console.log("чанки закончились ");
					});
					process.send(JSON.stringify(body));
					//console.log("сделали процесс сенд "); 
					res.setHeader("Content-Type", "application/json");
					req.on("end", async () => {
						//console.log("конец начался ");
						if (req.statusCode) res.statusCode = req.statusCode;
						const msg = await Buffer.concat(body).toString();
						//console.log("msg из воркера в бэлансер", msg);
						 res.write(msg);
						console.log("конец ghjljk;ftncz ");
						 res.end();
						//console.log("конец закончился ");
					});*/} else {
					body = await getBodyRequest(req);
					//console.log("body from server", body);
					if (await validateBody(body as unknown as UserInterface)) {
						const user = new User(body.username, body.age, body.hobbies);
						usersDb.push(user);
						//console.log("пользователь создался и добавился в базу данных");
						if (cluster.isWorker && process.send) {
							process.send(JSON.stringify(user));
						} else {
							sendResponse(res, StatusCode.CREATED, user);
						}
					} else {
						sendError(res, StatusCode.BAD_REQUEST, ErrorMessage.REQUEST_BODY_FORMAT_INVALID);
					}
				}

				break;
			default:
				sendError(res, StatusCode.METHOD_NOT_ALLOWED, ErrorMessage.METHOD_NOT_ALLOWED);
			}
		} else if (id && parsedUrl.length === 3) {
			let user: UserInterface | undefined;
			if (validate(id)) {
				user = usersDb.find((user) => {
					if (user.id == id) return user;
				});
			} else {
				sendError(res, StatusCode.BAD_REQUEST, ErrorMessage.USER_ID_INVALID);
				return;
			}

			switch (req.method) {
			case "GET":
				if (user) {
					sendResponse(res, StatusCode.OK, user);
				} else {
					sendError(res, StatusCode.NOT_FOUND, ErrorMessage.USER_NOT_FOUND);
				}
				break;
			case "PUT":
				body = await getBodyRequest(req);
				if (await validateBody(body as unknown as UserInterface)) {
					const index = usersDb.findIndex((user) => user.id == id);
					if(index!==-1){
						usersDb[index].age = body.age;
						usersDb[index].username = body.username;
						usersDb[index].hobbies = [...body.hobbies];
						sendResponse(res, StatusCode.OK, usersDb[index]);
					}else{
						sendError(res, StatusCode.NOT_FOUND, ErrorMessage.USER_NOT_FOUND);
					}
				} else {
					sendError(res, StatusCode.BAD_REQUEST, ErrorMessage.REQUEST_BODY_FORMAT_INVALID);
				}
				break;
			case "DELETE":
				
				// eslint-disable-next-line no-case-declarations
				const index = usersDb.findIndex((user) => user.id == id);
				if( index !== -1) {
					usersDb.splice(index, 1);
					sendResponse(res, StatusCode.NO_CONTENT, {} as UserInterface);
				}else{
					sendError(res, StatusCode.NOT_FOUND, ErrorMessage.USER_NOT_FOUND);
				}
				break;
			default:
				sendError(res, StatusCode.METHOD_NOT_ALLOWED, ErrorMessage.METHOD_NOT_ALLOWED);
			}
		} else {
			sendError(res, StatusCode.NOT_FOUND, ErrorMessage.REQUEST_URL_FORMAT_INVALID);
		}
	} catch{
		sendError(res, StatusCode.SERVER_ERROR, ErrorMessage.SERVER_ERROR);
	}
};

export const getBodyRequest = async (req:IncomingMessage): Promise<UserInterface> => {
	return new Promise ((res, rej) => {
		let body = "";
		req.on("data", (chunk) => {
			body+=chunk.toString();
		});
		req.on("end", () => {
			//console.log("getBodyRequest body end", body, typeof body, JSON.stringify(body));
			if(body){
				res(JSON.parse(body));
			}

		});
		req.on("error" , (err)=> {rej(err);});
	});
};

const validateBody = async (body: UserInterface) => {
	if (!body.username || !body.age || !body.hobbies) {
		return false;
	}

	return true;
};
