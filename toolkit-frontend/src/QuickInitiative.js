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
import ToolkitApi from "./api";
import "./List.css";

/**QuickInitiative - shows list of creatures, RETs, or encounters with filter capabilities */

function QuickInitiative({user}) {
  const [list, setList] = useState(["no"]);
  //useEffect(()=>{
  //   async function getList(){
  //     await setList(await ToolkitApi.getList(base));
  //   }
  //   getList();
  // }, [base]);
  return (<h1>This is the placeholder page for qiuckInitative</h1>);

  // async function onSubmit(e){
  //   e.preventDefault();
  //   let filter = e.target[0].value
  //   if(filter === "") await setList(await ToolkitApi.getList(base));
  //   else if (base === "jobs")
  //     await setList(await ToolkitApi.getList(base, {title:filter}));
  //   else if (base === "companies")
  //     await setList(await ToolkitApi.getList(base, {name:filter}));
  // }
  // console.log(user.token);
  // //ensures the user is logged in
  // if(!user.token) {
  //   return (<h1 style={{color:"orange"}}>Login to view</h1>)
  // }

  // return (
  //   <section className="col-md-4">
  //     <form onSubmit={onSubmit}>
  //         <label htmlFor="search">Search</label>
  //         <input type="text" name="search"></input><br/>
  //         <button>Filter</button>
  //     </form>
  //     <Card>
  //       <CardBody>
  //         <CardTitle className="font-weight-bold text-center">
  //           {base}
  //         </CardTitle>
  //         <ListGroup>
  //           {list.map((item) => {
  //             if(item.handle)
  //             return (
  //               <Link to={`/companies/${item.handle}`} key={item.handle}>
  //                   <ListGroupItem>{item.name}</ListGroupItem>
  //               </Link>
  //           )
  //           else return (
  //             <Link to={`jobs/${item.id}`} key={item.id}>
  //                 <ListGroupItem>{item.title}</ListGroupItem>
  //             </Link>
  //           )
  //           })}
  //         </ListGroup>
  //       </CardBody>
  //     </Card>
  //   </section>
  // );
}

export default QuickInitiative;
