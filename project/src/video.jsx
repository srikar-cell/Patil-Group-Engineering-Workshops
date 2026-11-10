import React, { useState, useEffect } from "react";

function StateDemo() {
    const [videoName, setVideoName] = useState("fetching data");
    const [videoLikes, setVideoLikes] = useState(95);
    const [videoCompliment, setVideoCompliment] = useState("");

    // useEffect executes whenever videoLikes changes
    useEffect(() => {
        console.log("Video Likes updated");
    }, [videoLikes]);

    return (
        <>
            <h1>States Demo</h1>

            <h6>Video Name: {videoName}</h6>
            <h6>Likes: {videoLikes}</h6>

            <button onClick={() => setVideoLikes(videoLikes + 1)}>
                Like Video
            </button>

            <button onClick={() => setVideoLikes(videoLikes - 1)}>
                Dislike Video
            </button>

            {videoLikes >= 100 && (
                <p>Likes reached 100!</p>
            )}

            <form onSubmit={(e) => e.preventDefault()}>
                <label htmlFor="video-compliment">
                    Video Compliment:
                </label>

                <input
                    id="video-compliment"
                    type="text"
                    name="video-compliment"
                    value={videoCompliment}
                    onChange={(e) => {
                        console.log(e.target.value);
                        setVideoCompliment(e.target.value);
                    }}
                />

                <p>You entered: {videoCompliment}</p>
            </form>
        </>
    );
}

function ShowMessage() {
    const [isVisible, setIsVisible] = useState(true);

    return (
        <div>
            <button onClick={() => setIsVisible(!isVisible)}>
                {isVisible ? "Hide" : "Show"} Message
            </button>

            {isVisible && <p>This is a secret message!</p>}
        </div>
    );
}

export { StateDemo, ShowMessage };