import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link"
import '../../src/app/styles/user.scss';;

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

  if (!eventDetails) return <p>Loading...</p>;

  return (
  <div className="wordDocContainer">
      <header className="docHeader">
        <h1>{eventDetails.name}</h1>
        <p className="docSubTitle">
          {/* Unique ID: {eventDetails.uniqueId} | Date:{" "} */}
          {eventDetails.time?.seconds
            ? new Date(eventDetails.time.seconds * 1000).toLocaleDateString()
            : "N/A"}
        </p>
        <hr />
      </header>

      {/* <section className="docSection">
        <h2>Agenda</h2>
        <p dangerouslySetInnerHTML={createMarkup(eventDetails.agenda)} />
      </section> */}

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
  );
}
