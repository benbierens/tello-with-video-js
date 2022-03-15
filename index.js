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

startHttpServer();
// startStreamServer();

const udpClient = dgram.createSocket('udp4');

// Send command
udpClient.send("command", TELLO_PORT, TELLO_IP, null);

// Send streamon
udpClient.send("streamon", TELLO_PORT, TELLO_IP, null);

setTimeout(function() {
  // startStreaming();
  startRecording();

  setTimeout(function () {

    console.log("takeoff");
    udpClient.send("takeoff", TELLO_PORT, TELLO_IP, null);

    setTimeout(function () {

      console.log("cw");
      udpClient.send("cw 90", TELLO_PORT, TELLO_IP, null);

      setTimeout(function () {

        console.log("land");
        udpClient.send("land", TELLO_PORT, TELLO_IP, null);
      }, 10000);
    }, 10000);
  }, 10000);
}, 3000);
