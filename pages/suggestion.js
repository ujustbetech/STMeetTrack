import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { db } from "../firebaseConfig";
import { format } from "date-fns";
import '/pages/events/event.scss'; // Ensure your CSS file is correctly linked
import Layout from '../component/Layout';
import { collection, getDocs, query, where, doc, updateDoc, getDoc } from "firebase/firestore";
import { FaSearch } from "react-icons/fa";
import HeaderNav from "../component/HeaderNav";

const FeedbackList = () => {
  const router = useRouter();
  const [feedbackList, setFeedbackList] = useState([]);
  const [singleFeedback, setsingleFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);
  const [userName, setUserName] = useState('');
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [showpopup, setshowpopup] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(""); // Default empty filter
  const [searchTerm, setSearchTerm] = useState('');

 
  const filterTab = ["All",   "Acknowledged",
    "Accepted",
    "Declined",
    "UJustBe Queue",
    "NT Queue",
    "Approved","Pending"];

  const handleDetails = (index) => {
    // console.log("sigle event ", index);
    setshowpopup(true)
    setsingleFeedback(index);
  };

  const handleclose = () => {
    setshowpopup(false);
  };

  const handleClick = (index, filter) => {
    setActiveIndex(index);
    setSelectedFilter(filter);
  };
const fetchFeedback = async () => {
  setLoading(true);
  try {
    const suggestionCollection = collection(db, "Suggestions");
    const suggestionSnapshot = await getDocs(suggestionCollection);

    const allFeedback = [];

    suggestionSnapshot.forEach((doc) => {
      const data = doc.data();

      const formattedDate = data?.createdAt?.toDate
        ? data.createdAt.toDate().toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A";

      allFeedback.push({
        id: doc.id,
        eventId: data.eventId || "N/A",
        eventName: data.eventName || "Unknown Event",
        eventTime: data.date?.toDate().toLocaleTimeString() || "Unknown Time",
        userName: data.createdBy || "Unknown User",
        suggestion: data.taskDescription || "No suggestion",
        predefined: "N/A", // not applicable in this structure
        date: formattedDate,
        status: data.status || "Pending",
      });
    });

    setFeedbackList(allFeedback);
    setFilteredFeedback(allFeedback); // Optionally filter based on search
  } catch (error) {
    console.error("Error fetching suggestions:", error);
  } finally {
    setLoading(false);
  }
};

   useEffect(() => {
     fetchFeedback();
   }, []);
 
   useEffect(() => {
    let updatedList = feedbackList;
  
    if (selectedFilter && selectedFilter !== "All") {
      updatedList = updatedList.filter(
        (item) => item.predefined === selectedFilter
      );
    }
  
    if (searchTerm.trim() !== "") {
      updatedList = updatedList.filter((item) => {
        const lowerSearch = searchTerm.toLowerCase();
        return (
          item.eventName.toLowerCase().includes(lowerSearch) ||
          item.suggestion.toLowerCase().includes(lowerSearch) ||
          item.userName.toLowerCase().includes(lowerSearch)
        );
      });
    }
  
    setFilteredFeedback(updatedList);
  }, [selectedFilter, searchTerm, feedbackList]);
  
  const updateStatus = async (feedbackId, eventId, userDocId) => {
    try {
      const userRef = doc(db, `STmeet/${eventId}/registeredUsers`, userDocId);
      const userSnapshot = await getDocs(collection(userRef, "feedback"));

      userSnapshot.docs.forEach(async (feedbackDoc) => {
        await updateDoc(feedbackDoc.ref, { status: "Discussed" });
      });

      setFeedbackList((prevList) =>
        prevList.map((feedback) =>
          feedback.id === feedbackId ? { ...feedback, status: "Discussed" } : feedback
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
 

  const getInitials = (name) => {
    return name
      .split(" ") // Split the name into words
      .map(word => word[0]) // Get the first letter of each word
      .join(""); // Join them together
  };


  const fetchUserName = async (phoneNumber) => {
    console.log("Fetch User from NTMember", phoneNumber);
    const userRef = doc(db, 'STMembers', phoneNumber);
    const userDoc = await getDoc(userRef);

    console.log("Check Details", userDoc.data());

    if (userDoc.exists()) {
      const orbitername = userDoc.data().name; // Access the Name field with the space
      const mobileNumber = userDoc.data().phoneNumber; // Access the Name field with the space
      setUserName(orbitername);
      // setPhoneNumber(mobileNumber);
      // registerUserForEvent(phoneNumber, orbitername);
    }

    else {
      console.log("user not found");

      // setError('User not found.');
    }
  };


  useEffect(() => {
    const storedPhoneNumber = localStorage.getItem('stnumber');
    fetchUserName(storedPhoneNumber);
    // setPhoneNumber(storedPhoneNumber)
    fetchFeedback();
  }, []);
  
  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return "N/A";
    return new Date(timestamp.seconds * 1000).toLocaleString("en-US", {
      timeZone: "Asia/Kolkata", // Adjust for your timezone
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };
  
  const highlightMatch = (text, query) => {
    if (!query) return text;
  
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
  
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index}>{part}</mark>
      ) : (
        part
      )
    );
  };
  
  return (

    <>
      <main className="pageContainer">
        <header className='Main m-Header'>
          <section className='container'>
            <div className='innerLogo' onClick={() => router.push('/')}>
              <img src="/ujustlogo.png" alt="Logo" className="logo" />
            </div>
            <div>
              <div className='userName'> {userName || 'User'} <span>{getInitials(userName)}</span> </div>
            </div>
          </section>
        </header>
        <section className='dashBoardMain'>
          <div className='container pageHeading'>
            <h1>Suggestion / Feedback</h1>
            {/* <p>Lets Create Brand Ambasaddor through Contribution</p> */}
          </div>
          <div className="searchbox">
  <input
    type="text"
    className="searchTermbox"
    placeholder="Search anything..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
  <button type="button" className="searchButtonbox">
    <FaSearch />
  </button>
  {searchTerm && (
    <button className="clearButton" onClick={() => setSearchTerm("")}>×</button>
  )}
</div>



          <div className='container filterTab'>
            <h4>Filter</h4>
            <ul>
              {filterTab.map((item, index) => (
                <li
                  key={index}
                  className={`navItem ${activeIndex === index ? "active" : ''}`}
                  onClick={() => handleClick(index, item)}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {loading ? (
            <div className='loader'><span className="loader2"></span></div>
          ) : (
            <div className='container suggestionList'>
              {filteredFeedback.map((feedback, index) => (
            <div key={index} className='suggestionBox'>
  <div className="suggestionDetails">
    {
      feedback.status === "Declined"
        ? <span className='meetingLable3'>{feedback.status}</span>
        : <span className='meetingLable'>{feedback.status}</span>
    }
    <span className='suggestionTime'>{feedback.date}</span>
  </div>

                  <div className="boxHeading">
                    <span>{feedback.userName.charAt(0)}</span>
                    <div className="suggestions">
                    <h4>{highlightMatch(feedback.eventName, searchTerm)}</h4>
<p>{highlightMatch(feedback.suggestion, searchTerm)}</p>

                    </div>
                  </div>
                  <div className="viewPlus" onClick={() => handleDetails(feedback)}> View Details + </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
   <HeaderNav/>
      {
        showpopup ? <section className="PopupMain">
          <div className="popupBox">
            {/* <h2>Suggestion</h2> */}
            {
              <>
                <div>
                  <span className='meetingLable'>{singleFeedback.status}</span>
                </div>
                <div>
                  <h4>Event name</h4>
                  {singleFeedback.eventName}

                </div>
                {/* <div>
                  <h4>Event Date</h4>
                  <p>{formatDate(singleFeedback.eventTime)}</p>
                </div> */}
                <div>
                  <h4>User Name</h4>
                  {singleFeedback.userName}
                </div>
                <div>
                  <h4>Event ID</h4>
                  {singleFeedback.eventId}
                </div>
                <div>
                  <h4>Event Feedback</h4>
                  {singleFeedback.suggestion}
                </div>
              </>
            }
            <button className="closeBtn" onClick={() => handleclose()}>
              X
            </button>
          </div>
        </section> : null
      }
    </>

  );
};

export default FeedbackList;
