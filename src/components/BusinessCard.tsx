import React, { useState } from "react";
import { Card, Button } from "react-bootstrap";
import ChatModal from "./ChatModal";

interface Business {
  id: number;
  name: string;
  category: string;
  location: string;
  description: string;
}

interface BusinessCardProps {
  business: Business;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business }) => {
  const [showChat, setShowChat] = useState(false);

  const handleOpenChat = () => setShowChat(true);
  const handleCloseChat = () => setShowChat(false);

  return (
    <>
      <Card className="mb-3 shadow-sm">
        <Card.Body>
          <Card.Title>{business.name}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            {business.category} - {business.location}
          </Card.Subtitle>
          <Card.Text>{business.description}</Card.Text>
          <Button variant="primary" onClick={handleOpenChat}>
            Chat
          </Button>
        </Card.Body>
      </Card>

      <ChatModal
        show={showChat}
        handleClose={handleCloseChat}
        businessName={business.name}
      />
    </>
  );
};

export default BusinessCard;
