import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import "./QueueStatus.css";

const QueueStatus = () => {
  const [queueNumber, setQueueNumber] = useState("");
  const [currentServing, setCurrentServing] = useState("");
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    const fetchQueueStatus = async () => {
      try {
        setLoading(true);

        const userID = localStorage.getItem("employeeID");
        if (!userID) throw new Error("User not registered!");

        const queueRef = collection(db, "queue");
        const userQuery = query(queueRef, where("employeeID", "==", userID));
        const userSnapshot = await getDocs(userQuery, { source: "server" });

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setQueueNumber(userData.queueNumber);

          if (userData.timestamp) {
            const timestamp = userData.timestamp.toDate();
            setDate(timestamp.toLocaleDateString());
            setTime(timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
          } else {
            setDate("No Date");
            setTime("No Time");
          }
        } else {
          setQueueNumber("N/A");
        }

        const currentServingRef = doc(db, "queueStatus", "currentServing");
        const currentServingSnapshot = await getDoc(currentServingRef);
        if (currentServingSnapshot.exists()) {
          setCurrentServing(currentServingSnapshot.data().number);
        } else {
          setCurrentServing("N/A");
        }
      } catch (error) {
        console.error("Error fetching queue status:", error);
        setQueueNumber("Error");
        setCurrentServing("Error");
      } finally {
        setLoading(false);
      }
    };

    fetchQueueStatus();
  }, []);

  return (
    <div className="queue-status-page">
      <div className="queue-status-container">
        <h1>Your Ticket Number is</h1>
        {loading ? (
          <p>Loading your ticket...</p>
        ) : (
          <>
            <div className="ticket-details">
              <div className="current-serving-card">{queueNumber}</div>
            </div>
            <div className="current-serving">
              <p>Current Serving: {currentServing}</p>
            </div>
          </>
        )}
        <br></br>
        <p>Thank you for visiting our clinic</p>
        <br></br>
        <p>Stay safe, stay healthy</p>
        <div className="date-time">
          <span className="date">{date}</span>
          <span className="time">{time}</span>
        </div>
      </div>
    </div>
  );
};

export default QueueStatus;
