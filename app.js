const express = require("express");
const uuid = require("uuid/v1");
const exphndlbars = require("express-handlebars");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const session = require("client-sessions");
const mongoDB = require("mongodb");
const multer = require("multer");

const storage = multer.diskStorage({
	destination : function(req, file, data){
		data(null, "./imageUploads/");
	},
	filename : function(req, file, data){
		data(null, file.originalname);
	}
});

const upload = multer({storage : storage});

const saltRounds = 16;

const app = express();

app.use("/imageUploads", express.static(__dirname + "/imageUploads"));

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

var xss = require("xss");
var html = xss('<script>alert("xss");</script>');


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

app.get("/forgotUsernamePass", async function(req, res)
{
	//console.log("Hi");
	if(await req.body)
	{
		res.render("layouts/forgotPassword", await req.body);
	}
	else
	{
		res.render("layouts/forgotPassword");
	}
});

app.post("/forgotUsernamePass", async function(req, res)
{
	//console.log(req);
	
	if(await req.body.username && await req.body.securityQuestion && await req.body.answer)
	{
		let user = await getUserByUsername(req.body.username);
		//console.log(await user);
		
		if(await user.userEmail == await req.body.username && await user.usersSecurityQuestion == await req.body.securityQuestion && await user.usersSecurityAnswer == await req.body.answer)
		{
			console.log("Hello");
			
			res.render("layouts/changePassword", {"_id" : await user._id});  
		}
		else
		{
			res.render("layouts/forgotPassword", {"error":"Invalid details."});
		}
	}
	else
	{
		//console.log("Hi");
		res.render("layouts/forgotPassword", {"error":"Invalid details."});
	}
});


app.post("/changePassword", async function(req, res)
{
	if(await req.query._id)
	{
		if(await req.body.newpassword == await req.body.confirmPassword)
		{
			let hashedPassword = await bcrypt.hash(await req.body["newpassword"], saltRounds);
			
			let dbUser = await DatabaseUsers();
			
			let resetP = await dbUser.updateOne({"_id" : await req.query._id}, {$set : {"Hashed Password" : await hashedPassword}});
			
			if(await resetP)
			{
				res.redirect("/");
			}
			else
			{
				res.render("layouts/changePassword", {"_id" : await req.query._id, "error" : "Could not reset."});
			}
		}
		else
		{
			res.render("layouts/changePassword", {"_id" : await req.query._id, "error" : "Passwords do not match."});
		}
		
	}
	else
	{
		res.render("layouts/login");
	}
});

app.get("/contacts", async function(req, res){
	if(req.session && req.session.user)
	{
		res.render("layouts/contacts", currUser);
	}
	else
	{
    res.render("/");
	}
});

app.post("/createEvent", upload.single("eventImage"), async function(req, res)
{
  let body = req.body;
  let errors = new Array();

  let event = {};
  
  if(req.file)
  {
	  event["eventImage"] = req.file;
  }
  else
  {
	  event["eventImage"] = new Object;
	  event["eventImage"]["path"] = "imageUploads/images.png";
  }

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
    res.render("layouts/createEvents", {event : event, currUser : currUser , errors : errors});
  }
  else
  {
    let addEventStatus = await registerEvent(event);
	
	  if(await addEventStatus)
	  {
		  res.redirect("/");
	  }
	  else
	  {
		  res.json(false);
	  }
  }
});

app.get("/updateRating", async function(req, res){
	//console.log(req.query);
	
	let avg = await updateRating(req.query.id, req.query.value);
	
	let user = await getUserById(req.query.id);
	
	user["avgRating"] = await avg;

	res.render("layouts/userProfile", {user, currUser : currUser});

});

app.post("/registerWithdraw", async function(req, res)
{
  if(req.session && req.session.user)
  {
    let userName = req.session.user;
    let userData = await getUserByUsername(userName);
    let eventId = req.body.eventId;

    let success = await registerWithdrawUser(userData._id, eventId);

    res.send({"stat" : success, currUser : currUser});
  }
  else
  {
    res.render("/");
  }
});

