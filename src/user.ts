import { v4 as uuidv4 } from "uuid";
export class User {
	id:string = uuidv4();
	username:string;
	age: number;
	hobbies: Array<string>;

	constructor (username: string, age: number, hobbies: Array<string>){
		this.username = username;
		this.age = age;
		this.hobbies = hobbies;
	}
}