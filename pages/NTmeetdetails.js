import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import * as React from 'react';
import { db } from '../firebaseConfig';
import Link from 'next/link'
import { doc, getDoc, collection, getDocs, setDoc, Timestamp, addDoc } from 'firebase/firestore';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../src/app/styles/user.scss';
import HeaderNav from '../component/HeaderNav';

const HomePage = () => {
  const router = useRouter();
  const [showpopup, setshowpopup] = useState(false); 
  const { id } = router.query;
  const [phoneNumber, setPhoneNumber] = useState('');
  const [value, setValue] = React.useState(0);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('');
  const [eventDetails, setEventDetails] = useState(null);
  const [registerUsersList, setregisterUsersList] = useState(null);
  const [cpPoints, setCPPoints] = useState(0);
  const [eventList, setEventList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [member, setMember] = useState([]);
  const [suggestionText, setSuggestionText] = useState("");

  // ✅ New states for event creation
  const [eventName, setEventName] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [zoomLink, setZoomLink] = useState("");
  const [agendaPoints, setAgendaPoints] = useState([""]);
  const [isAdmin, setIsAdmin] = useState(false);
const [selectedMembers, setSelectedMembers] = useState([]);
const [stMembers, setStMembers] = useState([]); // fetch this list from Firestore or hardcode for now

  useEffect(() => {
    const storedPhoneNumber = localStorage.getItem("stnumber");
    setPhoneNumber(storedPhoneNumber);

    if (storedPhoneNumber) {
     const getNTEventList = async () => {
  try {
    const eventCollection = collection(db, "STmeet");
    const eventSnapshot = await getDocs(eventCollection);
    let eventList = eventSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    eventList.sort((a, b) => b.time.seconds - a.time.seconds);

    // ✅ Show logic:
    // - If createdBy is missing → admin-created → show to all
    // - Else (user-created) → show only if invited
   eventList = eventList.filter(event => {
  if (!event.createdBy) {
    return true; // admin event
  }
  return (
    event.createdBy === phoneNumber || // show if user is creator
    (event.invitedMembers && event.invitedMembers.includes(phoneNumber)) // or if invited
  );
});


    setEventList(eventList);
  } catch (err) {
    console.error("Error fetching events:", err);
  }
};

      setIsLoggedIn(true);
      setLoading(false);
      fetchUserName(storedPhoneNumber);
      getNTEventList()
    }
  }, []);
useEffect(() => {
  const fetchSTMembers = async () => {
    try {
      const membersRef = collection(db, "STMembers");
      const membersSnapshot = await getDocs(membersRef);
      const membersList = membersSnapshot.docs.map((doc) => ({
        phone: doc.data().phoneNumber,
        name: doc.data().name,
      }));
      setStMembers(membersList);
    } catch (error) {
      console.error("Error fetching ST Members:", error);
    }
  };

  fetchSTMembers();
}, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const getNTEventList = async () => {
      try {
        const eventCollection = collection(db, "STmeet");
        const eventSnapshot = await getDocs(eventCollection);
        const eventList = eventSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        eventList.sort((a, b) => b.time.seconds - a.time.seconds);
        setEventList(eventList);
      } catch (err) {
        console.error("Error fetching team members:", err);
      }
    };

    try {
      const response = await axios.post('https://api.ujustbe.com/mobile-check', {
        MobileNo: phoneNumber,
      });

      if (response.data.message[0].type === 'SUCCESS') {
        localStorage.setItem('stnumber', phoneNumber);
        setIsLoggedIn(true);
        fetchUserName(phoneNumber);
        getNTEventList();
        setLoading(false);
      } else {
        setError('Phone number not registered.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  const fetchUserName = async (phoneNumber) => {
    const userRef = doc(db, 'STMembers', phoneNumber);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const orbitername = userDoc.data().name;
      const mobileNumber = userDoc.data().phoneNumber;
      setUserName(orbitername);
      setPhoneNumber(mobileNumber);

      // ✅ check role (assumes STMembers doc has "role")
      setIsAdmin(userDoc.data().role === "admin");
    }
  };

  const submitAddFeedback = async () => {
    if (!suggestionText.trim()) return;
    const newSuggestion = {
      taskDescription: suggestionText,
      createdAt: Timestamp.now(),
      createdBy: userName || "Anonymous",
      date: Timestamp.now(),
      eventName: eventDetails?.Eventname || "Common Suggestion",
      status: "Pending",
    };
    try {
      await addDoc(collection(db, "Suggestions"), newSuggestion);
      setSuggestionText("");
      setshowpopup(false);
    } catch (error) {
      console.error("Error adding suggestion:", error);
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("");
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('stnumber');
        window.location.reload();
      }
    });
  };
  const formatEventDate = (date) => {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const sendWhatsAppMessage = async (userName, eventName, eventDate, eventLink, phoneNumber) => {
const ACCESS_TOKEN = 'EAAHwbR1fvgsBOwUInBvR1SGmVLSZCpDZAkn9aZCDJYaT0h5cwyiLyIq7BnKmXAgNs0ZCC8C33UzhGWTlwhUarfbcVoBdkc1bhuxZBXvroCHiXNwZCZBVxXlZBdinVoVnTB7IC1OYS4lhNEQprXm5l0XZAICVYISvkfwTEju6kV4Aqzt4lPpN8D3FD7eIWXDhnA4SG6QZDZD'; // Replace with your Meta API token
    const PHONE_NUMBER_ID = '527476310441806';
  const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;

  const messageData = {
    messaging_product: "whatsapp",
    to: phoneNumber,
    type: "template",
    template: {
      name: "registration_link", // must match approved template name in Meta
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: userName },
            { type: "text", text: eventName },
            { type: "text", text: formatEventDate(eventDate) },
            { type: "text", text: eventLink },
          ],
        },
      ],
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageData),
    });

    const data = await response.json();
    console.log("✅ WhatsApp Message Sent:", data);
  } catch (error) {
    console.error("❌ Error sending WhatsApp message:", error);
  }
};

 // ✅ Handle event creation (Users → STmeet with WhatsApp invite)
