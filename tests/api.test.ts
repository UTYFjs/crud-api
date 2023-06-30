import request from "supertest";
import {server} from "../src/index";
import { StatusCode, ErrorMessage } from "../src/app/constants";
import { UserInterface } from "../src/app/db";

afterAll(()=> {
	if(server){
		server.close();
	}
});

describe("scenario 1 - successful", () => {
	it("return empty users array", async () =>{
		const result = await request(server).get("/api/users");
		expect(result.statusCode).toBe(StatusCode.OK);
		expect(result.body).toEqual([]);
	});
	let userId: string;
	const testUser: Omit<UserInterface, "id"> = {
		username: "Mike",
		age: 44,
		hobbies: ["soccer"],
	};
	it("create new user", async () => {
		const result = await request(server).post("/api/users").send(testUser);
		expect(result.statusCode).toBe(StatusCode.CREATED);
		expect(result.body).toMatchObject(testUser);
		userId = result.body.id;
	});
	it("get created user by id", async()=>{
		const result = await request(server).get(`/api/users/${userId}`);
		expect(result.statusCode).toBe(StatusCode.OK);
		expect(result.body).toEqual({...testUser, id: userId});
	});
	it("update created user", async () => {
		const userForUpdate: Omit<UserInterface, "id"> = {
			username: "Sam",
			age: 13,
			hobbies: ["chess"],
		};
		const result = await request(server).put(`/api/users/${userId}`).send(userForUpdate);
		expect(result.statusCode).toBe(StatusCode.OK);
		expect(result.body).toEqual({ ...userForUpdate, id: userId });
	});
	it("delete updated user", async () => {
		const result = await request(server).delete(`/api/users/${userId}`);
		expect(result.statusCode).toBe(StatusCode.NO_CONTENT);
	});
	it("return empty users array after delete  user", async () => {
		const result = await request(server).get("/api/users");
		expect(result.statusCode).toBe(StatusCode.OK);
		expect(result.body).toEqual([]);
	});
	it("get deleted user", async () => {
		const result = await request(server).get(`/api/users/${userId}`);
		expect(result.statusCode).toBe(StatusCode.NOT_FOUND);
	});
});

describe("scenatio 2 - not found" , () =>{
	const testUserId = "62d68bd5-6f77-43be-b32d-a0ca65dced82";
	it("get non-existent user by Id", async ()=> {
		const result = await request(server).get(`/api/users/${testUserId}`);
		expect( result.statusCode).toBe(StatusCode.NOT_FOUND);
		expect(result.body).toEqual({error: ErrorMessage.USER_NOT_FOUND});
	});
	it("update non-existent user", async () => {
		const userForUpdate: Omit<UserInterface, "id"> = {
			username: "Sam",
			age: 13,
			hobbies: ["chess"],
		};
		const result = await request(server).put(`/api/users/${testUserId}`).send(userForUpdate);
		expect(result.statusCode).toBe(StatusCode.NOT_FOUND);
		expect(result.body).toEqual({ error: ErrorMessage.USER_NOT_FOUND });
	});
	it("delete non-existent user", async () => {
		const result = await request(server).delete(`/api/users/${testUserId}`);
		expect(result.statusCode).toBe(StatusCode.NOT_FOUND);
		expect(result.body).toEqual({error: ErrorMessage.USER_NOT_FOUND});
	});
});

