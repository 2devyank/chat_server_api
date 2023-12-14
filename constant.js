export const UserRolesEnum={
ADMIN:"ADMIN",
USER:"USER",
}

export const AvailableUserRoles=Object.values(UserRolesEnum);

export const TOKEN_EXPIRY=20 * 60 * 1000;

export const ChatEventEnum=Object.freeze({
    CONNECTED_EVENT:"connected",
    DISCONNECT_EVENT:"disconnect",
    JOIN_CHAT_EVENT:"joinchat",
    LEAVE_CHAT_EVENT:"leavechat",
    UPDATE_GROUP_NAME_EVENT:"updateGroupName",
    MESSAGE_RECIEVED_EVENT:"messageReceived",
    NEW_CHAT_EVENT:"newChat",
    SOCKET_ERROR_EVENT:"socketError",
    STOP_TYPING_EVENT:"stopTyping",
    TYPING_EVENT:"typing"
})
export const AvailableChatEvents=Object.values(ChatEventEnum);