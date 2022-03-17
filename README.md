## The challenge
- There are 2 missions.
- There are 4 targets per mission.

### Preparation
- Create 2 teams, one per mission.
- Get 1 drone + laptop per team.
- Modify the code / enable and view the video stream / get a feel for controlling your drone.
- Inspect / measure the obstacle course.
- Program your drone to complete the course and capture video of each target image.

### Fly the mission
- When you are ready, you can start the mission.
- You can start the mission only once per team.
- Create a recording of your drone flying the obstacle course following your program.
- Your team will earn up to 12.5 points for each target image in your video recording.
- Better (centered, close-up) footage of the target images will get you more points.
- The scores of both missions is combined in the score for your group.


## Warning: waitForOK
After you send a command, the drone should respond with an OK message. You can wait until the OK is received with the waitForOK function. However, sometimes, some drones don't feel like sending the OK. So you may want to sometimes replace a waitForOK with a sleep. Try and find out.


---
## Requirements
(Already installed!)

Node:
https://nodejs.org/en/download/

ffmpeg: (Make sure it's in your path)
http://jollejolles.com/install-ffmpeg-on-mac-os-x/

and for Windows:
https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg

---

## Running

node index.js

## Accessing the Video Stream

Uncomment "startStreamServer();" (line 112)
Uncomment "startStreaming();" (line 168)
Comment "startRecording();" (line 169)

When your code is running, open a browser to:
http://localhost:3000/index.html

## Creating a recording

Set target filename. Default is "recording.avi" (line 34)
Comment "startStreamServer();" (line 112)
Comment "startStreaming();" (line 168)
Uncomment "startRecording();" (line 169)

