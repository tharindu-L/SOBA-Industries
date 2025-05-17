import "bootstrap/dist/css/bootstrap.min.css";

import React from "react";
import { useNavigate } from "react-router-dom";

const Footprints = () => {
  const navigate = useNavigate();

  return (
    <section className="py-5" style={{ backgroundColor: "#f4f4f9" }}>
      <div className="container-fluid text-center">
        {/* Shop Header */}
        <div className="mb-5">
          <h1 className="display-4 fw-bold" style={{ color: "#4a148c" }}>
            SOBA Industries
          </h1>
          <p className="lead" style={{ color: "#7b1fa2" }}>
            Specialists in School Badges, Custom Medals & Artistic Iron Works
          </p>
        </div>

        <h6 style={{ color: "#7b1fa2" }}>Precision in Metal Craftsmanship</h6>
        <h2 className="fw-bold mb-4" style={{ color: "#4a148c" }}>
          Our Workshop Achievements
        </h2>

        <div className="row justify-content-center mt-5">
          {/* Experience Circle */}
          <div className="col-md-3 col-sm-6 mb-4">
            <div
              className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center mx-auto"
              style={{
                width: "150px",
                height: "150px",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                cursor: 'pointer',
              }}
            >
              <div>
                <h3 className="fw-bold mb-0">15+</h3>
                <p className="mb-0">Years in Metal Craft</p>
              </div>
            </div>
          </div>

          {/* Projects Circle */}
          <div className="col-md-3 col-sm-6 mb-4">
            <div
              className="rounded-circle bg-info text-white d-flex justify-content-center align-items-center mx-auto"
              style={{
                width: "150px",
                height: "150px",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                cursor: 'pointer',
              }}
            >
              <div>
                <h3 className="fw-bold mb-0">2K+</h3>
                <p className="mb-0">Metal Projects Completed</p>
              </div>
            </div>
          </div>

          {/* Schools Circle */}
          <div className="col-md-3 col-sm-6 mb-4">
            <div
              className="rounded-circle bg-success text-white d-flex justify-content-center align-items-center mx-auto"
              style={{
                width: "150px",
                height: "150px",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                cursor: 'pointer',
              }}
            >
              <div>
                <h3 className="fw-bold mb-0">500+</h3>
                <p className="mb-0">Schools Served</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Button */}
        <div className="mt-4 mb-5">
          <button 
            className="btn btn-primary btn-lg"
            style={{
              backgroundColor: "#4a148c",
              border: "none",
              padding: "15px 40px",
              fontSize: "1.2rem",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
            onClick={() => navigate("/dashboard/create-new-Custom-Order")}
          >
            ✂️ Custom Order Now
          </button>
        </div>

        {/* Testimonial */}
        <p className="mt-5" style={{ color: "#4a148c" }}>
          <em>
            "Shaping metal with precision since 2008"<br />
            - SOBA Industries Works Team
          </em>
        </p>
      </div>
    </section>
  );
};

export default Footprints;