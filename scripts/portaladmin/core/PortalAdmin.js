





function Employee(name, level) {
    this.name = name;
    this.level = level;
}


Employee.prototype = {
    test: function (v) {
        alert("test method");
    },

    test2: function (v) {
        alert(this.name);
    }

};


// Adding a method to the constructor
Employee.prototype.greet = function () {
    return '${this.name} says hello.';
}

// Adding a method to the constructor
Employee.prototype.title = function () {
    return '${this.name} says title is employee.';
}


function Manager(name, level, test) {
    Employee.call(this, name, level);
    this.test = test;
    //this.name = name;
    //this.level = level;



}

//inheritience implementation
Manager.prototype = Object.create(Employee.prototype); 




//const emp1 = new Employee('Lejon', 2);
//emp1.test2();
//alert(emp1.title());

//const emp2 = new Manager('Lejon2', 2);
//emp2.test2();
//alert(emp2.greet());
