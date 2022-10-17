import React, { Component } from "react";
import { Joystick } from "react-joystick-component";
import Config from "../scripts/config";

class Teleoperation extends Component {
  state = { ros: null };

  constructor() {
    super();
    this.init_connection();
    this.handleMove = this.handleMove.bind(this);
    this.handleStop = this.handleStop.bind(this);
  }

  init_connection() {
    this.state.ros = new window.ROSLIB.Ros();
    console.log(this.state.ros);

    this.state.ros.on("connection", () => {
      console.log("connection established!");
      this.setState({ connected: true });
    });

    this.state.ros.on("close", () => {
      console.log("conenction is closed!");
      this.setState({ connected: false });
      //try to reconnect every 2 seconds
      setTimeout(() => {
        try {
          this.state.ros.connect(
            "ws://" +
              Config.ROSBRIDGE_SERVER_IP +
              ":" +
              Config.ROSBRIDGE_SERVER_PORT
          );
        } catch (error) {
          console.log("Connection Problem");
        }
      }, Config.RECONNECTION_TIMER);
    });

    try {
      this.state.ros.connect(
        "ws://" +
          Config.ROSBRIDGE_SERVER_IP +
          ":" +
          Config.ROSBRIDGE_SERVER_PORT
      );
    } catch (error) {
      console.log("Connection Problem");
    }
  }

  handleMove(event) {
    console.log("handle move");
    //Create a ROS publisher on the topic cmd_vel
    let cmd_vel = new window.ROSLIB.Topic({
      ros: this.state.ros,
      name: Config.CMD_VEL_TOPIC, //This is the name of the topic
      messageType: "geometry_msgs/Twist",
    });
    //Create a twist message to be published to rosbridge
    let twist = new window.ROSLIB.Message({
      linear: {
        x: event.y / 100,
        y: 0,
        z: 0,
      },
      angular: {
        x: 0,
        y: 0,
        z: -event.x / 100,
      },
    });
    //Publish the message on the cmd_vel topic
    cmd_vel.publish(twist);
  }
  handleStop(event) {
    console.log("handle stop");
    //Create a ROS publisher on the topic cmd_vel
    let cmd_vel = new window.ROSLIB.Topic({
      ros: this.state.ros,
      name: Config.CMD_VEL_TOPIC, //This is the name of the topic
      messageType: "geometry_msgs/Twist",
    });
    //Create a twist message to be published to rosbridge
    let twist = new window.ROSLIB.Message({
      linear: {
        x: 0,
        y: 0,
        z: 0,
      },
      angular: {
        x: 0,
        y: 0,
        z: 0,
      },
    });
    //Publish the message on the cmd_vel topic
    cmd_vel.publish(twist);
  }

  render() {
    return (
      <div>
        <Joystick
          size={100}
          baseColor="#EEEEEE"
          stickColor="#BBBBBB"
          move={this.handleMove}
          stop={this.handleStop}
        ></Joystick>
      </div>
    );
  }
}

export default Teleoperation;
