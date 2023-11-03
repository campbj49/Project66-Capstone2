import { render, fireEvent } from "@testing-library/react";
import LoginForm from "./LoginForm";
const [user, setUser] = useState({});
const [error, setError] = useState();

//smoke test to make sure it renders in the first place from smoke test example
it("renders without crashing", function() {
  render(<LoginForm setError={setError}
    setUser={setUser}
    user = {user}
  />);
});

// snapshot test from snapshot example
it("matches snapshot", function() {
  const {asFragment} = render(<LoginForm setError={setError}
    setUser={setUser}
    user = {user}
  />);
  expect(asFragment()).toMatchSnapshot();
});