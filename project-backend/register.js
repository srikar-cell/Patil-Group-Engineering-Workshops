function CheckUser() {
    console.log("checking for user")
    return false
}

function register() {
    console.log("user registerd successfully")
}

module.exports = {
    CheckUser: CheckUser,
    register: register
}