app.post("/register", async function(req, res)
{
  if(req.session && req.session.user)
  {
    let userName = req.session.user;
    let userData = await getUserByUsername(userName);
    let eventId = req.body.eventId;

    let success = await registerUser(userData._id, eventId);

    res.send({"stat" : "registered", currUser : currUser});
  }
  else
  {
    res.render("/");
  }
});


app.post("/withdraw", async function(req, res)
{
  if(req.session && req.session.user)
  {
    let userName = req.session.user;
	
	  let eventId = req.body.eventId;
    
	  let success = await withdrawUserFromEvent(eventId, userName);
		
	if(await success)
	{
		res.send({"stat" : "withdrawn", currUser : currUser});
	}
	else
	{
		res.send({"stat" : "registered", currUser : currUser});
	}
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
          "comment" : comment,
		  currUser: currUser,
		  "commentArr" : success
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
	
	res.render("layouts/events", { events : searchRes, currUser : currUser}); 
});

app.post("/signupPage" , async function(req, res)
{
  if(req.session && req.session.user)
  {
    res.redirect("/home", {currUser : currUser});
  }
  else
  {
    res.render("layouts/signup")
  }
});

app.post("/signupTemp", async function(req, res)
{
  let body = req.body;
	let signupObj = {};
  let errors = new Array();
  
  if(body["usersName"])
  {
    signupObj["username"] = body["usersName"];
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
    signupObj["Hashed Password"] = hashedPassword;
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
    res.json("Error");
  }
  else
  {
    let signupStatus = await addUser(signupObj);
		
	  if(await signupStatus)
    { 
		  res.redirect("/");
    }
    else
    {
      res.json("Error");
    }
  }
	
});


app.post("/signup", async function(req, res)
{
  let body = req.body;
	let signupObj = {};
  let errors = new Array();
  
  if(body["usersName"])
  {
    signupObj["usersname"] = body["usersName"];
  }
  else
  {
    errors.push("Users Name not entered")
  }

  if(body["userName"])
  {
    signupObj["userName"] = body["userName"];
  }
  else
  {
    errors.push("User Name not entered")
  }

  if(body["userEmail"])
  {
    if(await userEmailExists(body["userEmail"]))
    {
      errors.push("User email already in use")
    }
    else
    {
      signupObj["userEmail"] = body["userEmail"];
    }
  }

  if(body["newUserPassword"])
  {
    let hashedPassword = await bcrypt.hash(body["newUserPassword"], saltRounds);
    signupObj["Hashed Password"] = hashedPassword;
  }
  else
  {
    errors.push("Password is not entered")
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
    errors.push("Interests are not entered");
  }
  
  if(body["usersAge"])
  {
    signupObj["usersAge"] = body["usersAge"];
  }

  if(body["usersSecurityQuestion"])
  {
    signupObj["usersSecurityQuestion"] = body["usersSecurityQuestion"];
  }
  else
  {
    errors.push("Security question is not entered");
  }

  if(body["usersSecurityAnswer"])
  {
    signupObj["usersSecurityAnswer"] = body["usersSecurityAnswer"];
  }
  else
  {
    errors.push("Security answer is6 not entered");
  }

  if(errors.length > 0)
  {
    res.render("layouts/signup", {errors : errors , user : signupObj});
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
      res.json("Error");
    }
  }
	
});


app.post("/login", async function(req, res){
	
	let request = req.body;
	let compareResults = false;
	let found = false;

	let checkIfPresentAtLogin = req.cookies[cookieName];

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
			  
			
			  found = true;
			  loginError = false;
			  
			  
		    let currUser1 = {"currUser" : req.session["user"]};
			  let activitiesObj = null;
			
			  activitiesObj = await getActivitiesByUser(req.session["user"]);
			  currUser1["matchedAct"] = activitiesObj;
			
			  currUser = currUser1;
        res.render("layouts/main", currUser);		  
		}
		}
		
		if(found === false)
		{
			loginError = true;
			res.render("layouts/login", {error : "Username / Password is incorrect."});
		}
	}
});


