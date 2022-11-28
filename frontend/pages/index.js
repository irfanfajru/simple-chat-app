import Head from "next/head";
import Image from "next/image";
import io from "socket.io-client";
import { useEffect, useState } from "react";
const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} = require("unique-names-generator");
const randomName = uniqueNamesGenerator({
  dictionaries: [adjectives, colors, animals],
});
const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URI);

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [nickname, setNickname] = useState(randomName);
  const [inputText, setInputText] = useState("");
  const [whoIsTyping, setWhoIsTyping] = useState("");

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connect");
    });
    socket.on("disconnect", () => {
      console.log("disconnect");
    });
    socket.on("message", (val) => {
      setWhoIsTyping("");
      setMessages([...messages, val]);
    });

    socket.on("typing", (val) => {
      if (val != nickname) setWhoIsTyping(`${val} is typing...`);
    });

    socket.on("stop-typing", (val) => {
      setWhoIsTyping("");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message");
      socket.off("typing");
    };
  });

  // function emit message
  const sendMessage = (e) => {
    e.preventDefault();
    socket.emit("message", {
      from: nickname,
      message: inputText,
    });
    socket.emit("stop-typing", nickname);
    setInputText("");
  };
  return (
    <div>
      <Head>
        <title>Simple Chat App</title>
        <meta name="description" content="Simple Chat App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {/* header */}
        <div className="container text-center">
          <h1>Simple Chat App</h1>
        </div>

        <div className="container mt-auto">
          <div className="row g-4">
            <div className="col-4">
              <div className="mb-4 border shadow-sm p-2 rounded">
                <label className="form-label">Your Nickname</label>
                <input
                  type="text"
                  className="form-control"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </div>
              <div className="rounded border shadow-sm p-2">
                <h3 className="text-center">Online Users</h3>
                <hr></hr>
              </div>
            </div>
            <div className="col-8">
              <div className="rounded border shadow-sm p-2">
                {/* message content */}
                {messages.map((e, index) => (
                  <div
                    className={
                      e.from == nickname
                        ? "p-2 text-end border rounded mb-2"
                        : "p-2 text-start border rounded mb-2"
                    }
                    key={index}
                  >
                    <p className="text-break">
                      <strong>{e.from == nickname ? "You" : e.from}</strong>{" "}
                      <br></br>
                      {e.message}
                      <br></br>
                      {e.date}
                    </p>
                  </div>
                ))}
                {whoIsTyping}
                {/* input text */}
                <form onSubmit={sendMessage}>
                  <div>
                    <div className="row g-2 position-relative">
                      <div className="col-10">
                        <input
                          required
                          value={inputText}
                          onChange={(e) => {
                            socket.emit("typing", nickname);
                            setInputText(e.target.value);
                          }}
                          onKeyUp={(e) => {
                            setTimeout(() => {
                              socket.emit("stop-typing", nickname);
                              setWhoIsTyping("");
                            }, 5000);
                          }}
                          type="text"
                          className="form-control"
                          placeholder="Type a message"
                        />
                      </div>
                      <div className="col-2">
                        <button type="submit" className="w-100 btn btn-primary">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-send"
                            viewBox="0 0 16 16"
                          >
                            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
