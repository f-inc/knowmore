import React from 'react';

interface Props {
  isOpen: boolean;
  closeModal: () => void;
}

export const ModalComponent: React.FC<Props> = ({ isOpen, closeModal }: Props) => {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center">
          {/* Backdrop with blur effect */}
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-filter-blur-md"></div>

          {/* Modal */}
          <div className="bg-white text-black w-80 rounded-md border-2 border-[#0F172A] h-96 p-6 flex flex-col justify-between  shadow-lg relative z-10">
            {/* Your modal content goes here */}
            <div className="flex-grow gap-5 font-plus-jakarta-sans justify-start flex flex-col">
              <p className=" text-black">Pro</p>
              <div>
              <span className="text-3xl font-bold">
                $4 
              </span> /use
              </div>
              <span>
              For individuals and freelancers
              </span>
              <span>
                Includes 
              </span>
              <span className='font-bold'>
                Unlimited emails
              </span>
            </div>

            {/* Purchase button at the bottom */}
            <button onClick={() => closeModal()} className="bg-[#0F172A] text-white px-4 py-2 rounded">
              Purchase
            </button>
          </div>
        </div>
      )}
    </>
  );
};