app.get("/", async function (req, res){	
		let checkIfPresent = req.cookies[cookieName];
	
		if(req.session && req.session.user)
		{
			let userData = await getUserByUsername(req.session.user);
      let myEvents = await getActivitiesByArray(userData.usersInterests);
	  
	    let currUser1 = {"currUser" : req.session["user"]};
			let activitiesObj = null;
			
			
			activitiesObj = await getActivitiesByUser(req.session["user"]);
					
        	
			currUser1["matchedAct"] = activitiesObj;
			currUser = currUser1;

		  res.render("layouts/main", currUser);
		}
		else
		{
			res.render("layouts/login");
		}
});

app.post("/", async function (req, res){	
		let checkIfPresent = req.cookies[cookieName];
	
		if(req.session && req.session.user)
		{
			let userData = await getUserByUsername(req.session.user);
			let myEvents = await getActivitiesByArray(userData.usersInterests);
	  
			let currUser1 = {"currUser" : req.session["user"]};
			let activitiesObj = null;
			
			
			activitiesObj = await getActivitiesByUser(req.session["user"]);
					
        	
			currUser1["matchedAct"] = activitiesObj;
			currUser = currUser1;

			res.render("layouts/main", currUser);
		}
		else
		{
			res.render("layouts/login");
		}
});

