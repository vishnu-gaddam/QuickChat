import React, { useContext, useEffect, useRef, useState } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../lib/utils'
import { ChatContext } from '../../context/chatContext'
import { AuthContext } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const ChatContainer = () => {
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages
  } = useContext(ChatContext);

  // ✅ Fix: Use correct name from context
  const { authUsers, onlineUsers } = useContext(AuthContext);
  const scrollEnd = useRef();
  const [input, setInput] = useState('');

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    await sendMessage({ text: input.trim() });
    setInput('');
  };

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return selectedUser ? (
    <div className='h-full overflow-y-auto relative backdrop-blur-lg'>

      {/* Chat header */}
      <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt={selectedUser.fullName}
          className='w-8 rounded-full'
        />
        <p className='flex-1 text-lg text-white flex items-center gap-2'>
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser?._id) && (
            <span className='w-2 h-2 rounded-full bg-green-500'></span>
          )}
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="Back"
          className='md:hidden max-w-7 cursor-pointer'
        />
        <img
          src={assets.help_icon}
          alt="Help"
          className='max-md:hidden w-5'
        />
      </div>

      {/* Chat body */}
      <div className='flex flex-col h-[calc(100%-200px)] overflow-y-scroll p-3 pb-6'>
        {messages.map((msg, index) => {
          const isMyMessage = msg.senderId === authUsers?._id;
          return (
            <div
              key={index}
              className={`flex items-end gap-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}
            >
              {msg.image ? (
                <img
                  src={msg.image}
                  alt=""
                  className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8'
                />
              ) : (
                <p
                  className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all text-white bg-violet-500/30 ${
                    isMyMessage ? 'rounded-br-none' : 'rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </p>
              )}
              <div className='text-center text-xs'>
                <img
                  src={
                    isMyMessage
                      ? authUsers?.profilePic || assets.avatar_icon
                      : selectedUser?.profilePic || assets.avatar_icon
                  }
                  className='w-7 rounded-full'
                  alt=""
                />
                <p className='text-gray-500'>{formatMessageTime(msg.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={scrollEnd}></div>
      </div>

      {/* Message input area */}
      <div className='absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3'>
        <div className='flex-1 flex items-center bg-gray-100/12 px-3 rounded-full'>
          <input
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => (e.key === 'Enter' ? handleSendMessage(e) : null)}
            value={input}
            type="text"
            placeholder='Send a Message'
            className='flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-grey-400 bg-transparent'
          />
          <input onChange={handleSendImage} type="file" id='image' accept='image/*' hidden />
          <label htmlFor="image">
            <img src={assets.gallery_icon} className='w-5 mr-2 cursor-pointer' alt="Upload" />
          </label>
        </div>
        <img
          onClick={handleSendMessage}
          src={assets.send_button}
          className='w-7 cursor-pointer'
          alt="Send"
        />
      </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden h-full'>
      <img src={assets.logo_icon} className='w-16' alt="Chat Logo" />
      <p className='text-lg font-medium text-white'>Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;
