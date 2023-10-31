//modified Companies.js provided in the Snack or Booze project
import React, {useEffect, useState} from "react";
import { Redirect, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  CardTitle,
  ListGroup,
  ListGroupItem
} from "reactstrap";
import JoblyApi from "./api";
import "./List.css";

/**List - shows list of either jobs or companies with filter capabilities */

function List({token}) {
  const [list, setList] = useState(["no"]);
  const { base } = useParams();
  useEffect(()=>{
    async function getList(){
      await setList(await JoblyApi.getList(base));
    }
    getList();
  }, [base]);

  async function onSubmit(e){
    e.preventDefault();
    let filter = e.target[0].value
    if(filter === "") await setList(await JoblyApi.getList(base));
    else if (base === "jobs")
      await setList(await JoblyApi.getList(base, {title:filter}));
    else if (base === "companies")
      await setList(await JoblyApi.getList(base, {name:filter}));
  }
  console.log(token);
  //ensures the user is logged in
  if(!token) {
    return (<h1 style={{color:"orange"}}>Login to view</h1>)
  }

  return (
    <section className="col-md-4">
      <form onSubmit={onSubmit}>
          <label htmlFor="search">Search</label>
          <input type="text" name="search"></input><br/>
          <button>Filter</button>
      </form>
      <Card>
        <CardBody>
          <CardTitle className="font-weight-bold text-center">
            {base}
          </CardTitle>
          <ListGroup>
            {list.map((item) => {
              if(item.handle)
              return (
                <Link to={`/companies/${item.handle}`} key={item.handle}>
                    <ListGroupItem>{item.name}</ListGroupItem>
                </Link>
            )
            else return (
              <Link to={`jobs/${item.id}`} key={item.id}>
                  <ListGroupItem>{item.title}</ListGroupItem>
              </Link>
            )
            })}
          </ListGroup>
        </CardBody>
      </Card>
    </section>
  );
}

export default List;
