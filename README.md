# Maranz AV Reciever Control
This library allows you to control the basic functions of a Marantz Reciever using Node.js. This library is just a wrapper around the Marantz HTTP 'API'. However it handles a few things like:

* Rate limiting API calls - the reciever, at least in my testing would fail if you made too many requests at once.
* Normalizing their horrible naming conventions

## Install

```
npm install marantz-avr
```

## Usage

```
var AVReciever = require('marantz-avr');
var reciever = new AVReciever('ip_address');


reciever.powerOn();
```