app.get("/profile", async function(req, res)
{
	if(req.session && req.session.user)
	{
		let user = await getUserByUsername(req.session.user);
		
		let interests = await user["usersInterests"];
		
		
		
		//console.log(user);
		res.render("layouts/profile", {user, currUser:currUser});
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
  
  let checkIfUserRegistered = await getUserRegistrationStatus(eventId, req.session.user);

  let users = new Array();

  for(let index in await event.registeredUsers)
  {
    let userInfo = await getUserById(await event.registeredUsers[index]);
	
	if(userInfo)
	{
    let user = {
      userName : userInfo.userName,
      usersEmail : userInfo.userEmail
    };
	
	await users.push(user);
	}

    
  }

  event["users"] = await users;
  
  if(await checkIfUserRegistered)
  {
	  res.render("layouts/event", {event, currUser, "registered" : "true"});
  }
  else
  {
	 res.render("layouts/event", {event, currUser, "registered" : "false"});
  }
});

app.get("/user", async function(req, res){
 
  if(req.session && req.session.user)
	{
    let userId = await req.query.id;

    let user = await getUserById(userId);
	
	let sum = 0;
	
	if(await user.rating)
	{
	for(let i in await user.rating)
	{
		sum = sum + await parseInt(user.rating[i]);
	}
	//console.log(await sum);
	
	let avg = await Math.ceil(parseInt(sum) / user.rating.length);
	
	//console.log(await avg);
	
	user["avgRating"] = await avg;
	}

	res.render("layouts/userProfile", {user, currUser : currUser});
	}
	else
	{
		res.redirect("/");
  }

});

app.get("/events", async function(req, res)
{
	if(req.session && req.session.user)
	{
    let events = await getAllEvents();
    
    res.render("layouts/events", {"events" : events, currUser});
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

app.get("/userListing", async function(req, res)
{
  if(req.session && req.session.user)
	{
    let users = await getAllUsers();
		res.render("layouts/userListing", {users, currUser : currUser });
	}
	else
	{
		res.redirect("/");
	}
});

app.post("/searchUser", async function(req, res)
{
  if(req.session && req.session.user)
	{
    let searchConditions = req.body;

    let users = await searchUsers(searchConditions);

    res.render("layouts/userListing", {users, currUser : currUser });
	}
	else
	{
		res.redirect("/");
	}
});

app.get("/logout", async function(req, res){	
	
	if(req.session && req.session.user)
	{
		loginError = false;
		req.session.reset();
		res.clearCookie(cookieName).redirect("/login");
	}
	else
	{
		loginError = false;
		res.redirect("/login");
	}
}); 


app.get("/private", async function(req, res){
	
	let checkIfPresentAtPrivate = await req.cookies[cookieName];
	
	if(req.session && req.session.user)
	{
    let userData = await getUserByUsername(req.session.user);
    let myEvents = await getActivitiesByArray(userData.usersInterests);
	
	  let currUser1 = {"currUser" : req.session["user"]};
		let activitiesObj = null;
			
		activitiesObj = await getActivitiesByUser(req.session["user"]);		
        	
		currUser1["matchedAct"] = await activitiesObj;
			
	  currUser = currUser1;

		res.render("layouts/main", currUser);
	}
	else
	{
		res.status(403).render("../main/error", errorObj);
	}
});

app.get("*", async function(req, res)
{
	let checkIfPresentAtGetLogin = req.cookies[cookieName];
	
	if(req.session && req.session.user)
	{
    let userData = await getUserByUsername(req.session.user);
    let myEvents = await getActivitiesByArray(userData.usersInterests);
	
	  let currUser1 = {"currUser" : req.session["user"]};
		let activitiesObj = null;
			
		activitiesObj = await getActivitiesByUser(req.session["user"]);    	
		currUser1["matchedAct"] = activitiesObj;
			
		currUser = currUser1;
		res.render("layouts/main", currUser);
	}
	else
	{
		res.redirect("/");
	}
});


app.get("/eventDetails", function(req, res)
{
});

app.post("/updateProfile", async function(req, res)
{
	if(req.session && req.session.user)
	{
		let resp = await updateProfile(req.body, req.session.user);
		let user = await getUserByUsername(req.session.user);
		
		//console.log(await user);
		
		user["updateStatus"] = await resp;
		
		res.render("layouts/profile", {user, currUser : currUser});
	}
	else
	{
		res.redirect("/");
	}
});

app.listen(3000, function(){
	console.log("This website is active on port 3000.");
});

async function findUser(username, password)
{
	let dbUser = await DatabaseUsers();
	
	let foundUser = await dbUser.findOne({"userEmail" : username});
	
	if(foundUser)
	{	
		let passwd = foundUser["Hashed Password"];		
		
		let passwordCheck = await bcrypt.compare(password, passwd);
		
		if(await passwordCheck)
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

async function searchUsers(searchObject)
{
  let queryString = new Object();
	
  queryString['$and'] = new Array();
  
  if(searchObject["userName"])
	{
		queryString['$and'].push({userName : { $regex: new RegExp(searchObject["userName"], 'i')}});
	}
	
	if(searchObject["userEmail"])
	{
		queryString['$and'].push({userEmail : { $regex: new RegExp(searchObject["userEmail"], 'i')}});
	}
	
	if(searchObject["usersName"])
	{
		queryString['$and'].push({usersName : { $regex: new RegExp(searchObject["usersName"], 'i')}});
  }
  
  let dbUser = await DatabaseUsers();

  let searchRes;

  if(queryString['$and'].length > 0 )
  {
    searchRes = await dbUser.find(queryString).collation({locale: "en", strength: 2}).toArray();
  }
  else
  {
    searchRes = await dbUser.find({}).toArray();
  }
	
	return searchRes;

}

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

async function getUserById(id)
{
  let dbUser = await DatabaseUsers();

  let user = await dbUser.findOne({"_id" : id});

  return user;
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
	
	let searchRes = await dbEvent.find({ eventTags : {$in :[activityArr]} }).toArray();
	
	return searchRes;
};

async function getActivitiesByUser(user)
{
	let dbEvent = await DatabaseEvents();
	let dbUser = await DatabaseUsers();
	
	let userObj = await dbUser.findOne({"userEmail" : user});
	
	let _id = await userObj["_id"];
		
	let searchRes = await dbEvent.find({ registeredUsers : {$in :[_id]} }).toArray();
	
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
  let user = await dbUser.findOne({ "userEmail" : username});

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
  };

  let dbEvent = await DatabaseEvents();
  
  let userCommentArr = new Array();
  
  let originalComments = await dbEvent.findOne({"_id" : eventId});
  
  
  if(originalComments["comments"])
  {
	  userCommentArr = await originalComments["comments"];
	
	  userCommentArr.push(userComment);

	  let result = await dbEvent.updateOne({ "_id" : eventId} , { $set : { "comments" : userCommentArr }});
 
	  return userCommentArr;
  }
  else
  {
	  userCommentArr.push(userComment);
	  
	  let result = await dbEvent.updateOne({"_id" : eventId}, { $set : { "comments" : userCommentArr }});
	  
	  return userCommentArr;
  }
}

async function userEmailExists(userEmail)
{
  let dbUser = await DatabaseUsers();
  let user = await dbUser.findOne({ "userEmail" : userEmail });

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
    return user;
  }
  else
  {
    return false;
  }
};

async function getRegisteredUsers(eventId)
{
	let dbEvent = await DatabaseEvents();
	
	let regUsers = await dbEvent.findOne({"_id" : eventId});
	
	let regUsersArray = "";
	
	if(regUsers)
	{
		regUsersArray = regUsers["registeredUsers"];
	}
	else
	{
		regUsersArray = false;
	}
	
	return regUsersArray;
};

async function getUserRegistrationStatus(eventId, userEmail)
{
	let user = await emailExists(userEmail);
		
	let registeredUsersArray = await getRegisteredUsers(eventId);
		
	if(registeredUsersArray)
	{
	
	  for(let i=0; i< registeredUsersArray.length; i++)
	  {
		  let regUserId = registeredUsersArray[i];
				
		  if(await user._id === regUserId)
		  {
      	return true;
		  }
		
	  }
	}
	
	return false;
};


async function withdrawUserFromEvent(eventId, userName)
{
	let dbUser = await DatabaseUsers();
	let dbEvent = await DatabaseEvents();
	
	let user = await dbUser.findOne({"userEmail" : userName});
	let event = await dbEvent.findOne({"_id" : eventId});
	
	let userId = user["_id"];
	let registeredUsers = event["registeredUsers"];
	
	for(let i=0; i < registeredUsers.length; i++)
	{
		if(registeredUsers[i] == userId)
		{
			registeredUsers[i] = "";
		}
	}
		
	let withdrawStatus = await dbEvent.updateOne({"_id" : eventId}, {$set : {"registeredUsers" : registeredUsers}});
	
	if(withdrawStatus)
	{
		return true;
	}
	else
	{
		return false;
	}
};

async function getAllUsers()
{
  let dbUser = await DatabaseUsers();

  let users = await dbUser.find({}).sort({ userName : 1 });

  return users.toArray();
};

async function registerWithdrawUser(userId, eventId)
{
	let cnt=0;
	let dbUser = await DatabaseUsers();
	let dbEvent = await DatabaseEvents();
	
	let user = await dbUser.findOne({"_id" : userId});
	let event = await dbEvent.findOne({"_id" : eventId});

	let registeredUsers = await event["registeredUsers"];
	
	let withdrawStatus = false;
	let result = false;
	
	for(let i=0; i<await registeredUsers.length; i++)
	{
		if(await registeredUsers[i] == userId)
		{
			//console.log("Reached In!!!", i);
			
			await registeredUsers.splice(i,1);
			cnt++;
		}
	}
	
	if(cnt>0)
	{
		//console.log(await registeredUsers);
	
		withdrawStatus = await dbEvent.updateOne({"_id" : eventId}, {$set : {"registeredUsers" : registeredUsers}});
	}
	else
	{
		result = await dbEvent.updateOne({ _id : eventId }, { $push : { registeredUsers : userId }} );
	}
	
	
	//console.log(await withdrawStatus);
	if(await withdrawStatus)
	{
		return "withdrawn";
	}
	
	if(await result)
	{
		return "registered";
	}
};


async function updateRating(userId, rating)
{
	let dbUser = await DatabaseUsers();
	
	let user = await dbUser.findOne({"_id" : userId});
	let sum = 0;
	
	if(await user["rating"])
	{
		let ratingArr = new Array();
		
		ratingArr = await user["rating"];
		
		await ratingArr.push(rating);
		
		await dbUser.updateOne({"_id":userId}, {$set:{"rating" : ratingArr}});
		
		for(let i in await ratingArr)
		{
			sum = sum + parseInt(ratingArr[i]);
		}
		
		let avg = await Math.ceil(parseInt(sum) / ratingArr.length);
		
		return await avg;
	}
	else
	{
		let ratingArr = new Array();
		await ratingArr.push(rating);
		
		await dbUser.updateOne({"_id":userId}, {$set:{"rating" : ratingArr}});
		
		for(let i in await ratingArr)
		{
			sum = sum + parseInt(ratingArr[i]);
		}
		
		let avg = await Math.ceil(parseInt(sum) / ratingArr.length);
		
		return await avg;
	}
};

async function updateProfile(request, userName)
{
	//console.log(request);
	let dbUser = await DatabaseUsers();
	
	let user = await getUserByUsername(userName);
	
	let userId = await user._id;
	
	let storedUser = await dbUser.findOne({"_id" : userId});
	
	let cnt=0;
	
	if(await request.usersname !== await storedUser.usersname)
	{
		await dbUser.updateOne({"_id": userId}, {$set:{"usersname": request.usersname}});
		await cnt++;
		//console.log("usersname");
	}
	
	if(await request.userName !== await storedUser.userName)
	{
		await dbUser.updateOne({"_id": userId}, {$set:{"userName": request.userName}});
		await cnt++;
		//console.log("2");
	}
	
	if(await request.userEmail !== await storedUser.userEmail)
	{
		await dbUser.updateOne({"_id": userId}, {$set:{"userEmail": request.userEmail}});
		await cnt++;
		//console.log("3");
	}
	
	if(await request.usersPhoneNumber !== await storedUser.usersPhoneNumber)
	{
		await dbUser.updateOne({"_id": userId}, {$set:{"usersPhoneNumber": request.usersPhoneNumber}});
		await cnt++;
		//console.log("4");
	}
	
	if(await request.userInterests.toString() !== await storedUser.usersInterests.toString())
	{
		let arr = new Array();
		
		arr = await request.userInterests.split(",");
		
		await dbUser.updateOne({"_id": userId}, {$set:{"usersInterests": arr}});
		await cnt++;
		//console.log("5");
	}
	
	if(await request.usersAge !== await storedUser.usersAge)
	{
		await dbUser.updateOne({"_id": userId}, {$set:{"usersAge": request.usersAge}});
		await cnt++;
		//console.log("6");
	}
	
	if(await request.usersSecurityQuestion !== await storedUser.usersSecurityQuestion)
	{
		await dbUser.updateOne({"_id": userId}, {$set:{"usersSecurityQuestion": request.usersSecurityQuestion}});
		await cnt++;
		//console.log("7");
	}
	
	if(await request.usersSecurityAnswer !== await storedUser.usersSecurityAnswer)
	{
		await dbUser.updateOne({"_id": userId}, {$set:{"usersSecurityAnswer": request.usersSecurityAnswer}});
		await cnt++;
		//console.log("8");
	}
	
	//console.log(await cnt);
	
	if(await cnt == 0)
	{
		return "No field has been updated.";
	}
	else
	{
		return "Profile successfully updated.";
	}
	
};