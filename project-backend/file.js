const fs = require("fs")

console.log("1")
// blocking
const result = fs.readFileSync("contacts.txt", "utf-8")
console.log(result)

console.log("2")

console.log("1")
// Non blocking
fs.readFile("contacts.txt", "utf-8", (err, result) => {
    console.log(result1)
})
console.log("2")