const handleCreateEvent = async (e) => {
  e.preventDefault();
  if (!eventName || !eventTime || !zoomLink) {
    alert("Please fill all required fields");
    return;
  }

  try {
    // Save to STmeet
    const stMeetRef = collection(db, "STmeet");
    const uniqueId = doc(stMeetRef).id;
    const eventDocRef = doc(stMeetRef, uniqueId);

    await setDoc(eventDocRef, {
      name: eventName,
      time: Timestamp.fromDate(new Date(eventTime)),
      agenda: agendaPoints,
      zoomLink,
      uniqueId,
      createdBy: phoneNumber,
      invitedMembers: selectedMembers, // array of chosen ST members
      createdAt: Timestamp.now(),
    });

    // Call Meta API to send WhatsApp message
selectedMembers.forEach(async (memberPhone) => {
  await sendWhatsAppMessage(userName, eventName, eventTime, zoomLink, memberPhone);
});


    Swal.fire("✅ Your event has been created & invitations sent");

    // Reset form
    setEventName("");
    setEventTime("");
    setAgendaPoints([""]);
    setZoomLink("");
    setSelectedMembers([]);
    setShowModal(false);

  } catch (err) {
    console.error(err);
    Swal.fire("❌ Error creating event");
  }
};


  if (!isLoggedIn) {
    return (
      <div className='mainContainer signInBox'>
        <div className="signin">
          <div className="loginInput">
            <div className='logoContainer'>
              <img src="/logo.png" alt="Logo" className="logos" />
            </div>
            <p>ST Arena</p>
            <form onSubmit={handleLogin}>
              <ul>
                <li>
                  <input
                    type="text"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </li>
                <li>
                  <button className="login" type="submit">Login</button>
                </li>
              </ul>
            </form>
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="pageContainer">
        <header className='Main m-Header'>
          <section className='container'>
            <div className='innerLogo'>
              <img src="/ujustlogo.png" alt="Logo" className="logo" />
            </div>
            <div className='headerRight'>
              <div className='userName'> <span>{getInitials(userName)}</span> </div>
              {/* <button onClick={handleLogout} className="logoutBtn">Logout</button> */}
            </div>
          </section>
        </header>

        <section className='dashBoardMain'>
          <div className='container pageHeading'>
         <h2 style={{ color: "crimson", fontSize: "20px",  textAlign: "left" }}>
  Strategic Team Meetings
</h2>

            <button onClick={() => setShowModal(true)} className="meetingLink">+ Create Event</button>
          </div>

          {/* Event Creation Modal */}
        {showModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>Create Event</h3>
      <form onSubmit={handleCreateEvent}>
        <input 
          type="text" 
          placeholder="Event Name" 
          value={eventName} 
          onChange={(e) => setEventName(e.target.value)} 
          required 
        />

        <input 
          type="datetime-local" 
          value={eventTime} 
          onChange={(e) => setEventTime(e.target.value)} 
          required 
        />

        <input 
          type="text" 
          placeholder="Zoom Link" 
          value={zoomLink} 
          onChange={(e) => setZoomLink(e.target.value)} 
          required 
        />

        <textarea 
          placeholder="Agenda" 
          value={agendaPoints[0]} 
          onChange={(e) => setAgendaPoints([e.target.value])}
        ></textarea>

      <label>Select ST Members:</label>
<div className="st-members-list">
  {stMembers.map((member) => (
    <div key={member.phone} className="st-member-item">
      <input
        type="checkbox"
        value={member.phone}
        checked={selectedMembers.includes(member.phone)}
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedMembers([...selectedMembers, member.phone]);
          } else {
            setSelectedMembers(
              selectedMembers.filter((num) => num !== member.phone)
            );
          }
        }}
      />
      <span>{member.name} ({member.phone})</span>
    </div>
  ))}
</div>

        <ul className="actionBtns">
          <li><button type="submit" className="m-button">Save</button></li>
          <li>
            <button 
              type="button" 
              onClick={() => setShowModal(false)} 
              className="m-button-2"
            >
              Cancel
            </button>
          </li>
        </ul>
      </form>
    </div>
  </div>
)}

          <div className='container eventList'>
            {eventList ? eventList?.map(doc => (
              <div key={doc.id} className='meetingBox'>
                {doc.momUrl ? <span className='meetingLable2'>Done</span> : <span className='meetingLable'>Current Meeting</span>}
                <div className='meetingDetails'>
                  <h3 className="eventName">{doc ? doc.name : 'Users not found'}</h3>
                </div>
                <div className='meetingBoxFooter'>
                  <div className='viewDetails'>
                    <Link href={`events/${doc.uniqueId}`}>View Details</Link>
                  </div>
                  {
                    doc.momUrl ? (
                      <div className="momLink">
                        <a href={doc.momUrl} target="_blank" rel="noopener noreferrer">
                          <span>MOM</span>
                        </a>
                      </div>
                    ) : (
                      <div className="meetingLink">
                        <a href={doc?.zoomLink} target="_blank" rel="noopener noreferrer">
                          <span>Join Meeting</span>
                        </a>
                      </div>
                    )
                  }
                </div>
              </div>
            )) : <div className='loader'><span className="loader2"></span></div>}
            <HeaderNav />
          </div>
        </section>
      </main>
    </>
  );
};

export default HomePage;
