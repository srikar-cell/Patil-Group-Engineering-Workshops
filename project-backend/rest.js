const express = require('express');

const users = require("./MOCK_DATA.json");
const app = express();
const PORT = 8000;

app.get('/users', (req, res) => {
    return res.json(users);
})

app.get('/users/:first_name', (req, res) => {
    try {
        const first = req.params.first_name;
        const user = users.find((user) => user.first_name === first);
        if (user === undefined) {
            return res.status(404).json({ error: "user not found" });
        }
        return res.json(user);
    }
    catch (error) {
        console.error("something went wrong please check", error)
        return res.status(500).json({ error: " something went wrong" });
    }
})

app.get('/users/:id', (req, res) => {
    try {
        const id = Number(req.params.id);
        const user = users.find((user) => user.id === id);
        if (user === undefined) {
            return res.status(404).json({ error: "user not found" });
        }
        return res.json(user);
    }
    catch (error) {
        console.error("something went wrong please check", error)
        return res.status(500).json({ error: " something went wrong" });
    }

});






app.listen(PORT, () => console.log("serever started"));
