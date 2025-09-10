import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import '../../src/app/styles/user.scss';

export default function MOMPage() {
  const router = useRouter();
  const { eventId } = router.query;
  const [eventDetails, setEventDetails] = useState(null);

  useEffect(() => {
    if (!eventId) return;
    const fetchEvent = async () => {
      const eventRef = doc(db, "STmeet", eventId);
      const snapshot = await getDoc(eventRef);
      if (snapshot.exists()) {
        setEventDetails(snapshot.data());
      }
    };
    fetchEvent();
  }, [eventId]);

  if (!eventDetails) return     <div className="loader-container">
        <svg className="load" viewBox="25 25 50 50">
          <circle r="20" cy="50" cx="50"></circle>
        </svg>
      </div>;

  // 📌 Current page URL for sharing
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  // 📌 Share on WhatsApp
  const shareOnWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      `Check out the MOM: ${currentUrl}`
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <>
      <main className="pageContainer">
        <header className="Main m-Header">
          <section className="container">
            <div className="innerLogo">
              <img src="/ujustlogo.png" alt="Logo" className="logo" />
            </div>
            <div className="headerRight">
              {/* Back Button */}
          

<button onClick={shareOnWhatsApp} className="shareBtn">
  <svg height="512" viewBox="0 0 512 512" width="512" xmlns="http://www.w3.org/2000/svg"><title></title><path d="M384,336a63.78,63.78,0,0,0-46.12,19.7l-148-83.27a63.85,63.85,0,0,0,0-32.86l148-83.27a63.8,63.8,0,1,0-15.73-27.87l-148,83.27a64,64,0,1,0,0,88.6l148,83.27A64,64,0,1,0,384,336Z"></path></svg>
  <h2 className="labels">Share</h2>
</button>
              
            </div>
          </section>
        </header>

        <div className="wordDocContainer">
          <header className="docHeader">
                  <button onClick={() => router.back()} className="backbtn">
  <svg height="16" width="16" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1024 1024"><path d="M874.690416 495.52477c0 11.2973-9.168824 20.466124-20.466124 20.466124l-604.773963 0 188.083679 188.083679c7.992021 7.992021 7.992021 20.947078 0 28.939099-4.001127 3.990894-9.240455 5.996574-14.46955 5.996574-5.239328 0-10.478655-1.995447-14.479783-5.996574l-223.00912-223.00912c-3.837398-3.837398-5.996574-9.046027-5.996574-14.46955 0-5.433756 2.159176-10.632151 5.996574-14.46955l223.019353-223.029586c7.992021-7.992021 20.957311-7.992021 28.949332 0 7.992021 8.002254 7.992021 20.957311 0 28.949332l-188.073446 188.073446 604.753497 0C865.521592 475.058646 874.690416 484.217237 874.690416 495.52477z"></path></svg>
  <span>Back</span>
</button>
            <h1>{eventDetails.name}</h1>
            <p className="docSubTitle">
              {eventDetails.time?.seconds
                ? new Date(eventDetails.time.seconds * 1000).toLocaleDateString()
                : "N/A"}
            </p>
            <hr />
          </header>

          <section className="docSection">
            <h2>Minutes of Meeting</h2>
      
               
            {eventDetails.momEntries?.length > 0 ? (
              <div className="momEntries">
                {eventDetails.momEntries.map((entry, idx) => (
                  <div key={idx} className="momEntryDoc">
                    <div
                      className="momContentDoc"
                      dangerouslySetInnerHTML={{ __html: entry.text }}
                    />
                    <p className="momMetaDoc">
                      — Added by {entry.addedBy} on{" "}
                      {entry.createdAt?.toDate
                        ? entry.createdAt.toDate().toLocaleString()
                        : ""}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No MOM entries available.</p>
            )}
          </section>

          <footer className="docFooter">
            <p>Generated from NT Arena</p>
          </footer>
        </div>
      </main>
    </>
  );
}