describe("scenatio 3 - invalid request", () => {
	const invalidUserId = "123-321";
	const invalidRoute1 = "/aa/hhf";
	const invalidRoute2 = "/api";
	const invalidRoute3 = "/api/users/dsdsd/ssss";
	it("get user by invalid Id", async () => {
		const result = await request(server).get(`/api/users/${invalidUserId}`);
		expect(result.statusCode).toBe(StatusCode.BAD_REQUEST);
		expect(result.body).toEqual({ error: ErrorMessage.USER_ID_INVALID });
	});
	it("update user by invalid Id", async () => {
		const userForUpdate: Omit<UserInterface, "id"> = {
			username: "Sam",
			age: 13,
			hobbies: ["chess"],
		};
		const result = await request(server).put(`/api/users/${invalidUserId}`).send(userForUpdate);
		expect(result.statusCode).toBe(StatusCode.BAD_REQUEST);
		expect(result.body).toEqual({ error: ErrorMessage.USER_ID_INVALID});
	});
	it("delete user by invalid Id", async () => {
		const result = await request(server).delete(`/api/users/${invalidUserId}`);
		expect(result.statusCode).toBe(StatusCode.BAD_REQUEST);
		expect(result.body).toEqual({ error: ErrorMessage.USER_ID_INVALID });
	});
	it("get invalid route1", async () => {
		const result = await request(server).get(invalidRoute1);
		expect(result.statusCode).toBe(StatusCode.NOT_FOUND);
		expect(result.body).toEqual({ error: ErrorMessage.REQUEST_URL_FORMAT_INVALID });
	});
	it("get invalid route2", async () => {
		const result = await request(server).get(invalidRoute2);
		expect(result.statusCode).toBe(StatusCode.NOT_FOUND);
		expect(result.body).toEqual({ error: ErrorMessage.REQUEST_URL_FORMAT_INVALID });
	});
	it("get invalid route3", async () => {
		const result = await request(server).get(invalidRoute3);
		expect(result.statusCode).toBe(StatusCode.NOT_FOUND);
		console.log(result.body);
		expect(result.body).toEqual({ error: ErrorMessage.REQUEST_URL_FORMAT_INVALID });
	});
	it("invalid method", async () => {
		const result = await request(server).delete("/api/users");
		expect(result.statusCode).toBe(StatusCode.METHOD_NOT_ALLOWED);
		expect(result.body).toEqual({ error: ErrorMessage.METHOD_NOT_ALLOWED });
	});
	it("update if body empty", async () => {
    		const testUser: Omit<UserInterface, "id"> = {
			username: "Mike",
			age: 44,
			hobbies: ["soccer"],
		};
		const userForUpdate = {};
		const resultPost = await request(server).post("/api/users").send(testUser);
		const resultUpdate = await request(server).put(`/api/users/${resultPost.body.id}`).send(userForUpdate);
		expect(resultUpdate.statusCode).toBe(StatusCode.BAD_REQUEST);
		expect(resultUpdate.body).toEqual({ error: ErrorMessage.REQUEST_BODY_FORMAT_INVALID });
	});
	it("post if body empty or wrong", async () => {
		const emptyBody = {};
		const wrongBody = {login: "admin", password: "123456789", age: 23 };
		const resultEmpty = await request(server).post("/api/users").send(emptyBody);
		const resultWrong = await request(server).post("/api/users").send(wrongBody);
		expect(resultEmpty.statusCode).toBe(StatusCode.BAD_REQUEST);
		expect(resultEmpty.body).toEqual({ error: ErrorMessage.REQUEST_BODY_FORMAT_INVALID });
		expect(resultWrong.statusCode).toBe(StatusCode.BAD_REQUEST);
		expect(resultWrong.body).toEqual({ error: ErrorMessage.REQUEST_BODY_FORMAT_INVALID });
	});
	it("post if body empty or wrong", async () => {
		const emptyUsername = { username: "", hobbies: ["soccer"], age: 23 };
		const emptyAge = { username: "admin", hobbies: ["123456789"], age: "" };
		const emptyHobbies = { username: "admin", hobbies: undefined, age: 23 };
		const resultEmptyUsername = await request(server).post("/api/users").send(emptyUsername);
		const resultEmptyAge = await request(server).post("/api/users").send(emptyAge);
		const resultEmptyHobbies = await request(server).post("/api/users").send(emptyHobbies);
		expect(resultEmptyUsername.statusCode).toBe(StatusCode.BAD_REQUEST);
		expect(resultEmptyUsername.body).toEqual({ error: ErrorMessage.REQUEST_BODY_FORMAT_INVALID });
		expect(resultEmptyAge.statusCode).toBe(StatusCode.BAD_REQUEST);
		expect(resultEmptyAge.body).toEqual({ error: ErrorMessage.REQUEST_BODY_FORMAT_INVALID });
		expect(resultEmptyHobbies.statusCode).toBe(StatusCode.BAD_REQUEST);
		expect(resultEmptyHobbies.body).toEqual({ error: ErrorMessage.REQUEST_BODY_FORMAT_INVALID });
	});
  	/*it("post if wrong data types", async () => {
		const emptyUsername = { username: 1, hobbies: ["soccer"], age: 23 };
		const emptyAge = { username: "admin", hobbies: ["123456789"], age: "23" };
		const emptyHobbies = { username: "admin", hobbies: "soccer", age: 23 };
		const wrongHobbiesArrayType = { username: "admin", hobbies: [123,43], age: 23 };
		const correctUserBody = { username: "admin", hobbies: ["soccer", "baseball"], age: 23 };
		const resultEmptyUsername = await request(server).post("/api/users").send(emptyUsername);
		const resultEmptyAge = await request(server).post("/api/users").send(emptyAge);
		const resultEmptyHobbies = await request(server).post("/api/users").send(emptyHobbies);
		const resultWrongTypeHobby = await request(server).post("/api/users").send(wrongHobbiesArrayType);
		const resultCorrect = await request(server).post("/api/users").send(correctUserBody);
    
		expect(resultEmptyUsername.statusCode).toBe(StatusCode.BAD_REQUEST);
		expect(resultEmptyUsername.body).toEqual({ error: ErrorMessage.REQUEST_BODY_FORMAT_INVALID });
		expect(resultEmptyAge.statusCode).toBe(StatusCode.BAD_REQUEST);
		expect(resultEmptyAge.body).toEqual({ error: ErrorMessage.REQUEST_BODY_FORMAT_INVALID });
		expect(resultEmptyHobbies.statusCode).toBe(StatusCode.BAD_REQUEST);
		expect(resultEmptyHobbies.body).toEqual({ error: ErrorMessage.REQUEST_BODY_FORMAT_INVALID });
		expect(resultWrongTypeHobby.statusCode).toBe(StatusCode.BAD_REQUEST);
		expect(resultWrongTypeHobby.body).toEqual({ error: ErrorMessage.REQUEST_BODY_FORMAT_INVALID });
		expect(resultCorrect.statusCode).toBe(StatusCode.BAD_REQUEST);
		expect(resultCorrect.body).toEqual({ error: ErrorMessage.REQUEST_BODY_FORMAT_INVALID });
	});*/
	//todo invalid body(empty, incorrect type of fields, less then 3 field, more then 3 field, name - empty, age - empty, array - string array)
	//todo invalid method + 
	// todo empty body for update
});