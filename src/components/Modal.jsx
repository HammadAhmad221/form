import React from 'react';

const Modal = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h3 className="text-xl font-semibold text-center text-green-500">{message}</h3>
        <div className="mt-4 flex justify-center">
          <button
            onClick={onClose}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
