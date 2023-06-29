import {app} from "./app/app";
import {cpus} from "os";
const sayHi = () => {console.log("Hi"); 
	//console.log(cpus());
	app();
};
sayHi();