import React from "react";
import { Modal, Button } from "react-bootstrap";

interface ChatModalProps {
  show: boolean;
  handleClose: () => void;
  businessName: string;
}

const ChatModal: React.FC<ChatModalProps> = ({ show, handleClose, businessName }) => {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Chat with {businessName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>This is a placeholder for the chat feature.</p>
        {/* You can integrate real chat messages here */}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChatModal;
