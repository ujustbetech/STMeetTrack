import React from 'react';
import { AiOutlineHome } from "react-icons/ai";
import { MdEventAvailable, MdOutlineKeyboardArrowDown } from "react-icons/md";
import { RiListSettingsLine } from "react-icons/ri";
import { FaRegUser } from "react-icons/fa";
import Link from 'next/link';
import { MdChecklist } from "react-icons/md";
import { useRouter } from "next/router";
import { BsCashCoin } from "react-icons/bs";
import { FaFileUpload } from "react-icons/fa";

const Navbar = (props) => {
    const router = useRouter();
    
    return (
        <>
            {props.loading ? (  // Check if loading prop is true
               <div className='loader'> <span className="loader2"></span> </div>
            ) : (
                <nav className={props.expand ? 'm-navbar expand' : 'm-navbar unexpand'}>
                    <ul>
                        {/*  Event */}
                        <li>
                            <Link href="/admin/event/addEvent">
                                <span className="icons"><MdEventAvailable /></span>
                                <span className="linklabel">Event</span>
                                <span className="submenuIcon"><MdOutlineKeyboardArrowDown /></span>
                            </Link>
                            <ul>
                                <li><Link href="/admin/event/addEvent">Add Event</Link></li>
                                <li><Link href="/admin/event/manageEvent">Manage Event</Link></li>
                            </ul>
                        </li>
                        

                        {/* Users */}
                        <li>
                            <Link href="/admin/event/userlist">
                                <span className="icons"><FaRegUser /></span>
                                <span className="linklabel">ST Members</span>
                                <span className="submenuIcon"><MdOutlineKeyboardArrowDown /></span>
                            </Link>
                           
                        </li>
     <li>
                            <Link href="/admin/Suggestion">
                                <span className="icons"><MdEventAvailable /></span>
                                <span className="linklabel">List</span>
                                <span className="submenuIcon"><MdOutlineKeyboardArrowDown /></span>
                            </Link>
                            <ul>
                                  <li><Link href="/admin/Suggestion">Suggestion List</Link></li>
                                <li><Link href="/admin/suggestionpage">Add Suggestion</Link></li>
                                <li><Link href="/admin/existingsuggestion">Assign Suggestion</Link></li>
                            </ul>
                        </li>
                        
                       
                       
                        <li>
                            <Link href="/admin/event/upload">
                                <span className="icons"><FaFileUpload /></span>
                                <span className="linklabel">Upload Excel</span>
                            </Link>
                        </li>
                    </ul>
                </nav>
            )}
        </>
    );
}

export default Navbar;
