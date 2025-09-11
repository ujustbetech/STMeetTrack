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
const [allMembers, setAllMembers] = useState([]);

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
        // - If createdBy matches you → show your events
        // - If invitedMembers include you → show invited events
        eventList = eventList.filter(event => {
          if (!event.createdBy) return true; 
          if (event.createdBy === storedPhoneNumber) return true; 
          return event.invitedMembers && event.invitedMembers.includes(storedPhoneNumber);
        });

        setEventList(eventList);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };

    setIsLoggedIn(true);
    setLoading(false);
    fetchUserName(storedPhoneNumber);
    getNTEventList();
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
      setAllMembers(membersList);   // store original
      setStMembers(membersList);    // initialize filtered with same list
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

      // Sort by latest date
      eventList.sort((a, b) => b.time.seconds - a.time.seconds);
      setEventList(eventList);
      console.log("Sorted events", eventList);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  try {
    const docRef = doc(db, "STMembers", phoneNumber);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log('✅ Phone number found in NTMembers');

      localStorage.setItem('stnumber', phoneNumber);
      setIsLoggedIn(true);
      fetchUserName(phoneNumber);
      getNTEventList();
      setLoading(false);
    } else {
      setError('You are not a ST Member.');
    }
  } catch (err) {
    console.error('❌ Error checking phone number:', err);
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
const sendWhatsAppMessage = async (userName, eventName, eventDate, zoomLink, eventId, phoneNumber) => {
  const ACCESS_TOKEN = 'EAAHwbR1fvgsBOwUInBvR1SGmVLSZCpDZAkn9aZCDJYaT0h5cwyiLyIq7BnKmXAgNs0ZCC8C33UzhGWTlwhUarfbcVoBdkc1bhuxZBXvroCHiXNwZCZBVxXlZBdinVoVnTB7IC1OYS4lhNEQprXm5l0XZAICVYISvkfwTEju6kV4Aqzt4lPpN8D3FD7eIWXDhnA4SG6QZDZD'; // Replace with your Meta API token
    const PHONE_NUMBER_ID = '527476310441806';    // replace with yours
  const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;

  const messageData = {
    messaging_product: "whatsapp",
    to: phoneNumber,
    type: "template",
    template: {
      name: "mmt_invite", // ✅ must match your template name in Meta
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: userName },               // {{1}} in body
            { type: "text", text: eventName },              // {{2}}
            { type: "text", text: formatEventDate(eventDate) }, // {{3}}
            { type: "text", text: zoomLink },               // {{4}}
          ],
        },
        {
          type: "button",
          sub_type: "url",
          index: "0", // first button
     parameters: [
  { type: "text", text: eventId }, // ✅ only send the ID
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
    console.log("✅ WhatsApp message sent:", data);
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
  uniqueId,  // <-- this is the eventId
  createdBy: phoneNumber,
  invitedMembers: selectedMembers,
  createdAt: Timestamp.now(),
});

for (const memberPhone of selectedMembers) {
  const member = stMembers.find((m) => m.phone === memberPhone);
  const memberName = member?.name || "Member"; 

  await sendWhatsAppMessage(
    memberName,
    eventName,
    eventTime,
    zoomLink,
    uniqueId,
    memberPhone
  );
}


 


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
             <div className='sectionHeading'>
                    <h2 style={{ color: "white", fontSize: "20px",  textAlign: "left" }}>  Strategic Team Meetings</h2> 
  
  <button onClick={() => setshowpopup(true)} className="addsuggestion">
  Add Suggestion
</button>

{showpopup && (
  <div
    className="modal-overlay"
    onClick={() => setshowpopup(false)} // close when clicking outside
  >
    <div
      className="modal-content"
      onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
    >
      <h3>Add Suggestion</h3>

      <textarea
        rows={4}
        value={suggestionText}
        placeholder="Write your comment..."
        onChange={(e) => setSuggestionText(e.target.value)}
      />

      <ul className="actionBtns">
        <li>
          <button onClick={submitAddFeedback} className="m-button">
            Submit
          </button>
        </li>
        <li>
          <button
            onClick={() => setshowpopup(false)}
            className="m-button-2"
          >
            Cancel
          </button>
        </li>
      </ul>
    </div>
  </div>
)}

</div>
<button onClick={() => setShowModal(true)}  className="Btn">
  
  <div className="sign">+</div>
  
  <div className="text">Create</div>
</button>

           </div>

          {/* Event Creation Modal */}
{showModal && (
  <div 
    className="modal-overlay"
    onClick={() => setShowModal(false)} // ✅ close on clicking outside
  >
    <div 
      className="modal-content"
      onClick={(e) => e.stopPropagation()} // ✅ prevent closing when clicking inside
    >
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

        {/* Agenda Section */}
        <label>Agenda Points:</label>
        {agendaPoints.map((point, i) => (
          <div key={i} className="agenda-item">
            <input
              type="text"
              value={point}
              onChange={(e) => {
                const updated = [...agendaPoints];
                updated[i] = e.target.value;
                setAgendaPoints(updated);
              }}
              placeholder={`Agenda ${i + 1}`}
            />
            <button type="button" onClick={() => {
              setAgendaPoints(agendaPoints.filter((_, idx) => idx !== i));
            }}>✕</button>
          </div>
        ))}
        <button type="button" onClick={() => setAgendaPoints([...agendaPoints, ""])} className="add-agenda-btn">
          ➕ Add Agenda
        </button>

        {/* Members Section */}
        <label>Select ST Members:</label>
   <input
  type="text"
  className="member-search"
  placeholder="Search member..."
  onChange={(e) => {
    const search = e.target.value.toLowerCase();
    setStMembers(
      allMembers.filter((m) =>
        m.name.toLowerCase().includes(search) ||
        m.phone.includes(search)
      )
    );
  }}
/>


        <div className="selected-members">
          {selectedMembers.map((phone) => {
            const member = stMembers.find((m) => m.phone === phone);
            return (
              <span key={phone} className="tag">
                {member?.name} ({phone})
                <button type="button" onClick={() => setSelectedMembers(selectedMembers.filter((p) => p !== phone))}>✕</button>
              </span>
            );
          })}
        </div>

        <div className="member-dropdown">
          {stMembers.filter((m) => !selectedMembers.includes(m.phone)).map((member) => (
            <div key={member.phone} className="dropdown-item"
              onClick={() => setSelectedMembers([...selectedMembers, member.phone])}>
              {member.name} ({member.phone})
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



         <div className="container eventList">
  {eventList ? (
    eventList.map((doc) => (
      <div
        key={doc.id}
        className="meetingBox"
        onClick={() => window.location.href = `/events/${doc.uniqueId}`}
      >
        {doc.momUrl ? (
          <span className="meetingLable2">Done</span>
        ) : (
          <span className="meetingLable">Upcoming Meeting</span>
        )}
        <div className="meetingDetails">
          <h3 className="eventName">{doc ? doc.name : "Users not found"}</h3>
        </div>
        <div className="meetingBoxFooter">
          <div className="viewDetails">
            <Link
              href={`events/${doc.uniqueId}`}
              onClick={(e) => e.stopPropagation()} // ✅ prevents double navigation
            >
              View Details
            </Link>
          </div>
          {doc.momUrl ? (
            <div className="momLink">
              <a
                href={doc.momUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()} // ✅ only open MOM
              >
                <span>MOM</span>
              </a>
            </div>
          ) : (
            <div className="meetingLink">
              <a
                href={doc?.zoomLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()} // ✅ only open Zoom
              >
                <span>Join Meeting</span>
              </a>
            </div>
          )}
        </div>
      </div>
    ))
  ) : (
    <div className="loader">
      <span className="loader2"></span>
    </div>
  )}
  <HeaderNav />
</div>

        </section>
      </main>
    </>
  );
};

export default HomePage;
