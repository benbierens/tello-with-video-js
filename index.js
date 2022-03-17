/*
 * Created on Tue 3/24/2020
 *
 * Copyright (c) 2020 - DroneBlocks, LLC
 * Author: Dennis Baldwin
 * URL: https://github.com/dbaldwin/tello-video-nodejs-websockets
 *
 * PLEASE REVIEW THE README FILE FIRST
 * YOU MUST POWER UP AND CONNECT TO TELLO BEFORE RUNNING THIS SCRIPT
 */

const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');
const spawn = require('child_process').spawn;
const dgram = require('dgram');

const HTTP_PORT = 3000;
const STREAM_PORT = 3001

const TELLO_IP = '192.168.10.1'
const TELLO_PORT = 8889

function startRecording() {
  var args = [
    "-i", "udp://0.0.0.0:11111",
    "-r", "30",
    "-s", "960x720",
    "-codec:v", "mpeg1video",
    "-b", "800k",
    "-f", "mpegts",
    "-y", 
    "-c:v", "libx264", 
    "recording.avi"
  ];

  spawn('ffmpeg', args);
}

function startStreaming() {
  var args = [
    "-i", "udp://0.0.0.0:11111",
    "-r", "30",
    "-s", "960x720",
    "-codec:v", "mpeg1video",
    "-b", "800k",
    "-f", "mpegts",
    "http://127.0.0.1:3001/stream"
  ];

  var streamer = spawn('ffmpeg', args);

  streamer.on("exit", function(code){
      console.log("Failure", code);
  });
}

function startHttpServer() {
  server = http.createServer(function(request, response) {
    console.log(
      'HTTP Connection on ' + HTTP_PORT + ' from: ' + 
      request.socket.remoteAddress + ':' +
      request.socket.remotePort
    );

    fs.readFile(__dirname + '/www/' + request.url, function (err,data) {
      if (err) {
        response.writeHead(404);
        response.end(JSON.stringify(err));
        return;
      }
      response.writeHead(200);
      response.end(data);
    });

  }).listen(HTTP_PORT);
}

function startStreamServer() {
  const streamServer = http.createServer(function(request, response) {
    console.log(
      'Stream Connection on ' + STREAM_PORT + ' from: ' + 
      request.socket.remoteAddress + ':' +
      request.socket.remotePort
    );

    request.on('data', function(data) {
      webSocketServer.broadcast(data);
    });

  }).listen(STREAM_PORT);

  const webSocketServer = new WebSocket.Server({
    server: streamServer
  });

  // Broadcast the stream via websocket to connected clients
  webSocketServer.broadcast = function(data) {
    webSocketServer.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

startHttpServer();
startStreamServer();

let okReceived = false;

const udpClient = dgram.createSocket('udp4');
udpClient.on("message", (msg, rinfo) => {
  console.log("Message: " + msg);

  if (msg == "ok") {
    okReceived = true;
    console.log("ok received!");
  }
});

udpClient.on("error", msg => {
  console.log("Error: " + msg);
});

udpClient.on("connect", () =>{
  console.log("Connect!");
});

udpClient.on("close", () => {
  console.log("close!");
});

udpClient.on("listening", () =>{
  console.log("listening...");
});

async function send(msg) {
  okReceived = false;
  console.log(msg);
  udpClient.send(msg, TELLO_PORT, TELLO_IP, null);

  await sleep(1000);
}

async function waitForOK() {
  while (!okReceived) {
    await sleep(100);
  }
}

async function main() {
  await sleep(3000);
  
  await send("command");
  await sleep(3000);

  await send("streamon");
  await sleep(3000);

  await send("battery?");
  await sleep(3000);


  /*
    ----------START----------
    Write all of your commands in this block
  */

  // Use startStreaming() for streaming to localhost:3000
  startStreaming();
  // Use startRecording() to record your final submission
  // startRecording();

  await send("takeoff");
  await waitForOK();

  // Example Forward Command
  await send("forward 100");
  await waitForOK();

  /*
    ----------END----------
    Command block
  */

  await send("land");
}

main();