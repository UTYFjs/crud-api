import {IncomingMessage, ServerResponse, createServer} from "http";
import {app} from "./app/app";
import {cpus} from "os";
import {config} from "dotenv";
import { v4 as uuidv4, validate } from "uuid";
import { UserInterface, usersDb } from "./app/db";
import { User } from "./user";



config();

const PORT=process.env.PORT ?? 4000;
const server = createServer(async(req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
	if(!req.url?.startsWith("/api/users")){
		console.log(req.url);
		res.writeHead(404, { "content-Type": "application/json" });
		res.end(JSON.stringify({ error: "Page not found" }));
		return;
	}

	const parsedUrl = req.url.slice(1).split("/");
	const id = parsedUrl[2] || "";
	let body: UserInterface;
	if(parsedUrl.length === 2){
		console.log("parsed.lengrh = 2", req.url);
		switch(req.method){
		case "GET":
			res.writeHead(200, { "content-Type": "application/json" });
			res.end(JSON.stringify(usersDb));
			console.log("GET api/users");
			break;
		case "POST":
			body = await getBodyRequest(req);
			if(await validateBody((body as unknown) as UserInterface)){
				const user = new User(body.username, body.age, body.hobbies);
			 	usersDb.push(user);
			 	res.writeHead(201, { "content-Type": "application/json" });
				res.end(JSON.stringify(user));
			 console.log("userDB current", usersDb);
			}
			console.log("POST api/users", body);
			break;
		default:
			console.log("WRONG METHOD for users should be error");
		}


	} else if (id && parsedUrl.length === 3){
		console.log("parsed.lengrh = 3", req.url, "id", id);
		switch (req.method) {
		case "GET":
			console.log("GET api/users/{userId}");
			if(validate(id)){
				const user = usersDb.find((user) => {if(user.id == id) return user;});
				res.writeHead(200, { "content-Type": "application/json" });
				res.end(JSON.stringify(user));
			}

			break;
		case "PUT":

			if (validate(id)) {
				body = await getBodyRequest(req);
				if(await validateBody((body as unknown) as UserInterface)){
					
					const index = usersDb.findIndex((user) => user.id == id);
					usersDb[index].age = body.age;
					usersDb[index].username = body.username;
					usersDb[index].hobbies = [...body.hobbies];
					res.writeHead(200, { "content-Type": "application/json" });
					res.end(JSON.stringify(usersDb[index]));
					console.log("updated database", usersDb);
				}
			}
			console.log("PUT api/users/{userId}");
			break;
		case "DELETE":
			if (validate(id)) {
				const index = usersDb.findIndex((user) => user.id == id);
				usersDb.splice(index, 1);
				res.writeHead(204, { "content-Type": "application/json" });
				res.end(JSON.stringify({}));
			}
			console.log("PUT api/users/{userId}");

			console.log("DELETE api/users/{userId}");
			break;
		default:
			console.log("WRONG METHOD for userId should be error");
		}
	} else {
		console.log("parsed.lengrh >3  Should be error", req.url);
	}

});
server.listen(PORT, () => {
	console.log(` Server is running on port ${PORT}. PID: ${process.pid}`);
});



const sayHi = () => {console.log("Hi"); 
	//console.log(cpus());
	
	
	app();
};
sayHi();

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