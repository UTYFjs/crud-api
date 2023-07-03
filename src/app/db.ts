export interface UserInterface{
  id: string,
  username: string,
  age: number;
  hobbies:Array<string>
}
export const usersDb: Array<UserInterface> = [];
// {id: "2323", username: "Alex", age: 33, hobbies: ["fdsfsdf"]}