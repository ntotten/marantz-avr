# Marantz AV Receiver Control
This library allows you to control the basic functions of a Marantz Receiver using io.js/node.js. This library is just a wrapper around the Marantz HTTP 'API'. However it handles a few things like:

* Rate limiting API calls - the receiver, at least in my testing would fail if you made too many requests at once.
* Normalizing their horrible naming conventions

> Note, that I used a few ES6 functions that are compatible with iojs in this library so you will either need to enable the flags or edit the library and use a polyfill if you are using Node.js.


## Install

```
npm install marantz-avr
```

## Usage

```
var AVReceiver = require('marantz-avr');
var receiver = new AVReceiver('ip_address');


receiver.powerOn();
```

