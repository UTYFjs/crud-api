import { ServerResponse } from "http";
import { UserInterface } from "./db";

export const sendResponse = (res: ServerResponse, statusCode: number, body?: UserInterface | Array<UserInterface>) => {
  				res.writeHead(statusCode, { "content-Type": "application/json" });
	        res.end(JSON.stringify(body));
};

export const sendError = (res: ServerResponse, statusCode: number, message: string) => {
    				res.writeHead(statusCode, { "content-Type": "application/json" });
	          res.end(JSON.stringify({error: message}));
};