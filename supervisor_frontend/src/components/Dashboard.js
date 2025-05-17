
import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const Dashboard = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/supervisors/profile');
        setProfileData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="dashboard-container">
      <h1>Welcome to your Dashboard</h1>
      {profileData && (
        <div className="profile-info">
          <h2>Your Profile</h2>
          <p><strong>Name:</strong> {profileData.supervisor_name}</p>
          <p><strong>Email:</strong> {profileData.email}</p>
          <p><strong>Phone:</strong> {profileData.tel_num}</p>
          <p><strong>Joined:</strong> {new Date(profileData.join_date).toLocaleDateString()}</p>
        </div>
      )}
      {/* Add your dashboard content here */}
    </div>
  );
};

export default Dashboard;