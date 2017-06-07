# Node Controlling WebApp

Based on the popular [MEAN.JS](http://meanjs.org) Stack.

This is mean to be a hub and interface for configuring a general use Home Automation system.
It works its co-project [Home Nodes](https://github.com/tloftis/outlet_node) to allow control of any hardware able to interface with a raspberry pi or other similar Soc hardware like hardware able to run nodejs.

The system allows for the use of structure javascript "drivers" to interface with hardware or software on the PI. I hope to soon replace this with a local RESTful api to be used by Docker images to replace the existing driver system

## Inputs and Outputs

The system comes down to directing an Input to an Output.

### Input
A input is any way of generating an event with data, a physical button can be connected to the PI and be used as an interface. A RFID sensor could be connected as well, even things like speech to text can also be used with the system or just the temperature of the board.

Inputs will currently generate one of Three types of data Strings, Numbers, and Booleans. When the input generates new data, it will send a HTTP POST request off to the primary server with the input's ID, token and the value it just generated.

Inputs are communicated with through the use of Drivers, a driver uses a generic constructor and configuration file. This driver can speak with physical hardware or software and act as a translation layer.

Inputs hardware is hooked up physically but is configured through the web interface, things like the Driver configuration are set here. Things like what pin it is connected to or it's initial value can be set, as well as a plain text name, description and location field can be set to make the Input more human readable.

### Output
A Output takes in data and typically performs some action based on it. A Output can be things like a physical Relay to switch a light or fan on or off. Things like Text to Speech can also be done or things like reduce the clock rate the machine it it is running hot to cool it off.

Outputs currently take in one of Three types of data Strings, Numbers, and Booleans. A Output currently receives a value through a POST request and responds with either a message explaining any issues or a confirmation of it's success. Values can be sent to the Output by hand through the user interface on the main servers web interface but must be accompanied by the configured server token. Inputs can also be piped into any Output if the type of data produced by an output matches the type of data the Output takes in.

Outputs are communicated with through the use of Drivers, a driver uses a generic construtor and configuration file. This driver can speak with physical hardware or sofware and allows for anything that can be done with Node to be able to done by any Output, as long as the final value genrated by Output is one of the previously listed data Types.

Outputs hardware is hooked up physically but is configured through the web interface, things like the Driver configuration are set here. Things like what pin it is connected to or it's inital value can be set, as well as a plain text name, description and location field can be set to make the Output stand out a bit better.

## Drivers
(This will soon be dramatically changed, using docker and most likly a UNIX socket to communicate with the node, YTD)

Drivers are modular portions of code with a uniform final Interaction level, but can have very diverse internal code structures and functions. They provide the interface for inputs and outputs to interact with the outside world or react to it. There are two primary types of drivers, input drivers and output drivers. Input drivers generate data while Output Drivers take in data and act apon it.

Drivers can be hotswapped and added and removed, they are currently automatically found on system startup and a list of them is provided the the primary server for viewing but view only, no CRUD operations are able to be done by the server. A driver is setup to a input/output on the web interface, you select which driver will be used from a list of all current drivers for that particular device.

The drivers are stored in the [root]/drivers/(inputs|outputs)/ directory.

# Setup
Server:

1. Install Node on the system you plan on being the server
2. Install MongoDB on the system as well and make sure it is running after install
2. Clone this Repo
3. Go into the newly created directory and rename the file ".envtemplate" to ".env"
4. Edite the new ".env" file to remove the "#" in front of the MONGO_SEET line
5. Optional: Configure the .env file to your liking, i would suggest changing the NODE_ENV Parameter to "develop" and changing the PORT
6. Open a terminal window in the directory and run the command "npm install" and let it run, you sould run the command a second time after the first completes just to make sure, sometimes it happens.
7. Now in the same terminal run "node server.js" and if all is good it should say the server is up and give you a block of green text showing the server information
8. Go to the url http://localhost:2000 (or what ever port you specified, this number can be seen in the Server param of the green text)
9. You should see the site, the log in information can be found in the terminal window, it should be in red text, two users, an admin and a user account.
10. if you have a Home Node already running, then after login you should be able to see it in the "Node List" that you can see from the dropdown Nodes list at the top of the screen.

Home Node:

Raspberry PI/Linux ARM:
    run the "install-raspberrypi.sh", thats it

Linux x86:
    Use Docker, run "docker-build.sh" then "docker-start.sh", should be all good

Other:
    1. Install Node on the system you plan on being the Home Node
    2. Clone this repo to the system
    3. Go into the newly created directory and open a terminal window in it
    4. Run the command "npm install" and let it run, it may take a moment to compile wiring-pi, and may even fail if you don't have all the depencies to compile it
    5. if all went well, in the terminal run "node app.js" and it should startup.
