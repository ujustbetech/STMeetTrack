import { useState, useEffect } from 'react';
import { db } from '../../../../firebaseConfig'; // Ensure the correct path
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/router';
import Layout from '../../../../component/Layout';
import "../../../../src/app/styles/main.scss";





const EditEvent = (data) => {
    
    
    const router = useRouter();
    const { id } = router.query; // Get the event ID from the URL

    const [eventName, setEventName] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [agendaPoints, setAgendaPoints] = useState(['']);
    const [zoomLink, setZoomLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');




    // Fetch event data when ID changes
 function formatTimestampToInput(timestamp) {
  if (!timestamp || !timestamp.toDate) return '';
  const date = timestamp.toDate();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}


    // Handle event update
    const handleUpdateEvent = async (e) => {
        e.preventDefault();
        if (!eventName || !eventTime || !zoomLink || agendaPoints.some(point => point.trim() === '')) {
            setError('Please fill in all fields.');
            return;
        }

        try {
            const eventDocRef = doc(db, 'STmeet', id);
            await updateDoc(eventDocRef, {
                name: eventName,
                time: Timestamp.fromDate(new Date(eventTime)),
                agenda: agendaPoints,
                zoomLink: zoomLink,
            });

            setSuccess('Event updated successfully!');
            router.push('/admin/event/manageEvent'); // Redirect after update
        } catch (error) {
            console.error("Error updating event:", error);
            setError('Error updating event. Please try again.');
        }
    };
useEffect(() => {
  const fetchEvent = async () => {
    console.log("Fetching event for ID:", id);
    try {
      const eventDocRef = doc(db, 'STmeet', id);
      const eventSnap = await getDoc(eventDocRef);

      if (eventSnap.exists()) {
        const data = eventSnap.data();
        console.log("Fetched event data:", data);

        setEventName(data.name || '');
        setAgendaPoints(data.agenda || ['']);
        setZoomLink(data.zoomLink || '');

        if (data.time?.toDate) {
          const formatted = formatTimestampToInput(data.time);
          console.log("Formatted event time:", formatted);
          setEventTime(formatted);
        } else {
          console.warn("Event time is missing or not a Timestamp:", data.time);
        }
      } else {
        console.error("No event document found for ID:", id);
      }
    } catch (err) {
      console.error("Error fetching event:", err);
    }
  };

  if (id) {
    fetchEvent();
  } else {
    console.warn("No ID provided for fetching event.");
  }
}, [id]);
    return (
        <Layout key={id}> {/* Forces re-render when ID changes */}
            <section className='c-form box'>
                <h2>Edit Event</h2>
                <button className="m-button-5" onClick={() => router.back()}>
                    Back
                </button>

                {loading ? (
                    <p>Loading event details...</p>
                ) : error ? (
                    <p style={{ color: 'red' }}>{error}</p>
                ) : (
                    <form onSubmit={handleUpdateEvent}>
                        <ul>
                            <li className='form-row'>
                                <h4>Event Name</h4>
                                <div className='multipleitem'>
                                   <input
  type="datetime-local"
  value={eventTime}
  onChange={(e) => setEventTime(e.target.value)}
  required
/>

                                </div>
                            </li>

                            <li className='form-row'>
                                <h4>Date</h4>
                                <div className='multipleitem'>
                               <input
  type="datetime-local"
  value={eventTime}
  onChange={(e) => setEventTime(e.target.value)}
  required
/>



                                </div>
                            </li>

                            <li className='form-row'>
                                <h4>Agenda</h4>
                                <div className='multipleitem'>
                                    {agendaPoints.map((point, index) => (
                                        <textarea
                                            key={index}
                                            value={point}
                                            onChange={(e) => {
                                                const updatedPoints = [...agendaPoints];
                                                updatedPoints[index] = e.target.value;
                                                setAgendaPoints(updatedPoints);
                                            }}
                                            required
                                        />
                                    ))}
                                </div>
                            </li>

                            <li className='form-row'>
                                <h4>Zoom Link</h4>
                                <div className='multipleitem'>
                                    <input
                                        type="text"
                                        value={zoomLink}
                                        onChange={(e) => setZoomLink(e.target.value)}
                                        required
                                    />
                                </div>
                            </li>

                            {success && <p style={{ color: 'green' }}>{success}</p>}

                            <li className='form-row'>
                                <div>
                                    <button className='submitbtn' type='submit'>Update</button>
                                </div>
                            </li>
                        </ul>
                    </form>
                )}
            </section>
        </Layout>
    );
};

export default EditEvent;
