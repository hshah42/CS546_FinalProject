const express = require("express");
const uuid = require("uuid/v1");
const exphndlbars = require("express-handlebars");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const session = require("client-sessions");
const  mongoDB = require("mongodb");

const saltRounds = 16;

const app = express();

const static = express.static(__dirname + "/public");
app.use("/public", static);

app.set("view engine", "handlebars");
app.engine("handlebars", exphndlbars({defaultLayout:""}));

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());


app.use(cookieParser());

var currUser = "";

app.use(session({
	cookieName : "session",
	secret : "eg[isfd-8yF9-7w2315df{}+Ijsli;;to8"
}));

app.use(bodyParser.json());

const cookieName = "AuthCookie";

const errorObj = {"error" : "No user is logged in."};

var errorObj1 = {"loginError" : true};
var loginError = false;

async function DatabaseUsers()
{
  let connection = await mongoDB.MongoClient;
  let conn = await connection.connect("mongodb://localhost:27017/", {useNewUrlParser : true});
  let db = await conn.db("ActivitiesTracker");
  
  let UserCollection = await db.collection("users");

  return UserCollection;
};


async function DatabaseEvents()
{
  let connection = await mongoDB.MongoClient;
  let conn = await connection.connect("mongodb://localhost:27017/", {useNewUrlParser : true});
  let db = await conn.db("ActivitiesTracker");
  
  const EventCollection = await db.collection("events");

  return EventCollection;
};

app.post("/createEvent", async function(req, res)
{
  let body = req.body;
  let errors = new Array();

  let event = {};

  if(body["eventName"])
  {
    event["eventName"] = body["eventName"];
  }
  else
  {
    errors.push("Event Name is not present");
  }

  if(body["eventDate"])
  {
    event["eventDate"] = body["eventDate"];
  }
  else
  {
    errors.push("Event date is not present");
  }

  if(body["eventAddressLine1"])
  {
    event["eventAddressLine1"] = body["eventAddressLine1"];
  }
  else
  {
    errors.push("Event Address is not present");
  }

  if(body["eventAddressLine2"])
  {
    event["eventAddressLine2"] = body["eventAddressLine2"];
  }

  if(body["eventCity"])
  {
    event["eventCity"] = body["eventCity"];
  }
  else
  {
    errors.push("Event City is not present");
  }

  if(body["eventState"])
  {
    event["eventState"] = body["eventState"];
  }
  else
  {
    errors.push("Event State is not present");
  }
  
  if(body["eventZipCode"])
  {
    event["eventZipCode"] = body["eventZipCode"];
  }
  else
  {
    errors.push("Event Zip code is not present");
  }

  if(body["eventCountry"])
  {
    event["eventCountry"] = body["eventCountry"];
  }
  else
  {
    errors.push("Event Country is not present");
  }

  if(body["eventStartTime"])
  {
    event["eventStartTime"] = body["eventStartTime"];
  }
  else
  {
    errors.push("Event Start time is not present");
  }

  if(body["eventEndTime"])
  {
    event["eventEndTime"] = body["eventEndTime"];
  }
  else
  {
    errors.push("Event End time is not present");
  }

  if(body["eventDescription"])
  {
    event["eventDescription"] = body["eventDescription"];
  }
  else
  {
    errors.push("Event Description is not present");
  }

  if(body["eventTags"])
  {
    let tags = body["eventTags"].split(",");
    let normalizedData = new Array();

    for(let index in tags)
    {
      normalizedData.push(tags[index].trim());
    }
    event["eventTags"] = normalizedData;
  }

  if(body["eventRequirements"])
  {
    let eventRequirements = body["eventRequirements"].split(",");
    let normalizedData = new Array();

    for(let index in eventRequirements)
    {
      normalizedData.push(eventRequirements[index].trim());
    }

    event["eventRequirements"] = normalizedData;
  }

  if(body["eventRegisterationLimit"])
  {
    event["eventRegisterationLimit"] = body["eventRegisterationLimit"];
  }
  else
  {
    event["eventRegisterationLimit"] = Number.MAX_VALUE;
  }

  let admin = await getUserByUsername(req.session.user);

  event["creatorPhone"] = admin.usersPhoneNumber;
  event["creatorEmail"] = admin.userEmail;
    
  if(errors.length > 0)
  {
    //TODO a lot of things
    res.render();
  }
  else
  {
    let addEventStatus = await registerEvent(event);
	
	  if(addEventStatus)
	  {
      let userData = await getUserByUsername(req.session.user);
      let myEvents = await getActivitiesByArray(userData.usersInterests);

		  res.render("layouts/main", { currUser:currUser , events : myEvents });
	  }
	  else
	  {
		  res.json(false);
	  }
  }
});

