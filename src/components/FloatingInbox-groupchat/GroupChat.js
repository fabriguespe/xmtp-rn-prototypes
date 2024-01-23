import {EventEmitter} from 'fbemitter';

class Message {
  constructor(text) {
    this.id = `msg-${Date.now()}`; // Unique ID for the group chat
    this.text = text;
  }

  content() {
    return this.text;
  }
}

export class GroupChat {
  isGroupChat = true;
  static groupChats = []; // Static property to hold all group chats

  constructor(participants) {
    this.eventEmitter = new EventEmitter();

    this.id = `groupchat-${Date.now()}`; // Unique ID for the group chat
    this.participants = participants;
    this.msgArray = [];
    GroupChat.groupChats.push(this); // Add this group chat to the array
  }

  streamMessages(callback) {
    console.log('runStream');
    this.eventEmitter.addListener('newMessage', callback);
  }
  sendMessage(text) {
    const message = new Message(text);
    //this.msgArray.unshift(message);
    this.eventEmitter.emit('newMessage', message); // Emit an event whenever a new message is sent

    return this.msgArray;
  }

  async messages() {
    return this.msgArray;
  }
  getMessages() {
    return this.msgArray;
  }

  static addGroupChat(groupChat) {
    GroupChat.groupChats.push(groupChat);
  }

  static removeGroupChat(id) {
    GroupChat.groupChats = GroupChat.groupChats.filter(chat => chat.id !== id);
  }

  static getAllGroupChats() {
    return GroupChat.groupChats;
  }

  static getGroupChatById(id) {
    return GroupChat.groupChats.find(chat => chat.id === id) || null;
  }
}
