const { add, sub } = require("./math");
const register = require('./register');
const os = require('os');
const express = require('express');

console.log("hello world")

register.CheckUser();
register.register();

const isExisting = register.CheckUser();

if (isExisting) {
    console.log("User is already existing");
}

else {
    register.CheckUser()
}


console.log(os.hostname());
console.log(os.freemem());