app.post("/register", async function(req, res)
{
  if(req.session && req.session.user)
  {
    let userName = req.session.user;
    let userData = await getUserByUsername(userName);
    let eventId = req.body.eventId;
    let event = await getEventById(eventId);

    let success = await registerUser(userData._id, eventId);
    await addSchedule(eventId, userData._id, event.eventDate);

    res.send({"stat" : "registered"});
  }
  else
  {
    res.render("/");
  }
});

app.post("/addComment", async function(req, res){
  if(req.session && req.session.user)
  {
    let userName = req.session.user;
    let eventId = req.body.eventId;
    let comment = req.body.comment;

    let success = await addComment(userName, comment, eventId);

    if(success)
    {
      res.send(
        { 
          "commentAdded" : "true",
          "username" : userName,
          "comment" : comment
        });
    }
    else
    {
    }
  }
  else
  {
    res.render("/");
  }
});

app.post("/searchEvent", async function(req, res)
{	
	let searchObj = req.body;
	
	let searchRes = await searchEvents(searchObj);
	
	res.render("layouts/events", { events : searchRes}); 
});

app.get("/signup" , async function(req, res)
{
  if(req.session && req.session.user)
  {
    res.redirect("/home");
  }
  else
  {
    res.render("layouts/signup")
  }
});

app.post("/signup", async function(req, res)
{
  let body = req.body;
	let signupObj = {};
  let errors = new Array();

  if(body["usersName"])
  {
    signupObj["usersName"] = body["usersName"];
  }
  else
  {
    errors.push("Users name is not entered");
  }

  if(body["userName"])
  {
    if(await userNameExists(body["userName"]))
    {
      errors.push("User name already in use")
    }
    else
    {
      signupObj["userName"] = body["userName"];
    }
  }
  else
  {
    errors.push("Username is not entered");
  }

  if(body["userEmail"])
  {
    if(await userNameExists(body["userEmail"]))
    {
      errors.push("User email already in use")
    }
    else
    {
      signupObj["userEmail"] = body["userEmail"];
    }
  }
  else
  {
    errors.push("User email is not entered");
  }

  if(body["newUserPassword"])
  {
    let hashedPassword = await bcrypt.hash(body["newUserPassword"], saltRounds);
    signupObj["hashedPassword"] = hashedPassword;
  }
  else
  {
    errors.push("Users password is not entered");
  }

  if(body["usersPhoneNumber"])
  {
    signupObj["usersPhoneNumber"] = body["usersPhoneNumber"];
  }

  if(body["usersInterests"])
  {
    let interests = body["usersInterests"].split(",");
    let normalizedData = new Array();

    for(let index in interests)
    {
      normalizedData.push(interests[index].trim());
    }

    signupObj["usersInterests"] = normalizedData;
  }
  else
  {
    errors.push("Users Interests are not present")
  }
  
  if(body["usersAge"])
  {
    signupObj["usersAge"] = body["usersAge"];
  }
  else
  {
    errors.push("User age is not entered");
  }

  if(body["usersSecurityQuestion"])
  {
    signupObj["usersSecurityQuestion"] = body["usersSecurityQuestion"];
  }
  else
  {
    errors.push("User Security Question is not entered");
  }

  if(body["usersSecurityAnswer"])
  {
    signupObj["usersSecurityAnswer"] = body["usersSecurityAnswer"];
  }
  else
  {
    errors.push("User Security Answer is not entered");
  }

  if(errors.length > 0)
  {
    //TODO
  }
  else
  {
    let signupStatus = await addUser(signupObj);
		
	  if(signupStatus)
    { 
		  res.redirect("/");
    }
    else
    {
      //TODO
    }
  }
	
});

app.post("/login", async function(req, res){
	
	let request = req.body;
	let compareResults = false;
	let found = false;

	let checkIfPresentAtLogin = await req.cookies[cookieName];

	if(req.session && req.session.user)
	{
		res.redirect("/private");
	}
	else
	{ 		
		if(await DatabaseUsers())
		{
	    let checkIfPresent = await findUser(req.body.username, req.body.password);
			
		  if(checkIfPresent)
		  {
			  req.session["user"] = request["username"];
			  req.session.id = "1";
			  let currUser1 = {"currUser" : req.session["user"]};
			
			  found = true;
			  loginError = false;
						
			  let activitiesObj = null;
			
			  if(checkIfPresent.usersInterests.length > 0)
			  {
				  activitiesObj = await getActivitiesByArray(checkIfPresent.usersInterests);
        }
        	
			  currUser1["matchedAct"] = activitiesObj;
			
			  currUser = currUser1;
			
        let userData = await getUserByUsername(req.session.user);
        let myEvents = await getActivitiesByArray(userData.usersInterests);
    
        res.render("layouts/main", { currUser:currUser , events : myEvents });		  }
		
		  }
		
		if(found === false)
		{
			loginError = true;
			res.redirect("/");
		}
	}
});


