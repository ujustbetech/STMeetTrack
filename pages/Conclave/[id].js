import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import Link from 'next/link';
import '../../src/app/styles/user.scss';
import HeaderNav from '../../component/HeaderNav';

const db = getFirestore(app);

const ConclaveDetails = () => {
  const router = useRouter();
  const { id } = router.query;
    const [phoneNumber, setPhoneNumber] = useState('');
const { id: conclaveId } = router.query; // Use `id` as `conclaveId`
  const [conclave, setConclave] = useState(null);
  const [meetings, setMeetings] = useState([]);
    const [cpPoints, setCPPoints] = useState(0);
      const [userName, setUserName] = useState('');
  useEffect(() => {
    if (id) {
      fetchConclave();
      fetchMeetings();
    }
  }, [id]);

  const fetchConclave = async () => {
    try {
      const conclaveRef = doc(db, 'Conclaves', id);
      const conclaveSnap = await getDoc(conclaveRef);
      if (conclaveSnap.exists()) {
        setConclave(conclaveSnap.data());
      }
    } catch (err) {
      console.error('Error fetching conclave:', err);
    }
  };
const getInitials = (name) => {
    return name
      .split(" ") // Split the name into words
      .map(word => word[0]) // Get the first letter of each word
      .join(""); // Join them together
  };
  const fetchMeetings = async () => {
    try {
      const meetingsRef = collection(db, 'Conclaves', id, 'meetings');
      const meetingsSnap = await getDocs(meetingsRef);
      const list = meetingsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMeetings(list);
    } catch (err) {
      console.error('Error fetching meetings:', err);
    }
  };
useEffect(() => {
  if (!phoneNumber) return; // 👈 important check

  const fetchCP = async () => {
    try {
      const activitiesRef = collection(db, "Orbiters", phoneNumber, "activities");
      const activitiesSnapshot = await getDocs(activitiesRef);

      let totalCP = 0;

      activitiesSnapshot.forEach((doc) => {
        const data = doc.data();
        totalCP += Number(data?.points) || 0;
      });

      setCPPoints(totalCP);
    } catch (error) {
      console.error("Error fetching CP points:", error);
    }
  };

  fetchCP();
}, [phoneNumber]);


const fetchUserName = async (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.trim() === '') {
    console.error("Invalid phone number:", phoneNumber);
    return;
  }

  console.log("Fetch User from Userdetails", phoneNumber);
  try {
    const userRef = doc(db, 'userdetails', phoneNumber);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const orbitername = userDoc.data()[" Name"] || 'User';
      setUserName(orbitername);
    } else {
      console.log("User not found in userdetails");
    }
  } catch (err) {
    console.error("Error fetching user name:", err);
  }
};
  return (
     <main className="pageContainer">
      <header className='Main m-Header'>
        <section className='container'>
          <div className='innerLogo' onClick={() => router.push('/')}>
            <img src="/ujustlogo.png" alt="Logo" className="logo" />
          </div>
           <div className='headerRight'>
              <button onClick={() => router.push(`/cp-details/${phoneNumber}`)} class="reward-btn">
                <div class="IconContainer">
                  <svg
                    class="box-top box"
                    viewBox="0 0 60 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 18L58 18"
                      stroke="#6A8EF6"
                      stroke-width="4"
                      stroke-linecap="round"
                    ></path>
                    <circle
                      cx="20.5"
                      cy="9.5"
                      r="7"
                      fill="#101218"
                      stroke="#6A8EF6"
                      stroke-width="5"
                    ></circle>
                    <circle
                      cx="38.5"
                      cy="9.5"
                      r="7"
                      fill="#101218"
                      stroke="#6A8EF6"
                      stroke-width="5"
                    ></circle>
                  </svg>

                  <svg
                    class="box-body box"
                    viewBox="0 0 58 44"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <mask id="path-1-inside-1_81_19" fill="white">
                      <rect width="58" height="44" rx="3"></rect>
                    </mask>
                    <rect
                      width="58"
                      height="44"
                      rx="3"
                      fill="#101218"
                      stroke="#6A8EF6"
                      stroke-width="8"
                      mask="url(#path-1-inside-1_81_19)"
                    ></rect>
                    <line
                      x1="-3.61529e-09"
                      y1="29"
                      x2="58"
                      y2="29"
                      stroke="#6A8EF6"
                      stroke-width="6"
                    ></line>
                    <path
                      d="M45.0005 20L36 3"
                      stroke="#6A8EF6"
                      stroke-width="5"
                      stroke-linecap="round"
                    ></path>
                    <path
                      d="M21 3L13.0002 19.9992"
                      stroke="#6A8EF6"
                      stroke-width="5"
                      stroke-linecap="round"
                    ></path>
                  </svg>

                  <div class="coin"></div>
                </div>
                <div class="text">CP: {cpPoints}</div>  
              </button>
              <div className='userName'> <span>{getInitials(userName)}</span> </div>
            </div>

        
        </section>
      </header>
     
     <section className='dashBoardMain'>
        <div className='sectionHeadings'>
          <h2>{conclave?.conclaveStream || 'Conclave'} Meetings</h2>
        </div>
  <div className="container eventList">
       {meetings.map((meeting, index) => {
  const date = meeting.datetime?.seconds
    ? new Date(meeting.datetime.seconds * 1000)
    : null;

  return (
    <div className="meetingBox" key={index}>
        <span className="meetingLable">
 {date?.toLocaleDateString('en-IN')} {date?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
</span>
      <div className="meetingDetails">
        <div className="eventDetails">
        <h3>{meeting.meetingName || 'Untitled Meeting'}</h3>
   
    
      <p>
  <strong>Mode:</strong>{' '}
  <span>{meeting.mode?.charAt(0).toUpperCase() + meeting.mode?.slice(1).toLowerCase()}</span>
</p>

{meeting.mode === 'online' && (
  <p>
    <strong>Zoom Link:</strong>{' '}
    <a href={meeting.link} target="_blank" rel="noopener noreferrer">
      {meeting.link}
    </a>
  </p>
)}

{meeting.mode === 'offline' && (
  <p>
    <strong>Venue:</strong>{' '}
    <span>{meeting.venue?.charAt(0).toUpperCase() + meeting.venue?.slice(1).toLowerCase()}</span>
  </p>
)}

        </div>
      </div>
 
    <div className="meetingBoxFooter">
  <div className="viewDetails">
    <Link
      href={`/meeting/${meeting.id}`}
      onClick={() => localStorage.setItem('conclaveId', conclaveId)}
  
    >
      View Details
    </Link>
  </div>
</div>

    </div>
  );
})}

        </div>



 <HeaderNav/>
    </section>
    </main>
 
  );
};

export default ConclaveDetails;
