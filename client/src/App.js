import React, { Component } from "react";
import "./App.css";
import CreatePost from "./CreatePost";
import Posts from "./Posts";

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Posts</h1>
        </header>
        <div>
          <div className="create-post">
            <CreatePost />
          </div>
          <div className="posts">
            <Posts />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
