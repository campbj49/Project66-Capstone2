//modified Home.js provided in the Snack or Booze project
import React, {useEffect, useState} from "react";
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import { Card, CardBody, CardTitle, ListGroup, ListGroupItem } from "reactstrap";

function Home({token}) {
  console.log(token);
  let welcomeMessage = "Access Pages";
  let linkList = (
    <ListGroup>
      <Link to="/list/encounter">
        <ListGroupItem>
          Encounters
        </ListGroupItem>
      </Link>
      <Link to="/list/creatures">
        <ListGroupItem>
          Creatures
        </ListGroupItem>
      </Link>
      <Link to="/list/rets">
        <ListGroupItem>
          Random Encounter Tables
        </ListGroupItem>
      </Link>
      <Link to="/quickInitiative">
        <ListGroupItem>
          Quick Initiative
        </ListGroupItem>
      </Link>
    </ListGroup>
  );

  console.log(token);
  if(token === "undefined" || token===undefined) {
    welcomeMessage= "Welcome DM's Toolkit";
    linkList = "";
  }
  return (
    <section className="col-md-8">
      <Card>
        <CardBody className="text-center">
          <CardTitle>
            <h3 className="font-weight-bold">
              {welcomeMessage}
            </h3>
          </CardTitle>
          {linkList}
        </CardBody>
      </Card>
    </section>
  );
}

export default Home;
