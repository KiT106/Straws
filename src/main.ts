import { TypedJSON } from "typedjson-npm";
import { Person } from "./app/components";

let person = TypedJSON.parse('{ "firstName": "John", "lastName": "Doe" }', Person);

console.log(person instanceof Person);  // true
console.log(person.getFullname());      // "John Doe"
console.log(person);
