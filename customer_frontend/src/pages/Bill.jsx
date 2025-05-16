import { Alert, Spinner, Table } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';

import axios from 'axios';

const JobsByUser = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      const token = localStorage.getItem('token'); // Fetch token directly from localStorage
      if (!token) {
        setError('Not authorized. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(
          'http://localhost:4000/api/quotation/get_job', // Backend URL for fetching jobs
          {}, // No need to send any body since the token is in headers
          { headers: { token } } // Send token in headers
        );
        setJobs(response.data.jobs);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setError('Unauthorized. Please log in again.');
        } else {
          setError('Error fetching jobs. Please try again later.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []); // Empty dependency array means it runs only once when the component mounts

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-1">
          {/* Adjust this part to match your sidebar styling */}
        </div>

        {/* Main content */}
        <div className="col-md-9">
          <h2>Jobs</h2>

          {loading && (
            <div className="d-flex justify-content-center">
              <Spinner animation="border" variant="primary" />
            </div>
          )}

          {error && <Alert variant="danger">{error}</Alert>}

          {!loading && !error && jobs.length === 0 && (
            <Alert variant="info">No jobs found.</Alert>
          )}

          {!loading && !error && jobs.length > 0 && (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Job Name</th>
                  <th>Start Date</th>
                  <th>Finish Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>{job.id}</td>
                    <td>{job.job_name}</td>
                    <td>{new Date(job.start_date).toLocaleDateString()}</td>
                    <td>
                      {job.finish_date
                        ? new Date(job.finish_date).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td>{job.status}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobsByUser;
