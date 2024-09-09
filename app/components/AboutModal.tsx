import React from 'react';
import { Dialog, DialogTitle, DialogPanel, DialogBackdrop } from '@headlessui/react';

type AboutModalProps = {
    isOpen: boolean;
    onClose: (open: boolean) => void;
}

const AboutModal = ({ isOpen, onClose }: AboutModalProps) => {

    return (
        <>
            <button className="flex-shrink-0 border-b border-[#88CCF1] bg-gradient-to-b from-[#88CCF1] px-4 py-2 backdrop-blur-2xl dark:border-neutral-800 dark:from-inherit rounded-xl border bg-blue-500 dark:bg-zinc-800/30" onClick={() => onClose(true)}>
                About
            </button>
            <Dialog open={isOpen} onClose={onClose} className="relative z-10">
                <DialogBackdrop transition
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in" />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <DialogPanel transition
                            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95">
                            <DialogTitle as="h3" className="text-lg font-semibold text-gray-800 p-4 bg-gray-100 ">About ChatIsland</DialogTitle>
                            <div className="p-4 gap-4 flex flex-col">
                                <p>
                                    Welcome to ChatIsland, a chatbot designed to go vacation-mode and provide a relaxing and fun conversation experience.
                                </p>
                                <p>
                                    When you login, you can clock into work mode and have a different chatting experience and face the realities of life.
                                </p>
                                <p>
                                    After logging in you can switch between work mode and vacation mode. You can hide example prompts and chat history.
                                </p>

                                <p className="italic">
                                    Have Fun!
                                    - Naama
                                </p>
                            </div>
                            <div className="bg-gray-100 sm:flex p-4 justify-between">
                                <button onClick={() => onClose(false)} className="px-4 py-2 bg-[#4C2E05] text-white rounded-lg hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-900 focus:ring-opacity-50  w-full">
                                    Close
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog></>
    );
};

export default AboutModal;
