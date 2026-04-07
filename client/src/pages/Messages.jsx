import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getConversations, getMessages, sendMessage, startConversation } from "../api/message";
import { loadAuth } from "../utils/authStorage";
import { useSocket } from "../context/SocketContext";

const S = `
  .msg { display:flex; height:calc(100vh - 64px); background:#f5f5f7; font-family:sans-serif; }
  .msg-list { width:320px; flex-shrink:0; background:#fff; border-right:1px solid #e5e7eb; display:flex; flex-direction:column; }
  .msg-list-head { padding:20px 18px 14px; border-bottom:1px solid #e5e7eb; }
  .msg-list-title { font-size:18px; font-weight:700; margin:0; }
  .msg-list-items { flex:1; overflow-y:auto; }
  .msg-conv { padding:14px 18px; border-bottom:1px solid #f3f4f6; cursor:pointer; transition:background .15s; }
  .msg-conv:hover, .msg-conv.active { background:#f9fafb; }
  .msg-conv-name { font-weight:600; font-size:14px; margin:0 0 3px; }
  .msg-conv-preview { font-size:12px; color:#9ca3af; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin:0; }
  .msg-conv-badge { background:#3d3af5; color:#fff; border-radius:999px; font-size:10px; padding:1px 7px; margin-left:auto; }
  .msg-chat { flex:1; display:flex; flex-direction:column; }
  .msg-chat-head { padding:16px 24px; background:#fff; border-bottom:1px solid #e5e7eb; font-weight:700; font-size:16px; }
  .msg-chat-body { flex:1; overflow-y:auto; padding:20px 24px; display:flex; flex-direction:column; gap:10px; }
  .msg-bubble { max-width:65%; padding:10px 14px; border-radius:14px; font-size:13px; line-height:1.5; }
  .msg-bubble.me { background:#3d3af5; color:#fff; align-self:flex-end; border-bottom-right-radius:4px; }
  .msg-bubble.them { background:#fff; color:#141412; border:1px solid #e5e7eb; align-self:flex-start; border-bottom-left-radius:4px; }
  .msg-bubble-meta { font-size:10px; margin-top:3px; opacity:.6; }
  .msg-input-row { padding:16px 24px; background:#fff; border-top:1px solid #e5e7eb; display:flex; gap:10px; }
  .msg-input { flex:1; border:1px solid #e5e7eb; border-radius:12px; padding:11px 16px; font-size:14px; font-family:inherit; outline:none; }
  .msg-input:focus { border-color:#3d3af5; }
  .msg-send { background:#3d3af5; color:#fff; border:none; border-radius:12px; padding:11px 20px; font-size:13px; font-weight:600; cursor:pointer; }
  .msg-send:disabled { opacity:.5; cursor:not-allowed; }
  .msg-empty { flex:1; display:flex; align-items:center; justify-content:center; color:#9ca3af; font-size:14px; }
  @media(max-width:640px){.msg-list{width:100%;display:none}.msg-list.show{display:flex}.msg-chat{display:none}.msg-chat.show{display:flex}}
`;

export default function Messages() {
  const auth = loadAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearMessageBadge } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!auth?.token) { navigate("/login"); return; }
    clearMessageBadge();
    loadConversations();
  }, []);

  // Auto-start conversation if navigated with ?with=userId&listing=id&model=SaleListing
  useEffect(() => {
    const withUser = searchParams.get("with");
    const listingId = searchParams.get("listing");
    const listingModel = searchParams.get("model");
    if (withUser && conversations.length >= 0) {
      startConversation({ recipientId: withUser, listingId, listingModel })
        .then((r) => {
          setConversations((prev) => {
            const exists = prev.find((c) => c._id === r.data._id);
            return exists ? prev : [r.data, ...prev];
          });
          selectConversation(r.data);
        })
        .catch(() => {});
    }
  }, [searchParams, conversations.length > 0]);

  const loadConversations = () =>
    getConversations().then((r) => setConversations(r.data));

  const selectConversation = async (conv) => {
    setActive(conv);
    const r = await getMessages(conv._id);
    setMessages(r.data);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !active) return;
    setSending(true);
    try {
      const r = await sendMessage(active._id, text.trim());
      setMessages((prev) => [...prev, r.data]);
      setText("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      loadConversations();
    } finally { setSending(false); }
  };

  const getOtherParticipant = (conv) =>
    conv.participants?.find((p) => p._id !== auth._id) || conv.participants?.[0];

  return (
    <div className="msg">
      <style>{S}</style>

      {/* Conversation list */}
      <div className="msg-list">
        <div className="msg-list-head">
          <h2 className="msg-list-title">Messages</h2>
        </div>
        <div className="msg-list-items">
          {conversations.length === 0 && (
            <p style={{ padding: "20px 18px", fontSize: 13, color: "#9ca3af" }}>No conversations yet.</p>
          )}
          {conversations.map((conv) => {
            const other = getOtherParticipant(conv);
            const unread = conv.unreadCount?.[auth._id] || 0;
            return (
              <div
                key={conv._id}
                className={`msg-conv${active?._id === conv._id ? " active" : ""}`}
                onClick={() => selectConversation(conv)}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p className="msg-conv-name">{other?.name || "User"}</p>
                  {unread > 0 && <span className="msg-conv-badge">{unread}</span>}
                </div>
                <p className="msg-conv-preview">{conv.lastMessage || "No messages yet"}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat window */}
      <div className="msg-chat">
        {!active ? (
          <div className="msg-empty">Select a conversation to start chatting</div>
        ) : (
          <>
            <div className="msg-chat-head">
              {getOtherParticipant(active)?.name || "Chat"}
            </div>

            <div className="msg-chat-body">
              {messages.map((m) => {
                const isMe = m.senderId?._id === auth._id || m.senderId === auth._id;
                return (
                  <div key={m._id} style={{ display: "flex", flexDirection: "column" }}>
                    <div className={`msg-bubble ${isMe ? "me" : "them"}`}>
                      {m.text}
                      <div className="msg-bubble-meta">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <form className="msg-input-row" onSubmit={handleSend}>
              <input
                className="msg-input"
                placeholder="Type a message…"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button className="msg-send" type="submit" disabled={sending || !text.trim()}>
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
