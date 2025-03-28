"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import "../Assets/css/adminAppointments.modules.css";
import Navbar from "../navbar/navBar";

interface Appointment {
  _id: string;
  clientName: string;
  name?: string;
  date: string;
  time: string;
  location: string;
  status: string; // e.g., Pending, Approved, Past
  notes?: string;
  email?: string;
  phone?: string;
}

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleData, setRescheduleData] = useState<{ id: string; date: string; time: string } | null>(null);

  // Fetch appointments
  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments`)
      .then((response) => {
        console.log("Fetched Appointments:", response.data);
        setAppointments(response.data);
        setLoading(false);
      })
      .catch((error) => console.error("Error fetching appointments:", error));
  }, []);

  // Cancel an appointment (used for upcoming appointments)
  const handleCancelAppointment = (id: string) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      axios
        .delete(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${id}`)
        .then(() => {
          setAppointments(appointments.filter((appointment) => appointment._id !== id));
        })
        .catch((error) => console.error("Error canceling appointment:", error));
    }
  };

  // Reject an appointment (used for pending appointments)
  const handleRejectAppointment = (id: string) => {
    if (window.confirm("Are you sure you want to reject this appointment?")) {
      axios
        .delete(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${id}`)
        .then(() => {
          setAppointments(appointments.filter((appointment) => appointment._id !== id));
        })
        .catch((error) => console.error("Error rejecting appointment:", error));
    }
  };

  // Open reschedule modal
  const handleRescheduleClick = (id: string, date: string, time: string) => {
    setRescheduleData({ id, date, time });
  };

  // Confirm reschedule
  const handleConfirmReschedule = () => {
    if (!rescheduleData) return;
    const { id, date, time } = rescheduleData;

    axios
      .put(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${id}`, { date, time })
      .then(() => {
        setAppointments(
          appointments.map((appointment) =>
            appointment._id === id ? { ...appointment, date, time } : appointment
          )
        );
        setRescheduleData(null);
      })
      .catch((error) => console.error("Error rescheduling appointment:", error));
  };

  // Approve an appointment
  const handleApproveAppointment = (id: string) => {
    axios
      .put(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${id}`, { status: "Approved" })
      .then(() => {
        setAppointments(
          appointments.map((appointment) =>
            appointment._id === id ? { ...appointment, status: "Approved" } : appointment
          )
        );
      })
      .catch((error) => console.error("Error approving appointment:", error));
  };

  // Format date for display
  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Categorize appointments
  const pendingAppointments = appointments.filter((app) => app.status === "Pending");
  const upcomingAppointments = appointments.filter(
    (app) => new Date(app.date) > new Date() && app.status === "Approved"
  );
  const pastAppointments = appointments.filter((app) => new Date(app.date) < new Date());

  return (
    <div>
      <Navbar />
      <div className="admin-appointments-container">
        <h1>Appointments</h1>

        {/* Pending Appointments */}
        <div className="sectionWrapper">
          <section className="appointments">
            <h2 className="sectionHeader">Pending Approval</h2>
            {pendingAppointments.length > 0 ? (
              pendingAppointments.map((appointment) => (
                <div key={appointment._id} className="appointment-card">
                  <p>
                    <strong>{appointment.clientName}</strong>
                  </p>
                  <p>
                      <strong>
                        Name: {appointment.clientName || appointment.name}
                      </strong>
                    </p>
                    <p>
                      <strong>Date:</strong> {formatDateTime(appointment.date)}
                    </p>

                    {appointment.notes && (
                      <p>
                        <strong>Notes:</strong> {appointment.notes}
                      </p>
                    )}
                    {appointment.email && (
                      <p>
                        <strong>Email:</strong> {appointment.email}
                      </p>
                    )}
                    {appointment.phone && (
                      <p>
                        <strong>Phone:</strong> {appointment.phone}
                      </p>
                    )}
                  <button
                    className="approveButton"
                    onClick={() => handleApproveAppointment(appointment._id)}
                  >
                    Approve
                  </button>
                  <button className="rejectButton" onClick={() => handleRejectAppointment(appointment._id)}>
                    Reject
                  </button>
                </div>
              ))
            ) : (
              <p>No pending appointments.</p>
            )}
          </section>
        </div>

        {/* Upcoming Appointments */}
        <div className="sectionWrapper">
          <section className="appointments">
            <h2 className="sectionHeader">Upcoming Appointments</h2>
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <div key={appointment._id} className="appointment-card">
                  <p>
                    <strong>{appointment.clientName}</strong>
                  </p>
                  <p>
                      <strong>
                        Name: {appointment.clientName || appointment.name}
                      </strong>
                    </p>
                    <p>
                      <strong>Date:</strong> {formatDateTime(appointment.date)}
                    </p>

                    {appointment.notes && (
                      <p>
                        <strong>Notes:</strong> {appointment.notes}
                      </p>
                    )}
                    {appointment.email && (
                      <p>
                        <strong>Email:</strong> {appointment.email}
                      </p>
                    )}
                    {appointment.phone && (
                      <p>
                        <strong>Phone:</strong> {appointment.phone}
                      </p>
                    )}
                  <button className="cancelButton" onClick={() => handleCancelAppointment(appointment._id)}>
                    Cancel
                  </button>
                  <button
                    className="rescheduleButton"
                    onClick={() => handleRescheduleClick(appointment._id, appointment.date, appointment.time)}
                  >
                    Reschedule
                  </button>
                </div>
              ))
            ) : (
              <p>No upcoming appointments.</p>
            )}
          </section>
        </div>

        {/* Past Appointments */}
        <div className="sectionWrapper">
          <section className="appointments">
            <h2 className="sectionHeader">Past Appointments</h2>
            {pastAppointments.length > 0 ? (
              pastAppointments.map((appointment) => (
                <div key={appointment._id} className="appointment-card">
                  <p>
                    <strong>{appointment.clientName}</strong>
                  </p>
                  <p>
                      <strong>
                        Name: {appointment.clientName || appointment.name}
                      </strong>
                    </p>
                    <p>
                      <strong>Date:</strong> {formatDateTime(appointment.date)}
                    </p>

                    {appointment.notes && (
                      <p>
                        <strong>Notes:</strong> {appointment.notes}
                      </p>
                    )}
                    {appointment.email && (
                      <p>
                        <strong>Email:</strong> {appointment.email}
                      </p>
                    )}
                    {appointment.phone && (
                      <p>
                        <strong>Phone:</strong> {appointment.phone}
                      </p>
                    )}
                </div>
              ))
            ) : (
              <p>No past appointments.</p>
            )}
          </section>
        </div>

        {/* Reschedule Modal */}
        {rescheduleData && (
          <div className="modal">
            <div className="modal-content">
              <h3>Reschedule Appointment</h3>
              <label>New Date:</label>
              <input
                type="date"
                value={rescheduleData.date}
                onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
              />
              <label>New Time:</label>
              <input
                type="time"
                value={rescheduleData.time}
                onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
              />
              <button onClick={handleConfirmReschedule}>Confirm</button>
              <button onClick={() => setRescheduleData(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
