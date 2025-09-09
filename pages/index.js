import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import * as React from 'react';
import { db } from '../firebaseConfig';
import Link from 'next/link'
import '../src/app/styles/user.scss';
import { doc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import axios from 'axios';
import HeaderNav from '../component/HeaderNav';
import UserHeader from '../component/userHeader';
import Swal from 'sweetalert2';

const HomePage = () => {
  const router = useRouter();
  const { id } = router.query; // Get event name from URL
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
  const [showModal, setShowModal] = useState(false); // State to show/hide modal
  const [member, setMember] = useState([]); // Store fetched members
  const [monthlyMetCount, setMonthlyMetCount] = useState(0);
  const [ntMeetCount, setNtMeetCount] = useState(0);
  const [suggestionCount, setSuggestionCount] = useState(0);
  const [pendingSuggestionCount, setPendingSuggestionCount] = useState(0);
  const [upcomingMonthlyMeet, setUpcomingMonthlyMeet] = useState(null);
  const [upcomingNTMeet, setUpcomingNTMeet] = useState(null);

 useEffect(() => {
  const fetchUpcomingEvents = async () => {
    try {
      const now = new Date();

      // ✅ Fetch only STmeet events
      const ntMeetSnapshot = await getDocs(collection(db, "STmeet"));
      let ntMeetEvents = ntMeetSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        time: doc.data().time?.toDate?.() || new Date(0)
      }));

      // ✅ Apply filter
      ntMeetEvents = ntMeetEvents.filter(event =>
        (!event.createdBy) || // admin created
        (event.invitedMembers && event.invitedMembers.includes(phoneNumber)) // user-created but invited
      );

      // ✅ Keep only upcoming events
      const futureNTEvents = ntMeetEvents.filter(e => e.time > now);
      futureNTEvents.sort((a, b) => a.time - b.time);

      setUpcomingNTMeet(futureNTEvents[0] || null); // show only next upcoming
    } catch (error) {
      console.error("Error fetching upcoming STmeet events:", error);
    }
  };

  if (phoneNumber) {
    fetchUpcomingEvents();
  }
}, [phoneNumber]);

  function formatTimeLeft(ms) {
    if (ms <= 0) return "Meeting Ended";

    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  }


  useEffect(() => {
    const fetchDashboardCounts = async () => {
      if (!phoneNumber) return;

      try {
        // 1. NTMeet Count
        const ntMeetSnapshot = await getDocs(collection(db, "STmeet"));
        setNtMeetCount(ntMeetSnapshot.size);

        // 2. Monthly Met Count
        const monthlyMetSnapshot = await getDocs(collection(db, "MonthlyMeeting"));
        setMonthlyMetCount(monthlyMetSnapshot.size);

        // 3. Suggestions
        const suggestionSnapshot = await getDocs(collection(db, "Suggestions"));
        setSuggestionCount(suggestionSnapshot.size);

        // 4. Pending Suggestions
        let pending = 0;
        suggestionSnapshot.forEach(doc => {
          if (doc.data().status === "Pending") pending++;
        });
        setPendingSuggestionCount(pending);
      } catch (error) {
        console.error("Error fetching dashboard counts:", error);
      }
    };

    fetchDashboardCounts();
  }, [phoneNumber]);
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
      window.location.reload(); // or navigate to login
    }
  });
};

  useEffect(() => {
    const storedPhoneNumber = localStorage.getItem("stnumber");
    setPhoneNumber(storedPhoneNumber);

    if (storedPhoneNumber) {
      const getNTEventList = async () => {
        try {
          const eventCollection = collection(db, "STmeet");
          const eventSnapshot = await getDocs(eventCollection);
          const eventList = eventSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Sort events by latest date (descending order)
          eventList.sort((a, b) => b.time.seconds - a.time.seconds);

          setEventList(eventList);
          console.log("Sorted events", eventList);
        } catch (err) {
          console.error("Error fetching team members:", err);
        }
      };
      setIsLoggedIn(true);
      setLoading(false);
      fetchUserName(storedPhoneNumber);
      getNTEventList()

    }
  }, []); // Empty dependency array to run only on mount


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
    console.log("Fetch User from NTMember", phoneNumber);
    const userRef = doc(db, 'STMembers', phoneNumber);
    const userDoc = await getDoc(userRef);

    console.log("Check Details", userDoc.data());

    if (userDoc.exists()) {
      const orbitername = userDoc.data().name;
      const mobileNumber = userDoc.data().phoneNumber;
      setUserName(orbitername);
      setPhoneNumber(mobileNumber);

    }

    else {
      console.log("user not found");

      // setError('User not found.');
    }
  };

  // useEffect(() => {
  //   if (isLoggedIn || error) {
  //     setLoading(false);
  //   }
  // }, [isLoggedIn, error]);





  if (!isLoggedIn) {
    return (
      <div className='mainContainer signInBox'>
        {/* <div className='logosContainer'>
          <img src="/ujustlogo.png" alt="Logo" className="logo" />
        </div> */}
        <div className="signin">
          <div className="loginInput">
            <div className='logoContainer'>
              <img src="/logo.png" alt="Logo" className="logos" />

            </div>
            <p>Strategic Meeting</p>
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



  // if (loading) {
  //   return (
  //     <div className="loader-container">
  //       <svg className="load" viewBox="25 25 50 50">
  //         <circle r="20" cy="50" cx="50"></circle>
  //       </svg>
  //     </div>
  //   );
  // }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }


  const getInitials = (name) => {
    return name
      .split(" ") // Split the name into words
      .map(word => word[0]) // Get the first letter of each word
      .join(""); // Join them together
  };



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
            </div>




          </section>
        </header>
        <section className='dashBoardMain'>
          <div className='container pageHeading'>
            <h1 style={{ color: "white", fontSize: "24px",  textAlign: "left" }}>Hi {userName || 'User'}</h1>
            {/* <p>Let's Create Brand Ambassador through Contribution</p> */}
          </div>


          <section className="project-summary">
            <Link href="/NTmeetdetails">
              <div className="summary-card in-progress" style={{ cursor: 'pointer' }}>
                <p className="count">{ntMeetCount}</p>
                <p className="label">ST Meetings</p>
              </div>
            </Link>
       
            <Link href="/SuggestionList">
              <div className="summary-card on-hold" style={{ cursor: 'pointer' }}>
                <p className="count">{suggestionCount}</p>
                <p className="label">Suggestions</p>
              </div>
            </Link>
            {/* <Link href="/SuggestionList">
              <div className="summary-card completed" style={{ cursor: 'pointer' }}>
                <p className="count">{pendingSuggestionCount}</p>
                <p className="label">Pending Suggestions</p>
              </div>
            </Link> */}
          </section>


     <section className="upcoming-events">
  <h1 style={{ color: "white", fontSize: "24px", textAlign: "left" }}>Upcoming Events</h1>

  {upcomingNTMeet && (
    <div className="meetingBox">
      <div className="suggestionDetails">
        {(() => {
          const now = new Date();
          const eventDate = upcomingNTMeet.time;
          const timeLeftMs = eventDate - now;
          const timeLeft = timeLeftMs <= 0 ? 'Meeting Ended' : formatTimeLeft(timeLeftMs);
          return timeLeft === 'Meeting Ended' ? (
            <span className="meetingLable2">Meeting Done</span>
          ) : (
            <span className="meetingLable3">{timeLeft}</span>
          );
        })()}
        <span className="suggestionTime">
          {upcomingNTMeet.time.toLocaleString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }).replace(',', ' at')}
        </span>
      </div>

      <div className="meetingDetailsBox">
        <h3 className="eventName">{upcomingNTMeet.name || 'N/A'}</h3>
      </div>

      <div className="meetingBoxFooter">
        <div className="viewDetails">
          <Link href={`/events/${upcomingNTMeet.id}`}>View Details</Link>
        </div>

        {(() => {
          const now = new Date();
          const eventDate = upcomingNTMeet.time;
          const isWithinOneHour = eventDate > now && (eventDate - now <= 60 * 60 * 1000);
          return isWithinOneHour && upcomingNTMeet.zoomLink ? (
            <div className="meetingLink">
              <a href={upcomingNTMeet.zoomLink} target="_blank" rel="noopener noreferrer">
                <span>Join Meeting</span>
              </a>
            </div>
          ) : null;
        })()}
      </div>
    </div>
  )}
</section>





          <div>
            {loading ? (
              <div className="loader">
                <span className="loader2"></span>
              </div>
            ) : <HeaderNav />}
          </div>





        </section>
      </main>

    </>
  );

};

export default HomePage;