app.get("/", async function (req, res){	
		let checkIfPresent = await req.cookies[cookieName];
	
		if(req.session && req.session.user)
		{
			let userData = await getUserByUsername(req.session.user);
      let myEvents = await getActivitiesByArray(userData.usersInterests);

		  res.render("layouts/main", { currUser:currUser , events : myEvents });
		}
		else
		{
			res.render("layouts/login", currUser);
		}
});

app.get("/profile", async function(req, res)
{
	if(req.session && req.session.user)
	{
		res.render("layouts/profile", currUser);
	}
	else
	{
		res.redirect("/");
  }
});

app.get("/schedule", async function(req, res)
{
  if(req.session && req.session.user)
	{
    let userData = await getUserByUsername(req.session.user);

    let events = await getScheduledActivities(userData._id);

		res.render("layouts/userSchedule", { events : events});
	}
	else
	{
		res.redirect("/");
  }
});

app.get("/event", async function(req, res)
{
  let eventId = req.query.id;
  let event = await getEventById(eventId);

  let users = new Array();

  for(let index in event.registeredUsers)
  {
    let userInfo = await getUserById(event.registeredUsers[index]);
    let user = {
      userName : userInfo.userName,
      usersEmail : userInfo.userEmail
    };

    users.push(user);
  }

  event["users"] = users;

  res.render("layouts/event", {event : event});
});

app.get("/events", async function(req, res)
{
	if(req.session && req.session.user)
	{
    let events = await getAllEvents();
    
    res.render("layouts/events", {"events" : events});
	}
	else
	{
		res.redirect("/");
	}
});

app.get("/createEvents", async function(req, res)
{
	if(req.session && req.session.user)
	{
		res.render("layouts/createEvents", currUser);
	}
	else
	{
		res.redirect("/");
	}
});

app.get("/logout", async function(req, res){
	
	let checkIfPresentAtLogout = await req.cookies[cookieName];
	
	if(req.session && req.session.user)
	{
		loginError = false;
		req.session.reset();
		res.clearCookie(cookieName).render("layouts/login", currUser);
	}
	else
	{
		loginError = false;
		res.render("layouts/login", currUser);
	}
}); 


app.get("/private", async function(req, res){
	
	let checkIfPresentAtPrivate = await req.cookies[cookieName];
	
	if(req.session && req.session.user)
	{
		let resObj = new Object();
	
		for(let j=0; j<arr.length; j++)
		{
			if(currUser == arr[j]["username"])
			{
				resObj["username"] = arr[j]["username"];
				resObj["FirstName"] = arr[j]["First Name"];
				resObj["LastName"] = arr[j]["Last Name"];
				resObj["Profession"] = arr[j]["Profession"];
				resObj["Bio"] = arr[j]["Bio"];
			}
		}
    
    let userData = await getUserByUsername(req.session.user);
    let myEvents = await getActivitiesByArray(userData.usersInterests);

		res.render("layouts/main", { currUser:currUser , events : myEvents });
	}
	else
	{
		res.status(403).render("../main/error", errorObj);
	}
});

app.get("*", async function(req, res)
{
	let checkIfPresentAtGetLogin = await req.cookies[cookieName];
	
	if(req.session && req.session.user)
	{
    let userData = await getUserByUsername(req.session.user);
    let myEvents = await getActivitiesByArray(userData.usersInterests);

		res.render("layouts/main", { currUser:currUser , events : myEvents });
	}
	else
	{
		res.redirect("/");
	}
});


app.get("/eventDetails", function(req, res)
{
});

app.listen(3000, function(){
	console.log("This website is active on port 3000.");
});

async function findUser(username, password)
{
	let dbUser = await DatabaseUsers();
	
	let foundUser = await dbUser.findOne({"userName" : username});
	
	if(foundUser)
	{	
		let passwd = await foundUser["hashedPassword"];		
		
		let passwordCheck = await bcrypt.compare(password, passwd);
		
		if(passwordCheck)
		{
			return foundUser;
		}
	}
	else
	{
		return false;
	}
}; 

