import React from "react";

const ChatWindow = ({ selectedGroupId }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700">
          Chat - Group {selectedGroupId}
        </h3>
      </div>
      <div className="flex-1 p-4">
        <p className="text-gray-500">
          Chat window for group: {selectedGroupId}
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;
