const express = require('express');
const users = require('../data/MOCK_DATA.json');

const router = express.Router();

router.get('/', (req, res) => {
    return res.json(users);
});

router.get('/:idOrName', (req, res) => {
    try {
        const param = req.params.idOrName;
        const id = Number(param);
        const user = Number.isNaN(id)
            ? users.find((user) => user.first_name === param)
            : users.find((user) => user.id === id);

        if (user === undefined) {
            return res.status(404).json({ error: "user not found" });
        }
        return res.json(user);
    }
    catch (error) {
        console.error("something went wrong please check", error)
        return res.status(500).json({ error: "something went wrong" });
    }
});

module.exports = router;
