import React from "react";
import { Link } from "react-router-dom";

// ✅ Import the image correctly from assets
import localBusinessImg from "../assets/local_business.png"; // Adjust path if needed

const Home: React.FC = () => {
  return (
    <div className="bg-dark text-white py-5">
      <div className="container">
        {/* Hero Section */}
        <div className="row align-items-center mb-5">
          <div className="col-md-6 text-center text-md-start">
            <h1 className="display-4 fw-bold mb-3">
              Welcome to <span className="text-warning">TomiLink</span>
            </h1>
            <p className="lead">
              Discover and connect with trusted local businesses around Karatina University.
            </p>
            <Link to="/browse" className="btn btn-warning btn-lg mt-3 px-4 shadow-sm">
              Browse Businesses
            </Link>
          </div>

          {/* ✅ Modern image style */}
          <div className="col-md-6 text-center">
            <div className="p-3 bg-white rounded-4 shadow-lg d-inline-block">
              <img
                src={localBusinessImg}
                alt="Local businesses"
                className="img-fluid rounded-3"
                style={{ maxHeight: "400px", objectFit: "cover" }}
              />
            </div>
          </div>
        </div>

        {/* How It Works */}
        <section className="my-5">
          <h2 className="text-center mb-4 fw-bold">How It Works</h2>
          <div className="row text-center">
            {[
              {
                icon: "search",
                title: "Search & Discover",
                desc: "Find salons, tech repair, food spots, and more near you.",
              },
              {
                icon: "chat-dots",
                title: "Chat & Inquire",
                desc: "Ask questions or request service through our chat system.",
              },
              {
                icon: "bag-check",
                title: "Book or Order",
                desc: "Place orders or bookings directly and get instant service.",
              },
            ].map((step, idx) => (
              <div className="col-md-4 mb-4" key={idx}>
                <div className="p-4 border rounded bg-secondary bg-opacity-10 h-100 shadow-sm">
                  <i className={`bi bi-${step.icon} display-4 text-warning mb-3`}></i>
                  <h5 className="fw-semibold">{step.title}</h5>
                  <p className="text-light">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Categories */}
        <section className="my-5">
          <h2 className="text-center mb-4 fw-bold">Popular Categories</h2>
          <div className="row g-4">
            {[
              "Food & Drinks",
              "Salon & Barber",
              "Phone Repair",
              "Printing & Stationery",
              "Fashion",
              "Tech Services",
            ].map((cat, idx) => (
              <div className="col-sm-6 col-md-4" key={idx}>
                <div className="card bg-light bg-opacity-10 text-white h-100 text-center shadow-sm border-0 p-3 hover-shadow">
                  <i className="bi bi-shop-window display-5 text-warning mb-2"></i>
                  <h6 className="fw-semibold">{cat}</h6>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link to="/browse" className="btn btn-outline-warning px-4">
              View All Businesses
            </Link>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-light text-dark py-5 px-4 mt-5 rounded shadow-sm">
          <h2 className="text-center mb-4 fw-bold">What Clients Are Saying</h2>
          <div className="row g-4">
            {[
              {
                name: "Brian W.",
                comment: "TomiLink helped me quickly find a reliable laptop repair guy on campus!",
              },
              {
                name: "Mercy K.",
                comment: "I love how I can easily compare prices from different salons near Karu.",
              },
              {
                name: "Kelvin M.",
                comment: "Ordering food during exams has never been this easy. 10/10!",
              },
            ].map((testimonial, i) => (
              <div className="col-md-4" key={i}>
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body">
                    <p className="card-text fst-italic">"{testimonial.comment}"</p>
                    <div className="text-end fw-semibold mt-3">— {testimonial.name}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
