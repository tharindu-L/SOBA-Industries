import { Alert, Button, Form, Modal, Spinner, Table } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';

import axios from 'axios';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedMachines, setSelectedMachines] = useState([]);
  const [assignedResources, setAssignedResources] = useState({
    employees: [],
    machines: []
  });

  // Fetch all necessary data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsRes, employeesRes, machinesRes] = await Promise.all([
          axios.get('http://localhost:4000/api/quotation/get_all_jobs'),
          axios.get('http://localhost:4000/api/employee/get'),
          axios.get('http://localhost:4000/api/machine/get')
        ]);
        
        setJobs(jobsRes.data.jobs);
        setEmployees(employeesRes.data.employees);
        setMachines(machinesRes.data.machines);
      } catch (err) {
        setError('Failed to load data: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Open assign modal and reset selections
  const handleOpenAssignModal = (job) => {
    setSelectedJob(job);
    setSelectedEmployees([]);
    setSelectedMachines([]);
    setShowAssignModal(true);
  };

  // Close assign modal
  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setSelectedJob(null);
  };

  // Assign selected resources to job
  const handleAssignResources = async () => {
    try {
      const response = await axios.post('http://localhost:4000/api/jobs/assign', {
        jobId: selectedJob.id,
        employeeIds: selectedEmployees,
        machineIds: selectedMachines
      });

      if (response.data.success) {
        alert(`Resources assigned successfully!`);
        handleCloseAssignModal();
      }
    } catch (err) {
      setError('Assignment failed: ' + (err.response?.data?.message || err.message));
    }
  };

  // View assigned resources for a job
  const handleViewAssignedResources = async (job) => {
    setSelectedJob(job);
    setShowViewModal(true);
    try {
      const response = await axios.get(`http://localhost:4000/api/jobs/assigned/${job.id}`);
      setAssignedResources({
        employees: response.data.employees || [],
        machines: response.data.machines || []
      });
    } catch (err) {
      setError('Failed to load assignments: ' + (err.response?.data?.message || err.message));
    }
  };

  // Close view modal
  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setAssignedResources({ employees: [], machines: [] });
  };

  // Toggle employee selection
  const toggleEmployeeSelection = (empId) => {
    setSelectedEmployees(prev => 
      prev.includes(empId) 
        ? prev.filter(id => id !== empId) 
        : [...prev, empId]
    );
  };

  // Toggle machine selection
  const toggleMachineSelection = (machineId) => {
    setSelectedMachines(prev => 
      prev.includes(machineId) 
        ? prev.filter(id => id !== machineId) 
        : [...prev, machineId]
    );
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Job List</h2>

      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading job data...</p>
        </div>
      )}

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible className="mt-3">
          {error}
        </Alert>
      )}

      {!loading && !error && jobs.length === 0 && (
        <Alert variant="info" className="mt-3">No jobs found in the system</Alert>
      )}

      {!loading && !error && jobs.length > 0 && (
        <>
          <div className="table-responsive">
            <Table striped bordered hover className="mt-3">
              <thead className="table-primary">
                <tr>
                  <th>Job ID</th>
                  <th>Job Name</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>{job.id}</td>
                    <td>{job.job_name}</td>
                    <td>{new Date(job.start_date).toLocaleDateString()}</td>
                    <td>{job.finish_date ? new Date(job.finish_date).toLocaleDateString() : '-'}</td>
                    <td>
                      <span className={`badge rounded-pill ${
                        job.status === 'Completed' ? 'bg-success' : 
                        job.status === 'In Progress' ? 'bg-warning text-dark' : 'bg-info text-dark'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        onClick={() => handleOpenAssignModal(job)}
                        className="me-2"
                      >
                        Assign
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        onClick={() => handleViewAssignedResources(job)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </>
      )}

      {/* Assign Resources Modal */}
      <Modal show={showAssignModal} onHide={handleCloseAssignModal} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            Assign Resources: {selectedJob?.job_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <h5 className="mb-3">Available Employees</h5>
            {employees.length > 0 ? (
              <div className="row row-cols-1 row-cols-md-2 g-3">
                {employees.map((emp) => (
                  <div key={emp.id} className="col">
                    <Form.Check
                      type="checkbox"
                      id={`emp-${emp.id}`}
                      label={`${emp.name} (${emp.position})`}
                      checked={selectedEmployees.includes(emp.id)}
                      onChange={() => toggleEmployeeSelection(emp.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Alert variant="warning">No employees available</Alert>
            )}
          </div>

          <div className="mb-3">
            <h5 className="mb-3">Available Machines</h5>
            {machines.length > 0 ? (
              <div className="row row-cols-1 row-cols-md-2 g-3">
                {machines.map((machine) => (
                  <div key={machine.id} className="col">
                    <Form.Check
                      type="checkbox"
                      id={`machine-${machine.id}`}
                      label={`${machine.machineName} (${machine.status})`}
                      checked={selectedMachines.includes(machine.id)}
                      onChange={() => toggleMachineSelection(machine.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Alert variant="warning">No machines available</Alert>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCloseAssignModal}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAssignResources}
            disabled={selectedEmployees.length === 0 && selectedMachines.length === 0}
          >
            Confirm Assignment
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Assigned Resources Modal */}
      <Modal show={showViewModal} onHide={handleCloseViewModal} size="lg">
        <Modal.Header closeButton className="bg-info text-white">
          <Modal.Title>
            Assigned Resources: {selectedJob?.job_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <h5 className="mb-3">Assigned Employees ({assignedResources.employees.length})</h5>
            {assignedResources.employees.length > 0 ? (
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedResources.employees.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.name}</td>
                      <td>{emp.position}</td>
                      <td>
                        <span className="badge bg-success">Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <Alert variant="info">No employees assigned</Alert>
            )}
          </div>

          <div className="mb-3">
            <h5 className="mb-3">Assigned Machines ({assignedResources.machines.length})</h5>
            {assignedResources.machines.length > 0 ? (
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Machine</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedResources.machines.map((machine) => (
                    <tr key={machine.id}>
                      <td>{machine.machineName}</td>
                      <td>{machine.type || 'N/A'}</td>
                      <td>
                        <span className={`badge ${
                          machine.status === 'Active' ? 'bg-success' : 'bg-warning'
                        }`}>
                          {machine.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <Alert variant="info">No machines assigned</Alert>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCloseViewModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default JobList;