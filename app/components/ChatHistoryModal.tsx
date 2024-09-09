import { useState, useEffect } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { getMessagesByChatId } from '../helper/chat';
import Markdown from 'react-markdown';

type ChatHistoryModalProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    chat: any;
};

type MessageResponse = {
    id: number
    content: string
    user_id: number
}

export default function ChatHistoryModal({ open, setOpen, chat }: ChatHistoryModalProps) {
    const [messages, setMessages] = useState<Array<MessageResponse>>([]);
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const chatId = chat.id
                const messagesData = await getMessagesByChatId({ chatId }) as Array<MessageResponse>
                setMessages(messagesData);
            } catch (error) {
                console.error("Failed to fetch messages:", error);
            }
        };

        if (open) {
            fetchMessages();
        }
    }, [open, chat.id]);
 
    return (
        <>
            <button className="mt-4 mb-4 p-2 text-left bg-white border border-[#CEC288] shadow-md dark:bg-gray-700 rounded-lg hover:bg-[#CEC288] dark:hover:bg-gray-600 transition-colors" onClick={() => setOpen(true)}>
                <p>{chat.title}</p>
            </button>
            <Dialog open={open} onClose={() => setOpen(false)} className="relative z-10">
                <DialogBackdrop transition
                    className="fixed inset-0 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in" />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel transition
                            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95">
                            <DialogTitle as="h3" className="text-lg font-semibold text-gray-800 p-4 bg-gray-100 ">
                                {chat.title}
                            </DialogTitle>
                            <div className="p-4">
                                {messages.map((message, index) => (
                                    <div key={index} className="mb-2">
                                        <Markdown className="prose">{message.content}</Markdown>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-gray-100 sm:flex p-4 justify-between">

                                <button
                                    type="button"
                                    data-autofocus
                                    onClick={() => setOpen(false)}
                                    className=" inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                >
                                    Close
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </>
    );
}
