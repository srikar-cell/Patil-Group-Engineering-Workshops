import React from "react";
import { useState, useEffect } from "react";

function Mastercard() {
    const [cardnumber, setcardnumber] = useState("");
    const [message, setmessage] = useState("");

    useEffect(() => {
        if (cardnumber.length >= 2) {

            if (cardnumber.startsWith("62") ||
                cardnumber.startsWith("67") ||
                cardnumber.startsWith("68") ||
                cardnumber.startsWith("69")) {
                setmessage("master card");
            } else {
                setmessage("not mastercard");
            }
        }
        else {
            setmessage("");
        }
    }, [cardnumber]);


    return (
        <div>
            <h2> Master card customer</h2>
            <input type="text" placeholder="Enter" value={cardnumber} onChange={(e) => setcardnumber(e.target.value)} />
            <h3> {message}</h3>

        </div>
    );
};

export default Mastercard;