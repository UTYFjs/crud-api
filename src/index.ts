import {createServer} from "http";
import {app} from "./app/app";
import {cpus} from "os";
import {config} from "dotenv";

config();

const PORT=process.env.PORT;
const server = createServer((req, res) => {
	console.log("start server");
	res.write("Hello World");
	res.end();
});
server.listen({ host: "localhost", port: PORT, exclusive: true});



const sayHi = () => {console.log("Hi"); 
	//console.log(cpus());
	
	
	app();
};
sayHi();