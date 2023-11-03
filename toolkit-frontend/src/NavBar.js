import React from "react";
import "./NavBar.css";
import { NavLink } from "react-router-dom";
import { Navbar, Nav, NavItem } from "reactstrap";

function NavBar({error, user}) {
  let erMsg;
  if(error) erMsg = (<h1 style={{color:"orange"}}>{error}</h1>)

  //change the active links if the user is logged in
  let navBar = (
    <Nav className="ml-auto" navbar>
          <NavItem>
            <NavLink to="/login">Login</NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/signup">Sign Up</NavLink>
          </NavItem>
    </Nav>
  )
  if(user.token)
    navBar = (
      <Nav className="ml-auto" navbar>
      <NavItem>
            <NavLink to="/logout">Logout</NavLink>
      </NavItem>
    </Nav>)

    //logout function
  return (
    <div>
      <Navbar expand="md">
        <NavLink exact to="/" className="navbar-brand">
          DM's Toolkit
        </NavLink>

        {navBar}
      </Navbar>
      {erMsg}
    </div>
  );
}

export default NavBar;
