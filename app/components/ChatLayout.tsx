import React, { useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';

export const ChatLayout = ({ messages, children }) => {
    const [hasMessages, setHasMessages] = useState(messages.length > 0);
  
    useEffect(() => {
      setHasMessages(messages.length > 0);
    }, [messages]);
  
    const childrenArray = React.Children.toArray(children);
    const input = childrenArray[0];
    const chatMessages = childrenArray[childrenArray.length - 1];
    const staticElements = childrenArray.slice(1, -1);
  
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-[#DDD8B8] dark:bg-gray-800 rounded-lg shadow-md mt-6">
        <div className="flex-grow flex flex-col overflow-hidden relative">
          <Transition
            show={!hasMessages}
            enter="transition-all duration-300 ease-in-out"
            enterFrom="opacity-0 translate-y-full"
            enterTo="opacity-100 translate-y-0"
            leave="transition-all duration-500 ease-in-out delay-300"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-full"
            className="flex-shrink-0"
          >
            <div className="">
              {input}
            </div>
          </Transition>
          <Transition
            show={hasMessages}
            enter="transition-all duration-300 ease-in-out"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-all duration-300 ease-in-out"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            className="flex-grow overflow-auto"
          >
            {chatMessages}
          </Transition>
          <div className="flex-shrink-0 ">
            {staticElements}
          </div>
  
          <Transition
            show={hasMessages}
            enter="transition-all duration-500 ease-in-out delay-500"
            enterFrom="opacity-0 translate-y-full"
            enterTo="opacity-100 translate-y-0"
            leave="transition-all duration-300 ease-in-out"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-full"
            className="flex-shrink-0"
          >
            <div className="">
              {input}
            </div>
          </Transition>
        </div>
      </div>
    );
  };
  
  