import {cpus} from "os";
export const app = () => {
	console.log("Im from APP HELLO", cpus().length);
};