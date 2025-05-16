import "bootstrap/dist/css/bootstrap.min.css";

import React, { useEffect, useState } from "react";

import axios from "axios";

const AdminInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [updateAmount, setUpdateAmount] = useState("");
  const [isViewing, setIsViewing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // To show error message

  // Fetch all invoices for the admin
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/quotation/get_all");
        setInvoices(res.data.invoices);
      } catch (err) {
        console.error("Error fetching invoices:", err);
      }
    };
    fetchInvoices();
  }, []);

  // View full details of the invoice by sending customer_id as userId
  const viewInvoice = async (customerId, invoiceId) => {
    try {
      const res = await axios.post(
        "http://localhost:4000/api/quotation/get_invoice2",
        { userId: customerId, invoiceId: invoiceId }
      );
      setSelectedInvoice(res.data.invoices[0]);
      setIsViewing(true); // Set viewing mode
    } catch (err) {
      console.error("Error fetching invoice details:", err);
    }
  };

  // Update payment amount for an invoice
  const updatePayment = async (invoiceId) => {
    const totalAmount = selectedInvoice.total_amount;
    const currentPaidAmount = selectedInvoice.paid_amount;

    // Validate the update amount doesn't exceed total amount
    if (parseFloat(updateAmount) + currentPaidAmount > totalAmount) {
      setErrorMessage("Payment cannot exceed total amount.");
      return; // Prevent update
    } else {
      setErrorMessage(""); // Clear error message

      try {
        const res = await axios.post("http://localhost:4000/api/quotation/invoice_payment", {
          invoiceId,
          paymentAmount: updateAmount,
        });
        alert(res.data.message);
        window.location.reload();
      } catch (err) {
        console.error("Error updating payment:", err);
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">All Invoices</h2>
      <table className="table table-striped table-bordered">
        <thead className="thead-dark">
          <tr>
            <th>Invoice ID</th>
            <th>Customer ID</th>
            <th>Total Amount</th>
            <th>Paid Amount</th>
            <th>Payment Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.invoice_id}>
              <td>{invoice.invoice_id}</td>
              <td>{invoice.customer_id}</td>
              <td>{invoice.total_amount}</td>
              <td>{invoice.paid_amount}</td>
              <td>{invoice.payment_status}</td>
              <td>
                <button
                  onClick={() => viewInvoice(invoice.customer_id, invoice.invoice_id)}
                  className="btn btn-primary btn-sm mr-2"
                >
                  View
                </button>
                <button
                  onClick={() => {
                    if (invoice.payment_status !== "Completed" && invoice.payment_status !== "Paid") {
                      setSelectedInvoice(invoice);
                      setIsViewing(false); // Set update mode
                    }
                  }}
                  className={`btn btn-sm ${invoice.payment_status === "Completed" || invoice.payment_status === "Paid" ? "btn-secondary" : "btn-success"}`}
                  disabled={invoice.payment_status === "Completed" || invoice.payment_status === "Paid"}
                >
                  {invoice.payment_status === "Completed" || invoice.payment_status === "Paid" ? "Payment Done" : "Update"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Viewing Invoice Details */}
      {selectedInvoice && isViewing && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Invoice Details</h5>
              </div>
              <div className="modal-body">
                <p><strong>Invoice ID:</strong> {selectedInvoice.invoice_id}</p>
                <p><strong>Customer ID:</strong> {selectedInvoice.customer_id}</p>
                <p><strong>Total Amount:</strong> {selectedInvoice.total_amount}</p>
                <p><strong>Paid Amount:</strong> {selectedInvoice.paid_amount}</p>
                <p><strong>Payment Status:</strong> {selectedInvoice.payment_status}</p>
                <h5 className="mt-3">Items:</h5>
                <ul>
                  {selectedInvoice.items?.map((item, index) => (
                    <li key={index}>
                      {item.material_name} - {item.quantity} units * LKR {item.unit_price}  each
                    </li>
                  ))}
                </ul>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedInvoice(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Updating Payment */}
      {selectedInvoice && !isViewing && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Payment</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setSelectedInvoice(null)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p><strong>Invoice ID:</strong> {selectedInvoice.invoice_id}</p>
                <p><strong>Current Paid Amount:</strong> {selectedInvoice.paid_amount}</p>
                <input
                  type="number"
                  value={updateAmount}
                  onChange={(e) => setUpdateAmount(e.target.value)}
                  placeholder="Enter new payment amount"
                  className="form-control mt-2"
                />
                {/* Display error message if the validation fails */}
                {errorMessage && <div className="text-danger mt-2">{errorMessage}</div>}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => updatePayment(selectedInvoice.invoice_id)}
                >
                  Update
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedInvoice(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvoices;