async function addUser(signupObj)
{
	let dbUser = await DatabaseUsers();
  
  signupObj["_id"] = uuid();
  
	let addedUser = await dbUser.insertOne(signupObj);
	
	if(addedUser)
	{
		return addedUser;
	}
	else
	{
		return false;
	}
}; 


async function searchEvents(searchObj)
{
  let queryString = new Object();
	
	queryString['$and'] = new Array();
	
	if(searchObj["eventName"])
	{
    queryString['$and'].push({eventName : { $regex: new RegExp(searchObj["eventName"], 'i')}});
	}
	
	if(searchObj["eventType"])
	{
		queryString['$and'].push({eventTags : { $regex: new RegExp(searchObj["eventType"], 'i')}});
	}
	
	if(searchObj["eventDate"])
	{
		queryString['$and'].push({eventDate : {$eq : searchObj["eventDate"]}});
	}
	
	if(searchObj["address"])
	{
		queryString['$and'].push({eventZipCode :{$eq : searchObj["address"]}});
	}

  let dbEvent = await DatabaseEvents();
  let searchRes;
  
  if(queryString['$and'].length > 0 )
  {
    searchRes = await dbEvent.find(queryString).collation({locale: "en", strength: 2}).toArray();
  }
  else
  {
    searchRes = await dbEvent.find({}).toArray();
  }
	
	return searchRes;
};

async function getAllEvents()
{
  let dbEvent = await DatabaseEvents();
  let searchResult = await dbEvent.find({}).toArray();

  return searchResult;
}

async function getEventByRegistration(id)
{
  let dbEvent = await DatabaseEvents();

  let searchResult = await dbEvent.find({ "registeredUser" : id });

  return searchResult.toArray();
}

async function getEventById(id)
{
  let dbEvent = await DatabaseEvents();

  let event = await dbEvent.findOne({ "_id" : id});

  return event;
}

async function getActivitiesByArray(activityArr)
{
	let dbEvent = await DatabaseEvents();
	
	let searchRes = await dbEvent.find({ eventTags : {$in : activityArr} }).toArray();
	
	return searchRes;
};

async function registerEvent(regEventObj)
{
	let dbEvent = await DatabaseEvents();
	
	regEventObj["_id"] = uuid();
	
	let regRes = await dbEvent.insertOne(regEventObj);
	
	return regRes;
};

async function getUserByUsername(username)
{
  let dbUser = await DatabaseUsers();
  let user = await dbUser.findOne({ "userName" : username});

  return user;
}

async function registerUser(userId, eventId)
{
  let dbEvent = await DatabaseEvents();

  let event = await getEventById(eventId);

  if(event.registeredUsers >= event.eventRegistrationLimit)
  {
    let result = await dbEvent.updateOne({ _id : eventId }, { $push : { waitlistedUsers : userId }} );
  }
  else
  {
    let result = await dbEvent.updateOne({ _id : eventId }, { $push : { registeredUsers : userId }} );
  }

  return true;
}

async function addComment(userName, comment, eventId)
{
  let userComment = {
    userName : userName,
    comment : comment
  }

  let dbEvent = await DatabaseEvents();

  let result = await dbEvent.updateOne({ _id : eventId} , { $push : { comments : userComment }});

  return true;
}

async function userNameExists(username)
{
  let dbUser = await DatabaseUsers();
  let user = await dbUser.findOne({ "userName" : username });

  if(user)
  {
    return true;
  }
  else
  {
    return false;
  }
}

async function emailExists(email)
{
  let dbUser = await DatabaseUsers();

  let user = await dbUser.findOne({ "userEmail" : email });

  if(user)
  {
    return true;
  }
  else
  {
    return false;
  }
}

async function getUserById(id)
{
  let dbUser = await DatabaseUsers();

  let user = await dbUser.findOne({"_id" : id});

  return user;
}

async function addSchedule(eventId, userId, eventDate)
{
  let dbUser = await DatabaseUsers();
  let scheduleInfo = {
    eventId : eventId,
    eventDate : eventDate
  }
  let result = await dbUser.updateOne({ _id : userId }, { $push : { schedule : scheduleInfo }} );
}

async function getScheduledActivities(userId)
{
  let dbEvent = await DatabaseEvents();

  let events = await dbEvent.find({ "registeredUsers" : userId , "eventDate" : { $gte : new Date().toISOString().slice(0,10)} }).sort({ eventDate : -1 });

  return events.toArray();
}