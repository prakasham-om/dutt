import { useEffect } from "react";
import useSocket from "./useSocket";
import { useSelector, useDispatch } from "react-redux";
import { contactsActions } from "../store/contactsSlice";
import useFetch from "./useFetch";
import { chatActions } from "../store/chatSlice";
import { modalActions } from "../store/modalSlice";
import useChatBot from "./useChatBot";
import { authActions } from "../store/authSlice";

const useInit = () => {
  const { socketEmit, socketListen, userId, socket } = useSocket();
  const { respondAsChatBot } = useChatBot();
  const dispatch = useDispatch();

  // Set app theme based on local storage
  useEffect(() => {
    const initialMode = JSON.parse(localStorage.getItem("darkMode"));
    document.querySelector("html").setAttribute("class", initialMode ? "dark-mode" : "light-mode");
  }, []);

  // Send default messages from chatbot
  const sendDefaultMessagesFromBot = (chatRoomId) => {
    respondAsChatBot({
      chatRoomId,
      message: "Hi there, I'm Eddie <br /> <br /> A Chat bot to keep you busy while you are still new to the app (built by Adekola Thanni). <br /> <br /> You can test out some of the features of the app while talking with me but I'll strongly recommend you adding a friend to your contact list. <br /> You can hop on a call and video call with them, something more fun than talking to a robot <img class='w-[2.5rem] h-[2.5rem] inline-block' src='https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f643.png'>",
    });
  };

  const loggedIn = useSelector((state) => state.authReducer.loggedIn);
  const isNew = useSelector((state) => state.authReducer.isNew);
  const chatList = useSelector((state) => state.chatListReducer);

  const { reqFn: fetchContacts } = useFetch(
    { method: "GET", url: "/contacts" },
    (data) => {
      dispatch(contactsActions.setContacts(data.data.contacts));
    }
  );

  useEffect(() => {
    if (loggedIn) {
      fetchContacts();
    }
  }, [loggedIn, fetchContacts]);

  useEffect(() => {
    if (userId) {
      if (socket.disconnected) {
        socket.connect();
      }
      socketEmit("user:online", userId);

      socketListen("user:online", (userId) => {
        const payload = { id: userId, status: { online: true } };
        dispatch(contactsActions.setContactOnlineStatus(payload));
        dispatch(chatActions.updateChatProfile({ payload }));
      });

      socketListen("user:offline", ({ userId, time }) => {
        const payload = { id: userId, status: { online: false, lastSeen: time } };
        dispatch(contactsActions.setContactOnlineStatus(payload));
        dispatch(chatActions.updateChatProfile({ payload }));
      });
    }
  }, [userId, socket, socketEmit, socketListen, dispatch]);

  useEffect(() => {
    socketListen("user:callRequest", ({ chatRoomId, signalData, userId, callType }, acknowledgeCall) => {
      const chatRoom = chatList.find((chat) => chat.chatRoomId === chatRoomId);
      dispatch(
        modalActions.openModal({
          type: `${callType}CallModal`,
          payload: {
            partnerProfile: chatRoom?.profile,
            callDetail: {
              caller: false,
              chatRoomId,
              callerSignal: signalData,
              callerId: userId,
            },
          },
        })
      );
      acknowledgeCall();
    });

    if (chatList.length && isNew.isNew) {
      sendDefaultMessagesFromBot(isNew.payload.chatRoomId);
      dispatch(authActions.setUserIsNew({}));
    }

    return () => {
      socket.off("user:callRequest");
    };
  }, [chatList, isNew, sendDefaultMessagesFromBot, dispatch, socketListen, socket]);

  return {
    loggedIn,
  };
};

export default useInit;
