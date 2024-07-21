function Bird(type, color) {
    this.type = type;
    this.color = color;
    this.egg = 0;

    this.fly = function () {
        console.log(`${this.color} ${this.type}  is flying`);
    }

    this.walk = function () {
        console.log(`${this.color} ${this.type}  is walking`);
    }

    this.layegg = function () {
        this.egg++;
        console.log(`${this.color} ${this.type}  has laid an egg`);
    }
}



function Parrot(type, color) {
    //parent constructor
    Bird.call(type, color);

    this.talk = function () {
        console.log(`${this.color} ${this.type}  is TALKING`);
    }


}


function Raven(type, color) {
    //parent constructor
    Bird.call(type, color);

    this.solvepuzzle = function () {
        console.log(`${this.color} ${this.type}  is SOLVING A PUZZLE`);
    }


}



const b1 = new Raven('raven1', "black");

//b1.fly();
b1.solvepuzzle();

const b2 = new Parrot('parrot-2', "green");

b2.fly();
b2.talk();




