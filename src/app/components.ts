import { JsonObject, JsonMember } from "typedjson-npm";

@JsonObject
export class Person {
    @JsonMember({ type: String })
    public firstName: string;

    @JsonMember({ type: String })
    public lastName: string;

    public getFullname() {
        return this.firstName + " " + this.lastName;
    }
}
