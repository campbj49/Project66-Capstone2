//modified Home.js provided in the Snack or Booze project
import React, {useEffect, useState} from "react";
import { Card, CardBody, CardTitle } from "reactstrap";

function Home({token}) {
  console.log(token);
  let welcomeMessage = "You now have access to all pages";
  console.log(token);
  if(token === "undefined" || token===undefined) 
    welcomeMessage= "Welcome DM's Toolkit";
  return (
    <section className="col-md-8">
      <Card>
        <CardBody className="text-center">
          <CardTitle>
            <h3 className="font-weight-bold">
              {welcomeMessage}
            </h3>
          </CardTitle>
        </CardBody>
      </Card>
    </section>
  );
}

export default Home;
