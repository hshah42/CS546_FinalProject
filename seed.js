var uuid = require("uuid/v1");

async function DatabaseUsers()
{
    var connection = await require("mongodb").MongoClient;
    var conn = await connection.connect("mongodb://localhost:27017/", {useNewUrlParser : true});
    var db = await conn.db("ActivitiesTracker");
    const UserCollection = await db.collection("users");

    return UserCollection;
};


async function DatabaseEvents()
{
    var connection = await require("mongodb").MongoClient;
    var conn = await connection.connect("mongodb://localhost:27017/", {useNewUrlParser : true});
    var db = await conn.db("ActivitiesTracker");
    
    const EventCollection = await db.collection("events");

    return EventCollection;
};


let obj1 = {
    eventName: "Football game",
    eventDate:"2018-12-12",
    eventAddressLine1:"Jersey City",
    eventAddressLine2:"New Jersey",
    eventCity:"Jersey City",
    eventState:"New Jersey",
    eventZipCode:"07307",
    eventCountry:"USA",
    eventStartTime:"10:00:00",
    eventEndTime:"12:00:00",
    eventDescription:"Scoring goals or points by moving the ball to an opposing team's end of the field and either into a goal area, or over a line. Goals or points resulting from players putting the ball between two goalposts. The goal or line being defended by the opposing team.",
    eventTags:"Football",
    eventRequirements:"Football, track pants, club t-shirts",
    eventRegisterationLimit:"9665344808"
};

let obj2 = {
    eventName:"Cricket game",
    eventDate:"2018-12-12",
    eventAddressLine1:"Hoboken",
    eventAddressLine2:"New Jersey",
    eventCity:"Jersey City",
    eventState:"New Jersey",
    eventZipCode:"07307",
    eventCountry:"USA",
    eventStartTime:"10:00:00",
    eventEndTime:"12:00:00",
    eventDescription:" Cricket is a bat-and-ball game played between two teams of eleven players on a field at the centre of which is a 20-metre (22-yard) pitch with a wicket at each end, each comprising two bails balanced on three stumps.",
    eventTags:"Cricket",
    eventRequirements:"Bat, ball, stumps",
    eventRegisterationLimit:"9665344808"
};




let obj3 = {
    userName:"Ethan@gmail.com",
    userEmail:"e@gmail.com",
    newUserPassword:"1234",
    usersPhoneNumber:"1234568768",
    usersInterests:"football, cricket",
    usersAge:"24",
    usersSecurityQuestion:"Favorite color",
    usersSecurityAnswer:"Red",
    hashedPassword: "$2b$16$lqEpggJIOvDfzhOpsed6qu9LkwOM0ZwbhjO6Vo1JphN44IsZrF6ee"
};

let obj4 = {
    userName:"Nick@gmail.com",
    userEmail:"n@gmail.com",
    newUserPassword:"1234",
    usersPhoneNumber:"1234568768",
    usersInterests:"football, tennis",
    usersAge:"24",
    usersSecurityQuestion:"Favorite color",
    usersSecurityAnswer:"Blue",
    hashedPassword:"$2b$16$lqEpggJIOvDfzhOpsed6qu9LkwOM0ZwbhjO6Vo1JphN44IsZrF6ee"
};


async function addUser(signupObj)
{
	let dbUser = await DatabaseUsers();
	
	let addedUser = await dbUser.insertOne(signupObj);
	
	signupObj["_id"] = uuid();
	
	if(await addedUser)
	{
		return await addedUser;
	}
	else
	{
		return false;
	}
}; 


async function registerEvent(regEventObj)
{
	let dbEvent = await DatabaseEvents();
	
	regEventObj["_id"] = uuid();
	
	let regRes = await dbEvent.insertOne(regEventObj);
	console.log(regEventObj);
	
	return await regRes;
};

addUser(obj3);
addUser(obj4);

registerEvent(obj1);
registerEvent(obj2);
