class Greeter {
    public greeting: string;
    constructor(message: string) {
        this.greeting = message;
    }
    public greet() {
        return `Hello, ${this.greeting}`;
    }
}

let greeter = new Greeter("world");
console.log(greeter);
