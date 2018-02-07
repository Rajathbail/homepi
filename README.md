<div align="center">
	<img src="public/images/logo.svg" height="80" alt="HomePi">
	<p align="center">Setting up your alexa and raspberrypi <br /> to know who's home and who isn't.</p>
	<p align="center">
	<a href="https://github.com/Rajathbail/homepi/releases/tag/v1.0">
		<img src="https://img.shields.io/badge/release-v1.0-brightgreen.svg" alt="">
	</a>
	<img src="https://img.shields.io/badge/size-47.5%20MB-green.svg" alt="">
	<a href="https://github.com/Rajathbail/homepi/blob/v1.0/LICENSE">
		<img src="https://img.shields.io/badge/license-MIT-yellow.svg" alt="">
	</a>
	</p>
</div>
<br />

## The Set up

Raspberry --> AWS S3 --> AWS Lambda --> Alexa

<strong>The Raspberry Pi</strong> starts an express server that creates a registration page. Inhabitants register their cell phones by submitting a MAC Address 📱

<strong>The Raspberry Pi</strong> scans the connected wifi network to create a list of all the devices connected (Mac Address, iP Address, etc) 💻 ()

The list is uploaded onto a <strong>AWS S3 Bucket</strong> 💾

<strong>Amazon Echo</strong> on being asked a question like "is <i><b>rajath</b></i> home?" captures the name (in this case, the name "<i><b>rajath</b></i>") 🎤

When asked about the name <strong>AWS Lambda</strong> checks through the list from AWS S3 Bucket and returns the status of the inhabitants device as registered. 👉🏽

<strong>Amazon Echo</strong> outputs the status ✌🏽

## Prerequisites

1. An Alexa enabled devices

2. Raspberry Pi

3. An Amazon AWS Account(If this is your first year with the same everything is free so don't worry about it 😅)

4. An Amazon Dev Account

5. Optionally completing
[This tutorial](https://developer.amazon.com/alexa-skills-kit/tutorials/fact-skill-1) might help

## Installing

#### Part 1 :: Setting up the alexa skill

Sign into your developer console using your amazon account. Create one if needed.
Name your skill and enter the details as necessary.

Create two new intents
1. **Named search :: WhoHome**
<br /> Create questions such as "is {name} home?" where {name} is a Amazon_First_name variable. (*These are to know the status of the inhabitant whose name is passed*) Example below 👇🏽
```
is {name} home
```

2. **General :: WhoAllHome**
<br /> Create questions such as "Who is home?". (*These are to list all inhabitants whoa are home*) Example below 👇🏽
```
who is home
```

If you have any trouble following up until now, [This tutorial](https://developer.amazon.com/alexa-skills-kit/tutorials/fact-skill-1) might help fill in the blanks.

#### Part 2 :: Setting up the Lambda Function

Sign into your AWS Dashboard.

Create a new Lambda function and paste the code from the file [ "AWS Lambda/HomeWatch.js"](https://github.com/Rajathbail/homepi/blob/v1.0/AWS%20Lambda/HomeWatch.js) into index.js

There are comments present at all parts to be replaced. This includes all the S3 keys and buckets. (So the skill shouldn't work just yet. 🤖)

#### Part 3 :: Setting up S3 buckets

In your AWS Dashboard:

Create a new S3 Bucket and name it as you would like.
Take note of the key 📎

**Quick detour to AWS Lambda ->** As indicated in the commented section fill in the name and src_key (the name of the file into which your data will eventually be stored 😁) of your bucket as indicated. Okay now back to our scheduled program 📺

#### Part 4 :: Setting up the Raspberry Pi

Boot your Raspberry Pi and clone the repository onto it.
```
$ git clone https://github.com/rajathbail/homepi
```

**In the code present in [Routes/index.js](https://github.com/Rajathbail/homepi/blob/v1.0/routes/index.js):**
1. fill in your AWS Key from earlier in the commented area along with the name of your file you entered in AWS Lambda earlier as the "src_key" and the name of your S3 bucket.
2. Find the ip address of a device connected to your wifi and replace the last digit with "\*"(This sets it to all ip's in the wifi). Place this as indicated by the comments.

Using command line change directory into "alexa" and type in the following

```
npm start
```

✨<br>
*BONUS POINTS: to get the server to start every time the RaspberryPi Boots/reboots, Place the file [scripts/homepi.service](https://github.com/Rajathbail/homepi/blob/v1.0/scripts/homepi.service) in /etc/systemd/system/homepi.service within the RaspberryPi 💯* <br>
✨


## Testing the skill

Log into [localhost:3000](localhost:3000) using a browser and register an inhabitants phone.
Ask your device if the name you registered is home.

If you get the answer you were expecting, It's all good 😁
Else read the next section 👇🏽

## Troubleshooting

If it says that the requested skill returned an error it could be one of the following:
1. The language you chose may not be the same as the one your Alexa enabled device is set to.
2. The Alexa enabled device isn't registered to the same account as your device as your developer account.
3. The intents should match their corresponding functions in AWS Lambda.

If your skill works but the name(s) you register aren't working it could be a problem with one of your devices accessing your S3 Bucket, Check if your keys are in place and if they match, in the RaspberryPi code,
else check if the name of the bucket in your AWS Lambda code is a match to make sure its a match.

## License

##### This project is licensed under the MIT License.

**tl;dr.** It's free for both personal and commercial use however you wish to modify it and distribute it. The work is provided "as is". You may not hold the author liable. You also need to include the original copyright and license notice in any copy of the source

## Some Quick Notes

Ideally the device registered is a cell phone since it's highly unlikely someone ever leaves home without it. 📱

Every time a device goes to sleep or standby it ends up disconnecting from the wifi, which would end up changing your status to not home. To mitigate that, the RaspberryPi waits half an hour of you not being visible to declare you not at home. ⏰

There's a sketch file for those of you that work with sketch incase you decide you want to modify or redesign the front-end interface of your localhost 🙂

If there's anything I missed or anything that seems to be a problem do comment and I'll be sure to respond or fix as soon as I can.

Also if you have any thoughts or comments do feel free to share them with me either by [mail](mailto:rajathbail@gmail.com) or by commenting below 👇🏽
