import { IncomingMessage, STATUS_CODES, ServerResponse } from "http";
import { UserInterface, usersDb } from "./db";
import { User } from "../user";
import { validate } from "uuid";
import { sendResponse, sendError } from "./Response";
import { StatusCode, ErrorMessage } from "./constants";

export const requestHandle = async (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
	try{
		if (!req.url?.startsWith("/api/users")) {
			console.log(req.url);
			sendError(res, StatusCode.NOT_FOUND, ErrorMessage.REQUEST_URL_FORMAT_INVALID);
			return;
		}

		const parsedUrl = req.url.slice(1).split("/");
		const id = parsedUrl[2] || "";
		let body: UserInterface;
		if (parsedUrl.length === 2) {
			console.log("parsed.lengrh = 2", req.url);
			switch (req.method) {
			case "GET":
				sendResponse(res, StatusCode.OK, usersDb);
				console.log("GET api/users");
				break;
			case "POST":
				body = await getBodyRequest(req);  
				
				if (await validateBody(body as unknown as UserInterface)) {
					const user = new User(body.username, body.age, body.hobbies);
					usersDb.push(user);
					sendResponse(res, StatusCode.CREATED, user);
					console.log("userDB current", usersDb);
				} else {
					sendError(res, StatusCode.BAD_REQUEST, ErrorMessage.REQUEST_BODY_FORMAT_INVALID);
				}
				console.log("POST api/users", body);
				break;
			default:
				sendError(res, StatusCode.METHOD_NOT_ALLOWED, ErrorMessage.METHOD_NOT_ALLOWED);
				console.log("WRONG METHOD for users should be error");
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

			console.log("parsed.lengrh = 3", req.url, "id", id);
			switch (req.method) {
			case "GET":
				console.log("GET api/users/{userId}");
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
					console.log("updated database", usersDb);
				} else {
					sendError(res, StatusCode.BAD_REQUEST, ErrorMessage.REQUEST_BODY_FORMAT_INVALID);
				}
				console.log("PUT api/users/{userId}");
				break;
			case "DELETE":
				
				// eslint-disable-next-line no-case-declarations
				const index = usersDb.findIndex((user) => user.id == id);
				if( index !== -1) {
					console.log("не найдено");
					usersDb.splice(index, 1);
					sendResponse(res, StatusCode.NO_CONTENT, {} as UserInterface);
				}else{
					console.log("найдено");
					sendError(res, StatusCode.NOT_FOUND, ErrorMessage.USER_NOT_FOUND);
				}


				console.log("DELETE api/users/{userId}");
				break;
			default:
				sendError(res, StatusCode.METHOD_NOT_ALLOWED, ErrorMessage.METHOD_NOT_ALLOWED);
				console.log("WRONG METHOD for userId should be error");
			}
		} else {
			sendError(res, StatusCode.NOT_FOUND, ErrorMessage.NOT_FOUND);
			console.log("parsed.lengrh >3  Should be error", req.url);
		}
	} catch{
		sendError(res, StatusCode.SERVER_ERROR, ErrorMessage.SERVER_ERROR);
	}
};

const getBodyRequest = async (req:IncomingMessage): Promise<UserInterface> => {
	return new Promise ((res, rej) => {
		let body = "";
		req.on("data", (chunk) => {
			body+=chunk.toString();
		});
		req.on("end", () => {
			res(JSON.parse(body));
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
//todo: bad validation