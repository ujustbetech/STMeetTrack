import React from 'react';
import { useState, useEffect } from 'react';

function UserHeader() {
      const [cpPoints, setCPPoints] = useState(0);
      const [phoneNumber, setPhoneNumber] = useState('');
      const [userName, setUserName] = useState('');

      useEffect(() => {

        const fetchUserName = async (phoneNumber) => {
    console.log("Fetch User from STMember", phoneNumber);
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

  
    fetchCP();
  }, [phoneNumber]);

  const getInitials = (name) => {
    return name
      .split(" ") // Split the name into words
      .map(word => word[0]) // Get the first letter of each word
      .join(""); // Join them together
  };
    return (
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
    );
}

export default UserHeader;